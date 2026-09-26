import {expect, test} from "../helpers/fixture";
import {utilsNimfomane} from "../helpers/utilsNimfomane";
import {Page} from "playwright-core";

async function expectFavoritesSectionHeaders(page: Page, visible: boolean, inLocationCount?: number, otherLocationsCount?: number, options?: {timeout?: number}) {
  if (visible) {
    await expect(page.locator('[data-wwid="section-in-location"]')).toContainText(`În locație (${inLocationCount})`, options);
    await expect(page.locator('[data-wwid="section-other-locations"]')).toContainText(`În alte locații (${otherLocationsCount})`, options);
  } else {
    await expect(page.locator('[data-wwid="section-in-location"]')).not.toBeVisible(options);
    await expect(page.locator('[data-wwid="section-other-locations"]')).not.toBeVisible(options);
  }
}

type ActivityItem = {
  cityUrl: string;
  topicUrl: string;
  text: string;
};

async function interceptProfileActivity(page: Page, user: string, items: ActivityItem[]) {
  const profileLink = await utilsNimfomane.getUserProfileLink(page, user);
  const body = items.map(({cityUrl, topicUrl, text}) => `
    <div class="ipsStreamItem">
      <div class="ipsStreamItem_status"><a href="${cityUrl}">secțiune</a></div>
      <div class="ipsStreamItem_title"><a data-linktype="link" href="${topicUrl}">topic</a></div>
      <div class="ipsStreamItem_snippet">${text}</div>
    </div>
  `).join('');

  await page.route(/\/forum\/profile\/.*\/content\//, route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({rows: body}),
  }));
}

async function interceptProfileStats(page: Page, user: string) {
  const profileLink = await utilsNimfomane.getUserProfileLink(page, user);

  await page.route(profileLink, route => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: `<html><body>
      <div id="elProfileStats">
        <ul><li>Posts 1</li><li>Joined</li><li><time datetime="2026-09-26T10:00:00Z"></time></li></ul>
      </div>
    </body></html>`,
  }));
}

