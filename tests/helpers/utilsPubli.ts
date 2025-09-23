import {ElementHandle, Page} from "playwright-core";
import {BrowserContext} from "@playwright/test";
import fs from "node:fs";
import {expect} from "playwright/test";
import {STORAGE_PAGE} from "./utils";
import {solve} from "recaptcha-solver";

export const utilsPubli = {
  clearPopups(page: Page) {
    setInterval(async () => {
      try {
        const element = await page.$('.voucher-modal .close-reveal-modal');
        if (await element?.isVisible()) {
          await element?.click();
        }
        const campaign = await page.$('[class="js-campaign-modal-close-button"]');
        if (await campaign?.isVisible()) {
          await campaign.click();
        }
        const consent = await page.$('[class="qc-cmp2-summary-buttons"] [mode="primary"]');
        if (consent) {
          await consent.click();
        }
      } catch (e) {
        // noop
      }
    }, 1000);
  },

  async open(
    context: BrowserContext,
    page: Page,
    config: {infoShow?: boolean, location?: string, page?: number, loadStorage?: boolean, clearStorage?: boolean} = {}
  ) {
    const localStorageData = config.loadStorage === undefined || config.loadStorage === true
      ? JSON.parse(fs.readFileSync(STORAGE_PAGE, 'utf-8'))
      : null;
    await context.addCookies(JSON.parse(fs.readFileSync('tests/helpers/cookies.json').toString()));
    await context.addInitScript(({config, localStorageData}: any) => {
      if (window.localStorage.getItem('_pw_init') === 'true') {
        return;
      }

      if (localStorageData) {
        for (const [key, value] of Object.entries(localStorageData)) {
          window.localStorage.setItem(key, value as string);
        }
      }

      window.localStorage.setItem('ww:info-shown', config.infoShown || 'true');
      window.localStorage.setItem('_pw_init', 'true');
    }, {config, localStorageData})

    if (config.clearStorage) {
      await page.goto('https://www.publi24.ro/');
      await page.evaluate(() => localStorage.clear());
    }

    await page.goto(`https://www.publi24.ro/anunturi/matrimoniale/escorte/${config.location || 'cluj/cluj-napoca/'}${config.page ? '/?pag=' + config.page : ''}`);
    await page.waitForTimeout(700);

    utilsPubli.clearPopups(page);
  },

  async awaitGooglePagesClose(triggerButton: ElementHandle, context: BrowserContext, page: Page) {
    const secondaryPages: Page[] = [];

    context.on('page', page => {
      secondaryPages.push(page);
    });

    await triggerButton.click();
    await page.waitForTimeout(4000);

    for (let altPage of secondaryPages) {
      if (altPage.isClosed()) {
        continue;
      }
      if (altPage.url().startsWith("https://www.google.com/sorry/index")) {
        await solve(altPage);
      }
      await altPage.waitForEvent('close')
    }
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

    const firstArticle: ElementHandle = await utilsPubli.findAdWithCondition(page, getAdWithDuplicates);
    return firstArticle;
  },

  async findDuplicateAds(page: Page, firstArticle: ElementHandle) {
    const phone = await (await firstArticle.$('[data-wwid="phone-number"]')).innerText();
    const firstArticleId = await firstArticle.getAttribute('data-articleid');
    const duplicateArticleIds: string[] = [];
    let atNav = 0;

    do {
      const articles = await page.locator(`[data-wwphone="${phone}"]`).all();

      if (articles.length) {
        for (let i = 1; i < articles.length; i++) {
          const parent = await articles[i].evaluateHandle(el => el.closest('[data-articleid]'));
          const articleId = await parent.getAttribute('data-articleid');

          if (articleId !== firstArticleId) {
            duplicateArticleIds.push(articleId);
          }
        }
      }

      if (!duplicateArticleIds.length) {
        if (atNav > 10) {
          throw new Error('Something is wrong. The duplicate is too far.')
        }
        await page.waitForTimeout(1000);
        await page.locator('.pagination .arrow').nth(1).click();
        ++atNav;
      }
    } while (!duplicateArticleIds.length);
    return duplicateArticleIds;
  },

  async assertAdHidden(element: ElementHandle, options: {hidden: boolean, reason?: string} = {hidden: true}) {
    await new Promise(r => setTimeout(r, 300));

    const inner = await element.$('.article-txt-wrap, .ww-inset') || element;
    const opacity = await inner.evaluate(el => getComputedStyle(el as Element).getPropertyValue('opacity'))
    const blendMode = await inner.evaluate(el => getComputedStyle(el as Element).getPropertyValue('mix-blend-mode'))

    expect(opacity).toEqual(options?.hidden ? '0.5' : '1');
    expect(blendMode).toEqual(options?.hidden ? 'luminosity' : 'normal');

    if (options?.reason) {
      expect(await (await element.$('[data-wwid="hide-reason"]')).innerText()).toEqual(`motiv ascundere: ${options.reason}`);
    }
  },
};
