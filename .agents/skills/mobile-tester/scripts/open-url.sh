#!/usr/bin/env bash
# Open a URL in a browser on the connected Android phone.
#
# Usage:
#   ./open-url.sh yandex <url>
#   ./open-url.sh firefox <url>
#
# Set ANDROID_SERIAL when several devices are connected.

set -euo pipefail

BROWSER="${1:?Usage: open-url.sh <yandex|firefox> <url>}"
URL="${2:?Usage: open-url.sh <yandex|firefox> <url>}"

case "$BROWSER" in
  yandex)
    PACKAGE="com.yandex.browser"
    ;;
  firefox)
    PACKAGE="org.mozilla.firefox"
    ;;
  *)
    echo "Unknown browser: $BROWSER (use yandex or firefox)" >&2
    exit 1
    ;;
esac

adb shell "am start -a android.intent.action.VIEW -d '$URL' -p '$PACKAGE'" >/dev/null
printf 'Opened %s in %s\n' "$URL" "$BROWSER"
