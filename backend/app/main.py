from contextlib import asynccontextmanager
import asyncio
import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.middleware.rate_limit import RateLimitMiddleware
from app.routes import admin, chat, feedback, health


@asynccontextmanager
async def lifespan(_: FastAPI):
    scheduler_task = None
    if settings.enable_ingestion_scheduler:
        from app.ingestion.scheduler import run_scheduler

        scheduler_task = asyncio.create_task(run_scheduler())
    yield
    if scheduler_task:
        scheduler_task.cancel()
        try:
            await scheduler_task
        except asyncio.CancelledError:
            pass


settings = get_settings()
app = FastAPI(
    title=settings.app_name,
    description="Independent, source-grounded assistant for SRMIST Kattankulathur information.",
    version="1.0.0",
    lifespan=lifespan,
)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
app.include_router(health.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")
app.include_router(admin.router, prefix="/api/admin")


@app.get("/")
def root():
    return {"application": settings.app_name, "status": "running"}


@app.exception_handler(Exception)
async def unexpected_error_handler(_: Request, exc: Exception):
    logging.getLogger(__name__).exception("Unhandled request error", exc_info=exc)
    return JSONResponse(status_code=500, content={"detail": "An unexpected server error occurred."})


@app.exception_handler(RuntimeError)
async def service_unavailable_handler(_: Request, exc: RuntimeError):
    logging.getLogger(__name__).warning("Service dependency unavailable: %s", exc)
    return JSONResponse(status_code=503, content={"detail": str(exc)})
