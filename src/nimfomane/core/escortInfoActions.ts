import {page} from '../../common/page';
import {jsonPage} from './jsonPage';
import {escortInfoExtractor, PersonalDetails, ServiceDetails} from './escortInfoExtractor';
import {NimfomaneStorage} from './storage';
import type {EscortItem} from './storage';

const REFRESH_INTERVAL = 21 * 24 * 60 * 60 * 1000;
const OLDEST_POST_DATE = 3 * 365 * 24 * 60 * 60 * 1000;
const ACTIVE_COLLECTIONS = new Map<string, Promise<void>>();

interface CollectedDetails {
  personalDetails?: PersonalDetails;
  personalDetailsSourceUrl?: string;
  personalDetailsContentDate?: number;
  serviceDetails?: ServiceDetails;
  serviceDetailsSourceUrl?: string;
  serviceDetailsContentDate?: number;
}

function normalizeProfileUrl(url: string): string {
  return url.replace(/\/$/, '').replace(/\?.*$/, '');
}

function resolveUrl(href: string, baseUrl: string): string {
  return new URL(href, baseUrl).toString();
}

function isProfileUrl(url: string): boolean {
  return /\/profile\/[^/]+\/?(?:\?.*)?$/i.test(url);
}

function getExactSourceUrl(element: Element, fallbackUrl: string): string {
  const sourceContainer = element.closest<HTMLElement>('.cPost, .ipsComment, .cProfileSidebarBlock, #elProfileTabs_content, .ipsBox') || element;
  const sourceLink = Array.from(sourceContainer.querySelectorAll<HTMLAnchorElement>('a[href*="/topic/"]'))
    .find(link => !link.closest('.ipsQuote'));
  const href = sourceLink?.getAttribute('href');
  return href ? resolveUrl(href, fallbackUrl) : fallbackUrl;
}

function getSignatureSourceUrl(post: Element, fallbackUrl: string): string {
  const exactSourceUrl = getExactSourceUrl(post, fallbackUrl);
  if (exactSourceUrl !== fallbackUrl) {
    return exactSourceUrl;
  }

  const commentId = post.getAttribute('data-commentid');
  const quoteDataAttribute = post.getAttribute('data-quotedata');
  if (!commentId || !quoteDataAttribute) {
    return fallbackUrl;
  }

  let quoteData: {contentid?: unknown};
  try {
    quoteData = JSON.parse(quoteDataAttribute) as {contentid?: unknown};
  } catch (error) {
    console.warn('Unable to parse post quote data', error);
    return fallbackUrl;
  }

  const contentId = String(quoteData.contentid || '');
  if (!/^\d+$/.test(contentId) || !/^\d+$/.test(commentId)) {
    return fallbackUrl;
  }

  const sourceUrl = new URL(fallbackUrl);
  const forumPath = sourceUrl.pathname.split('/profile/')[0] || '/';
  sourceUrl.pathname = `${forumPath.replace(/\/$/, '')}/`;
  sourceUrl.search = new URLSearchParams({
    app: 'forums',
    module: 'forums',
    controller: 'topic',
    id: contentId,
    do: 'findComment',
    comment: commentId,
  }).toString();
  sourceUrl.hash = '';
  return sourceUrl.toString();
}

function collectText(text: string, sourceUrl: string, contentDate: number | undefined, details: CollectedDetails): void {
  const effectiveContentDate = isProfileUrl(sourceUrl) ? undefined : contentDate;

  if (!details.personalDetails) {
    const personalDetails = escortInfoExtractor.extractPersonalDetails(text);
    if (personalDetails) {
      details.personalDetails = personalDetails;
      details.personalDetailsSourceUrl = sourceUrl;
      details.personalDetailsContentDate = effectiveContentDate;
    }
  }

  if (!details.serviceDetails) {
    const serviceDetails = escortInfoExtractor.extractServiceDetails(text);
    if (serviceDetails) {
      details.serviceDetails = serviceDetails;
      details.serviceDetailsSourceUrl = sourceUrl;
      details.serviceDetailsContentDate = effectiveContentDate;
    }
  }
}

function saveCollectedDetails(user: string, details: CollectedDetails): void {
  if (details.personalDetails) {
    NimfomaneStorage.setEscortProp(user, 'personalDetails', details.personalDetails);
    NimfomaneStorage.setEscortProp(user, 'personalDetailsSourceUrl', details.personalDetailsSourceUrl);
    NimfomaneStorage.setEscortProp(user, 'personalDetailsContentDate', details.personalDetailsContentDate);
  }
  if (details.serviceDetails) {
    NimfomaneStorage.setEscortProp(user, 'serviceDetails', details.serviceDetails);
    NimfomaneStorage.setEscortProp(user, 'serviceDetailsSourceUrl', details.serviceDetailsSourceUrl);
    NimfomaneStorage.setEscortProp(user, 'serviceDetailsContentDate', details.serviceDetailsContentDate);
  }
}

