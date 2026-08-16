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
  personalDetailsSourceUrls: string[];
  personalDetailsContentDate?: number;
  personalDetailsRank?: SourceRank;
  serviceDetails?: ServiceDetails;
  serviceDetailsSourceUrl?: string;
  serviceDetailsSourceUrls: string[];
  serviceDetailsContentDate?: number;
  serviceDetailsRank?: SourceRank;
}

interface SourceRank {
  sourcePriority: number;
  contentDate?: number;
}

const PROFILE_SOURCE_PRIORITY = 1;
const COMMENT_SOURCE_PRIORITY = 2;
const MAX_SERVICE_SOURCES = 2;

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

function getLinkedCommentPost(doc: Document, url: string): HTMLElement | null {
  const commentId = new URL(url).searchParams.get('comment');
  if (!commentId || !/^\d+$/.test(commentId)) {
    return null;
  }

  const commentWrap = doc.getElementById(`comment-${commentId}_wrap`);
  const commentElement = doc.getElementById(`elComment_${commentId}`);
  const comment = commentWrap || commentElement;
  return comment?.closest<HTMLElement>('.cPost, .ipsComment') || null;
}

function compareRanks(left: SourceRank, right: SourceRank): number {
  if (left.sourcePriority !== right.sourcePriority) {
    return left.sourcePriority - right.sourcePriority;
  }

  return (left.contentDate || 0) - (right.contentDate || 0);
}

function comparePersonalRanks(left: SourceRank, right: SourceRank): number {
  return (left.contentDate || 0) - (right.contentDate || 0);
}

function adjustAgeToCurrentYear(age: number, contentDate?: number): number {
  if (contentDate === undefined) {
    return age;
  }

  const contentYear = new Date(contentDate).getFullYear();
  const currentYear = new Date().getFullYear();
  return age + Math.max(0, currentYear - contentYear);
}

function normalizePersonalDetails(details: PersonalDetails, contentDate?: number): PersonalDetails {
  return details.age === undefined
    ? details
    : {...details, age: adjustAgeToCurrentYear(details.age, contentDate)};
}

function bringsNewPersonalInformation(existing: PersonalDetails | undefined, incoming: PersonalDetails): boolean {
  if (!existing) {
    return true;
  }

  return (Object.keys(incoming) as Array<keyof PersonalDetails>)
    .some(key => existing[key] === undefined && incoming[key] !== undefined);
}

function mergeDetails<T extends object>(details: T | undefined, incoming: T, preferIncoming: boolean): T {
  if (!details) {
    return incoming;
  }

  const merged = {...details};
  for (const key of Object.keys(incoming) as Array<keyof T>) {
    const incomingValue = incoming[key];
    const existingValue = merged[key];
    if (incomingValue === undefined) {
      continue;
    }

    if (incomingValue && typeof incomingValue === 'object'
      && existingValue && typeof existingValue === 'object'
      && !Array.isArray(incomingValue) && !Array.isArray(existingValue)) {
      merged[key] = mergeDetails(existingValue, incomingValue, preferIncoming) as T[typeof key];
    } else if (preferIncoming || existingValue === undefined) {
      merged[key] = incoming[key];
    }
  }

  return merged;
}

function recordSource(urls: string[], sourceUrl: string, isPrimary: boolean): void {
  const existingIndex = urls.indexOf(sourceUrl);
  if (existingIndex >= 0) {
    urls.splice(existingIndex, 1);
  }

  if (isPrimary) {
    urls.unshift(sourceUrl);
  } else {
    urls.push(sourceUrl);
  }
}

function collectText(
  text: string,
  sourceUrl: string,
  contentDate: number | undefined,
  details: CollectedDetails,
  sourcePriority: number,
): void {
  const effectiveContentDate = isProfileUrl(sourceUrl) ? undefined : contentDate;
  const sourceRank = {sourcePriority, contentDate: effectiveContentDate};

  const extractedPersonalDetails = escortInfoExtractor.extractPersonalDetails(text);
  const personalDetails = extractedPersonalDetails
    ? normalizePersonalDetails(extractedPersonalDetails, effectiveContentDate)
    : null;
  if (personalDetails) {
    const bringsNewInformation = bringsNewPersonalInformation(details.personalDetails, personalDetails);
    if (bringsNewInformation) {
      const isPrimary = !details.personalDetailsRank
        || comparePersonalRanks(sourceRank, details.personalDetailsRank) > 0;
      recordSource(details.personalDetailsSourceUrls, sourceUrl, isPrimary);
      details.personalDetails = mergeDetails(details.personalDetails, personalDetails, isPrimary);
      if (isPrimary) {
        details.personalDetailsSourceUrl = sourceUrl;
        details.personalDetailsRank = sourceRank;
      }
      details.personalDetailsContentDate = Math.max(
        details.personalDetailsContentDate || 0,
        effectiveContentDate || 0,
      ) || undefined;
    }
  }

  if (details.serviceDetailsSourceUrls.length < MAX_SERVICE_SOURCES) {
    const serviceDetails = escortInfoExtractor.extractServiceDetails(text);
    if (serviceDetails) {
      const isPrimary = !details.serviceDetailsRank || compareRanks(sourceRank, details.serviceDetailsRank) > 0;
      recordSource(details.serviceDetailsSourceUrls, sourceUrl, isPrimary);
      details.serviceDetailsSourceUrls.splice(MAX_SERVICE_SOURCES);
      details.serviceDetails = mergeDetails(details.serviceDetails, serviceDetails, isPrimary);
      if (isPrimary) {
        details.serviceDetailsSourceUrl = sourceUrl;
        details.serviceDetailsRank = sourceRank;
      }
      details.serviceDetailsContentDate = Math.max(
        details.serviceDetailsContentDate || 0,
        effectiveContentDate || 0,
      ) || undefined;
    }
  }
}

