# 系统完整链接与页面说明

> 服务器地址：`47.106.117.27`
> 前端端口：`3000` | 后端端口：`8000`
> 基础 URL：`http://47.106.117.27:3000`
> 联系邮箱：potteryhrr@gmail.com

---

## 一、正式实验流程（Main Study）

用户按以下顺序依次访问，每一步完成后自动跳转到下一步。

| 步骤 | 链接 | 说明 |
|------|------|------|
| 1. 入口 | http://47.106.117.27:3000/ | 自动重定向到 consent 页面 |
| 2. 知情同意 | http://47.106.117.27:3000/consent | 阅读研究说明，勾选同意后继续。支持 `?condition=xxx` 参数指定条件（调试用） |
| 3. 说明页 | http://47.106.117.27:3000/instructions | 介绍实验流程：2 个任务 + 问卷 |
| 4. Tutorial 引导 | http://47.106.117.27:3000/tutorial | 6 步引导式工作区教程（高亮各区域 + 浮动说明卡片） |
| 5. Baseline 问卷 | http://47.106.117.27:3000/baseline | 6 个 block：Demographics → NFC → IE-4（含注意力检查） → AI Use → Writing Exp → CSE |
| 6. 任务 1 简报 | http://47.106.117.27:3000/task/1/brief | 显示任务类型（story/metaphor）和条件提示 |
| 7. 任务 1 工作区 | http://47.106.117.27:3000/task/1/suggestions | 5 分钟计时写作，AI 面板（根据条件不同）。记录 `task_begin` 和 `task_submit` 时间戳 |
| 8. 任务 1 后测 | http://47.106.117.27:3000/task/1/survey | SMI(4 block，含注意力检查) → CSE → NASA-TLX → Ownership |
| 9. 过渡页 | http://47.106.117.27:3000/transition | "Task 1 complete" 提示，点击按钮开始 Task 2 |
| 10. 任务 2 简报 | http://47.106.117.27:3000/task/2/brief | 第二个任务的说明 |
| 11. 任务 2 工作区 | http://47.106.117.27:3000/task/2/suggestions | 同任务 1，不同的题目 |
| 12. 任务 2 后测 | http://47.106.117.27:3000/task/2/survey | 同任务 1 后测 |
| 13. 完成页 | http://47.106.117.27:3000/complete | 感谢 + 选填反馈框 + 联系邮箱，用户手动点击结束 |

### 正式实验条件（6 种）

| 条件 ID | 说明 |
|---------|------|
| `no_ai` | 无 AI 辅助，纯手写 |
| `basic_ai` | 基础 AI 建议，聊天式交互 |
| `provocateur` | AI 挑战思维（风险 → 替代方向 → 反思问题） |
| `friction` | 写作中自动暂停反思（≥40 字触发） |
| `prov_then_fric` | 先挑战后反思（组合条件） |
| `fric_then_prov` | 先反思后挑战（组合条件） |

### 量表标准（全部 7-point Likert）

| 量表 | 题数 | 出处 | 位置 |
|------|------|------|------|
| IE-4 (Locus of Control) | 4 题 | Kovaleva (2012) | Baseline |
| SMI (State Metacognition) | 20 题 | O'Neil & Abedi (1996) | Post-task survey |
| Post-task CSE | 3 题 | Tierney & Farmer (2002) adapted | Post-task survey |
| NASA-TLX (Cognitive Load) | 3 题 | Hart & Staveland (1988) | Post-task survey |
| Ownership | 4 题 | Van Dyne & Pierce (2004) adapted | Post-task survey |

### 注意力检查

| Key | 位置 | 说明 |
|-----|------|------|
| `attn_baseline` | Baseline 问卷（IE-4 block） | "Please select 'Agree' (6)" |
| `attn_posttask` | Post-task survey（SMI Self-Checking block） | "Please select 'Agree' (6)"，每个 task 后出现 |
| `attn_pilot` | Pilot manipulation check | "Please select 'Agree' (6)" |

---

## 二、Pilot 实验流程

简化版流程：无 baseline 量表（只有 demographics），每个任务后有操控检查 + 注意力检查。

| 步骤 | 链接 | 说明 |
|------|------|------|
| 1. 入口 | http://47.106.117.27:3000/pilot | Pilot 知情同意 + 4 题 demographics |
| 2. 说明页 | http://47.106.117.27:3000/instructions | 介绍实验流程 |
| 3. Tutorial 引导 | http://47.106.117.27:3000/tutorial | 6 步工作区引导教程 |
| 4. 任务 1 简报 | http://47.106.117.27:3000/task/1/brief | 同正式实验 |
| 5. 任务 1 工作区 | http://47.106.117.27:3000/task/1/suggestions | 同正式实验（但只有 3 个条件） |
| 6. 任务 1 后测 | http://47.106.117.27:3000/task/1/survey | 操控检查（2 题，按条件不同） |
| 7. 过渡页 | http://47.106.117.27:3000/transition | 任务间过渡 |
| 8. 任务 2 简报 | http://47.106.117.27:3000/task/2/brief | 同正式实验 |
| 9. 任务 2 工作区 | http://47.106.117.27:3000/task/2/suggestions | 同正式实验 |
| 10. 任务 2 后测 | http://47.106.117.27:3000/task/2/survey | 操控检查 + Demographics（仅 round 2 收集） |
| 11. Manipulation Check | http://47.106.117.27:3000/pilot/check | 3 题：2 题操控检查 + 1 题注意力检查 |
| 12. 完成页 | http://47.106.117.27:3000/pilot/complete | Pilot 感谢页 |

### Pilot 条件（3 种）

