import {expect, test} from "../helpers/fixture";
import {utilsNimfomane} from "../helpers/utilsNimfomane";
import {Page} from "playwright-core";

async function expectFavoritesSectionHeaders(page: Page, visible: boolean, inLocationCount?: number, otherLocationsCount?: number) {
  if (visible) {
    await expect(page.locator('[data-wwid="section-in-location"]')).toContainText(`În locație (${inLocationCount})`);
    await expect(page.locator('[data-wwid="section-other-locations"]')).toContainText(`În alte locații (${otherLocationsCount})`);
  } else {
    await expect(page.locator('[data-wwid="section-in-location"]')).not.toBeVisible();
    await expect(page.locator('[data-wwid="section-other-locations"]')).not.toBeVisible();
  }
}

test('Should display escort stats in favorites.', async ({ page }) => {
  await utilsNimfomane.open(page);
  const {user, id} = await utilsNimfomane.waitForFirstImage(page);

  await page.locator(`[data-wwtopic="${id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
  await page.waitForTimeout(200);

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  await utilsNimfomane.interceptEscortStats(page, user, {
    posts: 1234,
    lastVisited: oneHourAgo,
    reputation: '567',
    lastPostedSectionUrl: 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/'
  });

  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();

  const escortCard = page.locator('[data-wwid="favorites-modal"] [data-wwid="escort-card"]');

  await expect(escortCard.locator('[data-wwid="stat-location"] [data-wwid="inline-loader"]')).toBeVisible();
  await expect(escortCard.locator('[data-wwid="stat-last-visited"] [data-wwid="inline-loader"]')).toBeVisible();
  await expect(escortCard.locator('[data-wwid="stat-posts"] [data-wwid="inline-loader"]')).toBeVisible();
  await expect(escortCard.locator('[data-wwid="stat-reputation"] [data-wwid="inline-loader"]')).toBeVisible();

  await expect(escortCard.locator('[data-wwid="stat-location"] a')).toContainText('Cluj', {timeout: 10000});
  await expect(escortCard.locator('[data-wwid="stat-location"] a')).toHaveAttribute('href');
  await expect(escortCard.locator('[data-wwid="stat-last-visited"]')).toContainText('de 1 oră');
  await expect(escortCard.locator('[data-wwid="stat-posts"]')).toContainText('1234');
  await expect(escortCard.locator('[data-wwid="stat-reputation"]')).toContainText('567');
});

test('Should refresh escort stats after a time in favorites.', async ({ page }) => {
  await utilsNimfomane.open(page);
  const {user, id} = await utilsNimfomane.waitForFirstImage(page);

  await page.locator(`[data-wwtopic="${id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
  await page.waitForTimeout(200);

  await utilsNimfomane.interceptEscortStats(page, user, {
    posts: 1234,
    lastVisited: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    reputation: '567',
    lastPostedSectionUrl: 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/'
  });

  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();
  await expect(page.locator('[data-wwid="favorites-modal"] [data-wwid="escort-card"] [data-wwid="stat-posts"]'))
    .toContainText('1234', {timeout: 10000});

  const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
  await utilsNimfomane.setEscortStorageProp(page, user, 'profileStatsTime', twoDaysAgo);

  await utilsNimfomane.interceptEscortStats(page, user, {
    posts: 5678,
    lastVisited: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    reputation: '567',
    lastPostedSectionUrl: 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/'
  });

  await utilsNimfomane.throttleReload(page);
  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();

  const escortCard = page.locator('[data-wwid="favorites-modal"] [data-wwid="escort-card"]');
  await expect(escortCard.locator('[data-wwid="stat-posts"]')).toContainText('1234');
  await expect(escortCard.locator('[data-wwid="stat-posts"] [data-wwid="inline-loader"]')).toBeVisible();
  await expect(escortCard.locator('[data-wwid="stat-posts"]')).toContainText('5678', {timeout: 10000});
});

test('Should order favorites based on last visited time.', async ({ page }) => {
  await utilsNimfomane.open(page);

  const second = await utilsNimfomane.getNthTopic(page, 1);
  await page.locator(`[data-wwtopic="${second.id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
  const first = await utilsNimfomane.getNthTopic(page, 0);
  await page.locator(`[data-wwtopic="${first.id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  await utilsNimfomane.interceptEscortStats(page, first.user, {
    lastVisited: twoHoursAgo,
  });
  await utilsNimfomane.interceptEscortStats(page, second.user, {
    lastVisited: oneHourAgo,
  });

  await page.locator('[data-wwid="favs-button"]').click();
  const escortCards = page.locator('[data-wwid="favorites-modal"] [data-wwid="escort-card"]');
  await expect(escortCards).toHaveCount(2);
  await expect(escortCards.first().locator('[data-wwid="stat-posts"] [data-wwid="inline-loader"]')).not.toBeVisible({timeout: 10000});
  await expect(escortCards.last().locator('[data-wwid="stat-posts"] [data-wwid="inline-loader"]')).not.toBeVisible({timeout: 10000});

  await page.locator('[data-wwid="favorites-modal"] [data-wwid="close"]').click();
  await page.locator('[data-wwid="favs-button"]').click();

  const firstCardDate = await escortCards.first().locator('[data-wwid="stat-last-visited"]').getAttribute('data-wwlastvisited');
  const secondCardDate = await escortCards.last().locator('[data-wwid="stat-last-visited"]').getAttribute('data-wwlastvisited');
  expect(new Date(firstCardDate!).getTime()).toBeGreaterThan(new Date(secondCardDate!).getTime());
});

test('Should display location titles in various conditions.', async ({ page }) => {
  await utilsNimfomane.open(page, {url: 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/'});

  const addFav = async (nth: number, asLocation: string) => {
    const esc = await utilsNimfomane.getNthTopic(page, nth);
    await page.locator(`[data-wwtopic="${esc.id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
    await utilsNimfomane.interceptEscortStats(page, esc.user, {
      lastPostedSectionUrl: asLocation,
    });
  }

  await addFav(0, 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/');
  await addFav(1, 'https://nimfomane.com/forum/forum/5-top-escorte-bucuresti/');
  await addFav(2, 'https://nimfomane.com/forum/forum/21-escorte-timisoara/');

  await utilsNimfomane.goto(page, 'https://nimfomane.com/forum/forum/201-discutii-generale-cluj/');
  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();
  await expect(page.locator('[data-wwid="favorites-modal"] [data-wwid="escort-card"] [data-wwid="stat-location"] [data-wwid="inline-loader"]').last()).not.toBeVisible({timeout: 15000});

  await page.locator('[data-wwid="favorites-modal"] [data-wwid="close"]').click();
  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();
  await expectFavoritesSectionHeaders(page, true, 1, 2);

  await utilsNimfomane.goto(page, 'https://nimfomane.com/forum/forum/3-discutii-si-dezbateri-despre-piata-escortelor-din-romania/');
  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();
  await expectFavoritesSectionHeaders(page, false);
});
