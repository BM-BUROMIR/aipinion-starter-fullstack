from app.auth.models import AuthUser
from app.config import settings


def test_auth_user_model():
    user = AuthUser(
        sub="123", display_name="Test", user_type="internal", apps={"starter": ["admin"]}
    )
    assert user.sub == "123"
    assert user.display_name == "Test"
    assert user.apps["starter"] == ["admin"]


def test_auth_user_defaults():
    user = AuthUser(sub="456")
    assert user.display_name == ""
    assert user.user_type == ""
    assert user.apps == {}


def test_settings_defaults():
    assert settings.app_slug == "starter"
    assert settings.disable_auth is True  # Set in conftest
