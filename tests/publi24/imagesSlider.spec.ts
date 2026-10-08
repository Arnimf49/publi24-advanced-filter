import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {utils} from "../helpers/utils";

test('Should open images slider and display all images.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const adWithMultiple = await utilsPubli.findFirstAdWithMultipleImages(page);
  const imageCount = +(await (await adWithMultiple.$('[class="article-img-count-number"]')).innerText());

  await (await adWithMultiple.$('[class="art-img"]')).click();

  await expect(page.locator('[data-wwid="images-slider"]')).toBeVisible();
  await expect(page.locator('[data-wwid="images-slider"] .swiper-slide'))
    .toHaveCount(imageCount);

  await page.locator('.swiper-button-next').click();
  await expect(page.locator('.swiper-slide-active')).toHaveAttribute('aria-label', `2 / ${imageCount}`);
  // Let the transition settle before navigating back.
  await page.waitForTimeout(500);
  await page.locator('.swiper-button-prev').click();
  await expect(page.locator('.swiper-slide-active')).toHaveAttribute('aria-label', `1 / ${imageCount}`);

  await page.locator('[data-wwid="images-slider"] [data-wwid="close"]').click();
  await expect(page.locator('[data-wwid="images-slider"]')).not.toBeVisible();
})

test('Should toggle visibility from slider.', async ({ page, context }) => {
  await utilsPubli.open(context, page);
  let firstAd =  await utilsPubli.findFirstAdWithImageSearch(page);
  const firstAdId = await firstAd.getAttribute('data-articleid');
  await (await firstAd.$('[class="art-img"]')).click();

  await page.locator('[data-wwid="images-slider"] [data-wwid="toggle-hidden"]').click();
  await expect(page.locator('[data-wwid="images-slider"]')).not.toBeVisible();
  await (await firstAd.$(':text("temporar")')).click();
  await utilsPubli.assertAdHidden(firstAd);

  await page.reload();
  await page.waitForTimeout(1000);

  firstAd =  await page.$(`[data-articleid="${firstAdId}"]`);

  await (await firstAd.$('[class="art-img"]')).click();
  await page.locator('[data-wwid="images-slider"] [data-wwid="toggle-hidden"]').click();
  await expect(page.locator('[data-wwid="images-slider"]')).not.toBeVisible();
  await utilsPubli.assertAdHidden(firstAd, {hidden: false});
})

test('Should search images from slider.', async ({ page, context }) => {
  await utilsPubli.open(context, page);
  const firstAd =  await utilsPubli.findFirstAdWithImageSearch(page);

  await utilsPubli.resolveGooglePage(async () => {
    await (await firstAd.$('[class="art-img"]')).click()
    return page.waitForSelector('[data-wwid="images-slider"] [data-wwid="analyze-images"]')
  }, context , page);
  await expect(page.locator('[data-wwid="images-slider"]')).not.toBeVisible();

  await utils.waitForInnerTextNot(page,
    `[data-articleid="${await firstAd.getAttribute('data-articleid')}"] [data-wwid="image-results"]`,
    'nerulat'
  );
})

