import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import * as cheerio from "cheerio";
import {Page} from "playwright-core";

const setupArticle = async (page: Page, title: string, description: string) => {
  const articles = await page.$$('[data-articleid]');
  const article = articles[2];
  const url = await(await article.$('[class="article-title"] a')).getAttribute('href');

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

  await page.waitForResponse(response => response.url() === url);
  await page.waitForTimeout(1200);

  await (await article.$('[data-wwid="investigate"]')).click();
  await page.waitForTimeout(100);

  return article;
}

const setupHideSetting = async (page: Page, criteria: string, options?: {defaultValue?: string | number, value?: string | number, noOpen?: boolean}) => {
  await (await page.$('[data-wwid="settings-button"]')).click();
  if (!options?.noOpen) {
    await (await page.$('[data-wwid="auto-hiding"]')).click();
  }
  await (await page.$(`[data-wwcriteria="${criteria}"]`)).click();

  if (options?.value) {
    const input = await page.$(`[data-wwcriteria="${criteria}"] input`);
    expect(await input.getAttribute('value'), ''+options.defaultValue);
    await input.fill('');
    await input.fill(''+options.value);
  }

  await page.locator('[data-wwid="close"]').click();
}

test('Should automatically hide based on max age.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {loadStorage: false});

  await setupHideSetting(page, 'maxAge', {defaultValue: 35, value: 26});
  const article = await setupArticle(page, 'Am 27 de ani', 'Buna');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'peste 26 de ani'});
});

test('Should automatically hide based on min height.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {loadStorage: false});

  await setupHideSetting(page, 'minHeight', {defaultValue: 160, value: 165});
  const article = await setupArticle(page, 'Buna', 'Am 1.64');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'sub 165cm'});
});

test('Should automatically hide based on max height.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {loadStorage: false});

  await setupHideSetting(page, 'maxHeight', {defaultValue: 175, value: 170});
  const article = await setupArticle(page, 'Buna', 'Inaltime 171cm');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'peste 170cm'});
});

test('Should automatically hide based on max weight.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {loadStorage: false});

  await setupHideSetting(page, 'maxWeight', {defaultValue: 65, value: 55});
  const article = await setupArticle(page, 'Buna', '56KG');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'peste 55kg'});
});

test('Should automatically hide if trans mentioned.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {loadStorage: false});

  await setupHideSetting(page, 'trans');
  const article = await setupArticle(page, 'Buna sunt transsexuala', '');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'transsexual'});
});

test('Should automatically hide if botoxed.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {loadStorage: false});

  await setupHideSetting(page, 'botox');
  const article = await setupArticle(page, 'Buna', 'Siliconata');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'siliconată'});
});

test('Should automatically hide if only trips.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {loadStorage: false});

  await setupHideSetting(page, 'onlyTrips');
  const article = await setupArticle(page, 'Buna', 'Numai deplasari');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'numai deplasări'});
});

test('Should automatically hide if show web.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {loadStorage: false});

  await setupHideSetting(page, 'showWeb');
  const article = await setupArticle(page, 'Buna', 'Ofer show web');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'oferă show web'});
});

test('Should automatically hide if total service.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {loadStorage: false});

  await setupHideSetting(page, 'total');
  const article = await setupArticle(page, 'Buna', 'Servicii totale');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'servicii totale'});
});

test('Should automatically hide if party.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {loadStorage: false});

  await setupHideSetting(page, 'party');
  const article = await setupArticle(page, 'Buna', 'Fac party si deplasari');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'face party'});
});

test('Should automatically hide if mature.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {loadStorage: false});

  await setupHideSetting(page, 'mature');
  const article = await setupArticle(page, 'Buna matură 40 ani', '');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'matură'});
});

test('Should automatically hide for multiple.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {loadStorage: false});

  await setupHideSetting(page, 'onlyTrips');
  await setupHideSetting(page, 'party', {noOpen: true});
  const article = await setupArticle(page, 'Numai depalsari', 'Fac party');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'numai deplasări / face party'});
});

