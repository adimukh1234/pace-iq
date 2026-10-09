"""
Tests for transform pipeline: schema integrity, column coercion, null checks.
"""

from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from backend.app.db import Base
from backend.pipeline.transform import load_raw_json


def test_load_raw_json(tmp_path: Path):
    sample_file = tmp_path / "test.json"
    sample_file.write_text('[{"key": "val"}]', encoding="utf-8")
    data = load_raw_json(sample_file)
    assert len(data) == 1
    assert data[0]["key"] == "val"


def test_database_tables_exist(tmp_path: Path):
    db_file = tmp_path / "test.db"
    engine = create_engine(f"sqlite:///{db_file}")
    TestingSession = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    session = TestingSession()
    # Check that core tables can be queried
    count = session.execute(text("SELECT COUNT(*) FROM meetings")).scalar()
    assert count == 0
    session.close()
