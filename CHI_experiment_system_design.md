# CHI Experiment System Design: The Provocative Filter

## 1. Research Goal and Design Rationale

This project proposes a CHI-style experimental system for studying how specific system interventions can improve creativity in human-AI collaborative work. The system is motivated by a central tension in generative AI use: AI often increases productivity and lowers creative barriers, but it may also produce generic output and encourage cognitive offloading. In this context, the system is not designed as a general-purpose writing tool. It is designed as a research platform for testing whether interface and dialogue interventions can preserve and strengthen human metacognitive engagement during AI-assisted creative work.

The core research question is:

How can system interventions improve creativity in human-AI mediated work by strengthening metacognitive engagement?

The theoretical rationale comes from the metacognitive framing in the existing materials. Metacognition is treated as the primary mechanism that allows users to remain active creators rather than passive validators of AI output. In this project, two distinct pillars of metacognition are emphasized:

- Knowledge of cognition: awareness of what strategies are available, which suggestions are useful, and when personal judgment is required.
- Regulation of cognition: monitoring, evaluating, revising, and rejecting ideas in light of creative goals.

To address these two pillars, the system combines two interventions:

- Provocateur: a dialogue/content manipulation that challenges assumptions and expands the creative search space.
- Friction: an interface/process manipulation that inserts deliberate pause points before the user can proceed.

Together, these two interventions form the design concept of **the provocative filter**. The underlying logic is a challenge-and-check loop: the provocateur broadens information uptake and reframing, while friction forces reflective evaluation before acceptance. The system therefore operationalizes the following causal chain:

`system intervention -> metacognitive process -> creative outcome`


## 2. System Overview

The system is an experimental creativity-support platform for short AI-assisted writing tasks. It integrates task delivery, system-pushed AI suggestion generation, condition-specific interventions, questionnaire blocks, process logging, and final artifact collection into one controlled research flow.

The interaction model is intentionally **not** a free-form chatbot. The system uses a **system-pushed suggestions only** design: the platform presents a fixed set of AI suggestions at defined points in the workflow, and participants respond to, select from, evaluate, and revise around those suggestions. Participants do not freely prompt the model in multi-turn dialogue. This preserves experimental control, keeps the four conditions comparable, and ensures that provocateur and friction remain clean manipulations rather than being diluted by unconstrained prompting behavior.

The system includes six functional modules:

1. **Experiment Flow Module**
   Controls the overall study sequence, including consent, instructions, baseline survey, task session, post-task survey, and completion.

2. **Condition Engine**
   Randomly assigns each participant to one of four experimental conditions and controls which interventions are shown.

3. **Task Module**
   Presents the creative task and manages participant responses. The system currently supports a short story task and a creative metaphor task.

4. **AI Suggestion Module**
   Produces fixed-format creative suggestions relevant to the assigned task. Suggestions are shown in a consistent interface across conditions.

5. **Manipulation Module**
   Implements the provocateur card and the friction reflection gate according to the assigned condition.

6. **Logging and Measurement Module**
   Stores survey responses, interaction events, final creative outputs, timestamps, and condition labels for later analysis.

This system should be described as an experimental platform rather than a product prototype. Its value lies in controlled manipulation, process-sensitive observation, and defensible measurement design.


## 3. Experimental Conditions

The system uses a clean 2 x 2 design crossing two factors:

- Provocateur: absent vs present
- Friction: absent vs present

This produces four conditions:

### C1. Control: No Provocateur, No Friction

The AI provides creative suggestions only. The participant can proceed immediately without additional challenge or required reflection.

### C2. Provocateur Only

The AI provides creative suggestions, and each suggestion is accompanied by a short provocation card. No additional interface checkpoint is required.

### C3. Friction Only

The AI provides creative suggestions without provocative content. However, before proceeding, the participant must complete a brief reflection gate.

### C4. Provocateur + Friction

The AI provides creative suggestions with provocation cards, and the participant must also complete the reflection gate before proceeding.

The distinction between the two manipulations must remain explicit throughout the document:

- **Provocateur changes what the AI says.**
- **Friction changes what the user must do before moving on.**

This separation is necessary to preserve construct clarity and support clean interpretation of experimental effects.


## 4. Manipulation Design

### 4.1 Provocateur

The provocateur is a dialogue/content manipulation inspired by the literature on AI systems that challenge rather than merely assist users. Instead of simply generating a plausible idea, the AI adds a short challenge card that introduces creative tension.

