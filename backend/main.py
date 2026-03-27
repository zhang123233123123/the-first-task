from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from database import engine, Base
from routes import participants, suggestions, responses

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CHI Creativity Experiment API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(participants.router)
app.include_router(suggestions.router)
app.include_router(responses.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "CHI Experiment API"}
