from datetime import datetime
from typing import Any
import csv
import io

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from models import BaselineResponse, Participant, PostTaskResponse, TaskSession

router = APIRouter(prefix="/debug/data", tags=["debug-data"])

SORT_OPTIONS = {
    "created_at_desc": Participant.created_at.desc(),
    "created_at_asc": Participant.created_at.asc(),
    "participant_id_asc": Participant.participant_id.asc(),
    "participant_id_desc": Participant.participant_id.desc(),
}


@router.get("/participants")
def list_participants(
    q: str | None = Query(default=None),
    condition: str | None = Query(default=None),
    completed: bool | None = Query(default=None),
    study_mode: str | None = Query(default=None),
    sort: str = Query(default="created_at_desc"),
    db: Session = Depends(get_db),
):
    query = db.query(Participant)

    if q:
        query = query.filter(Participant.participant_id.ilike(f"%{q.strip()}%"))
    if condition:
        query = query.filter(Participant.condition_id == condition)
    if completed is not None:
        query = query.filter(Participant.completed == completed)
    if study_mode:
        query = query.filter(Participant.study_mode == study_mode)

    order_by = SORT_OPTIONS.get(sort, SORT_OPTIONS["created_at_desc"])
    participants = query.order_by(order_by).all()

    participant_ids = [p.participant_id for p in participants]
    baseline_ids: set[str] = set()
    task_flags: dict[str, dict[int, dict[str, bool]]] = {}
    posttask_flags: dict[str, set[int]] = {}

    if participant_ids:
        baseline_ids = {
            participant_id
            for (participant_id,) in (
                db.query(BaselineResponse.participant_id)
                .filter(BaselineResponse.participant_id.in_(participant_ids))
                .distinct()
                .all()
            )
        }

        task_rows = (
            db.query(
                TaskSession.participant_id,
                TaskSession.task_round,
                TaskSession.final_artifact,
                TaskSession.gate_completed,
            )
            .filter(TaskSession.participant_id.in_(participant_ids))
            .all()
        )
        for participant_id, task_round, final_artifact, gate_completed in task_rows:
            rounds = task_flags.setdefault(participant_id, {})
            rounds[task_round] = {
                "artifact_saved": bool(final_artifact and final_artifact.strip()),
                "gate_completed": bool(gate_completed),
            }

        posttask_rows = (
            db.query(PostTaskResponse.participant_id, PostTaskResponse.task_round)
            .filter(PostTaskResponse.participant_id.in_(participant_ids))
            .all()
        )
        for participant_id, task_round in posttask_rows:
            posttask_flags.setdefault(participant_id, set()).add(task_round)

    items = []
    for participant in participants:
        round_flags = task_flags.get(participant.participant_id, {})
        posttask_rounds = posttask_flags.get(participant.participant_id, set())
        items.append(
            {
                "participant_id": participant.participant_id,
                "condition_id": participant.condition_id,
                "study_mode": participant.study_mode or "main",
                "provocateur_flag": participant.provocateur_flag,
                "friction_flag": participant.friction_flag,
                "task_order": participant.task_order,
                "current_page": participant.current_page,
                "completed": participant.completed,
                "created_at": participant.created_at,
                "completion_timestamp": participant.completion_timestamp,
                "baseline_completed": participant.participant_id in baseline_ids,
                "task1_artifact_saved": round_flags.get(1, {}).get("artifact_saved", False),
                "task2_artifact_saved": round_flags.get(2, {}).get("artifact_saved", False),
                "task1_gate_completed": round_flags.get(1, {}).get("gate_completed", False),
                "task2_gate_completed": round_flags.get(2, {}).get("gate_completed", False),
                "task1_posttask_saved": 1 in posttask_rounds,
                "task2_posttask_saved": 2 in posttask_rounds,
            }
        )

    return {"count": len(items), "items": items}


