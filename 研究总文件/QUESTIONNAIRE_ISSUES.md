# Questionnaire Issues Tracker

> 记录当前问卷中已确认和待确认的问题，供导师确认后修改。

---

## 已确认的问题

### 1. Baseline CSE 多了一题

- **位置**：`frontend/app/baseline/page.tsx` — Baseline CSE block
- **问题**：Tierney & Farmer (2002) 原版 CSE 只有 **3 题**，我们 baseline 有 **4 题**，多了 `cse_improve`
- **多出的题目**：`"Based on my current experience, I can improve a weak creative idea into a stronger one."`
- **原因**：该题不属于 Tierney & Farmer (2002) 原版 3 题中的任何一题，是自行编写的
- **解决方案**：删除 `cse_improve`，保留原版 3 题（adapted to writing context）

---

## 待确认的问题

### 2. NFC 6 题来源不明

- **位置**：`frontend/app/baseline/page.tsx` — NFC block
- **问题**：原版 NFC（Cacioppo, Petty, & Kao, 1984）有 **18 题**。我们用了 **6 题**，但项目文件中没有注明出处
- **当前 6 题**：
  1. "I prefer tasks that require careful thinking."
  2. "I enjoy working through complex problems."
  3. "I would rather think deeply about an issue than rely on a quick answer."
  4. "I find satisfaction in effortful thinking."
  5. "I like situations that require me to evaluate alternatives carefully."
  6. "I prefer tasks that challenge the way I think."
- **疑点**：
  - 6 题全部为正向题，原版 18 题包含正向和反向题
  - 措辞与 NFC-18 原始题目不完全一致
  - 无法确认是否来自已发表的验证短版（如 Lins de Holanda Coelho et al., 2020 的 NFC-6）
- **导师规则**：不能自己从验证量表中删减题目，必须使用完整版或已发表的验证短版
- **待确认**：这 6 题的出处是什么？是已发表的短版还是自行挑选/改写的？
- **解决方案（如果是自行编写的）**：替换为正式的 NFC-6（Lins de Holanda Coelho et al., 2020）或使用完整 NFC-18

---

## 已确认没问题的量表

| 量表 | 题数 | 出处 | 状态 |
|------|------|------|------|
| IE-4 (Locus of Control) | 4 题, 5-point | Nießen et al. (2022) | ✅ 全量表 |
| SMI (State Metacognition) | 20 题, 4-point | O'Neil & Abedi (1996) | ✅ 全量表 |
| Post-task CSE | 3 题, 7-point | Adapted from Tierney & Farmer (2002) | ✅ 全量表 state 版 |
| NASA-TLX | 5 题, 7-point | Hart & Staveland (1988) | ✅ |
| Ownership | 4 题, 7-point | Adapted from Van Dyne & Pierce (2004) + self-developed | ✅ 待导师确认引用方式 |

---

## Pilot Study 行动清单（基于导师反馈 2026-04-29）

> 目标：5月底前完成 30-45 人 Pilot 数据收集

### 任务一：前端界面与实验流程改造 (UI & Flow)

- [ ] 重构知情同意书 — 基于 Saba 教授 KTH 模板（匿名、无音视频、可退出、14天撤回、18+）
- [ ] 全局删除敏感词 — "Pilot Study" 前缀、"There is no AI assistant"（改为 "Please complete the task freely using your own ideas."）
- [ ] 隐藏专业任务名 — "Creative Metaphor Task" 等改为 "Task 1" / "Task 2"
- [ ] 新增 Tutorial 引导页 — 图文教程解释界面布局，使用 Dummy task（非真实题目）
- [ ] 清理正式页面 UI 提示 — 删除所有悬浮气泡/Hints
- [ ] 增加任务间过渡页 — "End of Task 1. Please click the button below to start Task 2."
- [ ] 完善结束页 — 加选填主观反馈框 (Text Box, Optional) + 联系邮箱

### 任务二：后台数据追踪与量表标准化 (Data & Tracking)

- [ ] 动态平衡分配算法 — 新被试分配到当前人数最少的 Condition
- [ ] 统一量表为 7-point Likert（1=Strongly Disagree, 7=Strongly Agree）
- [ ] 强力注意力检查题 — 阅读理解式（"刚才任务中出现了哪个词？"），每个 Task 后设一个
- [x] 年龄改为填空（数字输入）— ✅ 已完成
- [ ] 记录精确时间戳 — Begin Task 和 Submit 按钮的时间

### 任务三：Pilot 变量做减法 (Research Design)

**Pilot 保留：**
- 控制变量（Demographics）
- 自变量 IV（Basic AI / Friction / Provocateur，3 个条件）
- 因变量 DV（Creative Self-Efficacy, CSE）
- 操纵检查（Manipulation check，如 "The AI challenged my thinking..."）
- 注意力检查

**Pilot 砍掉（留到正式实验）：**
- ~~NFC（认知需求）~~ → 正式实验再加，且需先确认 6 题来源（见上方待确认问题 #2）
- ~~IE-4（控制点）~~
- ~~NASA-TLX（认知负荷）~~
- ~~SMI（状态元认知 20 题）~~ → 正式实验再加，届时需适配创意写作措辞
- ~~Ownership（创作归属感）~~

**Pilot 后分析：**
1. 操纵检验 — T-test 比较各条件下操纵检查题得分差异
2. 效应量 — 算 Cohen's d
3. 正式样本量 — 用 G*Power 计算所需 N

### 任务四：预实验发放 (Recruitment & Launch)

- [ ] 撰写英文招募广告 — 注明 10-15 分钟、英语授课环境学生、voluntary（自愿无偿）
- [ ] 多渠道分发 — Saba 教授社交媒体 + 校内群

---

*最后更新：2026-04-29*
