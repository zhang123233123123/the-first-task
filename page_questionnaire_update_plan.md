# 页面与问卷更新详细计划

## 1. 目标

这份计划只服务一个目的：把当前 CHI 实验系统设计文档中的**页面设计**和**问卷设计**写得更完整、更一致、更可用于后续论文与系统说明。

当前更新工作不涉及代码实现，不涉及前端工程细节，也不涉及数据库实现。当前产出是一份更细的设计计划，用来指导后续文档重写。

本计划默认采用以下已确认决策：

- 一个 study 中两个任务都做
- 每个 participant 都完成 `short story task` 和 `metaphor task`
- participant 在两个任务中保持同一个 condition
- task order 需要 counterbalance
- AI 交互采用 `system-pushed suggestions only`
- participant 不能自由 prompt，也不是自由多轮聊天


## 2. 更新原则

后续文档更新必须满足下面五条原则：

1. **页面流完整**
   文档必须能让读者从第一页一直看到最后一页，知道 participant 在每一步看到什么、做什么、为什么做。

2. **问卷块明确**
   所有 questionnaire 都必须明确写成独立页面或独立 block，而不是只写变量名。

3. **条件差异清晰**
   `provocateur` 和 `friction` 的出现位置、作用方式、页面差异必须一眼看清。

4. **双任务结构一致**
   story task 和 metaphor task 都要进入同一实验流程，但每个任务的页面与测量逻辑要写清 task-specific 差异。

5. **页面、问卷、数据一一对应**
   每个页面都要知道：
   - 这页的研究作用是什么
   - 这页收集什么数据
   - 这页和哪个变量或研究问题有关


## 3. 总体页面流重写计划

后续应把系统页面流写成固定的 8 段结构，而不是只写宽泛的 participant workflow。

### 3.1 Page 0: Consent and Study Introduction

需要补写内容：

- 页面目标：完成知情同意，解释研究是 AI-assisted creativity study
- 页面组件：
  - study title
  - consent text
  - estimated time
  - general participation rules
  - continue button
- 页面约束：
  - participant 必须勾选 consent 才能进入下一页
- 数据记录：
  - consent status
  - consent timestamp

需要在文档中明确：

- 这里只介绍总体研究，不暴露具体 experimental manipulation hypothesis
- 这里只说明系统会包含 AI suggestions 和 short questionnaires，不提前解释 provocateur 或 friction 的研究逻辑

### 3.2 Page 1: General Instruction Page

需要补写内容：

- 页面目标：给出统一任务说明和实验规则
- 页面组件：
  - 简要介绍两个任务类型
  - 说明 participant 会完成两个任务
  - 说明 AI suggestions 是系统提供的，不需要自己输入 prompt
  - 说明部分页面可能要求先完成反思步骤才能继续
- 页面约束：
  - 不写过多理论语言，避免 demand characteristics 太强
- 数据记录：
  - instruction page viewed
  - dwell time on instruction page

### 3.3 Page 2: Baseline Questionnaire

需要补写内容：

- 页面目标：收集控制变量与 pre-task baseline
- 页面组件：
  - need for cognition items
  - locus of control items
  - prior AI use items
  - creative writing experience items
  - demographics items
  - baseline creative self-efficacy items
- 页面形式：
  - 建议分成若干小 block，但仍然属于同一 baseline page sequence
  - 可以分页，但文档里要说明它们共同构成 baseline questionnaire
- 页面约束：
  - 必填项规则
  - attention check 是否放在这里要写清
- 数据记录：
  - baseline responses
  - completion time
  - missing responses

### 3.4 Page 3: Condition Assignment and Task Order Assignment

需要补写内容：

- 页面目标：在系统后台完成 randomization，不一定需要单独给 participant 看见
- 后台逻辑必须写清：
  - participant 被分到四个 condition 之一
  - 同一 participant 在两个任务中 condition 固定
  - task order 需要 counterbalance
- 数据记录：
  - `condition_id`
  - `provocateur_flag`
  - `friction_flag`
  - `task_order`

文档里要明确：

- 这是系统逻辑节点，不一定是可见页面
- 但必须作为流程中的独立步骤写清

### 3.5 Page 4-7: Task Round 1

这一部分后续应拆成四类页面，而不是一句“participants complete task 1”。

#### 3.5.1 Task Round 1 Prompt Page

需要补写：

- 当前 round 对应哪个任务
- 如果是 story task：
  - 显示三个 cue words
  - 说明需要写 4-6 句创意故事
- 如果是 metaphor task：
  - 显示 metaphor prompt 或一组 prompt
  - 说明回答格式与任务目标
- 数据记录：
  - prompt shown
  - prompt viewing time

#### 3.5.2 Task Round 1 Suggestion Page

需要补写：

