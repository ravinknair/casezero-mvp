#!/usr/bin/env bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 22 >/dev/null
cd /Users/ravinair/Desktop/MANDAR/MyCodexProject/casezero-mvp
npm run dev
