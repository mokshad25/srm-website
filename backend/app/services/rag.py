import re
from urllib.parse import urlparse

from sqlalchemy.orm import Session

from app.config import get_settings
from app.database.models import Document, Message
from app.schemas.chat import ChatRequest, ChatResponse, SourceReference
from app.services.conversation import get_or_create_conversation, load_history
from app.services.generation import GeneratedAnswer, generate_answer
from app.services.query_understanding import understand_query
from app.services.retrieval import RetrievedChunk, retrieve_evidence

UNVERIFIED_ANSWER = (
    "I couldn't find verified information that is sufficiently relevant in the current SRM knowledge base. "
    "Please check the official SRMIST website or clarify the program, campus detail, or academic year."
)
OUT_OF_SCOPE_ANSWER = "I can help with SRMIST Kattankulathur academics, admissions, and campus information."


def _normalize_citations(answer: str) -> str:
    """Rewrite variants such as ["S1"] or [S1, S2] as the [S1][S2] form the API promises."""
    return re.sub(
        r"""\[((?:\s*["']?S\d+["']?\s*,?)+)\]""",
        lambda match: "".join(f"[{source_id}]" for source_id in re.findall(r"S\d+", match.group(1))),
        answer,
    )


def _official_document(document: Document) -> bool:
    parsed = urlparse(document.source_url)
    if parsed.scheme != "https" or not parsed.hostname:
        return False
    host = parsed.hostname.lower()
    return any(host == domain or host.endswith(f".{domain}") for domain in get_settings().source_domain_list)


def _source_records(
    evidence: list[RetrievedChunk],
    citation_ids: list[str],
) -> list[SourceReference]:
    sources: list[SourceReference] = []
    seen_urls: set[str] = set()
    for index, result in enumerate(evidence, start=1):
        source_id = f"S{index}"
        if source_id not in citation_ids:
            continue
        document = result.chunk.document
        if not document or not _official_document(document) or document.source_url in seen_urls:
            continue
        seen_urls.add(document.source_url)
        sources.append(
            SourceReference(
                source_id=source_id,
                title=document.title,
                url=document.source_url,
                academic_year=document.academic_year,
                category=document.category,
                campus=document.campus,
                published_date=document.published_date,
                last_verified_at=document.last_verified_at.isoformat() if document.last_verified_at else None,
                similarity=result.similarity,
            )
        )
    return sources


def _save_turn(
    db: Session,
    conversation_id: str,
    question: str,
    answer: str,
    status: str,
) -> Message:
    user_message = Message(conversation_id=conversation_id, role="user", content=question)
    assistant_message = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=answer,
        status=status,
    )
    db.add_all([user_message, assistant_message])
    db.commit()
    db.refresh(assistant_message)
    return assistant_message


def _response(
    db: Session,
    conversation_id: str,
    session_id: str,
    question: str,
    answer: str,
    status: str,
    sources: list[SourceReference] | None = None,
) -> ChatResponse:
    message = _save_turn(db, conversation_id, question, answer, status)
    return ChatResponse(
        answer=answer,
        session_id=session_id,
        message_id=message.id,
        sources=sources or [],
        status=status,
    )


def answer_question(db: Session, request: ChatRequest) -> ChatResponse:
    conversation = get_or_create_conversation(db, request.session_id)
    history = load_history(db, conversation.id)
    question = request.question.strip()
    intent = understand_query(question, history, request.academic_year)

    if intent.needs_clarification:
        return _response(
            db,
            conversation.id,
            conversation.session_id,
            question,
            "Which program, campus facility, or academic year are you asking about?",
            "needs_clarification",
        )
    if not intent.in_scope:
        return _response(
            db,
            conversation.id,
            conversation.session_id,
            question,
            OUT_OF_SCOPE_ANSWER,
            "out_of_scope",
        )

    evidence = retrieve_evidence(
        db,
        intent.retrieval_query,
        request.campus,
        category=intent.category,
        academic_year=intent.academic_year,
    )
    if not evidence:
        return _response(
            db,
            conversation.id,
            conversation.session_id,
            question,
            UNVERIFIED_ANSWER,
            "unverified",
        )

    generated: GeneratedAnswer = generate_answer(question, evidence, history)
    valid_ids = {f"S{index}" for index in range(1, len(evidence) + 1)}
    citation_ids = list(dict.fromkeys(source_id for source_id in generated.citation_ids if source_id in valid_ids))
    if generated.needs_clarification:
        citation_ids = []
    sources = _source_records(evidence, citation_ids)

    if generated.needs_clarification:
        status = "needs_clarification"
    elif not sources:
        return _response(
            db,
            conversation.id,
            conversation.session_id,
            question,
            UNVERIFIED_ANSWER,
            "unverified",
        )
    elif generated.conflicting_sources:
        status = "conflicting"
    else:
        status = "answered"

    answer_text = _normalize_citations(generated.answer)
    allowed_citations = set(citation_ids)
    answer_text = re.sub(
        r"\[(S\d+)\]",
        lambda match: match.group(0) if match.group(1) in allowed_citations else "",
        answer_text,
    )
    answer_text = re.sub(r"https?://\S+", "", answer_text)
    for source_id in citation_ids:
        if f"[{source_id}]" not in answer_text:
            answer_text = f"{answer_text.rstrip()} [{source_id}]"
    if status == "conflicting" and not any(
        phrase in answer_text.casefold() for phrase in ("conflict", "different", "disagree", "contradict")
    ):
        generated_answer = f"The retrieved sources appear to conflict. {answer_text}"
    else:
        generated_answer = answer_text.strip()
    return _response(
        db,
        conversation.id,
        conversation.session_id,
        question,
        generated_answer,
        status,
        sources if status == "answered" or status == "conflicting" else [],
    )