Each provocation should be concise, concrete, and attached directly to an AI-generated suggestion. A standard structure is:

- **Risk**: identifies a limitation, cliche, bias, or weak assumption in the idea.
- **Alternative**: proposes a substantially different direction.
- **Question**: pushes the participant to rethink the idea more deeply.

Example structure:

- Risk: This premise is familiar and may become predictable.
- Alternative: What if the apparent fantasy element is actually a memory system rather than a living entity?
- Question: What contradiction would make this idea emotionally less obvious?

Recommended design rules:

- 30 to 60 words per provocation
- challenging but not insulting
- focused on novelty, specificity, and perspective shift
- does not rewrite the story for the participant

The provocateur is intended to influence **knowledge of cognition** by broadening the user’s perception of available strategies, assumptions, and alternatives.

### 4.2 Friction

The friction manipulation is an interface/process intervention rather than a change in conversational tone. It is designed to interrupt frictionless acceptance of system-presented AI output and trigger reflective evaluation before action.

After AI suggestions are shown, the participant cannot continue immediately. A brief structured reflection gate must be completed first.

The reflection gate should remain short and low-burden, relying mostly on structured choices rather than long-form writing. The gate must be adapted slightly to the task type, but keep the same reflective logic across both tasks.

A recommended story-task format is:

1. **Select one idea**
   Choose the most promising AI suggestion.

2. **Diagnose the weakness**
   Select or write the main problem:
   - too generic
   - too predictable
   - emotionally flat
   - inconsistent
   - too similar to common AI output
   - other

3. **Commit to a strategy**
   Select or write the next step:
   - combine ideas
   - invert the assumption
   - add a constraint
   - change point of view
   - deepen the conflict
   - other

For the metaphor task, the same logic should be preserved in a more item-focused form. Participants should:

1. select the most promising suggested metaphor direction
2. diagnose the main weakness in that direction
3. commit to a revision strategy before continuing

The Continue button becomes active only after the checkpoint is complete.

The friction manipulation is intended to influence **regulation of cognition** by slowing interaction, increasing evaluation, and preserving agency.


## 5. Participant Workflow and Page Design

The participant workflow should be written as a page-level research sequence rather than a generic user journey. Each page has both an interaction function and a measurement function. The document should therefore describe not only what participants do, but also why each page exists in the experimental logic.

### 5.1 Page 0: Consent Page

This is the participant’s entry point into the study.

Primary purpose:

- obtain informed consent
- establish that this is an AI-assisted creativity study
- set expectations about time and participation

Recommended page components:

- study title
- brief study description
- consent text
- estimated duration
- continue button gated by consent confirmation

Data captured:

- consent status
- consent timestamp
- page dwell time

### 5.2 Page 1: General Instruction Page

This page standardizes task understanding before any manipulation occurs.

Primary purpose:

- explain that the participant will complete two creativity tasks
- explain that the system will present AI suggestions
- explain that the participant should work with the provided interface rather than prompt the AI freely
- explain that some interaction steps may require brief reflection before proceeding

Recommended page components:

- overview of the study sequence
- explanation that two tasks will be completed
- explanation of system-pushed suggestions
- general instructions about submission and attention

Data captured:

- instruction page viewed
- instruction page dwell time

### 5.3 Page 2: Baseline Questionnaire

This page sequence collects all baseline variables needed for control and calibration. It may be rendered as one long page or as several sub-pages, but in the design document it should be treated as one baseline questionnaire block.

Primary purpose:

- collect control variables
- measure pre-task creative self-efficacy

Required questionnaire blocks:

- need for cognition
- locus of control
- prior AI use
- creative writing experience
- demographics
- baseline creative self-efficacy

Design requirements:

- items should be grouped into short sub-blocks to reduce fatigue
- required items should be marked clearly
- any instructional attention check should be placed here or in the first post-task block, but its placement must be specified explicitly

Data captured:

- baseline responses
- missing-item status
- completion time

### 5.4 Page 3: Randomization Logic

This is primarily a system logic step rather than a participant-facing content page, but it must still be specified in the workflow.

Primary purpose:

- assign the participant to one of the four experimental conditions
- assign task order

Required system logic:

- each participant is assigned one fixed condition for the whole study
- the same condition applies to both tasks
- task order is counterbalanced across participants

Stored values:

