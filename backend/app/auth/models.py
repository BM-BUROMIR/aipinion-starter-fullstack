from pydantic import BaseModel


class AuthUser(BaseModel):
    """Decoded JWT user payload."""

    sub: str
    display_name: str = ""
    user_type: str = ""
    apps: dict[str, list[str]] = {}
