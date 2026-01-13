import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";

test('Tutorial displays on initial load with proper tooltips and timing.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {infoShown: 'false'});

  const container = page.locator('[data-wwid="info-container"]');
  await expect(container).toBeVisible();

  for (let step = 0; step < 10; step++) {
    const tooltip = container.locator(`[data-wwid="tooltip-${step}"]`);
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toBeInViewport();

    await page.waitForTimeout(2000);

    if (step < 9) {
      await container.click();
      await expect(container).toBeVisible();
    } else {
      await container.click();
      await expect(container).not.toBeVisible();
    }
  }
});

test('Tutorial opens from menu button.', async ({context, page}) => {
  await utilsPubli.open(context, page);

  await page.locator('[data-wwid="menu-button"]').click();
  await page.locator('[data-wwid="tutorial-button"]').click();

  const container = page.locator('[data-wwid="info-container"]');
  await expect(container).toBeVisible();
});

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
