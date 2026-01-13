import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {ElementHandle, errors, Page} from "playwright-core";
import {utils} from "../helpers/utils";

test('Should search for phone number and article id and show relevant results.', async ({ page, context }, testInfo) => {
  testInfo.setTimeout(60000 * 3);

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
        const href = await link.getAttribute('href');
        const text = await link.innerText();
        if (href.match(/https:\/\/nimfomane\.com\/forum/) && !text.match(/^(https?:\/\/)|(www\.)/)) {
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

    await utilsPubli.resolveGooglePage(articleSearchButton, context, page);

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

test('Should be able to do manual search', async ({ page, context }, testInfo) => {
  testInfo.setTimeout(60000);

  await utilsPubli.open(context, page);

  await page.click('[data-wwid="menu-button"]');
  await page.click('[data-wwid="settings-button"]');
  await page.locator('[data-wwid="manual-phone-search-switch"]').click();
  await page.click('[data-wwid="close"]');

  const firstAd = await utilsPubli.findFirstAdWithPhone(page);
  const adId = await firstAd.getAttribute('data-articleid');

  const articleSearchButton = await firstAd.$('[data-wwid="investigate"]');
  await articleSearchButton.isVisible();

  const pages: any[] = [];
  context.on('page', p => pages.push(p));

  await utilsPubli.resolveGooglePage(articleSearchButton, context, page, false);

  expect(pages.length).toBeGreaterThan(0);
  const searchPage: Page = pages[0];

  await expect(searchPage.locator('[data-ww-manual-text]')).toContainText('manual');
  await expect(searchPage.locator('[data-ww-search-continue]')).toContainText('Continuă');

  await searchPage.locator('[data-ww-search-continue]').click();
  await page.waitForTimeout(800);

  await Promise.all([
    searchPage.locator('[data-ww-search-continue]').click(),
    searchPage.waitForEvent('close', { timeout: 5000 })
  ])

  await utils.waitForInnerTextNot(
    page,
    `[data-articleid="${adId}"] [data-wwid="search-results"]`,
    'nerulat',
    4000,
  );
});

test('Should show "date șterse, caută din nou" when phone search results are cleared but analysis time exists', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd = await utilsPubli.findFirstAdWithPhone(page);
  const adId = await firstAd.getAttribute('data-articleid');

  await page.evaluate((id) => {
    localStorage.setItem(`ww2:${id}`, JSON.stringify({
      phoneTime: Date.now() - 60000,
      phone: '0123456789'
    }));
  }, adId);

  await page.reload();
  await page.waitForTimeout(500);

  const adAfterReload = await page.$(`[data-articleid="${adId}"]`);
  const searchResultsContainer = await adAfterReload.$('[data-wwid="search-results"]');
  const messageText = await searchResultsContainer.innerText();

  expect(messageText.trim()).toEqual('date șterse, caută din nou');

  const messageElement = await searchResultsContainer.$('p');
  const className = await messageElement.getAttribute('class');
  expect(className).toContain('missingResults');
});

