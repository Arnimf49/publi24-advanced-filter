import {test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {ElementHandle} from "playwright-core";
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

  const firstAd =  await utilsPubli.selectAd(page);
  const adId = await firstAd.getAttribute('data-articleid');

  await (await firstAd.$('[data-wwid="toggle-hidden"]')).click();
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
  await page.waitForTimeout(800);

  const hideReasons = await firstAd.$$('[data-wwid="reason"]');
  expect(hideReasons).toHaveLength(5);

  const temporarButton = await firstAd.$(':text("temporar")');
  await temporarButton.click();
  await page.waitForTimeout(1000);
  expect(await (await firstAd.$('[data-wwid="hide-reason"]')).innerText()).toEqual('motiv ascundere: temporar');

  const pozeFalseButton = await firstAd.$(':text("poze false")');
  await pozeFalseButton.click();
  await page.waitForTimeout(1000);
  expect(await (await firstAd.$('[data-wwid="hide-reason"]')).innerText()).toEqual('motiv ascundere: poze false');
})

test('Should show subcategories when clicking category with subcategories.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd =  await utilsPubli.findFirstAdWithPhone(page);
  await (await firstAd.$('[data-wwid="toggle-hidden"]')).click();
  await page.waitForTimeout(800);

  const aspectButton = await firstAd.$(':text("aspect")');
  await aspectButton.click();
  await page.waitForTimeout(500);

  const subcategories = await firstAd.$$('[data-wwid="subcategory"]');
  expect(subcategories).toHaveLength(6);

  const backButton = await firstAd.$('[data-wwid="back-button"]');
  expect(backButton).toBeTruthy();

  const selectedButton = await firstAd.$('[data-wwid="selected-category"]');
  expect(selectedButton).toBeTruthy();
  expect(await selectedButton.innerText()).toEqual('aspect');

  await subcategories[0].click();
  await page.waitForTimeout(1000);
  expect(await (await firstAd.$('[data-wwid="hide-reason"]')).innerText()).toEqual('motiv ascundere: aspect: înălțime');
})

test('Should handle temporar hide with 15 days expiration.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd =  await utilsPubli.findFirstAdWithPhone(page);
  const adId = await firstAd.getAttribute('data-articleid');

  await (await firstAd.$('[data-wwid="toggle-hidden"]')).click();
  await page.waitForTimeout(800);

  const temporarButton = await firstAd.$(':text("temporar")');
  expect(temporarButton).toBeTruthy();

  await temporarButton.click();
  await page.waitForTimeout(1000);

  expect(await (await firstAd.$('[data-wwid="hide-reason"]')).innerText()).toEqual('motiv ascundere: temporar');

  await page.reload();
  const hiddenAd = await page.$(`[data-articleid="${adId}"]`);
  await utilsPubli.assertAdHidden(hiddenAd);
})

test('Should allow going back from subcategories to main categories.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd =  await utilsPubli.findFirstAdWithPhone(page);
  await (await firstAd.$('[data-wwid="toggle-hidden"]')).click();
  await page.waitForTimeout(800);

  const comportamentButton = await firstAd.$(':text("comportament")');
  await comportamentButton.click();
  await page.waitForTimeout(500);

  const subcategories = await firstAd.$$('[data-wwid="subcategory"]');
  expect(subcategories).toHaveLength(4);

  const backButton = await firstAd.$('[data-wwid="back-button"]');
  await backButton.click();
  await page.waitForTimeout(500);

  const mainReasons = await firstAd.$$('[data-wwid="reason"]');
  expect(mainReasons).toHaveLength(5);

  const title = await firstAd.$('[data-wwid="hide-reason-selection"] span');
  expect(await title.innerText()).toEqual('motivul ascunderii?');
})

test('Should hide phone number and thus hide duplicate ads.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const getMultipleArticlesWithSamePhone = async () => {
    const articles = await page.$$('[data-articleid]');
    let articlesWithPhone: Array<ElementHandle>;

    for (let ad of articles) {
      const phone = await ad.$('[data-wwid="phone-number"]');
      if (phone) {
        articlesWithPhone = await page.$$(`[data-wwphone="${await phone.innerText()}"]`);

        if (articlesWithPhone.length > 1) {
          return articlesWithPhone;
        }
      }
    }

    return null;
  }

  let articlesWithPhone: Array<ElementHandle> = await utilsPubli.findAdWithCondition(page, getMultipleArticlesWithSamePhone);

  await (await articlesWithPhone[0].$('[data-wwid="toggle-hidden"]')).click();
  await page.waitForTimeout(1000);

  const autoHideMessage = await (await articlesWithPhone[1].$('[data-wwid="message"]')).innerText();
  expect(autoHideMessage).toEqual('ai mai ascuns un anunț cu acceeași numar de telefon, ascuns automat');
})

test('Should toggle focus mode and not see hidden ads.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd =  (await page.$$('[data-articleid]'))[0];
  const secondad =  (await page.$$('[data-articleid]'))[1];
  await (await firstAd.$('[data-wwid="toggle-hidden"]')).click();
  await (await secondad.$('[data-wwid="toggle-hidden"]')).click();
  const firstArticleId = await firstAd.getAttribute('data-articleid');
  const secondArticleId = await secondad.getAttribute('data-articleid');

  await page.waitForTimeout(1000);

  await (await page.$('[data-wwid="settings-button"]')).click();
  await (await page.$('[data-wwid="focus-mode-switch"]')).click();
  await page.waitForTimeout(1500);

  await expect(page.locator(`[data-articleid="${firstArticleId}"]`)).toBeHidden();
  await expect(page.locator(`[data-articleid="${secondArticleId}"]`)).toBeHidden();

  await (await page.$('[data-wwid="settings-button"]')).click();
  await (await page.$('[data-wwid="focus-mode-switch"]')).click();
  await page.waitForTimeout(1500);

  await expect(page.locator(`[data-articleid="${firstArticleId}"]`)).toBeVisible();
  await expect(page.locator(`[data-articleid="${secondArticleId}"]`)).toBeVisible();
})

test('Should toggle ad deduplication and see only newest ad.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd =  await utilsPubli.findAdWithDuplicates(page);
  const firstArticleUrl = page.url();
  const firstArticleId = await firstAd.getAttribute('data-articleid');

  let duplicateArticleIds: string[] = await utilsPubli.findDuplicateAds(page, firstAd);

  await page.waitForTimeout(1000);

  await (await page.$('[data-wwid="settings-button"]')).click();
  await (await page.$('[data-wwid="ad-deduplication-switch"]')).click();
  await page.waitForTimeout(1500);

  for (let adId of duplicateArticleIds) {
    await expect(page.locator(`[data-articleid="${adId}"]`)).toBeHidden();
  }

  await page.goto(firstArticleUrl);
  await page.waitForTimeout(1500);
  await expect(page.locator(`[data-articleid="${firstArticleId}"]`)).toBeVisible();
})
