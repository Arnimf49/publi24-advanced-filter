import {expect, test} from "../helpers/fixture";
import {utilsPubli} from "../helpers/utilsPubli";

test('Should set lastSeen on listing page.', async ({context, page}) => {
  await utilsPubli.open(context, page);

  const firstAdId = await page.locator('[data-articleid]').first().getAttribute('data-articleid');

  const lastSeenFirst = await page.evaluate((id) => {
    const item = JSON.parse(localStorage.getItem(`ww2:${id}`) || '{}');
    return item.lastSeen;
  }, firstAdId);

  expect(typeof lastSeenFirst).toBe('number');
  expect(lastSeenFirst).toBeGreaterThan(0);

  const lastPageButton = page.locator('.pagination .arrow').last().locator('a');
  const lastPageHref = await lastPageButton.getAttribute('href');
  expect(lastPageHref).toBeTruthy();

  await page.goto(lastPageHref!);
  await page.waitForTimeout(700);

  const lastPageFirstAdId = await page.locator('[data-articleid]').first().getAttribute('data-articleid');

  const lastSeenLastPage = await page.evaluate((id) => {
    const item = JSON.parse(localStorage.getItem(`ww2:${id}`) || '{}');
    return item.lastSeen;
  }, lastPageFirstAdId);

  expect(typeof lastSeenLastPage).toBe('number');
  expect(lastSeenLastPage).toBeGreaterThan(0);
})
