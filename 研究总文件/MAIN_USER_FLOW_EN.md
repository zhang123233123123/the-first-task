# Main Study: Complete User Flow

> This document describes every step of the experience for a main study participant, from entry to completion, including all displayed text, questions to answer, and system behaviors.

---

## Flow Overview

```
Enter / → Informed Consent → Instructions Page → Baseline Questionnaire (6 blocks) → Task 1 Brief → Task 1 Writing → Task 1 Post-test (8 blocks) → Task 2 Brief → Task 2 Writing → Task 2 Post-test (8 blocks) → Completion Page
```

**Total duration**: Approximately 40–50 minutes
**Condition assignment**: CSE-stratified minimization randomization into one of 6 conditions
**Task order**: Counterbalanced within condition (story→metaphor or metaphor→story)

---

## Step 1: Informed Consent

**Page**: `/consent` (`/` automatically redirects to this page)

### What the User Sees

**Label**: Research Study
**Title**: Creativity & AI Study
**Subtitle**: Welcome! This study explores how people engage creatively when working alongside AI. We are glad you are here.

**Information cards (3)**:
- ⏱ About 20-30 minutes — Depends on your pace
- 🔒 Anonymous — Your data is private
- 👥 2 tasks + questionnaires — Creative writing exercises and brief surveys

**Informed consent body text**:

> 1. This study is conducted as part of academic research on human–AI creativity. Your participation is entirely voluntary, and you may withdraw at any time without penalty.
>
> 2. You will complete two short creative writing tasks, with possible AI assistance, and answer related questionnaires about your background and experience. The study involves no deception or risk beyond everyday computer use.
>
> 3. All responses are anonymous. No personally identifying information will be collected or shared. Data will be used solely for academic research purposes.
>
> 4. By continuing, you confirm that you are 18 years of age or older and agree to participate.
>
> 5. Please note that responses may be reviewed for data quality, completeness, and response patterns. Submissions showing incomplete or inattentive effort may be excluded from analysis and may not be eligible for compensation where applicable.

**Checkbox**: ☐ I have read and understood the information above, and I agree to participate voluntarily.

**Button**: 「Begin the study」(clickable after checkbox is checked)

### System Behavior
1. Create participant (`study_mode: "main"`)
2. **Do not assign condition** at this point (wait until baseline CSE score is computed)
3. Record informed consent
4. Redirect to `/instructions`

---

## Step 2: Instructions Page

**Page**: `/instructions`

### What the User Sees

**Title**: How this works
**Subtitle**: Here is what to expect.

**Four step cards**:

| # | Title | Description |
|---|------|------|
| 1 | Two creative tasks | You will complete two short creative writing tasks: one story task and one metaphor task. |
| 2 | Questionnaires | The study also includes background questions before the tasks and a short questionnaire after each task. |
| 3 | AI suggestions | Depending on your assigned condition, the system may offer AI-generated ideas or feedback. You do not need to type any prompts to begin. |
| 4 | Your own voice | You decide what to keep, adapt, or ignore. The final response is always yours. |

**Bottom note**: First, you will complete a background questionnaire. After each task, you will answer a short questionnaire about your experience.

**Button**: 「Got it — start」

### System Behavior
- Redirect to `/baseline`

---

## Step 3: Baseline Questionnaire

**Page**: `/baseline`
**6 blocks total**, presented one at a time; all items in each block must be answered before proceeding to the next.

---

### Block 1/6: Background Information (Demographics)

**Instructions**: The following questions are for research background purposes only.

**6 items, all dropdown selections**:

| # | Key | Item | Options |
|---|-----|------|------|
| 1 | demo_age | What is your age? | 18-24 · 25-34 · 35-44 · 45-54 · 55-64 · 65 or older · Prefer not to say |
| 2 | demo_gender | What is your gender? | Female · Male · Prefer not to say |
| 3 | demo_education | What is your highest level of completed education? | Less than high school · High school or equivalent · Some college · Associate degree · Bachelor's degree · Master's degree · Doctoral or professional degree · Prefer not to say |
| 4 | demo_occupation | What is your current occupation or academic status? | Full-time employed · Part-time employed · Self-employed · Undergraduate student · Graduate student · Unemployed or seeking work · Homemaker or caregiver · Retired · Other · Prefer not to say |
| 5 | demo_english | What is your English proficiency level? | Beginner · Proficient · Advanced · Native speaker · Prefer not to say |
| 6 | demo_prior_ai_study | Have you previously participated in studies involving generative AI? | Yes · No · Not sure |

