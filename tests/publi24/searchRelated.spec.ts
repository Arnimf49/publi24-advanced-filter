import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {ElementHandle, errors} from "playwright-core";
import {utils} from "../helpers/utils";

test('Should search for phone number and article id and show relevant results.', async ({ page, context }, testInfo) => {
  testInfo.setTimeout(60000 * 5);

  await utilsPubli.open(context, page);

  let caseChecks: Record<string, ((ad: ElementHandle) => Promise<boolean>)> = {
    'no relevant results': async (ad) => {
      const innerText = await (await ad.$('[data-wwid="search-results"]')).innerText();
      return innerText === 'nu au fost găsite linkuri relevante';
    },
    'some results': async (ad) => {
      const links = await ad.$$('[data-wwid="search-results"] a[target="_blank"][href]');
      return links.length > 0;
    },
    'nimfomane results': async (ad) => {
      const links = await ad.$$('[data-wwid="search-results"] a[target="_blank"][href]');
      const nimfomaneLinks = [];

      for (let link of links) {
        if ((await link.getAttribute('href')).match(/https:\/\/nimfomane\.com\/forum/)) {
          nimfomaneLinks.push(link);
        }
      }

      return nimfomaneLinks.length > 0;
    },
    'nimfomane button': async (ad) => {
      const links = await ad.$$('[data-wwid="search-results"] a[target="_blank"][href]');
      const nimfomaneLinks = [];

      for (let link of links) {
        if ((await link.getAttribute('href')).match(/https:\/\/nimfomane\.com\/forum\/topic/)) {
          nimfomaneLinks.push(link);
        }
      }

      if (!nimfomaneLinks.length) {
        return false;
      }

      const nimfomaneButton = await ad.$('[data-wwid="nimfomane-btn"]');
      expect(await nimfomaneButton.isVisible()).toBe(true);
      expect(await nimfomaneButton.getAttribute('href')).toEqual(await nimfomaneLinks[0].getAttribute('href'));

      return true;
    },
  }

  let atAd =  0;
  let pages = 0;

  while (Object.keys(caseChecks).length) {
    const ad =  (await page.$$('[data-articleid]'))[atAd];

    if (!ad) {
      if (pages === 1) {
        break;
      }

      await ((await page.$$('.pagination .arrow'))[1]).click();
      await page.waitForTimeout(3000);
      atAd =  0;
      ++pages;
      continue;
    }

    ++atAd;

    const adId = await ad.getAttribute('data-articleid')
    await ad.scrollIntoViewIfNeeded();

    const articleSearchButton = await ad.$('[data-wwid="investigate"]');

    if (!articleSearchButton) {
      continue;
    }

    await utilsPubli.awaitGooglePagesClose(articleSearchButton, context, page);

    try {
      await utils.waitForInnerTextNot(
        page,
        `[data-articleid="${adId}"] [data-wwid="search-results"]`,
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

    await page.waitForTimeout(1000);

    const cases = Object.entries(caseChecks);
    for (let [name, check] of cases) {
      if (await check(ad)) {
        delete caseChecks[name];
      }
    }

    await page.waitForTimeout(2000);
  }

  expect(Object.keys(caseChecks).length, `Cases not met: ${Object.keys(caseChecks).join(', ')}`).toEqual(0)
});

