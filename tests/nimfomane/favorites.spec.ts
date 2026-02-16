import {expect, test} from "../helpers/fixture";
import {utilsNimfomane} from "../helpers/utilsNimfomane";

test('Should add and remove from favorites.', async ({ page }) => {
  await utilsNimfomane.open(page);
  const {id} = await utilsNimfomane.waitForFirstImage(page);

  await expect(page.locator('[data-wwid="favs-button"]')).toContainText('0');
  await page.locator(`[data-wwtopic="${id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
  await expect(page.locator('[data-wwid="favs-button"]')).toContainText('1');

  await utilsNimfomane.throttleReload(page);

  await expect(page.locator('[data-wwid="favs-button"]')).toContainText('1');
  await expect(page.locator(`[data-wwtopic="${id}"] [data-wwid="fav-toggle"][data-wwstate="on"]`)).toBeVisible();

  await page.locator(`[data-wwtopic="${id}"] [data-wwid="fav-toggle"][data-wwstate="on"]`).click();
  await expect(page.locator('[data-wwid="favs-button"]')).toContainText('0');

  await utilsNimfomane.throttleReload(page);

  await expect(page.locator('[data-wwid="favs-button"]')).toContainText('0');
  await expect(page.locator(`[data-wwtopic="${id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`)).toBeVisible();
});

test('Should display favorites in a modal.', async ({ page }) => {
  await utilsNimfomane.open(page);
  const firstTopic = await utilsNimfomane.waitForFirstImage(page);
  const profileLink = await utilsNimfomane.getUserProfileLink(page, firstTopic.user);

  await page.locator(`[data-wwtopic="${firstTopic.id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
  await page.locator('[data-wwid="fav-toggle"][data-wwstate="off"]').first().click();
  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();
  await expect(page.locator('[data-wwid="favorites-modal"] [data-wwid="escort-card"]')).toHaveCount(2);

  const firstCard = page.locator('[data-wwid="favorites-modal"] [data-wwid="escort-card"]').first();
  await expect(firstCard.locator('[data-wwid="escort-name"]')).toHaveAttribute('href', profileLink);
  await expect(firstCard.locator('img')).toBeVisible();

  await firstCard.locator('img').click();
  await expect(page.locator('[data-wwid="escort-image-modal"]')).toBeVisible();
});

test('Should be able to do panel actions from favorites modal.', async ({ page }) => {
  await utilsNimfomane.open(page);

  const {user, id} = await utilsNimfomane.waitForFirstImage(page);
  const phone = await utilsNimfomane.getEscortStorageProp(page, user, 'phone');

  await page.locator(`[data-wwtopic="${id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
  await page.waitForTimeout(200);

  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();

  if (phone) {
    await expect(page.locator('[data-wwid="favorites-modal"] [data-wwid="escort-card"] [data-wwid="whatsapp"]')).toHaveAttribute('href', new RegExp(phone.replace(/\D/g, '')));
  }

  const escortCard = page.locator('[data-wwid="favorites-modal"] [data-wwid="escort-card"]');
  await escortCard.locator('[data-wwid="toggle-hidden"]').click();
  await page.locator('[data-wwid="reason"]').filter({hasText: 'aspect'}).click();
  await page.waitForTimeout(100);
  const firstChild = escortCard.locator('> *:not([data-wwid="hide-reason-container"])').first();
  expect(await firstChild.evaluate((el: Element) => getComputedStyle(el).getPropertyValue('opacity'))).toEqual('0.5');
  expect(await firstChild.evaluate((el: Element) => getComputedStyle(el).getPropertyValue('mix-blend-mode'))).toEqual('luminosity');
  await page.locator('[data-wwid="close-hide-reason"]').click();

  await page.locator('[data-wwid="favorites-modal"] [data-wwid="escort-card"] [data-wwid="fav-toggle"][data-wwstate="on"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"] [data-wwid="escort-card"]')).toHaveCount(0);
  await expect(page.locator('[data-wwid="favorites-modal"]')).toContainText('Nu ai încă escorte favorite');
});

test('Should load image when opening favorites after storage cleared.', async ({ page }) => {
  await utilsNimfomane.open(page);
  const {user, id} = await utilsNimfomane.waitForFirstImage(page);
  
  await page.locator(`[data-wwtopic="${id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
  await page.waitForTimeout(200);
  
  await utilsNimfomane.setEscortStorageProp(page, user, 'optimizedProfileImage', undefined);
  
  await page.goto('https://nimfomane.com/forum/forum/36-escorte-din-bucuresti/');
  await page.waitForTimeout(600);
  
  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();
  
  await expect(page.locator('[data-wwid="favorites-modal"] [data-wwid="escort-card"]')).toHaveCount(1);
  
  const imageSection = page.locator('[data-wwid="favorites-modal"] [data-wwid="escort-card"] [data-wwid="escort-card-image-section"]');
  await expect(imageSection.locator('[data-wwid="loader"]')).toBeVisible();
  
  await expect(imageSection.locator('[data-wwid="escort-card-image"]')).toBeVisible({timeout: 15000});
  await expect(imageSection.locator('[data-wwid="loader"]')).not.toBeVisible();
});

test('Should display no image or error icon if the case.', async ({ page }) => {
  await utilsNimfomane.open(page);
  const {user, id} = await utilsNimfomane.waitForFirstImage(page);
  
  await page.locator(`[data-wwtopic="${id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
  await page.waitForTimeout(200);
  
  await utilsNimfomane.setEscortStorageProp(page, user, 'optimizedProfileImage', null);
  
  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();
  
  const imageSection = page.locator('[data-wwid="favorites-modal"] [data-wwid="escort-card"] [data-wwid="escort-card-image-section"]');
  await expect(imageSection.locator('[data-wwid="no-image-icon"]')).toBeVisible();
  
  await page.locator('[data-wwid="close-modal"]').click();
  
  await utilsNimfomane.setEscortStorageProp(page, user, 'optimizedProfileImage', 'https://invalid-url-that-will-fail.com/image.jpg');
  
  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();
  
  await expect(imageSection.locator('[data-wwid="image-error-icon"]')).toBeVisible({timeout: 5000});
});
