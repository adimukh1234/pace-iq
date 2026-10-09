"""
Driver explainer routes for PaceIQ API.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from backend.app.db import get_db
from backend.app.schemas import DriverExplainResponse
from backend.app.services.predictor import get_driver_explanation

router = APIRouter()


@router.get(
    "/races/{session_key}/drivers/{driver_number}/explain",
    response_model=DriverExplainResponse,
)
def explain_driver(
    session_key: int,
    driver_number: int,
    db: DBSession = Depends(get_db),
):
    """Retrieve feature contributions and plain-language summary for a driver forecast."""
    explanation = get_driver_explanation(session_key, driver_number, db)
    if not explanation:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "EXPLANATION_NOT_FOUND",
                "message": f"No prediction or explanation available for driver {driver_number} in session {session_key}.",
            },
        )
    return explanation
