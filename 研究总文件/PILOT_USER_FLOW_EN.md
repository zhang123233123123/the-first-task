# Pilot Study Complete User Flow

> This document describes every step of the experience for a Pilot participant from entry to completion, including all displayed text, questions to answer, and system behavior.

---

## Flow Overview

```
Enter /pilot → Informed Consent → Demographics → Task 1 Brief → Task 1 Writing → Task 2 Brief → Task 2 Writing → Manipulation Check → Complete
```

**Total duration**: Approximately 15 minutes
**Condition assignment**: Randomly assigned to one of 3 conditions (basic_ai / friction / provocateur)
**Task order**: Randomly assigned (story → metaphor or metaphor → story), balanced within conditions

---

## Step 1: Informed Consent

**Page**: `/pilot`
**Progress bar**: Step 1 of 2

### Content Shown to User

**Title**: Pilot Study — Informed Consent

**Description text**:
> This is a pilot study to test our experiment platform. You will complete two short creative writing tasks and answer a few questions. The study takes approximately 15 minutes. Your responses are anonymous and will be used for research purposes only.

**Button**: "I agree — continue"

### System Behavior
- No questions to answer; clicking the button proceeds to the next step

---

## Step 2: Demographics Questionnaire

**Page**: `/pilot` (second block on the same page)
**Progress bar**: Step 2 of 2

### Content Shown to User

**Title**: Background Information

**Description text**:
> The following questions are for research background purposes only.

### Questions to Answer (4 questions, all dropdown selections)

| # | Question | Options |
|---|------|------|
| 1 | What is your age? | 18-24 · 25-34 · 35-44 · 45-54 · 55-64 · 65 or older · Prefer not to say |
| 2 | What is your gender? | Female · Male · Prefer not to say |
| 3 | What is your highest level of completed education? | Less than high school · High school or equivalent · Some college · Associate degree · Bachelor's degree · Master's degree · Doctoral or professional degree · Prefer not to say |
| 4 | What is your English proficiency level? | Beginner · Proficient · Advanced · Native speaker · Prefer not to say |

**Button**: "Begin the tasks" (clickable after all questions are answered)

### System Behavior
1. Create participant (`study_mode: "pilot"`)
2. Record informed consent
3. Submit demographics data as baseline
4. Backend randomly assigns condition (basic_ai / friction / provocateur, balanced assignment)
5. Randomly assign task order (story→metaphor or metaphor→story)
6. Redirect to `/task/1/brief`

---

## Step 3: Task 1 Brief

**Page**: `/task/1/brief`
**Progress bar**: Step 1 of 16

### Content Shown to User

**Title**: Task 1 of 2

**Task description** (varies by assigned task type):

- **Short Story Task**: "Write a creative short story of about 4–6 sentences using the prompt words provided."
- **Creative Metaphor Task**: "Complete a creative metaphor as imaginatively as you can."

**Information cards**:
- ⏱ 5 minutes — A timer will count down on screen.
- ✏️ At least 80 characters — The final response is always yours.

**Condition-specific hints** (vary by assigned condition):

| Condition | Hint text |
|------|---------|
| **basic_ai** | An AI assistant will be available in the left panel. You can ask it for creative ideas at any time. The final response is always yours. |
| **friction** | As you write, you may be asked to pause briefly and reflect on your current direction before continuing. This is a normal part of the task. |
| **provocateur** | An AI assistant will appear in the left panel. It may challenge your assumptions or ask questions about your ideas. You decide how to respond and whether to incorporate any feedback. |

**Button**: "Begin — start writing"

---

## Step 4: Task 1 Writing Workspace

**Page**: `/task/1/suggestions`
**Timer**: 5-minute countdown

### Page Layout

Two-column layout:
- **Top-left**: AI panel (or task instructions)
- **Bottom-left**: Countdown timer
- **Top-right**: Task prompt
- **Bottom-right**: Writing area

---

### Top-right: Task Prompt

**If Story Task**:

