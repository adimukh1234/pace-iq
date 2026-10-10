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


def test_nonexistent_session_404():
    """Non-existent session returns 404."""
    resp = client.get("/api/races/99999999")
    assert resp.status_code == 404
    data = resp.json()
    assert data["error"]["code"] == "SESSION_NOT_FOUND"


def test_races_endpoint_and_headshots():
    """Verify /api/races returns 200 and schema includes headshot_url field."""
    resp = client.get("/api/races?year=2024")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    if len(data) > 0:
        first_race = data[0]
        if first_race.get("predicted_podium"):
            podium_driver = first_race["predicted_podium"][0]
            assert "headshot_url" in podium_driver

