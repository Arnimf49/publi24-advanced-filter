import {test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {expect} from "playwright/test";

test('Should select default manual hide reason when enabled', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await (await page.$('[data-wwid="settings-button"]')).click();
  const defaultSwitch = await page.$('[data-wwid="default-manual-hide-reason-switch"]');
  expect(defaultSwitch).toBeTruthy();

  await defaultSwitch.click();
  const select = await page.$('[data-wwid="default-manual-hide-reason-select"]');
  expect(select).toBeTruthy();

  expect(await select.inputValue()).toEqual('aspect');

  await select.selectOption('comportament');
  expect(await select.inputValue()).toEqual('comportament');

  await page.keyboard.press('Escape');

  const firstAd = await utilsPubli.findFirstAdWithPhone(page);
  await (await firstAd.$('[data-wwid="toggle-hidden"]')).click();

  const selectedCategoryButton = await firstAd.$('[data-wwid="selected-category"]');
  expect(selectedCategoryButton).toBeTruthy();
  expect(await selectedCategoryButton.innerText()).toEqual('comportament');

  const subcategories = await firstAd.$$('[data-wwid="subcategory"]');
  expect(subcategories).toHaveLength(4);

  await subcategories[0].click();
  expect(await (await firstAd.$('[data-wwid="hide-reason"]')).innerText()).toEqual('motiv ascundere: comportament: nu răspunde');
});

test('Should set poze false as selected reason if unsafe image results are present', async ({ page, context }, testInfo) => {
  testInfo.setTimeout(120000);
  await utilsPubli.open(context, page);

  await (await page.$('[data-wwid="settings-button"]')).click();
  await (await page.$('[data-wwid="default-manual-hide-reason-switch"]')).click();
  await page.keyboard.press('Escape');

  let adWithUnsafeResults = null;
  let attemptCount = 0;

  while (!adWithUnsafeResults) {
    const articles = await page.$$('[data-articleid]');
    const ad = articles[attemptCount % articles.length];
    const adId = await ad.getAttribute('data-articleid');

    if (await ad.$('[data-wwid="investigate_img"]')) {
      await ad.scrollIntoViewIfNeeded();
      await utilsPubli.awaitGooglePagesClose(await ad.$('[data-wwid="investigate_img"]'), context, page);
      await page.waitForTimeout(4000);

      try {
        await page.waitForSelector(`[data-articleid="${adId}"] [data-wwid="image-results"]`, { timeout: 30000 });
        if ((await ad.$$(`[data-wwid="image-results"] a[class*="linkUnsafe"]`)).length > 0) {
          adWithUnsafeResults = ad;
          break;
        }
      } catch (error) {
        console.log(`Attempt ${attemptCount + 1}: No unsafe results found`);
      }
    }

    attemptCount++;

    if (attemptCount >= articles.length) {
      const nextPageArrow = await page.$('.pagination .arrow:last-child a');
      if (nextPageArrow) {
        await nextPageArrow.click();
        attemptCount = 0;
      }
    }
  }

  await (await adWithUnsafeResults.$('[data-wwid="toggle-hidden"]')).click();
  expect(await (await adWithUnsafeResults.$('[data-wwselected="true"]')).innerText()).toEqual('poze false');

  await (await adWithUnsafeResults.$('[data-wwselected="true"]')).click();
  expect(await (await adWithUnsafeResults.$('[data-wwid="hide-reason"]')).innerText()).toEqual('motiv ascundere: poze false');
});

