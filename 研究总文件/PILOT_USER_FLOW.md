# Pilot 实验用户完整流程

> 本文档描述一个 Pilot 参与者从进入到完成的每一步体验，包括所有看到的文字、需要回答的问题和系统行为。

---

## 流程概览

```
进入 /pilot → 知情同意 → 人口统计 → 任务1简报 → 任务1写作 → 任务2简报 → 任务2写作 → Manipulation Check → 完成
```

**总时长**：约 15 分钟
**条件分配**：随机分配到 3 个条件之一（basic_ai / friction / provocateur）
**任务顺序**：随机分配（story → metaphor 或 metaphor → story），条件内平衡

---

## 第一步：知情同意

**页面**：`/pilot`
**进度条**：Step 1 of 2

### 用户看到的内容

**标题**：Pilot Study — Informed Consent

**说明文字**：
> This is a pilot study to test our experiment platform. You will complete two short creative writing tasks and answer a few questions. The study takes approximately 15 minutes. Your responses are anonymous and will be used for research purposes only.

**按钮**：「I agree — continue」

### 系统行为
- 无需回答问题，直接点按钮进入下一步

---

## 第二步：人口统计问卷

**页面**：`/pilot`（同一页面第二个 block）
**进度条**：Step 2 of 2

### 用户看到的内容

**标题**：Background Information

**说明文字**：
> The following questions are for research background purposes only.

### 需要回答的问题（4 题，全部为下拉选择）

| # | 题目 | 选项 |
|---|------|------|
| 1 | What is your age? | 18-24 · 25-34 · 35-44 · 45-54 · 55-64 · 65 or older · Prefer not to say |
| 2 | What is your gender? | Female · Male · Prefer not to say |
| 3 | What is your highest level of completed education? | Less than high school · High school or equivalent · Some college · Associate degree · Bachelor's degree · Master's degree · Doctoral or professional degree · Prefer not to say |
| 4 | What is your English proficiency level? | Beginner · Proficient · Advanced · Native speaker · Prefer not to say |

**按钮**：「Begin the tasks」（全部回答后可点击）

### 系统行为
1. 创建参与者（`study_mode: "pilot"`）
2. 记录知情同意
3. 提交人口统计数据作为 baseline
4. 后端随机分配条件（basic_ai / friction / provocateur，平衡分配）
5. 随机分配任务顺序（story→metaphor 或 metaphor→story）
6. 跳转到 `/task/1/brief`

---

## 第三步：任务 1 简报

**页面**：`/task/1/brief`
**进度条**：Step 1 of 16

### 用户看到的内容

**标题**：Task 1 of 2

**任务描述**（根据分配的任务类型不同）：

- **Short Story Task**："Write a creative short story of about 4–6 sentences using the prompt words provided."
- **Creative Metaphor Task**："Complete a creative metaphor as imaginatively as you can."

**信息卡片**：
- ⏱ 5 minutes — A timer will count down on screen.
- ✏️ At least 80 characters — The final response is always yours.

**条件提示**（根据分配的条件不同）：

| 条件 | 提示文字 |
|------|---------|
| **basic_ai** | An AI assistant will be available in the left panel. You can ask it for creative ideas at any time. The final response is always yours. |
| **friction** | As you write, you may be asked to pause briefly and reflect on your current direction before continuing. This is a normal part of the task. |
| **provocateur** | An AI assistant will appear in the left panel. It may challenge your assumptions or ask questions about your ideas. You decide how to respond and whether to incorporate any feedback. |

**按钮**：「Begin — start writing」

---

## 第四步：任务 1 写作工作区

**页面**：`/task/1/suggestions`
**计时**：5 分钟倒计时

### 页面布局

左右两栏：
- **左上**：AI 面板（或任务说明）
- **左下**：倒计时器
- **右上**：任务题目
- **右下**：写作区域

---

### 右上：任务题目

**如果是 Story Task**：

> **Short Story Task**
>
> 提示词显示为标签：`mirror` `clocktower` `stranger`（第 1 轮）
>
> Write a creative story of about 4–6 sentences using all three words: mirror, clocktower, stranger.

