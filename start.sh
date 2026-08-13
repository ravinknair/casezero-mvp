#!/usr/bin/env bash
set -euo pipefail

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 22 >/dev/null 2>&1 || true

PROJECT_DIR="/Users/ravinair/Desktop/MANDAR/MyCodexProject"
PORT=3000
RESTART_DELAY=3
MODE="loop"

if [ "${1:-}" = "--once" ]; then
  MODE="once"
fi

cleanup_port() {
  local pids=()
  while IFS= read -r pid; do
    [ -n "$pid" ] && pids+=("$pid")
  done < <(lsof -ti tcp:"${PORT}" || true)

  if [ "${#pids[@]}" -gt 0 ]; then
    echo "Stopping stale process(es) on port ${PORT} (PIDs: ${pids[*]})"
    for pid in "${pids[@]}"; do
      kill "$pid" || true
    done
    sleep 2
  fi
}

run_app() {
  cd "$PROJECT_DIR"
  echo "Launching CaseZero app on http://localhost:${PORT}"
  npm run start -- --host 0.0.0.0
}

cleanup_port

if [ "$MODE" = "once" ]; then
  run_app
  exit $?
fi

while true; do
  run_app
  status=$?
  echo "CaseZero app exited with code ${status} at $(date). Restarting in ${RESTART_DELAY}s..."
  sleep "$RESTART_DELAY"
done
