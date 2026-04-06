#!/bin/bash
# 一键启动脚本：后端 (FastAPI) + 前端 (Next.js)

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

# 颜色
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cleanup() {
  echo -e "\n${YELLOW}正在关闭所有进程...${NC}"
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  echo -e "${GREEN}已关闭。${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

# 启动后端
echo -e "${CYAN}[后端]${NC} 启动 FastAPI (http://localhost:8000)..."
cd "$BACKEND"
if [ ! -d "venv" ]; then
  echo -e "${RED}[后端] 未找到 venv，请先运行: cd backend && python3 -m venv venv && pip install -r requirements.txt${NC}"
  exit 1
fi
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
deactivate

# 等后端起来
sleep 2

# 启动前端
echo -e "${CYAN}[前端]${NC} 启动 Next.js (http://localhost:3000)..."
cd "$FRONTEND"
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  后端: http://localhost:8000          ${NC}"
echo -e "${GREEN}  前端: http://localhost:3000          ${NC}"
echo -e "${GREEN}  按 Ctrl+C 关闭所有服务              ${NC}"
echo -e "${GREEN}========================================${NC}"

# 等待任一子进程退出
wait -n "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || wait "$BACKEND_PID" "$FRONTEND_PID"
cleanup
