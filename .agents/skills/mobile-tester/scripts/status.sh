#!/usr/bin/env bash
# Show the current mobile-testing state: device, forwarded ports, and the
# extension loaded in each browser.
#
# Usage: ./status.sh [yandex|firefox|orion|all]

set -euo pipefail

ROOT="$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)"
SCRIPTS="$ROOT/.agents/skills/mobile-tester/scripts"
YANDEX_CDP_PORT="${YANDEX_CDP_PORT:-9223}"
FIREFOX_RDP_PORT="${FIREFOX_RDP_PORT:-9226}"
TARGET="${1:-all}"

log() {
  printf '\n=== %s ===\n' "$*"
}

log "Devices"
adb devices -l

log "Forwarded ports"
adb forward --list || true

if [[ "$TARGET" == "yandex" || "$TARGET" == "all" ]]; then
  log "Yandex"

  if adb forward --list | grep -q "tcp:$YANDEX_CDP_PORT"; then
    if ! YANDEX_CDP_PORT="$YANDEX_CDP_PORT" node "$SCRIPTS/yandex.mjs" status; then
      echo "Could not query Yandex. Is it running?"
    fi
  else
    echo "No forward on tcp:$YANDEX_CDP_PORT (run: deploy.sh yandex)"
  fi
fi

if [[ "$TARGET" == "firefox" || "$TARGET" == "all" ]]; then
  log "Firefox"

  if adb forward --list | grep -q "tcp:$FIREFOX_RDP_PORT"; then
    if ! node "$SCRIPTS/firefox-rdp.mjs" "$FIREFOX_RDP_PORT" addons; then
      echo "Could not query Firefox. Is remote debugging enabled?"
    fi
  else
    echo "No forward on tcp:$FIREFOX_RDP_PORT (run: deploy.sh firefox)"
  fi
fi

if [[ "$TARGET" == "orion" || "$TARGET" == "all" ]]; then
  log "Orion iOS"
  node "$SCRIPTS/orion.mjs" status || true
fi

log "Local build"
if [[ -f "$ROOT/dist/common/background/background.js" ]]; then
  printf 'background.js: '
  stat -c '%y (%s bytes)' "$ROOT/dist/common/background/background.js"
else
  echo "No ./dist build found"
fi
