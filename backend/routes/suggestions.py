from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import Participant, TaskSession
from services.deepseek import (
    get_story_suggestions,
    get_metaphor_suggestions,
    get_general_provocation,
    get_followup_provocation,
    STORY_CUE_WORDS,
    METAPHOR_PROMPTS,
)
import random

router = APIRouter(prefix="/suggestions", tags=["suggestions"])


def _round_flags(condition_id: str, task_round: int) -> tuple[bool, bool]:
    """Return (provocateur_flag, friction_flag) for this specific round."""
    if condition_id == "no_ai":
        return False, False
    if condition_id == "basic_ai":
        return False, False
    if condition_id == "provocateur":
        return True, False
    if condition_id == "friction":
        return False, True
    if condition_id in ("prov_then_fric", "fric_then_prov"):
        return True, True
    return False, False  # fallback for old/unknown conditions


def _combined_order(condition_id: str | None) -> str | None:
    if condition_id == "prov_then_fric":
        return "prov_first"
    if condition_id == "fric_then_prov":
        return "fric_first"
    return None


@router.get("/prompt/{participant_id}/{task_round}")
def get_prompt(
    participant_id: str,
    task_round: int,
    db: Session = Depends(get_db),
):
    """Return the task prompt without generating AI suggestions yet."""
    p = db.query(Participant).filter(Participant.participant_id == participant_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")

    if not p.task_order:
        raise HTTPException(status_code=400, detail="Task order not yet assigned")
    task_type = p.task_order[task_round - 1]

    return {
        "task_type": task_type,
        "prompt": _get_prompt(task_type, task_round),
    }


@router.get("/{participant_id}/{task_round}")
def get_suggestions(
    participant_id: str,
    task_round: int,
    db: Session = Depends(get_db),
):
    """Return AI suggestions for a participant's task round (cached if already generated)."""
    p = db.query(Participant).filter(Participant.participant_id == participant_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")

    # Check if session already exists (avoid regenerating)
    session = (
        db.query(TaskSession)
        .filter(
            TaskSession.participant_id == participant_id,
            TaskSession.task_round == task_round,
        )
        .first()
    )

    prov_flag, fric_flag = _round_flags(p.condition_id, task_round)

    if session and session.suggestions_shown:
        return {
            "task_type": session.task_type,
            "prompt": _get_prompt(session.task_type, task_round),
            "suggestions": session.suggestions_shown,
            "provocation": session.provocation_shown,
            "provocateur_flag": prov_flag,
            "friction_flag": fric_flag,
            "combined_order": _combined_order(p.condition_id),
        }

    # Determine task type from order
    if not p.task_order:
        raise HTTPException(status_code=400, detail="Task order not yet assigned")
    task_type = p.task_order[task_round - 1]

    # no_ai: return empty suggestions without calling AI
    if p.condition_id == "no_ai":
        display_prompt = _get_prompt(task_type, task_round)
        if not session:
            session = TaskSession(
                participant_id=participant_id,
                task_round=task_round,
                task_type=task_type,
            )
            db.add(session)
        session.suggestions_shown = []
        session.provocation_shown = None
        db.commit()
        return {
            "task_type": task_type,
            "prompt": display_prompt,
            "suggestions": [],
            "provocation": None,
            "provocateur_flag": False,
            "friction_flag": False,
            "combined_order": None,
        }

    # Generate suggestions
    try:
        if task_type == "story":
            cue_words = STORY_CUE_WORDS[(task_round - 1) % len(STORY_CUE_WORDS)]
            suggestions = get_story_suggestions(cue_words)
            display_prompt = {
                "type": "story",
                "cue_words": cue_words,
                "instruction": f"Write a creative story of about 4–6 sentences using all three words: {', '.join(cue_words)}.",
            }
        else:
            metaphor_prompt = METAPHOR_PROMPTS[(task_round - 1) % len(METAPHOR_PROMPTS)]
            suggestions = get_metaphor_suggestions(metaphor_prompt)
            display_prompt = {
                "type": "metaphor",
                "metaphor_prompt": metaphor_prompt,
                "instruction": "Complete the metaphor as creatively as possible.",
            }
        provocation = (
            get_general_provocation(task_type, display_prompt["instruction"], suggestions)
            if prov_flag
            else None
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {str(e)}")

    # Create or update session
    if not session:
        session = TaskSession(
            participant_id=participant_id,
            task_round=task_round,
            task_type=task_type,
        )
        db.add(session)

    session.suggestions_shown = suggestions
    session.provocation_shown = provocation
    db.commit()

    return {
        "task_type": task_type,
        "prompt": display_prompt,
        "suggestions": suggestions,
        "provocation": provocation,
        "provocateur_flag": prov_flag,
        "friction_flag": fric_flag,
        "combined_order": _combined_order(p.condition_id),
    }


class ProvFollowupRequest(BaseModel):
    participant_id: str
    task_round: int
    user_reply: str
    original_question: str


@router.post("/prov-followup")
def prov_followup(body: ProvFollowupRequest, db: Session = Depends(get_db)):
    """Generate a follow-up provocation card after the user replies."""
    p = db.query(Participant).filter(Participant.participant_id == body.participant_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")

    session = (
        db.query(TaskSession)
        .filter(
            TaskSession.participant_id == body.participant_id,
            TaskSession.task_round == body.task_round,
        )
        .first()
    )
    if session:
        task_type = session.task_type
    elif p.task_order:
        task_type = p.task_order[body.task_round - 1]
    else:
        raise HTTPException(status_code=400, detail="Task order not yet assigned")

    try:
        followup = get_followup_provocation(task_type, body.user_reply, body.original_question)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {str(e)}")

    return followup


def _get_prompt(task_type: str, task_round: int) -> dict:
    if task_type == "story":
        cue_words = STORY_CUE_WORDS[(task_round - 1) % len(STORY_CUE_WORDS)]
        return {
            "type": "story",
            "cue_words": cue_words,
            "instruction": f"Write a creative story of about 4–6 sentences using all three words: {', '.join(cue_words)}.",
        }
    else:
        metaphor_prompt = METAPHOR_PROMPTS[(task_round - 1) % len(METAPHOR_PROMPTS)]
        return {
            "type": "metaphor",
            "metaphor_prompt": metaphor_prompt,
            "instruction": "Complete the metaphor as creatively as possible.",
        }
