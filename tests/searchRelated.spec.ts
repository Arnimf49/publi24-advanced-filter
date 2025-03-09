import {expect, test} from "./helpers/fixture";
import {utils} from "./helpers/utils";
import {ElementHandle} from "playwright-core";

test('Should search for phone number and article id and show relevant results.', async ({ page, context }) => {
  await utils.openPubli(context, page);

  let caseChecks: Record<string, ((article: ElementHandle) => Promise<boolean>)> = {
    'no relevant results': async (article) => {
      const innerText = await (await article.$('[data-wwid="search-results"]')).innerText();
      return innerText === 'nu au fost găsite linkuri relevante';
    },
    'some results': async (article) => {
      const links = await article.$$('[data-wwid="search-results"] a[target="_blank"][href]');
      return links.length > 0;
    },
    'nimfomane results': async (article) => {
      const links = await article.$$('[data-wwid="search-results"] a[target="_blank"][href]');
      const nimfomaneLinks = [];

      for (let link of links) {
        if ((await link.getAttribute('href')).match(/https:\/\/nimfomane\.com\/forum/)) {
          nimfomaneLinks.push(link);
        }
      }

      return nimfomaneLinks.length > 0;
    },
    'nimfomane button': async (article) => {
      const links = await article.$$('[data-wwid="search-results"] a[target="_blank"][href]');
      const nimfomaneLinks = [];

      for (let link of links) {
        if ((await link.getAttribute('href')).match(/https:\/\/nimfomane\.com\/forum\/topic/)) {
          nimfomaneLinks.push(link);
        }
      }

      if (!nimfomaneLinks.length) {
        return false;
      }

      const nimfomaneButton = await article.$('[data-wwid="nimfomane-btn"]');
      expect(await nimfomaneButton.isVisible()).toBe(true);
      expect(await nimfomaneButton.getAttribute('href')).toEqual(await nimfomaneLinks[0].getAttribute('href'));

      return true;
    },
  }

  let atArticle = 0;
  while (Object.keys(caseChecks).length) {
    const article = (await page.$$('[data-articleid]'))[atArticle];

    if (!article) {
      break;
    }

    const articleId = await article.getAttribute('data-articleid')

    const articleSearchButton = await article.$('[data-wwid="investigate"]');
    await articleSearchButton.isVisible();

    const [newTab] = await Promise.all([
      context.waitForEvent('page'),
      articleSearchButton.click(),
    ]);

    await newTab.waitForEvent('close');
    await utils.waitForInnerTextNot(page,
      `[data-articleid="${articleId}"] [data-wwid="search-results"]`,
      'nerulat'
    );

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

