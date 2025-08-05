import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import * as cheerio from "cheerio";
import {utils} from "../helpers/utils";

test('Should show age, height, weight and bmi from description.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {loadStorage: false});

  const articles = await page.$$('[data-articleid]');
  const lastArticle = articles[3];
  const url = await(await lastArticle.$('[class="article-title"] a')).getAttribute('href');

  await utils.modifyAdContent(page, url, {
    title: 'Hai sa ne vedem, 23 de ani',
    description: 'Buna. Sunt Ana, poze 100% reale, 155 si 58 de kg.',
  })

  await page.waitForResponse(response => response.url() === url);
  await page.waitForTimeout(1200);

  await (await lastArticle.$('[data-wwid="investigate"]')).click();
  await page.waitForTimeout(100);

  expect(await (await lastArticle.$('[data-wwid="age"]')).innerText()).toEqual('23ani');
  expect(await (await lastArticle.$('[data-wwid="height"]')).innerText()).toEqual('155cm');
  expect(await (await lastArticle.$('[data-wwid="weight"]')).innerText()).toEqual('58kg');
  expect(await (await lastArticle.$('[data-wwid="bmi"]')).innerText()).toEqual('24.1bmi');
  expect(await (await lastArticle.$('[data-wwid="bmi"]')).getAttribute('data-wwstatus')).toEqual('warn');
});

test('Should show age, height, weight variation between ads of same phone number.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {page: 11, loadStorage: false});

  const adOneId = await page.locator('[data-articleid]').nth(0).getAttribute('data-articleid');
  const adOneUrl = await page.locator('[data-articleid]').nth(0).locator('[class="article-title"] a').getAttribute('href');
  const adTwoId = await page.locator('[data-articleid]').nth(1).getAttribute('data-articleid');
  const adTwoUrl = await page.locator('[data-articleid]').nth(1).locator('[class="article-title"] a').getAttribute('href');

  await utils.modifyAdContent(page, adOneUrl, {
    title: 'Hai sa ne vedem, 23 de ani',
    description: 'Buna. Sunt Ana, poze 100% reale, 155 si 58 de kg.',
  })
  await utils.modifyAdContent(page, adTwoUrl, {
    title: 'Hai sa ne vedem, 24 de ani',
    description: 'Buna. Sunt Ana, poze 100% reale, 157 si 52 de kg.',
  })

  await utilsPubli.open(context, page, {page: 11, loadStorage: false, clearStorage: true});

  await expect(page.locator(`[data-articleid="${adOneId}"] [data-wwid="age"]`)).toHaveText('23ani');
  await expect(page.locator(`[data-articleid="${adOneId}"] [data-wwid="height"]`)).toHaveText('155cm');
  await expect(page.locator(`[data-articleid="${adOneId}"] [data-wwid="weight"]`)).toHaveText('58kg');
  await expect(page.locator(`[data-articleid="${adTwoId}"] [data-wwid="age"]`)).toHaveText('24ani');
  await expect(page.locator(`[data-articleid="${adTwoId}"] [data-wwid="height"]`)).toHaveText('157cm');
  await expect(page.locator(`[data-articleid="${adTwoId}"] [data-wwid="weight"]`)).toHaveText('52kg');
});