| 条件 ID | 说明 |
|---------|------|
| `basic_ai` | 基础 AI 建议 |
| `friction` | 反思暂停机制 |
| `provocateur` | AI 挑战思维 |

### Pilot 保留的变量

- 控制变量：Demographics（age, gender, English proficiency）
- 自变量 IV：Basic AI / Friction / Provocateur（3 个条件）
- 因变量 DV：Creative Self-Efficacy (CSE)
- 操纵检查：Manipulation check
- 注意力检查：`attn_pilot`

---

## 三、Debug / 调试页面

| 链接 | 说明 |
|------|------|
| http://47.106.117.27:3000/debug/conditions?key=chi2026 | **正式实验条件启动器** — 选择 6 个条件之一，跳过 consent/baseline，直接进入任务 |
| http://47.106.117.27:3000/debug/pilot?key=chi2026 | **Pilot 条件启动器** — 选择 3 个 pilot 条件之一，以 pilot 模式直接进入任务 |
| http://47.106.117.27:3000/debug/data?key=chi2026 | **数据查看面板** — 浏览所有参与者数据，支持按 Mode（Main/Pilot）、Condition、Completion 筛选，可展开查看 baseline JSON、任务作品、交互日志、后测问卷等原始数据 |

> Debug 页面需要密钥访问，URL 末尾加 `?key=chi2026`

---

## 四、后端 API 端点

基础 URL：`http://47.106.117.27:8000`

### 4.1 健康检查

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 服务健康检查 |

### 4.2 参与者管理 (`/participants`)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/participants/init` | 创建参与者。参数：`condition`（可选，调试用）、`is_pilot`（bool） |
| GET | `/participants/{id}` | 获取参与者信息 |
| POST | `/participants/{id}/consent` | 记录知情同意 |
| PATCH | `/participants/{id}/progress` | 更新当前页面进度 |
| POST | `/participants/{id}/complete` | 标记实验完成 |

### 4.3 AI 建议 (`/suggestions`)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/suggestions/prompt/{id}/{round}` | 获取任务提示（不生成 AI 建议） |
| GET | `/suggestions/{id}/{round}` | 获取 AI 建议（首次生成，之后缓存） |
| POST | `/suggestions/chat` | 聊天跟进（basic_ai 返回建议，provocateur 返回挑战卡片） |
| POST | `/suggestions/prov-followup` | Provocateur 追问生成 |
| POST | `/suggestions/friction-options` | 获取 AI 个性化的 friction 反思选项 |

### 4.4 数据保存 (`/responses`)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/responses/baseline` | 保存 baseline 问卷。参数含 `pilot: bool`，用于分层分配 |
| POST | `/responses/gate-shown` | 标记 friction gate 已显示 |
| POST | `/responses/gate` | 保存 friction gate 反思数据 |
| POST | `/responses/artifact` | 保存写作作品 |
| POST | `/responses/post-task` | 保存后测问卷（round=0 为 pilot manipulation check） |
| POST | `/responses/log-event` | 追加交互日志事件（task_begin / task_submit / chat_reply 等） |

### 4.5 调试数据 (`/debug/data`)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/debug/data/participants` | 参与者列表。筛选参数：`q`（搜索 ID）、`condition`、`completed`、`study_mode`、`sort` |
| GET | `/debug/data/participants/{id}` | 参与者详情（含 baseline、task sessions、post-task 全部原始数据） |

---

## 五、数据存储

| 项目 | 位置 |
|------|------|
| 数据库 | 服务器 `/opt/systemdesign/backend/experiment.db`（SQLite） |
| 数据库表 | `participants`、`baseline_responses`、`task_sessions`、`post_task_responses` |
| Pilot 数据区分 | `participants.study_mode` 字段（"main" 或 "pilot"） |
| AI 服务 | DeepSeek API（配置在 `/opt/systemdesign/backend/.env`） |

### 时间戳记录

| 事件 | 记录方式 | 说明 |
|------|---------|------|
| `task_begin` | `log-event` API → `task_sessions.interaction_log` | 用户进入任务工作区时，ISO 时间戳 |
| `task_submit` | `log-event` API → `task_sessions.interaction_log` | 用户提交作品时，ISO 时间戳 + `dwell_seconds` + `char_count` |
| `chat_reply` | `log-event` API → `task_sessions.interaction_log` | 用户每次聊天交互 |

---

## 六、服务管理

```bash
# SSH 连接
ssh -i ~/.ssh/id_deploy root@47.106.117.27

# 服务状态
systemctl status chi-frontend chi-backend

# 重启服务
systemctl restart chi-frontend chi-backend

# 查看日志
journalctl -u chi-backend -f
journalctl -u chi-frontend -f

# 项目路径
/opt/systemdesign/

# 前端构建
cd /opt/systemdesign/frontend && npm run build

# 后端 venv
/opt/systemdesign/backend/venv/
```

---

## 七、快速测试链接

### Pilot 测试（推荐先用这些）

- 正式 Pilot 入口：http://47.106.117.27:3000/pilot
- Debug Pilot（跳过 demographics）：http://47.106.117.27:3000/debug/pilot?key=chi2026

### 正式实验测试

- 正式入口：http://47.106.117.27:3000/
- Debug 指定条件（跳过 baseline）：http://47.106.117.27:3000/debug/conditions?key=chi2026
- 指定条件直接进入（如 friction）：http://47.106.117.27:3000/consent?condition=friction

### 数据查看

- 全部数据：http://47.106.117.27:3000/debug/data?key=chi2026
- 后端健康检查：http://47.106.117.27:8000/health
- 后端 API 文档（Swagger）：http://47.106.117.27:8000/docs

---

*最后更新：2026-04-30*
