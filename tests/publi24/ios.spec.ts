import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {ElementHandle, Page} from "playwright-core";

const enabelIosTesting = async (page: Page) => {
  await page.evaluate(() => {
    window.localStorage.setItem('_testing_ios', '1');
  });
}

test('Should search and focus ad on listing', async ({ page, context }) => {
  await utilsPubli.open(context, page);
  await enabelIosTesting(page);

  const firstAd = await utilsPubli.findFirstAdWithPhone(page);
  const adId = await firstAd.getAttribute('data-articleid');

  setTimeout(() => page.locator('.pagination').scrollIntoViewIfNeeded(), 500);
  await utilsPubli.awaitGooglePagesClose(async () => await firstAd.$('[data-wwid="investigate"]'), context, page);
  await page.waitForTimeout(800);

  await expect(page.locator(`[data-articleid="${adId}"]`)).toBeInViewport();
})

test('Should search and focus ad in ads modal', async ({ page, context }) => {
  await utilsPubli.open(context, page);
  await enabelIosTesting(page);

  const ad: ElementHandle = await utilsPubli.findAdWithDuplicates(page);
  await (await ad.$('[data-wwid="duplicates"]')).click();

  await expect(page.locator('[data-wwid="ads-modal"]')).toBeVisible();

  const modalAds = await page.$$('[data-wwid="ads-modal"] [data-articleid]');
  expect(modalAds.length).toBeGreaterThan(0);

  const modalAd = modalAds[modalAds.length - 1];
  const adId = await modalAd.getAttribute('data-articleid');

  await utilsPubli.awaitGooglePagesClose(async () => await modalAd.$('[data-wwid="investigate"]'), context, page);
  await page.waitForTimeout(800);

  await page.pause();
  await expect(page.locator('[data-wwid="ads-modal"]')).toBeVisible();
  await expect(page.locator(`[data-wwid="ads-modal"] [data-articleid="${adId}"]`)).toBeInViewport();
})

test('Should search and focus ad in favorites', async ({ page, context }) => {
  await utilsPubli.open(context, page);
  await enabelIosTesting(page);

  const ads = await page.$$('[data-wwid="fav-toggle"][data-wwstate="off"]');
  for (let i = 0; i < Math.min(5, ads.length); i++) {
    await ads[i].click();
  }

  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();

  const favoriteAds = await page.$$('[data-wwid="favorites-modal"] [data-articleid]');
  expect(favoriteAds.length).toBeGreaterThan(0);

  const lastFavoriteAd = favoriteAds[favoriteAds.length - 1];
  const adId = await lastFavoriteAd.getAttribute('data-articleid');

  await utilsPubli.awaitGooglePagesClose(async () => await lastFavoriteAd.$('[data-wwid="investigate"]'), context, page);
  await page.waitForTimeout(800);

  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();
  await expect(page.locator(`[data-wwid="favorites-modal"] [data-articleid="${adId}"]`)).toBeInViewport();
})
