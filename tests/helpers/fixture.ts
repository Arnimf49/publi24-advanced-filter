import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';
import {dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {FingerprintGenerator} from "fingerprint-generator";
import {FingerprintInjector} from "fingerprint-injector";
import {$} from "execa";

const EXTENSION_PATH = dirname(path.join(fileURLToPath(import.meta.url), '../..'));

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({ }, use) => {
    const { fingerprint, headers } = new FingerprintGenerator().getFingerprint({
      devices: ['desktop'],
      operatingSystems: ['linux'],
      browsers: ['chrome']
    });

    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--start-maximized',
      ],
      userAgent: fingerprint.navigator.userAgent,
      colorScheme: 'dark',
      viewport: {
        width: fingerprint.screen.width,
        height: fingerprint.screen.height,
      },
      extraHTTPHeaders: {
        'accept-language': headers['accept-language'],
      },
    });
    await new FingerprintInjector().attachFingerprintToPlaywright(context, { fingerprint, headers });

    if (process.env.CI && process.env.DISPLAY) {
      setTimeout(() => $`xdotool key Escape`, 1100);
    }

    await use(context);
    await context.close();
    // Loading in too many ads and searching on google can cause too many requests.
    await new Promise(r => setTimeout(r, 5000));
  },
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background)
      background = await context.waitForEvent('serviceworker');

    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
});
export const expect = test.expect;
