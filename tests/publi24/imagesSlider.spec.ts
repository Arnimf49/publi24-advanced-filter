import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {utils} from "../helpers/utils";

test('Should open images slider and display all images.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  let articleWithMultiple;
  for (let article of await page.$$('[data-articleid]')) {
    const imageCount = +(await (await article.$('[class="article-img-count-number"]')).innerText());
    if (imageCount > 1) {
      articleWithMultiple = article;
      break;
    }
  }

  await (await articleWithMultiple.$('[class="art-img"]')).click();
  const imageCount = +(await (await articleWithMultiple.$('[class="article-img-count-number"]')).innerText());

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
  let firstArticle = (await page.$$('[data-articleid]'))[0];
  const firstArticleId = await firstArticle.getAttribute('data-articleid');
  await (await firstArticle.$('[class="art-img"]')).click();

  await page.locator('[data-wwid="images-slider"] [data-wwid="toggle-hidden"]').click();
  await expect(page.locator('[data-wwid="images-slider"]')).not.toBeVisible();
  await ((await firstArticle.$$('[data-wwid="reason"]'))[0]).click();
  await utilsPubli.assertAdHidden(firstArticle);

  await page.reload();
  await page.waitForTimeout(1000);

  firstArticle = await page.$(`[data-articleid="${firstArticleId}"]`);

  await (await firstArticle.$('[class="art-img"]')).click();
  await page.locator('[data-wwid="images-slider"] [data-wwid="toggle-hidden"]').click();
  await expect(page.locator('[data-wwid="images-slider"]')).not.toBeVisible();
  await utilsPubli.assertAdHidden(firstArticle, {hidden: false});
})

test('Should search images from slider.', async ({ page, context }) => {
  await utilsPubli.open(context, page);
  const firstArticle = (await page.$$('[data-articleid]'))[0];
  await (await firstArticle.$('[class="art-img"]')).click();

  await page.locator('[data-wwid="images-slider"] [data-wwid="analyze-images"]').click();
  await expect(page.locator('[data-wwid="images-slider"]')).not.toBeVisible();

  await (await firstArticle.$('[class="art-img"]')).click();
  await page.locator('[data-wwid="images-slider"] [data-wwid="analyze-images"]').click();

  await utils.waitForInnerTextNot(page,
    `[data-articleid="${await firstArticle.getAttribute('data-articleid')}"] [data-wwid="image-results"]`,
    'nerulat'
  );
})

