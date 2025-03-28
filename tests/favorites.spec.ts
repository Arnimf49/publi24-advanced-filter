import {expect, test} from "./helpers/fixture";
import {utils} from "./helpers/utils";
import {ElementHandle} from "playwright-core";

test('Should add favorites and view them.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  await expect(page.locator('[data-ww="temp-save"]')).toHaveText('Favorite (0)');

  await page.locator('[data-wwid="temp-save"][data-wwstate="off"]').first().click();
  await page.locator('[data-wwid="temp-save"][data-wwstate="off"]').first().click();

  await expect(page.locator('[data-ww="temp-save"]')).toHaveText('Favorite (2)');
  await page.locator('[data-ww="temp-save"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();

  const favs = await page.$$('[data-wwid="favorites-modal"] [data-articleid]');
  expect(favs.length).toEqual(2);
  const panels = await page.$$('[data-wwid="favorites-modal"] [data-wwid="control-panel"]');
  expect(panels.length).toEqual(2);
})

test('Should group favorites based on location.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  await page.locator('[data-wwid="temp-save"][data-wwstate="off"]').first().click();

  await utils.openPubli(context, page, {location: 'brasov/brasov'});

  await page.locator('[data-wwid="temp-save"][data-wwstate="off"]').first().click();

  await expect(page.locator('[data-ww="temp-save"]')).toHaveText('Favorite (2)');
  await page.locator('[data-ww="temp-save"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();

  expect((await page.$$('[data-wwid="favorites-modal"] [data-wwid="in-location"] [data-wwid="control-panel"]'))
    .length).toEqual(1);
  expect((await page.$$('[data-wwid="favorites-modal"] [data-wwid="not-in-location"] [data-wwid="control-panel"]'))
    .length).toEqual(1);

  const firstHeader = (await page.$$('[data-wwid="favorites-modal"] .ww-favs-header'))[0];
  expect(await firstHeader.innerText()).toEqual('În locație (1)');
  const secondHeader = (await page.$$('[data-wwid="favorites-modal"] .ww-favs-header'))[1];
  expect(await secondHeader.innerText()).toEqual('În alte locații (1)');
})

test('Should show favorites with no loading ads.', async ({ page, context }) => {
  await utils.openPubli(context, page);
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

  await page.locator('[data-ww="temp-save"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();

  const firstHeader = (await page.$$('[data-wwid="favorites-modal"] .ww-favs-header'))[0];
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
  await utils.openPubli(context, page);
  await page.evaluate(() => {
    window.localStorage.setItem('ww:favs', JSON.stringify(['076666654']));
    const data = JSON.stringify({
      ads: ["157D910A-5D41-4801-ADB2-EAF84839F6AE|https://www.publi24.ro/anunturi/matrimoniale/escorte/anunt/la-mine-nu-ai-fost-fac-si-deplasari-la-hotel-sau-pensiune/480g243d8g747134dge5hdi17163i9dh.html"],
    });
    window.localStorage.setItem('ww2:phone:076666654', data);
  });
  await page.reload();

  await page.locator('[data-ww="temp-save"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();

  await page.locator('[data-wwrmfav="076666654"]').click();
  await expect(page.locator('[data-ww="temp-save"]')).toHaveText('Favorite (0)');
})

test('Should add favorites and remove one.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  await expect(page.locator('[data-ww="temp-save"]')).toHaveText('Favorite (0)');

  await page.locator('[data-wwid="temp-save"][data-wwstate="off"]').first().click();
  await page.locator('[data-wwid="temp-save"][data-wwstate="off"]').first().click();

  await page.locator('[data-ww="temp-save"]').click();
  await page.locator('[data-wwid="favorites-modal"] [data-wwid="temp-save"]').first().click();

  const favs = await page.$$('[data-wwid="favorites-modal"] [data-articleid]');
  expect(favs.length).toEqual(1);

  await expect(page.locator('[data-ww="temp-save"]')).toHaveText('Favorite (1)');
})

test('Should add favorites and remove all.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  await expect(page.locator('[data-ww="temp-save"]')).toHaveText('Favorite (0)');

  await page.locator('[data-wwid="temp-save"][data-wwstate="off"]').first().click();
  await page.locator('[data-wwid="temp-save"][data-wwstate="off"]').first().click();
  await page.locator('[data-wwid="temp-save"][data-wwstate="off"]').first().click();

  await page.locator('[data-ww="temp-save"]').click();
  await page.locator('[data-wwid="clear-favorites"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).not.toBeVisible();

  await expect(page.locator('[data-ww="temp-save"]')).toHaveText('Favorite (0)');
})

test('Should optimize phone ads and display newest for favorite.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  const getAdWithDuplicates = async () => {
    for (let article of await page.$$('[data-articleid]')) {
      if (await article.$('[data-wwid="duplicates-container"]')) {
        return article;
      }
    }
    return null;
  };

  const article: ElementHandle = await utils.findAdWithCondition(page, getAdWithDuplicates);
  const phone = await (await article.$('[data-wwid="phone-number"]')).innerText();
  await (await article.$('[data-wwid="temp-save"]')).click();

  await page.reload();
  await page.waitForTimeout(7000);

  await page.locator('[data-ww="temp-save"]').click();

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

  await page.locator('[data-ww="temp-save"]').click();
  expect(await (await page.$('[data-wwid="favorites-modal"] [data-articleid]')).getAttribute('data-articleid'))
    .toEqual(articleId);
})
