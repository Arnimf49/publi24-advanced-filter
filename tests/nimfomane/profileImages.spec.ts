import {expect, test} from "../helpers/fixture";
import {utilsNimfomane} from "../helpers/utilsNimfomane";

test('Should show all images button and open modal.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {user} = await utilsNimfomane.waitForFirstImage(page);
  await utilsNimfomane.open(page, {url: await utilsNimfomane.getUserProfileLink(page, user)});

  await page.locator('[data-wwid="all-photos-button"]').isVisible();
  await page.locator('[data-wwid="all-photos-button"]').click();

  await expect(page.locator('[data-wwid="escort-images"] [data-wwid="loader"]')).toBeVisible();
  await expect(page.locator('[data-wwid="escort-images"] [data-wwid="loader"]')).toHaveCount(0);
  await expect(page.locator('[data-wwid="escort-images"] [data-wwid="escort-image"] img').first()).toBeVisible();
})
