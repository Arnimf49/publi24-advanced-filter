import {expect, test} from "./helpers/fixture";
import {utils} from "./helpers/utils";

test('Should add favorites and view them.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  await expect(page.locator('[data-ww="temp-save"]')).toHaveText('Favorite (0)');

  await page.waitForTimeout(500);

  const articles = await page.$$(`[data-articleid]`);
  await (await articles[0].$('[data-wwid="temp-save"]')).click();
  await (await articles[1].$('[data-wwid="temp-save"]')).click();

  await expect(page.locator('[data-ww="temp-save"]')).toHaveText('Favorite (2)');
  await page.locator('[data-ww="temp-save"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();

  const favs = await page.$$('[data-wwid="favorites-modal"] [data-articleid]');
  expect(favs.length).toEqual(2);
  const duplicatesPanels = await page.$$('[data-wwid="favorites-modal"] [data-wwid="control-panel"]');
  expect(duplicatesPanels.length).toEqual(2);
})

test('Should add favorites and remove one.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  await expect(page.locator('[data-ww="temp-save"]')).toHaveText('Favorite (0)');

  await page.waitForTimeout(500);

  const articles = await page.$$(`[data-articleid]`);
  await (await articles[0].$('[data-wwid="temp-save"]')).click();
  await (await articles[1].$('[data-wwid="temp-save"]')).click();

  await page.locator('[data-ww="temp-save"]').click();
  await page.locator('[data-wwid="favorites-modal"] [data-wwid="temp-save"]').first().click();

  const favs = await page.$$('[data-wwid="favorites-modal"] [data-articleid]');
  expect(favs.length).toEqual(1);

  await expect(page.locator('[data-ww="temp-save"]')).toHaveText('Favorite (1)');
})

test('Should add favorites and remove all.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  await expect(page.locator('[data-ww="temp-save"]')).toHaveText('Favorite (0)');

  await page.waitForTimeout(500);

  const articles = await page.$$(`[data-articleid]`);
  await (await articles[0].$('[data-wwid="temp-save"]')).click();
  await (await articles[1].$('[data-wwid="temp-save"]')).click();
  await (await articles[2].$('[data-wwid="temp-save"]')).click();

  await page.locator('[data-ww="temp-save"]').click();
  await page.locator('[data-wwid="clear-favorites"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).not.toBeVisible();

  await expect(page.locator('[data-ww="temp-save"]')).toHaveText('Favorite (0)');
})
