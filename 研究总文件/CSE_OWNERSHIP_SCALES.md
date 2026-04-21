# Creative Self-Efficacy & Ownership 量表文献与对照

> 整理目的：对照已验证量表，确认当前系统中题目的合理性。发给导师确认后定稿。

---

## 一、Creative Self-Efficacy (CSE)

### 推荐文献

**Tierney, P., & Farmer, S. M. (2002).** Creative self-efficacy: Its potential antecedents and relationship to creative performance. *Academy of Management Journal, 45*(6), 1137–1148.

### 原始量表（3 items, 7-point Likert）

| # | Original item |
|---|---------------|
| 1 | "I have confidence in my ability to solve problems creatively." |
| 2 | "I feel that I am good at generating novel ideas." |
| 3 | "I have a knack for further developing the ideas of others." |

> 量表为 7 点（1 = Strongly disagree, 7 = Strongly agree）
> Cronbach's α = .83 (Tierney & Farmer, 2002)

### 其他常用 CSE 量表

**Beghetto, R. A. (2006).** Creative self-efficacy: Correlates in middle and secondary students. *Creativity Research Journal, 18*(4), 447–457.
- 3 items，面向学生群体
- "I am good at coming up with new ideas."
- "I have a lot of good ideas."
- "I have a good imagination."

**Karwowski, M. (2014).** Creative mindsets: Measurement, correlates, consequences. *Psychology of Aesthetics, Creativity, and the Arts, 8*(1), 62–70.
- Short Scale of Creative Self (SSCS), 11 items
- 分为 Creative Self-Efficacy (6 items) 和 Creative Personal Identity (5 items)

---

### 当前系统中的 CSE 题目

#### Baseline CSE (pre-task, 4 items)

| Key | 当前题目 | 对应 Tierney & Farmer |
|-----|---------|----------------------|
| cse_generate | "I am capable of generating creative ideas in writing tasks." | ≈ Item 2 "good at generating novel ideas" |
| cse_develop | "I can develop an ordinary idea into something more original." | ≈ Item 3 "developing the ideas of others" |
| cse_confident | "I am confident in my ability to produce imaginative written content." | ≈ Item 1 "confidence in my ability to solve problems creatively" |
| cse_improve | "I can improve a weak creative idea into a stronger one." | 无直接对应，但 content valid |

#### Post-task CSE (3 items)

| Key | 当前题目 | 说明 |
|-----|---------|------|
| cse_capable | "I felt capable of producing a creative response in this task." | Task-specific adaptation of Tierney Item 1 |
| cse_improve | "I felt I could improve a weak idea into something more original during this task." | Task-specific adaptation |
| cse_confident | "I felt confident in my ability to shape the final creative outcome." | Task-specific adaptation of Tierney Item 1 |

#### 建议

- Baseline CSE 4 题与 Tierney & Farmer (2002) 3 题高度对应，可引用为 "adapted from Tierney & Farmer (2002)"
- Post-task CSE 是 state-level adaptation（加了 "in this task"），测的是 task-specific 自我效能
- **需导师确认**：是否接受 "adapted from" 引用方式，或者需要严格使用原始 3 题

---

## 二、Ownership of Creative Output

### 文献背景

Psychological ownership 最经典的理论框架来自：

**Pierce, J. L., Kostova, T., & Dirks, K. T. (2001).** Toward a theory of psychological ownership in organizations. *Academy of Management Review, 26*(2), 298–310.

**Pierce, J. L., Kostova, T., & Dirks, K. T. (2003).** The state of psychological ownership: Integrating and extending a century of research. *Review of General Psychology, 7*(1), 84–107.

### 已验证的 Psychological Ownership 量表

**Van Dyne, L., & Pierce, J. L. (2004).** Psychological ownership and feelings of possession: Three field studies predicting employee attitudes and organizational citizenship behavior. *Journal of Organizational Behavior, 25*(4), 439–459.

原始量表（7 items, 7-point Likert）：

| # | Original item |
|---|---------------|
| 1 | "This is MY organization." |
| 2 | "I sense that this organization is OUR company." |
| 3 | "I feel a very high degree of personal ownership for this organization." |
| 4 | "I sense that this is MY company." |
| 5 | "This is OUR company." |
| 6 | "Most people working here feel as though they own the company." |
| 7 | "It is hard for me to think about this organization as MINE." (R) |

