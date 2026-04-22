# 正式实验（Main Study）用户完整流程

> 本文档描述一个正式实验参与者从进入到完成的每一步体验，包括所有看到的文字、需要回答的问题和系统行为。

---

## 流程概览

```
进入 / → 知情同意 → 说明页 → Baseline 问卷（6 block）→ 任务1简报 → 任务1写作 → 任务1后测（8 block）→ 任务2简报 → 任务2写作 → 任务2后测（8 block）→ 完成页
```

**总时长**：约 40–50 分钟
**条件分配**：CSE 分层最小化随机分配到 6 个条件之一
**任务顺序**：条件内平衡分配（story→metaphor 或 metaphor→story）

---

## 第一步：知情同意

**页面**：`/consent`（`/` 自动重定向到此页）

### 用户看到的内容

**标签**：Research Study
**标题**：Creativity & AI Study
**副标题**：Welcome! This study explores how people engage creatively when working alongside AI. We are glad you are here.

**信息卡片（3 个）**：
- ⏱ About 20-30 minutes — Depends on your pace
- 🔒 Anonymous — Your data is private
- 👥 2 tasks + questionnaires — Creative writing exercises and brief surveys

**知情同意正文**：

> 1. This study is conducted as part of academic research on human–AI creativity. Your participation is entirely voluntary, and you may withdraw at any time without penalty.
>
> 2. You will complete two short creative writing tasks, with possible AI assistance, and answer related questionnaires about your background and experience. The study involves no deception or risk beyond everyday computer use.
>
> 3. All responses are anonymous. No personally identifying information will be collected or shared. Data will be used solely for academic research purposes.
>
> 4. By continuing, you confirm that you are 18 years of age or older and agree to participate.
>
> 5. Please note that responses may be reviewed for data quality, completeness, and response patterns. Submissions showing incomplete or inattentive effort may be excluded from analysis and may not be eligible for compensation where applicable.

**勾选框**：☐ I have read and understood the information above, and I agree to participate voluntarily.

**按钮**：「Begin the study」（勾选后可点击）

### 系统行为
1. 创建参与者（`study_mode: "main"`）
2. 此时**不分配条件**（等 baseline CSE 评分后再分配）
3. 记录知情同意
4. 跳转到 `/instructions`

---

## 第二步：说明页

**页面**：`/instructions`

### 用户看到的内容

**标题**：How this works
**副标题**：Here is what to expect.

**四个步骤卡片**：

| # | 标题 | 说明 |
|---|------|------|
| 1 | Two creative tasks | You will complete two short creative writing tasks: one story task and one metaphor task. |
| 2 | Questionnaires | The study also includes background questions before the tasks and a short questionnaire after each task. |
| 3 | AI suggestions | Depending on your assigned condition, the system may offer AI-generated ideas or feedback. You do not need to type any prompts to begin. |
| 4 | Your own voice | You decide what to keep, adapt, or ignore. The final response is always yours. |

**底部说明**：First, you will complete a background questionnaire. After each task, you will answer a short questionnaire about your experience.

**按钮**：「Got it — start」

### 系统行为
- 跳转到 `/baseline`

---

## 第三步：Baseline 问卷

**页面**：`/baseline`
**共 6 个 block**，逐个呈现，每个 block 所有题目回答后才能进入下一个。

---

### Block 1/6：Background Information（人口统计）

**说明**：The following questions are for research background purposes only.

**6 题，全部下拉选择**：

| # | Key | 题目 | 选项 |
|---|-----|------|------|
| 1 | demo_age | What is your age? | 18-24 · 25-34 · 35-44 · 45-54 · 55-64 · 65 or older · Prefer not to say |
| 2 | demo_gender | What is your gender? | Female · Male · Prefer not to say |
| 3 | demo_education | What is your highest level of completed education? | Less than high school · High school or equivalent · Some college · Associate degree · Bachelor's degree · Master's degree · Doctoral or professional degree · Prefer not to say |
| 4 | demo_occupation | What is your current occupation or academic status? | Full-time employed · Part-time employed · Self-employed · Undergraduate student · Graduate student · Unemployed or seeking work · Homemaker or caregiver · Retired · Other · Prefer not to say |
| 5 | demo_english | What is your English proficiency level? | Beginner · Proficient · Advanced · Native speaker · Prefer not to say |
| 6 | demo_prior_ai_study | Have you previously participated in studies involving generative AI? | Yes · No · Not sure |

