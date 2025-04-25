import {test} from "./helpers/fixture";
import {utils} from "./helpers/utils";
import {expect} from "playwright/test";
import {Locator} from "@playwright/test";

test('Should skip to next visible ads over pages.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  await page.route('https://www.publi24.ro/anunturi/matrimoniale/escorte/anunt/**', async (route, request) => {
    const url = request.url();
    if (url.endsWith('.html') && request.resourceType() === 'fetch') {
      await route.abort();
      return;
    }
  });

  const hideAds = async (count?: number): Promise<Locator | void> => {
    const articles = await page.locator('[data-articleid]').all();
    let hidden = 0;

    for (const article of articles) {
      if (count && count === hidden) {
        return article;
      }
      await article.locator('[data-wwid="toggle-hidden"]').click();
      await page.waitForTimeout(100);
      ++hidden;
    }
  }

  await hideAds();
  await ((await page.$$('.pagination .arrow'))[1]).click();
  await page.waitForTimeout(1000);

  await hideAds();
  await ((await page.$$('.pagination .arrow'))[1]).click();
  await page.waitForTimeout(1000);

  const article = await hideAds(4) as Locator;
  const articleId = await article.getAttribute('data-articleid');

  await (await page.$('.pagination div:nth-child(2) li:first-child')).click();
  await page.locator('[data-wwid="next-visible-ad"]').waitFor();
  await page.locator('[data-wwid="next-visible-ad"]').click();

  await page.waitForTimeout(3000);
  await expect(page.locator(`[data-articleid="${articleId}"]`)).toBeInViewport();
})
