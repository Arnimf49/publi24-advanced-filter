import {expect, test} from "./helpers/fixture";
import {utils} from "./helpers/utils";

test('Should search for phone number and list all attached ads.', async ({ page, context }) => {
  await utils.openPubli(context, page);
  const firstArticle = (await page.$$('[data-articleid]'))[0];

  await page.waitForTimeout(1000);

  const phone = await (await firstArticle.$('[data-wwid="phone-number"]')).innerText();

  await page.locator('[data-wwid="phone-search"]').click();
  await expect(page.locator('[data-wwid="ads-modal"]')).toBeVisible();

  await page.locator('[data-wwid="phone-input"]').type(phone);
  await page.waitForTimeout(2000);

  expect((await page.$$('[data-wwid="ads-modal"] [data-articleid]')).length).toBeGreaterThanOrEqual(1);
  expect((await page.$$('[data-wwid="ads-modal"] [data-articleid] [data-wwid="control-panel"]')).length).toBeGreaterThanOrEqual(1);
})

