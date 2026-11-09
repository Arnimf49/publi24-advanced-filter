---
name: mobile-tester
description: Propagate local extension changes to a USB/WiFi-connected Android phone, reload the unpacked extension in Yandex Browser or Firefox for Android, and inspect/test the live page over CDP or the Firefox remote debugging protocol. Use whenever a change must be verified on a real mobile browser.
---

# Mobile tester

Reusable flows for testing this extension on a real mobile phone. Nothing in
this skill is specific to one feature or one page: it covers deployment,
extension reload, and page inspection.

Supported targets are Yandex Browser and Firefox for Android, plus Orion by
Kagi on iPhone/iPad.

> **Hard rule: never open the normal Chrome app (`com.android.chrome`)** with
> this skill or any of its scripts. Only Yandex Browser, Firefox for Android,
> and Orion on iOS are supported targets.

The project assumes the rollup watcher is already running and `./dist` is up to
date. **Do not run the bundler from this skill.**

## Prerequisites

- `adb` on `PATH` and the phone authorized (Android only).
- `zip` and `rsync` (used to build and stage the Firefox package).
- Yandex Browser (`com.yandex.browser`) and/or Firefox for Android
  (`org.mozilla.firefox`) installed.
- Yandex: the extension loaded once as an unpacked extension (see
  [First-time setup](#first-time-setup)).
- Firefox: **Settings -> Advanced -> Remote debugging via USB** enabled.
- iOS: Orion by Kagi installed, on the same Wi-Fi network as the computer.
  Enable third-party Chrome or Firefox extensions in Orion settings. USB is not
  needed for installation.

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

# Orion on iPhone/iPad: build .crx/.xpi and serve them over the LAN
.agents/skills/mobile-tester/scripts/deploy.sh orion

# Yandex + Firefox for Android
.agents/skills/mobile-tester/scripts/deploy.sh all
```

Then reload the page:

```bash
node .agents/skills/mobile-tester/scripts/yandex.mjs reload-tab <url-substring>
node .agents/skills/mobile-tester/scripts/firefox-rdp.mjs 9226 reload-tab <url-substring>
```

On iOS, installation and updates are manual steps in Orion; see
[Orion on iPhone/iPad](#orion-on-iphoneipad).

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

## Orion on iPhone/iPad

iOS cannot be driven the same way as Android. There is no `adb`, no unpacked
extension directory, and no CDP/RDP socket that this skill can attach to. The
supported flow is to package the current build as a local extension file, install
it once in Orion, and reinstall after each change.

Safari on iOS does not support WebExtensions, so Orion by Kagi is the only
useful iOS target. Orion supports both Chrome and Firefox extension formats.

Build both variants and serve them over the LAN:

```bash
.agents/skills/mobile-tester/scripts/deploy.sh orion
```

The script stages `dist/`, `library/`, `icon.png`, and `manifest.json` under
`.agents/skills/mobile-tester/.mobile/orion/`, then creates:

- `publi24-<version>-chrome.crx` — CRX3 package, Chrome-extension mode
- `publi24-<version>-firefox.xpi` — Firefox-extension mode, with
  `background.scripts` instead of a MV3 service worker

It prints a LAN URL and a QR code. The phone and computer must be on the same
network. Installation does **not** use USB.

First-time setup on the phone:

1. Orion -> **Settings -> Advanced** -> enable **Allow installation of 3rd party
   Chrome extensions** (and Firefox extensions if you plan to use the `.xpi`).
2. Scan the QR code, or open the printed URL in Orion.
3. Tap a package to download it.
4. Orion -> **••• -> Extensions -> + -> install from file**, then pick the
   downloaded package.

Try the `.crx` first. If the page script loads but background messages fail
(permissions, `RESOLVE_GOTO_URL`, `BACKGROUND_FETCH`), uninstall it and install
the `.xpi` instead: Orion's WebKit engine handles a Firefox-style background
script more reliably than a MV3 service worker.

To update, run `deploy.sh orion` again, re-download the package, and install it
again. The signing key is reused, so the extension id stays stable. Orion's
extension reload button can leave stale code in place on iOS; uninstall and
reinstall if the old build persists. If Orion refuses a same-version reinstall,
bump `version` in `manifest.json` first.

Inspect the current state without starting the server:

```bash
node .agents/skills/mobile-tester/scripts/orion.mjs status
```

It reports the available packages, the LAN address, and whether a USB iPhone is
visible. `ORION_PORT` changes the server port (default `8088`).

### Remote control and inspection

Orion iOS has no Chrome DevTools or Firefox RDP endpoint, so `yandex.mjs` and
`firefox-rdp.mjs` do not apply. Orion does provide an internal **Debug Log** and,
on current builds, a Web Inspector toggle under **Help & About**. If that is
enabled, `ios-webkit-debug-proxy` can expose Safari-style inspectable pages over
USB on Linux, but that is a separate tool and is not automated by this skill.

USB on iOS only matters for inspection, not for installing the extension. If the
device must be visible over USB:

```bash
sudo apt install libimobiledevice-utils
idevicepair pair          # unlock the phone and tap Trust
idevice_id -l
```

`usbmuxd` must be running, and a data-capable cable is required.

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

### Orion cannot reach the package server

Confirm the phone and computer are on the same network and that the printed URL
uses the computer's LAN address (not `127.0.0.1`). Check the port:

```bash
curl http://<computer-ip>:8088/health
```

If the computer has a firewall, allow TCP `8088`. Guest Wi-Fi networks often
block client-to-client traffic; use the same non-guest network on both devices.

### Orion rejects or ignores the package

Enable both third-party extension toggles in Orion settings and install through
**••• -> Extensions -> +**, not by opening the file directly. If the `.crx`
installs but background features do not work, uninstall it and try the `.xpi`.
If a same-version reinstall is ignored, bump `version` in `manifest.json` and
rebuild.

### iPhone is not visible over USB on Linux

Install the userspace tools, make sure `usbmuxd` is running, unlock the phone,
and accept **Trust This Computer**:

```bash
sudo apt install libimobiledevice-utils
sudo systemctl restart usbmuxd
lsusb | grep 05ac
idevice_id -l
```

If `lsusb` shows no Apple device at all, the cable may be charge-only, the port
may not carry data, or the phone has not been unlocked since it was plugged in.
USB visibility is only needed for Web Inspector; Orion installation over the LAN
still works without it.

## Notes

- Yandex uses the repository `manifest.json` as-is (MV3 service worker).
- Firefox and Orion's Firefox-extension mode must use `background.scripts`; the
  staging step handles this without modifying the tracked `manifest.json`.
- Orion's Chrome-extension mode uses the repository manifest as-is, packaged as
  CRX3 with a persistent local signing key.
- Scripts resolve Playwright from the repository's `node_modules`. Run them from
  the repository (or any subdirectory) so the import resolves.
- `.agents/skills/mobile-tester/.mobile/` is scratch space for the Firefox and
  Orion staging builds, the Orion signing key, and the generated packages. It is
  not tracked.
