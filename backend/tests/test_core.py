import importlib.util
import os
from pathlib import Path

from fastapi.testclient import TestClient


def build_client(tmp_path: Path) -> TestClient:
    os.environ["IT_BASE_DB_PATH"] = str(tmp_path / "test.sqlite3")
    os.environ["IT_BASE_ADMIN_PASSWORD"] = "secret"
    module_path = Path(__file__).resolve().parents[1] / "app.py"
    spec = importlib.util.spec_from_file_location("itbase_main", module_path)
    if not spec or not spec.loader:
        raise RuntimeError("cannot load backend/app.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    client = TestClient(module.app)
    client.__enter__()
    return client


def login_admin(client: TestClient) -> None:
    r = client.post("/api/admin/login", json={"password": "secret"})
    assert r.status_code == 200


def create_dev(client: TestClient, name: str = "Ivan React") -> int:
    payload = {
        "name": name,
        "title": "Frontend Developer",
        "stack": "React, TypeScript",
        "skills": ["React", "TypeScript", "SPA"],
        "experience": "4 years",
        "grade": "Middle",
        "contact_email": "dev@example.com",
        "contact_telegram": "@devtg",
    }
    r = client.post("/api/admin/developers", json=payload)
    assert r.status_code == 200
    return r.json()["id"]


def test_create_and_search_developers(tmp_path: Path):
    client = build_client(tmp_path)
    login_admin(client)
    create_dev(client, "Ivan React")
    create_dev(client, "Olga Python")

    r = client.get("/api/public/developers", params={"query": "React"})
    assert r.status_code == 200
    body = r.json()
    assert body["total"] >= 1
    assert any("React" in d["stack"] for d in body["items"])


def test_contact_request_creation(tmp_path: Path):
    client = build_client(tmp_path)
    login_admin(client)
    developer_id = create_dev(client)
    r = client.post(
        "/api/public/contact-requests",
        json={"developer_id": developer_id, "customer_telegram": "@customer123", "message": "Need help"},
    )
    assert r.status_code == 200
    assert r.json()["ok"] is True


def test_contact_request_status_update(tmp_path: Path):
    client = build_client(tmp_path)
    login_admin(client)
    developer_id = create_dev(client)
    req = client.post(
        "/api/public/contact-requests",
        json={"developer_id": developer_id, "customer_telegram": "@customer123", "message": ""},
    )
    req_id = req.json()["id"]
    upd = client.put(f"/api/admin/contact-requests/{req_id}/status", json={"status": "processed"})
    assert upd.status_code == 200


def test_admin_validation_and_backup(tmp_path: Path):
    client = build_client(tmp_path)
    login_admin(client)
    bad = client.post(
        "/api/admin/developers",
        json={
            "name": "A",
            "title": "Dev",
            "stack": "Python",
            "skills": ["Python"],
            "experience": "2 years",
            "grade": "Junior",
            "contact_email": "badmail",
            "contact_telegram": "@okname",
        },
    )
    assert bad.status_code == 400

    backup = client.get("/api/admin/backup")
    assert backup.status_code == 200


def test_admin_csv_import(tmp_path: Path):
    client = build_client(tmp_path)
    login_admin(client)
    csv_content = (
        "name,title,stack,skills,experience,grade,contact_email,contact_telegram\n"
        "Petr Ivanov,Backend Developer,Python;FastAPI,Python,3 years,Middle,petr@example.com,@petr_ivanov\n"
    ).encode("utf-8")
    res = client.post(
        "/api/admin/developers/import",
        files={"file": ("people.csv", csv_content, "text/csv")},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["inserted"] == 1
