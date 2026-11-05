from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


GROQ_BASE_URL = "https://api.groq.com/openai/v1"


class Settings(BaseSettings):
    app_name: str = "SRM AI Assistant"
    environment: str = "development"
    database_url: str = "sqlite:///./srm_assistant.db"
    llm_provider: Literal["openai", "groq"] = "openai"
    embedding_provider: Literal["openai", "local"] = "openai"
    openai_api_key: str | None = None
    groq_api_key: str | None = None
    openai_model: str = "gpt-4.1-mini"
    openai_timeout_seconds: float = 30
    embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536
    embedding_cache_dir: str = ".embedding_cache"
    answer_max_output_tokens: int = 900
    admin_api_key: str | None = None
    cors_origins: str = "http://localhost:3000"
    rate_limit_requests: int = 30
    rate_limit_window_seconds: int = 60
    max_question_characters: int = 2000
    retrieval_top_k: int = 5
    retrieval_min_similarity: float = 0.25
    conversation_history_limit: int = 8
    context_chunk_limit: int = 5
    context_similarity_margin: float = 0.12
    allowed_source_domains: str = "srmist.edu.in"
    upload_max_bytes: int = 10_000_000
    max_source_bytes: int = 10_000_000
    fetch_timeout_seconds: int = 20
    conversation_retention_days: int = 30
    enable_ingestion_scheduler: bool = False
    ingestion_interval_hours: int = 24
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def llm_api_key(self) -> str | None:
        return self.groq_api_key if self.llm_provider == "groq" else self.openai_api_key

    @property
    def llm_base_url(self) -> str | None:
        return GROQ_BASE_URL if self.llm_provider == "groq" else None

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def source_domain_list(self) -> list[str]:
        return [domain.strip().lower() for domain in self.allowed_source_domains.split(",") if domain.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