---

### Block 2/6: Need for Cognition

**Instructions**: Please indicate how well each statement describes you.

**6 items, 7-point Likert scale (1–7, no endpoint labels)**:

| # | Key | Item |
|---|-----|------|
| 1 | nfc_prefer | I prefer tasks that require careful thinking. |
| 2 | nfc_enjoy | I enjoy working through complex problems. |
| 3 | nfc_deep | I would rather think deeply about an issue than rely on a quick answer. |
| 4 | nfc_satisfaction | I find satisfaction in effortful thinking. |
| 5 | nfc_challenge | I like situations that require me to evaluate alternatives carefully. |
| 6 | nfc_prefer_challenge | I prefer tasks that challenge the way I think. |

---

### Block 3/6: Personal Beliefs (IE-4 Locus of Control)

**Instructions**: Please indicate how well each statement applies to you.

**5 items (including 1 attention check), 5-point Likert scale**:
- 1 = Does not apply at all → 5 = Applies fully

| # | Key | Item | Note |
|---|-----|------|------|
| 1 | ie4_int1 | I'm my own boss. | Internal |
| 2 | ie4_int2 | If I work hard, I will succeed. | Internal |
| 3 | ie4_ext1 | Whether at work or in my private life: what I do is mainly determined by others. | External |
| 4 | attn_baseline | This is an attention check. Please select the second option from the right. | **Attention check** (correct answer: 4) |
| 5 | ie4_ext2 | Fate often gets in the way of my plans. | External |

---

### Block 4/6: Prior AI Use (AI Usage Experience)

**Instructions**: Please rate your experience with generative AI tools (e.g. ChatGPT, Claude).

**2 items, 7-point Likert scale with endpoint labels**:

| # | Key | Item | Low end | High end |
|---|-----|------|------|------|
| 1 | ai_freq | How often do you use generative AI tools (e.g. ChatGPT, Claude)? | Never | Almost always |
| 2 | ai_expertise | How would you rate your overall expertise with generative AI tools? | Novice | Expert |

---

### Block 5/6: Creative Writing Experience

**Instructions**: Please rate your creative writing background.

**2 items, 7-point Likert scale with endpoint labels**:

| # | Key | Item | Low end | High end |
|---|-----|------|------|------|
| 1 | write_exp | How much creative writing experience do you have? | No experience | Very experienced |
| 2 | write_confidence | How confident are you in your creative writing ability? | Not at all confident | Extremely confident |

---

### Block 6/6: Creative Confidence (Trait CSE — Creative Self-Efficacy)

**Instructions**: Please indicate how strongly you agree or disagree with each statement.

**4 items, 7-point Likert scale (1–7, no endpoint labels)**:

| # | Key | Item |
|---|-----|------|
| 1 | cse_generate | Based on my current experience, I am capable of generating creative ideas in writing tasks. |
| 2 | cse_develop | Based on my current experience, I can develop an ordinary idea into something more original. |
| 3 | cse_confident | Based on my current experience, I am confident in my ability to produce imaginative written content. |
| 4 | cse_improve | Based on my current experience, I can improve a weak creative idea into a stronger one. |

### System Behavior After Baseline Submission

1. Compute CSE mean score (4 items) → "high" if ≥3.5, "low" if <3.5
2. Within that stratum, minimize-allocate condition (1 of 6; condition with fewest participants is prioritized)
3. Counterbalance task order within condition (story→metaphor or metaphor→story)
4. Return condition information, redirect to `/task/1/brief`

---

## Step 4: Task 1 Brief

**Page**: `/task/1/brief`

Content is the same as the Pilot, but supports prompts for all 6 conditions. See [PILOT_USER_FLOW.md](./PILOT_USER_FLOW.md) Step 3 for details.

**Condition prompts (6 types)**:

