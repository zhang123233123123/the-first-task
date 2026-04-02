from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os

from database import engine, Base
from routes import debug_data, participants, suggestions, responses

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CHI Creativity Experiment API", version="1.0.0")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Ensure unhandled exceptions still return CORS-safe JSON responses."""
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={"Access-Control-Allow-Origin": FRONTEND_URL},
    )

app.include_router(participants.router)
app.include_router(suggestions.router)
app.include_router(responses.router)
app.include_router(debug_data.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "CHI Experiment API"}
