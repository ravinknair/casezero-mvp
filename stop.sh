#!/usr/bin/env bash
set -e

PORT_PID=$(lsof -ti :3000 || true)
if [ -n "$PORT_PID" ]; then
  echo "Stopping dev server on port 3000 (PID $PORT_PID)"
  kill "$PORT_PID"
  sleep 1
else
  echo "No dev server found on port 3000"
fi
