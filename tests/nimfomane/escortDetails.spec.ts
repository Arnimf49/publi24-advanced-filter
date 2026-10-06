import {expect, test} from "../helpers/fixture";
import {utilsNimfomane} from "../helpers/utilsNimfomane";
import {EscortItem, VisitedCity} from "../../src/nimfomane/core/storage";

const PERSONAL_TEXT = 'Am 28 ani, 170 cm si 58 kg.';
const SERVICE_TEXT = '30 min 200 lei, 1 ora 300 lei. Oral protejat, normal protejat si masaj.';

type DetailSource = 'interest' | 'about' | 'signature' | 'posts' | 'activity';

interface MockDetailsOptions {
  source?: DetailSource;
  delay?: number;
  visitedCities?: VisitedCity[];
  birthday?: string;
  personalText?: string;
}

function sourceUrl(profileLink: string, suffix: string): string {
  const profileUrl = new URL(profileLink);
  const forumPath = profileUrl.pathname.split('/profile/')[0];
  return `${profileUrl.origin}${forumPath}/${suffix}`;
}

function sourceText(personalText: string = PERSONAL_TEXT): string {
  return `${personalText} ${SERVICE_TEXT}`;
}

function profileBody(source: DetailSource, birthday?: string, personalText: string = PERSONAL_TEXT): string {
  const sidebar = source === 'interest'
    ? `<div class="cProfileSidebarBlock"><ul><li>interes</li><li>despre</li><li>${sourceText(personalText)}</li></ul></div>`
    : '';
  const birthdayField = birthday
    ? `<ul class="ipsDataList ipsDataList_reducedSpacing cProfileFields">
        <li class="ipsDataItem">
          <span class="ipsDataItem_generic ipsDataItem_size3 ipsType_break"><strong>Birthday</strong></span>
          <span class="ipsDataItem_generic">${birthday}</span>
        </li>
      </ul>`
    : '';
  const servicesTab = source === 'about' || source === 'interest'
    ? '<a href="/forum/profile/test/?tab=field_core_pfield_11">servicii</a><div id="elProfileTabs_content"></div>'
    : '';
  const activity = source === 'signature'
    ? '<div class="ipsStreamItem_title"><a data-linktype="link" href="https://nimfomane.com/forum/topic/999-test/?do=findComment&comment=7">activitate</a></div>'
    : '';

  return `<html><body>${birthdayField}${sidebar}${servicesTab}${activity}
    <input name="csrfKey" value="test-csrf">
  </body></html>`;
}

function postsBody(profileLink: string, visitedCities: string[] = [], personalText: string = PERSONAL_TEXT): string {
  const firstTopic = `${sourceUrl(profileLink, 'topic/101-first/')}?do=findComment&comment=1`;
  const secondTopic = `${sourceUrl(profileLink, 'topic/102-second/')}?do=findComment&comment=2`;
  const cityUrls = [
    'https://nimfomane.com/forum/forum/35-escorte-din-cluj/',
    'https://nimfomane.com/forum/forum/5-top-escorte-bucuresti/',
    'https://nimfomane.com/forum/forum/17-escorte-brasov-si-imprejurimi/',
  ];
  const cityLink = (index: number) => visitedCities[index]
    ? `<div class="ipsType_sectionHead"><a href="${cityUrls[index]}">${visitedCities[index]}</a></div>`
    : '';

  return `<html><body>
    <div class="ipsPagination"><a data-page="1" href="${profileLink}/content/?type=forums_topic_post">1</a></div>
    <div class="cPost" data-commentid="1"><time datetime="2026-08-01T12:00:00Z"></time>
      ${cityLink(0)}
      <div data-role="commentContent"><a href="${firstTopic}">${personalText} locuri disponibile</a></div>
    </div>
    <div class="cPost" data-commentid="2"><time datetime="2026-08-02T12:00:00Z"></time>
      ${cityLink(1)}
      <div data-role="commentContent"><a href="${secondTopic}">${SERVICE_TEXT} locuri disponibile</a></div>
    </div>
  </body></html>`;
}