> **Short Story Task**
>
> Prompt words displayed as tags: `mirror` `clocktower` `stranger` (Round 1)
>
> Write a creative story of about 4–6 sentences using all three words: mirror, clocktower, stranger.

**If Metaphor Task**:

> **Creative Metaphor Task**
>
> Below is a sentence with two blanks. Your task is to fill in both blanks with words or short phrases to create a creative metaphor.
>
> Example: Memory is a **bucket** because **it can be deep, yet sometimes comes up empty**.
>
> Now, complete the following metaphor as creatively as possible:
>
> **Time is a ______ because ______.** (Round 1)

---

### Top-left: AI Panel (behaves differently across three conditions)

#### Condition A: basic_ai

- Displays **"AI Assistant"** title
- Users can send messages at any time via the input box at the bottom
- AI replies are shown as chat bubbles (suggestive, not giving direct answers)
- Users have full autonomy to decide whether to adopt suggestions

#### Condition B: friction

- Displays **"AI Assistant"** title
- Users can send messages to get suggestions
- **When the user has typed ≥40 characters, a reflection card automatically pops up** (see "Friction Reflection Card" below)
- Writing area is locked until the reflection card is completed
- Writing resumes after completion

#### Condition C: provocateur

- Displays **"AI Assistant"** title
- When the page loads, AI automatically generates a **challenge card** (see "Provocateur Challenge Card" below)
- Users can reply in the input box, and AI will continue generating new challenge cards
- Users decide whether to adopt suggestions

---

### Provocateur Challenge Card Format

Each card contains three parts:

> **The AI offers a different perspective:**
>
> ⚠️ **POTENTIAL WEAKNESS:** [Points out a common pitfall or cliche]
>
> 💡 **A DIFFERENT DIRECTION:** [Suggests an unexplored angle]
>
> ❓ *SOMETHING TO CONSIDER: [An open-ended question to promote deeper thinking]*

Users can reply in the input box, and AI will generate new challenge cards based on the reply.

---

### Friction Reflection Card

**Trigger condition**: Automatically appears when the user's writing reaches 40 characters; triggers only once per task.

**Title**: Take a moment — Reflect on your current direction before continuing.

**Question 1**: "What is the main problem in your current direction?" (Story) / "What is the main weakness in your current approach?" (Metaphor)

Options (AI-personalized generation, default options as follows):
- Too generic
- Too predictable
- Emotionally flat
- Inconsistent
- Too similar to common AI output
- Other

**Question 2**: "What is your next step?" (Story) / "What is your revision strategy?" (Metaphor)

Options (AI-personalized generation, default options as follows):
- Combine ideas
- Invert the assumption
- Add a constraint
- Change point of view
- Deepen the conflict
- Other

**Button**: "Continue writing" (clickable after both questions are answered)

After completion, the writing area resumes and the user continues writing.

---

### Bottom-right: Writing Area

- **Input placeholder**:
  - Story: "Write your story here…"
  - Metaphor: "Write your metaphor response here…"
- **Character count**: "X / 80+ characters"
- **Submission conditions**: ≥80 characters or time is up
- **Button**: "Submit and continue" (normal) / "Time is up — submit now" (when timer ends)

### Bottom-left: Countdown Timer

- Large font displaying `MM:SS`
- Turns red when reaching zero and displays: "Time is up — please submit your current response."

---

## Step 5: Task 2 Brief

**Page**: `/task/2/brief`
**Progress bar**: Step 9 of 16

Same structure as Task 1 Brief, but displays the other task type:
- If Task 1 was Story, then Task 2 is Metaphor, and vice versa

Task 2 uses different prompts:
- **Story Round 2**: Prompt words `fog` `lantern` `letter`
- **Metaphor Round 2**: "Memory is a ______ because ______."

Condition-specific hints are the same as Task 1 (the same participant uses the same condition throughout).

---

## Step 6: Task 2 Writing Workspace

**Page**: `/task/2/suggestions`

Same mechanics as the Task 1 Writing Workspace, but with different prompts.

