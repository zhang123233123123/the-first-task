# Harry 实验系统修改指南

> 基于 2026-04-08 导师会议录音 + 后续补充要求，对照当前系统逐项列出修改内容。
> 每一项标注 **当前状态** → **目标状态**，确保精准修改到位。

---

## 一、界面与交互修改

### 1.1 所有条件初始界面必须一致（AI 必须被动）

- **文件**: `frontend/app/task/[round]/suggestions/page.tsx`
- **当前状态**: ✅ 已修改。AI 不再自动展示建议，用户必须主动发消息。
- **目标状态**: 6 个条件进入任务页时，左侧 AI 面板均为空白 + 聊天输入框。

### 1.2 左侧 AI 面板加入操作说明（Interface Instructions）

- **文件**: `frontend/app/task/[round]/suggestions/page.tsx`
- **当前状态**: ❌ 左侧面板仅显示 "Send a message below to get AI assistance"，no_ai 条件显示 "Write freely..."
- **目标状态**: 所有条件的左侧面板**顶部**显示统一的操作说明，类似：

```
Below you see four areas:
- Top left: AI interaction — you can ask the AI for creative help
- Bottom left: Time limit for this task
- Top right: Task instruction — read what you need to do
- Bottom right: Writing space — write your response here

You may use the AI assistant at any time by typing a message below.
```

> no_ai 条件把最后一句改为：
> "There is no AI assistant for this task. Write freely using your own ideas."

### 1.3 "Task Prompt" 改为 "Task Instruction"

- **文件**: `frontend/app/task/[round]/suggestions/page.tsx`
- **当前状态**: ❌ 代码中标签为 `"Task prompt"`
- **目标状态**: 改为 `"Task instruction"`
- **具体位置**: 约第 562 行 `<p className="text-sm font-semibold ...">Task prompt</p>`

### 1.4 隐喻任务加解释文案和示例

- **文件**: `frontend/app/task/[round]/suggestions/page.tsx`
- **当前状态**: ❌ 隐喻任务只显示 "Complete the metaphor as creatively as possible."，参与者可能不理解填空格式
- **目标状态**: 增加解释：

```
Below you see a sentence with two gaps. Your task is to fill the two gaps
with words or short sentences to create a creative metaphor.

Example: "Memory is like a bucket because it is deep, but it can be empty."

Now complete the following metaphor as creatively as possible:
```

### 1.5 挑衅内容（Risk/Alternative/Question）加上下文解释

- **文件**: `frontend/app/task/[round]/suggestions/page.tsx` → `renderMessage` 函数中 provocation 渲染部分
- **当前状态**: ❌ 直接显示 "Risk" / "Alternative" / "Question" 三个标签，参与者不理解含义
- **目标状态**: 在 provocation 气泡顶部加一句说明：

```
The AI has reviewed your request and offers a different perspective:
```

同时将标签改为更易懂的表述：
| 当前 | 改为 |
|------|------|
| Risk | Potential weakness |
| Alternative | A different direction |
| Question | Something to consider |

### 1.6 挑衅内容必须与实际任务相关

- **文件**: `backend/services/deepseek.py` → `get_general_provocation()` 和 `get_followup_provocation()`
- **当前状态**: ⚠️ prompt 已包含 task_type 和 prompt_text，但导师指出生成内容有时与任务无关（如 "dark and fatalistic" 与 mirror/clocktower/stranger 无关）
- **目标状态**: 加强 system prompt，明确要求：

```
Your criticism must be DIRECTLY related to the specific task constraints
(the given words or metaphor prompt). Do NOT assume the participant's
creative direction — only comment on common pitfalls specific to these
particular words/prompt.
```

---

## 二、问卷修改

### 2.1 SMI 问卷每题加 "During the task"

- **文件**: `frontend/app/task/[round]/survey/page.tsx`
- **当前状态**: ❌ 题目如 "I was aware of my own thinking." 缺少时间限定
- **目标状态**: 所有 20 道 SMI 题目前加 "During the task, "

| 当前 | 改为 |
|------|------|
| "I was aware of my own thinking." | "During the task, I was aware of my own thinking." |
| "I was aware of which thinking technique or strategy to use and when to use it." | "During the task, I was aware of which thinking technique or strategy to use and when to use it." |
| ... | （所有 20 题同理） |

- **描述文字也要改**: 当前 "Tell how you thought during the task you just completed" → 改为 "Answer the questions below in relation to the task you just completed."

### 2.2 Locus of Control 改用 IE-4 量表（4 题）

- **文件**: `frontend/app/baseline/page.tsx`
- **当前状态**: ❌ 当前有 6 道自编 LOC 题（loc_effort, loc_welldo, loc_influence, loc_outside_control, loc_choices, loc_change_approach）+ 1 道注意力检查
- **目标状态**: 替换为 IE-4 标准量表（Nießen et al., 2022, PLOS ONE），共 4 题：

