import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {ElementHandle} from "playwright-core";
import {utils} from "../helpers/utils";

test('Should have panel functionalities on ad page.', async ({context, page}, testInfo) => {
  testInfo.setTimeout(55000);

  await utilsPubli.open(context, page);
  await page.waitForTimeout(500);

  const firstArticle: ElementHandle = await utilsPubli.findAdWithDuplicates(page);
  await (await firstArticle.$('.article-title a')).click();
  await page.waitForTimeout(2000);

  const article = await page.$('[data-articleid]');
  await page.locator('[data-wwid="control-panel"]').waitFor();

  // Visibility handling test.
  await page.locator('[data-wwid="toggle-hidden"]').click();
  await page.locator('[data-wwid="reason"]').first().click();
  await utilsPubli.assertAdHidden(article);
  await page.locator('[data-wwid="show-button"]').click();
  await utilsPubli.assertAdHidden(article, {hidden: false});

  // Favorites handling test.
  await page.locator('[data-wwid="fav-toggle"]').click();
  await expect(page.locator('[data-wwid="fav-toggle"]')).toHaveAttribute('title', 'Șterge din favorite');
  await page.locator('[data-wwid="fav-toggle"]').click();
  await expect(page.locator('[data-wwid="fav-toggle"]')).toHaveAttribute('title', 'Adaugă la favorite');

  // Related search test.
  await page.locator('[data-wwid="investigate"]').click();
  await page.waitForTimeout(3000);
  await page.locator('[data-wwid="investigate"]').click();
  await utils.waitForInnerTextNot(page,
    `[data-articleid] [data-wwid="search-results"]`,
    'nerulat'
  );

  await page.waitForTimeout(5000);

  // Image search test.
  await page.locator('[data-wwid="investigate_img"]').click();
  await page.waitForTimeout(5000);
  await page.locator('[data-wwid="investigate_img"]').click();
  await utils.waitForInnerTextNot(page,
    `[data-articleid] [data-wwid="image-results"]`,
    'nerulat'
  );

  // Duplicates handling test.
  await page.locator('[data-wwid="duplicates"]').click();
  await expect(page.locator('[data-wwid="ads-modal"]')).toBeVisible();
})