**如果是 Metaphor Task**：

> **Creative Metaphor Task**
>
> Below is a sentence with two blanks. Your task is to fill in both blanks with words or short phrases to create a creative metaphor.
>
> Example: Memory is a **bucket** because **it can be deep, yet sometimes comes up empty**.
>
> Now, complete the following metaphor as creatively as possible:
>
> **Time is a ______ because ______.** （第 1 轮）

---

### 左上：AI 面板（三个条件表现不同）

#### 条件 A：basic_ai

- 显示 **"AI Assistant"** 标题
- 用户可以随时在底部输入框发送消息
- AI 回复以聊天气泡显示（建议性的、不直接给答案）
- 用户完全自主决定是否采纳

#### 条件 B：friction

- 显示 **"AI Assistant"** 标题
- 用户可以发消息获取建议
- **当用户已输入 ≥40 个字符时，自动弹出反思卡片**（见下方"Friction 反思卡片"）
- 反思卡片完成前，写作区域被锁定
- 完成后恢复写作

#### 条件 C：provocateur

- 显示 **"AI Assistant"** 标题
- 页面加载时，AI 自动生成一张**挑战卡片**（见下方"Provocateur 挑战卡片"）
- 用户可以在输入框回复，AI 会继续生成新的挑战卡片
- 用户决定是否采纳

---

### Provocateur 挑战卡片格式

每张卡片包含三部分：

> **The AI offers a different perspective:**
>
> ⚠️ **POTENTIAL WEAKNESS:** [指出一个常见陷阱或 cliché]
>
> 💡 **A DIFFERENT DIRECTION:** [暗示一个未被探索的角度]
>
> ❓ *SOMETHING TO CONSIDER: [一个推动深层思考的开放性问题]*

用户可以在输入框中回复，AI 会根据回复生成新的挑战卡片。

---

### Friction 反思卡片

**触发条件**：用户写作内容达到 40 个字符时自动出现，每个任务只触发一次。

**标题**：Take a moment — Reflect on your current direction before continuing.

**问题 1**："What is the main problem in your current direction?"（Story）/ "What is the main weakness in your current approach?"（Metaphor）

选项（AI 个性化生成，默认选项如下）：
- Too generic
- Too predictable
- Emotionally flat
- Inconsistent
- Too similar to common AI output
- Other

**问题 2**："What is your next step?"（Story）/ "What is your revision strategy?"（Metaphor）

选项（AI 个性化生成，默认选项如下）：
- Combine ideas
- Invert the assumption
- Add a constraint
- Change point of view
- Deepen the conflict
- Other

**按钮**：「Continue writing」（两个问题都选了之后可点击）

完成后写作区恢复，用户继续写作。

---

### 右下：写作区域

- **输入框占位符**：
  - Story："Write your story here…"
  - Metaphor："Write your metaphor response here…"
- **字符计数**："X / 80+ characters"
- **提交条件**：≥80 个字符 或 时间到
- **按钮**：「Submit and continue」（正常） / 「Time is up — submit now」（计时结束）

### 左下：倒计时器

- 大字体显示 `MM:SS`
- 归零后变红并显示："Time is up — please submit your current response."

---

## 第五步：任务 2 简报

**页面**：`/task/2/brief`
**进度条**：Step 9 of 16

与任务 1 简报结构相同，但显示另一种任务类型：
- 如果任务 1 是 Story，则任务 2 是 Metaphor，反之亦然

任务 2 使用不同的题目：
- **Story 第 2 轮**：提示词 `fog` `lantern` `letter`
- **Metaphor 第 2 轮**："Memory is a ______ because ______."

条件提示与任务 1 相同（同一个参与者全程使用同一个条件）。

---

## 第六步：任务 2 写作工作区

**页面**：`/task/2/suggestions`

与任务 1 写作工作区完全相同的机制，但使用不同的题目。

提交后，**Pilot 模式跳过 post-task 问卷**，直接进入 manipulation check。

---

## 第七步：Manipulation Check

