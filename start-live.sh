#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-3000}"
NGROK_DOMAIN="twiddling-lifter-evolve.ngrok-free.dev"
NGROK_LOG="$PROJECT_DIR/.ngrok.log"

command -v ngrok >/dev/null 2>&1 || {
  echo "ngrok is not installed or not on PATH. Install it first: https://ngrok.com/download" >&2
  exit 1
}

if pgrep -af "ngrok http --domain=${NGROK_DOMAIN} 3000" >/dev/null 2>&1; then
  echo "ngrok tunnel already running for ${NGROK_DOMAIN}"
  exit 0
fi

echo "Starting external ngrok tunnel for ${NGROK_DOMAIN} on port ${PORT}..."
cd "$PROJECT_DIR"
nohup ngrok http --domain="$NGROK_DOMAIN" "$PORT" > "$NGROK_LOG" 2>&1 &
sleep 3

if pgrep -af "ngrok http --domain=${NGROK_DOMAIN} 3000" >/dev/null 2>&1; then
  echo "Tunnel started successfully."
  echo "Check log: $NGROK_LOG"
else
  echo "Tunnel did not start. Check ngrok output in $NGROK_LOG"
  exit 1
fi