---

### Block 2/6：Need for Cognition（认知需求）

**说明**：Please indicate how well each statement describes you.

**6 题，7 点 Likert 量表（1–7，无端点标签）**：

| # | Key | 题目 |
|---|-----|------|
| 1 | nfc_prefer | I prefer tasks that require careful thinking. |
| 2 | nfc_enjoy | I enjoy working through complex problems. |
| 3 | nfc_deep | I would rather think deeply about an issue than rely on a quick answer. |
| 4 | nfc_satisfaction | I find satisfaction in effortful thinking. |
| 5 | nfc_challenge | I like situations that require me to evaluate alternatives carefully. |
| 6 | nfc_prefer_challenge | I prefer tasks that challenge the way I think. |

---

### Block 3/6：Personal Beliefs（IE-4 控制点）

**说明**：Please indicate how well each statement applies to you.

**5 题（含 1 题注意力检查），5 点 Likert 量表**：
- 1 = Does not apply at all → 5 = Applies fully

| # | Key | 题目 | 备注 |
|---|-----|------|------|
| 1 | ie4_int1 | I'm my own boss. | Internal |
| 2 | ie4_int2 | If I work hard, I will succeed. | Internal |
| 3 | ie4_ext1 | Whether at work or in my private life: what I do is mainly determined by others. | External |
| 4 | attn_baseline | This is an attention check. Please select the second option from the right. | **注意力检查**（正确答案：4） |
| 5 | ie4_ext2 | Fate often gets in the way of my plans. | External |

---

### Block 4/6：Prior AI Use（AI 使用经验）

**说明**：Please rate your experience with generative AI tools (e.g. ChatGPT, Claude).

**2 题，7 点 Likert 量表，有端点标签**：

| # | Key | 题目 | 低端 | 高端 |
|---|-----|------|------|------|
| 1 | ai_freq | How often do you use generative AI tools (e.g. ChatGPT, Claude)? | Never | Almost always |
| 2 | ai_expertise | How would you rate your overall expertise with generative AI tools? | Novice | Expert |

---

### Block 5/6：Creative Writing Experience（写作经验）

**说明**：Please rate your creative writing background.

**2 题，7 点 Likert 量表，有端点标签**：

| # | Key | 题目 | 低端 | 高端 |
|---|-----|------|------|------|
| 1 | write_exp | How much creative writing experience do you have? | No experience | Very experienced |
| 2 | write_confidence | How confident are you in your creative writing ability? | Not at all confident | Extremely confident |

---

### Block 6/6：Creative Confidence（Trait CSE 创意自我效能）

**说明**：Please indicate how strongly you agree or disagree with each statement.

**4 题，7 点 Likert 量表（1–7，无端点标签）**：

| # | Key | 题目 |
|---|-----|------|
| 1 | cse_generate | Based on my current experience, I am capable of generating creative ideas in writing tasks. |
| 2 | cse_develop | Based on my current experience, I can develop an ordinary idea into something more original. |
| 3 | cse_confident | Based on my current experience, I am confident in my ability to produce imaginative written content. |
| 4 | cse_improve | Based on my current experience, I can improve a weak creative idea into a stronger one. |

### Baseline 提交后的系统行为

1. 计算 CSE 平均分（4 题）→ ≥3.5 为 "high"，<3.5 为 "low"
2. 在该 stratum 内最小化分配条件（6 选 1，人数最少的条件优先）
3. 条件内平衡分配任务顺序（story→metaphor 或 metaphor→story）
4. 返回条件信息，跳转到 `/task/1/brief`

---

## 第四步：任务 1 简报

**页面**：`/task/1/brief`

内容与 Pilot 相同，但支持全部 6 个条件的提示。详见 [PILOT_USER_FLOW.md](./PILOT_USER_FLOW.md) 第三步。

**条件提示（6 种）**：

