from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os

from database import engine, Base
from routes import debug_data, participants, suggestions, responses

load_dotenv()

Base.metadata.create_all(bind=engine)

# Lightweight column migration for SQLite (create_all does not add new columns)
with engine.connect() as _conn:
    try:
        _conn.execute(__import__("sqlalchemy").text(
            "ALTER TABLE participants ADD COLUMN is_pilot BOOLEAN DEFAULT 0 NOT NULL"
        ))
        _conn.commit()
    except Exception:
        pass  # column already exists

app = FastAPI(title="CHI Creativity Experiment API", version="1.0.0")

_frontend_raw = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins = [u.strip() for u in _frontend_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Ensure unhandled exceptions still return CORS-safe JSON responses."""
    origin = request.headers.get("origin", allowed_origins[0])
    safe_origin = origin if origin in allowed_origins else allowed_origins[0]
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={"Access-Control-Allow-Origin": safe_origin},
    )

app.include_router(participants.router)
app.include_router(suggestions.router)
app.include_router(responses.router)
app.include_router(debug_data.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "CHI Experiment API"}
