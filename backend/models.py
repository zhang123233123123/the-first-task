from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime, Text, Float
from sqlalchemy.sql import func
from database import Base


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    participant_id = Column(String, unique=True, index=True)

    # Condition assignment
    condition_id = Column(String, nullable=True)   # provocateur / friction / prov_then_fric / fric_then_prov
    provocateur_flag = Column(Boolean, default=False)
    friction_flag = Column(Boolean, default=False)
    task_order = Column(JSON, nullable=True)        # e.g. ["story", "metaphor"] or reversed
    stratum = Column(String, nullable=True)         # "high" | "low" — assigned after baseline

    # Study type
    is_pilot = Column(Boolean, default=False)

    # Consent
    consent_given = Column(Boolean, default=False)
    consent_timestamp = Column(DateTime)

    # Study progress
    current_page = Column(String, default="consent")
    completed = Column(Boolean, default=False)
    completion_timestamp = Column(DateTime)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())


class BaselineResponse(Base):
    __tablename__ = "baseline_responses"

    id = Column(Integer, primary_key=True, index=True)
    participant_id = Column(String, index=True)
    responses = Column(JSON)            # all baseline questionnaire answers
    completion_time_seconds = Column(Float)
    created_at = Column(DateTime, server_default=func.now())


class TaskSession(Base):
    __tablename__ = "task_sessions"

    id = Column(Integer, primary_key=True, index=True)
    participant_id = Column(String, index=True)
    task_round = Column(Integer)        # 1 or 2
    task_type = Column(String)          # story / metaphor

    # Suggestions shown
    suggestions_shown = Column(JSON)
    provocation_shown = Column(JSON)

    # Friction gate
    gate_shown = Column(Boolean, default=False)
    gate_completed = Column(Boolean, default=False)
    gate_responses = Column(JSON)
    gate_dwell_time_seconds = Column(Float)

    # Production
    final_artifact = Column(Text)
    submission_timestamp = Column(DateTime)
    production_dwell_time_seconds = Column(Float)

    # Interaction log
    interaction_log = Column(JSON, default=list)

    created_at = Column(DateTime, server_default=func.now())


class PostTaskResponse(Base):
    __tablename__ = "post_task_responses"

    id = Column(Integer, primary_key=True, index=True)
    participant_id = Column(String, index=True)
    task_round = Column(Integer)
    task_type = Column(String)
    responses = Column(JSON)
    completion_time_seconds = Column(Float)
    created_at = Column(DateTime, server_default=func.now())
