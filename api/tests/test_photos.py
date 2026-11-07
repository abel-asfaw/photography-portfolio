from unittest.mock import MagicMock
from uuid import uuid4

import pytest
from botocore.exceptions import EndpointConnectionError
from fastapi.testclient import TestClient
from sqlalchemy.exc import IntegrityError, OperationalError

from src import storage
from src.auth import require_admin
from src.config import settings
from src.database import get_db
from src.main import app
from src.routers import photos

PHOTO_ID = "6f1c2d3e-4b5a-4c6d-8e7f-901234567890"


@pytest.fixture
def db():
    return MagicMock()


@pytest.fixture
def s3(monkeypatch):
    stub = MagicMock()
    stub.upload_to_s3.side_effect = lambda _file, name: f"https://bucket/{name}"
    monkeypatch.setattr(photos, "upload_to_s3", stub.upload_to_s3)
    monkeypatch.setattr(photos, "delete_from_s3", stub.delete_from_s3)
    return stub


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
    db.scalar.return_value = None
    db.refresh.side_effect = lambda photo: setattr(photo, "id", uuid4())


def test_upload_stores_photo_under_a_generated_key(client, s3, saved_photo):
    response = upload(client)

    assert response.status_code == 201
    name = response.json()["name"]
    assert name.endswith(".jpg") and name != "IMG_001.jpg"
    assert s3.upload_to_s3.call_args.args[1] == name


def test_uploads_with_the_same_filename_get_different_keys(client, saved_photo):
    assert upload(client).json()["name"] != upload(client).json()["name"]


def test_upload_rejects_files_over_the_size_limit(client, s3, monkeypatch):
    monkeypatch.setattr(settings, "MAX_UPLOAD_MB", 0)

    response = upload(client)

    assert response.status_code == 413
    s3.upload_to_s3.assert_not_called()


def test_upload_rejects_non_images(client, s3):
    response = upload(client, "notes.txt", "text/plain")

    assert response.status_code == 415
    s3.upload_to_s3.assert_not_called()


def test_upload_removes_s3_object_when_the_row_is_not_saved(
    client, db, s3, saved_photo
):
    db.commit.side_effect = IntegrityError("INSERT", {}, Exception("duplicate"))

    response = upload(client)

    assert response.status_code == 409
    s3.delete_from_s3.assert_called_once_with(s3.upload_to_s3.call_args.args[1])


def make_photos(count):
    photos = [MagicMock(id=uuid4(), url=f"https://bucket/{i}") for i in range(count)]
    for i, photo in enumerate(photos):
        photo.name = f"{i}.jpg"
    return photos


def delete(client, *ids):
    return client.request(
        "DELETE", "/photos", json={"photo_ids": [str(i) for i in ids]}
    )


def test_delete_ignores_unknown_ids(client, db, s3):
    db.scalars.return_value.all.return_value = []

    assert delete(client, PHOTO_ID).status_code == 204
    db.commit.assert_not_called()
    s3.delete_from_s3.assert_not_called()


def test_delete_rejects_malformed_ids(client, db):
    assert delete(client, "not-a-uuid").status_code == 422
    db.scalars.assert_not_called()


def test_delete_removes_rows_before_s3_objects(client, db, s3):
    db.scalars.return_value.all.return_value = make_photos(2)
    calls = MagicMock()
    calls.attach_mock(db.commit, "commit")
    calls.attach_mock(s3.delete_from_s3, "delete_from_s3")

    assert delete(client, PHOTO_ID).status_code == 204
    assert [c[0] for c in calls.mock_calls] == ["commit", "delete_from_s3"]
    s3.delete_from_s3.assert_called_once_with("0.jpg", "1.jpg")
    assert db.delete.call_count == 2


@pytest.mark.parametrize(
    "error",
    [EndpointConnectionError(endpoint_url="s3"), storage.S3DeleteError([])],
    ids=["unreachable", "partial-failure"],
)
def test_delete_succeeds_when_only_s3_cleanup_fails(client, db, s3, error):
    [photo] = make_photos(1)
    db.scalars.return_value.all.return_value = [photo]
    s3.delete_from_s3.side_effect = error

    assert delete(client, photo.id).status_code == 204


def reorder(client, db, current, ids):
    db.scalars.return_value.all.return_value = current
    return client.put("/photos/reorder", json={"photo_ids": [str(i) for i in ids]})


def test_reorder_sets_sort_order_from_list_position(client, db):
    first, second = make_photos(2)

    response = reorder(client, db, [first, second], [second.id, first.id])

    assert response.status_code == 200
    assert (second.sort_order, first.sort_order) == (0, 1)
    assert [p["id"] for p in response.json()] == [str(second.id), str(first.id)]
    db.commit.assert_called_once()


def test_reorder_fits_a_stale_list_to_the_current_photos(client, db):
    a, b, c = make_photos(3)

    # Lists an unknown photo and a repeat, and leaves out b and c.
    response = reorder(client, db, [a, b, c], [c.id, uuid4(), c.id])

    assert response.status_code == 200
    assert [p["id"] for p in response.json()] == [str(c.id), str(a.id), str(b.id)]
    assert (c.sort_order, a.sort_order, b.sort_order) == (0, 1, 2)


def test_database_outage_returns_503(client, db):
    db.scalars.side_effect = OperationalError("SELECT", {}, Exception("down"))

    response = client.get("/photos")

    assert response.status_code == 503
    assert response.json() == {"detail": "Database is unavailable"}


@pytest.mark.parametrize(
    "method, path",
    [
        ("post", "/photos"),
        ("put", "/photos/reorder"),
        ("delete", "/photos"),
    ],
)
def test_admin_routes_require_a_token(db, s3, method, path):
    app.dependency_overrides[get_db] = lambda: db
    try:
        response = TestClient(app).request(method, path)
    finally:
        app.dependency_overrides.clear()

    assert response.status_code in (401, 403)
    db.commit.assert_not_called()


def test_healthcheck_queries_the_database(client, db):
    assert client.get("/healthz").json() == {"status": "ok"}
    db.execute.assert_called_once()


def test_healthcheck_returns_503_when_the_database_is_down(client, db):
    db.execute.side_effect = OperationalError("SELECT 1", {}, Exception("down"))

    assert client.get("/healthz").status_code == 503
