import {page} from '../../common/page';
import {jsonPage} from './jsonPage';
import {escortInfoExtractor, PersonalDetails, RateOverride, ServiceDetails} from './escortInfoExtractor';
import {NimfomaneStorage} from './storage';
import type {EscortItem, VisitedCity} from './storage';
import {cityDetection} from './cityDetection';

const REFRESH_INTERVAL = 21 * 24 * 60 * 60 * 1000;
const OLDEST_POST_DATE = 3 * 365 * 24 * 60 * 60 * 1000;
const MIN_VISITED_CITIES = 20;
const MAX_VISITED_CITIES = 32;
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
  serviceProfileSourceSelected?: boolean;
  servicePostSourceSelected?: boolean;
  visitedCities: VisitedCity[];
  currentVisitedCity?: {
    city: string;
    newestPostDate?: number;
    oldestPostDate?: number;
  };
}

interface SourceRank {
  sourcePriority: number;
  contentDate?: number;
}

const ABOUT_SOURCE_PRIORITY = 1;
const INTEREST_SOURCE_PRIORITY = 2;
const COMMENT_SOURCE_PRIORITY = 3;
const SIGNATURE_SOURCE_PRIORITY = 4;
const SERVICE_POST_OVERRIDE_PRIORITY = 5;
const SIGNATURE_SERVICE_PRIORITY = 6;

function normalizeProfileUrl(url: string): string {
  return url.replace(/\/$/, '').replace(/\?.*$/, '');
}

function resolveUrl(href: string, baseUrl: string): string {
  return new URL(href, baseUrl).toString();
}

function isProfileUrl(url: string): boolean {
  return /\/profile\/[^/]+\/?(?:\?.*)?$/i.test(url);
}

function getTopicPostSourceUrl(element: Element, fallbackUrl: string): string {
  const sourceLink = element.querySelector<HTMLAnchorElement>(
    '.ipsType_sectionHead [href]:last-child',
  );
  const href = sourceLink?.getAttribute('href');
  return href ? resolveUrl(href, fallbackUrl) : fallbackUrl;
}

function getLinkedCommentPost(doc: Document, url: string): HTMLElement | null {
  const commentId = new URL(url).searchParams.get('comment');
  if (!commentId || !/^\d+$/.test(commentId)) {
    console.warn('No comment ID in URL:', url);
    return null;
  }

  return doc.querySelector(`[data-commentid="${commentId}"]`)!;
}

function compareRanks(left: SourceRank, right: SourceRank): number {
  if (left.sourcePriority !== right.sourcePriority) {
    return left.sourcePriority - right.sourcePriority;
  }

  return (left.contentDate || 0) - (right.contentDate || 0);
}