| Condition | Prompt text |
|------|---------|
| no_ai | Complete this task using your own ideas and creativity. No AI assistance will be provided. |
| basic_ai | An AI assistant will be available in the left panel. You can ask it for creative ideas at any time. The final response is always yours. |
| provocateur | An AI assistant will appear in the left panel. It may challenge your assumptions or ask questions about your ideas. You decide how to respond and whether to incorporate any feedback. |
| friction | As you write, you may be asked to pause briefly and reflect on your current direction before continuing. This is a normal part of the task. |
| prov_then_fric | An AI assistant may challenge your thinking, and you may also be asked to pause and reflect as you write. The final response is always yours. |
| fric_then_prov | As you write, you may be asked to pause and reflect. An AI assistant may also challenge your thinking to help you explore further. The final response is always yours. |

---

## Step 5: Task 1 Writing Workspace

**Page**: `/task/1/suggestions`

Same mechanism as the Pilot writing workspace, but supports all 6 conditions. See [PILOT_USER_FLOW.md](./PILOT_USER_FLOW.md) Step 4 for details.

**Additional condition details**:

### no_ai Condition
- Left panel title displays **"Instructions"** (not "AI Assistant")
- No chat input box
- Instruction text: "There is no AI assistant for this task. Write freely using your own ideas."

### prov_then_fric Condition (challenge first, then reflection)
- Provocateur challenge card appears on page load
- User can interact with the AI
- When writing reaches 40 characters, the Friction reflection card triggers
- The reflection card **does not** include "Which direction looks most promising?" (because provocateur is already active)
- Only 2 questions: weakness + strategy

### fric_then_prov Condition (reflection first, then challenge)
- When writing reaches 40 characters, the Friction reflection card triggers first
- The reflection card **includes** "Which direction looks most promising?" (3 questions)
- After reflection is completed, the Provocateur challenge card appears automatically

### Task Prompts

**Story Task**:

| Round | Prompt words |
|------|--------|
| Round 1 | mirror · clocktower · stranger |
| Round 2 | fog · lantern · letter |

Instructions: Write a creative story of about 4–6 sentences using all three words: [prompt words].

**Metaphor Task**:

| Round | Fill-in-the-blank sentence |
|------|--------|
| Round 1 | Time is a ______ because ______. |
| Round 2 | Memory is a ______ because ______. |

Instructions: Complete the metaphor as creatively as possible.

---

## Step 6: Task 1 Post-test Questionnaire

**Page**: `/task/1/survey`
**8 blocks total** (including attention check), presented one at a time.

**Key difference between Main Study and Pilot**: The main study includes the full 8-block post-test questionnaire after each task; the Pilot skips this step entirely.

---

### Block 0 (Optional): Attention Check

**Instructions**: Before we begin, a quick question about the task you just completed.
**Title**: Quick check

**Items are dynamically generated based on task type**:

**Story Task**:
- Item: "Which of the following words appeared in your task prompt?"
- 4 options: 1 correct prompt word + 3 distractors
- Distractor pool: river · castle · shadow · compass · whisper · candle · bridge · feather

**Metaphor Task**:
- Item: "What was the topic of your metaphor prompt?"
- 4 options: 1 correct concept (e.g., "Time") + 3 distractors
- Distractor pool: Love · Fear · Hope · Knowledge · Silence · Freedom

**Data recorded**: `attention_check_answer` (selected text) + `attention_check_correct` (true/false)

---

### Block 1: Cognitive Load (NASA-TLX)

**Instructions**: Please answer based on the task you just completed.
**Title**: Cognitive load

**5 items, 7-point Likert scale**:

| # | Key | Item | Low end | High end |
|---|-----|------|------|------|
| 1 | tlx_mental | How mentally demanding was the task? | Very low | Very high |
| 2 | tlx_temporal | How hurried or rushed was the pace of the task? | Very low | Very high |
| 3 | tlx_performance | How successful were you in accomplishing what you were asked to do? | **Perfect** | **Failure** |
| 4 | tlx_effort | How hard did you have to work to accomplish your level of performance? | Very low | Very high |
| 5 | tlx_frustration | How insecure, discouraged, irritated, stressed, and annoyed were you? | Very low | Very high |

> Note: tlx_performance is reverse-scored (low score = good performance, high score = poor performance)

