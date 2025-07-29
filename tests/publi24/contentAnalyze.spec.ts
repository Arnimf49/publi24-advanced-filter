import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import * as cheerio from "cheerio";

test('Should show age, height, weight and bmi from description.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {loadStorage: false});

  const articles = await page.$$('[data-articleid]');
  const lastArticle = articles[3];
  const url = await(await lastArticle.$('[class="article-title"] a')).getAttribute('href');

  await page.route(url, async (route) => {
    const response = await route.fetch();
    let body = await response.text();

    const $ = cheerio.load(body);

    $('.detail-title h1').text('Hai sa ne vedem, 23 de ani');
    $('.article-description').text('Buna. Sunt Ana, poze 100% reale, 155 si 58 de kg.');

    const modifiedBody = $.html();

    await route.fulfill({
      response,
      body: modifiedBody,
    });
  });

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

