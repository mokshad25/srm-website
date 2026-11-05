import threading
import time
from collections import defaultdict, deque

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import get_settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.requests: dict[str, deque[float]] = defaultdict(deque)
        self.lock = threading.Lock()

    async def dispatch(self, request: Request, call_next):
        if request.url.path in {"/api/health", "/"} or not request.url.path.startswith("/api/"):
            return await call_next(request)
        settings = get_settings()
        client = request.client.host if request.client else "unknown"
        now = time.monotonic()
        with self.lock:
            timestamps = self.requests[client]
            cutoff = now - settings.rate_limit_window_seconds
            while timestamps and timestamps[0] <= cutoff:
                timestamps.popleft()
            if len(timestamps) >= settings.rate_limit_requests:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Rate limit exceeded. Please wait before trying again."},
                    headers={"Retry-After": str(settings.rate_limit_window_seconds)},
                )
            timestamps.append(now)
        return await call_next(request)