@router.get("/participants/{participant_id}")
def get_participant_detail(participant_id: str, db: Session = Depends(get_db)):
    participant = (
        db.query(Participant)
        .filter(Participant.participant_id == participant_id)
        .first()
    )
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    baseline = (
        db.query(BaselineResponse)
        .filter(BaselineResponse.participant_id == participant_id)
        .first()
    )
    task_sessions = (
        db.query(TaskSession)
        .filter(TaskSession.participant_id == participant_id)
        .order_by(TaskSession.task_round.asc(), TaskSession.created_at.asc())
        .all()
    )
    post_tasks = (
        db.query(PostTaskResponse)
        .filter(PostTaskResponse.participant_id == participant_id)
        .order_by(PostTaskResponse.task_round.asc(), PostTaskResponse.created_at.asc())
        .all()
    )

    return {
        "participant": _serialize_participant(participant),
        "baseline_response": _serialize_baseline(baseline) if baseline else None,
        "task_sessions": [_serialize_task_session(session) for session in task_sessions],
        "post_task_responses": [_serialize_post_task(response) for response in post_tasks],
    }


def _serialize_participant(participant: Participant) -> dict[str, Any]:
    return {
        "participant_id": participant.participant_id,
        "condition_id": participant.condition_id,
        "study_mode": participant.study_mode or "main",
        "provocateur_flag": participant.provocateur_flag,
        "friction_flag": participant.friction_flag,
        "task_order": participant.task_order,
        "stratum": participant.stratum,
        "consent_given": participant.consent_given,
        "consent_timestamp": participant.consent_timestamp,
        "current_page": participant.current_page,
        "completed": participant.completed,
        "completion_timestamp": participant.completion_timestamp,
        "created_at": participant.created_at,
        "updated_at": participant.updated_at,
    }


def _serialize_baseline(response: BaselineResponse) -> dict[str, Any]:
    return {
        "participant_id": response.participant_id,
        "responses": response.responses,
        "completion_time_seconds": response.completion_time_seconds,
        "created_at": response.created_at,
    }


def _serialize_task_session(session: TaskSession) -> dict[str, Any]:
    return {
        "task_round": session.task_round,
        "task_type": session.task_type,
        "suggestions_shown": session.suggestions_shown,
        "provocation_shown": session.provocation_shown,
        "gate_shown": session.gate_shown,
        "gate_completed": session.gate_completed,
        "gate_responses": session.gate_responses,
        "gate_dwell_time_seconds": session.gate_dwell_time_seconds,
        "final_artifact": session.final_artifact,
        "submission_timestamp": session.submission_timestamp,
        "production_dwell_time_seconds": session.production_dwell_time_seconds,
        "interaction_log": session.interaction_log,
        "created_at": session.created_at,
    }


def _serialize_post_task(response: PostTaskResponse) -> dict[str, Any]:
    return {
        "task_round": response.task_round,
        "task_type": response.task_type,
        "responses": response.responses,
        "completion_time_seconds": response.completion_time_seconds,
        "created_at": response.created_at,
    }


# ── Export endpoints ─────────────────────────────────────────


