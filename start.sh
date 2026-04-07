#!/bin/bash
# 一键启动脚本：后端 (FastAPI) + 前端 (Next.js) + Cloudflare Tunnel

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

# 颜色
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

CF_LOG="/tmp/cloudflare_tunnel.log"

cleanup() {
  echo -e "\n${YELLOW}正在关闭所有进程...${NC}"
  kill "$BACKEND_PID" "$FRONTEND_PID" "$CF_PID" 2>/dev/null
  wait "$BACKEND_PID" "$FRONTEND_PID" "$CF_PID" 2>/dev/null
  rm -f "$CF_LOG"
  echo -e "${GREEN}已关闭。${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── 启动后端 ──────────────────────────────────────────────────
echo -e "${CYAN}[后端]${NC} 启动 FastAPI (http://localhost:8000)..."
cd "$BACKEND"
if [ ! -d "venv" ]; then
  echo -e "${RED}[后端] 未找到 venv，请先运行:${NC}"
  echo "  cd backend && python3 -m venv venv && pip install -r requirements.txt"
  exit 1
fi
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
deactivate

sleep 2

# ── 启动前端 ──────────────────────────────────────────────────
echo -e "${CYAN}[前端]${NC} 启动 Next.js (http://localhost:3000)..."
cd "$FRONTEND"
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 3

# ── 启动 Cloudflare Tunnel ────────────────────────────────────
echo -e "${CYAN}[Cloudflare]${NC} 正在建立公网隧道，请稍候..."
rm -f "$CF_LOG"
cloudflared tunnel --url http://localhost:3000 > "$CF_LOG" 2>&1 &
CF_PID=$!

# 等待 URL 出现（最多 30 秒）
CF_URL=""
for i in $(seq 1 30); do
  CF_URL=$(grep -o "https://[a-zA-Z0-9-]*\.trycloudflare\.com" "$CF_LOG" 2>/dev/null | head -1)
  [ -n "$CF_URL" ] && break
  sleep 1
done

# ── 输出地址汇总 ──────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}============================================${NC}"
echo -e "${GREEN}${BOLD}  服务已启动                               ${NC}"
echo -e "${GREEN}${BOLD}============================================${NC}"
echo -e "  ${CYAN}本地后端  ${NC}  http://localhost:8000"
echo -e "  ${CYAN}本地前端  ${NC}  http://localhost:3000"
echo -e "  ${CYAN}API 文档  ${NC}  http://localhost:8000/docs"
echo -e "  ${CYAN}数据查看  ${NC}  http://localhost:8000/debug/data/participants"
if [ -n "$CF_URL" ]; then
  echo -e "  ${YELLOW}${BOLD}公网地址  ${NC}  ${BOLD}${CF_URL}${NC}  ← 发给参与者"
  echo -e "  ${YELLOW}${BOLD}公网Debug ${NC}  ${BOLD}${CF_URL}/debug/conditions${NC}"
else
  echo -e "  ${RED}公网地址  ${NC}  获取失败，请检查网络或重启"
fi
echo -e "  ${CYAN}本地Debug ${NC}  http://localhost:3000/debug/conditions"
echo -e "${GREEN}${BOLD}============================================${NC}"
echo -e "  按 ${YELLOW}Ctrl+C${NC} 关闭所有服务"
echo ""

wait -n "$BACKEND_PID" "$FRONTEND_PID" "$CF_PID" 2>/dev/null || \
  wait "$BACKEND_PID" "$FRONTEND_PID" "$CF_PID"
cleanup