function comparePersonalRanks(left: SourceRank, right: SourceRank): number {
  return compareRanks(left, right);
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

function mergeRateOverrides(
  overrides: RateOverride[] | undefined,
  incoming: RateOverride[] | undefined,
  preferIncoming: boolean,
): RateOverride[] | undefined {
  if (!overrides && !incoming) {
    return undefined;
  }

  const merged = new Map<string, RateOverride>();
  for (const override of overrides || []) {
    merged.set(override.after, {
      ...override,
      rates: override.rates ? {...override.rates} : undefined,
    });
  }

  for (const override of incoming || []) {
    const existing = merged.get(override.after);
    if (!existing) {
      merged.set(override.after, {
        ...override,
        rates: override.rates ? {...override.rates} : undefined,
      });
      continue;
    }

    const rates = existing.rates || override.rates
      ? mergeDetails(existing.rates, override.rates || {}, preferIncoming)
      : undefined;
    merged.set(override.after, {
      ...existing,
      ...override,
      rates,
    });
  }

  return [...merged.values()];
}

function mergeServiceDetails(
  details: ServiceDetails | undefined,
  incoming: ServiceDetails,
  preferIncoming: boolean,
): ServiceDetails {
  const merged = mergeDetails(details, incoming, preferIncoming);
  const rateOverrides = mergeRateOverrides(details?.rateOverrides, incoming.rateOverrides, preferIncoming);
  if (rateOverrides) {
    merged.rateOverrides = rateOverrides;
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
  serviceSourceType: 'profile' | 'post',
): void {
  const effectiveContentDate = isProfileUrl(sourceUrl) ? undefined : contentDate;
  const sourceRank = {sourcePriority, contentDate: effectiveContentDate};

  const extractedPersonalDetails = escortInfoExtractor.extractPersonalDetails(text);
  const personalDetails = extractedPersonalDetails
    ? normalizePersonalDetails(extractedPersonalDetails, effectiveContentDate)
    : null;
  if (personalDetails) {
    const bringsNewInformation = bringsNewPersonalInformation(details.personalDetails, personalDetails);
    const isPrimary = !details.personalDetailsRank
      || comparePersonalRanks(sourceRank, details.personalDetailsRank) > 0;
    if (bringsNewInformation || isPrimary) {
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

  const serviceDetails = escortInfoExtractor.extractServiceDetails(text);
  if (serviceDetails) {
    if (serviceSourceType === 'profile' && details.serviceProfileSourceSelected) {
      return;
    }
    if (serviceSourceType === 'post' && details.servicePostSourceSelected) {
      return;
    }

    const isPostOverride = serviceSourceType === 'post';
    const serviceSourceRank = sourcePriority === SIGNATURE_SOURCE_PRIORITY
      ? {sourcePriority: SIGNATURE_SERVICE_PRIORITY, contentDate: effectiveContentDate}
      : isPostOverride
      ? {sourcePriority: SERVICE_POST_OVERRIDE_PRIORITY, contentDate: effectiveContentDate}
      : sourceRank;
    const isPrimary = !details.serviceDetailsRank
      || compareRanks(serviceSourceRank, details.serviceDetailsRank) > 0;
    recordSource(details.serviceDetailsSourceUrls, sourceUrl, isPrimary);
    const preferIncoming = isPrimary
      || (isPostOverride && details.serviceDetailsRank?.sourcePriority !== SIGNATURE_SERVICE_PRIORITY);
    details.serviceDetails = mergeServiceDetails(details.serviceDetails, serviceDetails, preferIncoming);
    if (isPrimary) {
      details.serviceDetailsSourceUrl = sourceUrl;
      details.serviceDetailsRank = serviceSourceRank;
    }
    details.serviceProfileSourceSelected = details.serviceProfileSourceSelected || serviceSourceType === 'profile';
    details.servicePostSourceSelected = details.servicePostSourceSelected || isPostOverride;
    details.serviceDetailsContentDate = Math.max(
      details.serviceDetailsContentDate || 0,
      effectiveContentDate || 0,
    ) || undefined;
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
    && !!details.servicePostSourceSelected
    && details.visitedCities.length >= MIN_VISITED_CITIES;
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

function collectPostContent(
  doc: Document,
  sourceUrl: string,
  user: string,
  details: CollectedDetails,
  oldestPostDate: number,
  collectAllPosts: boolean,
): boolean {
  const commentContents = Array.from(doc.querySelectorAll<HTMLElement>('[data-role="commentContent"]'));

  for (const content of commentContents) {
    const post = content.closest<HTMLElement>('.cPost, .ipsComment');
    const postDate = post ? getPostDate(post) : undefined;
    if (postDate !== undefined && postDate < oldestPostDate) {
      return true;
    }
    if (!post) {
      continue;
    }

    const postSourceUrl = getTopicPostSourceUrl(post, sourceUrl);
    const city = cityDetection.getAvailableCityFromElement(post, postSourceUrl, content);
    if (city) {
      appendVisitedCity(user, details, city, postDate);
    }

    const contentCopy = content.cloneNode(true) as HTMLElement;
    contentCopy.querySelectorAll('.ipsQuote').forEach(quote => quote.remove());
    collectText(
      contentCopy.textContent || '',
      postSourceUrl,
      postDate,
      details,
      COMMENT_SOURCE_PRIORITY,
      'post',
    );
    saveCollectedDetails(user, details);
    if (hasAllDetails(details) && !collectAllPosts) {
      return true;
    }
  }

  return false;
}

function getLastActivityPageUrl(doc: Document, profileUrl: string): string | undefined {
  const lastPageLink = doc.querySelector<HTMLAnchorElement>(
    '.ipsPagination_last a, .ipsPagination_page:last-child a',
  );
  return lastPageLink
    ? resolveUrl(lastPageLink.getAttribute('href')!, profileUrl)
    : undefined;
}

function saveVisitedCities(user: string, visitedCities: VisitedCity[]): void {
  NimfomaneStorage.setEscortProp(user, 'visitedCities', [...visitedCities]);
}

function getStayDays(newestPostDate?: number, oldestPostDate?: number): number {
  if (newestPostDate === undefined || oldestPostDate === undefined) {
    return 1;
  }

  return Math.max(1, Math.ceil(Math.abs(newestPostDate - oldestPostDate) / (24 * 60 * 60 * 1000)));
}

function appendVisitedCity(
  user: string,
  details: CollectedDetails,
  city: string,
  postDate?: number,
): void {
  const currentVisitedCity = details.currentVisitedCity;

  if (currentVisitedCity?.city === city) {
    currentVisitedCity.oldestPostDate = postDate ?? currentVisitedCity.oldestPostDate;
    const currentEntry = details.visitedCities.at(-1);
    if (Array.isArray(currentEntry)) {
      currentEntry[1] = getStayDays(currentVisitedCity.newestPostDate, currentVisitedCity.oldestPostDate);
      saveVisitedCities(user, details.visitedCities);
    }
    return;
  }

  if (
    details.visitedCities.length >= MAX_VISITED_CITIES
  ) {
    return;
  }

  details.visitedCities.push(details.visitedCities.length === 0 ? city : [city, 1]);
  details.currentVisitedCity = {
    city,
    newestPostDate: postDate,
    oldestPostDate: postDate,
  };
  saveVisitedCities(user, details.visitedCities);
}

function collectActivityContent(
  doc: Document,
  sourceUrl: string,
  user: string,
  details: CollectedDetails,
): void {
  const streamItems = doc.querySelectorAll<HTMLElement>('.ipsStreamItem');
  for (const streamItem of streamItems) {
    const content = streamItem.querySelector<HTMLElement>('.ipsStreamItem_snippet');
    if (!content) {
      continue;
    }

    const sourceLink = streamItem.querySelector<HTMLAnchorElement>('.ipsStreamItem_title a[href]');
    const itemUrl = sourceLink?.getAttribute('href');
    const itemSourceUrl = itemUrl ? resolveUrl(itemUrl, sourceUrl) : sourceUrl;
    const city = cityDetection.getAvailableCityFromElement(streamItem, undefined, content);
    if (city) {
      appendVisitedCity(user, details, city, getPostDate(streamItem));
    }

    const contentDate = getPostDate(streamItem);
    collectText(
      content.textContent || '',
      itemSourceUrl,
      contentDate,
      details,
      COMMENT_SOURCE_PRIORITY,
      'post',
    );
    saveCollectedDetails(user, details);
  }
}

async function collectEscortDetails(user: string, profileUrl: string, priority: number): Promise<void> {
  const existingEscort = NimfomaneStorage.getEscort(user);
  const collectVisitedCities = existingEscort.visitedCities === undefined;
  const details: CollectedDetails = {
    personalDetailsSourceUrls: [],
    serviceDetailsSourceUrls: [],
    visitedCities: [],
  };
  saveVisitedCities(user, details.visitedCities);
  const profilePage = await page.load(profileUrl, {priority});

  const lastestPostLink = profilePage?.querySelector<HTMLAnchorElement>('.ipsStreamItem_title [href][data-linktype="link"]');
  if (lastestPostLink) {
    const latestPostUrl = lastestPostLink.getAttribute('href')!;
    const activityPage = await page.load(latestPostUrl, {priority});
    const linkedPost = getLinkedCommentPost(activityPage, latestPostUrl);
    const signatures = linkedPost?.querySelectorAll('[data-role="memberSignature"]') || [];
    const signature = signatures[0];
    if (signature) {
      const signaturePost = signature.closest<HTMLElement>('[data-commentid]') || linkedPost!;
      collectText(
        signature.textContent || '',
        latestPostUrl,
        getPostDate(signaturePost),
        details,
        SIGNATURE_SOURCE_PRIORITY,
        'profile',
      );
      saveCollectedDetails(user, details);
    }
  }

  const sidebarDetails = profilePage.querySelectorAll('.cProfileSidebarBlock li:nth-child(3)');
  for (const sidebarDetail of sidebarDetails) {
    if (hasAllDetails(details) && !collectVisitedCities) {
      break;
    }

    collectText(
      sidebarDetail.textContent || '',
      profileUrl,
      undefined,
      details,
      INTEREST_SOURCE_PRIORITY,
      'profile',
    );
    saveCollectedDetails(user, details);
  }
  const servicesTab = profilePage.querySelector<HTMLAnchorElement>('a[href*="tab=field_core_pfield_11"]');
  if (servicesTab) {
    const tabPage = await page.load(resolveUrl(servicesTab.getAttribute('href')!, profileUrl), {priority});
    const tabDetails = tabPage.querySelector('#elProfileTabs_content');
    if (tabDetails) {
      const tabUrl = resolveUrl(servicesTab.getAttribute('href')!, profileUrl);
      collectText(
        tabDetails.textContent || '',
        tabUrl,
        undefined,
        details,
        ABOUT_SOURCE_PRIORITY,
        'profile',
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
    if (collectPostContent(postsPage, currentPageUrl, user, details, oldestPostDate, collectVisitedCities)) {
      break;
    }

    if (pageNumber === 1) {
      ({lastPage, pageTemplate, csrfKey} = getPostPages(postsPage, profileUrl));
    }
  }

  if (!details.serviceDetails || !details.personalDetails) {
    const activityUrl = `${profileUrl}/content/?all_activity=1&listResort=1`;
    const activityPage = await jsonPage.load(activityUrl, {priority});
    const lastActivityPageUrl = getLastActivityPageUrl(activityPage, profileUrl);
    const lastActivityPage = lastActivityPageUrl && lastActivityPageUrl !== activityUrl
      ? await jsonPage.load(lastActivityPageUrl, {priority})
      : activityPage;
    collectActivityContent(lastActivityPage, lastActivityPageUrl || activityUrl, user, details);
  }

  saveCollectedDetails(user, details);
  NimfomaneStorage.setEscortProp(user, 'escortDetailsTime', Date.now());
}

function startCollection(user: string, priority: number, force: boolean): Promise<void> {
  const escort = NimfomaneStorage.getEscort(user);
  clearProfileContentDates(user, escort);

  const lastDetermination = escort.escortDetailsTime;
  const visitedCitiesAreStale = escort.visitedCities === undefined;
  if (!force && !visitedCitiesAreStale && lastDetermination && Date.now() - lastDetermination <= REFRESH_INTERVAL) {
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