function oldPostsBody(profileLink: string): string {
  const oldTopic = `${sourceUrl(profileLink, 'topic/100-old/')}?do=findComment&comment=1`;
  return `<html><body>
    <div class="ipsPagination"><a data-page="1" href="${profileLink}/content/?type=forums_topic_post">1</a></div>
    <div class="cPost" data-commentid="1"><time datetime="2020-08-01T12:00:00Z"></time>
      <div data-role="commentContent"><a href="${oldTopic}">old post</a></div>
    </div>
  </body></html>`;
}

function activityBody(profileLink: string, lastPage: boolean, personalText: string = PERSONAL_TEXT): string {
  const activityTopic = `${sourceUrl(profileLink, 'topic/301-activity/')}?do=findComment&comment=3`;
  const pagination = lastPage
    ? '<a class="ipsPagination_page" data-page="2" href="/forum/profile/test/content/page/2/?all_activity=1">2</a>'
    : '<li class="ipsPagination_last"><a href="/forum/profile/test/content/page/2/?all_activity=1">last</a></li>';
  const activity = lastPage
    ? `<div class="ipsStreamItem">
        <div class="ipsStreamItem_title"><a href="${activityTopic}">activity</a></div>
        <div class="ipsStreamItem_snippet"><time datetime="2026-08-03T12:00:00Z"></time>${sourceText(personalText)}</div>
      </div>`
    : '';

  return `<html><body>${pagination}${activity}</body></html>`;
}

async function mockEscortDetails(page: import("playwright-core").Page, profileLink: string, options: MockDetailsOptions = {}) {
  const source = options.source || 'interest';
  const personalText = options.personalText || PERSONAL_TEXT;
  const activityUrl = 'https://nimfomane.com/forum/topic/999-test/?do=findComment&comment=7';

  await page.route('**://nimfomane.com/forum/**', route => route.abort());

  await page.route('**://nimfomane.com/forum/profile/**', async route => {
    const url = new URL(route.request().url());
    let body = profileBody(source, options.birthday, personalText);

    if (url.searchParams.get('tab') === 'field_core_pfield_11') {
      body = `<html><body><div id="elProfileTabs_content"><a href="${sourceUrl(profileLink, 'topic/201-about/')}">${sourceText(personalText)}</a></div></body></html>`;
    } else if (source === 'activity' && url.searchParams.get('all_activity') === '1') {
      const lastPage = url.pathname.includes('/page/2/');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({rows: activityBody(profileLink, lastPage, personalText)}),
      });
      return;
    } else if (url.pathname.endsWith('/content/')) {
      body = source === 'activity'
        ? oldPostsBody(profileLink)
        : postsBody(profileLink, options.visitedCities, personalText);
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay));
    }

    await route.fulfill({status: 200, contentType: 'text/html', body});
  });

  await page.route('**://nimfomane.com/forum/topic/999-test/**', async route => {
    const body = `<html><body>
      <div id="comment-7_wrap" class="cPost" data-commentid="7"><article>
        <div data-role="commentContent"></div>
          <a href="${activityUrl}">topic</a>
          <div data-role="memberSignature">${sourceText(personalText)}</div>
      </article></div>
    </body></html>`;
    await route.fulfill({status: 200, contentType: 'text/html', body});
  });

  await page.route('**://nimfomane.com/forum/profile/**/content/page/**', async route => {
    const body = source === 'activity'
      ? activityBody(profileLink, true, personalText)
      : postsBody(profileLink, options.visitedCities, personalText);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({rows: body}),
    });
  });

}

async function openDetails(page: import("playwright-core").Page, topicId?: string | null) {
  const button = topicId
    ? page.locator(`[data-wwtopic="${topicId}"] [data-wwid="escort-info-button"]`)
    : page.locator('[data-wwid="escort-info-button"]').first();
  await button.click();
  await expect(page.locator('[data-wwid="escort-details-modal"]')).toBeVisible();
  await expect(page.locator('[data-wwid="escort-details-loading"]')).toHaveCount(0, {timeout: 15000});
}