- `condition_id`
- `provocateur_flag`
- `friction_flag`
- `task_order`

### 5.5 Task Round 1 Page Sequence

Round 1 consists of four participant-facing pages plus one post-task questionnaire page.

#### 5.5.1 Task Round 1 Prompt Page

This page introduces the first assigned task.

If the assigned task is the story task:

- show the three cue words prominently
- explain that the participant should write a creative story of about four to six sentences using all three words

If the assigned task is the metaphor task:

- show the metaphor prompt or prompt set
- explain the expected response format

Data captured:

- task identifier
- prompt displayed
- prompt viewing time

#### 5.5.2 Task Round 1 Suggestion Page

This page presents the AI-generated suggestions that act as the system stimulus.

Primary purpose:

- expose the participant to controlled AI suggestions
- keep stimulus presentation consistent across conditions

Design requirements:

- the number of suggestions should be fixed
- suggestion layout should remain stable across conditions
- only the manipulation layers should vary by condition

For the story task, suggestions should be story directions or premise seeds.  
For the metaphor task, suggestions should be candidate reframing directions or metaphor seeds.

Data captured:

- suggestions shown
- suggestion order
- suggestions expanded or viewed

#### 5.5.3 Task Round 1 Condition-Specific Manipulation Layer

This part of the interface changes depending on condition.

Control condition:

- suggestions only
- no provocation card
- no reflection gate

Provocateur condition:

- each suggestion includes a provocation card
- the card should remain directly attached to the corresponding suggestion

Friction condition:

- no provocation card
- a reflection gate must be completed before the participant can continue

Combined condition:

- suggestions include provocation cards
- the participant must also complete the reflection gate before continuing

The order in the combined condition should be fixed:

1. view suggestion and attached provocation
2. complete reflection gate
3. continue to production

Data captured:

- provocation displayed
- provocation expanded
- gate shown
- gate completed
- gate dwell time

#### 5.5.4 Task Round 1 Production Page

This is the main creative production page.

Primary purpose:

- allow the participant to produce the story or metaphor response
- preserve access to system-presented suggestions as a reference, if the design chooses to keep them visible

Design questions that must be resolved in the final wording:

- whether suggestions remain visible during writing
- whether provocation cards remain accessible during writing
- whether the participant can revisit the gate content after passing it

Data captured:

- writing or revision activity
- time on task
- revisits to suggestion content
- final text entered before submission

#### 5.5.5 Task Round 1 Submission Page

This page confirms completion of the first task round.

Primary purpose:

- lock the final response for Round 1
- transition cleanly into the Round 1 post-task questionnaire

Data captured:

- final artifact for Round 1
- submission timestamp

### 5.6 Page 4: Post-Task Questionnaire for Round 1

This page sequence measures the participant’s immediate response to the task just completed. The wording should explicitly anchor the questionnaire to the task that has just ended.

Recommended instruction wording:

> Please answer the following questions based on the task you just completed.

Required blocks:

- knowledge of cognition
- regulation of cognition
- post-task creative self-efficacy
- cognitive load
- provocateur manipulation check
- friction manipulation check
- attention check
- optional ownership/authorship block

Data captured:

- round-specific post-task responses
- completion time

### 5.7 Task Round 2 Page Sequence

Round 2 mirrors Round 1, but uses the second task in the counterbalanced order.

Required structure:

- Task Round 2 Prompt Page
- Task Round 2 Suggestion Page
- Task Round 2 Condition-Specific Manipulation Layer
- Task Round 2 Production Page
- Task Round 2 Submission Page

Important rule:

- the participant remains in the same condition
- only the task type changes
- the post-task questionnaire must again be tied only to the second task

### 5.8 Page 5: Post-Task Questionnaire for Round 2

This page sequence repeats the same post-task questionnaire structure for the second task.

Primary purpose:

- preserve task-specific mediator and manipulation-check measurement
- avoid collapsing both task experiences into a single overall survey

Data captured:

- second round post-task responses
- completion time

### 5.9 Final Completion Page

This page ends the study.

Primary purpose:

- confirm completion
- provide debriefing if required by the protocol

Recommended page components:

- thank-you message
- completion confirmation
- debriefing text if needed

Data captured:

- completion status
- final timestamp

### 5.10 Logging and Storage

Across the full page flow, the system stores:

