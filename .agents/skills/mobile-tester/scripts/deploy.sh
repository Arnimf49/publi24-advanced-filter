#!/usr/bin/env bash
# Propagate the local build to a connected Android phone.
#
# Usage:
#   ./deploy.sh yandex [--all]   # copy dist + manifest to /sdcard/Download/extension and reload
#   ./deploy.sh firefox          # build an .xpi from the local build and install it temporarily
#   ./deploy.sh all
#
# Environment:
#   ANDROID_SERIAL       Device serial when several devices are connected.
#   YANDEX_CDP_PORT      CDP port for Yandex (default 9223).
#   FIREFOX_RDP_PORT     RDP port for Firefox (default 9226).
#   YANDEX_EXT_DIR       Unpacked extension directory on the phone.
#
# This script assumes the rollup watcher is already writing ./dist.
# It never runs the bundler.

set -euo pipefail

ROOT="$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)"
SKILL_DIR="$ROOT/.agents/skills/mobile-tester"
SCRIPTS="$SKILL_DIR/scripts"
YANDEX_CDP_PORT="${YANDEX_CDP_PORT:-9223}"
FIREFOX_RDP_PORT="${FIREFOX_RDP_PORT:-9226}"
YANDEX_EXT_DIR="${YANDEX_EXT_DIR:-/sdcard/Download/extension}"
FIREFOX_DEVICE_DIR="/data/local/tmp/mobile-tester"
FIREFOX_XPI_DEVICE="$FIREFOX_DEVICE_DIR/publi24.xpi"
FIREFOX_STAGE="$SKILL_DIR/.mobile/firefox"
FIREFOX_XPI_LOCAL="$SKILL_DIR/.mobile/publi24.xpi"

TARGET="${1:-all}"
shift || true
PUSH_ALL_LIBRARIES=false

for arg in "$@"; do
  case "$arg" in
    --all)
      PUSH_ALL_LIBRARIES=true
      ;;
    *)
      echo "Unknown option: $arg" >&2
      exit 1
      ;;
  esac
done

log() {
  printf '[deploy] %s\n' "$*"
}

require_build() {
  if [[ ! -f "$ROOT/dist/common/background/background.js" ]]; then
    echo "Missing ./dist build. Start the rollup watcher first (npm run rollup)." >&2
    exit 1
  fi
}

start_app() {
  local package="$1"
  local component="$2"

  adb shell am start -n "$component" >/dev/null 2>&1 || true
  adb shell monkey -p "$package" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1 || true
}

wait_for_unix_socket() {
  local socket="$1"
  local attempts="${2:-60}"

  for ((i = 0; i < attempts; i++)); do
    if adb shell cat /proc/net/unix 2>/dev/null | grep -q "$socket"; then
      return 0
    fi
    sleep 0.5
  done

  return 1
}

forward_port() {
  local port="$1"
  local socket="$2"

  adb forward "tcp:$port" "localabstract:$socket" >/dev/null
}

deploy_yandex() {
  log "Deploying to Yandex Browser"

  start_app "com.yandex.browser" "com.yandex.browser/.YandexBrowserActivity"

  if ! wait_for_unix_socket "yandex_devtools_remote" 40; then
    echo "Yandex devtools socket not found. Start Yandex and retry." >&2
    exit 1
  fi

  forward_port "$YANDEX_CDP_PORT" "yandex_devtools_remote"

  adb shell mkdir -p "$YANDEX_EXT_DIR"
  log "Pushing dist/ and manifest.json to $YANDEX_EXT_DIR"
  adb push "$ROOT/dist/." "$YANDEX_EXT_DIR/dist/" >/dev/null
  adb push "$ROOT/manifest.json" "$YANDEX_EXT_DIR/manifest.json" >/dev/null

  if [[ "$PUSH_ALL_LIBRARIES" == true ]]; then
    log "Pushing library/ and icon.png"
    adb push "$ROOT/library/." "$YANDEX_EXT_DIR/library/" >/dev/null
    adb push "$ROOT/icon.png" "$YANDEX_EXT_DIR/icon.png" >/dev/null
  fi

  log "Reloading the unpacked extension"
  YANDEX_CDP_PORT="$YANDEX_CDP_PORT" node "$SCRIPTS/yandex.mjs" reload
  log "Yandex reloaded. Reload the tested tab (yandex.mjs reload-tab <url-substring>) if needed."
}

deploy_firefox() {
  log "Deploying to Firefox for Android"

  start_app "org.mozilla.firefox" "org.mozilla.firefox/.App"

  if ! wait_for_unix_socket "org.mozilla.firefox/firefox-debugger-socket" 40; then
    echo "Firefox debugger socket not found." >&2
    echo "Enable Settings -> Advanced -> Remote debugging via USB, then retry." >&2
    exit 1
  fi

  forward_port "$FIREFOX_RDP_PORT" "org.mozilla.firefox/firefox-debugger-socket"

  log "Staging Firefox build in $FIREFOX_STAGE"
  mkdir -p "$FIREFOX_STAGE"
  rsync -a --delete "$ROOT/dist/" "$FIREFOX_STAGE/dist/"
  rsync -a --delete "$ROOT/library/" "$FIREFOX_STAGE/library/"
  cp "$ROOT/icon.png" "$FIREFOX_STAGE/icon.png"
  cp "$ROOT/escort-listing-domains.json" "$FIREFOX_STAGE/escort-listing-domains.json" 2>/dev/null || true

  node -e '
    const fs = require("node:fs");
    const source = process.argv[1];
    const destination = process.argv[2];
    const manifest = JSON.parse(fs.readFileSync(source, "utf8"));
    // Firefox for Android uses an event page, not a MV3 service worker.
    manifest.background = {scripts: ["dist/common/background/background.js"]};
    fs.writeFileSync(destination, JSON.stringify(manifest, null, 2) + "\n");
  ' "$ROOT/manifest.json" "$FIREFOX_STAGE/manifest.json"

  rm -f "$FIREFOX_XPI_LOCAL"
  (cd "$FIREFOX_STAGE" && zip -qr "$FIREFOX_XPI_LOCAL" .)

  log "Pushing $FIREFOX_XPI_LOCAL to $FIREFOX_XPI_DEVICE"
  adb shell mkdir -p "$FIREFOX_DEVICE_DIR"
  adb push "$FIREFOX_XPI_LOCAL" "$FIREFOX_XPI_DEVICE" >/dev/null

  # installTemporaryAddon replaces a previously installed temporary add-on
  # with the same id, and always reads the file from the path pushed above.
  log "Installing the temporary add-on"
  node "$SCRIPTS/firefox-rdp.mjs" "$FIREFOX_RDP_PORT" install "$FIREFOX_XPI_DEVICE"
  log "Firefox add-on installed. Reload the tested tab (firefox-rdp.mjs reload-tab <url-substring>) if needed."
  log "Firefox temporary add-ons are lost when Firefox restarts; run this script again after a restart."
}

main() {
  require_build

  case "$TARGET" in
    yandex)
      deploy_yandex
      ;;
    firefox)
      deploy_firefox
      ;;
    all)
      deploy_yandex
      deploy_firefox
      ;;
    *)
      echo "Usage: deploy.sh <yandex|firefox|all> [--all]" >&2
      exit 1
      ;;
  esac
}

main "$@"
