import {expect, test} from "../helpers/fixture";
import {utilsNimfomane} from "../helpers/utilsNimfomane";
import {EscortItem} from "../../src/nimfomane/core/storage";

const PERSONAL_TEXT = 'Am 28 ani, 170 cm si 58 kg.';
const SERVICE_TEXT = '30 min 200 lei, 1 ora 300 lei. Oral protejat, normal protejat si masaj.';

type DetailSource = 'interest' | 'about' | 'signature' | 'posts';

interface MockDetailsOptions {
  source?: DetailSource;
  delay?: number;
}

function sourceUrl(profileLink: string, suffix: string): string {
  return `${profileLink.replace(/\/$/, '')}/${suffix}`;
}

function sourceText(): string {
  return `${PERSONAL_TEXT} ${SERVICE_TEXT}`;
}

function profileBody(source: DetailSource): string {
  const sidebar = source === 'interest'
    ? `<div class="cProfileSidebarBlock"><ul><li>interes</li><li>despre</li><li>${sourceText()}</li></ul></div>`
    : '';
  const servicesTab = source === 'about' || source === 'interest'
    ? '<a href="/forum/profile/test/?tab=field_core_pfield_11">servicii</a><div id="elProfileTabs_content"></div>'
    : '';
  const activity = source === 'signature'
    ? '<div class="ipsStreamItem_title"><a href="/forum/topic/999-test/?comment=7">activitate</a></div>'
    : '';

  return `<html><body>${sidebar}${servicesTab}${activity}
    <input name="csrfKey" value="test-csrf">
  </body></html>`;
}

function postsBody(profileLink: string): string {
  const firstTopic = `${sourceUrl(profileLink, 'topic/101-first/')}?do=findComment&comment=1`;
  const secondTopic = `${sourceUrl(profileLink, 'topic/102-second/')}?do=findComment&comment=2`;
  return `<html><body>
    <div class="ipsPagination"><a data-page="1" href="${profileLink}/content/?type=forums_topic_post">1</a></div>
    <div class="cPost" data-commentid="1"><time datetime="2026-08-01T12:00:00Z"></time>
      <div data-role="commentContent"><a href="${firstTopic}">${PERSONAL_TEXT}</a></div>
    </div>
    <div class="cPost" data-commentid="2"><time datetime="2026-08-02T12:00:00Z"></time>
      <div data-role="commentContent"><a href="${secondTopic}">${SERVICE_TEXT}</a></div>
    </div>
  </body></html>`;
}

async function mockEscortDetails(page: import("playwright-core").Page, profileLink: string, options: MockDetailsOptions = {}) {
  const source = options.source || 'interest';
  const activityUrl = 'https://nimfomane.com/forum/topic/999-test/?do=findComment&comment=7';

  await page.route('**://nimfomane.com/forum/**', route => route.abort());

  await page.route('**://nimfomane.com/forum/profile/**', async route => {
    const url = new URL(route.request().url());
    let body = profileBody(source);

    if (url.searchParams.get('tab') === 'field_core_pfield_11') {
      body = `<html><body><div id="elProfileTabs_content"><a href="${sourceUrl(profileLink, 'topic/201-about/')}">${PERSONAL_TEXT} ${SERVICE_TEXT}</a></div></body></html>`;
    } else if (url.pathname.endsWith('/content/')) {
      body = postsBody(profileLink);
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
          <div data-role="memberSignature">${sourceText()}</div>
      </article></div>
    </body></html>`;
    await route.fulfill({status: 200, contentType: 'text/html', body});
  });

  await page.route('**://nimfomane.com/forum/profile/**/content/page/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({rows: postsBody(profileLink)}),
    });
  });

}

async function openDetails(page: import("playwright-core").Page) {
  await page.locator('[data-wwid="escort-info-button"]').first().click();
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
  const {user} = await utilsNimfomane.waitForNthImage(page);
  const profileLink = await utilsNimfomane.getUserProfileLink(page, user);
  await setEscort(page, user, {profileLink});
  await mockEscortDetails(page, profileLink, {delay: 250});

  await page.locator('[data-wwid="escort-info-button"]').first().click();
  await expect(page.locator('[data-wwid="escort-details-loading"]')).toBeVisible();
  await expect(page.locator('[data-wwid="personal-details-section"]')).toBeVisible({timeout: 15000});
  await expect(page.locator('[data-wwid="service-details-section"]')).toBeVisible();
  await expect(page.locator('[data-wwid="personal-details-section"]')).toContainText('28 ani');
});

test('Should display multiple sources and details found in profile interest and about fields.', async ({page}) => {
  await utilsNimfomane.open(page);
  const {user} = await utilsNimfomane.waitForNthImage(page);
  const profileLink = await utilsNimfomane.getUserProfileLink(page, user);
  await setEscort(page, user, {profileLink});
  await mockEscortDetails(page, profileLink, {source: 'interest'});

  await openDetails(page);

  await expect(page.locator('[data-wwid="personal-details-meta"] a')).toHaveCount(1);
  await expect(page.locator('[data-wwid="personal-details-meta"] a'))
    .toHaveAttribute('href', 'https://nimfomane.com/forum/topic/101-first/?do=findComment&comment=1');
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

  await openDetails(page, user);

  await expect(page.locator('[data-wwid="escort-details-modal"]')
    .getByText('Nu s-au găsit detalii personale sau despre servicii', {exact: true})).toBeVisible();
  await expect(page.locator('[data-wwid="escort-details-refresh"]')).toBeVisible();
});
