"""
Automated tests for FastAPI endpoints:
Validation, duplicates, closed sessions, and scoring (Plan §5.1 and Rule 53).
"""

from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_health_endpoint():
    """Verify /api/health returns 200 and schema."""
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert "status" in data
    assert "model_loaded" in data
    assert "database_connected" in data


def test_seasons_endpoint():
    """Verify /api/seasons returns 200."""
    resp = client.get("/api/seasons")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_invalid_picks_validation_422():
    """Duplicate driver numbers within a pick return 422."""
    payload = {
        "username": "speedy_fan",
        "session_key": 9472,
        "p1": 1,
        "p2": 1,  # Duplicate!
        "p3": 44,
    }
    resp = client.post("/api/game/predictions", json=payload)
    assert resp.status_code == 422
    data = resp.json()
    assert "error" in data
    assert data["error"]["code"] == "VALIDATION_ERROR"


def test_closed_session_403(tmp_path):
    """Sessions that have already started reject picks with 403 SESSION_CLOSED."""
    # Session 9472 is in 2024 (past date)
    payload = {
        "username": "speedy_fan",
        "session_key": 9472,
        "p1": 1,
        "p2": 16,
        "p3": 44,
    }
    resp = client.post("/api/game/predictions", json=payload)
    assert resp.status_code == 403
    data = resp.json()
    assert data["error"]["code"] == "SESSION_CLOSED"


def test_nonexistent_session_404():
    """Non-existent session returns 404."""
    resp = client.get("/api/races/99999999")
    assert resp.status_code == 404
    data = resp.json()
    assert data["error"]["code"] == "SESSION_NOT_FOUND"
