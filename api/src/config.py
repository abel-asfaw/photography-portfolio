from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ROOT_PATH: str = ""
    DEBUG: bool = True

    DB_NAME: str
    DB_PASS: str
    DB_USER: str
    DB_HOST: str

    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str
    S3_BUCKET_NAME: str

    DOMAIN: str
    API_AUDIENCE: str
    ISSUER: str
    ALGORITHMS: str


settings = Settings()  # type: ignore
