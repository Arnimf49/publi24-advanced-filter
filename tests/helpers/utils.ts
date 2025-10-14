import {Page} from "playwright-core";
import { chromium } from 'playwright';
import {dirname} from "node:path";
import path from "path";
import {fileURLToPath} from "node:url";
import * as cheerio from "cheerio";
import {CheerioAPI} from "cheerio";
import {FingerprintGenerator} from "fingerprint-generator";
import {FingerprintInjector} from "fingerprint-injector";

const EXTENSION_PATH = dirname(path.join(fileURLToPath(import.meta.url), '../..'));
export const STORAGE_JSON = 'tests/helpers/localStorage.json';
export const COOKIES_JSON = 'tests/helpers/cookies.json';

const utils = {
  async makeContext() {
    const { fingerprint, headers } = new FingerprintGenerator().getFingerprint({
      devices: ['desktop'],
      operatingSystems: ['linux'],
      browsers: ['chrome']
    });

    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless: false,
      viewport: {
        width: Math.max(1550, Math.min(fingerprint.screen.width, 1920)),
        height: Math.max(700, Math.min(fingerprint.screen.height, 900)),
      },
      extraHTTPHeaders: {
        'accept-language': headers['accept-language'],
      },
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        '--start-maximized',
      ],
      userAgent: fingerprint.navigator.userAgent,
      colorScheme: 'dark',
      ...(process.env.PLAYWRIGHT_LAUNCH_OPTIONS_EXECUTABLE_PATH
        ? {
            executablePath: process.env.PLAYWRIGHT_LAUNCH_OPTIONS_EXECUTABLE_PATH,
          }
        : {}),
    });
    await new FingerprintInjector().attachFingerprintToPlaywright(context, { fingerprint, headers });

    return context;
  },

  async waitForInnerTextNot(page: Page, selector: string, text: string, timeout?: number) {
    await page.waitForFunction(
      ({selector, text}) => (document.querySelector(selector) as HTMLElement).innerText.trim() !== text,
      {selector, text},
      {timeout: timeout || 10000}
    );
  },

  async modifyRouteBody(page: Page, url: string, modifier: ($: CheerioAPI) => any, delay?: number) {
    await page.route(url, async (route) => {
      const response = await route.fetch();
      let body = await response.text();

      const $ = cheerio.load(body);
      modifier($);
      const modifiedBody = $.html();

      if (delay) {
        await new Promise(r => setTimeout(r, delay));
      }

      await route.fulfill({
        response,
        body: modifiedBody,
      });
    });
  }
}

export {utils};
