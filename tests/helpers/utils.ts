import fs from "node:fs";
import {ElementHandle, Page} from "playwright-core";
import {BrowserContext, chromium} from "@playwright/test";
import {expect} from "playwright/test";
import {FingerprintGenerator} from "fingerprint-generator";
import {FingerprintInjector} from "fingerprint-injector";
import {dirname} from "node:path";
import path from "path";
import {fileURLToPath} from "node:url";

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
    });
    await new FingerprintInjector().attachFingerprintToPlaywright(context, { fingerprint, headers });

    return context;
  },

  clearPopups(page: Page) {
    setInterval(async () => {
      try {
        const element = await page.$('.voucher-modal .close-reveal-modal');
        if (await element?.isVisible()) {
          await element?.click();
        }
      } catch (e) {
        // noop
      }
    }, 1000);
  },

  async openPubli(
    context: BrowserContext,
    page: Page,
    config: {infoShow?: boolean, location?: string, loadStorage?: boolean} = {}
  ) {
    const localStorageData = config.loadStorage === undefined || config.loadStorage === true
      ? JSON.parse(fs.readFileSync(STORAGE_PAGE, 'utf-8'))
      : {};
    await context.addCookies(JSON.parse(fs.readFileSync('tests/helpers/cookies.json').toString()));
    await context.addInitScript(({config, localStorageData}: any) => {
      if (window.localStorage.getItem('_pw_init') === 'true') {
        return;
      }

      for (const [key, value] of Object.entries(localStorageData)) {
        window.localStorage.setItem(key, value as string);
      }
      window.localStorage.setItem('ww:info-shown', config.infoShown || 'true');
      window.localStorage.setItem('_pw_init', 'true');
    }, {config, localStorageData})

    await page.goto(`https://www.publi24.ro/anunturi/matrimoniale/escorte/${config.location || 'cluj/cluj-napoca/'}`);
    await page.waitForTimeout(600);

    const consent = await page.$('[class="qc-cmp2-summary-buttons"] [mode="primary"]');
    if (consent) {
      await consent.click();
    }

    utils.clearPopups(page);

    await page.waitForTimeout(600);
  },

  async waitForInnerTextNot(page: Page, selector: string, text: string, timeout?: number) {
    await page.waitForFunction(
      ({selector, text}) => (document.querySelector(selector) as HTMLElement).innerText.trim() !== text,
      {selector, text},
      {timeout: timeout || 10000}
    );
  },

  async findAdWithCondition(page: Page, conditionFn: (...args: any) => Promise<any>) {
    let results;

    while (true) {
      while (await page.$('[data-wwid="loader"]') && !(results = await conditionFn())) {
        try {
          await (await page.$('[data-wwid="loader"]'))?.scrollIntoViewIfNeeded();
        } catch (_) {
          // noop
        }
        await page.waitForTimeout(1000);
      }

      if (results) {
        return results;
      }

      await ((await page.$$('.pagination .arrow'))[1]).click();
      await page.waitForTimeout(2000);
    }
  },

  async findAdWithDuplicates(page: Page) {
    const getAdWithDuplicates = async () => {
      for (let article of await page.$$('[data-articleid]')) {
        if (await article.$('[data-wwid="duplicates-container"]')) {
          return article;
        }
      }
      return null;
    };

    const firstArticle: ElementHandle = await utils.findAdWithCondition(page, getAdWithDuplicates);
    return firstArticle;
  },

  async assertArticleHidden(element: ElementHandle, options: {hidden: boolean, reason?: string} = {hidden: true}) {
    await new Promise(r => setTimeout(r, 300));

    const inner = await element.$('.article-txt-wrap, .ww-inset') || element;
    const opacity = await inner.evaluate(el => getComputedStyle(el as Element).getPropertyValue('opacity'))
    const blendMode = await inner.evaluate(el => getComputedStyle(el as Element).getPropertyValue('mix-blend-mode'))

    expect(opacity).toEqual(options?.hidden ? '0.5' : '1');
    expect(blendMode).toEqual(options?.hidden ? 'luminosity' : 'normal');

    if (options?.reason) {
      expect(await (await element.$('[data-wwid="hide-reason"]')).innerText()).toEqual(`motiv ascundere: ${options.reason}`);
    }
  }
}

export {utils};
