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

# Find a Chrome/Chromium binary — works on macOS and Linux.
CHROME=""
for c in \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "/Applications/Chromium.app/Contents/MacOS/Chromium" \
  google-chrome google-chrome-stable chromium chromium-browser chrome; do
  if command -v "$c" >/dev/null 2>&1 || [ -x "$c" ]; then CHROME="$c"; break; fi
done
if [ -z "$CHROME" ]; then
  echo "No Chrome/Chromium found. Install Google Chrome or Chromium." >&2
  exit 1
fi

# --no-sandbox is required when running as root / in headless Linux boxes;
# harmless on macOS.
mkdir -p tools/screenshots
"$CHROME" \
  --headless=new \
  --disable-gpu \
  --no-sandbox \
  --hide-scrollbars \
  --window-size=820,540 \
  --virtual-time-budget=2000 \
  --screenshot="$(pwd)/$OUT" \
  "$URL" 2>/dev/null

echo "→ $OUT"
