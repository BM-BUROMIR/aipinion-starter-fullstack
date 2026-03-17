"""
JWT authentication middleware for auth.aipinion.ru integration.
Validates RS256 JWT tokens via JWKS endpoint.
Set DISABLE_AUTH=true to skip validation (dev/test only).
"""

import logging
import time

import jwt
from fastapi import HTTPException, Request
from jwt import PyJWKClient

from app.auth.models import AuthUser
from app.config import settings

logger = logging.getLogger(__name__)

JWKS_URL = f"{settings.auth_server_url}/.well-known/jwks.json"

_jwks_client: PyJWKClient | None = None
_jwks_client_ts: float = 0
JWKS_CACHE_TTL = 3600

MOCK_USER = AuthUser(
    sub="test-user",
    display_name="Test Admin",
    user_type="internal",
    apps={settings.app_slug: ["admin"]},
)


def _get_jwks_client() -> PyJWKClient:
    global _jwks_client, _jwks_client_ts
    now = time.time()
    if _jwks_client is None or (now - _jwks_client_ts) > JWKS_CACHE_TTL:
        _jwks_client = PyJWKClient(JWKS_URL)
        _jwks_client_ts = now
    return _jwks_client


def verify_jwt(token: str) -> dict:
    """Verify JWT token using JWKS and return payload."""
    client = _get_jwks_client()
    try:
        signing_key = client.get_signing_key_from_jwt(token)
    except Exception:
        signing_keys = client.get_signing_keys()
        if not signing_keys:
            raise jwt.InvalidTokenError("No signing keys available from JWKS") from None
        signing_key = signing_keys[0]
    return jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256"],
        issuer="auth.aipinion.ru",
    )


async def require_auth(request: Request) -> None:
    """FastAPI dependency: require valid JWT."""
    if settings.disable_auth:
        request.state.auth_user = MOCK_USER
        return

    token = request.cookies.get(settings.cookie_name)
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        payload = verify_jwt(token)
    except jwt.ExpiredSignatureError as e:
        raise HTTPException(status_code=401, detail="Token expired") from e
    except jwt.InvalidTokenError as e:
        logger.warning("Invalid JWT: %s", e)
        raise HTTPException(status_code=401, detail="Invalid token") from e

    request.state.auth_user = AuthUser(**payload)
