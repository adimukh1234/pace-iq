"""
Main FastAPI Application for PaceIQ.
Provides REST API endpoints for races, predictions, explanations, and fan game.
Complies with TECH_SPEC.md §8 and IMPLEMENTATION_RULES.md (Rules 29-33).
"""

import sys
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from backend.app.config import MODELS_DIR
from backend.app.db import SessionLocal, init_db
from backend.app.routes import drivers, game, races
from backend.app.schemas import HealthResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="PaceIQ API",
    description="Formula 1 Race Outcome Predictor and Strategy Lab API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS configuration (Rule 32 & TECH_SPEC §12)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*",  # Local development flexibility
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Standard Error Format (Rule 30)
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    detail = exc.detail
    if isinstance(detail, dict) and "code" in detail and "message" in detail:
        code = detail["code"]
        message = detail["message"]
    else:
        code = "HTTP_ERROR"
        message = str(detail)

    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": code, "message": message}},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_msg = errors[0]["msg"] if errors else "Validation failed"
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": first_msg,
            }
        },
    )


# Health Endpoint (TECH_SPEC §8.1)
@app.get("/api/health", response_model=HealthResponse)
def health_check():
    # Check DB
    db_ok = False
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_ok = True
    except (SQLAlchemyError, OSError):
        db_ok = False

    # Check Model Artefact
    model_ok = (MODELS_DIR / "paceiq_v1.joblib").exists()

    return HealthResponse(
        status="ok" if (db_ok and model_ok) else "degraded",
        model_loaded=model_ok,
        database_connected=db_ok,
        version="paceiq_v1",
    )


# Include Feature Routers
app.include_router(races.router, prefix="/api", tags=["Races"])
app.include_router(drivers.router, prefix="/api", tags=["Drivers"])
app.include_router(game.router, prefix="/api", tags=["Game"])
