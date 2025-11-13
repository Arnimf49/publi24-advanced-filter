import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {ElementHandle} from "playwright-core";
import {utils} from "../helpers/utils";
import {collectUnknownDomains} from "../helpers/domainCollector";

test('Should search for images and show relevant results.', async ({ page, context }, testInfo) => {
  testInfo.setTimeout(60000 * 6);

  await utilsPubli.open(context, page);

  let caseChecks: Record<string, ((ad: ElementHandle) => Promise<boolean>)> = {
    'no relevant results': async (ad) => {
      const innerText = await (await ad.$('[data-wwid="image-results"]')).innerText();
      return innerText === 'nu au fost găsite linkuri relevante';
    },
    'some results': async (ad) => {
      const links = await ad.$$('[data-wwid="image-results"] a[target="_blank"][href]');

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
    'active ad from other location': async (ad) => {
      const warning = await ad.$('[data-wwid="images-warning"]');

      if (warning == null) {
        return false;
      }

      expect(await warning.innerText()).toEqual('anunțuri active găsite în alte locații !');
      return true;
    },
    'safe links': async (ad) => {
      const links = await ad.$$('[data-wwid="image-results"] a[target="_blank"][href]');
      for (let link of links) {
        const className = await link.getAttribute('class');
        if (className.indexOf('linkSafe')) {
          return true;
        }
      }
      return false;
    },
    'unsafe links': async (ad) => {
      const links = await ad.$$('[data-wwid="image-results"] a[target="_blank"][href]');
      for (let link of links) {
        const className = await link.getAttribute('class');
        if (className.indexOf('linkUnsafe')) {
          return true;
        }
      }
      return false;
    },
  }

  let atAd =  0;
  let pages = 0;

  while (Object.keys(caseChecks).length) {
    const articles = await page.$$('[data-articleid]');
    const ad =  articles[atAd];

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

    const articleImageSearchButton = await ad.$('[data-wwid="investigate_img"]');
    await articleImageSearchButton.isVisible();
    await utilsPubli.awaitGooglePagesClose(articleImageSearchButton, context, page);

    await utils.waitForInnerTextNot(
      page,
      `[data-articleid="${adId}"] [data-wwid="image-results"]`,
      'nerulat',
      4000,
    );
    // Wait for images post-processing.
    await page.waitForTimeout(2000);

    // Collect any unknown domains from the image results
    await collectUnknownDomains(ad);

    const cases = Object.entries(caseChecks);
    for (let [name, check] of cases) {
      if (await check(ad)) {
        delete caseChecks[name];
      }
    }

    await page.waitForTimeout(process.env.CI == 'true' ? 10000 : 4000);
  }

  expect(Object.keys(caseChecks).length, `Cases not met: ${Object.keys(caseChecks).join(', ')}`).toEqual(0)
});

test('Should be able to search images on ads without phone.', async ({ page, context }, test) => {
  test.setTimeout(70000);
  await utilsPubli.open(context, page, {loadStorage: false});

  const articles = await page.$$('[data-articleid]');
  const ad =  articles[2];
  const id = await ad.getAttribute('data-articleid');
  const url = await(await ad.$('[class="article-title"] a')).getAttribute('href');

  await utils.modifyRouteBody(page, url, ($) => {
    $('[id="EncryptedPhone"]').remove()
  });

  await page.waitForResponse(response => response.url() === url);
  await page.waitForTimeout(100);

  await (await ad.waitForSelector(`[data-wwid="no-phone-message"]`)).isVisible();
  expect(await ad.$(`[data-wwid="search-results"]`)).toBeNull();

  await utilsPubli.awaitGooglePagesClose(await ad.$('[data-wwid="investigate_img"]'), context, page);

  await utils.waitForInnerTextNot(
    page,
    `[data-articleid="${id}"] [data-wwid="image-results"]`,
    'nerulat',
    5000,
  );
});

test('Should show "date șterse, caută din nou" when image search results are cleared but analysis time exists', async ({ page, context }) => {
  await utilsPubli.open(context, page);

  const firstAd = await utilsPubli.findFirstAdWithPhone(page);
  const adId = await firstAd.getAttribute('data-articleid');

  await page.evaluate((id) => {
    localStorage.setItem(`ww2:${id}`, JSON.stringify({
      imagesTime: Date.now() - 60000,
      phone: '0123456789'
    }));
  }, adId);

  await page.reload();
  await page.waitForTimeout(500);

  const adAfterReload = await page.$(`[data-articleid="${adId}"]`);
  const imageResultsContainer = await adAfterReload.$('[data-wwid="image-results"]');
  const messageText = await imageResultsContainer.innerText();

  expect(messageText.trim()).toEqual('date șterse, caută din nou');

  const messageElement = await imageResultsContainer.$('p');
  const className = await messageElement.getAttribute('class');
  expect(className).toContain('missingResults');
});