- condition labels
- condition factor flags
- task order
- baseline survey responses
- AI suggestions shown
- provocation display events
- friction gate responses
- interaction logs
- timestamps
- final creative artifacts
- post-task responses

### 5.11 Artifact Evaluation

Final outputs from both tasks are exported for blind human rating. Condition identity and task order must not be visible to raters.


## 6. Task Design

The study includes two complementary creativity tasks, and every participant completes both of them.

### 6.1 Task 1: Three-Word Short Story

Participants are given three cue words and asked to write a creative story of about four to six sentences using all three words.

Example prompt structure:

> Write a creative story of about five sentences using these three words: [word1], [word2], [word3].

Why this task fits:

- it is a recognized creativity task
- it is short and easy to embed into an AI-assisted interface
- it allows originality while preserving standardization through fixed cue words

This task represents semi-open generative creativity.

### 6.2 Task 2: Creative Metaphor Production

Participants are given metaphor prompts and asked to produce the most creative metaphor they can for each prompt.

Example prompt structure:

> Time is a ______ because ______.

Why this task fits:

- it captures constrained symbolic creativity
- it emphasizes reframing and semantic distance
- it is less dependent on extended composition skill than story writing

This task represents more constrained, figurative creativity and complements the story task as a second dependent-variable context.

### 6.3 Multi-Task Study Structure

The two tasks are part of the same study rather than separate alternative studies. The recommended structure is:

- each participant completes both tasks
- each participant remains in one fixed experimental condition across both tasks
- task order is counterbalanced across participants
- each task has its own AI suggestions, production phase, submission, and immediate post-task questionnaire

This design allows the study to test whether the same intervention logic generalizes across a more open-ended narrative task and a more constrained figurative-language task.


## 7. Measurement and Data Collection

The measurement strategy follows a multi-method design. The system should not rely on questionnaires alone. Instead, it combines self-report, process traces, and artifact evaluation.

### 7.1 Self-Report Measures

The questionnaire design should be written as three explicit blocks rather than a generic reference to "pre" and "post" surveys.

#### 7.1.1 Baseline Questionnaire Block

This block appears before any task begins. Its role is to capture control variables and the participant’s pre-task creative self-efficacy.

It should include:

- need for cognition
- locus of control
- prior AI use
- creative writing experience
- demographics
- baseline creative self-efficacy

Interpretive role:

- need for cognition, locus of control, prior AI use, and writing experience function mainly as controls
- baseline creative self-efficacy functions as a pre-task benchmark for later comparison

Recommended block order within the baseline questionnaire:

1. prior AI use
2. creative writing experience
3. baseline creative self-efficacy
4. need for cognition
5. locus of control
6. demographics

Recommended item counts:

- prior AI use: 4 to 6 items
- creative writing experience: 4 to 6 items
- baseline creative self-efficacy: 4 items
- need for cognition: short trait form, about 4 to 6 items if a brief version is used
- locus of control: brief form, about 4 to 6 items
- demographics: 4 to 6 items depending on protocol needs

Recommended item style:

- prior AI use and writing experience should use factual self-report items
- baseline creative self-efficacy should use confidence-oriented Likert items
- need for cognition and locus of control should use compact trait-style Likert items
- demographics should remain simple and non-intrusive

Recommended page organization:

- begin with easier factual items to reduce entry friction
- place trait scales after the participant is already engaged
- put demographics near the end of the baseline block unless ethics requirements require earlier collection

#### 7.1.2 Post-Task Questionnaire Block for Each Round

This block appears twice, once after each task round. The structure should remain the same across rounds so that both tasks can be compared consistently, but the wording should always anchor responses to the task just completed.

It should include:

- knowledge of cognition
- regulation of cognition
- post-task creative self-efficacy
- cognitive load
- provocateur manipulation check
- friction manipulation check
- attention check
- optional ownership/authorship items

The design document should explicitly state that these are **task-specific** post-task measures, not one general impression survey for the entire study.

Recommended order within each post-task questionnaire:

1. knowledge of cognition
2. regulation of cognition
3. creative self-efficacy
4. cognitive load
5. provocateur manipulation check
6. friction manipulation check
7. ownership/authorship items if included
8. attention check or recall check

Recommended rationale for this order:

- begin with mediator blocks while the task process is still fresh
- measure self-efficacy before fatigue increases
- place manipulation checks after the participant has already reflected on the task
- place attention or recall checks near the end so they do not prime earlier answers