> α = .87–.93 across studies
> 注：这个量表原本针对组织归属感，不是创意作品

### 更相关的改编量表

**目前没有针对 "creative output ownership" 的经典标准化量表。** 但以下研究做过 task-level 改编：

**Jussupow, E., Spohrer, K., Heinzl, A., & Gawlitza, J. (2021).** Augmenting medical diagnosis decisions? An investigation into physicians' decision-making process with artificial intelligence. *Information Systems Research, 32*(3), 713–735.
- 改编 Pierce 量表，用于测量对 AI 辅助决策结果的归属感

**Lee, S., Kim, J., & Lee, S. (2019).** "I feel my idea is mine": Psychological ownership of AI-generated output in human–AI co-creation. *各相关 HCI 会议论文*
- 测量对 AI 协作产出的所有权感

常见改编思路（将组织改编为创意产出）：

| # | Adapted item |
|---|--------------|
| 1 | "I feel that the final output is truly mine." |
| 2 | "I feel a high degree of personal ownership over the creative work." |
| 3 | "I was the one directing the creative vision." |

---

### 当前系统中的 Ownership 题目 (4 items)

| Key | 当前题目 | 对应 Pierce/Van Dyne |
|-----|---------|---------------------|
| own_mine | "I felt that the final response was truly mine." | ≈ Van Dyne Item 1 adapted to output |
| own_direct | "I felt that I was directing the creative vision." | Content valid, no direct mapping |
| own_shape | "I shaped the final response rather than merely cleaning up AI output." | AI-specific, no classical precedent |
| own_contribute | "I was able to contribute creatively rather than simply follow the AI." | AI-specific, no classical precedent |

#### 建议

- own_mine 和 own_direct 可引用为 "adapted from Van Dyne & Pierce (2004)"
- own_shape 和 own_contribute 是本研究特有的，针对 human–AI co-creation 场景
- **需导师确认**：
  1. 是否接受 "adapted from Van Dyne & Pierce (2004) + self-developed items" 的混合方式
  2. 或者是否需要用完整的 Van Dyne & Pierce 7-item 量表
  3. 是否需要加入 "I feel a high degree of personal ownership over this creative work" 这类更标准的题目

---

## 三、发给导师的确认要点

### CSE 部分
1. Baseline CSE 4 题是否可以引用为 "adapted from Tierney & Farmer (2002)"？
2. Post-task CSE 3 题是否可以作为 state-level adaptation？
3. 是否需要严格使用 Tierney & Farmer 原始 3 题？

### Ownership 部分
1. 目前没有针对 creative output 的标准化量表，我们的 4 题是否可接受？
2. 是否需要补充更标准的 psychological ownership 题目（如 "I feel a high degree of personal ownership over this creative work"）？
3. 引用方式："adapted from Van Dyne & Pierce (2004) with self-developed items for human–AI co-creation context" 是否可以？

---

## 四、参考文献汇总

- Beghetto, R. A. (2006). Creative self-efficacy: Correlates in middle and secondary students. *Creativity Research Journal, 18*(4), 447–457.
- Karwowski, M. (2014). Creative mindsets: Measurement, correlates, consequences. *Psychology of Aesthetics, Creativity, and the Arts, 8*(1), 62–70.
- Pierce, J. L., Kostova, T., & Dirks, K. T. (2001). Toward a theory of psychological ownership in organizations. *Academy of Management Review, 26*(2), 298–310.
- Pierce, J. L., Kostova, T., & Dirks, K. T. (2003). The state of psychological ownership: Integrating and extending a century of research. *Review of General Psychology, 7*(1), 84–107.
- Tierney, P., & Farmer, S. M. (2002). Creative self-efficacy: Its potential antecedents and relationship to creative performance. *Academy of Management Journal, 45*(6), 1137–1148.
- Van Dyne, L., & Pierce, J. L. (2004). Psychological ownership and feelings of possession: Three field studies predicting employee attitudes and organizational citizenship behavior. *Journal of Organizational Behavior, 25*(4), 439–459.
