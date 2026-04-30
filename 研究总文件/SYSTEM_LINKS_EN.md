# Complete System Links & Page Reference

> Server address: `47.106.117.27`
> Frontend port: `3000` | Backend port: `8000`
> Base URL: `http://47.106.117.27:3000`
> Contact email: potteryhrr@gmail.com

---

## 1. Main Study Flow

Users visit pages in the following order; each step automatically redirects to the next upon completion.

| Step | Link | Description |
|------|------|------|
| 1. Entry | http://47.106.117.27:3000/ | Automatically redirects to the consent page |
| 2. Informed Consent | http://47.106.117.27:3000/consent | Read the study description, check the consent box to continue. Supports `?condition=xxx` parameter to specify condition (for debugging) |
| 3. Instructions | http://47.106.117.27:3000/instructions | Overview of the experiment flow: 2 tasks + questionnaires |
| 4. Tutorial | http://47.106.117.27:3000/tutorial | 6-step guided workspace walkthrough (highlight regions + floating tooltip cards) |
| 5. Baseline Questionnaire | http://47.106.117.27:3000/baseline | 6 blocks: Demographics → NFC → IE-4 (with attention check) → AI Use → Writing Exp → CSE |
| 6. Task 1 Brief | http://47.106.117.27:3000/task/1/brief | Displays task type (story/metaphor) and condition-specific hints |
| 7. Task 1 Workspace | http://47.106.117.27:3000/task/1/suggestions | 5-minute timed writing with AI panel (varies by condition). Logs `task_begin` and `task_submit` timestamps |
| 8. Task 1 Post-test | http://47.106.117.27:3000/task/1/survey | SMI (4 blocks, with attention check) → CSE → NASA-TLX → Ownership |
| 9. Transition | http://47.106.117.27:3000/transition | "Task 1 complete" prompt, click button to start Task 2 |
| 10. Task 2 Brief | http://47.106.117.27:3000/task/2/brief | Instructions for the second task |
| 11. Task 2 Workspace | http://47.106.117.27:3000/task/2/suggestions | Same as Task 1 but with different prompts |
| 12. Task 2 Post-test | http://47.106.117.27:3000/task/2/survey | Same as Task 1 post-test |
| 13. Completion Page | http://47.106.117.27:3000/complete | Thank you + optional feedback box + contact email; user clicks to finish |

### Main Study Conditions (6 types)

| Condition ID | Description |
|---------|------|
| `no_ai` | No AI assistance, writing by hand only |
| `basic_ai` | Basic AI suggestions, chat-style interaction |
| `provocateur` | AI challenges thinking (weakness → alternative direction → reflective question) |
| `friction` | Automatic pause for reflection during writing (triggered at ≥40 characters) |
| `prov_then_fric` | Provocation first, then reflection (combined condition) |
| `fric_then_prov` | Reflection first, then provocation (combined condition) |

### Scales (all 7-point Likert)

| Scale | Items | Source | Location |
|-------|-------|--------|----------|
| IE-4 (Locus of Control) | 4 items | Kovaleva (2012) | Baseline |
| SMI (State Metacognition) | 20 items | O'Neil & Abedi (1996) | Post-task survey |
| Post-task CSE | 3 items | Tierney & Farmer (2002) adapted | Post-task survey |
| NASA-TLX (Cognitive Load) | 3 items | Hart & Staveland (1988) | Post-task survey |
| Ownership | 4 items | Van Dyne & Pierce (2004) adapted | Post-task survey |

### Attention Checks

| Key | Location | Description |
|-----|----------|-------------|
| `attn_baseline` | Baseline questionnaire (IE-4 block) | "Please select 'Agree' (6)" |
| `attn_posttask` | Post-task survey (SMI Self-Checking block) | "Please select 'Agree' (6)", appears after each task |
| `attn_pilot` | Pilot manipulation check | "Please select 'Agree' (6)" |

---

## 2. Pilot Study Flow

Simplified flow: no baseline scales (demographics only), manipulation check + attention check after tasks.

| Step | Link | Description |
|------|------|------|
| 1. Entry | http://47.106.117.27:3000/pilot | Pilot informed consent + 4 demographics questions |
| 2. Instructions | http://47.106.117.27:3000/instructions | Overview of the experiment flow |
| 3. Tutorial | http://47.106.117.27:3000/tutorial | 6-step workspace walkthrough |
| 4. Task 1 Brief | http://47.106.117.27:3000/task/1/brief | Same as main study |
| 5. Task 1 Workspace | http://47.106.117.27:3000/task/1/suggestions | Same as main study (but only 3 conditions) |
| 6. Task 1 Post-test | http://47.106.117.27:3000/task/1/survey | Manipulation check (2 items, condition-specific) |
| 7. Transition | http://47.106.117.27:3000/transition | Transition between tasks |
| 8. Task 2 Brief | http://47.106.117.27:3000/task/2/brief | Same as main study |
| 9. Task 2 Workspace | http://47.106.117.27:3000/task/2/suggestions | Same as main study |
| 10. Task 2 Post-test | http://47.106.117.27:3000/task/2/survey | Manipulation check + Demographics (collected only in round 2) |
| 11. Manipulation Check | http://47.106.117.27:3000/pilot/check | 3 items: 2 manipulation check + 1 attention check |
| 12. Completion Page | http://47.106.117.27:3000/pilot/complete | Pilot thank-you page |

### Pilot Conditions (3 types)

| Condition ID | Description |
|---------|------|
| `basic_ai` | Basic AI suggestions |
| `friction` | Reflective pause mechanism |
| `provocateur` | AI challenges thinking |

