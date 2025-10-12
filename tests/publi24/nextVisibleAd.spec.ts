import {test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {expect} from "playwright/test";
import {Locator} from "@playwright/test";

test('Should skip to next visible or new ads over pages.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await page.route('https://www.publi24.ro/anunturi/matrimoniale/escorte/anunt/**', async (route, request) => {
    const url = request.url();
    if (url.endsWith('.html') && request.resourceType() === 'fetch') {
      await route.abort();
      return;
    }
  });

  const hideAds = async (count?: number): Promise<Locator> => {
    let hidden = 0;
    let ad;
    const elCount = await page.locator('[data-articleid]').count();

    for (let i = 0; i < elCount; i++) {
      ad =  page.locator('[data-articleid]').nth(i);
      if (count && count === hidden) {
        break;
      }
      if (await ad.locator('[data-wwhidden="false"]').isVisible()) {
        await ad.locator('[data-wwid="toggle-hidden"]').click();
      }
      ++hidden;
    }

    return ad;
  }

  await hideAds();
  await ((await page.$$('.pagination .arrow'))[1]).click();
  await page.waitForTimeout(1500);

  await hideAds();
  await ((await page.$$('.pagination .arrow'))[1]).click();
  await page.waitForTimeout(1500);

  const ad =  await hideAds(4);
  const adId = await ad.getAttribute('data-articleid');

  await (await page.$('.pagination div:nth-child(2) li:first-child')).click();
  await page.waitForTimeout(1000);
  await page.locator('[data-wwid="next-visible-ad"]').waitFor();
  await page.locator('[data-wwid="next-visible-ad"]').click();

  await page.waitForTimeout(3000);
  await expect(page.locator(`[data-articleid="${adId}"]`)).toBeInViewport();
})

test('Should skip to next visible over a page and ignore new one.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {page: 11});

  const adOneId = await page.locator('[data-articleid]').nth(0).getAttribute('data-articleid');
  const adOneUrl = await page.locator('[data-articleid]').nth(0).locator('[class="article-title"] a').getAttribute('href');
  const adTwoId = await page.locator('[data-articleid]').nth(1).getAttribute('data-articleid');
  const adTwoUrl = await page.locator('[data-articleid]').nth(1).locator('[class="article-title"] a').getAttribute('href');
  const adThreeId = await page.locator('[data-articleid]').nth(2).getAttribute('data-articleid');

  await utilsPubli.open(context, page, {page: 10, clearStorage: true});

  await page.locator('[data-wwid="settings-button"]').click();
  await page.locator('[data-wwid="auto-hiding"]').click();
  await page.locator('[data-wwid="next-only-visible"]').click();
  await page.locator(`[data-wwcriteria="mature"]`).click();
  await page.locator('[data-wwid="close"]').click();

  for (const url of [adOneUrl, adTwoUrl]) {
    await utilsPubli.mockAdContentResponse(page, url, {
      title: 'matură',
      description: 'matură',
      delay: 1000
    });
  }

  await page.locator('[data-wwid="next-visible-ad"]').waitFor();
  await page.locator('[data-wwid="next-visible-ad"]').click();

  await page.waitForTimeout(400);
  await expect(page.locator(`[data-articleid="${adOneId}"]`)).toBeInViewport();

  await page.waitForTimeout(1000);
  await expect(page.locator(`[data-articleid="${adTwoId}"]`)).toBeInViewport();

  await page.waitForTimeout(1000);
  await expect(page.locator(`[data-articleid="${adOneId}"]`)).not.toBeInViewport();
  await expect(page.locator(`[data-articleid="${adTwoId}"]`)).not.toBeInViewport({ratio: 0.5});
  await expect(page.locator(`[data-articleid="${adThreeId}"]`)).toBeInViewport();
})
