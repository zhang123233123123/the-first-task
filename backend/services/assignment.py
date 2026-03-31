import random
from sqlalchemy import func

from models import Participant

CSE_THRESHOLD = 3.5   # 1-5 scale; >= 3.5 → high stratum
CONDITIONS = ["provocateur", "friction", "prov_then_fric", "fric_then_prov"]
TASK_ORDERS = [["story", "metaphor"], ["metaphor", "story"]]


def compute_stratum(responses: dict) -> str:
    """Score CSE (4 items) → 'high' | 'low'."""
    keys = ["cse_generate", "cse_develop", "cse_confident", "cse_improve"]
    vals = [float(responses[k]) for k in keys if k in responses]
    if not vals:
        return "high"  # fallback: treat unknown as high (conservative)
    return "high" if (sum(vals) / len(vals)) >= CSE_THRESHOLD else "low"


def assign_condition_minimized(db, stratum: str) -> str:
    """Return condition with fewest participants in this stratum; random tie-break."""
    counts = {c: 0 for c in CONDITIONS}
    rows = (
        db.query(Participant.condition_id, func.count(Participant.id))
        .filter(
            Participant.condition_id.in_(CONDITIONS),
            Participant.stratum == stratum,
        )
        .group_by(Participant.condition_id)
        .all()
    )
    for cond, cnt in rows:
        counts[cond] = cnt
    min_cnt = min(counts.values())
    return random.choice([c for c, n in counts.items() if n == min_cnt])


def assign_task_order_balanced(db, condition_id: str) -> list:
    """Within the condition, pick the task order used by fewer participants."""
    existing = (
        db.query(Participant.task_order)
        .filter(
            Participant.condition_id == condition_id,
            Participant.task_order.isnot(None),
        )
        .all()
    )
    story_first = sum(1 for (o,) in existing if o and o[0] == "story")
    metaphor_first = sum(1 for (o,) in existing if o and o[0] == "metaphor")
    return ["story", "metaphor"] if story_first <= metaphor_first else ["metaphor", "story"]
