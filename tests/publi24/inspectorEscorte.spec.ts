import {expect, test} from "../helpers/fixture";
import {ElementHandle} from "playwright-core";
import {utilsPubli} from "../helpers/utilsPubli";

test('Should show inspector-escorte favicon on duplicate button when integration enabled', async ({ page, context }) => {
  await utilsPubli.open(context, page, {inspectorEscorte: true});

  const ad = await utilsPubli.findAdWithDuplicates(page);

  await ad.waitForSelector('[data-wwid="duplicates-container"] img[src*="inspector-escorte"]');
});

test('Should show source banner in duplicates modal when integration enabled', async ({ page, context }) => {
  await utilsPubli.open(context, page, {inspectorEscorte: true});

  const ad: ElementHandle = await utilsPubli.findAdWithDuplicates(page);
  await (await ad.$('[data-wwid="duplicates"]')).click();

  await page.waitForSelector('[data-wwid="ads-modal"]');
  await expect(page.locator('[data-wwid="source-banner"]')).toBeVisible();
  await expect(page.locator('[data-wwid="source-banner"]')).toContainText('inspector-escorte.com');
});

test('Should show source banner in phone search modal when integration enabled', async ({ page, context }) => {
  await utilsPubli.open(context, page, {inspectorEscorte: true});

  const firstAd = await utilsPubli.findFirstAdWithPhone(page);
  const phone = await (await firstAd.$('[data-wwid="phone-number"]')).innerText();

  await page.locator('[data-wwid="menu-button"]').click();
  await page.locator('[data-wwid="phone-search-button"]').click();
  await page.waitForSelector('[data-wwid="ads-modal"]');

  await page.locator('[data-wwid="phone-input"]').type(phone);
  await page.waitForTimeout(2000);

  await expect(page.locator('[data-wwid="source-banner"]')).toBeVisible();
});
