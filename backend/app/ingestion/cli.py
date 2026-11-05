import argparse

from app.database.connection import SessionLocal
from app.ingestion.crawler import fetch_public_document
from app.ingestion.indexer import index_document
from app.utils.validators import validate_official_url


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch and index a public SRMIST page or PDF.")
    parser.add_argument("--url", required=True)
    parser.add_argument("--category", required=True, choices=["academics", "admissions", "campus"])
    parser.add_argument("--title")
    parser.add_argument("--academic-year")
    args = parser.parse_args()
    url = validate_official_url(args.url)
    title, text = fetch_public_document(url)
    with SessionLocal() as db:
        document = index_document(
            db,
            title=args.title or title,
            category=args.category,
            campus="Kattankulathur",
            source_url=url,
            text=text,
            academic_year=args.academic_year,
        )
        print(f"Indexed {document.title!r} ({len(document.chunks)} chunks).")


if __name__ == "__main__":
    main()