function saveCollectedDetails(user: string, details: CollectedDetails): void {
  if (details.personalDetails) {
    NimfomaneStorage.setEscortProp(user, 'personalDetails', details.personalDetails);
    NimfomaneStorage.setEscortProp(user, 'personalDetailsSourceUrl', details.personalDetailsSourceUrl);
    NimfomaneStorage.setEscortProp(user, 'personalDetailsSourceUrls', [...new Set(details.personalDetailsSourceUrls)]);
    NimfomaneStorage.setEscortProp(user, 'personalDetailsContentDate', details.personalDetailsContentDate);
  }
  if (details.serviceDetails) {
    NimfomaneStorage.setEscortProp(user, 'serviceDetails', details.serviceDetails);
    NimfomaneStorage.setEscortProp(user, 'serviceDetailsSourceUrl', details.serviceDetailsSourceUrl);
    NimfomaneStorage.setEscortProp(user, 'serviceDetailsSourceUrls', [...new Set(details.serviceDetailsSourceUrls)]);
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
  return hasCompletePersonalDetails(details)
    && !!details.serviceDetails
    && details.serviceDetailsSourceUrls.length >= MAX_SERVICE_SOURCES;
}

function hasCompletePersonalDetails(details: CollectedDetails): boolean {
  return details.personalDetails?.age !== undefined
    && details.personalDetails.height !== undefined
    && details.personalDetails.weight !== undefined;
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
      COMMENT_SOURCE_PRIORITY,
    );
    saveCollectedDetails(user, details);
    if (hasAllDetails(details)) {
      return true;
    }
  }

  return false;
}

async function collectEscortDetails(user: string, profileUrl: string, priority: number): Promise<void> {
  const details: CollectedDetails = {
    personalDetailsSourceUrls: [],
    serviceDetailsSourceUrls: [],
  };
  const profilePage = await page.load(profileUrl, {priority});

  const sidebarDetails = profilePage.querySelectorAll('.cProfileSidebarBlock li:nth-child(3)');
  for (const sidebarDetail of sidebarDetails) {
    if (hasAllDetails(details)) {
      break;
    }

    collectText(
      sidebarDetail.textContent || '',
      getExactSourceUrl(sidebarDetail, profileUrl),
      undefined,
      details,
      PROFILE_SOURCE_PRIORITY,
    );
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
      collectText(
        tabDetails.textContent || '',
        getExactSourceUrl(tabDetails, tabUrl),
        undefined,
        details,
        PROFILE_SOURCE_PRIORITY,
      );
      saveCollectedDetails(user, details);
    }
  }
  if (hasAllDetails(details)) {
    NimfomaneStorage.setEscortProp(user, 'escortDetailsTime', Date.now());
    return;
  }

  const activityTitle = profilePage.querySelector<HTMLElement>('.ipsStreamItem_title');
  const activityLink = activityTitle?.querySelector<HTMLAnchorElement>('[href]');
  if (activityLink) {
    const activityUrl = resolveUrl(activityLink.getAttribute('href')!, profileUrl);
    const activityPage = await page.load(activityUrl, {priority});
    const linkedPost = getLinkedCommentPost(activityPage, activityUrl);
    const signatures = linkedPost?.querySelectorAll('[data-role="memberSignature"]') || [];
    const signature = signatures[0];
    if (signature) {
      const signaturePost = signature.closest<HTMLElement>('[data-commentid]') || linkedPost!;
      const sourceUrl = getSignatureSourceUrl(signaturePost, profileUrl);
      collectText(
        signature.textContent || '',
        sourceUrl,
        getPostDate(signaturePost),
        details,
        PROFILE_SOURCE_PRIORITY,
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
