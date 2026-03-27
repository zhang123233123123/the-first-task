from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
import uuid
import random

from database import get_db
from models import Participant

router = APIRouter(prefix="/participants", tags=["participants"])

CONDITIONS = ["control", "provocateur", "friction", "combined"]
TASK_ORDERS = [["story", "metaphor"], ["metaphor", "story"]]


class ConsentPayload(BaseModel):
    consent_given: bool


class ProgressPayload(BaseModel):
    current_page: str


class InitPayload(BaseModel):
    condition: str | None = None  # if None, assign randomly


@router.post("/init")
def init_participant(payload: InitPayload = InitPayload(), db: Session = Depends(get_db)):
    """Create a new participant. Condition can be specified or randomly assigned."""
    participant_id = str(uuid.uuid4())

    if payload.condition and payload.condition in CONDITIONS:
        condition = payload.condition
    else:
        condition = random.choice(CONDITIONS)

    task_order = random.choice(TASK_ORDERS)

    p = Participant(
        participant_id=participant_id,
        condition_id=condition,
        provocateur_flag=condition in ("provocateur", "combined"),
        friction_flag=condition in ("friction", "combined"),
        task_order=task_order,
        current_page="consent",
    )
    db.add(p)
    db.commit()
    db.refresh(p)

    return {
        "participant_id": participant_id,
        "condition_id": condition,
        "provocateur_flag": p.provocateur_flag,
        "friction_flag": p.friction_flag,
        "task_order": task_order,
    }


@router.post("/{participant_id}/consent")
def record_consent(
    participant_id: str,
    payload: ConsentPayload,
    db: Session = Depends(get_db),
):
    p = _get_or_404(db, participant_id)
    p.consent_given = payload.consent_given
    p.consent_timestamp = datetime.utcnow()
    p.current_page = "instructions"
    db.commit()
    return {"status": "ok"}


@router.get("/{participant_id}")
def get_participant(participant_id: str, db: Session = Depends(get_db)):
    p = _get_or_404(db, participant_id)
    return {
        "participant_id": p.participant_id,
        "condition_id": p.condition_id,
        "provocateur_flag": p.provocateur_flag,
        "friction_flag": p.friction_flag,
        "task_order": p.task_order,
        "current_page": p.current_page,
        "completed": p.completed,
    }


@router.patch("/{participant_id}/progress")
def update_progress(
    participant_id: str,
    payload: ProgressPayload,
    db: Session = Depends(get_db),
):
    p = _get_or_404(db, participant_id)
    p.current_page = payload.current_page
    db.commit()
    return {"status": "ok"}


@router.post("/{participant_id}/complete")
def complete_study(participant_id: str, db: Session = Depends(get_db)):
    p = _get_or_404(db, participant_id)
    p.completed = True
    p.completion_timestamp = datetime.utcnow()
    p.current_page = "complete"
    db.commit()
    return {"status": "ok"}


def _get_or_404(db: Session, participant_id: str) -> Participant:
    p = db.query(Participant).filter(Participant.participant_id == participant_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")
    return p