**IE-4 原始题目（1-5 Likert: Does not apply at all → Applies fully）：**

| ID | 维度 | 题目 |
|----|------|------|
| `ie4_int1` | Internal | "I'm my own boss." |
| `ie4_int2` | Internal | "If I work hard, I will succeed." |
| `ie4_ext1` | External | "Whether at work or in my private life: What I do is mainly determined by others." |
| `ie4_ext2` | External | "Fate often gets in the way of my plans." |

> 量表为 **5 点**（1 = Does not apply at all, 5 = Applies fully），参考原始论文。
> 注意力检查题 `attn_baseline` 需保留，但移到其他 block。

**参考文献**: Nießen, D., et al. (2022). The Internal–External Locus of Control Short Scale–4 (IE-4). *PLOS ONE, 17*(7), e0271289.

### 2.3 NASA-TLX 认知负荷问卷补全至 6 维度

- **文件**: `frontend/app/task/[round]/survey/page.tsx`
- **当前状态**: ❌ 只有 3 题（load_effort, load_think, load_demanding），缺少 3 个维度
- **目标状态**: 使用 NASA-TLX 原始 6 维度：

| ID | 维度 | 题目 | 量表 |
|----|------|------|------|
| `tlx_mental` | Mental Demand | "How mentally demanding was the task?" | 7-point: Very low → Very high |
| `tlx_temporal` | Temporal Demand | "How hurried or rushed was the pace of the task?" | 7-point: Very low → Very high |
| `tlx_performance` | Performance | "How successful were you in accomplishing what you were asked to do?" | 7-point: Perfect → Failure (反向) |
| `tlx_effort` | Effort | "How hard did you have to work to accomplish your level of performance?" | 7-point: Very low → Very high |
| `tlx_frustration` | Frustration | "How insecure, discouraged, irritated, stressed, and annoyed were you?" | 7-point: Very low → Very high |
| `tlx_physical` | Physical Demand | "How physically demanding was the task?" | 7-point: Very low → Very high |

> 注：Physical Demand 对于创意写作任务可能不适用，可考虑保留或删除。与导师确认。
> 量表锚点与标准 SMI 不同，使用 "Very low → Very high"。

### 2.4 Manipulation Check 修改（主实验 vs Pilot）

#### 主实验：去掉 manipulation check

- **文件**: `frontend/app/task/[round]/survey/page.tsx`
- **当前状态**: ❌ post-task 问卷中包含 PROV（4题）和 FRICTION（4题）manipulation check
- **目标状态**: 主实验中**删除** PROV 和 FRICTION 两个 block

#### Pilot study：使用导师指定的 2 道题

- **需新建 pilot 流程或配置开关**
- 使用以下两道题（1-7 Likert: Strongly disagree → Strongly agree）：

| ID | 检验 | 题目 |
|----|------|------|
| `mc_friction` | Friction | "The system made me pause and reflect before proceeding." |
| `mc_provocation` | Provocation | "The AI challenged my thinking rather than simply helping me complete the task." |

### 2.5 加 Attention Check 题（每个任务后各 1 题）

- **文件**: `frontend/app/task/[round]/survey/page.tsx`
- **当前状态**: ❌ post-task 问卷中无 attention check（仅 baseline 有 1 题）
- **目标状态**: 每个任务的 post-task 问卷中加 1 题，根据任务类型动态生成：

**Story 任务**:
```
One of the three words given in the task was:
○ mirror  ○ tree  ○ house  ○ car
（正确答案根据实际 cue_words 动态确定）
```

**Metaphor 任务**:
```
The metaphor prompt was about:
○ time  ○ space  ○ work  ○ health
（正确答案根据实际 metaphor_prompt 动态确定）
```

### 2.6 问卷顺序重排

#### Baseline 问卷（实验前）

| 顺序 | Block | 内容 | 题数 |
|------|-------|------|------|
| 1 | Demographics | 人口统计 | 7 |
| 2 | Need for Cognition | 认知需求 | 6 |
| 3 | IE-4 Locus of Control | 控制点 | 4 |
| 4 | Prior AI Use | AI 使用经验 | 2 |
| 5 | Creative Writing Experience | 写作经验 | 2 |
| 6 | Creative Self-Efficacy (pre) | 创造自我效能 | 4 |
| — | Attention Check | 注意力检查 | 1 |

> 导师要求：控制变量放前面。Demographics 移到最前面，trait 量表紧跟。
> Attention check 可嵌入任意 block 中。

#### Post-task 问卷（每个任务后）

**主实验顺序**：

