import {expect, test} from "./helpers/fixture";
import {utils} from "./helpers/utils";
import * as cheerio from "cheerio";
import {Page} from "playwright-core";

const setupArticle = async (page: Page, title: string, description: string) => {
  const articles = await page.$$('[data-articleid]');
  const lastArticle = articles[articles.length - 1];
  const url = await(await lastArticle.$('[class="article-title"] a')).getAttribute('href');

  await page.route(url, async (route) => {
    const response = await route.fetch();
    let body = await response.text();

    const $ = cheerio.load(body);

    $('.detail-title h1').text(title);
    $('.article-description').text(description);

    const modifiedBody = $.html();

    await route.fulfill({
      response,
      body: modifiedBody,
    });
  });

  await (await lastArticle.$('[data-wwid="investigate"]')).click();
  await page.waitForResponse(response => response.url() === url);
  await page.waitForTimeout(1200);

  return lastArticle;
}

const setupHideSetting = async (page: Page, criteria: string, options?: {defaultValue?: string | number, value?: string | number, noOpen?: boolean}) => {
  await (await page.$('[data-ww="settings-button"]')).click();
  if (!options.noOpen) {
    await (await page.$('[data-wwid="auto-hiding"]')).click();
  }
  await (await page.$(`[data-wwcriteria="${criteria}"]`)).click();

  if (options.value) {
    const input = await page.$(`[data-wwcriteria="${criteria}"] input`);
    expect(await input.getAttribute('value'), ''+options.defaultValue);
    await input.fill('');
    await input.fill(''+options.value);
  }

  await page.locator('[data-wwid="close"]').click();
}

const pageCleanup = async (page: Page) => {
  await page.close();
  await new Promise(r => setTimeout(r, 12000));
}

test('Should automatically hide based on max age.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  await setupHideSetting(page, 'maxAge', {defaultValue: 35, value: 26});
  const article = await setupArticle(page, 'Am 27 de ani', 'Buna');
  await utils.assertArticleHidden(article, {hidden: true, reason: 'peste 26 de ani'});

  await pageCleanup(page);
});

test('Should automatically hide based on min height.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  await setupHideSetting(page, 'minHeight', {defaultValue: 160, value: 165});
  const article = await setupArticle(page, 'Buna', 'Am 1.64');
  await utils.assertArticleHidden(article, {hidden: true, reason: 'sub 165cm'});

  await pageCleanup(page);
});

test('Should automatically hide based on max height.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  await setupHideSetting(page, 'maxHeight', {defaultValue: 175, value: 170});
  const article = await setupArticle(page, 'Buna', 'Inaltime 171cm');
  await utils.assertArticleHidden(article, {hidden: true, reason: 'peste 170cm'});

  await pageCleanup(page);
});

test('Should automatically hide based on max weight.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  await setupHideSetting(page, 'maxWeight', {defaultValue: 65, value: 55});
  const article = await setupArticle(page, 'Buna', '56KG');
  await utils.assertArticleHidden(article, {hidden: true, reason: 'peste 55kg'});

  await pageCleanup(page);
});

test('Should automatically hide if trans mentioned.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  await setupHideSetting(page, 'trans');
  const article = await setupArticle(page, 'Buna sunt transsexuala', '');
  await utils.assertArticleHidden(article, {hidden: true, reason: 'transsexual'});

  await pageCleanup(page);
});

test('Should automatically hide if botoxed.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  await setupHideSetting(page, 'botox');
  const article = await setupArticle(page, 'Buna', 'Siliconata');
  await utils.assertArticleHidden(article, {hidden: true, reason: 'siliconată'});

  await pageCleanup(page);
});

test('Should automatically hide if only trips.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  await setupHideSetting(page, 'onlyTrips');
  const article = await setupArticle(page, 'Buna', 'Numai deplasari');
  await utils.assertArticleHidden(article, {hidden: true, reason: 'numai deplasări'});

  await pageCleanup(page);
});

test('Should automatically hide if show web.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  await setupHideSetting(page, 'showWeb');
  const article = await setupArticle(page, 'Buna', 'Ofer show web');
  await utils.assertArticleHidden(article, {hidden: true, reason: 'oferă show web'});

  await pageCleanup(page);
});

test('Should automatically hide if total service.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  await setupHideSetting(page, 'total');
  const article = await setupArticle(page, 'Buna', 'Servicii totale');
  await utils.assertArticleHidden(article, {hidden: true, reason: 'servicii totale'});

  await pageCleanup(page);
});

test('Should automatically hide if party.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  await setupHideSetting(page, 'party');
  const article = await setupArticle(page, 'Buna', 'Fac party si deplasari');
  await utils.assertArticleHidden(article, {hidden: true, reason: 'face party'});

  await pageCleanup(page);
});

test('Should automatically hide for multiple.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  await setupHideSetting(page, 'onlyTrips');
  await setupHideSetting(page, 'party', {noOpen: true});
  const article = await setupArticle(page, 'Deplasari', 'Fac party si deplasari');
  await utils.assertArticleHidden(article, {hidden: true, reason: 'numai deplasări / face party'});

  await pageCleanup(page);
});

