import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {ElementHandle} from "playwright-core";
import {utils} from "../helpers/utils";

test('Should have panel functionalities on ad page.', async ({context, page}, testInfo) => {
  testInfo.setTimeout(55000);

  await utilsPubli.open(context, page);
  await page.waitForTimeout(500);

  const firstAd: ElementHandle = await utilsPubli.findAdWithDuplicates(page);
  await (await firstAd.$('.article-title a')).click();
  await page.waitForTimeout(2000);

  const ad =  await page.$('[data-articleid]');
  await page.locator('[data-wwid="control-panel"]').waitFor();

  // Visibility handling test.
  await page.locator('[data-wwid="toggle-hidden"]').click();
  await page.locator(':text("temporar")').click();
  await utilsPubli.assertAdHidden(ad);
  await page.locator('[data-wwid="show-button"]').click();
  await utilsPubli.assertAdHidden(ad, {hidden: false});

  // Favorites handling test.
  await page.locator('[data-wwid="fav-toggle"]').click();
  await expect(page.locator('[data-wwid="fav-toggle"]')).toHaveAttribute('title', 'Șterge din favorite');
  await page.locator('[data-wwid="fav-toggle"]').click();
  await expect(page.locator('[data-wwid="fav-toggle"]')).toHaveAttribute('title', 'Adaugă la favorite');

  // Related search test.
  await utilsPubli.resolveGooglePage(await page.$('[data-wwid="investigate"]'), context, page);
  await utils.waitForInnerTextNot(page,
    `[data-articleid] [data-wwid="search-results"]`,
    'nerulat'
  );

  await page.waitForTimeout(5000);

  // Image search test.
  await utilsPubli.resolveGooglePage(await page.$('[data-wwid="investigate_img"]'), context, page);
  await utils.waitForInnerTextNot(page,
    `[data-articleid] [data-wwid="image-results"]`,
    'nerulat'
  );

  // Duplicates handling test.
  await page.locator('[data-wwid="duplicates"]').click();
  await expect(page.locator('[data-wwid="ads-modal"]')).toBeVisible();
})

test('Should set lastSeen on ad page.', async ({context, page}) => {
  await utilsPubli.open(context, page);
  await page.waitForTimeout(500);

  const firstAd: ElementHandle = await page.$('[data-articleid]');
  await (await firstAd.$('.article-title a')).click();
  await page.waitForTimeout(2000);

  await page.locator('[data-wwid="control-panel"]').waitFor();

  const adId = await page.$eval('[data-articleid]', el => el.getAttribute('data-articleid'));
  const lastSeen = await page.evaluate((id) => {
    const item = JSON.parse(localStorage.getItem(`ww2:${id}`) || '{}');
    return item.lastSeen;
  }, adId);

  expect(typeof lastSeen).toBe('number');
  expect(lastSeen).toBeGreaterThan(0);
})
