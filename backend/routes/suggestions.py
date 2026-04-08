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
    get_basic_ai_followup,
    get_friction_card_options,
    STORY_CUE_WORDS,
    METAPHOR_PROMPTS,
)
import random
from datetime import datetime
from sqlalchemy.orm.attributes import flag_modified

router = APIRouter(prefix="/suggestions", tags=["suggestions"])


def _append_log(session: TaskSession, db: Session, entry: dict) -> None:
    """Append one event to session.interaction_log and persist."""
    log = list(session.interaction_log or [])
    log.append({**entry, "ts": datetime.utcnow().isoformat()})
    session.interaction_log = log
    flag_modified(session, "interaction_log")
    db.commit()


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
    if condition_id == "prov_then_fric":
        return True, True
    if condition_id == "fric_then_prov":
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

    if session:
        _append_log(session, db, {
            "type": "prov_followup",
            "user_reply": body.user_reply,
            "original_question": body.original_question,
            "ai_response": followup,
        })

    return followup


class ChatRequest(BaseModel):
    participant_id: str
    task_round: int
    user_message: str
    original_question: str | None = None


@router.post("/chat")
def chat_followup(body: ChatRequest, db: Session = Depends(get_db)):
    """Unified chat endpoint for all AI conditions.
    - Provocateur / combined: returns Risk+Alternative+Question provocation.
    - Basic AI / friction: returns a helpful suggestion reply.
    - No AI: returns 403.
    """
    p = db.query(Participant).filter(Participant.participant_id == body.participant_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")
    if p.condition_id == "no_ai":
        raise HTTPException(status_code=403, detail="No AI assistance in this condition")

    session = (
        db.query(TaskSession)
        .filter(
            TaskSession.participant_id == body.participant_id,
            TaskSession.task_round == body.task_round,
        )
        .first()
    )
    if not session and not p.task_order:
        raise HTTPException(status_code=400, detail="Task order not yet assigned")
    task_type = session.task_type if session else p.task_order[body.task_round - 1]
    task_context = _get_prompt(task_type, body.task_round).get("instruction", "")

    prov_flag, _ = _round_flags(p.condition_id, body.task_round)

    try:
        if prov_flag:
            result = get_followup_provocation(task_type, body.user_message, body.original_question or body.user_message)
            response = {"type": "provocation", **result}
        else:
            message = get_basic_ai_followup(task_type, body.user_message, task_context)
            response = {"type": "suggestion", "message": message}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {str(e)}")

    if session:
        _append_log(session, db, {
            "type": "chat",
            "user_message": body.user_message,
            "original_question": body.original_question,
            "ai_response": response,
        })

    return response


class FrictionOptionsRequest(BaseModel):
    participant_id: str
    task_round: int
    user_text: str


@router.post("/friction-options")
def friction_options(body: FrictionOptionsRequest, db: Session = Depends(get_db)):
    """Generate AI-personalized weakness and strategy options for the friction card."""
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
    if not session and not p.task_order:
        raise HTTPException(status_code=400, detail="Task order not yet assigned")
    task_type = session.task_type if session else p.task_order[body.task_round - 1]
    suggestions = session.suggestions_shown or [] if session else []

    try:
        options = get_friction_card_options(task_type, body.user_text, suggestions)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {str(e)}")

    return options


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
