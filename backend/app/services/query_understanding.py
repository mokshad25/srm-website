import re
from dataclasses import dataclass

ADMISSIONS_TERMS = {
    "admission", "admissions", "srmjeee", "eligibility", "application", "fee", "fees", "tuition", "scholarship",
}
ACADEMICS_TERMS = {
    "academic", "academics", "course", "courses", "program", "programs", "programme", "programmes", "department",
    "exam", "examination", "calendar", "regulation", "curriculum", "degree", "engineering", "undergraduate",
    "postgraduate", "cse",
}
CAMPUS_TERMS = {
    "hostel", "library", "transport", "sports", "campus", "facility", "facilities", "club", "clubs", "accommodation",
}
FOLLOW_UP_TERMS = {
    "it", "that", "this", "they", "them", "those", "there", "include", "includes", "about", "also", "what",
    "which", "how", "does",
}
AMBIGUOUS_PATTERNS = (
    re.compile(r"^(?:and\s+)?(?:the\s+)?(?:fees?|cost|price|eligibility|requirements?)\??$", re.IGNORECASE),
    re.compile(r"^(?:what|how)\s+about\s+(?:the\s+)?(?:fees?|cost|price|eligibility|requirements?)\??$", re.IGNORECASE),
    re.compile(r"^(?:what|how)\s+about\s+(?:it|that|those|them)\??$", re.IGNORECASE),
)
YEAR_PATTERN = re.compile(r"\b(20\d{2})\s*[-/]\s*(\d{2,4})\b")


@dataclass(frozen=True)
class QueryUnderstanding:
    in_scope: bool
    category: str | None
    academic_year: str | None
    retrieval_query: str
    needs_clarification: bool


def _terms(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", text.casefold()))


def _normalize_year(year: str) -> str:
    match = YEAR_PATTERN.search(year)
    if not match:
        return year.strip()
    start, end = match.groups()
    if len(end) == 4:
        end = end[-2:]
    return f"{start}-{end}"


def _academic_year(question: str, explicit_year: str | None) -> str | None:
    if explicit_year:
        return _normalize_year(explicit_year) if YEAR_PATTERN.fullmatch(explicit_year) else None
    match = YEAR_PATTERN.search(question)
    return _normalize_year(match.group(0)) if match else None


def _category(question: str) -> str | None:
    terms = _terms(question)
    matches = []
    if terms & ADMISSIONS_TERMS:
        matches.append("admissions")
    if terms & ACADEMICS_TERMS:
        matches.append("academics")
    if terms & CAMPUS_TERMS:
        matches.append("campus")
    return matches[0] if len(matches) == 1 else None


def understand_query(
    question: str,
    history: list[tuple[str, str]],
    academic_year: str | None = None,
) -> QueryUnderstanding:
    current_terms = _terms(question)
    recent_turns = history[-4:]
    context_parts: list[str] = []
    for role, content in recent_turns:
        words = content.split()
        if role == "assistant":
            words = words[:40]
        context_parts.append(" ".join(words))
    previous_context = " ".join(context_parts)
    context_terms = _terms(previous_context)
    categories = ADMISSIONS_TERMS | ACADEMICS_TERMS | CAMPUS_TERMS
    current_is_in_scope = bool(current_terms & categories) or "srmist" in current_terms or "srm" in current_terms
    contextual_follow_up = bool(history and current_terms & FOLLOW_UP_TERMS and context_terms & categories)
    in_scope = current_is_in_scope or contextual_follow_up
    needs_clarification = (
        not history
        and any(pattern.fullmatch(question.strip()) for pattern in AMBIGUOUS_PATTERNS)
    )
    effective_scope = current_terms | (context_terms if contextual_follow_up else set())
    retrieval_query = question.strip()
    if contextual_follow_up:
        retrieval_query = f"{previous_context} Follow-up question: {retrieval_query}"
    return QueryUnderstanding(
        in_scope=in_scope,
        category=_category(" ".join(effective_scope)) if in_scope else None,
        academic_year=_academic_year(question, academic_year),
        retrieval_query=retrieval_query,
        needs_clarification=needs_clarification,
    )
