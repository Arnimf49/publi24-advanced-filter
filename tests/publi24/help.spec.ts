import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";

test('Should display extension usage info on initial load.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {infoShown: 'false'});

  await expect(page.locator('[data-wwid="info-container"]')).toBeVisible();
  expect((await page.$$('[data-wwid="info-container"] [data-wwid="info-tooltip"]')).length).toEqual(5);

  await page.locator('[data-wwid="info-container"]').click();

  await expect(page.locator('[data-wwid="info-container"]')).toBeVisible();
  expect((await page.$$('[data-wwid="info-container"] [data-wwid="info-tooltip"]')).length).toEqual(3);

  await page.locator('[data-wwid="info-container"]').click();

  await expect(page.locator('[data-wwid="info-container"]')).not.toBeVisible();
})

test('Should show info icons on result titles and open help modals.', async ({context, page}) => {
  await utilsPubli.open(context, page);
  const firstAd = await utilsPubli.findFirstAdWithPhone(page);

  const phoneTitle = await firstAd.waitForSelector('[data-wwid="search-results-title"]');
  const imageTitle = await firstAd.waitForSelector('[data-wwid="image-results-title"]');

  await (await phoneTitle.$('[data-wwid="info-icon"]')).isVisible();
  await (await imageTitle.$('[data-wwid="info-icon"]')).isVisible();

  await phoneTitle.click();
  await expect(page.locator('[data-wwid="phone-help-modal"]')).toBeVisible();
  await page.locator('[data-wwid="phone-help-modal"] [data-wwid="close"]').click();

  await imageTitle.click();
  await expect(page.locator('[data-wwid="image-help-modal"]')).toBeVisible();
  await page.locator('[data-wwid="image-help-modal"] [data-wwid="close"]').click();
});