**页面**：`/pilot/check`
**进度条**：Step 5 of 5（Pilot — final questions）

### 用户看到的内容

**标题**：About your experience

**说明文字**：
> Please reflect on the two tasks you just completed and indicate how strongly you agree or disagree with each statement.

### 需要回答的问题（2 题，7 点 Likert 量表）

| # | Key | 题目 | 量表 |
|---|-----|------|------|
| 1 | mc_friction | The system made me pause and reflect before proceeding. | 1 Strongly disagree → 7 Strongly agree |
| 2 | mc_provocation | The AI challenged my thinking rather than simply helping me complete the task. | 1 Strongly disagree → 7 Strongly agree |

**按钮**：「Submit and finish」

### 系统行为
1. 保存为 `post_task_responses` 表，`task_round=0`，`task_type="pilot_check"`
2. 标记参与者为 `completed`
3. 跳转到完成页

---

## 第八步：完成页

**页面**：`/pilot/complete`

### 用户看到的内容

> ✅ **Pilot study complete**
>
> Thank you for participating in this pilot study. Your responses have been recorded and will help us refine the experiment.
>
> ID: [participant_id]
>
> [Start another session]（点击可重置并重新开始）

---

## 三个条件的用户体验对比

| 方面 | basic_ai | friction | provocateur |
|------|----------|----------|-------------|
| AI 面板 | 聊天式建议 | 聊天式建议 | 挑战卡片 |
| 自动干预 | 无 | 写到 40 字时弹出反思卡片 | 页面加载时自动出现挑战 |
| 写作中断 | 无 | 反思卡片完成前锁定写作区 | 无（挑战卡片不阻塞写作） |
| AI 语气 | 支持性、鼓励性 | 支持性、鼓励性 | 批判性、挑战性 |
| 用户主动性 | 用户主动提问 | 用户主动提问 + 系统强制反思 | 系统主动挑战 + 用户可回复 |

---

## 数据收集汇总

| 数据点 | 存储位置 | 说明 |
|--------|---------|------|
| Demographics（4 题） | `baseline_responses.responses` | 年龄、性别、教育、英语水平 |
| 条件分配 | `participants.condition_id` | basic_ai / friction / provocateur |
| 任务顺序 | `participants.task_order` | ["story", "metaphor"] 或反之 |
| Study mode | `participants.study_mode` | "pilot" |
| AI 建议内容 | `task_sessions.suggestions_shown` | AI 生成的建议 |
| 挑战卡片内容 | `task_sessions.provocation_shown` | Provocateur 生成的挑战 |
| Friction 反思选择 | `task_sessions.gate_responses` | 选择的 weakness 和 strategy |
| Friction 停留时间 | `task_sessions.gate_dwell_time_seconds` | 在反思卡片上花的时间 |
| 写作作品 | `task_sessions.final_artifact` | 最终提交的文本 |
| 写作用时 | `task_sessions.production_dwell_time_seconds` | 写作页面总时间 |
| 聊天交互日志 | `task_sessions.interaction_log` | 所有 AI 对话记录（带时间戳） |
| Manipulation Check | `post_task_responses`（round=0） | mc_friction + mc_provocation 评分 |

---

## Pilot 与正式实验的关键差异

| 方面 | Pilot | 正式实验 |
|------|-------|---------|
| 入口 | `/pilot` | `/consent` → `/instructions` → `/baseline` |
| Baseline 问卷 | 4 题 demographics | 25+ 题（demographics + NFC + IE-4 + AI Use + Writing Exp + CSE） |
| 条件数量 | 3（basic_ai, friction, provocateur） | 6（增加 no_ai, prov_then_fric, fric_then_prov） |
| CSE 分层 | 无（不收集 CSE） | 有（高/低 CSE 分层平衡分配） |
| Post-task 问卷 | **无** | 每个任务后 8 个 block（NASA-TLX, SMI×4, CSE, Ownership） |
| 最后环节 | 2 题 Manipulation Check | 无（attention check 嵌入后测） |
| 总时长 | ~15 分钟 | ~40-50 分钟 |
