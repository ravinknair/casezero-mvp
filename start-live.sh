#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/Users/ravinair/Desktop/MANDAR/MyCodexProject"
PORT=3000
NGROK_DOMAIN="twiddling-lifter-evolve.ngrok-free.dev"
APP_LOG="$PROJECT_DIR/.casezero.log"
NGROK_LOG="$PROJECT_DIR/.ngrok.log"

command -v ngrok >/dev/null 2>&1 || {
  echo "ngrok is not installed or not on PATH. Install it first: https://ngrok.com/download" >&2
  exit 1
}

cleanup_port() {
  local pids=()
  while IFS= read -r pid; do
    [ -n "$pid" ] && pids+=("$pid")
  done < <(lsof -ti tcp:"${PORT}" || true)

  if [ "${#pids[@]}" -gt 0 ]; then
    echo "Cleaning stale listener(s) on port ${PORT}: ${pids[*]}"
    for pid in "${pids[@]}"; do
      kill -9 "$pid" || true
    done
    sleep 2
  fi
}

start_app() {
  if ! pgrep -af "vinext start --host 0.0.0.0" >/dev/null 2>&1; then
    echo "Starting CaseZero app..."
    cd "$PROJECT_DIR"
    nohup npm run start -- --host 0.0.0.0 > "$APP_LOG" 2>&1 &
    sleep 3
  fi
}

start_ngrok() {
  if ! pgrep -af "ngrok http --domain=${NGROK_DOMAIN} 3000" >/dev/null 2>&1; then
    echo "Starting ngrok tunnel for ${NGROK_DOMAIN}..."
    nohup ngrok http --domain="$NGROK_DOMAIN" 3000 > "$NGROK_LOG" 2>&1 &
    sleep 3
  fi
}

while true; do
  cleanup_port
  start_app
  start_ngrok

  if ! pgrep -af "vinext start --host 0.0.0.0" >/dev/null 2>&1; then
    echo "App process exited; restarting..."
  fi

  if ! pgrep -af "ngrok http --domain=${NGROK_DOMAIN} 3000" >/dev/null 2>&1; then
    echo "ngrok tunnel exited; restarting..."
  fi

  sleep 5
done
