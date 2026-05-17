#!/bin/bash
ROOT="$(cd "$(dirname "$0")" && pwd)"
echo "Backend  -> http://localhost:8000"
cd "$ROOT" && "$ROOT/.venv/bin/python" -m uvicorn backend.main:app --reload --port 8000 &
BACKEND_PID=$!

echo "Frontend -> http://localhost:5173"
cd "$ROOT/frontend" && npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