---

### Block 2: SMI — Awareness (Metacognitive Awareness)

**Instructions**: Answer the questions below in relation to the task you just completed.
**Title**: Awareness

**5 items, 4-point Likert scale** (1 = Not at all → 4 = Very much so):

| # | Key | Item |
|---|-----|------|
| 1 | smi_aw1 | During the task, I was aware of my own thinking. |
| 2 | smi_aw5 | During the task, I was aware of which thinking technique or strategy to use and when to use it. |
| 3 | smi_aw9 | During the task, I was aware of the need to plan my course of action. |
| 4 | smi_aw13 | During the task, I was aware of my ongoing thinking processes. |
| 5 | smi_aw17 | During the task, I was aware of my trying to understand the task before I attempted to work on it. |

---

### Block 3: SMI — Cognitive Strategy

**Instructions**: Answer the questions below in relation to the task you just completed.
**Title**: Cognitive strategy

**5 items, 4-point Likert scale** (Not at all → Very much so):

| # | Key | Item |
|---|-----|------|
| 1 | smi_cs3 | During the task, I attempted to discover the main ideas. |
| 2 | smi_cs7 | During the task, I asked myself how the task related to what I already knew. |
| 3 | smi_cs11 | During the task, I thought through the meaning of the task before I began to work on it. |
| 4 | smi_cs15 | During the task, I used multiple thinking techniques or strategies. |
| 5 | smi_cs19 | During the task, I selected and organized relevant information to work on the task. |

---

### Block 4: SMI — Planning

**Instructions**: Answer the questions below in relation to the task you just completed.
**Title**: Planning

**5 items, 4-point Likert scale** (Not at all → Very much so):

| # | Key | Item |
|---|-----|------|
| 1 | smi_pl4 | During the task, I tried to understand the goals before I attempted to work on it. |
| 2 | smi_pl8 | During the task, I tried to determine what the task required. |
| 3 | smi_pl12 | During the task, I made sure I understood just what had to be done and how to do it. |
| 4 | smi_pl16 | During the task, I determined how to approach the task. |
| 5 | smi_pl20 | During the task, I tried to understand the task before I attempted to work on it. |

---

### Block 5: SMI — Self-checking

**Instructions**: Answer the questions below in relation to the task you just completed.
**Title**: Self-checking

**5 items, 4-point Likert scale** (Not at all → Very much so):

| # | Key | Item |
|---|-----|------|
| 1 | smi_sc2 | During the task, I checked my work while I was doing it. |
| 2 | smi_sc6 | During the task, I corrected my errors. |
| 3 | smi_sc10 | During the task, I almost always knew how much of the task I had left to complete. |
| 4 | smi_sc14 | During the task, I kept track of my progress and, if necessary, I changed my techniques or strategies. |
| 5 | smi_sc18 | During the task, I checked my accuracy as I progressed through the task. |

---

### Block 6: Creative Confidence (State CSE — State Creative Self-Efficacy)

**Instructions**: Please answer based on the task you just completed.
**Title**: Creative confidence

**3 items, 7-point Likert scale (1–7, no endpoint labels)**:

| # | Key | Item |
|---|-----|------|
| 1 | cse_capable | I felt capable of producing a creative response in this task. |
| 2 | cse_improve | I felt I could improve a weak idea into something more original during this task. |
| 3 | cse_confident | I felt confident in my ability to shape the final creative outcome. |

---

### Block 7: Ownership (Creative Ownership)

**Title**: Ownership

**4 items, 7-point Likert scale (1–7, no endpoint labels)**:

**AI conditions (basic_ai / provocateur / friction / prov_then_fric / fric_then_prov)**:

| # | Key | Item |
|---|-----|------|
| 1 | own_mine | I felt that the final response was truly mine. |
| 2 | own_direct | I felt that I was directing the creative vision. |
| 3 | own_shape | I shaped the final response rather than merely cleaning up AI output. |
| 4 | own_contribute | I was able to contribute creatively rather than simply follow the AI. |

**no_ai condition (adjusted wording)**:

