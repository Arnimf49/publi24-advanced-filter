import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";

test('Should display throttling message and hide loader', async ({ page, context }) => {
  await utilsPubli.open(context, page, {loadStorage: false});

  const ad = await utilsPubli.findFirstAdWithPhone(page);
  const adId = await ad.getAttribute('data-articleid');
  const url = await (await ad.$('[class="article-title"] a')).getAttribute('href');

  const test = async (code: number) => {
    await page.route(url, async route => {
      await route.fulfill({
        status: code,
        body: JSON.stringify({code, message: 'Rate limited'}),
        contentType: 'application/json'
      });
    });

    await page.evaluate((id) => {
      window.localStorage.removeItem(`ww2:${id}`);
    }, adId);

    await page.reload();

    await expect(page.locator(`[data-articleid="${adId}"] [data-wwid="error"]`)).toContainText('Eroare analiză anunț: publi24 a limitat cererile, așteaptă un pic și reincarcă pagina');
    await expect(page.locator(`[data-articleid="${adId}"] [data-wwid="loader"]`)).not.toBeVisible();
  }

  await test(429);
  await test(503);
});

test('Should display phone search error when phone search fails', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const ad = await utilsPubli.findFirstAdWithPhone(page);
  const adId = await ad.getAttribute('data-articleid');

  await page.evaluate(() => {
    window.localStorage.setItem('_pw_throw', 'true');
  });
  await (await ad.$('[data-wwid="investigate"]')).click();

  const errorEl = page.locator(`[data-articleid="${adId}"] [data-wwid="error"]`);
  await expect(errorEl).toContainText('Eroare căutare rezultate telefon: Testing error.');
  await expect(errorEl).toContainText('(Object.throwInTestingIfConfigured');
  await expect(errorEl).toContainText('dist/publi24/index.js:');
});

test('Should display image search error when image search fails', async ({ page, context }) => {
  await utilsPubli.open(context, page, {loadStorage: false});

  const ad = await utilsPubli.findFirstAdWithPhone(page);

  await page.evaluate(() => {
    window.localStorage.setItem('_pw_throw', 'true');
  });
  const adId = await ad.getAttribute('data-articleid');

  await (await ad.$('[data-wwid="investigate_img"]')).click();
  await expect(page.locator(`[data-articleid="${adId}"] [data-wwid="error"]`)).toContainText('Eroare la cautare rezultate imagine: Testing error.');
});
