import {expect, test} from "../helpers/fixture";
import {utilsNimfomane} from "../helpers/utilsNimfomane";

test('Should show all images button and open modal.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {user} = await utilsNimfomane.waitForNthImage(page, Math.floor(Math.random() * 3));
  await utilsNimfomane.open(page, {url: await utilsNimfomane.getUserProfileLink(page, user)});

  // The cookie consent bar can trigger a page reload right after load, which
  // would discard a modal opened just before it. Retry until the modal sticks.
  await expect(async () => {
    await page.locator('[data-wwid="all-photos-button"]').click();
    await expect(page.locator('[data-wwid="escort-image-modal"]')).toBeVisible({timeout: 3000});
  }).toPass({timeout: 15000});

  await expect(page.locator('[data-wwid="escort-images"] [data-wwid="loader"]')).toHaveCount(0);
  await expect(page.locator('[data-wwid="escort-images"] [data-wwid="escort-image"] img').first()).toBeVisible();
})

test('Should render other panel elements.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {user} = await utilsNimfomane.waitForNthImage(page, Math.floor(Math.random() * 3));
  await utilsNimfomane.open(page, {url: await utilsNimfomane.getUserProfileLink(page, user)});

  await page.waitForTimeout(500);

  await expect(page.locator('[data-wwid="toggle-hidden"]')).toBeVisible();
  await expect(page.locator('[data-wwid="fav-toggle"]')).toBeVisible();
  await expect(page.locator('[data-wwid="whatsapp"]')).toBeVisible();
  await expect(page.locator('[data-wwid="all-photos-button"]')).toBeVisible();
})
