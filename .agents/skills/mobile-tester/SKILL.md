---
name: mobile-tester
description: Propagate local extension changes to a USB/WiFi-connected Android phone or an iPhone, reload the extension in Yandex Browser, Firefox for Android, or Orion by Kagi, and inspect/test the live page over CDP or the Firefox remote debugging protocol. Use whenever a change must be verified on a real mobile browser.
---

# Mobile tester

Reusable flows for testing this extension on a real mobile phone. Nothing in
this skill is specific to one feature or one page: it covers deployment,
extension reload, and page inspection.

Supported targets and their browser-specific references:

| Target | Platform | Reference |
| --- | --- | --- |
| Yandex Browser (Chromium/CDP) | Android | [`chrome.md`](chrome.md) |
| Firefox for Android (RDP) | Android | [`firefox.md`](firefox.md) |
| Orion by Kagi (CDP over USB) | iPhone/iPad | [`orion.md`](orion.md) |

> **Hard rule: never open the normal Chrome app (`com.android.chrome`)** with
> this skill or any of its scripts. Only Yandex Browser, Firefox for Android,
> and Orion on iOS are supported targets.

The project assumes the rollup watcher is already running and `./dist` is up to
date. **Do not run the bundler from this skill.**

## Prerequisites

Common to all targets:

- `adb` on `PATH` and the Android phone authorized.
- `zip` and `rsync` (used to build and stage the Firefox package).

Per target:

- **Yandex:** browser installed, extension loaded once as unpacked
  (see [`chrome.md`](chrome.md#first-time-setup)).
- **Firefox for Android:** **Settings -> Advanced -> Remote debugging via USB**
  enabled (see [`firefox.md`](firefox.md#first-time-setup)).
- **Orion:** `pymobiledevice3` (`pipx install pymobiledevice3`), the system
  **Web Inspector** switch on, and a one-time folder install
  (see [`orion.md`](orion.md)).

Check the connection:

```bash
adb devices -l
node .agents/skills/mobile-tester/scripts/orion.mjs status   # iOS
```

When more than one Android device is connected (for example USB and WiFi),
select one:

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

# Orion on iPhone/iPad: sync the installed folder over USB and reload it
.agents/skills/mobile-tester/scripts/deploy.sh orion

# Yandex + Firefox for Android
.agents/skills/mobile-tester/scripts/deploy.sh all
```

Then reload the page:

```bash
node .agents/skills/mobile-tester/scripts/yandex.mjs reload-tab <url-substring>
node .agents/skills/mobile-tester/scripts/firefox-rdp.mjs 9226 reload-tab <url-substring>
node .agents/skills/mobile-tester/scripts/orion-cdp.mjs reload-tab <url-substring>
```

On iOS, the first install is a few manual taps; after that `deploy.sh orion`
updates the extension with no interaction
(see [`orion.md`](orion.md#deploy-over-usb-default)).

## Helpers

- `scripts/open-url.sh <yandex|firefox> <url>` opens a URL in the chosen
  browser.
- `scripts/status.sh [yandex|firefox|orion|all]` prints the device, forwarded
  ports, and loaded extension versions.
- `scripts/screenshot.sh /tmp/mobile-shot.png` captures the whole Android screen
  (including browser UI) over `adb`.

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

### Extension reloads but the page looks unchanged

Content scripts are injected at document start. Reload the page after reloading
the extension:

```bash
node .agents/skills/mobile-tester/scripts/yandex.mjs reload-tab <url-substring>
node .agents/skills/mobile-tester/scripts/firefox-rdp.mjs 9226 reload-tab <url-substring>
node .agents/skills/mobile-tester/scripts/orion-cdp.mjs reload-tab <url-substring>
```

Browser-specific causes are in [`chrome.md`](chrome.md),
[`firefox.md`](firefox.md), and [`orion.md`](orion.md).

## Notes

- Scripts resolve Playwright from the repository's `node_modules`. Run them from
  the repository (or any subdirectory) so the import resolves.
- `.agents/skills/mobile-tester/.mobile/` is untracked scratch space: each target
  keeps its staging build, generated packages, and any keys or pid/log files
  there. See the per-browser reference for the exact layout.
