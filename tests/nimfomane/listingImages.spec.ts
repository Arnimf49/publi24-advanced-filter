import {utils} from "../helpers/utils";
import {expect} from "playwright/test";
import {test} from "../helpers/fixture";
import {CheerioAPI} from "cheerio";
import {utilsNimfomane} from "../helpers/utilsNimfomane";

test('Should show first image as topic image.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {src, user} = await utilsNimfomane.waitForFirstImage(page);
  const profileUrl = await utilsNimfomane.getUserProfileLink(page, user);

  await page.goto(profileUrl + 'content');

  while (true) {
    const image = page.locator('.ipsStreamItem_snippet [data-background-src]').first();
    if (image && await image.isVisible()) {
      expect(await image.getAttribute('data-background-src')).toEqual(src);
      break;
    }

    if (await page.locator('.ipsPagination_next a').isVisible()) {
      await page.locator('.ipsPagination_next a').click()
      await page.waitForTimeout(1000);
    } else {
      throw new Error('Could not find the image')
    }
  }
})

test('Should show loader in photo initially.', async ({page}) => {
  await utilsNimfomane.open(page);
  const firstImageContainer = page.locator('[data-wwid="topic-image"]').first();
  await firstImageContainer.waitFor();
  await firstImageContainer.locator('[data-wwid="loader"]').isVisible();
  await firstImageContainer.locator('img, [data-wwid="no-image-icon"]').isVisible();
})

test('Should show no image icon when no photos found.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {user} = await utilsNimfomane.waitForFirstImage(page);
  const profileLink = await utilsNimfomane.getUserProfileLink(page, user);

  const removeImages = ($: CheerioAPI) => $('[data-background-src]').remove();
  await utils.modifyRouteBody(page, profileLink + 'content', removeImages);
  await utils.modifyRouteBody(page, profileLink + 'content/*', removeImages);

  await utilsNimfomane.deleteUserProfileStorage(page, user);
  await utilsNimfomane.open(page);

  await page.locator(`[data-wwuser=${user}] [data-wwid="no-image-icon"]`).isVisible();
})

test('Should show no image icon when topic not of escort.', async ({page}) => {
  await utilsNimfomane.open(page, 'https://nimfomane.com/forum/forum/30-escorte-baia-mare/');
  await page.locator(`[data-wwtopic="174418"] [data-wwid="no-image-icon"]`).isVisible();
})

test('Should show all images modal when clicking the topic image.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {firstImage} = await utilsNimfomane.waitForFirstImage(page);

  await firstImage.click();
  await page.locator('[data-wwid="escort-images"]').isVisible();
  await page.locator('[data-wwid="escort-images"] img').isVisible();
})

test('Should show images after listing pagination navigation.', async ({page}) => {
  await utilsNimfomane.open(page);
  await page.locator('.ipsPagination_next a').first().click();
  await page.waitForTimeout(1000);
  await page.locator('[data-wwid="topic-image"]').first().isVisible();
})

test('Should not show images on non escort or massage listings.', async ({page}) => {
  await utilsNimfomane.open(page, 'https://nimfomane.com/forum/forum/127-masaj-erotic/');
  await page.locator('[data-wwid="topic-image"]').first().isVisible();

  await utilsNimfomane.open(page, 'https://nimfomane.com/forum/forum/135-masaj-erotic-timisoara/');
  await page.locator('[data-wwid="topic-image"]').first().isVisible();

  await utilsNimfomane.open(page, 'https://nimfomane.com/forum/forum/201-discutii-generale-cluj/');
  await page.waitForTimeout(1500);
  expect(await page.$$('[data-wwid="topic-image"]')).toHaveLength(0);

  await utilsNimfomane.open(page, 'https://nimfomane.com/forum/forum/354-decernarea-premiilor-pentru-escorte/');
  await page.waitForTimeout(1500);
  expect(await page.$$('[data-wwid="topic-image"]')).toHaveLength(0);
})

test('Should reload topic escort after 6 days.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {id} = await utilsNimfomane.waitForFirstImage(page);

  await utilsNimfomane.setTopicStorageProp(page, id, 'isOfEscort', false);
  await utilsNimfomane.setTopicStorageProp(page, id, 'escortDeterminationTime', Date.now() - (8.64e+7 * 6 - 2000));
  await utilsNimfomane.open(page);
  await page.locator(`[data-wwtopic="${id}"] [data-wwid="no-image-icon"]`).isVisible();

  await utilsNimfomane.setTopicStorageProp(page, id, 'escortDeterminationTime', Date.now() - (8.64e+7 * 7));
  await utilsNimfomane.open(page);
  await page.locator(`[data-wwtopic="${id}"] [data-wwid="topic-image"]`).isVisible();
})

test('Should recalculate main topic image after 4 days.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {user, id} = await utilsNimfomane.waitForFirstImage(page);

  await utilsNimfomane.setEscortStorageProp(page, user, 'optimizedProfileImage', false);
  await utilsNimfomane.setEscortStorageProp(page, user, 'optimizedProfileImageTime', Date.now() - (8.64e+7 * 4 - 2000));
  await utilsNimfomane.open(page);
  await page.locator(`[data-wwtopic="${id}"] [data-wwid="no-image-icon"]`).isVisible();

  await utilsNimfomane.setEscortStorageProp(page, user, 'optimizedProfileImageTime', Date.now() - (8.64e+7 * 5));
  await utilsNimfomane.open(page);
  await page.locator(`[data-wwtopic="${id}"] [data-wwid="topic-image"]`).isVisible();
})
