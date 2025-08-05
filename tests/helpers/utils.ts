import {Page} from "playwright-core";
import {chromium} from "@playwright/test";
import {FingerprintGenerator} from "fingerprint-generator";
import {FingerprintInjector} from "fingerprint-injector";
import {dirname} from "node:path";
import path from "path";
import {fileURLToPath} from "node:url";
import * as cheerio from "cheerio";
import {CheerioAPI} from "cheerio";

const EXTENSION_PATH = dirname(path.join(fileURLToPath(import.meta.url), '../..'));
export const STORAGE_PAGE = 'tests/helpers/localStorage.json';

const utils = {
  async makeContext() {
    const { fingerprint, headers } = new FingerprintGenerator().getFingerprint({
      devices: ['desktop'],
      operatingSystems: ['linux'],
      browsers: ['chrome']
    });

    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless: !!process.env.CI,
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
        width: Math.min(fingerprint.screen.width, 1800),
        height: Math.min(fingerprint.screen.height, 900),
      },
      extraHTTPHeaders: {
        'accept-language': headers['accept-language'],
      },
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
  },

  async modifyAdContent(page: Page, url: string, {title, description, delay}: {title: string, description: string, delay?: number}) {
    await utils.modifyRouteBody(page, url, ($) => {
      $('.detail-title h1').text(title);
      $('.article-description').text(description);
    }, delay)
  }
}

export {utils};
