#!/usr/bin/env node
// Yandex Browser on Android (Chromium/CDP) helpers.
//
// Prerequisites:
//   adb forward tcp:9223 localabstract:yandex_devtools_remote
//   node deploy.sh yandex   # or start Yandex and forward manually
//
// Usage:
//   node yandex.mjs status
//   node yandex.mjs tabs
//   node yandex.mjs open <url>
//   node yandex.mjs click <css-selector> [url-substring]
//   node yandex.mjs reload [extension-name-substring]
//   node yandex.mjs reload-tab [url-substring]
//   node yandex.mjs eval <js-expression> [url-substring]
//   node yandex.mjs screenshot <output.png> [url-substring]
//
// The CDP port can be overridden with YANDEX_CDP_PORT (default 9223).

import {chromium} from 'playwright';

const port = process.env.YANDEX_CDP_PORT ?? '9223';

async function connect() {
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  const context = browser.contexts()[0];

  if (!context) {
    throw new Error(`No browser context on CDP port ${port}. Is Yandex running and forwarded?`);
  }

  return {browser, context};
}

function pickPage(context, needle = '') {
  const candidates = context.pages();
  const page = needle
    ? candidates.find((candidate) => candidate.url().includes(needle))
    : candidates[0];

  if (!page) {
    throw new Error(needle ? `No page matching "${needle}"` : 'No pages open');
  }

  return page;
}

async function openExtensionsPage(context) {
  const page = await context.newPage();

  try {
    await page.goto('chrome://extensions', {waitUntil: 'commit', timeout: 15_000});
    await page.waitForTimeout(1_000);
    return page;
  } catch (error) {
    await page.close().catch(() => undefined);
    throw error;
  }
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (!command) {
    throw new Error('Usage: yandex.mjs <status|tabs|open|reload|reload-tab|eval|screenshot> [args]');
  }

  const {browser, context} = await connect();

  try {
    if (command === 'tabs') {
      const tabs = await Promise.all(context.pages().map(async (page) => ({
        url: page.url(),
        title: await page.title().catch(() => ''),
      })));
      console.log(JSON.stringify(tabs, null, 2));
      return;
    }

    if (command === 'open') {
      const [url] = args;

      if (!url) {
        throw new Error('Missing URL');
      }

      const page = await context.newPage();
      await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 45_000});
      console.log(JSON.stringify({ok: true, url: page.url(), title: await page.title()}, null, 2));
      return;
    }

    if (command === 'reload') {
      const needle = args[0] ?? 'Publi24';
      const page = await openExtensionsPage(context);

      try {
        const result = await page.evaluate(async (needle) => {
          const developerPrivate = globalThis.chrome?.developerPrivate;

          if (!developerPrivate) {
            return {ok: false, error: 'chrome.developerPrivate is unavailable'};
          }

          const items = await developerPrivate.getExtensionsInfo({
            includeDisabled: true,
            includeTerminated: true,
          });
          const extension = items.find(
            (item) => item.location === 'UNPACKED' && item.name.includes(needle),
          );

          if (!extension) {
            return {
              ok: false,
              error: `No unpacked extension matching "${needle}"`,
              extensions: items.map((item) => ({name: item.name, location: item.location})),
            };
          }

          await developerPrivate.reload(extension.id, {
            failQuietly: false,
            populateErrorForUnpacked: true,
          });
          const info = await developerPrivate.getExtensionInfo(extension.id);

          return {
            ok: true,
            id: info.id,
            name: info.name,
            version: info.version,
            state: info.state,
            path: info.path,
          };
        }, needle);

        console.log(JSON.stringify(result, null, 2));

        if (!result.ok) {
          process.exitCode = 1;
        }
      } finally {
        await page.close().catch(() => undefined);
      }

      return;
    }

    if (command === 'status') {
      const page = await openExtensionsPage(context);

      try {
        const result = await page.evaluate(async () => {
          const developerPrivate = globalThis.chrome?.developerPrivate;

          if (!developerPrivate) {
            return {ok: false, error: 'chrome.developerPrivate is unavailable'};
          }

          const items = await developerPrivate.getExtensionsInfo({
            includeDisabled: true,
            includeTerminated: true,
          });

          return {
            ok: true,
            extensions: items.map((item) => ({
              id: item.id,
              name: item.name,
              version: item.version,
              state: item.state,
              location: item.location,
              path: item.path,
            })),
          };
        });

        console.log(JSON.stringify(result, null, 2));
      } finally {
        await page.close().catch(() => undefined);
      }

      return;
    }

    if (command === 'click') {
      const [selector, needle = ''] = args;

      if (!selector) {
        throw new Error('Missing selector');
      }

      const page = pickPage(context, needle);
      await page.locator(selector).first().scrollIntoViewIfNeeded();
      await page.locator(selector).first().click({timeout: 15_000});
      console.log(JSON.stringify({ok: true, url: page.url()}, null, 2));
      return;
    }

    if (command === 'reload-tab') {
      const page = pickPage(context, args[0] ?? '');
      await page.reload({waitUntil: 'domcontentloaded', timeout: 45_000});
      console.log(JSON.stringify({ok: true, url: page.url(), title: await page.title()}, null, 2));
      return;
    }

    if (command === 'eval') {
      const [expression, needle = ''] = args;

      if (!expression) {
        throw new Error('Missing JS expression');
      }

      const page = pickPage(context, needle);
      const result = await page.evaluate((source) => {
        // eslint-disable-next-line no-new-func
        return globalThis.eval(source);
      }, expression);

      if (typeof result === 'string') {
        console.log(result);
      } else {
        console.log(JSON.stringify(result, null, 2));
      }

      return;
    }

    if (command === 'screenshot') {
      const [output, needle = ''] = args;

      if (!output) {
        throw new Error('Missing output path');
      }

      const page = pickPage(context, needle);
      await page.screenshot({path: output, fullPage: false});
      console.log(JSON.stringify({ok: true, url: page.url(), output}, null, 2));
      return;
    }

    throw new Error(`Unknown command: ${command}`);
  } finally {
    await browser.close().catch(() => undefined);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
