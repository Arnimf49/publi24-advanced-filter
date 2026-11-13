import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";

test('Should search for phone number and list all attached ads.', async ({ page, context }) => {
  await utilsPubli.open(context, page);
  const firstAd =  await utilsPubli.findFirstAdWithPhone(page);
  const phone = await (await firstAd.$('[data-wwid="phone-number"]')).innerText();

  await page.locator('[data-wwid="menu-button"]').click();
  await page.locator('[data-wwid="phone-search-button"]').click();
  await expect(page.locator('[data-wwid="ads-modal"]')).toBeVisible();

  const modalAds = page.locator('[data-wwid="ads-modal"] [data-articleid]');

  await page.locator('[data-wwid="phone-input"]').type(phone);

  // While the search runs the counter shows animated dots ("Rezultate ...").
  // A numeric "Rezultate: N" means loading finished.
  await expect(page.locator('[data-wwid="ads-modal"] [data-wwid="results-count"]')).toHaveText(/^Rezultate: \d+$/);

  await expect(modalAds.first()).toBeVisible();

  const renderedCount = await modalAds.count();
  expect(renderedCount).toBeGreaterThanOrEqual(1);
  await expect(page.locator('[data-wwid="ads-modal"] [data-articleid] [data-wwid="control-panel"]')).toHaveCount(renderedCount);
})

