import {expect, test} from "./helpers/fixture";
import {utils} from "./helpers/utils";
import {ElementHandle, Page} from "playwright-core";

test('Should search for images and show relevant results.', async ({ page, context }) => {
  await utils.openPubli(context, page);

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
          expect(text).toEqual(domain);
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

      expect(await warning.innerText()).toEqual('anunțuri active găsite in alte locații !');
      return true;
    },
    'safe links': async (article) => {
      const links = await article.$$('[data-wwid="image-results"] a[target="_blank"][href]');
      for (let link of links) {
        const className = await link.getAttribute('class');
        if (className.indexOf('ww-link-safe')) {
          return true;
        }
      }
      return false;
    },
    'unsafe links': async (article) => {
      const links = await article.$$('[data-wwid="image-results"] a[target="_blank"][href]');
      for (let link of links) {
        const className = await link.getAttribute('class');
        if (className.indexOf('ww-link-unsafe')) {
          return true;
        }
      }
      return false;
    },
  }

  let atArticle = 0;
  while (Object.keys(caseChecks).length) {
    const article = (await page.$$('[data-articleid]'))[atArticle];

    if (!article) {
      break;
    }

    const articleId = await article.getAttribute('data-articleid')

    const articleImageSearchButton = await article.$('[data-wwid="investigate_img"]');
    await articleImageSearchButton.isVisible();

    const imageCountContainer = await article.$('[class="article-img-count"]');
    const imageCount = imageCountContainer ? +(await imageCountContainer.innerText()) : 1;
    const pageEvents =  Array.from({ length: imageCount }, () => context.waitForEvent('page'));

    await Promise.all([
      ...pageEvents,
      articleImageSearchButton.click(),
    ]);

    await utils.waitForInnerTextNot(page,
      `[data-articleid="${articleId}"] [data-wwid="image-results"]`,
      'nerulat'
    );
    // Wait for images post-processing.
    await page.waitForTimeout(1500);

    const cases = Object.entries(caseChecks);
    for (let [name, check] of cases) {
      if (await check(article)) {
        delete caseChecks[name];
      }
    }

    await page.waitForTimeout(4000);
    ++atArticle;
  }

  expect(Object.keys(caseChecks).length, `Cases not met: ${Object.keys(caseChecks).join(', ')}`).toEqual(0)
});

