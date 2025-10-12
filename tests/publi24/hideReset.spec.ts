import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {Page} from "playwright-core";
import {utils} from "../helpers/utils";

const setupArticle = async (page: Page, title: string, description: string) => {
  let article = await utilsPubli.findFirstArticleWithPhone(page);
  const id = await article.getAttribute('data-articleid');
  const url = await (await article.$('.article-title a')).getAttribute('href');

  await utils.modifyAdContent(page, url, { title, description });
  await utilsPubli.forceNewAnalyzeOnArticle(page, id);

  await Promise.all([
    page.reload(),
    page.waitForResponse(response => response.url() === url),
  ]);
  article = await utilsPubli.selectArticle(id, page);
  await page.waitForTimeout(500);

  return article;
}

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

  let article = await utilsPubli.findFirstArticleWithPhone(page);
  const articleId = await article.getAttribute('data-articleid');

  const hideButton = await article.$('[data-wwid="toggle-hidden"]');
  await hideButton.click();

  await page.locator('[data-wwid="reason"]:has-text("poze false")').click();
  await utilsPubli.assertAdHidden(article, {hidden: true});

  const phone = await utilsPubli.getPhoneByArticleId(page, articleId);
  await assertResetTimeIsSet(page, phone, 90);

  await utilsPubli.setPhoneStorageProp(page, phone, 'hideResetAt', Date.now() - 5000);
  await page.reload();
  article = await utilsPubli.selectArticle(articleId, page);
  await utilsPubli.assertAdHidden(article, {hidden: false});
});

test('Should reset auto-hide after expiry.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'onlyTrips');
  let article = await setupArticle(page, 'Buna', 'Numai deplasari');
  const articleId = await article.getAttribute('data-articleid');

  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'numai deplasări'});

  const phone = await utilsPubli.getPhoneByArticleId(page, articleId);
  await assertResetTimeIsSet(page, phone, 15);

  await page.locator('[data-wwid="settings-button"]').click();
  await page.locator('[data-wwid="auto-hiding"]').click();
  await page.locator('[data-wwid="close"]').click();

  await utilsPubli.setPhoneStorageProp(page, phone, 'hideResetAt', Date.now() - 5000);

  await page.reload();

  article = await utilsPubli.selectArticle(articleId, page);
  await utilsPubli.assertAdHidden(article, {hidden: false});
});

test('Should reset but reapply auto-hide after expiry when content still matches.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'onlyTrips');
  let article = await setupArticle(page, 'Buna', 'Numai deplasari');
  const articleId = await article.getAttribute('data-articleid');
  const url = await(await article.$('[class="article-title"] a')).getAttribute('href');

  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'numai deplasări'});

  const phone = await utilsPubli.getPhoneByArticleId(page, articleId);
  await assertResetTimeIsSet(page, phone, 15);

  await utilsPubli.setPhoneStorageProp(page, phone, 'hideResetAt', Date.now() - 5000);
  await utilsPubli.forceNewAnalyzeOnArticle(page, articleId);

  await Promise.all([
    page.reload(),
    page.waitForResponse(response => response.url() === url),
  ]);

  await page.waitForTimeout(1000);

  article = await utilsPubli.selectArticle(articleId, page);
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'numai deplasări'});
  await assertResetTimeIsSet(page, phone, 15);
});

