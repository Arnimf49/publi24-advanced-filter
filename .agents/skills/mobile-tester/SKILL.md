---
name: mobile-tester
description: Propagate local extension changes to a USB/WiFi-connected Android phone, reload the unpacked extension in Yandex Browser or Firefox for Android, and inspect/test the live page over CDP or the Firefox remote debugging protocol. Use whenever a change must be verified on a real mobile browser.
---

# Mobile tester

Reusable flows for testing this extension on a real Android phone. Nothing in
this skill is specific to one feature or one page: it covers deployment,
extension reload, and page inspection.

> **Hard rule: never open the normal Chrome app (`com.android.chrome`)** with
> this skill or any of its scripts. Only Yandex Browser and Firefox for Android
> are supported targets.

The project assumes the rollup watcher is already running and `./dist` is up to
date. **Do not run the bundler from this skill.**

## Prerequisites

- `adb` on `PATH` and the phone authorized.
- `zip` and `rsync` (used to build and stage the Firefox package).
- Yandex Browser (`com.yandex.browser`) and/or Firefox for Android
  (`org.mozilla.firefox`) installed.
- Yandex: the extension loaded once as an unpacked extension (see
  [First-time setup](#first-time-setup)).
- Firefox: **Settings -> Advanced -> Remote debugging via USB** enabled.

Check the connection:

```bash
adb devices -l
```

When more than one device is connected (for example USB and WiFi), select one:

```bash
export ANDROID_SERIAL=192.168.50.201:5555
```

Keep the screen awake during longer runs:

```bash
adb shell svc power stayon true
```

## Core loop

1. Change code locally; wait for the rollup watcher to write `./dist`.
2. Deploy the new build to the phone.
3. Reload the extension.
4. Reload the tested tab (content scripts are not re-injected into an already
   loaded document).
5. Inspect or test the page.

Use the scripts from the repository root:

```bash
# Yandex: push dist/ + manifest, then reload the unpacked extension
.agents/skills/mobile-tester/scripts/deploy.sh yandex

# Firefox: build an .xpi, install it as a temporary add-on
.agents/skills/mobile-tester/scripts/deploy.sh firefox

# Both
.agents/skills/mobile-tester/scripts/deploy.sh all
```

Then reload the page:

```bash
node .agents/skills/mobile-tester/scripts/yandex.mjs reload-tab <url-substring>
node .agents/skills/mobile-tester/scripts/firefox-rdp.mjs 9226 reload-tab <url-substring>
```

Helper: `scripts/open-url.sh <yandex|firefox> <url>` opens a URL in the chosen
browser, and `scripts/status.sh` prints the device, forwards, and loaded
extension versions.

## Yandex Browser (Chromium/CDP)

Yandex exposes a devtools socket named `yandex_devtools_remote`. `deploy.sh`
starts Yandex, forwards it on TCP 9223, pushes the build to
`/sdcard/Download/extension`, and calls `chrome.developerPrivate.reload()` on
the unpacked extension.

| Task | Command |
| --- | --- |
| List tabs | `node .../yandex.mjs tabs` |
| Open a URL | `node .../yandex.mjs open <url>` |
| Click an element | `node .../yandex.mjs click '<css-selector>' <url-substring>` |
| Reload the extension | `node .../yandex.mjs reload` |
| Reload a page | `node .../yandex.mjs reload-tab <url-substring>` |
| Evaluate JS in a page | `node .../yandex.mjs eval '<js>' <url-substring>` |
| Page screenshot | `node .../yandex.mjs screenshot <out.png> <url-substring>` |
| Extension info | `node .../yandex.mjs status` |

`eval` returns the expression value. Use `JSON.stringify(...)` in the
expression for complex data.

Useful shape check:

```bash
node .agents/skills/mobile-tester/scripts/yandex.mjs eval \
  'JSON.stringify({url: location.href, injected: document.querySelectorAll("[data-wwid]").length})' \
  <url-substring>
```

The CDP port can be changed with `YANDEX_CDP_PORT`.

## Firefox for Android (remote debugging protocol)

Firefox temporary add-ons accept a directory zipped as an `.xpi`. Because the
phone build needs the Firefox manifest variant, `deploy.sh firefox` stages the
build under `.agents/skills/mobile-tester/.mobile/firefox`, rewrites
`background.service_worker` to `background.scripts`, zips it, pushes it to
`/data/local/tmp/mobile-tester/publi24.xpi`, and installs it with
`installTemporaryAddon`.

Temporary add-ons disappear when Firefox restarts. Run `deploy.sh firefox`
again after a browser restart; it reinstalls the add-on.

| Task | Command |
| --- | --- |
| List tabs | `node .../firefox-rdp.mjs 9226 tabs` |
| List add-ons | `node .../firefox-rdp.mjs 9226 addons` |
| Open a URL | `scripts/open-url.sh firefox <url>` |
| Navigate a tab | `node .../firefox-rdp.mjs 9226 navigate <url> <url-substring>` |
| Install/replace the add-on | `node .../firefox-rdp.mjs 9226 install /data/local/tmp/mobile-tester/publi24.xpi` |
| Reload the add-on | `node .../firefox-rdp.mjs 9226 reload <addon-id-or-name>` |
| Reload a page | `node .../firefox-rdp.mjs 9226 reload-tab <url-substring>` |
| Evaluate JS in a page | `node .../firefox-rdp.mjs 9226 eval '<js>' <url-substring>` |

Example:

```bash
node .agents/skills/mobile-tester/scripts/firefox-rdp.mjs 9226 eval \
  'JSON.stringify({url: location.href, injected: document.querySelectorAll("[data-wwid]").length})' \
  <url-substring>
```

Firefox's `evaluateJSAsync` returns a result id and a later `evaluationResult`
event; `firefox-rdp.mjs` handles that. Only one client should own the debugger
socket at a time, so do not keep `web-ext run` active while using these
commands.

Screenshots of the full phone screen (including browser UI):

```bash
.agents/skills/mobile-tester/scripts/screenshot.sh /tmp/mobile-shot.png
```

## First-time setup

### Yandex

The unpacked extension lives in a directory on the phone and is loaded through
Yandex's extensions page. On a fresh device:

1. Push a build once: `deploy.sh yandex`.
2. In Yandex open `chrome://extensions`.
3. Enable Developer mode.
4. Choose **Load unpacked** and select `/sdcard/Download/extension`.

`deploy.sh` can push `library/` and `icon.png` too with `--all` when those
assets change:

```bash
.agents/skills/mobile-tester/scripts/deploy.sh yandex --all
```

### Firefox

1. In Firefox open **Settings -> Advanced**.
2. Enable **Remote debugging via USB**.
3. Run `deploy.sh firefox`; it starts Firefox, forwards the debugger socket on
   TCP 9226, and installs the add-on.

## Troubleshooting

### USB keeps reconnecting

Long runs (especially `web-ext`) can be interrupted by a flaky USB link. Prefer
wireless ADB:

```bash
adb tcpip 5555
adb connect <phone-ip>:5555
export ANDROID_SERIAL=<phone-ip>:5555
```

Then re-run the deploy command. `adb wait-for-device` waits for a reconnect.

### A debug port is already forwarded or stale

```bash
adb forward --list
adb forward --remove tcp:9223
adb forward --remove tcp:9226
```

`deploy.sh` recreates the forward it needs.

### Firefox debugger socket is missing

The socket only exists while Firefox is running with remote debugging enabled.
Start Firefox, then check:

```bash
adb shell cat /proc/net/unix | grep firefox-debugger-socket
```

If it is absent, enable **Remote debugging via USB** in Firefox settings.

### Firefox blocks a new tab / popup opened by the extension

Firefox asks **Allow this site to open?** when the extension calls
`window.open()` after an `await` (the user gesture has expired by then). If the
prompt is denied, the feature that relies on the new tab silently produces no
results. Either allow the popup, or open tabs from the extension background
(`tabs.create`) instead of `window.open` in a content script.

This prompt is a browser behavior; it can be reproduced while testing by
tapping the extension button and watching for the Firefox dialog.

### Extension reloads but the page looks unchanged

Content scripts are injected at document start. Reload the page after reloading
the extension:

```bash
node .../yandex.mjs reload-tab <url-substring>
node .../firefox-rdp.mjs 9226 reload-tab <url-substring>
```

### Yandex cannot find the unpacked extension

`yandex.mjs reload` only reloads an extension with `location: UNPACKED` whose
name contains `Publi24` (override with an argument). Confirm it is loaded:

```bash
node .agents/skills/mobile-tester/scripts/yandex.mjs status
```

## Notes

- Yandex uses the repository `manifest.json` as-is (MV3 service worker).
- Firefox must use `background.scripts`; the staging step handles this without
  modifying the tracked `manifest.json`.
- Scripts resolve Playwright from the repository's `node_modules`. Run them from
  the repository (or any subdirectory) so the import resolves.
- `.agents/skills/mobile-tester/.mobile/` is scratch space for the Firefox
  staging build and is not tracked.
