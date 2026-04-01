import random

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from pydantic import BaseModel
from datetime import datetime
from typing import Any

from database import get_db
from models import BaselineResponse, TaskSession, PostTaskResponse, Participant
from services.assignment import assign_task_order_balanced

CONDITIONS = ["no_ai", "basic_ai", "provocateur", "friction", "prov_then_fric", "fric_then_prov"]

router = APIRouter(prefix="/responses", tags=["responses"])


class BaselinePayload(BaseModel):
    participant_id: str
    responses: dict[str, Any]
    completion_time_seconds: float


class GatePayload(BaseModel):
    participant_id: str
    task_round: int
    gate_responses: dict[str, Any]
    gate_dwell_time_seconds: float


class ArtifactPayload(BaseModel):
    participant_id: str
    task_round: int
    final_artifact: str
    production_dwell_time_seconds: float


class PostTaskPayload(BaseModel):
    participant_id: str
    task_round: int
    responses: dict[str, Any]
    completion_time_seconds: float


class LogEventPayload(BaseModel):
    participant_id: str
    task_round: int
    event: dict[str, Any]


def _combined_order(condition_id: str | None) -> str | None:
    if condition_id == "prov_then_fric":
        return "prov_first"
    if condition_id == "fric_then_prov":
        return "fric_first"
    return None


@router.post("/baseline")
def save_baseline(payload: BaselinePayload, db: Session = Depends(get_db)):
    existing = db.query(BaselineResponse).filter(
        BaselineResponse.participant_id == payload.participant_id
    ).first()
    if existing:
        existing.responses = payload.responses
        existing.completion_time_seconds = payload.completion_time_seconds
    else:
        db.add(BaselineResponse(
            participant_id=payload.participant_id,
            responses=payload.responses,
            completion_time_seconds=payload.completion_time_seconds,
        ))
    db.commit()

    # Condition assignment — only if not yet assigned (real study mode)
    p = db.query(Participant).filter(
        Participant.participant_id == payload.participant_id
    ).first()
    assignment_result = {}
    if p and p.condition_id is None:
        condition = random.choice(CONDITIONS)
        order = assign_task_order_balanced(db, condition)
        p.condition_id = condition
        p.task_order = order
        p.provocateur_flag = condition in ("provocateur", "prov_then_fric", "fric_then_prov")
        p.friction_flag = condition in ("friction", "prov_then_fric", "fric_then_prov")
        db.commit()
        assignment_result = {
            "condition_id": condition,
            "provocateur_flag": p.provocateur_flag,
            "friction_flag": p.friction_flag,
            "task_order": order,
            "combined_order": _combined_order(condition),
        }

    return {"status": "ok", **assignment_result}


@router.post("/gate")
def save_gate(payload: GatePayload, db: Session = Depends(get_db)):
    session = _get_session_or_404(db, payload.participant_id, payload.task_round)
    session.gate_shown = True
    session.gate_completed = True
    session.gate_responses = payload.gate_responses
    session.gate_dwell_time_seconds = payload.gate_dwell_time_seconds
    db.commit()
    return {"status": "ok"}


@router.post("/artifact")
def save_artifact(payload: ArtifactPayload, db: Session = Depends(get_db)):
    session = _get_session_or_404(db, payload.participant_id, payload.task_round)
    session.final_artifact = payload.final_artifact
    session.submission_timestamp = datetime.utcnow()
    session.production_dwell_time_seconds = payload.production_dwell_time_seconds
    db.commit()
    return {"status": "ok"}


@router.post("/post-task")
def save_post_task(payload: PostTaskPayload, db: Session = Depends(get_db)):
    existing = db.query(PostTaskResponse).filter(
        PostTaskResponse.participant_id == payload.participant_id,
        PostTaskResponse.task_round == payload.task_round,
    ).first()

    session = _get_session_or_404(db, payload.participant_id, payload.task_round)

    if existing:
        existing.responses = payload.responses
        existing.completion_time_seconds = payload.completion_time_seconds
    else:
        db.add(PostTaskResponse(
            participant_id=payload.participant_id,
            task_round=payload.task_round,
            task_type=session.task_type,
            responses=payload.responses,
            completion_time_seconds=payload.completion_time_seconds,
        ))
    db.commit()
    return {"status": "ok"}


@router.post("/log-event")
def log_event(payload: LogEventPayload, db: Session = Depends(get_db)):
    session = _get_session_or_404(db, payload.participant_id, payload.task_round)
    log = list(session.interaction_log or [])
    log.append({**payload.event, "timestamp": datetime.utcnow().isoformat()})
    session.interaction_log = log
    flag_modified(session, "interaction_log")
    db.commit()
    return {"status": "ok"}


def _get_session_or_404(db: Session, participant_id: str, task_round: int) -> TaskSession:
    session = db.query(TaskSession).filter(
        TaskSession.participant_id == participant_id,
        TaskSession.task_round == task_round,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Task session not found")
    return session
