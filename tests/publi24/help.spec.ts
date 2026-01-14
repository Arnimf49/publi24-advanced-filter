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

test('Should display tutorial correctly when ads are hidden.', async ({context, page}) => {
  await utilsPubli.open(context, page, {page: 10});

  const ads = await page.$$('[data-articleid]');
  for (const ad of ads) {
    const toggleButton = await ad.$('[data-wwid="toggle-hidden"]');
    if (toggleButton) {
      await toggleButton.click();
      await page.waitForTimeout(100);
    }
  }

  await page.evaluate(() => {
    localStorage.setItem('ww:focus_mode', 'true');
  });
  await page.reload();
  await page.waitForTimeout(400);

  for (const ad of await page.$$('[data-articleid]')) {
    const display = await ad.evaluate(el => getComputedStyle(el).display);
    expect(display).toBe('none');
  }

  await page.locator('[data-wwid="menu-button"]').click();
  await page.locator('[data-wwid="tutorial-button"]').click();
  await page.waitForTimeout(300);

  const container = page.locator('[data-wwid="info-container"]');
  await expect(container).toBeVisible();

  const visibleAds = await page.$$('[data-articleid]');
  let foundVisibleAd = false;
  let tutorialAdId: string | null = null;
  let tutorialAd: any = null;

  for (const ad of visibleAds) {
    const display = await ad.evaluate(el => getComputedStyle(el).display);
    if (display !== 'none') {
      foundVisibleAd = true;
      tutorialAdId = await ad.getAttribute('data-articleid');
      tutorialAd = ad;
      break;
    }
  }

  expect(foundVisibleAd).toBe(true);
  expect(tutorialAdId).not.toBeNull();
  await utilsPubli.assertAdHidden(tutorialAd, {hidden: false});

  for (let i = 0; i < 10; i++) {
    await container.click();
    await page.waitForTimeout(100);
  }

  const adAfterTutorial = await page.$(`[data-articleid="${tutorialAdId}"]`);
  const displayAfterTutorial = await adAfterTutorial.evaluate(el => getComputedStyle(el).display);
  expect(displayAfterTutorial).toBe('none');
});
