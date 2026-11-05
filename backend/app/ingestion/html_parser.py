from bs4 import BeautifulSoup

from app.utils.text_cleaner import clean_text


def parse_html(content: bytes) -> tuple[str, str]:
    soup = BeautifulSoup(content, "html.parser")
    title = soup.title.get_text(" ", strip=True) if soup.title else "SRMIST information"
    for element in soup(["script", "style", "nav", "footer", "header", "noscript", "svg"]):
        element.decompose()
    for element in soup.select("[role=navigation], .cookie, .cookie-notice, .breadcrumbs"):
        element.decompose()
    main = soup.find("main") or soup.find("article") or soup.body or soup
    blocks: list[str] = []
    for element in main.find_all(["h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "tr"]):
        if element.find_parent(["li", "tr"]):
            continue
        if element.name.startswith("h"):
            text = element.get_text(" ", strip=True)
            if text:
                blocks.append(f"{'#' * int(element.name[1])} {text}")
        elif element.name == "tr":
            cells = [cell.get_text(" ", strip=True) for cell in element.find_all(["th", "td"], recursive=False)]
            if any(cells):
                blocks.append(" | ".join(cells))
        else:
            text = element.get_text(" ", strip=True)
            if text:
                blocks.append(text)
    if not blocks:
        blocks = [main.get_text("\n", strip=True)]
    return title, clean_text("\n\n".join(blocks))
