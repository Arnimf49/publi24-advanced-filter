import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {Page} from "playwright-core";

const setupHideSetting = async (page: Page, criteria: string) => {
  await page.locator('[data-wwid="settings-button"]').click();
  await page.locator('[data-wwid="auto-hiding"]').click();
  await page.locator(`[data-wwcriteria="${criteria}"]`).click();
  await page.locator('[data-wwid="close"]').click();
}

const assertResetTimeIsSet = async (page: Page, phone: string, expectedDays: number) => {
  const phoneData = await utilsPubli.getPhoneStorageData(page, phone);
  const hideResetAt = phoneData.hideResetAt;
  const expectedExpiry = expectedDays * 24 * 60 * 60 * 1000;
  const actualExpiry = hideResetAt - Date.now();
  expect(Math.abs(actualExpiry - expectedExpiry)).toBeLessThan(5000);
}

test('Should reset manual hide after expiry.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  let ad =  await utilsPubli.findFirstAdWithPhone(page);
  const adId = await ad.getAttribute('data-articleid');

  const hideButton = await ad.$('[data-wwid="toggle-hidden"]');
  await hideButton.click();

  await page.locator('[data-wwid="reason"]:has-text("poze false")').click();
  await utilsPubli.assertAdHidden(ad, {hidden: true});

  const phone = await utilsPubli.getPhoneByArticleId(page, adId);
  await assertResetTimeIsSet(page, phone, 90);

  await utilsPubli.setPhoneStorageProp(page, phone, 'hideResetAt', Date.now() - 5000);
  await page.reload();
  ad =  await utilsPubli.selectAd(page, adId);
  await utilsPubli.assertAdHidden(ad, {hidden: false});
});

test('Should reset auto-hide after expiry.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'onlyTrips');
  let ad =  await utilsPubli.findFirstAdWithPhone(page);
  ad =  await utilsPubli.mockAdContent(page, ad, 'Buna', 'Numai deplasari');
  const adId = await ad.getAttribute('data-articleid');

  await utilsPubli.assertAdHidden(ad, {hidden: true, reason: 'numai deplasări'});

  const phone = await utilsPubli.getPhoneByArticleId(page, adId);
  await assertResetTimeIsSet(page, phone, 15);

  await page.locator('[data-wwid="settings-button"]').click();
  await page.locator('[data-wwid="auto-hiding"]').click();
  await page.locator('[data-wwid="close"]').click();

  await utilsPubli.setPhoneStorageProp(page, phone, 'hideResetAt', Date.now() - 5000);

  await page.reload();

  ad =  await utilsPubli.selectAd(page, adId);
  await utilsPubli.assertAdHidden(ad, {hidden: false});
});

test('Should reset but reapply auto-hide after expiry when content still matches.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'onlyTrips');
  let ad =  await utilsPubli.findFirstAdWithPhone(page);
  ad =  await utilsPubli.mockAdContent(page, ad, 'Buna', 'Numai deplasari');
  const adId = await ad.getAttribute('data-articleid');
  const url = await(await ad.$('[class="article-title"] a')).getAttribute('href');

  await utilsPubli.assertAdHidden(ad, {hidden: true, reason: 'numai deplasări'});

  const phone = await utilsPubli.getPhoneByArticleId(page, adId);
  await assertResetTimeIsSet(page, phone, 15);

  await utilsPubli.setPhoneStorageProp(page, phone, 'hideResetAt', Date.now() - 5000);
  await utilsPubli.forceAdNewAnalyze(page, adId);

  await Promise.all([
    page.reload(),
    page.waitForResponse(response => response.url() === url),
  ]);

  await page.waitForTimeout(1000);

  ad =  await utilsPubli.selectAd(page, adId);
  await utilsPubli.assertAdHidden(ad, {hidden: true, reason: 'numai deplasări'});
  await assertResetTimeIsSet(page, phone, 15);
});

