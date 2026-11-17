"""
Vercel Serverless Function entry point for PaceIQ.
Exposes the FastAPI ASGI app for serverless execution.
"""

import sys
from pathlib import Path

# Add project root directory to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.main import app

# Vercel looks for 'app' in api/index.py
__all__ = ["app"]
