from functools import lru_cache

from openai import APIError, OpenAI

from app.config import get_settings


def _client() -> OpenAI:
    settings = get_settings()
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is required for embedding generation.")
    return OpenAI(api_key=settings.openai_api_key, timeout=settings.openai_timeout_seconds)


@lru_cache
def _local_model(model_name: str, cache_dir: str):
    # Imported here so OpenAI deployments never load the ONNX runtime.
    from fastembed import TextEmbedding

    return TextEmbedding(model_name=model_name, cache_dir=cache_dir)


def _embed_locally(text: str) -> list[float]:
    settings = get_settings()
    try:
        model = _local_model(settings.embedding_model, settings.embedding_cache_dir)
        return next(iter(model.embed([text]))).tolist()
    except ValueError as exc:
        raise RuntimeError("The local embedding model is unavailable.") from exc


def embed_text(text: str) -> list[float]:
    settings = get_settings()
    if settings.embedding_provider == "local":
        vector = _embed_locally(text)
        if len(vector) != settings.embedding_dimensions:
            raise RuntimeError(f"Unexpected embedding length: {len(vector)}.")
        return vector
    try:
        if settings.embedding_model.startswith("text-embedding-3"):
            result = _client().embeddings.create(
                model=settings.embedding_model,
                input=text,
                dimensions=settings.embedding_dimensions,
            )
        else:
            result = _client().embeddings.create(model=settings.embedding_model, input=text)
    except APIError as exc:
        raise RuntimeError("The embedding provider request failed.") from exc
    vector = result.data[0].embedding
    if len(vector) != settings.embedding_dimensions:
        raise RuntimeError(f"Unexpected embedding length: {len(vector)}.")
    return vector