test('Should display escort stats in favorites.', async ({ page }) => {
  await utilsNimfomane.open(page);
  const {user, id} = await utilsNimfomane.waitForNthImage(page);

  await page.locator(`[data-wwtopic="${id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
  await page.waitForTimeout(200);

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  await utilsNimfomane.interceptEscortStats(page, user, {
    posts: 1234,
    lastVisited: oneHourAgo,
    reputation: '567',
    lastPostedSectionUrl: 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/',
    delay: 2000,
  });

  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();

  const escortCard = page.locator('[data-wwid="favorites-modal"] [data-wwid="escort-card"]');

  await expect(escortCard.locator('[data-wwid="stat-location"] [data-wwid="inline-loader"]')).toBeVisible();
  await expect(escortCard.locator('[data-wwid="stat-last-visited"] [data-wwid="inline-loader"]')).toBeVisible();
  await expect(escortCard.locator('[data-wwid="stat-posts"] [data-wwid="inline-loader"]')).toBeVisible();
  await expect(escortCard.locator('[data-wwid="stat-reputation"] [data-wwid="inline-loader"]')).toBeVisible();

  await expect(escortCard.locator('[data-wwid="inline-loader"]')).toHaveCount(0, {timeout: 15000});

  await expect(escortCard.locator('[data-wwid="stat-location"] a')).toContainText('Cluj', {timeout: 10000});
  await expect(escortCard.locator('[data-wwid="stat-location"] a')).toHaveAttribute('href');
  await expect(escortCard.locator('[data-wwid="stat-last-visited"]')).toContainText('de 1 oră');
  await expect(escortCard.locator('[data-wwid="stat-posts"]')).toContainText('1234');
  await expect(escortCard.locator('[data-wwid="stat-reputation"]')).toContainText('567');
});

test('Should refresh escort stats after a time in favorites.', async ({ page }) => {
  await utilsNimfomane.open(page);
  const {user, id} = await utilsNimfomane.waitForNthImage(page);

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
    lastPostedSectionUrl: 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/',
    delay: 5000,
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
    lastPostedSectionUrl: 'https://nimfomane.com/forum/forum/21-escorte-timisoara/',
  });
  await utilsNimfomane.interceptEscortStats(page, second.user, {
    lastVisited: oneHourAgo,
    lastPostedSectionUrl: 'https://nimfomane.com/forum/forum/21-escorte-timisoara/',
  });

  await page.locator('[data-wwid="favs-button"]').click();
  const escortCards = page.locator('[data-wwid="favorites-modal"] [data-wwid="escort-card"]');
  await expect(escortCards).toHaveCount(2);
  await expect(escortCards.first().locator('[data-wwid="stat-posts"] [data-wwid="inline-loader"]')).not.toBeVisible({timeout: 10000});
  await expect(escortCards.last().locator('[data-wwid="stat-posts"] [data-wwid="inline-loader"]')).not.toBeVisible({timeout: 10000});

  await page.locator('[data-wwid="favorites-modal"] [data-wwid="close"]').click();
  await page.locator('[data-wwid="favs-button"]').click();

  await expect(escortCards.first().locator('[data-wwid="stat-last-visited"][data-wwlastvisited]:not([data-wwlastvisited=""])')).toBeVisible({timeout: 5000});

  const firstCardDate = await escortCards.first().locator('[data-wwid="stat-last-visited"]').getAttribute('data-wwlastvisited');
  const secondCardDate = await escortCards.last().locator('[data-wwid="stat-last-visited"]').getAttribute('data-wwlastvisited');
  expect(new Date(firstCardDate!).getTime()).toBeGreaterThan(new Date(secondCardDate!).getTime());
});

test('Should dynamically move escort to in-location section when city updates while modal is open.', async ({ page }) => {
  await utilsNimfomane.open(page, {url: 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/'});
  const {user, id} = await utilsNimfomane.waitForNthImage(page);

  await page.locator(`[data-wwtopic="${id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
  await page.waitForTimeout(200);

  await utilsNimfomane.setEscortStorageProp(page, user, 'profileStats', {
    currentCity: {name: 'București', topicUrl: 'https://nimfomane.com/forum/forum/5-top-escorte-bucuresti/'},
  });

  await utilsNimfomane.interceptEscortStats(page, user, {
    lastPostedSectionUrl: 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/',
    delay: 3000,
  });

  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();
  await expect(page.locator('[data-wwid="section-other-locations"]')).toBeVisible();
  await expect(page.locator('[data-wwid="section-in-location"]')).not.toBeVisible();

  await expect(page.locator('[data-wwid="section-in-location"]')).toBeVisible({timeout: 10000});
  await expect(page.locator('[data-wwid="section-other-locations"]')).not.toBeVisible();
});

test('Should refresh favorites stats in background without opening the modal.', async ({ page }) => {
  await utilsNimfomane.open(page);
  const {user, id} = await utilsNimfomane.waitForNthImage(page);

  await page.locator(`[data-wwtopic="${id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
  await page.waitForTimeout(200);

  await utilsNimfomane.setEscortStorageProp(page, user, 'profileStats', undefined);
  await utilsNimfomane.setEscortStorageProp(page, user, 'profileStatsTime', undefined);

  await utilsNimfomane.interceptEscortStats(page, user, {
    posts: 9999,
    lastVisited: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    lastPostedSectionUrl: 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/',
  });

  await utilsNimfomane.throttleReload(page);

  await page.waitForFunction(
    (user) => {
      const escort = JSON.parse(localStorage.getItem(`p24fa:nimfo:escort:${user}`) || '{}');
      return escort.profileStats?.posts === 9999 && escort.profileStatsTime;
    },
    user,
    {timeout: 15000}
  );

  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();

  const escortCard = page.locator('[data-wwid="favorites-modal"] [data-wwid="escort-card"]');
  await expect(escortCard.locator('[data-wwid="stat-posts"] [data-wwid="inline-loader"]')).not.toBeVisible();
  await expect(escortCard.locator('[data-wwid="stat-posts"]')).toContainText('9999');

  await page.unrouteAll({behavior: 'ignoreErrors'});
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

  await expectFavoritesSectionHeaders(page, true, 1, 2, {timeout: 15000});

  await utilsNimfomane.goto(page, 'https://nimfomane.com/forum/forum/3-discutii-si-dezbateri-despre-piata-escortelor-din-romania/');
  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();
  await expectFavoritesSectionHeaders(page, false);
});

test('Should detect the current city from a positive availability post.', async ({ page }) => {
  test.setTimeout(30000);
  await utilsNimfomane.open(page, {url: 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/'});
  const {user, id} = await utilsNimfomane.waitForNthImage(page);
  const clujUrl = 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/';

  await page.locator(`[data-wwtopic="${id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
  await interceptProfileActivity(page, user, [{
    cityUrl: clujUrl,
    topicUrl: 'https://nimfomane.com/forum/topic/current-cluj/',
    text: 'Vă aștept în Cluj pentru programări.',
  }]);
  await interceptProfileStats(page, user);

  await page.locator('[data-wwid="favs-button"]').click();
  await page.waitForFunction((user) => {
    const escort = JSON.parse(localStorage.getItem(`p24fa:nimfo:escort:${user}`) || '{}');
    return escort.profileStats?.currentCity?.name === 'Cluj'
      && escort.profileStats.currentCity.topicUrl === 'https://nimfomane.com/forum/topic/current-cluj/';
  }, user, {timeout: 15000});
});

test('Should reject a city when its newest availability post says unavailable.', async ({ page }) => {
  test.setTimeout(30000);
  await utilsNimfomane.open(page, {url: 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/'});
  const {user, id} = await utilsNimfomane.waitForNthImage(page);
  const clujUrl = 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/';

  await page.locator(`[data-wwtopic="${id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
  await interceptProfileActivity(page, user, [
    {
      cityUrl: clujUrl,
      topicUrl: 'https://nimfomane.com/forum/topic/left-cluj/',
      text: 'Am plecat din Cluj.',
    },
    {
      cityUrl: clujUrl,
      topicUrl: 'https://nimfomane.com/forum/topic/arrived-cluj/',
      text: 'Am ajuns în Cluj și sunt disponibilă.',
    },
  ]);
  await interceptProfileStats(page, user);

  await page.locator('[data-wwid="favs-button"]').click();
  await page.waitForTimeout(5000);

  const escort = await utilsNimfomane.getEscortStorageProp(page, user, 'profileStats');
  expect(escort?.currentCity).toBeUndefined();
});

test('Should use the newest positive availability post across cities.', async ({ page }) => {
  test.setTimeout(30000);
  await utilsNimfomane.open(page, {url: 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/'});
  const {user, id} = await utilsNimfomane.waitForNthImage(page);
  const bucharestUrl = 'https://nimfomane.com/forum/forum/5-top-escorte-bucuresti/';
  const clujUrl = 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/';

  await page.locator(`[data-wwtopic="${id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
  await interceptProfileActivity(page, user, [
    {
      cityUrl: bucharestUrl,
      topicUrl: 'https://nimfomane.com/forum/topic/current-bucharest/',
      text: 'Am ajuns în București și mă găsiți pentru programări.',
    },
    {
      cityUrl: clujUrl,
      topicUrl: 'https://nimfomane.com/forum/topic/old-cluj/',
      text: 'Sunt disponibilă în Cluj.',
    },
  ]);
  await interceptProfileStats(page, user);

  await page.locator('[data-wwid="favs-button"]').click();
  await page.waitForFunction((user) => {
    const escort = JSON.parse(localStorage.getItem(`p24fa:nimfo:escort:${user}`) || '{}');
    return escort.profileStats?.currentCity?.name === 'București';
  }, user, {timeout: 15000});
});

test('Should fall back to repeated city posts without availability status.', async ({ page }) => {
  test.setTimeout(30000);
  await utilsNimfomane.open(page, {url: 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/'});
  const {user, id} = await utilsNimfomane.waitForNthImage(page);
  const clujUrl = 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/';

  await page.locator(`[data-wwtopic="${id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
  await interceptProfileActivity(page, user, [1, 2, 3].map(index => ({
    cityUrl: clujUrl,
    topicUrl: `https://nimfomane.com/forum/topic/cluj-${index}/`,
    text: `Postare obișnuită ${index}.`,
  })));
  await interceptProfileStats(page, user);

  await page.locator('[data-wwid="favs-button"]').click();
  await page.waitForFunction((user) => {
    const escort = JSON.parse(localStorage.getItem(`p24fa:nimfo:escort:${user}`) || '{}');
    return escort.profileStats?.currentCity?.name === 'Cluj';
  }, user, {timeout: 15000});
});
