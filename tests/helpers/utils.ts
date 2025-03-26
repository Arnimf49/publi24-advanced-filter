import fs from "node:fs";
import {ElementHandle, Page} from "playwright-core";
import {BrowserContext} from "@playwright/test";
import {expect} from "playwright/test";

const utils = {
  async openPubli(context: BrowserContext, page: Page, config: any = {}) {
    await context.addCookies(JSON.parse(fs.readFileSync('tests/helpers/cookies.json').toString()));
    await context.addInitScript((config) => {
      window.localStorage.setItem('ww:info-shown', config.infoShown || 'true');
    }, config)

    await page.goto(`https://www.publi24.ro/anunturi/matrimoniale/escorte/${config.location || 'cluj/cluj-napoca/'}`);
    await page.waitForTimeout(600);

    const consent = await page.$('[class="qc-cmp2-summary-buttons"] [mode="primary"]');
    if (consent) {
      await consent.click();
    }

    await page.waitForTimeout(600);
  },

  async waitForInnerTextNot(page: Page, selector: string, text: string) {
    await page.waitForFunction(
      ({selector, text}) => (document.querySelector(selector) as HTMLElement).innerText !== text,
      {selector, text},
      {timeout: 10000}
    );
  },

  async findAdWithCondition(page: Page, conditionFn: (...args: any) => Promise<any>) {
    let results;

    while (true) {
      while (await page.$('.ww-loader') && !(results = await conditionFn())) {
        await page.waitForTimeout(1500);
      }

      if (results) {
        return results;
      }

      await ((await page.$$('.pagination .arrow'))[1]).click();
      await page.waitForTimeout(2000);
    }
  },

  async assertArticleHidden(element: ElementHandle, options: {hidden: boolean, reason?: string} = {hidden: true}) {
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