test('Should fallback on age, height and weight from phone.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstArticle = await utilsPubli.findAdWithDuplicates(page);
  const firstArticleId = await firstArticle.getAttribute('data-articleid');
  const firstArticleUrl = await (await firstArticle.$('[class="article-title"] a')).getAttribute('href');
  const firstArticleOnPage = page.url();

  const secondArticleId = (await utilsPubli.findDuplicateAds(page, firstArticle))[0];
  const secondArticleUrl = await page.locator(`[data-articleid="${secondArticleId}"] [class="article-title"] a`).getAttribute('href');
  const secondArticleOnPage = page.url();

  await utils.modifyAdContent(page, firstArticleUrl, {
    title: 'Hai sa ne vedem, 23 de ani',
    description: 'Buna. Sunt Ana, poze 100% reale, 155 si 58 de kg.',
  })
  await utils.modifyAdContent(page, secondArticleUrl, {
    title: 'none',
    description: 'none',
  })

  await page.evaluate(({firstArticleId, secondArticleId}) => {
    window.localStorage.removeItem(`ww2:${firstArticleId}`)
    window.localStorage.removeItem(`ww2:${secondArticleId}`)
  }, {firstArticleId, secondArticleId});

  await page.goto(firstArticleOnPage);
  await page.locator(`[data-articleid="${firstArticleId}"]`).scrollIntoViewIfNeeded();
  await expect(page.locator(`[data-articleid="${firstArticleId}"] [data-wwid="age"]`)).toHaveText('23ani');
  await expect(page.locator(`[data-articleid="${firstArticleId}"] [data-wwid="height"]`)).toHaveText('155cm');
  await expect(page.locator(`[data-articleid="${firstArticleId}"] [data-wwid="weight"]`)).toHaveText('58kg');

  if (firstArticleOnPage !== secondArticleOnPage) {
    await page.goto(secondArticleOnPage);
  }
  await page.locator(`[data-articleid="${secondArticleId}"]`).scrollIntoViewIfNeeded();
  await expect(page.locator(`[data-articleid="${secondArticleId}"] [data-wwid="age"]`)).toHaveText('23ani', {timeout: 25000});
  await expect(page.locator(`[data-articleid="${secondArticleId}"] [data-wwid="height"]`)).toHaveText('155cm', {timeout: 25000});
  await expect(page.locator(`[data-articleid="${secondArticleId}"] [data-wwid="weight"]`)).toHaveText('58kg', {timeout: 25000});
});

test('Should re-analyze after 15 days.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {loadStorage: false});

  const articles = await page.$$('[data-articleid]');
  const lastArticle = articles[3];
  const url = await(await lastArticle.$('[class="article-title"] a')).getAttribute('href');
  const id = await lastArticle.getAttribute('data-articleid');

  const mockAge = (age: string) =>
    page.route(url, async (route) => {
      const response = await route.fetch();
      let body = await response.text();

      const $ = cheerio.load(body);

      $('.detail-title h1').text(`Hai sa ne vedem, ${age} de ani`);
      $('.article-description').text('Matter not.');

      const modifiedBody = $.html();

      await route.fulfill({
        response,
        body: modifiedBody,
      });
    });

  await mockAge('23');
  await page.waitForResponse(response => response.url() === url, {timeout: 10000});
  await page.waitForTimeout(2000);
  expect(await (await page.$(`[data-articleid="${id}"] [data-wwid="age"]`)).innerText()).toEqual('23ani');

  await page.evaluate((innerId) => {
    const data = JSON.parse(window.localStorage.getItem(`ww2:${innerId.toUpperCase()}`));
    data.analyzedAt = Date.now() - 1.296e+9 + 1000 * 60;
    window.localStorage.setItem(`ww2:${innerId.toUpperCase()}`, JSON.stringify(data));
  }, id);

  await mockAge('44');
  await page.reload();
  await page.waitForTimeout(2000);
  expect(await (await page.$(`[data-articleid="${id}"] [data-wwid="age"]`)).innerText()).toEqual('23ani');

  await page.evaluate((innerId) => {
    const data = JSON.parse(window.localStorage.getItem(`ww2:${innerId.toUpperCase()}`));
    data.analyzedAt = Date.now() - 1.296e+9 - 1000 * 60;
    window.localStorage.setItem(`ww2:${innerId.toUpperCase()}`, JSON.stringify(data));
  }, id);

  await mockAge('50');
  await page.reload();
  await page.waitForTimeout(1000);
  expect(await (await page.$(`[data-articleid="${id}"] [data-wwid="age"]`)).innerText()).toEqual('50ani');
});

