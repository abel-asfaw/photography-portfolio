from pydantic_settings import BaseSettings
from pydantic.fields import _Unset


class Settings(BaseSettings):
    DB_NAME: str = _Unset
    DB_PASS: str = _Unset
    DB_USER: str = _Unset
    DB_HOST: str = _Unset

    AWS_ACCESS_KEY_ID: str = _Unset
    AWS_SECRET_ACCESS_KEY: str = _Unset
    AWS_REGION: str = _Unset
    S3_BUCKET_NAME: str = _Unset

    DOMAIN: str = _Unset
    API_AUDIENCE: str = _Unset
    ISSUER: str = _Unset
    ALGORITHMS: str = _Unset


settings = Settings()