| 条件 | 提示文字 |
|------|---------|
| no_ai | Complete this task using your own ideas and creativity. No AI assistance will be provided. |
| basic_ai | An AI assistant will be available in the left panel. You can ask it for creative ideas at any time. The final response is always yours. |
| provocateur | An AI assistant will appear in the left panel. It may challenge your assumptions or ask questions about your ideas. You decide how to respond and whether to incorporate any feedback. |
| friction | As you write, you may be asked to pause briefly and reflect on your current direction before continuing. This is a normal part of the task. |
| prov_then_fric | An AI assistant may challenge your thinking, and you may also be asked to pause and reflect as you write. The final response is always yours. |
| fric_then_prov | As you write, you may be asked to pause and reflect. An AI assistant may also challenge your thinking to help you explore further. The final response is always yours. |

---

## 第五步：任务 1 写作工作区

**页面**：`/task/1/suggestions`

与 Pilot 写作工作区机制相同，但支持全部 6 个条件。详见 [PILOT_USER_FLOW.md](./PILOT_USER_FLOW.md) 第四步。

**额外条件说明**：

### no_ai 条件
- 左侧面板标题显示 **"Instructions"**（不是 "AI Assistant"）
- 无聊天输入框
- 说明文字："There is no AI assistant for this task. Write freely using your own ideas."

### prov_then_fric 条件（先挑战后反思）
- Provocateur 挑战卡片在页面加载时出现
- 用户可以与 AI 互动
- 当写作达到 40 字符时，Friction 反思卡片触发
- 反思卡片**没有** "Which direction looks most promising?"（因为 provocateur 已激活）
- 只有 2 个问题：weakness + strategy

### fric_then_prov 条件（先反思后挑战）
- 当写作达到 40 字符时，Friction 反思卡片先触发
- 反思卡片**有** "Which direction looks most promising?"（3 个问题）
- 反思完成后，Provocateur 挑战卡片自动出现

### 任务题目

**Story Task**：

| 轮次 | 提示词 |
|------|--------|
| 第 1 轮 | mirror · clocktower · stranger |
| 第 2 轮 | fog · lantern · letter |

指令：Write a creative story of about 4–6 sentences using all three words: [提示词].

**Metaphor Task**：

| 轮次 | 填空句 |
|------|--------|
| 第 1 轮 | Time is a ______ because ______. |
| 第 2 轮 | Memory is a ______ because ______. |

指令：Complete the metaphor as creatively as possible.

---

## 第六步：任务 1 后测问卷

**页面**：`/task/1/survey`
**共 8 个 block**（含注意力检查），逐个呈现。

**正式实验与 Pilot 的关键区别**：正式实验在每个任务后都有完整的 8 block 后测问卷，Pilot 完全跳过此步骤。

---

### Block 0（可选）：Attention Check（注意力检查）

**说明**：Before we begin, a quick question about the task you just completed.
**标题**：Quick check

**题目根据任务类型动态生成**：

**Story Task**：
- 题目："Which of the following words appeared in your task prompt?"
- 4 个选项：1 个正确提示词 + 3 个干扰词
- 干扰词池：river · castle · shadow · compass · whisper · candle · bridge · feather

**Metaphor Task**：
- 题目："What was the topic of your metaphor prompt?"
- 4 个选项：1 个正确概念（如 "Time"）+ 3 个干扰词
- 干扰词池：Love · Fear · Hope · Knowledge · Silence · Freedom

**数据记录**：`attention_check_answer`（选择的文字）+ `attention_check_correct`（true/false）

---

### Block 1：Cognitive Load（NASA-TLX 认知负荷）

**说明**：Please answer based on the task you just completed.
**标题**：Cognitive load

**5 题，7 点 Likert 量表**：

| # | Key | 题目 | 低端 | 高端 |
|---|-----|------|------|------|
| 1 | tlx_mental | How mentally demanding was the task? | Very low | Very high |
| 2 | tlx_temporal | How hurried or rushed was the pace of the task? | Very low | Very high |
| 3 | tlx_performance | How successful were you in accomplishing what you were asked to do? | **Perfect** | **Failure** |
| 4 | tlx_effort | How hard did you have to work to accomplish your level of performance? | Very low | Very high |
| 5 | tlx_frustration | How insecure, discouraged, irritated, stressed, and annoyed were you? | Very low | Very high |

> 注：tlx_performance 是反向计分（低分=表现好，高分=表现差）

