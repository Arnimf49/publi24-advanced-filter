import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {Page} from "playwright-core";
import {utils} from "../helpers/utils";

const setupArticle = async (page: Page, title: string, description: string) => {
  let button = (await page.$$('[data-wwid="investigate"]')).pop();
  let article = await button.evaluateHandle(el => el.closest('[data-articleid]'));
  const id = await article.getAttribute('data-articleid');
  const url = await (await article.$('.article-title a')).getAttribute('href');

  await utils.modifyAdContent(page, url, { title, description });
  await page.reload();

  article = await page.$(`[data-articleid="${id}"]`);
  button = await article.$('[data-wwid="investigate"]');

  await Promise.all([
    page.waitForResponse(response => response.url() === url),
    button.click(),
  ])
  await article.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

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
    expect(await input.getAttribute('value'), '');
    await input.fill(''+options.value);
    expect(await input.getAttribute('value'), ''+options.value);
  }

  await page.locator('[data-wwid="close"]').click();
}

test('Should automatically hide based on max age.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'maxAge', {defaultValue: 35, value: 26});
  const article = await setupArticle(page, 'Am 27 de ani', 'Buna');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'peste 26 de ani'});
});

test('Should automatically hide based on min height.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'minHeight', {defaultValue: 160, value: 165});
  const article = await setupArticle(page, 'Buna', 'Am 1.64');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'sub 165cm'});
});

test('Should automatically hide based on max height.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'maxHeight', {defaultValue: 175, value: 170});
  const article = await setupArticle(page, 'Buna', 'Inaltime 171cm');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'peste 170cm'});
});

test('Should automatically hide based on max weight.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'maxWeight', {defaultValue: 65, value: 55});
  const article = await setupArticle(page, 'Buna', '56KG');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'peste 55kg'});
});

test('Should automatically hide if trans mentioned.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'trans');
  const article = await setupArticle(page, 'Buna sunt transsexuala', '');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'transsexual'});
});

test('Should automatically hide if botoxed.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'botox');
  const article = await setupArticle(page, 'Buna', 'Siliconata');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'siliconată'});
});

test('Should automatically hide if only trips.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'onlyTrips');
  const article = await setupArticle(page, 'Buna', 'Numai deplasari');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'numai deplasări'});
});

test('Should automatically hide if show web.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'showWeb');
  const article = await setupArticle(page, 'Buna', 'Ofer show web');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'oferă show web'});
});

test('Should automatically hide if btw risk.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'btsRisc');
  const article = await setupArticle(page, 'Buna', 'cum vrei tu');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'risc bts'});
});

test('Should automatically hide if party.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'party');
  const article = await setupArticle(page, 'Buna', 'Fac party si deplasari');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'face party'});
});

test('Should automatically hide if mature.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'mature');
  const article = await setupArticle(page, 'Buna matură 40 ani', '');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'matură'});
});

test('Should automatically hide for multiple.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await setupHideSetting(page, 'onlyTrips');
  await setupHideSetting(page, 'party', {noOpen: true});
  const article = await setupArticle(page, 'Numai depalsari', 'Fac party');
  await utilsPubli.assertAdHidden(article, {hidden: true, reason: 'numai deplasări / face party'});
});

