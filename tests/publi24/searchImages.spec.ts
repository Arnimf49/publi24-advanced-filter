import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {ElementHandle, errors} from "playwright-core";
import {utils} from "../helpers/utils";

test('Should search for images and show relevant results.', async ({ page, context }, testInfo) => {
  testInfo.setTimeout(60000 * 4);

  await utilsPubli.open(context, page);

  let caseChecks: Record<string, ((article: ElementHandle) => Promise<boolean>)> = {
    'no relevant results': async (article) => {
      const innerText = await (await article.$('[data-wwid="image-results"]')).innerText();
      return innerText === 'nu au fost găsite linkuri relevante';
    },
    'some results': async (article) => {
      const links = await article.$$('[data-wwid="image-results"] a[target="_blank"][href]');

      if (!links.length) {
        return false;
      }

      let domain = null, domainIndex = 0;
      for (let link of links) {
        const href = await link.getAttribute('href');
        const text = await link.innerText();
        const extractedDomain = new URL(href).hostname.replace('www.', '');

        if (domain !== extractedDomain) {
          domain = extractedDomain;
          domainIndex = 1;
        } else {
          domainIndex++;
        }

        if (domainIndex === 1) {
          expect(text).toContain(domain);
        } else {
          expect(text).toEqual(`#${domainIndex}`);
        }
      }

      return true;
    },
    'active ad from other location': async (article) => {
      const warning = await article.$('[data-wwid="images-warning"]');

      if (warning == null) {
        return false;
      }

      expect(await warning.innerText()).toEqual('anunțuri active găsite în alte locații !');
      return true;
    },
    'safe links': async (article) => {
      const links = await article.$$('[data-wwid="image-results"] a[target="_blank"][href]');
      for (let link of links) {
        const className = await link.getAttribute('class');
        if (className.indexOf('linkSafe')) {
          return true;
        }
      }
      return false;
    },
    'unsafe links': async (article) => {
      const links = await article.$$('[data-wwid="image-results"] a[target="_blank"][href]');
      for (let link of links) {
        const className = await link.getAttribute('class');
        if (className.indexOf('linkUnsafe')) {
          return true;
        }
      }
      return false;
    },
  }

  let atArticle = 0;
  let pages = 0;

  while (Object.keys(caseChecks).length) {
    const article = (await page.$$('[data-articleid]'))[atArticle];

    if (!article) {
      if (pages === 1) {
        break;
      }

      await ((await page.$$('.pagination .arrow'))[1]).click();
      await page.waitForTimeout(3000);
      atArticle = 0;
      ++pages;
      continue;
    }

    ++atArticle;

    const articleId = await article.getAttribute('data-articleid')

    const articleImageSearchButton = await article.$('[data-wwid="investigate_img"]');
    await articleImageSearchButton.isVisible();

    await articleImageSearchButton.click();
    await page.waitForTimeout(2000);

    try {
      await utils.waitForInnerTextNot(
        page,
        `[data-articleid="${articleId}"] [data-wwid="image-results"]`,
        'nerulat',
        4000,
      );
    } catch (e: any) {
      if (e instanceof errors.TimeoutError) {
        await page.waitForTimeout(4000);
        continue;
      }
      throw e;
    }
    // Wait for images post-processing.
    await page.waitForTimeout(2000);

    const cases = Object.entries(caseChecks);
    for (let [name, check] of cases) {
      if (await check(article)) {
        delete caseChecks[name];
      }
    }

    await page.waitForTimeout(4000);
  }

  expect(Object.keys(caseChecks).length, `Cases not met: ${Object.keys(caseChecks).join(', ')}`).toEqual(0)
});

test('Should be able to search images on ads without phone.', async ({ page, context }) => {
  await utilsPubli.open(context, page, {loadStorage: false});

  const articles = await page.$$('[data-articleid]');
  const article = articles[2];
  const id = await article.getAttribute('data-articleid');
  const url = await(await article.$('[class="article-title"] a')).getAttribute('href');

  await utils.modifyRouteBody(page, url, ($) => {
    $('[id="EncryptedPhone"]').remove()
  });

  await page.waitForResponse(response => response.url() === url);
  await page.waitForTimeout(100);

  await (await article.$(`[data-wwid="no-phone-message"]`)).isVisible();
  expect(await article.$(`[data-wwid="search-results"]`)).toBeNull();

  await (await article.$('[data-wwid="investigate_img"]')).click();
  await page.waitForTimeout(2000);
  await (await article.$('[data-wwid="investigate_img"]')).click();

  await utils.waitForInnerTextNot(
    page,
    `[data-articleid="${id}"] [data-wwid="image-results"]`,
    'nerulat',
    5000,
  );
});

