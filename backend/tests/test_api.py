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


def test_race_laps_and_stints():
    """Verify /races/{session_key}/laps and stints return valid telemetry series."""
    resp = client.get("/api/races/2026175/laps?drivers=44,63")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) == 2
    for driver_data in data:
        assert driver_data["driver_number"] in (44, 63)
        assert len(driver_data["laps"]) > 0
        first_lap = driver_data["laps"][0]
        assert "lap_number" in first_lap
        assert "lap_duration" in first_lap
        assert first_lap["lap_duration"] > 50

    stints_resp = client.get("/api/races/2026175/stints")
    assert stints_resp.status_code == 200
    stints_data = stints_resp.json()
    assert "stints" in stints_data
    assert len(stints_data["stints"]) > 0