After submission, **Pilot mode skips the post-task questionnaire** and goes directly to the manipulation check.

---

## Step 7: Manipulation Check

**Page**: `/pilot/check`
**Progress bar**: Step 5 of 5 (Pilot — final questions)

### Content Shown to User

**Title**: About your experience

**Description text**:
> Please reflect on the two tasks you just completed and indicate how strongly you agree or disagree with each statement.

### Questions to Answer (2 questions, 7-point Likert scale)

| # | Key | Question | Scale |
|---|-----|------|------|
| 1 | mc_friction | The system made me pause and reflect before proceeding. | 1 Strongly disagree → 7 Strongly agree |
| 2 | mc_provocation | The AI challenged my thinking rather than simply helping me complete the task. | 1 Strongly disagree → 7 Strongly agree |

**Button**: "Submit and finish"

### System Behavior
1. Save to `post_task_responses` table, `task_round=0`, `task_type="pilot_check"`
2. Mark participant as `completed`
3. Redirect to completion page

---

## Step 8: Completion Page

**Page**: `/pilot/complete`

### Content Shown to User

> ✅ **Pilot study complete**
>
> Thank you for participating in this pilot study. Your responses have been recorded and will help us refine the experiment.
>
> ID: [participant_id]
>
> [Start another session] (click to reset and start over)

---

## User Experience Comparison Across Three Conditions

| Aspect | basic_ai | friction | provocateur |
|------|----------|----------|-------------|
| AI panel | Chat-style suggestions | Chat-style suggestions | Challenge cards |
| Automatic intervention | None | Reflection card pops up at 40 characters | Challenge appears automatically on page load |
| Writing interruption | None | Writing area locked until reflection card is completed | None (challenge cards do not block writing) |
| AI tone | Supportive, encouraging | Supportive, encouraging | Critical, challenging |
| User initiative | User asks proactively | User asks proactively + system forces reflection | System challenges proactively + user can reply |

---

## Data Collection Summary

| Data Point | Storage Location | Description |
|--------|---------|------|
| Demographics (4 questions) | `baseline_responses.responses` | Age, gender, education, English proficiency |
| Condition assignment | `participants.condition_id` | basic_ai / friction / provocateur |
| Task order | `participants.task_order` | ["story", "metaphor"] or vice versa |
| Study mode | `participants.study_mode` | "pilot" |
| AI suggestion content | `task_sessions.suggestions_shown` | AI-generated suggestions |
| Challenge card content | `task_sessions.provocation_shown` | Provocateur-generated challenges |
| Friction reflection choices | `task_sessions.gate_responses` | Selected weakness and strategy |
| Friction dwell time | `task_sessions.gate_dwell_time_seconds` | Time spent on the reflection card |
| Written work | `task_sessions.final_artifact` | Final submitted text |
| Writing duration | `task_sessions.production_dwell_time_seconds` | Total time on the writing page |
| Chat interaction log | `task_sessions.interaction_log` | All AI conversation records (with timestamps) |
| Manipulation Check | `post_task_responses` (round=0) | mc_friction + mc_provocation scores |

---

## Key Differences Between Pilot and Full Experiment

| Aspect | Pilot | Full Experiment |
|------|-------|---------|
| Entry point | `/pilot` | `/consent` → `/instructions` → `/baseline` |
| Baseline questionnaire | 4 demographics questions | 25+ questions (demographics + NFC + IE-4 + AI Use + Writing Exp + CSE) |
| Number of conditions | 3 (basic_ai, friction, provocateur) | 6 (adds no_ai, prov_then_fric, fric_then_prov) |
| CSE stratification | None (CSE not collected) | Yes (high/low CSE stratified balanced assignment) |
| Post-task questionnaire | **None** | 8 blocks after each task (NASA-TLX, SMI×4, CSE, Ownership) |
| Final section | 2 Manipulation Check questions | None (attention check embedded in post-test) |
| Total duration | ~15 minutes | ~40-50 minutes |
