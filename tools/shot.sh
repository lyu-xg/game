#!/bin/bash
# Take a screenshot of the game at a given level.
# Usage:  tools/shot.sh [level]   (default 1)
#
# Output: tools/screenshots/levelN.png   (816x516 — canvas is 800x500 plus border)
#
# Uses headless Chrome. Waits a moment so animation reaches a stable frame.

set -e
cd "$(dirname "$0")/.."

LEVEL="${1:-1}"
OUT="tools/screenshots/level${LEVEL}.png"
URL="file://$(pwd)/index.html?level=${LEVEL}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

"$CHROME" \
  --headless=new \
  --disable-gpu \
  --hide-scrollbars \
  --window-size=820,540 \
  --virtual-time-budget=2000 \
  --screenshot="$(pwd)/$OUT" \
  "$URL" 2>/dev/null

echo "→ $OUT"
