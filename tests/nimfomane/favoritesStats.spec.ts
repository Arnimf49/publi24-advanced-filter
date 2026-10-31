import {expect, test} from "../helpers/fixture";
import {utilsNimfomane} from "../helpers/utilsNimfomane";
import {Page} from "playwright-core";

async function expectFavoritesCityHeaders(page: Page, expected: string[], options?: {timeout?: number}) {
  await expect(
    page.locator('[data-wwid="favorites-modal"] [data-wwid="section-city"]')
  ).toHaveText(expected, options);
}

type ActivityItem = {
  cityUrl: string;
  topicUrl: string;
  text: string;
  topicTitle?: string;
  date?: string;
};

async function interceptProfileActivity(page: Page, user: string, items: ActivityItem[]) {
  const profileLink = await utilsNimfomane.getUserProfileLink(page, user);
  const body = items.map(({cityUrl, topicUrl, text, topicTitle = 'topic', date}) => `
    <div class="ipsStreamItem">
      <div class="ipsStreamItem_status"><a href="${cityUrl}">secțiune</a></div>
      <div class="ipsStreamItem_title"><a data-linktype="link" href="${topicUrl}">${topicTitle}</a></div>
      <div class="ipsStreamItem_snippet">${text}</div>
      <ul class="ipsStreamItem_meta">${date ? `<li><time datetime="${date}"></time></li>` : ''}</ul>
    </div>
  `).join('');

  await page.route(`${profileLink}content/?all_activity**`, route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({rows: body}),
  }));
}

async function interceptProfileCity(page: Page, user: string, cityUrl: string, city: string) {
  const profileLink = await utilsNimfomane.getUserProfileLink(page, user);
  const topicUrl = `https://nimfomane.com/forum/topic/${encodeURIComponent(user)}-current-city/`;

  await page.route(`${profileLink}content/?all_activity**`, route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      rows: `
    <div class="ipsStreamItem">
      <div class="ipsStreamItem_status"><a href="${cityUrl}">secțiune</a></div>
      <div class="ipsStreamItem_title"><a data-linktype="link" href="${topicUrl}">topic</a></div>
      <div class="ipsStreamItem_snippet">Am locuri disponibile în ${city} pentru programări.</div>
    </div>
  `,
    }),
  }));
}

