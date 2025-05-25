import {expect, test} from "../helpers/fixture";
import {ElementHandle} from "playwright-core";
import {utilsPubli} from "../helpers/utilsPubli";

test('Should display duplicate ad count and list them.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const article: ElementHandle = await utilsPubli.findAdWithDuplicates(page);
  const duplicatesText = await (await article.$('[data-wwid="duplicates-container"]')).innerText();
  expect(duplicatesText).toMatch(/^\d+ anunțuri cu acest telefon \(vizualizează\)$/);

  const count = +(duplicatesText.match(/(\d+)/)[1]);
  const phone = await (await article.$('[data-wwid="phone-number"]')).innerText();

  await (await article.$('[data-wwid="duplicates"]')).click();
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

  const article: ElementHandle = await utilsPubli.findAdWithDuplicates(page);
  await (await article.$('[data-wwid="duplicates"]')).click();
  await page.waitForTimeout(200);

  const duplicatesIds = [];
  for (let duplicate of await page.$$('[data-wwid="ads-modal"] [data-articleid]')) {
    duplicatesIds.push(await duplicate.getAttribute('data-articleid'))
  }

  await page.locator('[data-wwid="ads-modal"] [data-wwid="hide-all"]').waitFor();
  await page.locator('[data-wwid="ads-modal"] [data-wwid="hide-all"]').click();
  await ((await page.$$('[data-wwid="ads-modal"] [data-wwid="reason"]'))[0]).click();

  expect(await page.$('[data-wwid="ads-modal"]')).toBeNull();

  await page.waitForTimeout(1000);

  for (let id of duplicatesIds) {
    const article = await utilsPubli.findAdWithCondition(page, async () => await page.$(`[data-articleid="${id}"]`))
    const hideReason = await article.$('[data-wwid="hide-reason"]');
    expect(hideReason).not.toBeNull();
    expect(await hideReason.innerText()).toEqual('motiv ascundere: scump');
  }
})