---

### Block 2：SMI — Awareness（元认知觉察）

**说明**：Answer the questions below in relation to the task you just completed.
**标题**：Awareness

**5 题，4 点 Likert 量表**（1 = Not at all → 4 = Very much so）：

| # | Key | 题目 |
|---|-----|------|
| 1 | smi_aw1 | During the task, I was aware of my own thinking. |
| 2 | smi_aw5 | During the task, I was aware of which thinking technique or strategy to use and when to use it. |
| 3 | smi_aw9 | During the task, I was aware of the need to plan my course of action. |
| 4 | smi_aw13 | During the task, I was aware of my ongoing thinking processes. |
| 5 | smi_aw17 | During the task, I was aware of my trying to understand the task before I attempted to work on it. |

---

### Block 3：SMI — Cognitive Strategy（认知策略）

**说明**：Answer the questions below in relation to the task you just completed.
**标题**：Cognitive strategy

**5 题，4 点 Likert 量表**（Not at all → Very much so）：

| # | Key | 题目 |
|---|-----|------|
| 1 | smi_cs3 | During the task, I attempted to discover the main ideas. |
| 2 | smi_cs7 | During the task, I asked myself how the task related to what I already knew. |
| 3 | smi_cs11 | During the task, I thought through the meaning of the task before I began to work on it. |
| 4 | smi_cs15 | During the task, I used multiple thinking techniques or strategies. |
| 5 | smi_cs19 | During the task, I selected and organized relevant information to work on the task. |

---

### Block 4：SMI — Planning（计划）

**说明**：Answer the questions below in relation to the task you just completed.
**标题**：Planning

**5 题，4 点 Likert 量表**（Not at all → Very much so）：

| # | Key | 题目 |
|---|-----|------|
| 1 | smi_pl4 | During the task, I tried to understand the goals before I attempted to work on it. |
| 2 | smi_pl8 | During the task, I tried to determine what the task required. |
| 3 | smi_pl12 | During the task, I made sure I understood just what had to be done and how to do it. |
| 4 | smi_pl16 | During the task, I determined how to approach the task. |
| 5 | smi_pl20 | During the task, I tried to understand the task before I attempted to work on it. |

---

### Block 5：SMI — Self-checking（自我检查）

**说明**：Answer the questions below in relation to the task you just completed.
**标题**：Self-checking

**5 题，4 点 Likert 量表**（Not at all → Very much so）：

| # | Key | 题目 |
|---|-----|------|
| 1 | smi_sc2 | During the task, I checked my work while I was doing it. |
| 2 | smi_sc6 | During the task, I corrected my errors. |
| 3 | smi_sc10 | During the task, I almost always knew how much of the task I had left to complete. |
| 4 | smi_sc14 | During the task, I kept track of my progress and, if necessary, I changed my techniques or strategies. |
| 5 | smi_sc18 | During the task, I checked my accuracy as I progressed through the task. |

---

### Block 6：Creative Confidence（State CSE 状态创意自我效能）

**说明**：Please answer based on the task you just completed.
**标题**：Creative confidence

**3 题，7 点 Likert 量表（1–7，无端点标签）**：

| # | Key | 题目 |
|---|-----|------|
| 1 | cse_capable | I felt capable of producing a creative response in this task. |
| 2 | cse_improve | I felt I could improve a weak idea into something more original during this task. |
| 3 | cse_confident | I felt confident in my ability to shape the final creative outcome. |

---

### Block 7：Ownership（创意归属感）

**标题**：Ownership

**4 题，7 点 Likert 量表（1–7，无端点标签）**：

**AI 条件（basic_ai / provocateur / friction / prov_then_fric / fric_then_prov）**：

| # | Key | 题目 |
|---|-----|------|
| 1 | own_mine | I felt that the final response was truly mine. |
| 2 | own_direct | I felt that I was directing the creative vision. |
| 3 | own_shape | I shaped the final response rather than merely cleaning up AI output. |
| 4 | own_contribute | I was able to contribute creatively rather than simply follow the AI. |

**no_ai 条件（措辞调整）**：

| # | Key | 题目（no_ai 版本） |
|---|-----|------|
| 3 | own_shape | I shaped the final response rather than merely cleaning up the suggestions. |
| 4 | own_contribute | I was able to contribute creatively rather than simply following the instructions. |

