import time
from types import SimpleNamespace

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient
from jwt.exceptions import PyJWKClientConnectionError

from src import auth
from src.config import settings

ISSUER = "https://example.supabase.co/auth/v1"
ADMIN_ID = settings.ADMIN_USER_ID

SIGNING_KEY = ec.generate_private_key(ec.SECP256R1())
OTHER_KEY = ec.generate_private_key(ec.SECP256R1())


class FakeJWKClient:
    def __init__(self, key=None, error=None):
        self.key = key or SIGNING_KEY.public_key()
        self.error = error

    def get_signing_key_from_jwt(self, _token):
        if self.error:
            raise self.error
        return SimpleNamespace(key=self.key)


def make_token(key=SIGNING_KEY, algorithm="ES256", **overrides):
    claims = {
        "sub": ADMIN_ID,
        "aud": "authenticated",
        "iss": ISSUER,
        "role": "authenticated",
        "exp": int(time.time()) + 3600,
        **overrides,
    }
    # An override of None drops the claim entirely.
    claims = {k: v for k, v in claims.items() if v is not None}
    return jwt.encode(claims, key, algorithm=algorithm)


@pytest.fixture
def jwks(monkeypatch):
    fake = FakeJWKClient()
    monkeypatch.setattr(auth, "jwks_client", fake)
    return fake


@pytest.fixture
def client(jwks):
    app = FastAPI()

    @app.post("/protected", dependencies=[Depends(auth.require_admin)])
    def protected():
        return {"ok": True}

    return TestClient(app)


def post(client, token):
    return client.post("/protected", headers={"Authorization": f"Bearer {token}"})


def test_derives_supabase_endpoints_from_project_url():
    assert auth.ISSUER == ISSUER
    assert auth.AUDIENCE == "authenticated"
    assert auth.ALGORITHMS == ["ES256"]


def test_accepts_admin_token(client):
    assert post(client, make_token()).status_code == 200


def test_rejects_missing_token(client):
    assert client.post("/protected").status_code in (401, 403)


def test_rejects_other_user(client):
    response = post(client, make_token(sub="someone-else"))
    assert response.status_code == 403


@pytest.mark.parametrize(
    "overrides",
    [
        {"exp": int(time.time()) - 10},
        {"aud": "anon"},
        {"iss": "https://other.supabase.co/auth/v1"},
        {"sub": None},
    ],
    ids=["expired", "wrong-audience", "wrong-issuer", "no-sub"],
)
def test_rejects_invalid_claims(client, overrides):
    assert post(client, make_token(**overrides)).status_code == 401


def test_rejects_wrong_signature(client):
    assert post(client, make_token(key=OTHER_KEY)).status_code == 401


def test_rejects_hs256_token(client):
    token = make_token(
        key="legacy-shared-secret-that-is-long-enough", algorithm="HS256"
    )
    assert post(client, token).status_code == 401


def test_jwks_unreachable_returns_503(client, jwks):
    jwks.error = PyJWKClientConnectionError("down")
    assert post(client, make_token()).status_code == 503
