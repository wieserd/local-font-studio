#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$DIR/app/frontend"

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies (first time setup)..."
  npm install
fi

echo "Starting Local Font Studio on http://127.0.0.1:5173 ..."
npm run dev -- --host 127.0.0.1 --port 5173
