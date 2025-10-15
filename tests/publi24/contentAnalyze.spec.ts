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

  expect(await (await ad.waitForSelector('[data-wwid="age"]')).innerText()).toEqual('23ani');
  expect(await (await ad.waitForSelector('[data-wwid="height"]')).innerText()).toEqual('155cm');
  expect(await (await ad.waitForSelector('[data-wwid="weight"]')).innerText()).toEqual('58kg');
  expect(await (await ad.waitForSelector('[data-wwid="bmi"]')).innerText()).toEqual('24.1bmi');
  expect(await (await ad.waitForSelector('[data-wwid="bmi"]')).getAttribute('data-wwstatus')).toEqual('warn');
});

test('Should show age, height, weight variation between ads of same phone number.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd =  await utilsPubli.findAdWithDuplicates(page);
  const firstAdId = await firstAd.getAttribute('data-articleid');
  const firstAdUrl = await (await firstAd.$('[class="article-title"] a')).getAttribute('href');
  const firstAdOnPage = page.url();

  const secondAdId = (await utilsPubli.getDuplicateAdIds(page, firstAd))[0];
  const secondAdUrl = await page.locator(`[data-articleid="${secondAdId}"] [class="article-title"] a`).getAttribute('href');
  const secondAdOnPage = page.url();

  await utilsPubli.mockAdContentResponse(page, firstAdUrl, {
    title: 'Hai sa ne vedem, 23 de ani',
    description: 'Buna. Sunt Ana, poze 100% reale, 155 si 58 de kg.',
  })
  await utilsPubli.mockAdContentResponse(page, secondAdUrl, {
    title: 'Hai sa ne vedem, 24 de ani',
    description: 'Buna. Sunt Ana, poze 100% reale, 157 si 52 de kg.',
  })

  await page.evaluate(({firstAdId, secondAdId}) => {
    window.localStorage.removeItem(`ww2:${firstAdId}`)
    window.localStorage.removeItem(`ww2:${secondAdId}`)
  }, {firstAdId, secondAdId});

  await page.goto(firstAdOnPage);
  await utilsPubli.selectAd(page, firstAdId);
  await expect(page.locator(`[data-articleid="${firstAdId}"] [data-wwid="age"]`)).toHaveText('23ani');
  await expect(page.locator(`[data-articleid="${firstAdId}"] [data-wwid="height"]`)).toHaveText('155cm');
  await expect(page.locator(`[data-articleid="${firstAdId}"] [data-wwid="weight"]`)).toHaveText('58kg');

  if (firstAdOnPage !== secondAdOnPage) {
    await page.goto(secondAdOnPage);
  }
  await utilsPubli.selectAd(page, secondAdId);
  await expect(page.locator(`[data-articleid="${secondAdId}"] [data-wwid="age"]`)).toHaveText('24ani', {timeout: 25000});
  await expect(page.locator(`[data-articleid="${secondAdId}"] [data-wwid="height"]`)).toHaveText('157cm', {timeout: 25000});
  await expect(page.locator(`[data-articleid="${secondAdId}"] [data-wwid="weight"]`)).toHaveText('52kg', {timeout: 25000});
});

test('Should fallback on age, height and weight from phone.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd =  await utilsPubli.findAdWithDuplicates(page);
  const firstAdId = await firstAd.getAttribute('data-articleid');
  const firstAdUrl = await (await firstAd.$('[class="article-title"] a')).getAttribute('href');
  const firstAdOnPage = page.url();

  const secondAdId = (await utilsPubli.getDuplicateAdIds(page, firstAd))[0];
  const secondAdUrl = await page.locator(`[data-articleid="${secondAdId}"] [class="article-title"] a`).getAttribute('href');
  const secondAdOnPage = page.url();

  await utilsPubli.mockAdContentResponse(page, firstAdUrl, {
    title: 'Hai sa ne vedem, 23 de ani',
    description: 'Buna. Sunt Ana, poze 100% reale, 155 si 58 de kg.',
  })
  await utilsPubli.mockAdContentResponse(page, secondAdUrl, {
    title: 'none',
    description: 'none',
  })

  await page.evaluate(({firstAdId, secondAdId}) => {
    window.localStorage.removeItem(`ww2:${firstAdId}`)
    window.localStorage.removeItem(`ww2:${secondAdId}`)
  }, {firstAdId, secondAdId});

  await page.goto(firstAdOnPage);
  await utilsPubli.selectAd(page, firstAdId);
  await page.locator(`[data-articleid="${firstAdId}"] [data-wwid="phone-number"]`).waitFor({timeout: 25000});
  await expect(page.locator(`[data-articleid="${firstAdId}"] [data-wwid="age"]`)).toHaveText('23ani');
  await expect(page.locator(`[data-articleid="${firstAdId}"] [data-wwid="height"]`)).toHaveText('155cm');
  await expect(page.locator(`[data-articleid="${firstAdId}"] [data-wwid="weight"]`)).toHaveText('58kg');

  if (firstAdOnPage !== secondAdOnPage) {
    await page.goto(secondAdOnPage);
  }
  await utilsPubli.selectAd(page, secondAdId);
  await page.locator(`[data-articleid="${secondAdId}"] [data-wwid="phone-number"]`).waitFor({timeout: 15000});
  await expect(page.locator(`[data-articleid="${secondAdId}"] [data-wwid="age"]`)).toHaveText('23ani', {timeout: 25000});
  await expect(page.locator(`[data-articleid="${secondAdId}"] [data-wwid="height"]`)).toHaveText('155cm', {timeout: 25000});
  await expect(page.locator(`[data-articleid="${secondAdId}"] [data-wwid="weight"]`)).toHaveText('58kg', {timeout: 25000});
});

test('Should re-analyze after 15 days.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {loadStorage: false});

  let ad =  await utilsPubli.findFirstAdWithPhone(page);
  const id = await ad.getAttribute('data-articleid');
  const url = await (await ad.$('[class="article-title"] a')).getAttribute('href');

  ad = await utilsPubli.mockAdContent(page, ad, 'Hai sa ne vedem, 23 de ani', 'Matter not.');
  expect(await (await ad.waitForSelector('[data-wwid="age"]')).innerText()).toEqual('23ani');

  // Set not old enough and assert not yet re-analyzed.
  await page.evaluate((innerId) => {
    const data = JSON.parse(window.localStorage.getItem(`ww2:${innerId.toUpperCase()}`));
    data.analyzedAt = Date.now() - (1.296e+9 - 1000 * 60);
    window.localStorage.setItem(`ww2:${innerId.toUpperCase()}`, JSON.stringify(data));
  }, id);
  await utilsPubli.mockAdContentResponse(page, url, {title: 'Hai sa ne vedem, 44 de ani', description: 'Matter not.'});
  await page.reload();
  await page.waitForTimeout(5000);
  ad =  await utilsPubli.selectAd(page, id);
  expect(await (await ad.waitForSelector('[data-wwid="age"]')).innerText()).toEqual('23ani');

  ad =  await utilsPubli.mockAdContent(page, ad, 'Hai sa ne vedem, 50 de ani', 'Matter not.');
  expect(await (await ad.waitForSelector('[data-wwid="age"]')).innerText()).toEqual('50ani');
});

