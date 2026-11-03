from unittest.mock import MagicMock
from uuid import uuid4

import pytest
from botocore.exceptions import EndpointConnectionError
from fastapi.testclient import TestClient
from sqlalchemy.exc import IntegrityError, OperationalError

from src.auth import require_admin
from src.database import get_db
from src.main import app
from src.routers import photos

PHOTO_ID = "6f1c2d3e-4b5a-4c6d-8e7f-901234567890"


@pytest.fixture
def db():
    return MagicMock()


@pytest.fixture
def s3(monkeypatch):
    storage = MagicMock()
    storage.upload_to_s3.side_effect = lambda _file, name: f"https://bucket/{name}"
    monkeypatch.setattr(photos, "upload_to_s3", storage.upload_to_s3)
    monkeypatch.setattr(photos, "delete_from_s3", storage.delete_from_s3)
    return storage


@pytest.fixture
def client(db, s3):
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: None
    yield TestClient(app)
    app.dependency_overrides.clear()


def upload(client, filename="IMG_001.JPG", content_type="image/jpeg"):
    return client.post("/photos", files={"file": (filename, b"data", content_type)})


@pytest.fixture
def saved_photo(db):
    db.query.return_value.scalar.return_value = None
    db.refresh.side_effect = lambda photo: setattr(photo, "id", uuid4())


def test_upload_stores_photo_under_a_generated_key(client, s3, saved_photo):
    response = upload(client)

    assert response.status_code == 201
    name = response.json()["name"]
    assert name.endswith(".jpg") and name != "IMG_001.jpg"
    assert s3.upload_to_s3.call_args.args[1] == name


def test_uploads_with_the_same_filename_get_different_keys(client, saved_photo):
    assert upload(client).json()["name"] != upload(client).json()["name"]


def test_upload_rejects_non_images(client, s3):
    response = upload(client, "notes.txt", "text/plain")

    assert response.status_code == 415
    s3.upload_to_s3.assert_not_called()


def test_upload_removes_s3_object_when_the_row_is_not_saved(client, db, s3, saved_photo):
    db.commit.side_effect = IntegrityError("INSERT", {}, Exception("duplicate"))

    response = upload(client)

    assert response.status_code == 409
    s3.delete_from_s3.assert_called_once_with(s3.upload_to_s3.call_args.args[1])


def test_delete_missing_photo_returns_404(client, db):
    db.get.return_value = None
    assert client.delete(f"/photos/{PHOTO_ID}").status_code == 404


def test_delete_rejects_malformed_id(client, db):
    assert client.delete("/photos/not-a-uuid").status_code == 422
    db.get.assert_not_called()


def test_delete_removes_row_before_s3_object(client, db, s3):
    calls = MagicMock()
    db.get.return_value.name = "photo.jpg"
    calls.attach_mock(db.commit, "commit")
    calls.attach_mock(s3.delete_from_s3, "delete_from_s3")

    assert client.delete(f"/photos/{PHOTO_ID}").status_code == 204
    assert [c[0] for c in calls.mock_calls] == ["commit", "delete_from_s3"]
    s3.delete_from_s3.assert_called_once_with("photo.jpg")


def test_delete_succeeds_when_only_s3_cleanup_fails(client, db, s3):
    db.get.return_value.name = "photo.jpg"
    s3.delete_from_s3.side_effect = EndpointConnectionError(endpoint_url="s3")

    assert client.delete(f"/photos/{PHOTO_ID}").status_code == 204


def test_reorder_with_unknown_id_returns_400(client, db):
    db.query.return_value.filter.return_value.all.return_value = []

    response = client.put("/photos/reorder", json={"photo_ids": [PHOTO_ID]})

    assert response.status_code == 400


def test_database_outage_returns_503(client, db):
    db.query.side_effect = OperationalError("SELECT", {}, Exception("down"))

    response = client.get("/photos")

    assert response.status_code == 503
    assert response.json() == {"detail": "Database is unavailable"}


@pytest.mark.parametrize(
    "method, path",
    [("post", "/photos"), ("put", "/photos/reorder"), ("delete", f"/photos/{PHOTO_ID}")],
)
def test_admin_routes_require_a_token(db, s3, method, path):
    app.dependency_overrides[get_db] = lambda: db
    try:
        response = TestClient(app).request(method, path)
    finally:
        app.dependency_overrides.clear()

    assert response.status_code in (401, 403)
    db.commit.assert_not_called()
