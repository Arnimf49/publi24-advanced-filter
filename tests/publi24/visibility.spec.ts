import {test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {expect} from "playwright/test";

test('Should hide without a reason.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd =  await utilsPubli.selectAd(page);
  const adId = await firstAd.getAttribute('data-articleid');
  const hideButton = await firstAd.$('[data-wwid="toggle-hidden"]');

  await hideButton.click();
  await utilsPubli.assertAdHidden(firstAd);

  await page.reload();
  const ad =  await page.$(`[data-articleid="${adId}"]`);
  await utilsPubli.assertAdHidden(ad);
})

test('Should hide and then show.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd =  await utilsPubli.findFirstAdWithPhone(page);
  const adId = await firstAd.getAttribute('data-articleid');

  await (await firstAd.$('[data-wwid="toggle-hidden"]')).click();
  await (await firstAd.$(':text("temporar")')).click();
  await utilsPubli.assertAdHidden(firstAd);

  await (await firstAd.$('[data-wwid="show-button"]')).click();
  await utilsPubli.assertAdHidden(firstAd, {hidden: false});

  await (await firstAd.$('[data-wwid="toggle-hidden"]')).click();
  await page.reload();
  const ad =  await page.$(`[data-articleid="${adId}"]`);
  await (await ad.$('[data-wwid="toggle-hidden"]')).click();
  await utilsPubli.assertAdHidden(ad, {hidden: false});
})

test('Should hide with a reason and be able to change reason.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd =  await utilsPubli.findFirstAdWithPhone(page);
  await (await firstAd.$('[data-wwid="toggle-hidden"]')).click();
  await page.waitForTimeout(100);

  const hideReasons = await firstAd.$$('[data-wwid="reason"]');
  expect(hideReasons).toHaveLength(5);

  const temporarButton = await firstAd.$(':text("temporar")');
  await temporarButton.click();
  await page.waitForTimeout(100);
  expect(await (await firstAd.waitForSelector('[data-wwid="hide-reason"]')).innerText()).toEqual('motiv ascundere: temporar');

  const pozeFalseButton = await firstAd.$(':text("poze false")');
  await pozeFalseButton.click();
  await page.waitForTimeout(100);
  expect(await (await firstAd.waitForSelector('[data-wwid="hide-reason"]')).innerText()).toEqual('motiv ascundere: poze false');
})

test('Should show subcategories when clicking category with subcategories.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd =  await utilsPubli.findFirstAdWithPhone(page);
  await (await firstAd.$('[data-wwid="toggle-hidden"]')).click();
  await page.waitForTimeout(100);

  const aspectButton = await firstAd.$(':text("aspect")');
  await aspectButton.click();
  await page.waitForTimeout(100);

  const subcategories = await firstAd.$$('[data-wwid="subcategory"]');
  expect(subcategories).toHaveLength(6);

  const backButton = await firstAd.$('[data-wwid="back-button"]');
  expect(backButton).toBeTruthy();

  const selectedButton = await firstAd.$('[data-wwid="selected-category"]');
  expect(selectedButton).toBeTruthy();
  expect(await selectedButton.innerText()).toEqual('aspect');

  await subcategories[0].click();
  await page.waitForTimeout(100);
  expect(await (await firstAd.waitForSelector('[data-wwid="hide-reason"]')).innerText()).toEqual('motiv ascundere: aspect: înălțime');
})


test('Should allow going back from subcategories to main categories.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd =  await utilsPubli.findFirstAdWithPhone(page);
  await (await firstAd.$('[data-wwid="toggle-hidden"]')).click();
  await page.waitForTimeout(100);

  const comportamentButton = await firstAd.$(':text("comportament")');
  await comportamentButton.click();
  await page.waitForTimeout(100);

  const subcategories = await firstAd.$$('[data-wwid="subcategory"]');
  expect(subcategories).toHaveLength(4);

  const backButton = await firstAd.$('[data-wwid="back-button"]');
  await backButton.click();
  await page.waitForTimeout(100);

  const mainReasons = await firstAd.$$('[data-wwid="reason"]');
  expect(mainReasons).toHaveLength(5);

  const title = await firstAd.$('[data-wwid="hide-reason-selection"] span');
  expect(await title.innerText()).toEqual('motivul ascunderii?');
})

test('Should hide phone number and thus hide duplicate ads.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd =  await utilsPubli.findAdWithDuplicates(page);
  await (await firstAd.waitForSelector('[data-wwid="toggle-hidden"]')).click();
  await page.waitForTimeout(100);

  const secondAd = page.locator(`[data-articleid="${(await utilsPubli.getDuplicateAdIds(page, firstAd))[0]}"]`);
  const autoHideMessage = await secondAd.locator('[data-wwid="message"]').innerText();
  expect(autoHideMessage).toEqual('ai mai ascuns un anunț cu acceeași numar de telefon, ascuns automat');
})

test('Should toggle focus mode and not see hidden ads.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd =  (await page.$$('[data-articleid]'))[0];
  const secondad =  (await page.$$('[data-articleid]'))[1];
  await (await firstAd.waitForSelector('[data-wwid="toggle-hidden"]')).click();
  await (await secondad.waitForSelector('[data-wwid="toggle-hidden"]')).click();
  const firstAdId = await firstAd.getAttribute('data-articleid');
  const secondAdId = await secondad.getAttribute('data-articleid');

  await page.locator('[data-wwid="settings-button"]').click();
  await page.locator('[data-wwid="focus-mode-switch"]').click();
  await page.waitForTimeout(1500);

  await expect(page.locator(`[data-articleid="${firstAdId}"]`)).toBeHidden();
  await expect(page.locator(`[data-articleid="${secondAdId}"]`)).toBeHidden();

  await page.locator('[data-wwid="settings-button"]').click();
  await page.locator('[data-wwid="focus-mode-switch"]').click();
  await page.waitForTimeout(1500);

  await expect(page.locator(`[data-articleid="${firstAdId}"]`)).toBeVisible();
  await expect(page.locator(`[data-articleid="${secondAdId}"]`)).toBeVisible();
})

test('Should toggle ad deduplication and see only newest ad.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd =  await utilsPubli.findAdWithDuplicates(page);
  const firstAdUrl = page.url();
  const firstAdId = await firstAd.getAttribute('data-articleid');

  let duplicateArticleIds: string[] = await utilsPubli.getDuplicateAdIds(page, firstAd);

  await page.locator('[data-wwid="settings-button"]').click();
  await page.locator('[data-wwid="ad-deduplication-switch"]').click();
  await page.waitForTimeout(1500);

  for (let adId of duplicateArticleIds) {
    await expect(page.locator(`[data-articleid="${adId}"]`)).toBeHidden();
  }

  await page.goto(firstAdUrl);
  await page.waitForTimeout(1500);
  await expect(page.locator(`[data-articleid="${firstAdId}"]`)).toBeVisible();
})
