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

  await page.reload();
  await page.waitForTimeout(200);
  expect(await page.locator('[data-wwid="favs-button"]').innerText()).toEqual('Favorite (0+2)');
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

  const ad: ElementHandle = await utilsPubli.findAdWithDuplicates(page);
  const phone = await (await ad.$('[data-wwid="phone-number"]')).innerText();
  await (await ad.$('[data-wwid="fav-toggle"]')).click();

  await page.reload();
  await page.waitForTimeout(7000);

  await page.locator('[data-wwid="favs-button"]').click();
  await page.waitForTimeout(500);

  const adId = await (await page.$('[data-wwid="favorites-modal"] [data-articleid]')).getAttribute('data-articleid');

  await page.evaluate((phone) => {
    const data = JSON.parse(window.localStorage.getItem(`ww2:phone:${phone}`));
    data.ads = data.ads.reverse();
    data.adsOptimized = 0;
    window.localStorage.setItem(`ww2:phone:${phone}`, JSON.stringify(data));
  }, phone);

  await page.reload();

  const adCount = +await (await page.$(`[data-articleid="${adId}"] [data-wwid="duplicates-count"]`)).innerText();
  await page.waitForTimeout(adCount * 2500 + adCount * 600 + 10);

  await page.locator('[data-wwid="favs-button"]').click();
  expect(await (await page.$('[data-wwid="favorites-modal"] [data-articleid]')).getAttribute('data-articleid'))
    .toEqual(adId);
})

test('Should display all favorite information.', async ({ page, context }) => {
  await utilsPubli.open(context, page);
  const ad: ElementHandle = await utilsPubli.findAdWithDuplicates(page);
  const phone = await (await ad.$('[data-wwid="phone-number"]')).innerText();
  await (await ad.$('[data-wwid="fav-toggle"]')).click();

  await page.locator('[data-wwid="favs-button"]').click();

  const modal = page.locator('[data-wwid="favorites-modal"]');
  await expect(modal).toBeVisible();

  await expect(modal.locator('[data-wwid="phone-number"]')).toHaveText(phone);
  await expect(modal.locator('[data-wwid="duplicates-container"]')).toBeVisible();
  await expect(modal.locator('[data-wwid="fav-toggle"][data-wwstate="on"]')).toBeVisible();
})

test('Should switch phone number of favorite if phone number changes.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd =  await utilsPubli.findFirstAdWithPhone(page);
  await firstAd.waitForSelector('[data-wwid="phone-number"]')
  const phone = await (await firstAd.$('[data-wwid="phone-number"]')).innerText();
  await (await firstAd.$('[data-wwid="fav-toggle"]')).click();

  await page.locator('[data-wwid="favs-button"]').click();

  const modal = page.locator('[data-wwid="favorites-modal"]');
  await expect(modal).toBeVisible();
  await expect(modal.locator('[data-wwid="phone-number"]')).toHaveText(phone);

  await page.route('https://www.publi24.ro/DetailAd/PhoneNumberImages?Length=8', (route) => {
    return route.fulfill({
      status: 200,
      body: 'iVBORw0KGgoAAAANSUhEUgAAANwAAABkCAYAAADtw16ZAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAALGSURBVHhe7dfbkeowDABQyqMgyqEXWqGTXNgFLL+CzQ0zC3POJyiJ7Ei2swMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC+wH45npfM6bBbbn/+Opxu/6w4HfJr9seluG0dE+zLJM7HZb8r8rgZjh3JYWZsb5+Hw1I+oXoXfLL6Bd9lL3q20Nbiq+aoG/7hf2JHc3hnw83MQ6sxb87HfYrjc6Wd4rwc978vP9XIaTlkxV5Lsen6vCnCPULxxWZu5RB3sNdi53JoaY+tbYt5qO/RuZ5PFV5oXJXDSrtalKFwshU4XJ+vzGE3fTyvk0PTROxUDg29sbVsMg/ht7DzpcVEw32B9JJ7BdEvtlD81bGvZ73QzsdDWNFbz56J7WnlUJoZ21bz0BLihu/N39XdyQYKonMsWhOPfo8GCTk0xefPxHY0cyjNjG2reSjEGM32LV5uuBdW9VCYl4vSd07RRPc8UviLsS29HDJv3t2GcijCLkabmb/s1YYL1w0d5Yrqya6JTRSLtvWMmdjSWg7RzNhmYq9GcwjSTvdkMeEDhIKZabhUBAMf8vVSncfHJsr+a+QwExs9yyGYGdum89D17LTB5+iu0Okl16vwxDEqNshVs2B6BdX6fSb2ZiiHuzcdJ6dyKK2MjU8Tiia+zFAg1bdDt0lLoVCuusUScrhckXaKdH16zkzs1WgON8Nju9h6Hrr3642Nj9T6Rkinn8ZRKRyN1j7ksxPUkx0g5ZCKqpXX1UzsTA4/Bsf2Y/N5iI2Z5j1d7xvuSxQrcNAspEcFrBRAWK27spU+7ly5elUfjJ3O4WJkbHfvmIesO3N2t69SF3Fv1e7tJlHchboaR6uy3oZ3josy9pUcRsZ29755qBfAtXkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/rDd7h+SFljmIP9RbgAAAABJRU5ErkJggg=='
    })
  });

  await modal.locator('[data-wwid="investigate"]').click();
  await expect(modal.locator('[data-wwid="phone-number"]')).not.toHaveText(phone);
  await expect(modal.locator('[data-wwid="phone-number"]')).toHaveText('0726627723');
  await expect(modal.locator('[data-wwid="fav-toggle"][data-wwstate="on"]')).toBeVisible();
})

test('Should show new ad when previous was inactive but new appeared.', async ({ page, context }) => {
  await utilsPubli.open(context, page);
  const url = page.url();

  const firstAd =  await utilsPubli.findFirstAdWithPhone(page);
  const phone = await (await firstAd.$('[data-wwid="phone-number"]')).innerText();
  await (await firstAd.$('[data-wwid="fav-toggle"]')).click();

  await page.evaluate((innerPhone) => {
    window.localStorage.setItem(`ww2:phone:${innerPhone}`, JSON.stringify({}));
  }, phone);
  await page.goto(url + '?pag=10');
  await page.locator('[data-wwid="favs-button"]').click();
  await page.waitForTimeout(100);
  expect(await (await page.$$('[data-wwid="favorites-modal"] [data-wwid="no-ads"] [data-wwid="phone-number"]'))[0].innerText())
    .toEqual(phone)

  await page.goto(url);
  await page.waitForTimeout(1000);
  await page.locator('[data-wwid="favs-button"]').click();
  await page.waitForTimeout(500);
  expect(await (await page.$('[data-wwid="favorites-modal"] [data-wwid="in-location"] [data-wwid="phone-number"]')).innerText())
    .toEqual(phone)
})
