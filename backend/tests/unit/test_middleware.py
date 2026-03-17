from unittest.mock import MagicMock, patch

import jwt as pyjwt
import pytest
from fastapi import HTTPException

from app.auth.middleware import (
    MOCK_USER,
    _get_jwks_client,
    require_auth,
    verify_jwt,
)


class TestGetJwksClient:
    def test_creates_client_on_first_call(self):
        import app.auth.middleware as mod

        mod._jwks_client = None
        mod._jwks_client_ts = 0
        with patch("app.auth.middleware.PyJWKClient") as mock_cls:
            mock_cls.return_value = MagicMock()
            client = _get_jwks_client()
            assert client is not None
            mock_cls.assert_called_once()

    def test_returns_cached_client(self):
        import app.auth.middleware as mod

        cached = MagicMock()
        mod._jwks_client = cached
        mod._jwks_client_ts = 9999999999  # Far future
        result = _get_jwks_client()
        assert result is cached

    def test_refreshes_expired_client(self):
        import app.auth.middleware as mod

        mod._jwks_client = MagicMock()
        mod._jwks_client_ts = 0  # Expired
        with patch("app.auth.middleware.PyJWKClient") as mock_cls:
            mock_cls.return_value = MagicMock()
            _get_jwks_client()
            mock_cls.assert_called_once()


class TestVerifyJwt:
    def test_verify_jwt_with_kid(self):
        mock_client = MagicMock()
        mock_key = MagicMock()
        mock_key.key = "test-key"
        mock_client.get_signing_key_from_jwt.return_value = mock_key

        with (
            patch("app.auth.middleware._get_jwks_client", return_value=mock_client),
            patch("app.auth.middleware.jwt.decode", return_value={"sub": "1"}),
        ):
            result = verify_jwt("some.token.here")
            assert result == {"sub": "1"}

    def test_verify_jwt_fallback_to_first_key(self):
        mock_client = MagicMock()
        mock_client.get_signing_key_from_jwt.side_effect = Exception("no kid")
        mock_key = MagicMock()
        mock_key.key = "fallback-key"
        mock_client.get_signing_keys.return_value = [mock_key]

        with (
            patch("app.auth.middleware._get_jwks_client", return_value=mock_client),
            patch("app.auth.middleware.jwt.decode", return_value={"sub": "2"}),
        ):
            result = verify_jwt("some.token.here")
            assert result == {"sub": "2"}

    def test_verify_jwt_no_signing_keys(self):
        mock_client = MagicMock()
        mock_client.get_signing_key_from_jwt.side_effect = Exception("no kid")
        mock_client.get_signing_keys.return_value = []

        with (
            patch("app.auth.middleware._get_jwks_client", return_value=mock_client),
            pytest.raises(pyjwt.InvalidTokenError, match="No signing keys"),
        ):
            verify_jwt("some.token.here")


class TestRequireAuth:
    @pytest.mark.asyncio
    async def test_disabled_auth(self):
        request = MagicMock()
        request.state = MagicMock()
        with patch("app.auth.middleware.settings") as mock_settings:
            mock_settings.disable_auth = True
            await require_auth(request)
            assert request.state.auth_user == MOCK_USER

    @pytest.mark.asyncio
    async def test_no_cookie(self):
        request = MagicMock()
        request.cookies = {}
        with patch("app.auth.middleware.settings") as mock_settings:
            mock_settings.disable_auth = False
            mock_settings.cookie_name = "auth_token"
            with pytest.raises(HTTPException) as exc:
                await require_auth(request)
            assert exc.value.status_code == 401

    @pytest.mark.asyncio
    async def test_expired_token(self):
        request = MagicMock()
        request.cookies = {"auth_token": "expired.token.here"}
        with (
            patch("app.auth.middleware.settings") as mock_settings,
            patch(
                "app.auth.middleware.verify_jwt",
                side_effect=pyjwt.ExpiredSignatureError("expired"),
            ),
        ):
            mock_settings.disable_auth = False
            mock_settings.cookie_name = "auth_token"
            with pytest.raises(HTTPException) as exc:
                await require_auth(request)
            assert exc.value.status_code == 401
            assert "expired" in exc.value.detail.lower()

    @pytest.mark.asyncio
    async def test_invalid_token(self):
        request = MagicMock()
        request.cookies = {"auth_token": "bad.token.here"}
        with (
            patch("app.auth.middleware.settings") as mock_settings,
            patch(
                "app.auth.middleware.verify_jwt",
                side_effect=pyjwt.InvalidTokenError("bad"),
            ),
        ):
            mock_settings.disable_auth = False
            mock_settings.cookie_name = "auth_token"
            with pytest.raises(HTTPException) as exc:
                await require_auth(request)
            assert exc.value.status_code == 401

    @pytest.mark.asyncio
    async def test_valid_token(self):
        request = MagicMock()
        request.state = MagicMock()
        request.cookies = {"auth_token": "valid.token.here"}
        payload = {"sub": "u1", "display_name": "User", "user_type": "ext", "apps": {}}
        with (
            patch("app.auth.middleware.settings") as mock_settings,
            patch("app.auth.middleware.verify_jwt", return_value=payload),
        ):
            mock_settings.disable_auth = False
            mock_settings.cookie_name = "auth_token"
            await require_auth(request)
            assert request.state.auth_user.sub == "u1"
