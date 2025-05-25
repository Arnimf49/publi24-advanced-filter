import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {ElementHandle} from "playwright-core";

test('Should add favorites and view them.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await expect(page.locator('[data-wwid="favs-button"]')).toHaveText('Favorite (0)');

  await page.locator('[data-wwid="fav-toggle"][data-wwstate="off"]').first().click();
  await page.locator('[data-wwid="fav-toggle"][data-wwstate="off"]').first().click();

  await expect(page.locator('[data-wwid="favs-button"]')).toHaveText('Favorite (2)');
  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();

  const favs = await page.$$('[data-wwid="favorites-modal"] [data-articleid]');
  expect(favs.length).toEqual(2);
  const panels = await page.$$('[data-wwid="favorites-modal"] [data-wwid="control-panel"]');
  expect(panels.length).toEqual(2);
})

test('Should group favorites based on location.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await page.locator('[data-wwid="fav-toggle"][data-wwstate="off"]').first().click();

  await utilsPubli.open(context, page, {location: 'brasov/brasov'});

  await page.locator('[data-wwid="fav-toggle"][data-wwstate="off"]').first().click();

  await expect(page.locator('[data-wwid="favs-button"]')).toHaveText('Favorite (2)');
  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();

  expect((await page.$$('[data-wwid="favorites-modal"] [data-wwid="in-location"] [data-wwid="control-panel"]'))
    .length).toEqual(1);
  expect((await page.$$('[data-wwid="favorites-modal"] [data-wwid="not-in-location"] [data-wwid="control-panel"]'))
    .length).toEqual(1);

  const firstHeader = (await page.$$('[data-wwid="favorites-modal"] [data-wwid="favs-header"]'))[0];
  expect(await firstHeader.innerText()).toEqual('În locație (1)');
  const secondHeader = (await page.$$('[data-wwid="favorites-modal"] [data-wwid="favs-header"]'))[1];
  expect(await secondHeader.innerText()).toEqual('În alte locații (1)');
})

test('Should show favorites with no loading ads.', async ({ page, context }) => {
  await utilsPubli.open(context, page);
  await page.evaluate(() => {
    window.localStorage.setItem('ww:favs', JSON.stringify(['076666655', '076666654']));
    const data = JSON.stringify({
      ads: ["157D910A-5D41-4801-ADB2-EAF84839F6AE|https://www.publi24.ro/anunturi/matrimoniale/escorte/anunt/la-mine-nu-ai-fost-fac-si-deplasari-la-hotel-sau-pensiune/480g243d8g747134dge5hdi17163i9dh.html"],
      height: 155,
    });
    window.localStorage.setItem('ww2:phone:076666655', data);
    window.localStorage.setItem('ww2:phone:076666654', data);
  });
  await page.reload();

  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();

  const firstHeader = (await page.$$('[data-wwid="favorites-modal"] [data-wwid="favs-header"]'))[0];
  expect(await firstHeader.innerText()).toEqual('Fără anunțuri active (2)');

  expect(await (await page.$$('[data-wwid="favorites-modal"] [data-wwid="phone-number"]'))[0].innerText())
    .toEqual('076666655')
  expect(await (await page.$$('[data-wwid="favorites-modal"] [data-wwid="phone-number"]'))[1].innerText())
    .toEqual('076666654')

  expect(await page.$$('[data-wwid="favorites-modal"] [data-wwid="whatsapp"]'))
    .toHaveLength(2);
  expect(await page.$$('[data-wwid="favorites-modal"] [data-wwid="height"]'))
    .toHaveLength(2);
})

test('Should be able to remove favorite without available ads.', async ({ page, context }) => {
  await utilsPubli.open(context, page);
  await page.evaluate(() => {
    window.localStorage.setItem('ww:favs', JSON.stringify(['076666654']));
    const data = JSON.stringify({
      ads: ["157D910A-5D41-4801-ADB2-EAF84839F6AE|https://www.publi24.ro/anunturi/matrimoniale/escorte/anunt/la-mine-nu-ai-fost-fac-si-deplasari-la-hotel-sau-pensiune/480g243d8g747134dge5hdi17163i9dh.html"],
    });
    window.localStorage.setItem('ww2:phone:076666654', data);
  });
  await page.reload();

  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();

  await page.locator('[data-wwrmfav="076666654"]').click();
  await expect(page.locator('[data-wwid="favs-button"]')).toHaveText('Favorite (0)');
})

