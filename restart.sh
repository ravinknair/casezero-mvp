#!/usr/bin/env bash
set -e

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

nvm use 22 >/dev/null

PORT_PID=$(lsof -ti :3000 || true)
if [ -n "$PORT_PID" ]; then
  echo "Restarting dev server on port 3000 (stopping PID $PORT_PID)"
  kill "$PORT_PID"
  sleep 1
fi

cd /Users/ravinair/Desktop/MANDAR/MyCodexProject/casezero-mvp
npm run dev
