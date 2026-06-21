import {expect, test} from "../helpers/fixture";
import {ElementHandle} from "playwright-core";
import {utilsPubli} from "../helpers/utilsPubli";

test('Should display duplicate ad count and list them.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const ad: ElementHandle = await utilsPubli.findAdWithDuplicates(page);
  const duplicatesText = await (await ad.$('[data-wwid="duplicates-container"]')).innerText();
  expect(duplicatesText).toMatch(/^\d+\s+anunțuri$/);

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

  expect(await page.waitForSelector('[data-wwid="ads-modal"]')).toBeTruthy();
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

  expect(await (await firstAd.waitForSelector('[data-wwid="hide-reason"]')).innerText()).toEqual('motiv ascundere: aspect');

  await subcategories[0].click();
  await page.waitForTimeout(100);

  expect(await (await firstAd.waitForSelector('[data-wwid="hide-reason"]')).innerText()).toContain('motiv ascundere: aspect: ');
})

test('Should re-open on reload', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const ad: ElementHandle = await utilsPubli.findAdWithDuplicates(page);
  await (await ad.$('[data-wwid="duplicates"]')).click();
  await expect(page.locator('[data-wwid="ads-modal"]')).toBeVisible();

  await page.reload();
  await expect(page.locator('[data-wwid="ads-modal"]')).toBeVisible();
})

test('Should re-open ads on reload when opened from favorites', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const ad: ElementHandle = await utilsPubli.findAdWithDuplicates(page);
  await (await ad.$('[data-wwid="fav-toggle"]')).click();
  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();

  await page.locator('[data-wwid="favorites-modal"] [data-wwid="duplicates"]').click();
  await expect(page.locator('[data-wwid="ads-modal"]')).toBeVisible();

  await page.reload();
  await expect(page.locator('[data-wwid="ads-modal"]')).toBeVisible();
})

test('Should paginate duplicate ads correctly.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const ad: ElementHandle = await utilsPubli.findAdWithDuplicates(page);
  const phone = await (await ad.$('[data-wwid="phone-number"]')).innerText();
  const adUrl = await (await ad.$('.article-title a')).evaluate((el: HTMLAnchorElement) => el.href);

  const existingEntries = await utilsPubli.getPhoneAds(page, phone);
  const n = existingEntries.length;

  const adId = await ad.getAttribute('data-articleid');
  const baseUrl = existingEntries.find((e: string) => !e.startsWith(`${adId}|`))?.split('|')[1] ?? existingEntries[0].split('|')[1];

  const noDupAd = await utilsPubli.findAdWithoutDuplicates(page);
  const noDupPhone = await (await noDupAd.$('[data-wwid="phone-number"]')).innerText();
  const noDupUrl = (await utilsPubli.getPhoneAds(page, noDupPhone))[0].split('|')[1];

  await page.evaluate(({phoneNum, base, noDup, existing, firstBatch, secondBatch}) => {
    const phoneKey = `ww2:phone:${phoneNum}`;
    const phoneData = JSON.parse(localStorage.getItem(phoneKey) || '{}');
    const ads = existing.slice();

    for (let i = 0; i < firstBatch + secondBatch; i++) {
      const id = `FAKE${i}`;
      ads.push(`${id}|${i < firstBatch ? base : noDup}`);
      localStorage.setItem(`ww2:${id}`, JSON.stringify({phone: phoneNum, lastSeen: Date.now()}));
    }

    phoneData.ads = ads;
    localStorage.setItem(phoneKey, JSON.stringify(phoneData));
  }, {phoneNum: phone, base: baseUrl, noDup: noDupUrl, existing: existingEntries, firstBatch: 15 - n, secondBatch: 5});

  expect((await utilsPubli.getPhoneAds(page, phone)).length).toBe(20);

  await page.goto(adUrl);
  await page.waitForTimeout(1500);

  await page.locator('[data-wwid="duplicates"]').click();
  await page.waitForTimeout(200);

  const modal = page.locator('[data-wwid="ads-modal"]');
  await expect(modal).toBeVisible();

  await expect(modal.locator('[data-articleid]')).toHaveCount(15, { timeout: 60000 });

  const loadMoreButton = modal.locator('[data-wwid="load-more"]');
  await expect(loadMoreButton).toBeVisible();
  await expect(loadMoreButton).toHaveText('încarcă mai multe (+5)');
  await expect(modal.locator('[data-wwid="count"]')).toHaveText('20');

  await modal.evaluate((el: HTMLElement) => { el.scrollTop = el.scrollHeight; });
  await expect(modal.locator('[data-wwid="results-count"]')).toBeVisible();

  await Promise.all([
    expect(loadMoreButton).toHaveText('Se încarcă...'),
    expect(loadMoreButton).toBeDisabled(),
    loadMoreButton.click(),
  ]);

  await expect(loadMoreButton).not.toBeVisible({ timeout: 60000 });

  await expect(modal.locator('[data-articleid]').nth(14)).toBeVisible();

  await expect(modal.locator('[data-articleid]')).toHaveCount(20);
  await expect(modal.locator('[data-wwid="count"]')).toHaveText('20');
})
