import os
from urllib.parse import quote_plus
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "CircuLeak — Industrial Emission Leak-Point Detector & Circular Alternative Recommender"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Dynamic Database Configuration (PostgreSQL)
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres"
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "circuleak"
    DATABASE_URL: str = ""

    # CORS
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    # Environment
    ENVIRONMENT: str = "development"

    # Security
    JWT_SECRET: str = ""
    SECRET_KEY: str = ""

    # Uploads
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")

    # AI Audit Intelligence (LLM)
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_BASE_URL: str = "https://api.openai.com/v1"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    def model_post_init(self, __context):
        # Resolve SECRET_KEY / JWT_SECRET from environment or settings
        resolved_secret = self.SECRET_KEY or self.JWT_SECRET or os.getenv("SECRET_KEY", os.getenv("JWT_SECRET", ""))
        env_mode = (os.getenv("ENVIRONMENT") or self.ENVIRONMENT).lower()

        insecure_keys = {
            "circuleak_production_secret_key_change_in_production",
            "circuleak-production-secure-auth-secret-key-991283741-2026",
            "secret",
            "change_me",
            "password",
            "test_secret"
        }

        if env_mode == "production":
            if not resolved_secret or resolved_secret in insecure_keys or len(resolved_secret) < 32:
                raise ValueError(
                    "Production configuration error: A cryptographically secure, non-default SECRET_KEY "
                    "(minimum 32 characters) must be configured in production environment."
                )
            self.JWT_SECRET = resolved_secret
        else:
            self.JWT_SECRET = resolved_secret if resolved_secret else "dev-insecure-test-jwt-key-not-for-production-use"

        if not self.DATABASE_URL:
            # Dynamically assemble PostgreSQL URL from individual parameters (with safe quoting for special characters)
            safe_user = quote_plus(self.DB_USER)
            safe_pw = quote_plus(self.DB_PASSWORD)
            self.DATABASE_URL = f"postgresql://{safe_user}:{safe_pw}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        elif isinstance(v, list):
            return v
        return ["http://localhost:5173"]


settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
