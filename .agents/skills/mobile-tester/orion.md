# Orion by Kagi on iPhone/iPad (CDP over USB)

Browser-specific reference for the `mobile-tester` skill. Common setup (core
loop, status helper, USB basics) lives in [`SKILL.md`](SKILL.md).

Safari on iOS does not support WebExtensions, so Orion by Kagi is the only
useful iOS target. Orion supports both Chrome and Firefox extension formats.

## How it works

iOS cannot be driven the same way as Android: there is no `adb`. Orion on iOS
does expose every WebView it creates to the system Web Inspector, and
`pymobiledevice3` turns that into a CDP endpoint over plain USB. The result is
close to the Yandex workflow: builds are delivered by USB, the extension is
reloaded over CDP, and tabs are inspected and driven with a script.

Orion also keeps a reference to the **folder** it installed an extension from.
Overwriting that folder (which lives in Orion's Documents container, the one
location iOS grants over USB) and calling `chrome.runtime.reload()` loads new
code with no interaction on the phone.

## Prerequisites

- Orion by Kagi installed on the phone.
- `pymobiledevice3` on the host:

  ```bash
  pipx install pymobiledevice3
  ```

  It is resolved from `PYMOBILEDEVICE3`, `PATH`, `~/.local/bin`, or a
  skill-local `.mobile/venv/bin`.
- On the phone: **Settings -> Safari -> Advanced -> Web Inspector** on (this is
  the system switch, not an Orion setting).
- In Orion: third-party Chrome/Firefox extensions enabled, and **Allow
  installation of 3rd party Chrome extensions** under **Settings -> Advanced**.

Check the device:

```bash
node .agents/skills/mobile-tester/scripts/orion.mjs status
```

It reports the staged packages, whether a USB iPhone is visible, whether the
`publi24-ext` folder is present, and the LAN address used by `--lan`.
`ORION_PORT` changes the LAN server port (default `8088`).

## Deploy over USB (default)

```bash
.agents/skills/mobile-tester/scripts/deploy.sh orion
```

After a one-time setup, this needs **no taps on the phone**: it syncs the build
into the folder Orion installed the extension from and reloads it over CDP.

The trick is to install the extension as an **unpacked folder** instead of a
`.crx`/`.xpi` package. Orion keeps a reference to that folder, so overwriting its
files and calling `chrome.runtime.reload()` loads the new code. The folder lives
in Orion's Documents container, which is the one location iOS grants over USB.

### One-time setup per device