function clearProfileContentDates(user: string, escort: EscortItem): void {
  if (escort.personalDetailsSourceUrl && isProfileUrl(escort.personalDetailsSourceUrl) && escort.personalDetailsContentDate !== undefined) {
    NimfomaneStorage.setEscortProp(user, 'personalDetailsContentDate', undefined);
  }

  if (escort.serviceDetailsSourceUrl && isProfileUrl(escort.serviceDetailsSourceUrl) && escort.serviceDetailsContentDate !== undefined) {
    NimfomaneStorage.setEscortProp(user, 'serviceDetailsContentDate', undefined);
  }
}

function hasAllDetails(details: CollectedDetails): boolean {
  return !!details.personalDetails && !!details.serviceDetails;
}

function getPostDate(post: HTMLElement): number | undefined {
  const datetime = post.querySelector('time')?.getAttribute('datetime');
  if (!datetime) {
    return undefined;
  }

  const timestamp = Date.parse(datetime);
  return Number.isNaN(timestamp) ? undefined : timestamp;
}

function getPageNumber(element: Element): number | undefined {
  const pageAttribute = element.getAttribute('data-page') || element.closest('[data-page]')?.getAttribute('data-page');
  if (pageAttribute) {
    const pageNumber = Number.parseInt(pageAttribute, 10);
    if (!Number.isNaN(pageNumber)) {
      return pageNumber;
    }
  }

  const href = element.getAttribute('href') || element.querySelector('a')?.getAttribute('href');
  const pageMatch = href?.match(/\/page\/(\d+)(?:\/|$)/);
  return pageMatch ? Number.parseInt(pageMatch[1], 10) : undefined;
}

function getPageUrl(templateUrl: string, profileUrl: string, pageNumber: number): string {
  const url = new URL(templateUrl, profileUrl);
  if (/\/page\/\d+(?:\/|$)/.test(url.pathname)) {
    url.pathname = url.pathname.replace(/\/page\/\d+(?=\/|$)/, `/page/${pageNumber}`);
  } else {
    url.pathname = `${url.pathname.replace(/\/$/, '')}/page/${pageNumber}/`;
  }
  url.searchParams.set('listResort', '1');
  return url.toString();
}

function getPostPages(doc: Document, profileUrl: string): {lastPage: number; pageTemplate?: string; csrfKey?: string} {
  const paginationLinks = Array.from(doc.querySelectorAll<HTMLAnchorElement>('.ipsPagination a, .ipsPagination_page a'));
  const pageNumbers = paginationLinks.flatMap(link => {
    const pageNumber = getPageNumber(link);
    return pageNumber === undefined ? [] : [pageNumber];
  });
  const lastLink = doc.querySelector<HTMLAnchorElement>('.ipsPagination_last a');
  const lastPage = Math.max(1, getPageNumber(lastLink || doc.body) || 0, ...pageNumbers);
  const pageTwoLink = paginationLinks.find(link => getPageNumber(link) === 2);
  const pageTemplateLink = pageTwoLink || lastLink;

  return {
    lastPage,
    pageTemplate: pageTemplateLink ? resolveUrl(pageTemplateLink.getAttribute('href')!, profileUrl) : undefined,
    csrfKey: doc.querySelector<HTMLInputElement>('[name="csrfKey"]')?.value,
  };
}

function collectPostContent(doc: Document, sourceUrl: string, user: string, details: CollectedDetails, oldestPostDate: number): boolean {
  const commentContents = Array.from(doc.querySelectorAll<HTMLElement>('[data-role="commentContent"]'));

  for (const content of commentContents) {
    const post = content.closest<HTMLElement>('.cPost, .ipsComment');
    const postDate = post ? getPostDate(post) : undefined;
    if (postDate !== undefined && postDate < oldestPostDate) {
      return true;
    }

    const contentCopy = content.cloneNode(true) as HTMLElement;
    contentCopy.querySelectorAll('.ipsQuote').forEach(quote => quote.remove());
    collectText(
      contentCopy.textContent || '',
      getExactSourceUrl(content, sourceUrl),
      postDate,
      details,
    );
    saveCollectedDetails(user, details);
    if (hasAllDetails(details)) {
      return true;
    }
  }

  return false;
}