test('Should add favorites and remove one.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await expect(page.locator('[data-wwid="favs-button"]')).toHaveText('Favorite (0)');

  await page.locator('[data-wwid="fav-toggle"][data-wwstate="off"]').first().click();
  await page.locator('[data-wwid="fav-toggle"][data-wwstate="off"]').first().click();

  await page.locator('[data-wwid="favs-button"]').click();
  await page.locator('[data-wwid="favorites-modal"] [data-wwid="fav-toggle"]').first().click();

  const favs = await page.$$('[data-wwid="favorites-modal"] [data-articleid]');
  expect(favs.length).toEqual(1);

  await expect(page.locator('[data-wwid="favs-button"]')).toHaveText('Favorite (1)');
})

test('Should add favorites and remove all.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await expect(page.locator('[data-wwid="favs-button"]')).toHaveText('Favorite (0)');

  await page.locator('[data-wwid="fav-toggle"][data-wwstate="off"]').first().click();
  await page.locator('[data-wwid="fav-toggle"][data-wwstate="off"]').first().click();
  await page.locator('[data-wwid="fav-toggle"][data-wwstate="off"]').first().click();

  await page.locator('[data-wwid="favs-button"]').click();
  await page.locator('[data-wwid="clear-favorites"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).not.toBeVisible();

  await expect(page.locator('[data-wwid="favs-button"]')).toHaveText('Favorite (0)');
})

test('Should optimize phone ads and display newest for favorite.', async ({ page, context }, testInfo) => {
  testInfo.setTimeout(55000);

  await utilsPubli.open(context, page);

  const article: ElementHandle = await utilsPubli.findAdWithDuplicates(page);
  const phone = await (await article.$('[data-wwid="phone-number"]')).innerText();
  await (await article.$('[data-wwid="fav-toggle"]')).click();

  await page.reload();
  await page.waitForTimeout(7000);

  await page.locator('[data-wwid="favs-button"]').click();
  await page.waitForTimeout(500);

  const articleId = await (await page.$('[data-wwid="favorites-modal"] [data-articleid]')).getAttribute('data-articleid');

  await page.evaluate((phone) => {
    const data = JSON.parse(window.localStorage.getItem(`ww2:phone:${phone}`));
    data.ads = data.ads.reverse();
    data.adsOptimized = 0;
    window.localStorage.setItem(`ww2:phone:${phone}`, JSON.stringify(data));
  }, phone);

  await page.reload();

  const adCount = +await (await page.$(`[data-articleid="${articleId}"] [data-wwid="duplicates-count"]`)).innerText();
  await page.waitForTimeout(adCount * 2500 + adCount * 600 + 10);

  await page.locator('[data-wwid="favs-button"]').click();
  expect(await (await page.$('[data-wwid="favorites-modal"] [data-articleid]')).getAttribute('data-articleid'))
    .toEqual(articleId);
})

test('Should display all favorite information.', async ({ page, context }) => {
  await utilsPubli.open(context, page);
  const article: ElementHandle = await utilsPubli.findAdWithDuplicates(page);
  const phone = await (await article.$('[data-wwid="phone-number"]')).innerText();
  await (await article.$('[data-wwid="fav-toggle"]')).click();

  await page.locator('[data-wwid="favs-button"]').click();

  const modal = page.locator('[data-wwid="favorites-modal"]');
  await expect(modal).toBeVisible();

  await expect(modal.locator('[data-wwid="phone-number"]')).toHaveText(phone);
  await expect(modal.locator('[data-wwid="duplicates-container"]')).toBeVisible();
  await expect(modal.locator('[data-wwid="fav-toggle"][data-wwstate="on"]')).toBeVisible();
})
