# SRMIST Intelligence Layer

An independent, frontend-agnostic FastAPI service for public SRMIST information. The initial knowledge scope is SRMIST Kattankulathur. This project is not an official SRMIST product and does not access private student accounts or records.

The backend exposes chat, feedback, health, and protected knowledge-base administration APIs. It does not own the university website or its chat interface. No university facts are bundled; responses require indexed official sources.

## Backend setup

Requirements: Python 3.11+ and PostgreSQL with pgvector for production. SQLite is supported for local checks. OpenAI API credentials are required for embeddings and answer generation.

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Set `DATABASE_URL`, `OPENAI_API_KEY`, and a high-entropy `ADMIN_API_KEY` in `backend/.env`. Example local SQLite URL: `sqlite:///./srm_assistant.db`.

Apply the schema through Alembic, then start the API:

```powershell
alembic upgrade head
uvicorn app.main:app --reload
```

The service is available at `http://localhost:8000`; OpenAPI documentation is at `/docs`. Database schema creation is migration-managed, not performed during application startup.

## Environment

See [`backend/.env.example`](backend/.env.example). Important values:

- `DATABASE_URL`: SQLAlchemy URL; PostgreSQL uses `postgresql+psycopg://...`.
- `OPENAI_API_KEY`, `OPENAI_MODEL`, `EMBEDDING_MODEL`, `EMBEDDING_DIMENSIONS`.
- `OPENAI_TIMEOUT_SECONDS`, `CONVERSATION_HISTORY_LIMIT`.
- `ADMIN_API_KEY`: bearer secret for all `/api/admin/*` endpoints.
- `CORS_ORIGINS`: exact external website origin(s), comma-separated.
- `RATE_LIMIT_REQUESTS`, `RATE_LIMIT_WINDOW_SECONDS`.
- `RETRIEVAL_TOP_K`, `RETRIEVAL_MIN_SIMILARITY`, `CONTEXT_CHUNK_LIMIT`, `CONTEXT_SIMILARITY_MARGIN`.
- `ALLOWED_SOURCE_DOMAINS`, `UPLOAD_MAX_BYTES`, `MAX_SOURCE_BYTES`.
- `ENABLE_INGESTION_SCHEDULER`, `INGESTION_INTERVAL_HOURS`.

Use HTTPS in production and never expose backend secrets to a browser. The current rate limiter is process-local; multi-instance deployments need an upstream/shared limiter. The admin key is shared bearer authentication and should be rotated and restricted to trusted operators.

## Ingesting public knowledge

Index only permitted, verified official SRMIST sources. Admin URL ingestion checks approved domains and robots.txt, blocks redirects, enforces download limits, and skips unchanged content by hash.

```powershell
python -m app.ingestion.cli --url https://www.srmist.edu.in/admission-india/ --category admissions --academic-year 2026-27
```

Both ingestion and chat require `OPENAI_API_KEY`. The optional background scheduler refreshes previously indexed URLs only. Verify each document and academic year before relying on time-sensitive answers.

## REST API

All endpoints use JSON except PDF upload.

### Public

- `GET /api/health` — database connectivity status.
- `POST /api/chat`

```json
{
  "question": "What hostel information is available?",
  "session_id": null,
  "campus": "Kattankulathur",
  "academic_year": "2026-27"
}
```

Chat response shape:

```json
{
  "answer": "…",
  "session_id": "uuid",
  "message_id": "uuid",
  "sources": [
    {
      "title": "Official source title",
      "url": "https://www.srmist.edu.in/…",
      "academic_year": "2026-27",
      "source_id": "S1",
      "similarity": 0.87
    }
  ],
  "status": "answered"
}
```

`status` is `answered`, `unverified`, `out_of_scope`, `needs_clarification`, or `conflicting`. Empty retrieval returns an explicit uncertainty response and no source list. Source records can include category, campus, publication date, last verification time, and retrieval similarity. Citation IDs are checked against retrieved records; answers without a valid retrieved source are returned as unverified. Returned citations identify retrieved documents and do not imply independent verification of every generated claim. The website integration should render returned source URLs as links and keep `session_id` for follow-up turns.

- `POST /api/feedback` with `{ "message_id": "uuid", "rating": 1, "comment": "optional" }`.

### Admin

Send `Authorization: Bearer <ADMIN_API_KEY>` on every admin request.

- `POST /api/admin/ingest` — `{ "url": "https://…", "category": "academics|admissions|campus", "title": "optional", "academic_year": "optional", "campus": "Kattankulathur" }`.
- `POST /api/admin/documents/upload` — multipart PDF, official `source_url`, `category`, optional `title` and `academic_year`. Uploaded bytes must match the PDF available at the approved official source URL.
- `GET /api/admin/documents`, `/stats`, `/unanswered`, `/feedback`.
- `PATCH /api/admin/documents/{id}?verified=true&academic_year=2026-27`.
- `DELETE /api/admin/documents/{id}`.

## Database and deployment

Alembic migrations live in `backend/alembic`. The initial migration enables pgvector on PostgreSQL and creates the SQLAlchemy metadata tables. `backend/Dockerfile` applies migrations at startup before serving. `render.yaml` provides a Render web-service configuration; provision a managed PostgreSQL database with pgvector support and set all production secrets and the exact website CORS origin.

## Verification

```powershell
cd backend
pytest
```

`tests/question_dataset.json` contains 30 representative questions. It is a seed set, not evidence of answer accuracy. Retrieval and answer-quality evaluation require a populated, verified source index and OpenAI credentials. Test PostgreSQL/pgvector behavior against a real compatible database before production.
