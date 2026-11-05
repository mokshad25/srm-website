from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

import requests
from fastapi import HTTPException

from app.config import get_settings
from app.ingestion.html_parser import parse_html
from app.ingestion.pdf_parser import parse_pdf
from app.utils.validators import validate_official_url

USER_AGENT = "SRMAIAssistantBot/1.0 (public information indexing)"


def _session() -> requests.Session:
    session = requests.Session()
    session.trust_env = False
    session.headers.update({"User-Agent": USER_AGENT})
    return session


def _fetch_bytes(url: str) -> tuple[bytes, str]:
    validate_official_url(url)
    parsed = urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    settings = get_settings()
    try:
        with _session() as session:
            robots_response = session.get(robots_url, timeout=10, allow_redirects=False, stream=True)
            if robots_response.status_code in (404, 410):
                pass
            elif robots_response.status_code == 200:
                robots_content = bytearray()
                for block in robots_response.iter_content(chunk_size=16 * 1024):
                    robots_content.extend(block)
                    if len(robots_content) > 512_000:
                        raise HTTPException(status_code=502, detail="robots.txt exceeds the permitted size.")
                if len(robots_content) > 512_000:
                    raise HTTPException(status_code=502, detail="robots.txt exceeds the permitted size.")
                parser = RobotFileParser()
                parser.parse(bytes(robots_content).decode("utf-8", errors="replace").splitlines())
                if not parser.can_fetch(USER_AGENT, url):
                    raise HTTPException(status_code=403, detail="robots.txt does not permit indexing this URL.")
            else:
                raise HTTPException(status_code=502, detail="Unable to verify robots.txt permission for this source.")

            response = session.get(
                url,
                timeout=settings.fetch_timeout_seconds,
                allow_redirects=False,
                stream=True,
            )
            if response.is_redirect:
                raise HTTPException(status_code=400, detail="Redirected source URLs are not indexed; submit the final URL.")
            if response.status_code >= 400:
                raise HTTPException(status_code=502, detail=f"Source returned HTTP {response.status_code}.")
            content_length = response.headers.get("content-length")
            if content_length:
                try:
                    declared_size = int(content_length)
                except ValueError as exc:
                    raise HTTPException(status_code=502, detail="Source returned an invalid Content-Length.") from exc
                if declared_size > settings.max_source_bytes:
                    raise HTTPException(status_code=413, detail="Source exceeds the configured download limit.")
            content = bytearray()
            for block in response.iter_content(chunk_size=64 * 1024):
                content.extend(block)
                if len(content) > settings.max_source_bytes:
                    raise HTTPException(status_code=413, detail="Source exceeds the configured download limit.")
            validate_official_url(response.url)
            return bytes(content), response.headers.get("content-type", "").lower()
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail="Unable to fetch the public source document.") from exc


def fetch_public_document(url: str) -> tuple[str, str]:
    content, content_type = _fetch_bytes(url)
    if "application/pdf" in content_type or url.lower().endswith(".pdf"):
        title = url.rsplit("/", 1)[-1] or "SRMIST PDF document"
        text = parse_pdf(content)
    elif "text/html" in content_type or not content_type:
        title, text = parse_html(content)
    else:
        raise HTTPException(status_code=415, detail="Only public HTML pages and PDF documents are supported.")
    if not text:
        raise HTTPException(status_code=422, detail="No readable text was extracted from the source.")
    return title, text


def fetch_official_pdf(url: str) -> bytes:
    content, content_type = _fetch_bytes(url)
    if "application/pdf" not in content_type and not url.lower().endswith(".pdf"):
        raise HTTPException(status_code=415, detail="The official source URL is not a PDF.")
    return content
