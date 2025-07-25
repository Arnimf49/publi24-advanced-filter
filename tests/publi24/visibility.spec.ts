import {test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {ElementHandle} from "playwright-core";
import {expect} from "playwright/test";

test('Should hide without a reason.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstArticle = (await page.$$('[data-articleid]'))[0];
  const articleId = await firstArticle.getAttribute('data-articleid');
  const hideButton = await firstArticle.$('[data-wwid="toggle-hidden"]');

  await hideButton.click();
  await utilsPubli.assertAdHidden(firstArticle);

  await page.reload();
  const article = await page.$(`[data-articleid="${articleId}"]`);
  await utilsPubli.assertAdHidden(article);
})

test('Should hide and then show.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstArticle = (await page.$$('[data-articleid]'))[0];
  const articleId = await firstArticle.getAttribute('data-articleid');

  await (await firstArticle.$('[data-wwid="toggle-hidden"]')).click();
  await utilsPubli.assertAdHidden(firstArticle);

  await (await firstArticle.$('[data-wwid="show-button"]')).click();
  await utilsPubli.assertAdHidden(firstArticle, {hidden: false});

  await (await firstArticle.$('[data-wwid="toggle-hidden"]')).click();
  await page.reload();
  const article = await page.$(`[data-articleid="${articleId}"]`);
  await (await article.$('[data-wwid="toggle-hidden"]')).click();
  await utilsPubli.assertAdHidden(article, {hidden: false});
})

test('Should hide with a reason and be able to change reason.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstArticle = (await page.$$('[data-articleid]'))[0];
  await (await firstArticle.$('[data-wwid="toggle-hidden"]')).click();
  await page.waitForTimeout(800);

  const hideReasons = await firstArticle.$$('[data-wwid="reason"]');
  expect(hideReasons).toHaveLength(9);

  await hideReasons[0].click();
  await page.waitForTimeout(1000);
  expect(await hideReasons[0].getAttribute('data-wwselected')).toEqual('true');
  expect(await (await firstArticle.$('[data-wwid="hide-reason"]')).innerText()).toEqual('motiv ascundere: scump');

  await hideReasons[1].click();
  await page.waitForTimeout(1000);
  expect(await hideReasons[1].getAttribute('data-wwselected')).toEqual('true');
  expect(await (await firstArticle.$('[data-wwid="hide-reason"]')).innerText()).toEqual('motiv ascundere: etnie');
})

test('Should hide phone number and thus hide duplicate ads.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const getMultipleArticlesWithSamePhone = async () => {
    const articles = await page.$$('[data-articleid]');
    let articlesWithPhone: Array<ElementHandle>;

    for (let article of articles) {
      const phone = await article.$('[data-wwid="phone-number"]');
      if (phone) {
        articlesWithPhone = await page.$$(`[data-wwphone="${await phone.innerText()}"]`);

        if (articlesWithPhone.length > 1) {
          return articlesWithPhone;
        }
      }
    }

    return null;
  }

  let articlesWithPhone: Array<ElementHandle> = await utilsPubli.findAdWithCondition(page, getMultipleArticlesWithSamePhone);

  await (await articlesWithPhone[0].$('[data-wwid="toggle-hidden"]')).click();
  await page.waitForTimeout(1000);

  const autoHideMessage = await (await articlesWithPhone[1].$('[data-wwid="message"]')).innerText();
  expect(autoHideMessage).toEqual('ai mai ascuns un anunț cu acceeași numar de telefon, ascuns automat');
})

test('Should toggle focus mode and not see hidden ads.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstArticle = (await page.$$('[data-articleid]'))[0];
  const secondArticle = (await page.$$('[data-articleid]'))[1];
  await (await firstArticle.$('[data-wwid="toggle-hidden"]')).click();
  await (await secondArticle.$('[data-wwid="toggle-hidden"]')).click();
  const firstArticleId = await firstArticle.getAttribute('data-articleid');
  const secondArticleId = await secondArticle.getAttribute('data-articleid');

  await page.waitForTimeout(1000);

  await (await page.$('[data-wwid="settings-button"]')).click();
  await (await page.$('[data-wwid="focus-mode-switch"]')).click();
  await page.waitForTimeout(1500);

  await expect(page.locator(`[data-articleid="${firstArticleId}"]`)).toBeHidden();
  await expect(page.locator(`[data-articleid="${secondArticleId}"]`)).toBeHidden();

  await (await page.$('[data-wwid="settings-button"]')).click();
  await (await page.$('[data-wwid="focus-mode-switch"]')).click();
  await page.waitForTimeout(1500);

  await expect(page.locator(`[data-articleid="${firstArticleId}"]`)).toBeVisible();
  await expect(page.locator(`[data-articleid="${secondArticleId}"]`)).toBeVisible();
})

test('Should toggle ad deduplication and see only newest ad.', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstArticle = await utilsPubli.findAdWithDuplicates(page);
  const firstArticleUrl = page.url();
  const firstArticleId = await firstArticle.getAttribute('data-articleid');
  const phone = await (await firstArticle.$('[data-wwid="phone-number"]')).innerText();

  let duplicateArticleIds: string[] = [];

  do {
    const articles = await page.locator(`[data-wwphone="${phone}"]`).all();

    if (articles.length) {
      for (let i = 1; i < articles.length; i++) {
        const parent = await articles[i].evaluateHandle(el => el.closest('[data-articleid]'));
        const articleId = await parent.getAttribute('data-articleid');

        if (articleId !== firstArticleId) {
          duplicateArticleIds.push(articleId);
        }
      }
    }

    if (!duplicateArticleIds.length) {
      await (await page.$$('.pagination .arrow'))[1].click();
    }
  } while (!duplicateArticleIds.length);


  await page.waitForTimeout(1000);

  await (await page.$('[data-wwid="settings-button"]')).click();
  await (await page.$('[data-wwid="ad-deduplication-switch"]')).click();
  await page.waitForTimeout(1500);

  for (let articleId of duplicateArticleIds) {
    await expect(page.locator(`[data-articleid="${articleId}"]`)).toBeHidden();
  }

  await page.goto(firstArticleUrl);
  await page.waitForTimeout(1500);
  await expect(page.locator(`[data-articleid="${firstArticleId}"]`)).toBeVisible();
})
