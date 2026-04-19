import {expect, test} from "../helpers/fixture";
import {utilsNimfomane} from "../helpers/utilsNimfomane";
import {utils} from "../helpers/utils";

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

  await utilsNimfomane.throttleReload(page);
  await firstImage.click();
  await expect(page.locator('[data-wwid="escort-images"] [data-wwid="loader"]')).toBeVisible();
  await expect(page.locator('[data-wwid="escort-images"] [data-wwid="loader"]')).toHaveCount(0);
  await expect(page.locator('[data-wwid="escort-images"] [data-wwid="escort-image"] img').first()).toBeVisible({timeout: 4000});

  const imagesCount = await page.locator('[data-wwid="escort-images"] [data-wwid="escort-image"] img').count();

  if (imagesCount > 3) {
    await page.locator('[data-wwid="escort-image-modal"]').evaluate(e => {
      e.scrollBy(0, 10000);
    })

    await page.waitForTimeout(300);
    await expect(page.locator('[data-wwid="escort-images"] [data-wwid="loader"]')).toHaveCount(0);

    const endMessage = page.locator('[data-wwid="escort-images"] [data-wwid="escort-images-end"]');
    const endMessageVisible = await endMessage.isVisible().catch(() => false);

    if (endMessageVisible) {
      return;
    }

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

test('Should skip images posted in non-escort sections.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {firstImage, user} = await utilsNimfomane.waitForFirstImage(page);
  const profileLink = await utilsNimfomane.getUserProfileLink(page, user);

  let secondImageUrl: string | undefined;

  await utils.modifyRouteJsonBody(page, profileLink + 'content**', 'rows', ($) => {
    const imageItems = $('.ipsStreamItem').filter((_, el) => $(el).find('[data-background-src]').length > 0);
    secondImageUrl = imageItems.eq(1).find('[data-background-src]').attr('data-background-src');

    imageItems.eq(0).find('.ipsStreamItem_status a:last-child')
      .attr('href', 'https://nimfomane.com/forum/forum/999-non-escort-section/');
  });

  await utilsNimfomane.throttleReload(page);
  await firstImage.click();
  await expect(page.locator('[data-wwid="escort-images"] [data-wwid="loader"]')).toHaveCount(0, {timeout: 15000});
  await expect(page.locator('[data-wwid="escort-images"] [data-wwid="escort-image"]').first()).toBeVisible();

  const firstShownSrc = await page.locator('[data-wwid="escort-images"] [data-wwid="escort-image"] img').first().getAttribute('src');

  expect(secondImageUrl).toBeTruthy();
  expect(firstShownSrc).toContain(secondImageUrl!.split('/').pop());
})
