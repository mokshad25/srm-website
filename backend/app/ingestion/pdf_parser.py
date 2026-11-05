from app.utils.text_cleaner import clean_text


def parse_pdf(content: bytes) -> str:
    try:
        import pymupdf
    except ImportError as exc:
        raise RuntimeError("PDF extraction requires a working PyMuPDF installation.") from exc

    with pymupdf.open(stream=content, filetype="pdf") as document:
        text = "\n\n".join(page.get_text("text") for page in document)
    return clean_text(text)