| 顺序 | Block | 内容 | 题数 |
|------|-------|------|------|
| 1 | Attention Check | 任务记忆检查 | 1 |
| 2 | NASA-TLX | 认知负荷（控制变量） | 5-6 |
| 3 | SMI Awareness | 元认知-觉察 | 5 |
| 4 | SMI Cognitive Strategy | 元认知-策略 | 5 |
| 5 | SMI Planning | 元认知-计划 | 5 |
| 6 | SMI Self-Checking | 元认知-自查 | 5 |
| 7 | CSE (post) | 创造自我效能 | 3 |
| 8 | Ownership | 所属感 | 4 |

> 导师要求：控制变量（NASA-TLX）放前面，DV（CSE、Ownership）放后面。
> 主实验中**不包含** manipulation check。

---

## 三、Pilot Study 设计

### 3.1 Pilot 条件设计

| 条件 | 人数 | AI | Friction | Provocation |
|------|------|----|----------|-------------|
| Simple AI（对照） | 15 | ✅ | ❌ | ❌ |
| Simple AI + Friction | 15 | ✅ | ✅ | ❌ |
| Simple AI + Provocation | 15 | ✅ | ❌ | ✅ |
| **合计** | **45** | | | |

### 3.2 Pilot 流程

```
Consent → Demographics → Task 1 → Task 2 → Manipulation Check (2题) → Complete
```

- 无 baseline 量表（NFC、LOC 等均不需要）
- 无 post-task 问卷（SMI、CSE 等均不需要）
- 只收集：demographics + 两个创意任务 + 2 道 manipulation check
- Manipulation check 在两个任务都完成后一起问

### 3.3 Pilot 分析

- 比较 Friction 组 vs 对照组在 `mc_friction` 上的得分 → t-test
- 比较 Provocation 组 vs 对照组在 `mc_provocation` 上的得分 → t-test
- 如果 p < .05 且方向正确 → manipulation 有效 → 进入主实验

---

## 四、文案润色

### 4.1 所有参与者可见文案需 AI 润色

- **涉及文件**: 所有 `page.tsx` 中的说明文字
- **当前状态**: ❌ 部分文案语法不佳（如 "Tell how you thought during the task you just completed"）
- **目标状态**: 所有英文文案过一遍 AI 润色，确保语法正确、表达清晰

需要润色的关键位置：
| 文件 | 需润色内容 |
|------|-----------|
| `baseline/page.tsx` | 所有 block 的 description 文字 |
| `task/[round]/survey/page.tsx` | 所有 block 的 description 文字、SMI 描述 |
| `task/[round]/suggestions/page.tsx` | 界面操作说明、任务说明、空状态提示 |
| `task/[round]/brief/page.tsx` | 任务简介页文案 |
| `instructions/page.tsx` | 实验说明页文案 |
| `consent/page.tsx` | 知情同意书文案 |

---

## 五、Ownership 与 Creative Self-Efficacy 问卷

### 5.1 当前状态

- **CSE (baseline)**: 4 题自编，用于分层
- **CSE (post-task)**: 3 题自编
- **Ownership**: 4 题自编

### 5.2 待确认

- ⚠️ 导师要求使用**验证过的问卷**（validated questionnaires）
- 需要找到对应文献：
  - Ownership: 目前无经典量表，需与导师确认是否接受自编题目
  - CSE: 可参考 Tierney & Farmer (2002) Creative Self-Efficacy 量表
- **Action**: 找到文献后发给导师确认

---

## 六、部署与测试

### 6.1 内部测试（团队 5 人）

- **当前状态**: ❌ 未进行
- **目标状态**: Harry、Oliver、Rina、Sally、导师各跑一遍完整流程
- **测试地址**: http://47.106.117.27:3000
- **Debug 页面**: http://47.106.117.27:3000/debug/conditions?key=chi2025debug

### 6.2 服务器部署

- **当前状态**: ✅ 已部署到阿里云 47.106.117.27
- 前端: port 3000 (systemd: chi-frontend)
- 后端: port 8000 (systemd: chi-backend)

---

## 修改优先级

| 优先级 | 任务 | 原因 |
|--------|------|------|
| P0 | 1.2 操作说明 + 1.3 标签改名 + 1.4 隐喻解释 | 界面基本可用性 |
| P0 | 2.1 SMI 加 "During the task" | 问卷效度 |
| P0 | 2.2 IE-4 替换 LOC | 导师明确要求 |
| P0 | 2.3 NASA-TLX 补全 | 问卷完整性 |
| P1 | 2.4 主实验去掉 manipulation check | 实验设计 |
| P1 | 2.5 Attention check | 数据质量 |
| P1 | 2.6 问卷顺序重排 | 导师明确要求 |
| P1 | 1.5 挑衅标签改名 + 1.6 挑衅内容改进 | 参与者理解 |
| P2 | 三、Pilot study 设计 | 需先完成 P0/P1 |
| P2 | 四、文案润色 | 可最后统一处理 |
| P2 | 五、问卷文献确认 | 等导师反馈 |
| P3 | 六、内部测试 | 所有修改完成后 |