async function setEscort(page: import("playwright-core").Page, user: string, escort: EscortItem) {
  await page.evaluate(({user, escort}) => {
    localStorage.setItem(`p24fa:nimfo:escort:${user}`, JSON.stringify(escort));
  }, {user, escort});
}

test('Should show loading state and details when no details are stored.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {user, id} = await utilsNimfomane.waitForNthImage(page);
  const profileLink = await utilsNimfomane.getUserProfileLink(page, user);
  await setEscort(page, user, {profileLink});
  await mockEscortDetails(page, profileLink, {delay: 250});

  await page.locator('[data-wwid="escort-info-button"]').first().click();
  await expect(page.locator('[data-wwid="escort-details-loading"]')).toBeVisible();
  await expect(page.locator('[data-wwid="personal-details-section"]')).toBeVisible({timeout: 15000});
  await expect(page.locator('[data-wwid="service-details-section"]')).toBeVisible();
  await expect(page.locator('[data-wwid="personal-details-section"]')).toContainText('28 ani');
});

test('Should extract age from the birthday field on the profile page.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {user} = await utilsNimfomane.waitForNthImage(page);
  const profileLink = await utilsNimfomane.getUserProfileLink(page, user);
  await setEscort(page, user, {profileLink});
  await mockEscortDetails(page, profileLink, {
    birthday: '11/18/2000',
    personalText: '170 cm si 58 kg.',
  });

  await openDetails(page);

  await expect(page.locator('[data-wwid="personal-details-section"]')).toContainText(
    `${new Date().getFullYear() - 2000} ani`,
  );
});

test('Should display multiple sources and details found in profile interest and about fields.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {user} = await utilsNimfomane.waitForNthImage(page);
  const profileLink = await utilsNimfomane.getUserProfileLink(page, user);
  await setEscort(page, user, {profileLink});
  await mockEscortDetails(page, profileLink, {source: 'interest'});

  await openDetails(page);

  await expect(page.locator('[data-wwid="personal-details-meta"] a')).toHaveCount(2);
  await expect(page.locator('[data-wwid="service-details-meta"] a')).toHaveCount(2);
  for (const link of await page.locator('[data-wwid="personal-details-meta"] a').all()) {
    await expect(link).toHaveAttribute('href', /nimfomane\.com\/forum\//);
  }
  for (const link of await page.locator('[data-wwid="service-details-meta"] a').all()) {
    await expect(link).toHaveAttribute('href', /nimfomane\.com\/forum\//);
  }
});

test('Should find details from a signature and activity posts.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {user} = await utilsNimfomane.waitForNthImage(page);
  const profileLink = await utilsNimfomane.getUserProfileLink(page, user);
  await setEscort(page, user, {profileLink});
  await mockEscortDetails(page, profileLink, {source: 'signature'});

  await openDetails(page);

  await expect(page.locator('[data-wwid="personal-details-section"] td').first()).toContainText('28 ani');
  await expect(page.locator('[data-wwid="personal-details-meta"] a[href*="topic/999-test"]'))
    .toHaveAttribute('href', 'https://nimfomane.com/forum/topic/999-test/?do=findComment&comment=7');
});

test('Should find details in posts when profile fields and signature are empty.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {user} = await utilsNimfomane.waitForNthImage(page);
  const profileLink = await utilsNimfomane.getUserProfileLink(page, user);
  await setEscort(page, user, {profileLink});
  await mockEscortDetails(page, profileLink, {source: 'posts'});

  await openDetails(page);

  await expect(page.locator('[data-wwid="personal-details-section"]')).toContainText('170 cm');
  await expect(page.locator('[data-wwid="service-details-meta"] a')).toHaveCount(1);
});