1. `node .agents/skills/mobile-tester/scripts/orion.mjs push`
   (stages the build and copies both packages *and* the unpacked folder
   `publi24-ext` into Orion's Documents).
2. On the phone: Orion -> **••• -> Extensions -> + -> install from file**.
3. **On My iPhone -> Orion**, select the **folder** `publi24-ext`.
   (Folders are only selectable if you pick it as a folder; a plain file pick
   will not show it as installable.)

From then on:

```bash
.agents/skills/mobile-tester/scripts/deploy.sh orion      # sync + reload, no taps
.agents/skills/mobile-tester/scripts/deploy.sh orion --stamp
```

`--stamp` bumps the last version component (`3.16` -> `3.16.1`) so the build is
visibly different in Orion's extension list and in `bg-eval` output.

### Under the hood

- `.agents/skills/mobile-tester/scripts/orion.mjs sync` stages `dist/`,
  `library/`, `icon.png`, and `manifest.json` under
  `.agents/skills/mobile-tester/.mobile/orion/chrome`, pushes each entry into
  `publi24-ext`, then runs `orion-cdp.mjs reload-extension --expect <version>`.
- `reload-extension` calls `chrome.runtime.reload()` in the background page,
  waits for the replaced background WebView, and reports the version before and
  after. It fails (exit 1) if the version does not match, which catches a stale
  or missing folder install.

### Fallbacks

`push` remains available for the first install and as a fallback. It creates
`publi24-<version>-chrome.crx` (CRX3, Chrome-extension mode) and
`publi24-<version>-firefox.xpi` (Firefox-extension mode, `background.scripts`
instead of a MV3 service worker). If a folder install misbehaves, install one of
those files instead: Orion handles a Firefox-style background script more
reliably than a MV3 service worker. Package installs cannot be updated in place,
so reinstall through the picker each time.

`deploy.sh orion --lan` falls back to the old network flow: it builds the same
packages, serves them over HTTP on port `8088` (change with `ORION_PORT`), and
prints a LAN URL plus a QR code. Use it when no cable is available. On the
phone:

1. Scan the QR code, or open the printed URL in Orion (the phone and computer
   must be on the same network, and installation does **not** use USB).
2. Tap a package to download it.
3. Orion -> **••• -> Extensions -> + -> install from file**, then pick the
   downloaded package.

The signing key is reused, so the extension id stays stable. Orion's in-app
extension reload button can leave stale code in place on iOS; uninstall and
reinstall if an old build persists.

## Inspect and control over CDP

```bash
node .agents/skills/mobile-tester/scripts/orion-cdp.mjs tabs
```

The first command starts the CDP bridge (`pymobiledevice3 webinspector cdp`) in
the background on port `9222` (`ORION_CDP_PORT`), leaves it running, and prints
the inspectable WebViews. `orion-cdp.mjs stop` shuts the bridge down.

| Task | Command |
| --- | --- |
| List tabs/WebViews | `node .../orion-cdp.mjs tabs` |
| Device + bridge status | `node .../orion-cdp.mjs status` |
| Navigate a tab | `node .../orion-cdp.mjs navigate <url> <url-substring>` |
| Click an element | `node .../orion-cdp.mjs click '<css-selector>' <url-substring>` |
| Reload a page | `node .../orion-cdp.mjs reload-tab <url-substring>` |
| Reload the extension itself | `node .../orion-cdp.mjs reload-extension` |
| Evaluate JS in a page | `node .../orion-cdp.mjs eval '<js>' <url-substring>` |
| Evaluate JS in the extension background page | `node .../orion-cdp.mjs bg-eval '<js>'` |
| Page screenshot | `node .../orion-cdp.mjs screenshot <out.png> <url-substring>` |
| Stream console + exceptions | `node .../orion-cdp.mjs console [seconds] <url-substring>` |
| Tail Orion's Debug Log | `node .../orion-cdp.mjs debug-log [lines]` |

`eval` returns the expression value; use `JSON.stringify(...)` for complex data.
Without a URL substring, the first loaded `http(s)` tab is used. The extension
background page is a real target, so `chrome.runtime` and extension storage can
be inspected directly:

```bash
node .agents/skills/mobile-tester/scripts/orion-cdp.mjs bg-eval \
  'JSON.stringify({id: chrome.runtime.id, version: chrome.runtime.getManifest().version})'
```

Shape check, same as the other targets:

```bash
node .agents/skills/mobile-tester/scripts/orion-cdp.mjs eval \
  'JSON.stringify({url: location.href, injected: document.querySelectorAll("[data-wwid]").length})' \
  <url-substring>
```

There is no `open` command: Orion does not support CDP target creation. Use
`navigate` on an existing tab, or tap a new tab on the phone.

## Command latency

Commands against the **same** WebView take about 150 ms. iOS allows only one
inspector session at a time, so a command that has to attach to a WebView the
previous command was not using pays a device-side re-attach: usually ~6 s,
sometimes ~26 s when the previous session is still being torn down. The script
prints `attaching to ... (slow WebView switch)` while that happens.

Measured on an iPhone X / iOS 18.3:

- `eval`/`bg-eval` on the current target: ~150 ms.
- `reload-extension` when warm: ~1.5 s.
- `deploy.sh orion` (13 MB push + reload): ~15-35 s, dominated by the first
  WebView attach.

Practical rules:

- Do not alternate `eval` (page) and `bg-eval` in a tight loop; batch each side.
- Run one expression that returns everything you need instead of many calls.
- A cold deploy is slow; a second deploy right after is much faster.

## Phone state requirements

The phone must stay unlocked and Orion must be in the foreground. iOS removes
inspectable WebViews from the target list when the screen locks or Orion is
backgrounded, and `tabs` then returns an empty list. Bring Orion forward and
retry. The extension background page target also appears only a few seconds
after Orion launches or the extension is installed; `eval`/`bg-eval` wait for it
briefly on their own.

## What is not possible on iOS

- **Automated first install.** Orion has no URL scheme, CLI, or extension API for
  installing something new, so the very first "install from file" has to be
  tapped on the phone. After that, the folder-based install makes updates fully
  scriptable (`deploy.sh orion`).
- **Writing into Orion's Library.** Only Documents is reachable over USB
  (`UIFileSharingEnabled`); the app's Library is refused
  (`InstallationLookupFailed`). That is why the extension must be installed from
  a folder in Documents - a `.crx`/`.xpi` install cannot be updated in place.
- **New tabs over CDP**, as noted above.
- **Browser-UI screenshots.** `screenshot` captures the page content only. A
  full-device screenshot needs a mounted developer disk image and
  `sudo pymobiledevice3 remote tunneld` on iOS 17+, which this skill does not
  use.
- **The legacy `ios-webkit-debug-proxy` route.** It can expose Safari-style
  inspectable pages, but this skill uses `pymobiledevice3` instead, which also
  handles delivery, reload, and the extension background page.

USB is required for both delivery and inspection. If the phone is not visible,
pair it once (unlock the phone and tap **Trust**):

```bash
idevicepair pair
node .agents/skills/mobile-tester/scripts/orion.mjs status
```

## Troubleshooting

### `sync` says the `publi24-ext` folder is missing

The device has never had the folder install. Run
`node .agents/skills/mobile-tester/scripts/orion.mjs push` and install the
folder `publi24-ext` through **••• -> Extensions -> + -> install from file**.

If Orion has the **package** (`.crx`/`.xpi`) installed rather than the folder,
`sync` will push files and then fail with a version mismatch. Uninstall the
package, install the folder, and run `sync` again.

### `sync` pushes files but the extension version does not change

`reload-extension` prints `before`/`after` and exits 1 when they differ from the
expected version. Check Orion still lists the extension, that the phone is
unlocked, and that Orion is in the foreground. Then retry:

```bash
node .agents/skills/mobile-tester/scripts/orion-cdp.mjs reload-extension --expect <version>
```

If it keeps failing, uninstall and reinstall the folder once - Orion loses the
folder reference when the folder is moved or deleted.

### Orion rejects or ignores the package

Enable both third-party extension toggles in Orion settings and install through
**••• -> Extensions -> +**, not by opening the file directly. If the `.crx`
installs but background messages fail (permissions, `RESOLVE_GOTO_URL`,
`BACKGROUND_FETCH`), uninstall it and try the `.xpi`: Orion handles a
Firefox-style background script more reliably than a MV3 service worker.

### Orion packages do not appear in the file picker

`deploy.sh orion` copies them into Orion's Documents folder, which shows up in
the picker as **On My iPhone -> Orion**. Confirm they landed:

```bash
node -e "import('./.agents/skills/mobile-tester/scripts/ios.mjs').then(({ios}) => console.log(ios.listDocuments()))"
```

If the list is empty, the phone is locked or the AFC session was refused; unlock
the phone and retry. The app must be running at least once after install. A
folder entry only shows up as installable when the picker is in folder mode.

### Orion cannot reach the package server (LAN flow only)

Confirm the phone and computer are on the same network and that the printed URL
uses the computer's LAN address (not `127.0.0.1`). Check the port:

```bash
curl http://<computer-ip>:8088/health
```

If the computer has a firewall, allow TCP `8088`. Guest Wi-Fi networks often
block client-to-client traffic; use the same non-guest network on both devices.

### Orion CDP bridge fails to start

`orion-cdp.mjs` starts `pymobiledevice3 webinspector cdp` in the background. Its
output is in `.agents/skills/mobile-tester/.mobile/orion/cdp-<port>.log`.

- **"Web inspector is not enabled"** — turn on **Settings -> Safari -> Advanced
  -> Web Inspector** on the phone (system setting, not Orion's).
- **Empty target list** — Orion is not running, the phone is locked, or Orion is
  backgrounded. Unlock the phone and bring Orion to the foreground; the first
  `/json/list` can take a few seconds to fill.
- **Port already in use** — stop the old bridge with `orion-cdp.mjs stop`, or set
  `ORION_CDP_PORT` to a free port.
- **A single command seems to hang for a few seconds** — the first attach to a
  different WebView (typically the extension background page) makes the bridge
  re-attach on the device. Repeat commands against the same tab are immediate.

### iPhone is not visible over USB on Linux

Install the userspace tools, make sure `usbmuxd` is running, unlock the phone,
and accept **Trust This Computer**:

```bash
sudo apt install libimobiledevice-utils
sudo systemctl restart usbmuxd
lsusb | grep 05ac
idevicepair pair
idevice_id -l
```

If `lsusb` shows no Apple device at all, the cable may be charge-only, the port
may not carry data, or the phone has not been unlocked since it was plugged in.
USB is needed for both package delivery and CDP inspection, but the LAN flow
(`deploy.sh orion --lan`) still works without it.

### The extension reloads but the page looks unchanged

Content scripts are injected at document start, so reload the tested tab - see
[the shared note](SKILL.md#extension-reloads-but-the-page-looks-unchanged).

## Notes

- Orion's Firefox-extension mode must use `background.scripts`; the staging step
  handles this without modifying the tracked `manifest.json`.
- Orion's Chrome-extension mode uses the repository manifest as-is, packaged as
  CRX3 with a persistent local signing key.
- `orion-cdp.mjs` needs a Node build with `WebSocket`; on Node 20 it re-executes
  itself with `--experimental-websocket` automatically.
- `.mobile/orion/` holds the staged builds (`.mobile/orion/chrome` is the folder
  that gets synced to the phone), the signing key, generated packages, CDP
  pid/log files, and the version stamp. It is not tracked.
- The phone copy lives at `Documents/publi24-ext` (folder install) plus the
  `.crx`/`.xpi` packages in `Documents`; the CDP bridge defaults to port `9222`
  (`ORION_CDP_PORT`).