### Pilot Retained Variables

- Controls: Demographics (age, gender, English proficiency)
- IV: Basic AI / Friction / Provocateur (3 conditions)
- DV: Creative Self-Efficacy (CSE)
- Manipulation check
- Attention check: `attn_pilot`

---

## 3. Debug / Testing Pages

| Link | Description |
|------|------|
| http://47.106.117.27:3000/debug/conditions?key=chi2026 | **Main Study Condition Launcher** — Select one of 6 conditions, skip consent/baseline, jump directly to tasks |
| http://47.106.117.27:3000/debug/pilot?key=chi2026 | **Pilot Condition Launcher** — Select one of 3 pilot conditions, enter tasks directly in pilot mode |
| http://47.106.117.27:3000/debug/data?key=chi2026 | **Data Viewer Dashboard** — Browse all participant data, filter by Mode (Main/Pilot), Condition, Completion status; expand to view baseline JSON, writing artifacts, interaction logs, post-test questionnaire raw data |

> Debug pages require a key. Append `?key=chi2026` to the URL.

---

## 4. Backend API Endpoints

Base URL: `http://47.106.117.27:8000`

### 4.1 Health Check

| Method | Path | Description |
|------|------|------|
| GET | `/health` | Service health check |

### 4.2 Participant Management (`/participants`)

| Method | Path | Description |
|------|------|------|
| POST | `/participants/init` | Create a participant. Params: `condition` (optional, for debugging), `is_pilot` (bool) |
| GET | `/participants/{id}` | Get participant info |
| POST | `/participants/{id}/consent` | Record informed consent |
| PATCH | `/participants/{id}/progress` | Update current page progress |
| POST | `/participants/{id}/complete` | Mark experiment as completed |

### 4.3 AI Suggestions (`/suggestions`)

| Method | Path | Description |
|------|------|------|
| GET | `/suggestions/prompt/{id}/{round}` | Get task prompt (does not generate AI suggestions) |
| GET | `/suggestions/{id}/{round}` | Get AI suggestions (generated on first call, cached afterward) |
| POST | `/suggestions/chat` | Chat follow-up (basic_ai returns suggestions, provocateur returns challenge cards) |
| POST | `/suggestions/prov-followup` | Generate provocateur follow-up |
| POST | `/suggestions/friction-options` | Get AI-personalized friction reflection options |

### 4.4 Data Saving (`/responses`)

| Method | Path | Description |
|------|------|------|
| POST | `/responses/baseline` | Save baseline questionnaire. Includes `pilot: bool` param for stratified assignment |
| POST | `/responses/gate-shown` | Mark friction gate as shown |
| POST | `/responses/gate` | Save friction gate reflection data |
| POST | `/responses/artifact` | Save writing artifact |
| POST | `/responses/post-task` | Save post-test questionnaire (round=0 for pilot manipulation check) |
| POST | `/responses/log-event` | Append an interaction log event (task_begin / task_submit / chat_reply etc.) |

### 4.5 Debug Data (`/debug/data`)

| Method | Path | Description |
|------|------|------|
| GET | `/debug/data/participants` | Participant list. Filter params: `q` (search ID), `condition`, `completed`, `study_mode`, `sort` |
| GET | `/debug/data/participants/{id}` | Participant detail (includes baseline, task sessions, post-task — all raw data) |

---

## 5. Data Storage

| Item | Location |
|------|------|
| Database | Server `/opt/systemdesign/backend/experiment.db` (SQLite) |
| Database tables | `participants`, `baseline_responses`, `task_sessions`, `post_task_responses` |
| Pilot data distinction | `participants.study_mode` field ("main" or "pilot") |
| AI service | DeepSeek API (configured in `/opt/systemdesign/backend/.env`) |

### Timestamp Tracking

| Event | Method | Description |
|-------|--------|-------------|
| `task_begin` | `log-event` API → `task_sessions.interaction_log` | ISO timestamp when user enters the task workspace |
| `task_submit` | `log-event` API → `task_sessions.interaction_log` | ISO timestamp when user submits, with `dwell_seconds` + `char_count` |
| `chat_reply` | `log-event` API → `task_sessions.interaction_log` | Each chat interaction logged |

---

## 6. Service Management

```bash
# SSH connection
ssh -i ~/.ssh/id_deploy root@47.106.117.27

# Service status
systemctl status chi-frontend chi-backend

# Restart services
systemctl restart chi-frontend chi-backend

# View logs
journalctl -u chi-backend -f
journalctl -u chi-frontend -f

# Project path
/opt/systemdesign/

# Frontend build
cd /opt/systemdesign/frontend && npm run build

# Backend venv
/opt/systemdesign/backend/venv/
```

---

## 7. Quick Test Links

### Pilot Testing (recommended to start with these)

- Official Pilot entry: http://47.106.117.27:3000/pilot
- Debug Pilot (skip demographics): http://47.106.117.27:3000/debug/pilot?key=chi2026

### Main Study Testing

- Official entry: http://47.106.117.27:3000/
- Debug with specific condition (skip baseline): http://47.106.117.27:3000/debug/conditions?key=chi2026
- Enter with specific condition directly (e.g. friction): http://47.106.117.27:3000/consent?condition=friction

### Data Viewing

- All data: http://47.106.117.27:3000/debug/data?key=chi2026
- Backend health check: http://47.106.117.27:8000/health
- Backend API docs (Swagger): http://47.106.117.27:8000/docs

---

*Last updated: 2026-04-30*
