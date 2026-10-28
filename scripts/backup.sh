#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$ROOT_DIR/backups"
SRC_DIR="$ROOT_DIR/app/frontend/src"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
MAX_BACKUPS=5

mkdir -p "$BACKUP_DIR"

if [ -n "$1" ] && [ -f "$1" ]; then
  BASENAME=$(basename "$1")
  DEST="$BACKUP_DIR/${BASENAME%.*}_backup_${TIMESTAMP}.${BASENAME##*.}"
  cp "$1" "$DEST"
  echo "Backed up file: $DEST"
elif [ -n "$1" ] && [ -d "$1" ]; then
  DEST="$BACKUP_DIR/$(basename "$1")_backup_${TIMESTAMP}"
  cp -R "$1" "$DEST"
  echo "Backed up directory: $DEST"
else
  DEST="$BACKUP_DIR/src_backup_${TIMESTAMP}"
  cp -R "$SRC_DIR" "$DEST"
  echo "Backed up src tree: $DEST"
fi

# Prune older backups keeping at most MAX_BACKUPS (FIFO)
cd "$BACKUP_DIR"
TOTAL_COUNT=$(ls -1dt * 2>/dev/null | wc -l | tr -d ' ')

if [ "$TOTAL_COUNT" -gt "$MAX_BACKUPS" ]; then
  EXCESS=$((TOTAL_COUNT - MAX_BACKUPS))
  echo "Rotating backups: total $TOTAL_COUNT exceeds limit of $MAX_BACKUPS (pruning $EXCESS oldest)..."
  # List all items sorted newest first, tail gets the oldest, remove them
  ls -1dt * | tail -n "$EXCESS" | while IFS= read -r item; do
    echo "Pruning oldest backup: $item"
    rm -rf "$item"
  done
fi

echo "Current backups count: $(ls -1dt * 2>/dev/null | wc -l | tr -d ' ')"
