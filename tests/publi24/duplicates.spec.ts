import {expect, test} from "../helpers/fixture";
import {ElementHandle} from "playwright-core";
import {utilsPubli} from "../helpers/utilsPubli";

test('Should display duplicate ad count and list them.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const ad: ElementHandle = await utilsPubli.findAdWithDuplicates(page);
  const duplicatesText = await (await ad.$('[data-wwid="duplicates-container"]')).innerText();
  expect(duplicatesText).toMatch(/^\d+ anunțuri cu acest telefon \(vizualizează\)$/);

  const count = +(duplicatesText.match(/(\d+)/)[1]);
  const phone = await (await ad.$('[data-wwid="phone-number"]')).innerText();

  await (await ad.$('[data-wwid="duplicates"]')).click();
  await page.waitForTimeout(200);

  await expect(page.locator('[data-wwid="ads-modal"]')).toBeVisible();
  await expect(page.locator('[data-wwid="ads-modal"] [data-wwid="results-count"]')).toHaveText(`Rezultate: ${count}`);
  await expect(page.locator('[data-wwid="ads-modal"] [data-wwid="phone-input"]')).toHaveValue(phone);

  const duplicates = await page.$$('[data-wwid="ads-modal"] [data-articleid]');
  expect(duplicates.length).toEqual(count);
  const duplicatesPanels = await page.$$('[data-wwid="ads-modal"] [data-wwid="control-panel"]');
  expect(duplicatesPanels.length).toEqual(count);

  const duplicatesDisplay = await page.$$('[data-wwid="ads-modal"] [data-wwid="duplicates-container"]');
  expect(duplicatesDisplay.length).toEqual(0);
})

test('Should hide all duplicate ads from list.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const ad: ElementHandle = await utilsPubli.findAdWithDuplicates(page);
  await (await ad.$('[data-wwid="duplicates"]')).click();
  await page.waitForTimeout(200);

  const duplicatesIds = [];
  for (let duplicate of await page.$$('[data-wwid="ads-modal"] [data-articleid]')) {
    duplicatesIds.push(await duplicate.getAttribute('data-articleid'))
  }

  await page.locator('[data-wwid="ads-modal"] [data-wwid="hide-all"]').waitFor();
  await page.locator('[data-wwid="ads-modal"] [data-wwid="hide-all"]').click();
  
  const altaButton = await page.$('[data-wwid="ads-modal"] :text("alta")');
  await altaButton.click();
  await page.waitForTimeout(500);
  
  expect(await page.$('[data-wwid="ads-modal"]')).toBeTruthy();
  const subcategories = await page.$$('[data-wwid="ads-modal"] [data-wwid="subcategory"]');
  expect(subcategories.length).toBeGreaterThan(0);
  
  const selectedCategoryButton = await page.$('[data-wwid="ads-modal"] [data-wwid="selected-category"]');
  await selectedCategoryButton.click();

  expect(await page.$('[data-wwid="ads-modal"]')).toBeNull();

  await page.waitForTimeout(1000);

  for (let id of duplicatesIds) {
    const ad =  await utilsPubli.selectAd(page, id);
    const hideReason = await ad.$('[data-wwid="hide-reason"]');
    expect(hideReason).not.toBeNull();
    expect(await hideReason.innerText()).toEqual('motiv ascundere: alta');
  }
})

test('Should not close hide reason window when clicking category with subcategories in AdPanel context.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd =  await utilsPubli.findFirstAdWithPhone(page);
  await (await firstAd.$('[data-wwid="toggle-hidden"]')).click();
  await page.waitForTimeout(800);

  const aspectButton = await firstAd.$(':text("aspect")');
  await aspectButton.click();
  await page.waitForTimeout(500);

  const hideReasonSelection = await firstAd.$('[data-wwid="hide-reason-selection"]');
  expect(hideReasonSelection).toBeTruthy();
  
  const subcategories = await firstAd.$$('[data-wwid="subcategory"]');
  expect(subcategories.length).toBeGreaterThan(0);
  
  expect(await (await firstAd.$('[data-wwid="hide-reason"]')).innerText()).toEqual('motiv ascundere: aspect');
  
  await subcategories[0].click();
  await page.waitForTimeout(500);
  
  expect(await (await firstAd.$('[data-wwid="hide-reason"]')).innerText()).toContain('motiv ascundere: aspect: ');
})
