import re


def chunk_text(text: str, chunk_words: int = 600, overlap_words: int = 90) -> list[str]:
    if chunk_words <= 0 or overlap_words < 0 or overlap_words >= chunk_words:
        raise ValueError("chunk_words must be positive and overlap_words must be smaller than chunk_words.")
    paragraphs = [paragraph.strip() for paragraph in re.split(r"\n\s*\n", text.strip()) if paragraph.strip()]
    if not paragraphs:
        return []

    units: list[tuple[list[str], list[str]]] = []
    headings: list[str] = []
    for paragraph in paragraphs:
        if re.match(r"^#{1,6}\s+", paragraph):
            level = len(paragraph) - len(paragraph.lstrip("#"))
            headings = headings[: level - 1] + [paragraph]
            continue
        words = paragraph.split()
        if not words:
            continue
        prefix = " ".join(headings).split()
        units.append((prefix, words))
    chunks: list[str] = []
    current: list[str] = []
    for heading, paragraph in units:
        body_size = chunk_words - len(heading)
        if body_size <= overlap_words:
            raise ValueError("Heading context is too long for the configured chunk size.")
        if len(heading) + len(paragraph) > chunk_words:
            if current:
                chunks.append(" ".join(current))
                current = []
            start = 0
            while start < len(paragraph):
                end = min(start + body_size, len(paragraph))
                chunks.append(" ".join(heading + paragraph[start:end]))
                if end == len(paragraph):
                    break
                start = end - overlap_words
            continue

        unit = heading + paragraph
        if current and len(current) + len(unit) > chunk_words:
            chunks.append(" ".join(current))
            overlap = current[-overlap_words:] if overlap_words else []
            current = overlap + unit
        else:
            current.extend(unit)
    if current:
        chunks.append(" ".join(current))
    return chunks