async function collectEscortDetails(user: string, profileUrl: string, priority: number): Promise<void> {
  const details: CollectedDetails = {};
  const profilePage = await page.load(profileUrl, {priority});

  const sidebarDetails = profilePage.querySelectorAll('.cProfileSidebarBlock li:nth-child(3)');
  for (const sidebarDetail of sidebarDetails) {
    if (hasAllDetails(details)) {
      break;
    }

    collectText(sidebarDetail.textContent || '', getExactSourceUrl(sidebarDetail, profileUrl), undefined, details);
    saveCollectedDetails(user, details);
  }
  if (hasAllDetails(details)) {
    NimfomaneStorage.setEscortProp(user, 'escortDetailsTime', Date.now());
    return;
  }

  const servicesTab = profilePage.querySelector<HTMLAnchorElement>('a[href*="tab=field_core_pfield_11"]');
  if (servicesTab) {
    const tabPage = await page.load(resolveUrl(servicesTab.getAttribute('href')!, profileUrl), {priority});
    const tabDetails = tabPage.querySelector('#elProfileTabs_content');
    if (tabDetails) {
      const tabUrl = resolveUrl(servicesTab.getAttribute('href')!, profileUrl);
      collectText(tabDetails.textContent || '', getExactSourceUrl(tabDetails, tabUrl), undefined, details);
      saveCollectedDetails(user, details);
    }
  }
  if (hasAllDetails(details)) {
    NimfomaneStorage.setEscortProp(user, 'escortDetailsTime', Date.now());
    return;
  }

  const activityLink = profilePage.querySelector<HTMLAnchorElement>('#elProfileActivityOverview .ipsStreamItem_title a');
  if (activityLink) {
    const activityPage = await page.load(resolveUrl(activityLink.getAttribute('href')!, profileUrl), {priority});
    const matchingPosts = Array.from(activityPage.querySelectorAll<HTMLElement>('.cPost, .ipsComment')).filter(post => {
      const author = post.querySelector<HTMLElement>('.cAuthorPane_author');
      const authorName = author?.querySelector('a')?.textContent?.trim() || author?.textContent?.trim();
      return authorName === user;
    });
    const lastPost = matchingPosts[matchingPosts.length - 1];
    const signature = lastPost?.querySelector('[data-role="memberSignature"]');
    if (signature) {
      const signaturePost = signature.closest<HTMLElement>('[data-commentid]') || lastPost!;
      collectText(
        signature.textContent || '',
        getSignatureSourceUrl(signaturePost, profileUrl),
        getPostDate(signaturePost),
        details,
      );
      saveCollectedDetails(user, details);
    }
  }
  if (hasAllDetails(details)) {
    NimfomaneStorage.setEscortProp(user, 'escortDetailsTime', Date.now());
    return;
  }

  const oldestPostDate = Date.now() - OLDEST_POST_DATE;
  const firstPostsUrl = `${profileUrl}/content/?type=forums_topic_post`;
  let postsPage = await page.load(firstPostsUrl, {priority});
  let {lastPage, pageTemplate, csrfKey} = getPostPages(postsPage, profileUrl);

  for (let pageNumber = 1; pageNumber <= lastPage; pageNumber++) {
    if (pageNumber > 1) {
      const pageUrl = pageTemplate
        ? getPageUrl(pageTemplate, profileUrl, pageNumber)
        : `${profileUrl}/content/page/${pageNumber}/?type=forums_topic_post&listResort=1${
          csrfKey ? `&csrfKey=${encodeURIComponent(csrfKey)}` : ''
        }`;
      postsPage = await jsonPage.load(pageUrl, {priority});
    }

    const currentPageUrl = pageNumber === 1
      ? firstPostsUrl
      : pageTemplate
        ? getPageUrl(pageTemplate, profileUrl, pageNumber)
        : `${profileUrl}/content/page/${pageNumber}/?type=forums_topic_post&listResort=1${
          csrfKey ? `&csrfKey=${encodeURIComponent(csrfKey)}` : ''
        }`;
    if (collectPostContent(postsPage, currentPageUrl, user, details, oldestPostDate)) {
      break;
    }

    if (pageNumber === 1) {
      ({lastPage, pageTemplate, csrfKey} = getPostPages(postsPage, profileUrl));
    }
  }

  saveCollectedDetails(user, details);
  NimfomaneStorage.setEscortProp(user, 'escortDetailsTime', Date.now());
}

function startCollection(user: string, priority: number, force: boolean): Promise<void> {
  const escort = NimfomaneStorage.getEscort(user);
  clearProfileContentDates(user, escort);

  const lastDetermination = escort.escortDetailsTime;
  if (!force && lastDetermination && Date.now() - lastDetermination <= REFRESH_INTERVAL) {
    return Promise.resolve();
  }

  const activeCollection = ACTIVE_COLLECTIONS.get(user);
  if (activeCollection) {
    return activeCollection;
  }

  const profileUrl = normalizeProfileUrl(
    escort.profileLink || `https://nimfomane.com/forum/profile/${encodeURIComponent(user)}/`,
  );
  if (!escort.profileLink) {
    NimfomaneStorage.setEscortProp(user, 'profileLink', `${profileUrl}/`);
  }

  const collection = collectEscortDetails(user, profileUrl, priority);
  ACTIVE_COLLECTIONS.set(user, collection);
  collection.then(
    () => ACTIVE_COLLECTIONS.delete(user),
    () => ACTIVE_COLLECTIONS.delete(user),
  );
  return collection;
}

export const escortInfoActions = {
  ensureDetails(user: string, priority: number = 150): Promise<void> {
    return startCollection(user, priority, false);
  },

  refreshDetails(user: string, priority: number = 150): Promise<void> {
    const activeCollection = ACTIVE_COLLECTIONS.get(user);
    if (activeCollection) {
      return activeCollection.then(() => startCollection(user, priority, true));
    }

    return startCollection(user, priority, true);
  },
};
