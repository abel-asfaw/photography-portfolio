from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    db_name: str
    db_pass: str
    db_user: str
    db_host: str
    aws_access_key_id: str
    aws_secret_access_key: str
    aws_region: str
    s3_bucket_name: str
    domain: str
    api_audience: str
    issuer: str
    algorithms: str


settings = Settings()