async function interceptProfileStats(page: Page, user: string, lastVisited = '2026-09-26T10:00:00Z') {
  const profileLink = await utilsNimfomane.getUserProfileLink(page, user);

  await page.route(profileLink, route => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: `<html><body>
      <div id="elProfileStats">
        <ul><li>Posts 1</li><li>Joined</li><li><time datetime="${lastVisited}"></time></li></ul>
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

test('Should display extracted physical details and rates in favorites stats.', async ({ page }) => {
  await utilsNimfomane.open(page);
  const {user, id} = await utilsNimfomane.waitForNthImage(page);

  await page.locator(`[data-wwtopic="${id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
  await utilsNimfomane.setEscortStorageProp(page, user, 'personalDetails', {
    height: 168,
    weight: 58,
    age: 27,
  });
  await utilsNimfomane.setEscortStorageProp(page, user, 'serviceDetails', {
    baseRates: {'30m': 150, '1h': 250},
  });

  await page.locator('[data-wwid="favs-button"]').click();
  const escortCard = page.locator('[data-wwid="favorites-modal"] [data-wwid="escort-card"]');

  await expect(escortCard.locator('[data-wwid="stat-posts"]')).toContainText('168cm, 58kg, 27ani');
  await expect(escortCard.locator('[data-wwid="stat-reputation"]')).toContainText('150 30m, 250 1h');
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

test('Should dynamically update the escort city section when city updates while modal is open.', async ({ page }) => {
  await utilsNimfomane.open(page, {url: 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/'});
  const {user, id} = await utilsNimfomane.waitForNthImage(page);

  await page.locator(`[data-wwtopic="${id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
  await page.waitForTimeout(200);

  await utilsNimfomane.setEscortStorageProp(page, user, 'profileStats', {
    currentCity: {name: 'București', topicUrl: 'https://nimfomane.com/forum/forum/5-top-escorte-bucuresti/'},
  });

  await utilsNimfomane.interceptEscortStats(page, user, {
    lastPostedSectionUrl: 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/',
    delay: 5000,
  });

  await page.locator('[data-wwid="favs-button"]').click();
  await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();
  await expectFavoritesCityHeaders(page, ['București (1)']);

  await expectFavoritesCityHeaders(page, ['Cluj (1)'], {timeout: 15000});
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

test('Should display city titles in various conditions.', async ({ page }) => {
  const clujUrl = 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/';
  const bucharestUrl = 'https://nimfomane.com/forum/forum/5-top-escorte-bucuresti/';
  const timisoaraUrl = 'https://nimfomane.com/forum/forum/21-escorte-timisoara/';

  await utilsNimfomane.open(page, {url: clujUrl});

  try {
    const addFav = async (nth: number, city: string, cityUrl: string) => {
      const esc = await utilsNimfomane.getNthTopic(page, nth);
      await page.locator(`[data-wwtopic="${esc.id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
      await interceptProfileCity(page, esc.user, cityUrl, city);
    };

    await addFav(0, 'București', bucharestUrl);
    await addFav(1, 'Timișoara', timisoaraUrl);
    await addFav(2, 'Cluj', clujUrl);

    // On a city listing page, the current city section is displayed first.
    await utilsNimfomane.goto(page, 'https://nimfomane.com/forum/forum/201-discutii-generale-cluj/');
    await page.locator('[data-wwid="favs-button"]').click();
    await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();
    await expectFavoritesCityHeaders(page, ['Cluj (1)', 'București (1)', 'Timișoara (1)'], {timeout: 15000});

    // On a page outside the city sections, all favorites are still grouped by city.
    await utilsNimfomane.goto(page, 'https://nimfomane.com/forum/forum/3-discutii-si-dezbateri-despre-piata-escortelor-din-romania/');
    await page.locator('[data-wwid="favs-button"]').click();
    await expect(page.locator('[data-wwid="favorites-modal"]')).toBeVisible();

    const headers = page.locator('[data-wwid="favorites-modal"] [data-wwid="section-city"]');
    await expect(headers).toHaveCount(3, {timeout: 15000});
    for (const city of ['Cluj', 'București', 'Timișoara']) {
      await expect(headers.filter({hasText: city})).toHaveText(`${city} (1)`);
    }
  } finally {
    await page.unrouteAll({behavior: 'ignoreErrors'});
  }
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

test('Should detect the current city from a post mentioning available places.', async ({ page }) => {
  test.setTimeout(30000);
  await utilsNimfomane.open(page, {url: 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/'});
  const {user, id} = await utilsNimfomane.waitForNthImage(page);
  const clujUrl = 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/';

  await page.locator(`[data-wwtopic="${id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
  await interceptProfileActivity(page, user, [{
    cityUrl: clujUrl,
    topicUrl: 'https://nimfomane.com/forum/topic/available-cluj/',
    text: 'Am locuri disponibile în Cluj pentru programări.',
  }]);
  await interceptProfileStats(page, user);

  await page.locator('[data-wwid="favs-button"]').click();
  await page.waitForFunction((user) => {
    const escort = JSON.parse(localStorage.getItem(`p24fa:nimfo:escort:${user}`) || '{}');
    return escort.profileStats?.currentCity?.name === 'Cluj';
  }, user, {timeout: 15000});
});

test('Should keep the current city and mark it unavailable when its newest availability post says unavailable.', async ({ page }) => {
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
  await page.waitForFunction((user) => {
    const escort = JSON.parse(localStorage.getItem(`p24fa:nimfo:escort:${user}`) || '{}');
    return escort.profileStats?.currentCity?.unavailable === true;
  }, user, {timeout: 15000});

  const escort = await utilsNimfomane.getEscortStorageProp(page, user, 'profileStats');
  expect(escort?.currentCity?.name).toBe('Cluj');
  expect(escort?.currentCity?.unavailable).toBe(true);
  await expect(page.locator('[data-wwid="favorites-modal"] [data-wwid="escort-unavailable"]')).toHaveText('indisponibilă');
});

test('Should detect unavailability from the current city topic title.', async ({ page }) => {
  test.setTimeout(30000);
  await utilsNimfomane.open(page, {url: 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/'});
  const {user, id} = await utilsNimfomane.waitForNthImage(page);
  const clujUrl = 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/';

  await page.locator(`[data-wwtopic="${id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
  await interceptProfileActivity(page, user, [{
    cityUrl: clujUrl,
    topicUrl: 'https://nimfomane.com/forum/topic/unavailable-cluj/',
    topicTitle: 'Escortă Cluj - INDISPONIBILĂ',
    text: 'Am locuri disponibile în Cluj pentru programări.',
  }]);
  await interceptProfileStats(page, user);

  await page.locator('[data-wwid="favs-button"]').click();
  await page.waitForFunction((user) => {
    const escort = JSON.parse(localStorage.getItem(`p24fa:nimfo:escort:${user}`) || '{}');
    return escort.profileStats?.currentCity?.unavailable === true;
  }, user, {timeout: 15000});

  const escort = await utilsNimfomane.getEscortStorageProp(page, user, 'profileStats');
  expect(escort?.currentCity?.name).toBe('Cluj');
  expect(escort?.currentCity?.unavailable).toBe(true);
});

test('Should mark the current city unavailable after a last-day availability post has passed.', async ({ page }) => {
  test.setTimeout(30000);
  await utilsNimfomane.open(page, {url: 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/'});
  const {user, id} = await utilsNimfomane.waitForNthImage(page);
  const clujUrl = 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/';
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

  await page.locator(`[data-wwtopic="${id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
  await interceptProfileActivity(page, user, [{
    cityUrl: clujUrl,
    topicUrl: 'https://nimfomane.com/forum/topic/last-day-cluj/',
    text: 'Disponibilaaa, ultima zi',
    date: twoDaysAgo,
  }]);
  await interceptProfileStats(page, user);

  await page.locator('[data-wwid="favs-button"]').click();
  await page.waitForFunction((user) => {
    const escort = JSON.parse(localStorage.getItem(`p24fa:nimfo:escort:${user}`) || '{}');
    return escort.profileStats?.currentCity?.unavailable === true;
  }, user, {timeout: 15000});

  const escort = await utilsNimfomane.getEscortStorageProp(page, user, 'profileStats');
  expect(escort?.currentCity?.name).toBe('Cluj');
  expect(escort?.currentCity?.unavailable).toBe(true);
  await expect(page.locator('[data-wwid="favorites-modal"] [data-wwid="escort-unavailable"]')).toHaveText('indisponibilă');
});

test('Should keep the current city available while a last-day availability post is still today.', async ({ page }) => {
  test.setTimeout(30000);
  await utilsNimfomane.open(page, {url: 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/'});
  const {user, id} = await utilsNimfomane.waitForNthImage(page);
  const clujUrl = 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/';

  await page.locator(`[data-wwtopic="${id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
  await interceptProfileActivity(page, user, [{
    cityUrl: clujUrl,
    topicUrl: 'https://nimfomane.com/forum/topic/last-day-today-cluj/',
    text: 'Disponibilaaa, ultima zi',
    date: new Date().toISOString(),
  }]);
  await interceptProfileStats(page, user);

  await page.locator('[data-wwid="favs-button"]').click();
  await page.waitForFunction((user) => {
    const escort = JSON.parse(localStorage.getItem(`p24fa:nimfo:escort:${user}`) || '{}');
    return escort.profileStats?.currentCity?.name === 'Cluj';
  }, user, {timeout: 15000});

  const escort = await utilsNimfomane.getEscortStorageProp(page, user, 'profileStats');
  expect(escort?.currentCity?.unavailable).toBeUndefined();
});

test('Should sort unavailable favorites last within a city section.', async ({ page }) => {
  test.setTimeout(30000);
  await utilsNimfomane.open(page, {url: 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/'});
  const unavailable = await utilsNimfomane.getNthTopic(page, 0);
  const available = await utilsNimfomane.getNthTopic(page, 1);
  const clujUrl = 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/';

  await page.locator(`[data-wwtopic="${unavailable.id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();
  await page.locator(`[data-wwtopic="${available.id}"] [data-wwid="fav-toggle"][data-wwstate="off"]`).click();

  await interceptProfileActivity(page, unavailable.user, [{
    cityUrl: clujUrl,
    topicUrl: 'https://nimfomane.com/forum/topic/unavailable-cluj/',
    text: 'Am plecat din Cluj.',
  }]);
  await interceptProfileActivity(page, available.user, [{
    cityUrl: clujUrl,
    topicUrl: 'https://nimfomane.com/forum/topic/available-cluj/',
    text: 'Am locuri disponibile în Cluj pentru programări.',
  }]);
  await interceptProfileStats(page, unavailable.user, new Date(Date.now() - 60 * 60 * 1000).toISOString());
  await interceptProfileStats(page, available.user, new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString());

  await page.locator('[data-wwid="favs-button"]').click();
  await page.waitForFunction(({unavailableUser, availableUser}) => {
    const unavailableEscort = JSON.parse(localStorage.getItem(`p24fa:nimfo:escort:${unavailableUser}`) || '{}');
    const availableEscort = JSON.parse(localStorage.getItem(`p24fa:nimfo:escort:${availableUser}`) || '{}');
    return unavailableEscort.profileStats?.currentCity?.unavailable === true
      && !!availableEscort.profileStats?.currentCity?.name;
  }, {unavailableUser: unavailable.user, availableUser: available.user}, {timeout: 15000});

  await page.locator('[data-wwid="favorites-modal"] [data-wwid="close"]').click();
  await page.locator('[data-wwid="favs-button"]').click();

  const cards = page.locator('[data-wwid="favorites-modal"] [data-wwid="escort-card"]');
  await expect(cards).toHaveCount(2);
  await expect(cards.first().locator('[data-wwid="escort-name"]')).toHaveText(available.user);
  await expect(cards.last().locator('[data-wwid="escort-name"]')).toHaveText(unavailable.user);
  await expect(cards.last().locator('[data-wwid="escort-unavailable"]')).toHaveText('indisponibilă');
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
