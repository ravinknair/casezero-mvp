#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-3000}"

pids=()
while IFS= read -r pid; do
  [ -n "$pid" ] && pids+=("$pid")
done < <(lsof -ti tcp:"${PORT}" || true)

if [ "${#pids[@]}" -gt 0 ]; then
  echo "Restarting CaseZero app on port ${PORT} (stopping PIDs: ${pids[*]})"
  for pid in "${pids[@]}"; do
    kill -TERM "$pid" || true
  done
  sleep 2
fi

exec bash "$PROJECT_DIR/start.sh"