| # | Key | Item (no_ai version) |
|---|-----|------|
| 3 | own_shape | I shaped the final response rather than merely cleaning up the suggestions. |
| 4 | own_contribute | I was able to contribute creatively rather than simply following the instructions. |

> Note: Items 1 and 2 are identical across both versions; items 3 and 4 in the no_ai condition remove "AI"-related wording.

---

### System Behavior After Post-test Submission

- **Task 1 post-test completed** → Redirect to `/task/2/brief` (Task 2 Brief)
- **Task 2 post-test completed** → Call `completeStudy()` → Redirect to `/complete`

---

## Step 7: Task 2 Brief

**Page**: `/task/2/brief`

Same structure as the Task 1 Brief, but displays the other task type (e.g., if Task 1 was Story, Task 2 is Metaphor).

---

## Step 8: Task 2 Writing Workspace

**Page**: `/task/2/suggestions`

Same mechanism as the Task 1 writing workspace, using the Round 2 prompts.

---

## Step 9: Task 2 Post-test Questionnaire

**Page**: `/task/2/survey`

Same structure as the Task 1 post-test questionnaire (8 blocks). The attention check uses Task 2 prompt content.

---

## Step 10: Completion Page

**Page**: `/complete`

### What the User Sees

**Title**: Thank you so much

**Body text**:
> You have completed the study. Your responses have been saved and will help us better understand how people create alongside AI.

**Study Debrief**:
> **Study debrief:** This study examined whether specific interface features — designed to encourage reflection and challenge assumptions — can help people stay creatively engaged when working with AI. Your participation contributes to research on human–AI collaboration and creativity.

**Bottom**: ❤️ Your contribution matters

### System Behavior
- Automatically clear session data after 5 seconds

---

## Questionnaire Item Summary

### Baseline (Pre-test, 25 items total)

| Block | Scale | # Items | Scale type | Purpose |
|-------|------|------|---------|------|
| 1 | Demographics | 6 | Dropdown selection | Demographics |
| 2 | Need for Cognition | 6 | 7-point Likert | Control variable |
| 3 | IE-4 Locus of Control | 4+1 | 5-point Likert | Control variable + Attention check |
| 4 | Prior AI Use | 2 | 7-point Likert | Control variable |
| 5 | Creative Writing Exp | 2 | 7-point Likert | Control variable |
| 6 | Trait CSE | 4 | 7-point Likert | **Stratification allocation basis** |

### Post-task (Post-test, after each task, approximately 36 items)

| Block | Scale | # Items | Scale type | Purpose |
|-------|------|------|---------|------|
| 0 | Attention Check | 1 | 4-choice | Data quality screening |
| 1 | NASA-TLX | 5 | 7-point Likert | Control variable (cognitive load) |
| 2 | SMI Awareness | 5 | 4-point Likert | DV (metacognition) |
| 3 | SMI Cognitive Strategy | 5 | 4-point Likert | DV (metacognition) |
| 4 | SMI Planning | 5 | 4-point Likert | DV (metacognition) |
| 5 | SMI Self-checking | 5 | 4-point Likert | DV (metacognition) |
| 6 | State CSE | 3 | 7-point Likert | DV (creative self-efficacy) |
| 7 | Ownership | 4 | 7-point Likert | DV (creative ownership) |

**Total questionnaire items across the entire experiment**: 25 (baseline) + 36×2 (post-test × 2 tasks) = **97 items**

---

## Complete Behavioral Comparison Across Six Conditions

| Aspect | no_ai | basic_ai | provocateur | friction | prov_then_fric | fric_then_prov |
|------|-------|----------|-------------|----------|----------------|----------------|
| AI panel | None (displays "Instructions") | Chat suggestions | Challenge card | Chat suggestions | Challenge card + chat | Chat + challenge card |
| Challenge card | ❌ | ❌ | ✅ Appears automatically | ❌ | ✅ Appears automatically | ✅ Appears after reflection |
| Reflection card | ❌ | ❌ | ❌ | ✅ Triggered at 40 chars | ✅ Triggered at 40 chars | ✅ Triggered at 40 chars |
| Direction selection in reflection | — | — | — | ❌ | ❌ | ✅ |
| Chat input | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ownership wording | Adjusted (no AI references) | Standard | Standard | Standard | Standard | Standard |
