import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";

test('Should show age, height, weight and bmi from description.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {loadStorage: false});

  let ad =  await utilsPubli.findFirstAdWithPhone(page);

  ad = await utilsPubli.mockAdContent(
    page,
    ad,
    'Buna. Sunt Ana, poze 100% reale, 155 si 58 de kg.',
    'Hai sa ne vedem, 23 de ani'
  )

  expect(await (await ad.$('[data-wwid="age"]')).innerText()).toEqual('23ani');
  expect(await (await ad.$('[data-wwid="height"]')).innerText()).toEqual('155cm');
  expect(await (await ad.$('[data-wwid="weight"]')).innerText()).toEqual('58kg');
  expect(await (await ad.$('[data-wwid="bmi"]')).innerText()).toEqual('24.1bmi');
  expect(await (await ad.$('[data-wwid="bmi"]')).getAttribute('data-wwstatus')).toEqual('warn');
});

test('Should show age, height, weight variation between ads of same phone number.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd =  await utilsPubli.findAdWithDuplicates(page);
  const firstArticleId = await firstAd.getAttribute('data-articleid');
  const firstArticleUrl = await (await firstAd.$('[class="article-title"] a')).getAttribute('href');
  const firstArticleOnPage = page.url();

  const secondArticleId = (await utilsPubli.findDuplicateAds(page, firstAd))[0];
  const secondArticleUrl = await page.locator(`[data-articleid="${secondArticleId}"] [class="article-title"] a`).getAttribute('href');
  const secondArticleOnPage = page.url();

  await utilsPubli.mockAdContentResponse(page, firstArticleUrl, {
    title: 'Hai sa ne vedem, 23 de ani',
    description: 'Buna. Sunt Ana, poze 100% reale, 155 si 58 de kg.',
  })
  await utilsPubli.mockAdContentResponse(page, secondArticleUrl, {
    title: 'Hai sa ne vedem, 24 de ani',
    description: 'Buna. Sunt Ana, poze 100% reale, 157 si 52 de kg.',
  })

  await page.evaluate(({firstArticleId, secondArticleId}) => {
    window.localStorage.removeItem(`ww2:${firstArticleId}`)
    window.localStorage.removeItem(`ww2:${secondArticleId}`)
  }, {firstArticleId, secondArticleId});

  await page.goto(firstArticleOnPage);
  await utilsPubli.selectAd(page, firstArticleId);
  await page.locator(`[data-articleid="${firstArticleId}"] [data-wwid="phone-number"]`).waitFor({timeout: 25000});
  await expect(page.locator(`[data-articleid="${firstArticleId}"] [data-wwid="age"]`)).toHaveText('23ani');
  await expect(page.locator(`[data-articleid="${firstArticleId}"] [data-wwid="height"]`)).toHaveText('155cm');
  await expect(page.locator(`[data-articleid="${firstArticleId}"] [data-wwid="weight"]`)).toHaveText('58kg');

  if (firstArticleOnPage !== secondArticleOnPage) {
    await page.goto(secondArticleOnPage);
  }
  await utilsPubli.selectAd(page, firstArticleId);
  await page.locator(`[data-articleid="${secondArticleId}"] [data-wwid="phone-number"]`).waitFor({timeout: 15000});
  await expect(page.locator(`[data-articleid="${secondArticleId}"] [data-wwid="age"]`)).toHaveText('24ani', {timeout: 25000});
  await expect(page.locator(`[data-articleid="${secondArticleId}"] [data-wwid="height"]`)).toHaveText('157cm', {timeout: 25000});
  await expect(page.locator(`[data-articleid="${secondArticleId}"] [data-wwid="weight"]`)).toHaveText('52kg', {timeout: 25000});
});

