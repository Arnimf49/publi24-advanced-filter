import {expect, test} from "./helpers/fixture";
import {utils} from "./helpers/utils";
import {ElementHandle} from "playwright-core";

test('Should have panel functionalities on ad page.', async ({context, page}) => {
  await utils.openPubli(context, page);

  const getAdWithDuplicates = async () => {
    for (let article of await page.$$('[data-articleid]')) {
      if (await article.$('[data-wwid="duplicates-container"]')) {
        return article;
      }
    }
    return null;
  };

  const firstArticle: ElementHandle = await utils.findAdWithCondition(page, getAdWithDuplicates);
  await (await firstArticle.$('.article-title')).click();

  await page.waitForTimeout(1000);

  const article = await page.$('[data-articleid]');
  await page.locator('[data-wwid="control-panel"]').waitFor();

  // Visibility handling test.
  await page.locator('[data-wwid="toggle-hidden"]').click();
  await page.locator('[ww-reason]').first().click();
  await utils.assertArticleHidden(article);
  await page.locator('[ww-show]').click();
  await utils.assertArticleHidden(article, {hidden: false});

  // Favorites handling test.
  await page.locator('[data-wwid="temp-save"]').click();
  await expect(page.locator('[data-wwid="temp-save"]')).toHaveAttribute('title', 'Șterge din favorite');
  await page.locator('[data-wwid="temp-save"]').click();
  await expect(page.locator('[data-wwid="temp-save"]')).toHaveAttribute('title', 'Adaugă la favorite');

  // Related search test.
  await page.locator('[data-wwid="investigate"]').click();
  await utils.waitForInnerTextNot(page,
    `[data-articleid] [data-wwid="search-results"]`,
    'nerulat'
  );

  // Image search test.
  await page.locator('[data-wwid="investigate_img"]').click();
  await utils.waitForInnerTextNot(page,
    `[data-articleid] [data-wwid="image-results"]`,
    'nerulat'
  );

  // Duplicates handling test.
  await page.locator('[data-wwid="duplicates"]').click();
  await expect(page.locator('[data-wwid="ads-modal"]')).toBeVisible();
})
