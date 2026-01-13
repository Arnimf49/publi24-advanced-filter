import {expect, test} from "../helpers/fixture";
import {utilsNimfomane} from "../helpers/utilsNimfomane";

test('Should show logo and close with button.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {firstImage} = await utilsNimfomane.waitForFirstImage(page);
  await firstImage.click();

  await page.locator('[data-wwid="escort-images"] [data-wwid="logo"]').isVisible();
  await page.locator('[data-wwid="escort-images"] [data-wwid="close"]').isVisible();
  await page.locator('[data-wwid="escort-images"] [data-wwid="close"]').click();
  await expect(page.locator('[data-wwid="escort-images"]')).toHaveCount(0);
})

test('Should load more images when scrolling.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {firstImage} = await utilsNimfomane.waitForFirstImage(page);
  await firstImage.click();

  await expect(page.locator('[data-wwid="escort-images"] [data-wwid="loader"]')).toBeVisible();
  await expect(page.locator('[data-wwid="escort-images"] [data-wwid="loader"]')).toHaveCount(0);
  await expect(page.locator('[data-wwid="escort-images"] [data-wwid="escort-image"] img').first()).toBeVisible({timeout: 4000});

  const imagesCount = await page.locator('[data-wwid="escort-images"] [data-wwid="escort-image"] img').count();

  if (imagesCount > 3) {
    await page.waitForTimeout(1000);
    await page.locator('[data-wwid="escort-image-modal"]').locator('[data-wwid="escort-image"]:last-child').scrollIntoViewIfNeeded();

    await expect(page.locator('[data-wwid="escort-images"] [data-wwid="loader"]')).toBeVisible();
    await expect(page.locator('[data-wwid="escort-images"] [data-wwid="loader"]')).toHaveCount(0, {timeout: 15000});

    const newCount = await page.locator('[data-wwid="escort-images"] [data-wwid="escort-image"] img').count();
    expect(newCount).toBeGreaterThan(imagesCount);
  }
})

test('Should display error when images fail to load.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {user} = await utilsNimfomane.waitForFirstImage(page);
  const profileLink = await utilsNimfomane.getUserProfileLink(page, user);

  await page.route(profileLink + 'content*', route => route.abort('failed'));

  await utilsNimfomane.open(page);
  await page.locator(`[data-wwid="topic-image"][data-wwuser="${user}"]`).click();

  
  await expect(page.locator('[data-wwid="escort-images-error"]')).toBeVisible();
  await expect(page.locator('[data-wwid="escort-images-error"]')).toContainText('Failed to fetch. Code: 503');
})