- 系统展示固定数量的 AI suggestions
- suggestion 的数量、展示方式、布局要在文档中说明
- 如果是 story task：
  - suggestion 更像 idea directions / story premises
- 如果是 metaphor task：
  - suggestion 更像 candidate reframing directions / metaphor seeds
- 数据记录：
  - suggestions shown
  - suggestion order
  - viewed / expanded events

#### 3.5.3 Task Round 1 Manipulation Layer

需要单独写清 condition-specific 页面差异：

- `control`
  - 只有 suggestions
- `provocateur`
  - suggestion + provocation card
- `friction`
  - suggestion + reflection gate
- `combined`
  - suggestion + provocation card + reflection gate

文档必须逐条说明：

- provocateur card 放在 suggestion 哪里
- friction gate 是覆盖层、弹窗、还是嵌入式 panel
- continue button 在何时解锁
- participant 是否必须完成 gate 中每一项

#### 3.5.4 Task Round 1 Production Page

需要补写：

- participant 如何完成故事写作或 metaphor 回答
- AI suggestions 在写作区是否仍可见
- participant 是否可回看 suggestion
- participant 是否可修改自己文本
- 是否允许选择 suggestion 后再自行扩写
- 数据记录：
  - text edits
  - submission timestamp
  - dwell time
  - revisits to suggestion panel

### 3.6 Page 8: Post-Task Questionnaire for Round 1

需要补写内容：

- 页面目标：对刚完成的 task round 进行 task-specific measurement
- 页面说明语言必须写成：
  - “Please answer the following questions based on the task you just completed.”
- 页面组件：
  - knowledge of cognition block
  - regulation of cognition block
  - post-task creative self-efficacy block
  - cognitive load block
  - provocateur manipulation check block
  - friction manipulation check block
  - attention check
  - optional ownership/authorship block
- 页面约束：
  - 必须说明这些回答是针对刚完成的 round，而不是整个实验总体印象
- 数据记录：
  - round-specific questionnaire responses
  - completion time

### 3.7 Page 9-12: Task Round 2

这一轮页面结构应与 Round 1 对称，文档中应明确写为：

- Task Round 2 Prompt Page
- Task Round 2 Suggestion Page
- Task Round 2 Manipulation Layer
- Task Round 2 Production Page

需要特别说明：

- 第二轮继续沿用同一个 condition
- 但任务类型切换为另一个 task
- 所有问卷回答都只针对当前 round

### 3.8 Page 13: Post-Task Questionnaire for Round 2

需要补写内容与 Round 1 对称，但必须明确：

- 这是第二轮专属 post-task questionnaire
- 不能把两轮 questionnaire 合并成一次“总体 post-study survey”

### 3.9 Page 14: Completion Page

需要补写：

- 页面目标：结束实验
- 页面组件：
  - thank you message
  - debriefing text（如果需要）
  - completion confirmation
- 数据记录：
  - study completion status
  - final timestamp


## 4. 问卷更新详细计划

后续文档不能只列变量名称，必须把问卷写成**真正的 questionnaire design**。

### 4.1 Baseline Questionnaire 重写计划

后续应将 baseline block 写成以下结构：

#### 4.1.1 Controls Block

包括：

- need for cognition
- locus of control
- prior AI use
- creative writing experience
- demographics

每一项需要在文档中补写：

- 变量作用
- 为什么在 baseline 测
- 是否为 control variable

#### 4.1.2 Baseline Creative Self-Efficacy Block

需要补写：

- 为什么 CSE 需要 pre-task + post-task
- 为什么 baseline CSE 不能只用 post-only 替代
- 页面描述要强调这是对创意写作/创意表达信心的 pre-task 评估

### 4.2 Post-Task Questionnaire 重写计划

后续应把每一轮 post-task questionnaire 写成固定的 6 个 block。

#### 4.2.1 Knowledge of Cognition Block

文档中要补写：

- 该 block 属于 mediator
- 测的是 participant 是否知道哪些 AI suggestions 有用、哪些策略可用、何时需要自己判断
- 为什么必须是 task-adapted state questionnaire
- 为什么应在每个 task round 后立即测

#### 4.2.2 Regulation of Cognition Block

文档中要补写：

- 该 block 是核心 mediator
- 测的是监控、评估、拒绝、修正、策略调整
- 为什么它不能只靠 process logs，也不能只靠 questionnaire
- 为什么每轮任务结束后立刻测最合理

#### 4.2.3 Creative Self-Efficacy Block

文档中要补写：

- 该 block 属于 DV-related psychological outcome
- post-task CSE 与 baseline CSE 的关系
- 为什么它反映 participant 是否仍把自己视为 co-creator

#### 4.2.4 Cognitive Load Block

文档中要补写：

