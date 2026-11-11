# Firefox for Android (remote debugging protocol)

Browser-specific reference for the `mobile-tester` skill. Common setup (devices,
core loop, USB basics) lives in [`SKILL.md`](SKILL.md).

## How it works

Firefox temporary add-ons accept a directory zipped as an `.xpi`. Because the
phone build needs the Firefox manifest variant, `deploy.sh firefox` stages the
build under `.agents/skills/mobile-tester/.mobile/firefox`, rewrites
`background.service_worker` to `background.scripts`, zips it, pushes it to
`/data/local/tmp/mobile-tester/publi24.xpi`, and installs it with
`installTemporaryAddon`.

Temporary add-ons disappear when Firefox restarts. Run `deploy.sh firefox`
again after a browser restart; it reinstalls the add-on.

Firefox's `evaluateJSAsync` returns a result id and a later `evaluationResult`
event; `firefox-rdp.mjs` handles that. Only one client should own the debugger
socket at a time, so do not keep `web-ext run` active while using these
commands.

## Prerequisites

- `adb` on `PATH` and the phone authorized.
- Firefox for Android (`org.mozilla.firefox`) installed.
- On the phone: **Settings -> Advanced -> Remote debugging via USB** enabled.
- `zip` and `rsync` on the host (used to build and stage the package).

## First-time setup

1. In Firefox open **Settings -> Advanced**.
2. Enable **Remote debugging via USB**.
3. Run `deploy.sh firefox`; it starts Firefox, forwards the debugger socket on
   TCP `9226`, and installs the add-on.

## Deploy

```bash
.agents/skills/mobile-tester/scripts/deploy.sh firefox
```

The RDP port can be changed with `FIREFOX_RDP_PORT`.

## Commands

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

## Troubleshooting

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

### The RDP forward is stale

See [the shared forward cleanup](SKILL.md#a-debug-port-is-already-forwarded-or-stale);
`deploy.sh` recreates the forward it needs.

### Extension reloads but the page looks unchanged

Content scripts are injected at document start, so reload the tested tab - see
[the shared note](SKILL.md#extension-reloads-but-the-page-looks-unchanged).

## Notes

- The phone build needs the Firefox manifest variant: `background.service_worker`
  is rewritten to `background.scripts`. The staging step does this without
  modifying the tracked `manifest.json`.
- Staging happens under `.mobile/firefox`, the built package is
  `.mobile/publi24.xpi`, and the copy on the phone is
  `/data/local/tmp/mobile-tester/publi24.xpi`.
- The RDP port can be changed with `FIREFOX_RDP_PORT` (default `9226`).