test('Should fallback on age, height and weight from phone.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd =  await utilsPubli.findAdWithDuplicates(page);
  const firstArticleId = await firstAd.getAttribute('data-articleid');
  const firstArticleUrl = await (await firstAd.$('[class="article-title"] a')).getAttribute('href');
  const firstArticleOnPage = page.url();

  const secondArticleId = (await utilsPubli.findDuplicateAds(page, firstAd))[0];
  const secondArticleUrl = await page.locator(`[data-articleid="${secondArticleId}"] [class="article-title"] a`).getAttribute('href');
  const secondArticleOnPage = page.url();

  await utilsPubli.mockAdContentResponse(page, firstArticleUrl, {
    title: 'Hai sa ne vedem, 23 de ani',
    description: 'Buna. Sunt Ana, poze 100% reale, 155 si 58 de kg.',
  })
  await utilsPubli.mockAdContentResponse(page, secondArticleUrl, {
    title: 'none',
    description: 'none',
  })

  await page.evaluate(({firstArticleId, secondArticleId}) => {
    window.localStorage.removeItem(`ww2:${firstArticleId}`)
    window.localStorage.removeItem(`ww2:${secondArticleId}`)
  }, {firstArticleId, secondArticleId});

  await page.goto(firstArticleOnPage);
  await utilsPubli.selectAd(page, firstArticleId);
  await page.locator(`[data-articleid="${firstArticleId}"] [data-wwid="phone-number"]`).waitFor({timeout: 25000});
  await expect(page.locator(`[data-articleid="${firstArticleId}"] [data-wwid="age"]`)).toHaveText('23ani');
  await expect(page.locator(`[data-articleid="${firstArticleId}"] [data-wwid="height"]`)).toHaveText('155cm');
  await expect(page.locator(`[data-articleid="${firstArticleId}"] [data-wwid="weight"]`)).toHaveText('58kg');

  if (firstArticleOnPage !== secondArticleOnPage) {
    await page.goto(secondArticleOnPage);
  }
  await utilsPubli.selectAd(page, secondArticleId);
  await page.locator(`[data-articleid="${secondArticleId}"] [data-wwid="phone-number"]`).waitFor({timeout: 15000});
  await expect(page.locator(`[data-articleid="${secondArticleId}"] [data-wwid="age"]`)).toHaveText('23ani', {timeout: 25000});
  await expect(page.locator(`[data-articleid="${secondArticleId}"] [data-wwid="height"]`)).toHaveText('155cm', {timeout: 25000});
  await expect(page.locator(`[data-articleid="${secondArticleId}"] [data-wwid="weight"]`)).toHaveText('58kg', {timeout: 25000});
});

test('Should re-analyze after 15 days.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {loadStorage: false});

  let ad =  await utilsPubli.selectAd(page);
  const id = await ad.getAttribute('data-articleid');
  const url = await (await ad.$('[class="article-title"] a')).getAttribute('href');

  ad = await utilsPubli.mockAdContent(page, ad, 'Hai sa ne vedem, 23 de ani', 'Matter not.');
  expect(await (await ad.$('[data-wwid="age"]')).innerText()).toEqual('23ani');

  await page.evaluate((innerId) => {
    const data = JSON.parse(window.localStorage.getItem(`ww2:${innerId.toUpperCase()}`));
    data.analyzedAt = Date.now() - (1.296e+9 - 1000 * 60);
    window.localStorage.setItem(`ww2:${innerId.toUpperCase()}`, JSON.stringify(data));
  }, id);

  await utilsPubli.mockAdContentResponse(page, url, {title: 'Hai sa ne vedem, 44 de ani', description: 'Matter not.'});
  await page.reload();
  await page.waitForTimeout(2000);
  ad =  await utilsPubli.selectAd(page, id);
  expect(await (await ad.$('[data-wwid="age"]')).innerText()).toEqual('23ani');

  await utilsPubli.forceAdNewAnalyze(page, id);

  ad =  await utilsPubli.mockAdContent(page, ad, 'Hai sa ne vedem, 50 de ani', 'Matter not.');
  expect(await (await ad.$('[data-wwid="age"]')).innerText()).toEqual('50ani');
});

