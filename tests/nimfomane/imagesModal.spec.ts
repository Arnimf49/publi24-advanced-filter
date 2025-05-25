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
  await expect(page.locator('[data-wwid="escort-images"] [data-wwid="escort-image"] img').first()).toBeVisible();

  const imagesCount = await page.locator('[data-wwid="escort-images"] [data-wwid="escort-image"] img').count();

  if (imagesCount > 3) {
    await page.locator('[data-wwid="escort-image-modal"]').evaluate(el => {
      el.scrollTop = el.scrollHeight;
    });

    await expect(page.locator('[data-wwid="escort-images"] [data-wwid="loader"]')).toBeVisible();
    await expect(page.locator('[data-wwid="escort-images"] [data-wwid="loader"]')).toHaveCount(0);

    const newCount = await page.locator('[data-wwid="escort-images"] [data-wwid="escort-image"] img').count();
    expect(newCount).toBeGreaterThan(imagesCount);
  }
})