- 该 block 的目标是判断 friction 是否增加了必要负担
- 建议采用 NASA-TLX 或更轻量的 effort scale
- 该变量应作为 post-task state measure，而非 baseline trait

#### 4.2.5 Manipulation Check Block

应拆成两块写：

- provocateur manipulation check
- friction manipulation check

文档中要补写：

- 为什么 manipulation checks 必须 design-specific
- 为什么不能只问 general satisfaction
- 为什么要与 process logs 一起解释

#### 4.2.6 Attention / Ownership Block

需要补写：

- attention check 的作用是 data quality
- optional ownership/authorship items 的作用是探索性结果，不是主模型核心变量


## 5. 条件与页面状态更新计划

后续文档中应增加一节，专门写四个 condition 在页面层面的差异。

### 5.1 Control Condition

需要写清：

- 哪些页面出现
- suggestion 页面如何显示
- 没有 provocation
- 没有 reflection gate

### 5.2 Provocateur Condition

需要写清：

- suggestion 页面如何附带 provocation card
- card 是否默认展开
- participant 是否需要点击展开
- production page 是否仍然可回看 provocation

### 5.3 Friction Condition

需要写清：

- 什么时候触发 gate
- gate 里必须回答哪些字段
- 是否允许只点选不写文本
- gate 完成前哪些按钮禁用

### 5.4 Combined Condition

需要写清：

- participant 先看到 suggestion + provocation
- 再完成 reflection gate
- 然后进入 production
- 两个 manipulation 的顺序必须固定


## 6. 页面与研究变量映射更新计划

后续文档需要加一张映射表或对应说明，至少覆盖下面内容：

- Consent / instruction page
  - 研究作用：标准化进入实验的前置条件
  - 数据：consent, timestamps

- Baseline questionnaire page
  - 研究作用：controls + baseline CSE
  - 数据：baseline responses

- Suggestion page
  - 研究作用：呈现统一 AI stimulus
  - 数据：suggestion exposure logs

- Provocateur card
  - 研究作用：操控 reframing / information uptake
  - 数据：provocation display and interaction logs

- Friction gate
  - 研究作用：操控 monitoring / evaluation
  - 数据：reflection gate responses, dwell time, strategy selection

- Production page
  - 研究作用：creative production
  - 数据：artifact text, revision traces

- Post-task questionnaire
  - 研究作用：mediators, DV-related outcomes, manipulation checks, attention check
  - 数据：task-specific survey responses


## 7. 数据记录更新计划

后续文档中，logging 相关内容要从“简单列字段”升级为“按页面说明记录什么数据”。

### 7.1 页面级 logging

每一页都要考虑记录：

- page enter timestamp
- page exit timestamp
- dwell time
- required fields completed or not

### 7.2 Suggestion-level logging

需要补写：

- suggestions shown
- suggestion order
- suggestion viewed
- suggestion expanded
- suggestion selected
- suggestion accepted / rejected

### 7.3 Provocation-level logging

需要补写：

- provocation displayed
- provocation expanded
- time spent on provocation content

### 7.4 Friction-level logging

需要补写：

- gate shown
- gate completed
- diagnosis selected
- strategy selected
- optional short explanation entered
- dwell time before continue

### 7.5 Artifact-level logging

需要补写：

- story submission
- metaphor submission
- revision counts
- final submission timestamps


## 8. 文稿重写顺序

为了避免一边写一边乱，后续正式文档更新建议按下面顺序推进：

1. 先重写 participant workflow
   先把页面顺序写正确。

2. 再重写 task design
   让两个任务真正嵌入同一流程。

3. 再重写 condition-specific interface behavior
   把四个 condition 的页面差异写清。

4. 再重写 questionnaires
   把 baseline 与两轮 post-task block 写完整。

5. 最后重写 measurement and logging
   把页面、问卷、变量、数据一一对齐。


## 9. 最终检查清单

后续正式更新文档后，必须逐项检查：

- 是否明确写出 participant 完成两个任务
- 是否明确写出 task order counterbalance
- 是否明确写出 system-pushed suggestions only
- 是否不存在任何自由 prompt / multi-turn chatbot 暗示
- 是否每轮任务后都有单独的 post-task questionnaire
- 是否 story task 和 metaphor task 的评分方式分开写
- 是否 friction gate 对两个任务都写了 task-specific 说明
- 是否每个页面都能对应至少一种研究数据
- 是否每个问卷块都能对应明确研究作用


## 10. 当前计划产出物

按这份计划推进后，最终应该得到两类更成熟的文稿内容：

1. **页面设计说明**
   可以直接服务 system design / method section 的页面流程描述

2. **问卷设计说明**
   可以直接服务 measurement / procedure / appendix 中的 survey structure 描述

这两部分写清楚之后，当前实验系统设计文档才会真正从“总蓝图”升级为“完整的研究系统说明”。
