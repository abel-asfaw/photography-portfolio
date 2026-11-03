from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import PyJWKClientConnectionError, PyJWTError
from loguru import logger

from src.config import settings

ISSUER = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1"
AUDIENCE = "authenticated"
ALGORITHMS = ["ES256"]

# Fetches Supabase's public signing keys on first use and caches them.
jwks_client = jwt.PyJWKClient(f"{ISSUER}/.well-known/jwks.json")
bearer = HTTPBearer()


def require_admin(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer)],
) -> None:
    """
    Verifies a Supabase Auth JWT and checks that it belongs to the admin user.
    """
    token = credentials.credentials
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token).key
        claims = jwt.decode(
            token,
            signing_key,
            algorithms=ALGORITHMS,
            audience=AUDIENCE,
            issuer=ISSUER,
            options={"require": ["exp", "sub"]},
        )
    except PyJWKClientConnectionError as e:
        logger.error(f"Could not fetch JWKS: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to verify token",
        ) from e
    except PyJWTError as e:
        logger.warning(f"Rejected invalid token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        ) from e

    if claims["sub"] != settings.ADMIN_USER_ID:
        logger.warning(f"Rejected token for non-admin user {claims['sub']}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )
