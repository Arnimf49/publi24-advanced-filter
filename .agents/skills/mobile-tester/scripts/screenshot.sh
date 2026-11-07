#!/usr/bin/env bash
# Capture the phone screen (includes the browser UI).
#
# Usage: ./screenshot.sh <output.png>
#
# For a page-only screenshot, use:
#   node yandex.mjs screenshot <output.png> [url-substring]

set -euo pipefail

OUTPUT="${1:?Usage: screenshot.sh <output.png>}"

adb exec-out screencap -p > "$OUTPUT"
printf 'Saved %s\n' "$OUTPUT"