> 注：第 1、2 题两个版本相同，第 3、4 题 no_ai 条件去掉了 "AI" 相关措辞。

---

### 后测提交后的系统行为

- **任务 1 后测完成** → 跳转到 `/task/2/brief`（任务 2 简报）
- **任务 2 后测完成** → 调用 `completeStudy()` → 跳转到 `/complete`

---

## 第七步：任务 2 简报

**页面**：`/task/2/brief`

与任务 1 简报结构相同，但显示另一种任务类型（如果任务 1 是 Story，任务 2 就是 Metaphor）。

---

## 第八步：任务 2 写作工作区

**页面**：`/task/2/suggestions`

与任务 1 写作工作区机制完全相同，使用第 2 轮的题目。

---

## 第九步：任务 2 后测问卷

**页面**：`/task/2/survey`

与任务 1 后测问卷结构完全相同（8 个 block）。注意力检查使用任务 2 的题目内容。

---

## 第十步：完成页

**页面**：`/complete`

### 用户看到的内容

**标题**：Thank you so much

**正文**：
> You have completed the study. Your responses have been saved and will help us better understand how people create alongside AI.

**研究 Debrief**：
> **Study debrief:** This study examined whether specific interface features — designed to encourage reflection and challenge assumptions — can help people stay creatively engaged when working with AI. Your participation contributes to research on human–AI collaboration and creativity.

**底部**：❤️ Your contribution matters

### 系统行为
- 5 秒后自动清除 session 数据

---

## 问卷题目汇总

### Baseline（前测，共 25 题）

| Block | 量表 | 题数 | 量表类型 | 用途 |
|-------|------|------|---------|------|
| 1 | Demographics | 6 | 下拉选择 | 人口统计学 |
| 2 | Need for Cognition | 6 | 7 点 Likert | 控制变量 |
| 3 | IE-4 Locus of Control | 4+1 | 5 点 Likert | 控制变量 + 注意力检查 |
| 4 | Prior AI Use | 2 | 7 点 Likert | 控制变量 |
| 5 | Creative Writing Exp | 2 | 7 点 Likert | 控制变量 |
| 6 | Trait CSE | 4 | 7 点 Likert | **分层分配依据** |

### Post-task（后测，每个任务后，共约 36 题）

| Block | 量表 | 题数 | 量表类型 | 用途 |
|-------|------|------|---------|------|
| 0 | Attention Check | 1 | 4 选 1 | 数据质量筛选 |
| 1 | NASA-TLX | 5 | 7 点 Likert | 控制变量（认知负荷） |
| 2 | SMI Awareness | 5 | 4 点 Likert | DV（元认知） |
| 3 | SMI Cognitive Strategy | 5 | 4 点 Likert | DV（元认知） |
| 4 | SMI Planning | 5 | 4 点 Likert | DV（元认知） |
| 5 | SMI Self-checking | 5 | 4 点 Likert | DV（元认知） |
| 6 | State CSE | 3 | 7 点 Likert | DV（创意自我效能） |
| 7 | Ownership | 4 | 7 点 Likert | DV（创意归属感） |

**整个实验总问卷题数**：25（baseline）+ 36×2（后测×2 任务）= **97 题**

---

## 六个条件的完整行为对比

| 方面 | no_ai | basic_ai | provocateur | friction | prov_then_fric | fric_then_prov |
|------|-------|----------|-------------|----------|----------------|----------------|
| AI 面板 | 无（显示"Instructions"） | 聊天建议 | 挑战卡片 | 聊天建议 | 挑战卡片 + 聊天 | 聊天 + 挑战卡片 |
| 挑战卡片 | ❌ | ❌ | ✅ 自动出现 | ❌ | ✅ 自动出现 | ✅ 反思后出现 |
| 反思卡片 | ❌ | ❌ | ❌ | ✅ 40 字触发 | ✅ 40 字触发 | ✅ 40 字触发 |
| 反思选方向 | — | — | — | ❌ | ❌ | ✅ |
| 聊天输入 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ownership 措辞 | 调整（去 AI） | 标准 | 标准 | 标准 | 标准 | 标准 |