Recommended item style across the whole block:

- use short, direct, first-person statements
- keep tense anchored to the task just completed
- avoid abstract theory language such as "metacognition" or "regulation"
- avoid double-barreled items
- use a consistent Likert response format within the same sub-block where possible

#### 7.1.3 Knowledge of Cognition Block

This block measures whether the participant understood what kinds of AI suggestions were useful, what strategies were available, and when independent judgment was required.

Design requirements:

- use a short task-adapted, state-oriented scale
- administer immediately after each task round
- phrase items in relation to the task just completed

Example measurement focus:

- awareness of useful vs unhelpful suggestions
- awareness of multiple ways to develop the task response
- recognition of where personal judgment mattered

Recommended item count:

- 4 to 6 items per task round

Recommended page placement:

- first sub-block in each post-task questionnaire

Recommended item style:

- short reflective statements in the first person
- focused on awareness, recognition, and understanding
- tied to the just-completed task rather than to AI use in general

Example item style:

- "During this task, I knew which AI suggestions were useful for my response."
- "I was aware of different ways I could develop my idea."
- "I understood which parts of the task required my own judgment."

#### 7.1.4 Regulation of Cognition Block

This block measures whether the participant monitored, evaluated, revised, or rejected AI-supported directions during the task.

Design requirements:

- treat this as a core mediator block
- use a task-adapted state questionnaire after each task round
- interpret together with process logs and reflection-gate traces

Example measurement focus:

- monitoring whether suggestions fit task goals
- deliberate evaluation before using suggestions
- strategy change when output was not good enough
- active rejection or revision of weak suggestions

Recommended item count:

- 5 to 7 items per task round

Recommended page placement:

- immediately after the knowledge of cognition block

Recommended item style:

- action-oriented first-person statements
- explicitly focused on checking, evaluating, revising, and rejecting
- phrased in terms of what the participant actually did during the task

Example item style:

- "I evaluated AI suggestions before deciding whether to use them."
- "I changed my approach when the initial direction was not strong enough."
- "I checked whether my response was becoming too generic."

#### 7.1.5 Creative Self-Efficacy Block

This block measures whether the participant still experienced themselves as capable of producing creative work rather than merely validating AI output.

Design requirements:

- include pre-task and post-task measurement
- use the same construct in baseline and post-task form
- interpret post-task scores together with baseline CSE

Optional interpretive extension:

- add a short authorship or ownership block to capture whether the participant felt the output was truly theirs

Recommended item count:

- baseline CSE: 4 items
- post-task CSE: 4 items per task round
- optional ownership/authorship: 3 items

Recommended page placement:

- after mediator blocks and before cognitive load

Recommended item style:

- confidence-focused statements
- positive, capability-oriented wording
- clearly tied to the task domain, such as story writing or metaphor generation

Example item style:

- "I was capable of producing a creative response in this task."
- "I could improve a weak idea into something more original."
- "I felt that I was directing the creative outcome."

#### 7.1.6 Cognitive Load Block

This block measures whether the participant experienced the task interaction as effortful. It is especially useful for interpreting whether friction increases reflective effort without making the task unusably burdensome.

Design requirements:

- use a post-task workload or mental-effort measure
- administer after each task
- interpret as a state variable, not a baseline trait

Recommended item count:

- short form: 1 to 3 items
- fuller form such as NASA-TLX adaptation: 4 to 6 items if the burden is acceptable

Recommended page placement:

- after CSE and before manipulation checks

Recommended item style:

- effort-oriented and immediate
- focused on workload, mental effort, and difficulty
- should capture subjective load without drifting into satisfaction or frustration-only language

Example item style:

- "This task required substantial mental effort."
- "I had to think carefully before moving forward."

#### 7.1.7 Manipulation Check Blocks

These checks must be design-specific.

Provocateur manipulation check should assess whether the AI behaved as a challenger, critic, or source of alternative perspectives rather than merely as a helper.

Friction manipulation check should assess whether the interface slowed the participant down, inserted reflective pause points, and required justification before moving on.

Design requirements:

- do not replace these with generic satisfaction items
- interpret them alongside log-based verification

Recommended item counts:

- provocateur manipulation check: 3 to 5 items
- friction manipulation check: 3 to 5 items

Recommended page placement:

- after cognitive load
- provocateur block first, then friction block, unless a condition-specific ordering argument is made

