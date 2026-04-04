import {test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {expect} from "playwright/test";
import {Locator} from "@playwright/test";
import {Page} from "playwright-core";

const blockAnalysisFetches = async (page: Page) => {
  await page.route('https://www.publi24.ro/anunturi/matrimoniale/escorte/anunt/**', async (route, request) => {
    if (request.url().endsWith('.html') && request.resourceType() === 'fetch') {
      await route.abort();
      return;
    }
    await route.continue();
  });
};

const expectFindNext = async (page: Page, enabled: boolean) => {
  const flagAfter = await page.evaluate(() => localStorage.getItem('ww:find-next'));
  if (enabled) {
    expect(flagAfter).toBe('true');
  } else {
    expect(flagAfter).not.toBe('true');
  }
};

test('Should advance to next visible ad on each global button click.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {clearStorage: true});

  await page.locator('[data-wwid="next-visible-ad"]').waitFor();
  await page.locator('[data-wwid="next-visible-ad"]').click();

  const globalBtn = page.locator('[data-wwid="next-visible-ad-global"]');
  await globalBtn.waitFor();
  await globalBtn.isEnabled();

  const firstId = await page.evaluate(() => {
    const ads = [...document.querySelectorAll<HTMLElement>('[data-articleid]')];
    return ads[0]?.getAttribute('data-articleid') ?? null;
  });
  const secondId = await page.evaluate(() => {
    const ads = [...document.querySelectorAll<HTMLElement>('[data-articleid]')];
    return ads[1]?.getAttribute('data-articleid') ?? null;
  });

  expect(firstId).not.toBeNull();
  expect(secondId).not.toBeNull();

  await expect(page.locator(`[data-articleid="${firstId}"]`)).toBeInViewport({ratio: 0.8});

  await expectFindNext(page, false);
  await globalBtn.click();
  await globalBtn.isEnabled();
  await expectFindNext(page, false);

  await expect(page.locator(`[data-articleid="${secondId}"]`)).toBeInViewport({ratio: 0.8});
  await expect(page.locator(`[data-articleid="${firstId}"]`)).not.toBeInViewport({ratio: 0.6});
});

test('Should clear find-next flag after finding, restoring inline button on manual navigation.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {clearStorage: true});

  await page.locator('[data-wwid="next-visible-ad"]').waitFor();
  await page.locator('[data-wwid="next-visible-ad"]').click();

  await page.locator('[data-wwid="next-visible-ad-global"]').waitFor();
  await page.locator('[data-wwid="next-visible-ad-global"]').isEnabled();

  await expectFindNext(page, false);

  await page.locator('.pagination .arrow').last().locator('a').click();
  await page.waitForTimeout(1200);

  await expect(page.locator('[data-wwid="next-visible-ad"]')).toBeVisible();
  await expect(page.locator('[data-wwid="next-visible-ad-global"]')).not.toBeAttached();
});

test('Should skip to next visible or new ads over pages.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await blockAnalysisFetches(page);

  const hideAds = async (count?: number): Promise<Locator> => {
    let hidden = 0;
    let ad;
    const elCount = await page.locator('[data-articleid]').count();

    for (let i = 0; i < elCount; i++) {
      ad = page.locator('[data-articleid]').nth(i);
      if (count && count === hidden) {
        break;
      }
      if (await ad.locator('[data-wwhidden="false"]').isVisible()) {
        await ad.locator('[data-wwid="toggle-hidden"]').click();
      }
      ++hidden;
    }

    return ad;
  };

  await hideAds();
  await ((await page.$$('.pagination .arrow'))[1]).click();
  await page.waitForTimeout(1500);

  await hideAds();
  await ((await page.$$('.pagination .arrow'))[1]).click();
  await page.waitForTimeout(1500);

  const ad = await hideAds(4);
  const adId = await ad.getAttribute('data-articleid');

  await (await page.$('.pagination li:first-child')).click();
  await page.waitForTimeout(1000);

  // inline button triggers flag + navigates; global button takes over on subsequent pages
  await page.locator('[data-wwid="next-visible-ad"]').click();

  await page.waitForTimeout(3000);
  await expect(page.locator(`[data-articleid="${adId}"]`)).toBeInViewport();
});

test('Should skip to next visible over a page and ignore new one.', async ({ page, context }) => {
  const tryPage = Math.round(Math.random() * 5) + 9;
  await utilsPubli.open(context, page, {page: tryPage + 1});

  const adOneId = await page.locator('[data-articleid]').nth(0).getAttribute('data-articleid');
  const adOneUrl = await page.locator('[data-articleid]').nth(0).locator('[class="article-title"] a').getAttribute('href');
  const adTwoId = await page.locator('[data-articleid]').nth(1).getAttribute('data-articleid');
  const adTwoUrl = await page.locator('[data-articleid]').nth(1).locator('[class="article-title"] a').getAttribute('href');
  const adThreeId = await page.locator('[data-articleid]').nth(2).getAttribute('data-articleid');

  await utilsPubli.open(context, page, {page: tryPage, clearStorage: true});

  await page.locator('[data-wwid="menu-button"]').click();
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

  // inline button sets flag + navigates; global button auto-runs on tryPage+1
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
});
