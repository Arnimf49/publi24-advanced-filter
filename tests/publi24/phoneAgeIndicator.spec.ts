import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";
import {BrowserContext, Page} from "playwright-core";

const testLeafState = async (page: Page, context: BrowserContext, daysAgo: number, expectedState: 'fresh' | 'stale' | 'old') => {
  await utilsPubli.open(context, page);
  
  const firstAd = await utilsPubli.findFirstAdWithPhone(page);
  const adId = await firstAd.getAttribute('data-articleid');
  const phone = await (await firstAd.$('[data-wwid="phone-number"]')).innerText();
  
  const firstSeen = Date.now() - (daysAgo * 24 * 60 * 60 * 1000);
  
  await page.evaluate((args) => {
    const data = JSON.parse(window.localStorage.getItem(`ww2:phone:${args.phone}`)) || {};
    data.firstSeen = args.firstSeen;
    window.localStorage.setItem(`ww2:phone:${args.phone}`, JSON.stringify(data));
  }, { phone, firstSeen });
  
  await page.reload();
  
  const reloadedAd = await page.waitForSelector(`[data-articleid="${adId}"]`);
  const leafButton = await reloadedAd.waitForSelector('[data-wwid="leaf-button"]');
  const leafIcon = await leafButton.$('svg[data-wwstate]');
  const leafState = await leafIcon.getAttribute('data-wwstate');
  
  expect(leafState).toBe(expectedState);
};

test('Should display fresh leaf state for phone seen less than 1 month ago', async ({ page, context }) => {
  await testLeafState(page, context, 20, 'fresh');
});

test('Should display stale leaf state for phone seen between 1 and 6 months ago', async ({ page, context }) => {
  await testLeafState(page, context, 90, 'stale');
});

test('Should display old leaf state for phone seen more than 6 months ago', async ({ page, context }) => {
  await testLeafState(page, context, 240, 'old');
});
