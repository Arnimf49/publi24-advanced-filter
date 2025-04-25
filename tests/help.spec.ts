import {expect, test} from "./helpers/fixture";
import {utils} from "./helpers/utils";

test('Should display extension usage info on initial load.', async ({ page, context }) => {
  await utils.openPubli(context, page, {infoShown: 'false'});

  await expect(page.locator('[data-wwid="info-container"]')).toBeVisible();
  expect((await page.$$('[data-wwid="info-container"] [data-wwid="info-tooltip"]')).length).toEqual(5);

  await page.locator('[data-wwid="info-container"]').click();

  await expect(page.locator('[data-wwid="info-container"]')).toBeVisible();
  expect((await page.$$('[data-wwid="info-container"] [data-wwid="info-tooltip"]')).length).toEqual(3);

  await page.locator('[data-wwid="info-container"]').click();

  await expect(page.locator('[data-wwid="info-container"]')).not.toBeVisible();
})