test('Should analyze the last activity page when details are missing from posts.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {user} = await utilsNimfomane.waitForNthImage(page);
  const profileLink = await utilsNimfomane.getUserProfileLink(page, user);
  await setEscort(page, user, {profileLink});
  await mockEscortDetails(page, profileLink, {source: 'activity'});

  await openDetails(page);

  await expect(page.locator('[data-wwid="personal-details-section"]')).toContainText('170 cm');
  await expect(page.locator('[data-wwid="service-details-section"]')).toContainText('masaj');
  await expect(page.locator('[data-wwid="personal-details-meta"] a'))
    .toHaveAttribute('href', /topic\/301-activity\/\?do=findComment&comment=3/);
  await expect(page.locator('[data-wwid="service-details-meta"] a'))
    .toHaveAttribute('href', /topic\/301-activity\/\?do=findComment&comment=3/);
});

test('Should reanalyze stale details on opening and refresh manually.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {user} = await utilsNimfomane.waitForNthImage(page);
  const profileLink = await utilsNimfomane.getUserProfileLink(page, user);
  await setEscort(page, user, {
    profileLink,
    escortDetailsTime: Date.now() - 22 * 24 * 60 * 60 * 1000,
    personalDetails: {age: 21},
  });
  await mockEscortDetails(page, profileLink, {source: 'about', delay: 150});

  await openDetails(page);
  await expect(page.locator('[data-wwid="personal-details-section"]')).toContainText('28 ani');
  await page.locator('[data-wwid="escort-details-refresh"]').click();
  await expect(page.locator('[data-wwid="escort-details-loading"]')).toHaveCount(0, {timeout: 15000});
  await expect(page.locator('[data-wwid="escort-details-refresh"]')).toBeVisible();
});

test('Should show the no-details message when analysis finds nothing.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {user} = await utilsNimfomane.waitForNthImage(page);
  const profileLink = await utilsNimfomane.getUserProfileLink(page, user);
  await setEscort(page, user, {profileLink});
  await page.route('**://nimfomane.com/forum/profile/**', route => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: '<html><body><input name="csrfKey" value="empty"></body></html>',
  }));

  await openDetails(page);

  await expect(page.locator('[data-wwid="escort-details-modal"]')
    .getByText('Nu s-au găsit detalii personale sau despre servicii', {exact: true})).toBeVisible();
  await expect(page.locator('[data-wwid="escort-details-refresh"]')).toBeVisible();
  await expect(page.locator('[data-wwid="visited-cities-section"]')).toHaveCount(0);
});

test('Should display visited cities in reverse chronological order.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {user, id} = await utilsNimfomane.waitForNthImage(page);
  const profileLink = await utilsNimfomane.getUserProfileLink(page, user);
  await mockEscortDetails(page, profileLink, {
    visitedCities: ['Cluj', 'București'],
  });

  await setEscort(page, user, {
    profileLink,
  });
  await openDetails(page, id);

  const cities = page.locator('[data-wwid="visited-city"]');
  await expect(cities).toHaveCount(3);
  await expect(cities.nth(0).locator('[data-wwid="visited-city-label"]')).toHaveText('Cluj');
  await expect(cities.nth(1).locator('[data-wwid="visited-city-label"]')).toHaveText('București');
  await expect(cities.nth(1).locator('[data-wwid="visited-city-days"]')).toHaveText('1 zile');
});

test('Should display durations in the updated visited city format and support legacy entries.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {user, id} = await utilsNimfomane.waitForNthImage(page);

  await setEscort(page, user, {
    visitedCities: ['Cluj', ['București', 4] as VisitedCity],
    escortDetailsTime: Date.now(),
  });
  await openDetails(page, id);

  const cities = page.locator('[data-wwid="visited-city"]');
  await expect(cities.nth(0).locator('[data-wwid="visited-city-label"]')).toHaveText('Cluj');
  await expect(cities.nth(1).locator('[data-wwid="visited-city-label"]')).toHaveText('București');
  await expect(cities.nth(1).locator('[data-wwid="visited-city-days"]')).toHaveText('4 zile');
});
