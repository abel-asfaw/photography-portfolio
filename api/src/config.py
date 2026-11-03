from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DEBUG: bool = False
    # Set as a JSON list in the environment, e.g. CORS_ORIGINS='["https://..."]'.
    CORS_ORIGINS: list[str] = [
        "https://photography.abelasfaw.com",
        "http://localhost:3005",
    ]
    # Matches client_max_body_size in the Nginx config (default.conf).
    MAX_UPLOAD_MB: int = 20

    DB_NAME: str
    DB_PASS: str
    DB_USER: str
    DB_HOST: str
    DB_PORT: int = 5432

    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str
    S3_BUCKET_NAME: str

    SUPABASE_URL: str
    ADMIN_USER_ID: str


settings = Settings()  # type: ignore
