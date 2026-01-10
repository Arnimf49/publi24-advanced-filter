import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";

test('Should close modal with esc.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await page.locator('[data-wwid="fav-toggle"][data-wwstate="off"]').first().click();
  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator('[data-wwid="favorites-modal"]')).not.toBeVisible();
})

test('Should close modal by clicking background.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await page.locator('[data-wwid="fav-toggle"][data-wwstate="off"]').first().click();
  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();

  await page.locator('[data-wwid="favorites-modal"]').click({ position: { x: 5, y: 5 } });
  await expect(page.locator('[data-wwid="favorites-modal"]')).not.toBeVisible();
})

test('Should use navigation with modals.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const ad = await utilsPubli.findAdWithDuplicates(page);
  await (await ad.$('[data-wwid="fav-toggle"]')).click();

  const initialPage = page.url();
  const nextPageButton = (await page.$$('.pagination .arrow'))[1];
  await nextPageButton.click();
  await page.waitForTimeout(2000);
  const currentPage = page.url();

  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();

  await page.locator('[data-wwid="favorites-modal"] [data-wwid="duplicates"]').first().click();
  await page.waitForTimeout(200);
  await expect(page.locator('[data-wwid="ads-modal"]')).toBeVisible();

  await page.goBack();
  await page.waitForTimeout(200);
  await expect(page.locator('[data-wwid="ads-modal"]')).not.toBeVisible();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();

  await page.goBack();
  await page.waitForTimeout(200);
  await expect(page.locator('[data-wwid="favorites-modal"]')).not.toBeVisible();
  expect(page.url()).toEqual(currentPage);

  await page.goBack();
  await page.waitForTimeout(200);
  expect(page.url()).toEqual(initialPage);
})

test('Manual close should cleanup navigation', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  await page.locator('[data-wwid="fav-toggle"][data-wwstate="off"]').first().click();

  const currentPage = page.url();
  const nextPageButton = (await page.$$('.pagination .arrow'))[1];
  await nextPageButton.click();
  await page.waitForTimeout(2000);

  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();

  await page.locator('[data-wwid="close"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).not.toBeVisible();

  await page.goBack();
  await page.waitForTimeout(200);
  expect(page.url()).toEqual(currentPage);
})
