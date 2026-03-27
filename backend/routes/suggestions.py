from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import Participant, TaskSession
from services.deepseek import (
    get_story_suggestions,
    get_metaphor_suggestions,
    STORY_CUE_WORDS,
    METAPHOR_PROMPTS,
)
import random

router = APIRouter(prefix="/suggestions", tags=["suggestions"])


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

    if session and session.suggestions_shown:
        return {
            "task_type": session.task_type,
            "prompt": _get_prompt(session.task_type, task_round),
            "suggestions": session.suggestions_shown,
            "provocateur_flag": p.provocateur_flag,
            "friction_flag": p.friction_flag,
        }

    # Determine task type from order
    task_type = p.task_order[task_round - 1]
    prompt = _get_prompt(task_type, task_round)

    # Generate suggestions
    try:
        if task_type == "story":
            cue_words = STORY_CUE_WORDS[(task_round - 1) % len(STORY_CUE_WORDS)]
            suggestions = get_story_suggestions(cue_words, p.provocateur_flag)
            display_prompt = {
                "type": "story",
                "cue_words": cue_words,
                "instruction": f"Write a creative story of about 4–6 sentences using all three words: {', '.join(cue_words)}.",
            }
        else:
            metaphor_prompt = METAPHOR_PROMPTS[(task_round - 1) % len(METAPHOR_PROMPTS)]
            suggestions = get_metaphor_suggestions(metaphor_prompt, p.provocateur_flag)
            display_prompt = {
                "type": "metaphor",
                "metaphor_prompt": metaphor_prompt,
                "instruction": "Complete the metaphor as creatively as possible.",
            }
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
    db.commit()

    return {
        "task_type": task_type,
        "prompt": display_prompt,
        "suggestions": suggestions,
        "provocateur_flag": p.provocateur_flag,
        "friction_flag": p.friction_flag,
    }


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
