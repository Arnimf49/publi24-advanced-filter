import {ElementHandle, Page} from "playwright-core";
import {BrowserContext} from "@playwright/test";
import fs from "node:fs";
import {expect} from "playwright/test";
import {COOKIES_JSON, STORAGE_JSON, utils} from "./utils";
import {solve} from "recaptcha-solver";

export const utilsPubli = {
  clearPopups(page: Page) {
    setInterval(async () => {
      try {
        const consent = await page.$('[class="qc-cmp2-summary-buttons"] [mode="primary"]');
        if (consent) {
          await consent.click();
        }
        const consent2 = await page.$('[id="didomi-notice-agree-button"]');
        if (consent2) {
          await consent2.click();
        }
        const years = await page.$('.overlay-18 .cta-btn-secondary');
        if (years) {
          await years.click();
        }
        const element = await page.$('.voucher-modal .close-reveal-modal');
        if (await element?.isVisible()) {
          await element?.click();
        }
        const campaign = await page.$('[class="js-campaign-modal-close-button"]');
        if (await campaign?.isVisible()) {
          await campaign.click();
        }
      } catch (e) {
        // noop
      }
    }, 1000);
  },

  async open(
    context: BrowserContext,
    page: Page,
    config: {infoShown?: string, location?: string, page?: number, loadStorage?: boolean, clearStorage?: boolean} = {}
  ) {
    const localStorageData = config.loadStorage === undefined || config.loadStorage === true
      ? JSON.parse(fs.readFileSync(STORAGE_JSON, 'utf-8'))
      : null;
    if (fs.existsSync(COOKIES_JSON)) {
      await context.addCookies(JSON.parse(fs.readFileSync(COOKIES_JSON).toString()));
    }
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
      window.localStorage.setItem('ww:manual-image-search-enabled', 'false');
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

  async awaitGooglePagesClose(triggerButton: (ElementHandle | (() => Promise<ElementHandle>)), context: BrowserContext, page: Page) {
    const attemptGoogleCaptchaSolve = async () => {
      const secondaryPages: Page[] = [];

      context.on('page', page => {
        secondaryPages.push(page);
      });

      await (typeof triggerButton === 'function' ? await triggerButton() : triggerButton).click();
      await page.waitForTimeout(4000);

      for (let altPage of secondaryPages) {
        if (altPage.isClosed()) {
          continue;
        }
        if (altPage.url().startsWith("https://consent.google.com/ml?continue=")) {
          throw new Error('Consent page on google!');
        }
        if (altPage.url().startsWith("https://www.google.com/sorry/index")) {
          await solve(altPage, {
            delay: process.env.CI ? 200 : 64,
            wait: process.env.CI ? 7000 : 5000,
          });
        }
        await altPage.waitForEvent('close')
      }
    }

    const attemptGoogleSearchReplication = async () => {
      await (typeof triggerButton === 'function' ? await triggerButton() : triggerButton).click();
      await page.waitForTimeout(4000);
    }

    try {
      await attemptGoogleCaptchaSolve();
    } catch (error: any) {
      if (error?.message?.includes('No Audio Found') || error?.message?.includes('No reCAPTCHA detected')) {
        await attemptGoogleSearchReplication();
      } else {
        throw error;
      }
    }
  },

  async findAdWithCondition<T>(page: Page, conditionFn: (...args: any) => Promise<T>): Promise<T> {
    let results;

    for (let i = 0; i < 10; i++) {
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

    throw new Error('Attempted to find ad with condition, but searched through too many pages.');
  },

  async findAdWithConditionNoLoader<T>(page: Page, conditionFn: (...args: any) => Promise<T>): Promise<T> {
    const getCurrentPage = async () => {
      const url = new URL(page.url());
      const pagParam = url.searchParams.get('pag');
      return pagParam ? parseInt(pagParam, 10) : 1;
    };

    const navigateToPage = async (pageNum: number) => {
      const url = new URL(page.url());
      if (pageNum === 1) {
        url.searchParams.delete('pag');
      } else {
        url.searchParams.set('pag', pageNum.toString());
      }
      await page.goto(url.toString());
      await page.waitForTimeout(2000);
    };

    const startPage = await getCurrentPage();
    let results = await conditionFn();

    if (results) {
      return results;
    }

    for (let offset = 1; offset <= 4; offset++) {
      const backwardPage = startPage - offset;
      const forwardPage = startPage + offset;

      if (backwardPage >= 1) {
        await navigateToPage(backwardPage);
        results = await conditionFn();
        if (results) {
          return results;
        }
      }

      await navigateToPage(forwardPage);
      results = await conditionFn();
      if (results) {
        return results;
      }
    }

    throw new Error('Attempted to find ad with condition, but searched through too many pages.');
  },

  async findAdWithDuplicates(page: Page, forceFind: boolean = false) {
    const getAdWithDuplicates = async () => {
      for (let article of await page.$$('[data-articleid]')) {
        if (await article.$('[data-wwid="duplicates-container"]')) {
          return article;
        }
      }
      return null;
    };

    if (!forceFind) {
      for (let i = 0; i < 5; i++) {
        let result = await getAdWithDuplicates();
        if (result) {
          return result;
        }
        const nextButton = (await page.$$('.pagination .arrow'))[1];
        if (!nextButton) break;
        await nextButton.click();
        await page.waitForTimeout(2000);
      }
    }

    return await utilsPubli.findAdWithCondition(page, getAdWithDuplicates);
  },

  async getDuplicateAdIds(page: Page, firstAd: ElementHandle) {
    const phone = await (await firstAd.$('[data-wwid="phone-number"]')).innerText();
    const firstAdId = await firstAd.getAttribute('data-articleid');
    const duplicateArticleIds: string[] = [];
    let atNav = 0;

    do {
      const articles = await page.locator(`[data-wwphone="${phone}"]`).all();

      if (articles.length) {
        for (let i = 0; i < articles.length; i++) {
          const parent = await articles[i].evaluateHandle(el => el.closest('[data-articleid]'));
          const articleId = await parent.getAttribute('data-articleid');

          if (articleId !== firstAdId) {
            duplicateArticleIds.push(articleId);
          }
        }
      }

      if (!duplicateArticleIds.length) {
        if (atNav > 10) {
          throw new Error('Something is wrong. The duplicate is too far.')
        }
        await page.locator('.pagination .arrow').nth(1).click();
        await page.waitForTimeout(2000);
        ++atNav;
      }
    } while (!duplicateArticleIds.length);
    return duplicateArticleIds;
  },

  async findFirstAdWithPhone(page: Page) {
    return await utilsPubli.findAdWithCondition(page, async () => {
      for (let article of await page.$$('[data-articleid]')) {
        while (await article.$('[data-wwid="loader"]')) {
          await page.waitForTimeout(1000);
        }

        const phone = await article.$('[data-wwid="phone-number"]');
        if (phone && await phone.isVisible()) {
          await article.scrollIntoViewIfNeeded();
          return article;
        }
      }
      return null;
    });
  },

  async selectAd(page: Page, articleId?: string) {
    let article;

    if (articleId) {
      await page.waitForTimeout(100);
      article = await utilsPubli.findAdWithConditionNoLoader(page, async () => {
        return await page.$(`[data-articleid="${articleId}"]`);
      });
    } else {
      const articles = await page.$$('[data-articleid]');
      article = articles[0];
    }

    if (article) {
      await article.scrollIntoViewIfNeeded();
    }

    return article;
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

  async getPhoneByArticleId(page: Page, articleId: string): Promise<string> {
    return await page.evaluate((id) => {
      const item = JSON.parse(localStorage.getItem(`ww2:${id.toUpperCase()}`) || '{}');
      return item.phone || '';
    }, articleId);
  },

  async getPhoneStorageData(page: Page, phone: string): Promise<any> {
    return await page.evaluate((phone) => {
      return JSON.parse(localStorage.getItem(`ww2:phone:${phone}`) || '{}');
    }, phone);
  },

  async setPhoneStorageProp(page: Page, phone: string, key: string, value: any): Promise<void> {
    await page.evaluate(({phone, key, value}) => {
      const phoneItem = JSON.parse(localStorage.getItem(`ww2:phone:${phone}`) || '{}');
      phoneItem[key] = value;
      localStorage.setItem(`ww2:phone:${phone}`, JSON.stringify(phoneItem));
    }, {phone, key, value});
  },

  async forceAdNewAnalyze(page: Page, id: string): Promise<void> {
    await page.evaluate((innerId) => {
      const data = JSON.parse(window.localStorage.getItem(`ww2:${innerId.toUpperCase()}`));
      data.analyzedAt = Date.now() - (1.296e+9 + 1000 * 60);
      window.localStorage.setItem(`ww2:${innerId.toUpperCase()}`, JSON.stringify(data));
    }, id);
  },

  async mockAdContentResponse(page: Page, url: string, {title, description, delay}: {title: string, description: string, delay?: number}) {
    await utils.modifyRouteBody(page, url, ($) => {
      $('.detail-title h1').text(title);
      $('.article-description').text(description);
    }, delay)
  },

  async mockAdContent(page: Page, article: ElementHandle, title: string, description: string) {
    const id = await article.getAttribute('data-articleid');
    const url = await (await article.$('.article-title a')).getAttribute('href');

    await utilsPubli.mockAdContentResponse(page, url, { title, description });
    await utilsPubli.forceAdNewAnalyze(page, id);

    await Promise.all([
      page.reload(),
      page.waitForResponse(response => response.url() === url),
    ]);
    const newArticle = await utilsPubli.selectAd(page, id);
    await page.waitForTimeout(500);

    return newArticle;
  }
};
