from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    auth_server_url: str = "https://auth.aipinion.ru"
    app_slug: str = "starter"
    cookie_name: str = "auth_token"
    cors_origins: str = "http://localhost:5173,http://localhost:4173"
    disable_auth: bool = False

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
