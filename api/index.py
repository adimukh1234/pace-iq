"""
Vercel Serverless Function entry point for PaceIQ.
Exposes the FastAPI ASGI app for serverless execution.
"""

import sys
from pathlib import Path

# Add project root directory and /var/task to sys.path so 'backend' is always discovered
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent

for candidate in (PROJECT_ROOT, CURRENT_DIR, Path("/var/task")):
    if str(candidate) not in sys.path and candidate.exists():
        sys.path.insert(0, str(candidate))

from backend.app.main import app

# Vercel looks for 'app' in api/index.py
__all__ = ["app"]
