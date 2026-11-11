# Chrome-family target: Yandex Browser on Android (Chromium/CDP)

Browser-specific reference for the `mobile-tester` skill. Common setup (devices,
core loop, USB basics) lives in [`SKILL.md`](SKILL.md).

> **Hard rule: never open the normal Chrome app (`com.android.chrome`).**
> Yandex Browser is the supported Chromium target; it exposes the same CDP
> surface as Chrome, so this file is also the reference for "Chrome mode".

## How it works

Yandex exposes a devtools socket named `yandex_devtools_remote`. `deploy.sh`
starts Yandex, forwards it on TCP `9223`, pushes the build to
`/sdcard/Download/extension`, and calls `chrome.developerPrivate.reload()` on the
unpacked extension.

The repository `manifest.json` is used as-is (MV3 service worker).

## Prerequisites

- `adb` on `PATH` and the phone authorized.
- Yandex Browser (`com.yandex.browser`) installed.
- The extension loaded once as an unpacked extension (see
  [First-time setup](#first-time-setup)).

## First-time setup

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

## Deploy

```bash
.agents/skills/mobile-tester/scripts/deploy.sh yandex
```

This pushes `dist/` and `manifest.json`, then reloads the unpacked extension.

## Commands

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

## Troubleshooting

### Yandex cannot find the unpacked extension

`yandex.mjs reload` only reloads an extension with `location: UNPACKED` whose
name contains `Publi24` (override with an argument). Confirm it is loaded:

```bash
node .agents/skills/mobile-tester/scripts/yandex.mjs status
```

### The CDP forward is stale

See [the shared forward cleanup](SKILL.md#a-debug-port-is-already-forwarded-or-stale);
`deploy.sh` recreates the forward it needs.

### Extension reloads but the page looks unchanged

Content scripts are injected at document start, so reload the tested tab - see
[the shared note](SKILL.md#extension-reloads-but-the-page-looks-unchanged).

## Notes

- Yandex uses the repository `manifest.json` as-is (MV3 service worker); nothing
  is rewritten for this target.
- The pushed build lives at `/sdcard/Download/extension` on the phone, and the
  host-side forward is `tcp:9223 -> localabstract:yandex_devtools_remote`.
- The CDP port can be changed with `YANDEX_CDP_PORT`; the extension directory on
  the phone can be changed with `YANDEX_EXT_DIR`.
