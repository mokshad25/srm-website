import ipaddress
import socket
from urllib.parse import urlparse

from fastapi import HTTPException

from app.config import get_settings


def validate_official_url(url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
        raise HTTPException(status_code=400, detail="Only HTTPS official SRMIST URLs are allowed.")
    if parsed.port not in (None, 443):
        raise HTTPException(status_code=400, detail="Only the standard HTTPS port is allowed.")
    hostname = parsed.hostname.lower()
    if not any(hostname == domain or hostname.endswith(f".{domain}") for domain in get_settings().source_domain_list):
        raise HTTPException(status_code=400, detail="Source URL must belong to an approved SRMIST domain.")
    try:
        addresses = {
            ipaddress.ip_address(result[4][0])
            for result in socket.getaddrinfo(hostname, 443, type=socket.SOCK_STREAM)
        }
    except (OSError, ValueError) as exc:
        raise HTTPException(status_code=400, detail="Source hostname could not be resolved.") from exc
    if not addresses or any(not address.is_global for address in addresses):
        raise HTTPException(status_code=400, detail="Source hostname resolves to a non-public network address.")
    return url