Recommended item style:

- concrete descriptions of system behavior
- avoid evaluative wording such as "good" or "helpful"
- ask what the system did, not whether the participant liked it

Example provocateur item style:

- "The AI challenged my assumptions."
- "The AI presented alternative perspectives rather than only helping me complete the task."

Example friction item style:

- "The interface made me slow down before moving on."
- "The system required me to reflect before using ideas."

#### 7.1.8 Attention and Quality Block

This block protects data quality.

Required elements:

- at least one instructional attention check in either the baseline or first post-task questionnaire
- at least one task-specific recall check

Interpretive role:

- used together with behavioral exclusion rules rather than as a standalone quality filter

Recommended item counts:

- instructional attention check: 1 item
- task-specific recall check: 1 item per round
- optional ownership/authorship: 3 items if included in the same end-of-block section

Recommended page placement:

- task-specific recall check at the end of each post-task questionnaire
- instructional attention check either in baseline or in the first post-task block, but not repeated excessively

Recommended item style:

- attention check should be explicit and unambiguous
- recall check should ask about a factual feature of the interface or interaction that the participant actually experienced
- ownership items should be short, direct, and experience-focused

Example recall check style:

- "During the task, were you required to review or justify an idea before proceeding?"
- "Which of the following best describes how the AI behaved during this task?"

### 7.2 Process Measures

Interaction logs are essential because the interventions are process-oriented. Because this study uses a system-pushed suggestions only design, the logs should focus on responses to presented suggestions rather than free prompting behavior. The system should capture at least:

- suggestions shown
- suggestion selected
- suggestion viewed or expanded
- suggestion acceptance and rejection
- story revisions
- metaphor revisions
- dwell time
- checkpoint completion
- justification responses
- time before accepting output
- number of revisits to earlier text
- amount of AI-retained text versus rewritten text

These logs support mediator measurement, manipulation verification, and integrity checks.

### 7.3 Artifact Quality

The primary creativity dependent variable should be blind human ratings of final outputs. Automated text metrics may be used only as supplementary indicators.

Recommended artifact evaluation for the story task includes:

- overall creativity
- optional rubric-based originality
- optional coherence
- optional vividness

Recommended artifact evaluation for the metaphor task includes:

- novelty
- appropriateness
- optional overall creativity
- optional figurative richness

The primary principle is that final creativity should be judged without revealing experimental condition or task order.

### 7.4 Attention and Integrity Checks

The study should include:

- one instructional manipulation check in the questionnaire block
- one task-specific recall check
- pre-registered behavioral exclusion rules

Behavioral exclusion criteria may include:

- implausibly short completion time
- straight-lining on questionnaires
- empty or nonsense submissions
- zero interaction with required interface elements


## 8. Logging Schema

The design document should specify the minimum information that must be stored for each participant:

- `participant_id`
- `condition_id`
- `provocateur_flag`
- `friction_flag`
- `task_id`
- `task_order`
- `task_round`
- `baseline_responses`
- `suggestions_shown`
- `suggestion_selected`
- `provocation_display_events`
- `reflection_gate_responses`
- `interaction_log_events`
- `final_artifact`
- `post_task_responses`
- `timestamps`

Recommended condition identifiers:

- `control`
- `provocateur`
- `friction`
- `combined`

Recommended task identifiers:

- `story_task`
- `metaphor_task`


## 9. Expected Research Contribution

This system contributes to CHI-style research in three ways.

First, it treats AI-supported creativity as a problem of **interaction design**, not just model capability. The key question is not whether AI can generate ideas, but how system design can preserve human judgment and originality.

Second, it operationalizes a theoretically grounded paired intervention. Provocateur and friction are not isolated tricks. They correspond to distinct metacognitive functions: reframing and evaluation.

Third, it uses a process-sensitive measurement package. Instead of relying only on post-task attitudes, the system captures mind, behavior, and artifact together. This makes the design more defensible for publication and more informative for understanding how AI influences creative work.


## 10. Source Integration

This unified design document is based on three existing source documents in the project folder:

- `creativity_framework.docx`: theoretical framing and metacognitive rationale
- `HYPERLINK.docx`: manipulation logic, task references, and system behavior ideas
- `How to measure variables.docx`: measurement plan, variables, surveys, logs, and evaluation strategy

Their roles should remain distinct in background work, but the final design document should read as one coherent system description rather than three separate notes.
