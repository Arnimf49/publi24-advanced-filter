import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {utils} from "../helpers/utils";

test('Should open images slider and display all images.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  let adWithMultiple;
  for (let ad of await page.$$('[data-articleid]')) {
    const imageCount = +(await (await ad.$('[class="article-img-count-number"]')).innerText());
    if (imageCount > 1) {
      adWithMultiple = ad;
      break;
    }
  }

  await (await adWithMultiple.$('[class="art-img"]')).click();
  const imageCount = +(await (await adWithMultiple.$('[class="article-img-count-number"]')).innerText());

  await expect(page.locator('[data-wwid="images-slider"]')).toBeVisible();
  await expect(page.locator('[data-wwid="images-slider"] .splide__slide:not(.splide__slide--clone)'))
    .toHaveCount(imageCount);

  await page.locator('.splide__arrow.splide__arrow--next').click();
  await expect(page.locator('.splide__slide.is-active.is-visible')).toHaveAttribute('aria-label', `2 of ${imageCount}`);
  await page.locator('.splide__arrow.splide__arrow--prev').click();
  await expect(page.locator('.splide__slide.is-active.is-visible')).toHaveAttribute('aria-label', `1 of ${imageCount}`);

  await page.locator('[data-wwid="images-slider"] [data-wwid="close"]').click();
  await expect(page.locator('[data-wwid="images-slider"]')).not.toBeVisible();
})

test('Should toggle visibility from slider.', async ({ page, context }) => {
  await utilsPubli.open(context, page);
  let firstAd =  await utilsPubli.selectAd(page);
  const firstArticleId = await firstAd.getAttribute('data-articleid');
  await (await firstAd.$('[class="art-img"]')).click();

  await page.locator('[data-wwid="images-slider"] [data-wwid="toggle-hidden"]').click();
  await expect(page.locator('[data-wwid="images-slider"]')).not.toBeVisible();
  await ((await firstAd.$$('[data-wwid="reason"]'))[0]).click();
  await utilsPubli.assertAdHidden(firstAd);

  await page.reload();
  await page.waitForTimeout(1000);

  firstAd =  await page.$(`[data-articleid="${firstArticleId}"]`);

  await (await firstAd.$('[class="art-img"]')).click();
  await page.locator('[data-wwid="images-slider"] [data-wwid="toggle-hidden"]').click();
  await expect(page.locator('[data-wwid="images-slider"]')).not.toBeVisible();
  await utilsPubli.assertAdHidden(firstAd, {hidden: false});
})

test('Should search images from slider.', async ({ page, context }) => {
  await utilsPubli.open(context, page);
  const firstAd =  await utilsPubli.selectAd(page);

  await utilsPubli.awaitGooglePagesClose(async () => {
    await (await firstAd.$('[class="art-img"]')).click()
    return page.$('[data-wwid="images-slider"] [data-wwid="analyze-images"]')
  }, context , page);
  await expect(page.locator('[data-wwid="images-slider"]')).not.toBeVisible();

  await utils.waitForInnerTextNot(page,
    `[data-articleid="${await firstAd.getAttribute('data-articleid')}"] [data-wwid="image-results"]`,
    'nerulat'
  );
})

