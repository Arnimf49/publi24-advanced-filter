import {Page} from "playwright-core";
import { chromium } from 'playwright';
import {dirname} from "node:path";
import path from "path";
import {fileURLToPath} from "node:url";
import * as cheerio from "cheerio";
import {CheerioAPI} from "cheerio";
import {FingerprintGenerator} from "fingerprint-generator";
import {FingerprintInjector} from "fingerprint-injector";
import fs from 'node:fs';

const EXTENSION_PATH = dirname(path.join(fileURLToPath(import.meta.url), '../..'));
export const PUBLI24_STORAGE_JSON = 'tests/data/publi24/localStorage.json';
export const PUBLI24_COOKIES_JSON = 'tests/data/publi24/cookies.json';
export const NIMFOMANE_STORAGE_JSON = 'tests/data/nimfomane/localStorage.json';

// Legacy exports for backward compatibility
export const STORAGE_JSON = PUBLI24_STORAGE_JSON;
export const COOKIES_JSON = PUBLI24_COOKIES_JSON;

function getProxyServers(): string[] {
  const proxyServers = process.env.PROXY_SERVERS;
  if (!proxyServers) return [];

  const servers = proxyServers.split(',').map(s => s.trim()).filter(s => s);

  const disabledServers = process.env.PROXY_DISABLED_SERVERS;
  if (!disabledServers) return servers;

  const disabled = new Set(disabledServers.split(',').map(s => s.trim()).filter(s => s));
  return servers.filter(s => !disabled.has(s));
}

const PROXY_COUNTER_FILE = 'tests/data/.proxy-counter';

function getProxyCounter(): number {
  try {
    if (fs.existsSync(PROXY_COUNTER_FILE)) {
      return parseInt(fs.readFileSync(PROXY_COUNTER_FILE, 'utf-8').trim(), 10) || 0;
    }
  } catch (e) {
    // ignore
  }
  return 0;
}

function incrementProxyCounter(): void {
  const counter = getProxyCounter() + 1;
  fs.mkdirSync(path.dirname(PROXY_COUNTER_FILE), { recursive: true });
  fs.writeFileSync(PROXY_COUNTER_FILE, counter.toString());
}

const utils = {
  async makeContext(useProxy: boolean = false) {
    const { fingerprint, headers } = new FingerprintGenerator({
      locales: ['en-US']
    }).getFingerprint({
      devices: ['desktop'],
      operatingSystems: ['linux'],
      browserListQuery: 'last 10 Chrome versions'
    });

    const proxyServers = getProxyServers();
    let proxyConfig: { server: string; username?: string; password?: string } | undefined;

    if (useProxy && proxyServers.length > 0) {
      const counter = getProxyCounter();
      const index = counter % proxyServers.length;
      const server = proxyServers[index];
      incrementProxyCounter();
      proxyConfig = {
        server,
        ...(process.env.PROXY_USERNAME ? { username: process.env.PROXY_USERNAME } : {}),
        ...(process.env.PROXY_PASSWORD ? { password: process.env.PROXY_PASSWORD } : {}),
      };
      console.info(`Using proxy ${index}: ${server}`);
    }

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
      ...(proxyConfig ? { proxy: proxyConfig } : {}),
    });
    await new FingerprintInjector().attachFingerprintToPlaywright(context, { fingerprint, headers });

    return context;
  },

  async waitForInnerTextNot(page: Page, selector: string, text: string, timeout?: number) {
    await page.waitForFunction(
      ({selector, text}) => {
        const el = document.querySelector(selector) as HTMLElement;
        if (!el) return false;
        if (el.querySelector('[data-wwid="inline-loader"]')) return false;
        return el.innerText.trim() !== text;
      },
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

  async modifyRouteJsonBody(page: Page, url: string, htmlKey: string, modifier: ($: CheerioAPI) => any, delay?: number) {
    await page.route(url, async (route) => {
      const response = await route.fetch();
      const json = await response.json();

      const $ = cheerio.load(json[htmlKey]);
      modifier($);
      json[htmlKey] = $.html();

      if (delay) {
        await new Promise(r => setTimeout(r, delay));
      }

      await route.fulfill({
        response,
        body: JSON.stringify(json),
        contentType: 'application/json',
      });
    });
  },

  async getLocalStorageData(page: Page) {
    return await page.evaluate(() => {
      const data: any = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });
  }
}

export {utils};
