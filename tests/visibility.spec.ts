import {test} from "./helpers/fixture";
import {utils} from "./helpers/utils";
import {ElementHandle} from "playwright-core";
import {expect} from "playwright/test";

test('Should hide without a reason.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  const firstArticle = (await page.$$('[data-articleid]'))[0];
  const articleId = await firstArticle.getAttribute('data-articleid');
  const hideButton = await firstArticle.$('[data-wwid="toggle-hidden"]');

  await hideButton.click();
  await page.waitForTimeout(1000);
  await utils.assertArticleHidden(firstArticle);

  await page.reload();
  const article = await page.$(`[data-articleid="${articleId}"]`);
  await utils.assertArticleHidden(article);
})

test('Should hide and then show.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  const firstArticle = (await page.$$('[data-articleid]'))[0];
  const articleId = await firstArticle.getAttribute('data-articleid');

  await (await firstArticle.$('[data-wwid="toggle-hidden"]')).click();
  await page.waitForTimeout(1000);
  await utils.assertArticleHidden(firstArticle);

  await (await firstArticle.$('[data-wwid="show-button"]')).click();
  await page.waitForTimeout(1000);
  await utils.assertArticleHidden(firstArticle, {hidden: false});

  await (await firstArticle.$('[data-wwid="toggle-hidden"]')).click();
  await page.reload();
  const article = await page.$(`[data-articleid="${articleId}"]`);
  await (await article.$('[data-wwid="toggle-hidden"]')).click();
  await page.waitForTimeout(1000);
  await utils.assertArticleHidden(article, {hidden: false});
})

test('Should hide with a reason and be able to change reason.', async ({ page, context }) => {
  await utils.openPubli(context, page);

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
  await utils.openPubli(context, page);

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

  let articlesWithPhone: Array<ElementHandle> = await utils.findAdWithCondition(page, getMultipleArticlesWithSamePhone);

  await (await articlesWithPhone[0].$('[data-wwid="toggle-hidden"]')).click();
  await page.waitForTimeout(1000);

  const autoHideMessage = await (await articlesWithPhone[1].$('[data-wwid="message"]')).innerText();
  expect(autoHideMessage).toEqual('ai mai ascuns un anunț cu acceeași numar de telefon, ascuns automat');
})

test('Should toggle focus mode and not see hidden ads.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  const firstArticle = (await page.$$('[data-articleid]'))[0];
  const secondArticle = (await page.$$('[data-articleid]'))[1];
  await (await firstArticle.$('[data-wwid="toggle-hidden"]')).click();
  await (await secondArticle.$('[data-wwid="toggle-hidden"]')).click();
  const firstArticleId = await firstArticle.getAttribute('data-articleid');
  const secondArticleId = await secondArticle.getAttribute('data-articleid');

  await page.waitForTimeout(1000);

  await (await page.$('[data-wwid="settings-button"]')).click();
  await (await page.$('[data-wwid="focus-mode-switch"]')).click();
  await page.waitForTimeout(800);

  await expect(page.locator(`[data-articleid="${firstArticleId}"]`)).toBeHidden();
  await expect(page.locator(`[data-articleid="${secondArticleId}"]`)).toBeHidden();

  await (await page.$('[data-wwid="settings-button"]')).click();
  await (await page.$('[data-wwid="focus-mode-switch"]')).click();
  await page.waitForTimeout(800);

  await expect(page.locator(`[data-articleid="${firstArticleId}"]`)).toBeVisible();
  await expect(page.locator(`[data-articleid="${secondArticleId}"]`)).toBeVisible();
})