@router.get("/export/json")
def export_all_json(
    study_mode: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    """Export all data as a single JSON file."""
    p_query = db.query(Participant)
    if study_mode:
        p_query = p_query.filter(Participant.study_mode == study_mode)
    participants = p_query.order_by(Participant.created_at.asc()).all()
    pids = [p.participant_id for p in participants]

    baselines = db.query(BaselineResponse).filter(BaselineResponse.participant_id.in_(pids)).all() if pids else []
    sessions = db.query(TaskSession).filter(TaskSession.participant_id.in_(pids)).all() if pids else []
    post_tasks = db.query(PostTaskResponse).filter(PostTaskResponse.participant_id.in_(pids)).all() if pids else []

    data = {
        "exported_at": datetime.utcnow().isoformat(),
        "study_mode_filter": study_mode or "all",
        "participants": [_serialize_participant(p) for p in participants],
        "baseline_responses": [_serialize_baseline(b) for b in baselines],
        "task_sessions": [
            {"participant_id": s.participant_id, **_serialize_task_session(s)} for s in sessions
        ],
        "post_task_responses": [
            {"participant_id": r.participant_id, **_serialize_post_task(r)} for r in post_tasks
        ],
    }

    import json
    content = json.dumps(data, default=str, ensure_ascii=False, indent=2)
    mode_label = study_mode or "all"
    return StreamingResponse(
        io.BytesIO(content.encode("utf-8")),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="export_{mode_label}_{datetime.utcnow().strftime("%Y%m%d_%H%M%S")}.json"'},
    )


@router.get("/export/csv")
def export_csv(
    table: str = Query(description="Table to export: participants, baseline, sessions, posttask"),
    study_mode: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    """Export a single table as CSV."""
    # Get filtered participant IDs
    p_query = db.query(Participant)
    if study_mode:
        p_query = p_query.filter(Participant.study_mode == study_mode)
    pids = [p.participant_id for p in p_query.all()]

    output = io.StringIO()
    writer = csv.writer(output)

    if table == "participants":
        cols = [
            "participant_id", "study_mode", "condition_id", "stratum",
            "provocateur_flag", "friction_flag", "task_order",
            "consent_given", "consent_timestamp", "current_page",
            "completed", "completion_timestamp", "created_at",
        ]
        writer.writerow(cols)
        for p in p_query.order_by(Participant.created_at.asc()).all():
            writer.writerow([
                p.participant_id, p.study_mode or "main", p.condition_id, p.stratum,
                p.provocateur_flag, p.friction_flag, str(p.task_order),
                p.consent_given, p.consent_timestamp, p.current_page,
                p.completed, p.completion_timestamp, p.created_at,
            ])

    elif table == "baseline":
        cols = ["participant_id", "responses", "completion_time_seconds", "created_at"]
        writer.writerow(cols)
        rows = db.query(BaselineResponse).filter(BaselineResponse.participant_id.in_(pids)).all() if pids else []
        import json
        for b in rows:
            writer.writerow([
                b.participant_id, json.dumps(b.responses, ensure_ascii=False),
                b.completion_time_seconds, b.created_at,
            ])

    elif table == "sessions":
        cols = [
            "participant_id", "task_round", "task_type",
            "gate_shown", "gate_completed", "gate_responses", "gate_dwell_time_seconds",
            "final_artifact", "submission_timestamp", "production_dwell_time_seconds",
            "suggestions_shown", "provocation_shown", "interaction_log", "created_at",
        ]
        writer.writerow(cols)
        rows = db.query(TaskSession).filter(TaskSession.participant_id.in_(pids)).all() if pids else []
        import json
        for s in rows:
            writer.writerow([
                s.participant_id, s.task_round, s.task_type,
                s.gate_shown, s.gate_completed,
                json.dumps(s.gate_responses, ensure_ascii=False) if s.gate_responses else None,
                s.gate_dwell_time_seconds,
                s.final_artifact, s.submission_timestamp, s.production_dwell_time_seconds,
                json.dumps(s.suggestions_shown, ensure_ascii=False) if s.suggestions_shown else None,
                json.dumps(s.provocation_shown, ensure_ascii=False) if s.provocation_shown else None,
                json.dumps(s.interaction_log, ensure_ascii=False) if s.interaction_log else None,
                s.created_at,
            ])

    elif table == "posttask":
        cols = ["participant_id", "task_round", "task_type", "responses", "completion_time_seconds", "created_at"]
        writer.writerow(cols)
        rows = db.query(PostTaskResponse).filter(PostTaskResponse.participant_id.in_(pids)).all() if pids else []
        import json
        for r in rows:
            writer.writerow([
                r.participant_id, r.task_round, r.task_type,
                json.dumps(r.responses, ensure_ascii=False), r.completion_time_seconds, r.created_at,
            ])

    else:
        raise HTTPException(status_code=400, detail="Invalid table. Use: participants, baseline, sessions, posttask")

    mode_label = study_mode or "all"
    content = output.getvalue()
    return StreamingResponse(
        io.BytesIO(content.encode("utf-8-sig")),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{table}_{mode_label}_{datetime.utcnow().strftime("%Y%m%d_%H%M%S")}.csv"'},
    )
