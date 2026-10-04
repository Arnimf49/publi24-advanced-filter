import 'dotenv/config';
import * as cheerio from 'cheerio';
import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import {availableParallelism} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {type APIRequestContext} from 'playwright';
import {escortInfoExtractor, type PersonalDetails, type ServiceDetails} from '../../../src/nimfomane/core/escortInfoExtractor';
import {sectionsService} from '../../../src/nimfomane/core/sectionsService';
import {utils} from '../../helpers/utils';

const LISTING_PAGE_LIMIT = 4;
const MAX_POST_AGE = 3 * 365 * 24 * 60 * 60 * 1000;
const OUTPUT_DIRECTORY = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'output',
);

interface CitySection {
  city: string;
  url: string;
}

interface SectionPageJob extends CitySection {
  pageNumber: number;
}

interface EscortCandidate {
  user: string;
  profileUrl: string;
}

interface SourceRecord {
  sourceId: string;
  url: string;
  kind: string;
  text: string;
  extractedPersonalDetails: PersonalDetails | null;
  extractedServiceDetails: ServiceDetails | null;
}

interface Worker {
  api: APIRequestContext;
  limiter: RequestLimiter;
}

interface CollectedEscort {
  sources: SourceRecord[];
  errors: string[];
}

interface PageResult {
  document: cheerio.CheerioAPI;
  finalUrl: string;
}

class RequestLimiter {
  private readonly starts: number[] = [];
  private lastStartedAt = 0;

  async wait(): Promise<void> {
    const minDelay = 1800;
    const cooldown = 13500;

    while (true) {
      const now = Date.now();
      while (this.starts.length > 0 && this.starts[0] <= now - cooldown) {
        this.starts.shift();
      }

      const delayUntilNextStart = Math.max(0, minDelay - (now - this.lastStartedAt));
      const delayUntilCooldown = this.starts.length >= 3
        ? Math.max(0, this.starts[0] + cooldown - now)
        : 0;
      const delay = Math.max(delayUntilNextStart, delayUntilCooldown);
      if (delay === 0) {
        this.lastStartedAt = now;
        this.starts.push(now);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

function getMaxProfiles(args: string[]): number | undefined {
  let maxProfiles: number | undefined;

  for (let index = 0; index < args.length; index++) {
    if (args[index] !== '--max-profiles') {
      throw new Error(`Unknown argument: ${args[index]}`);
    }
    if (maxProfiles !== undefined || index + 1 >= args.length) {
      throw new Error('Usage: massDetailsExtractor.ts [--max-profiles <positive integer>]');
    }

    const value = args[++index];
    const parsed = Number(value);
    if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(parsed)) {
      throw new Error('--max-profiles must be a positive integer.');
    }
    maxProfiles = parsed;
  }

  return maxProfiles;
}

function getPageUrl(sectionUrl: string, pageNumber: number): string {
  const url = new URL(sectionUrl);
  url.pathname = `${url.pathname.replace(/\/+$/, '')}${pageNumber === 1 ? '/' : `/page/${pageNumber}/`}`;
  return url.toString();
}

function resolveForumUrl(href: string, baseUrl: string): string {
  const url = new URL(href, baseUrl);
  if (url.hostname !== 'nimfomane.com') {
    throw new Error(`Unexpected non-Nimfomane URL: ${url.toString()}`);
  }
  return url.toString();
}

function toAbsoluteForumUrl(href: string, baseUrl: string): string {
  const url = new URL(resolveForumUrl(href, baseUrl));
  url.search = '';
  url.hash = '';
  url.pathname = url.pathname.replace(/\/+$/, '') + '/';
  return url.toString();
}

function getUserFromLink(link: cheerio.Cheerio<any>, profileUrl: string): string {
  const user = link.text().trim() || link.find('img').attr('alt')?.trim();
  if (user) {
    return user;
  }

  const username = new URL(profileUrl).pathname.match(/\/profile\/([^/]+)/i)?.[1];
  if (!username) {
    throw new Error(`Could not determine profile username from ${profileUrl}`);
  }
  return decodeURIComponent(username);
}

async function loadPage(
  worker: Worker,
  url: string,
  options: {json?: boolean; allowNotFound?: boolean} = {},
): Promise<PageResult | null> {
  await worker.limiter.wait();
  const response = await worker.api.get(url, {
    timeout: 60000,
    failOnStatusCode: false,
    ...(options.json
      ? {
          headers: {
            Accept: 'application/json, text/javascript, */*; q=0.01',
            'X-Requested-With': 'XMLHttpRequest',
          },
        }
      : {}),
  });

  if (response.status() === 404 && options.allowNotFound) {
    return null;
  }
  if (!response.ok()) {
    throw new Error(`GET ${url} failed with HTTP ${response.status()} ${response.statusText()}`);
  }

  let html = await response.text();
  if (options.json) {
    let body: {rows?: unknown};
    try {
      body = JSON.parse(html) as {rows?: unknown};
    } catch (error) {
      const document = cheerio.load(html);
      if (document('[data-role="commentContent"], .ipsStreamItem').length > 0) {
        return {document, finalUrl: response.url()};
      }
      throw new Error(`Expected JSON response from ${url}: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (typeof body.rows !== 'string') {
      const document = cheerio.load(html);
      if (document('[data-role="commentContent"], .ipsStreamItem').length > 0) {
        return {document, finalUrl: response.url()};
      }
      throw new Error(`Expected an HTML "rows" field in the JSON response from ${url}`);
    }
    html = body.rows;
  }

  return {
    document: cheerio.load(html),
    finalUrl: response.url(),
  };
}

function scrapeSectionPage(
  page: PageResult,
  job: SectionPageJob,
): EscortCandidate[] {
  const candidates: EscortCandidate[] = [];
  const $ = page.document;

  $('.ipsDataList.cForumTopicTable [data-rowid] .ipsDataItem_meta a').each((_, element) => {
    const link = $(element);
    if (link.find('[color]').attr('color')?.toLowerCase() !== '#ff0000') {
      return;
    }

    const href = link.attr('href');
    if (!href) {
      return;
    }

    try {
      const profileUrl = toAbsoluteForumUrl(href, page.finalUrl);
      if (!/\/forum\/profile\/[^/]+\/$/i.test(new URL(profileUrl).pathname)) {
        return;
      }

      candidates.push({
        user: getUserFromLink(link, profileUrl),
        profileUrl,
      });
    } catch (error) {
      console.warn(`Skipping marked profile link in ${job.url}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  return candidates;
}

function makePageJobs(sections: CitySection[]): SectionPageJob[] {
  return sections.flatMap(section =>
    Array.from({length: LISTING_PAGE_LIMIT}, (_, index) => ({
      ...section,
      pageNumber: index + 1,
    })),
  );
}

async function runJobs<T>(
  jobs: T[],
  workers: Worker[],
  execute: (job: T, worker: Worker) => Promise<void>,
  shouldStop: () => boolean = () => false,
): Promise<void> {
  let nextJob = 0;

  await Promise.all(workers.map(async worker => {
    while (nextJob < jobs.length && !shouldStop()) {
      const job = jobs[nextJob++];
      await execute(job, worker);
    }
  }));
}

function normalizedText(value: string): string {
  return value.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
}

function getSourceId(kind: string, url: string): string {
  const sourceUrl = new URL(url);
  sourceUrl.searchParams.delete('csrfKey');
  sourceUrl.hash = '';

  return createHash('sha256')
    .update(`${kind}\n${sourceUrl.toString()}`)
    .digest('hex')
    .slice(0, 16);
}

function addSource(
  sources: Map<string, SourceRecord>,
  url: string,
  kind: string,
  text: string,
): void {
  const sourceText = normalizedText(text);
  if (!sourceText) {
    return;
  }

  if ([...sources.values()].some(source => source.text === sourceText)) {
    return;
  }

  const key = `${kind}\n${url}`;
  const existing = sources.get(key);
  if (existing) {
    if (!existing.text.includes(sourceText)) {
      existing.text = `${existing.text}\n\n${sourceText}`;
      existing.extractedPersonalDetails = escortInfoExtractor.extractPersonalDetails(existing.text);
      existing.extractedServiceDetails = escortInfoExtractor.extractServiceDetails(existing.text);
    }
    return;
  }

  sources.set(key, {
    sourceId: getSourceId(kind, url),
    url,
    kind,
    text: sourceText,
    extractedPersonalDetails: escortInfoExtractor.extractPersonalDetails(sourceText),
    extractedServiceDetails: escortInfoExtractor.extractServiceDetails(sourceText),
  });
}

function getCsrfKey(document: cheerio.CheerioAPI): string | undefined {
  return document('[name="csrfKey"]').attr('value');
}

function getCommentSourceUrl(element: cheerio.Cheerio<any>, fallbackUrl: string): string {
  const href = element.closest('.cPost, .ipsComment')
    .find('.ipsType_sectionHead [href]')
    .last()
    .attr('href');
  return href ? resolveForumUrl(href, fallbackUrl) : fallbackUrl;
}

function addCsrfKey(urlValue: string, csrfKey?: string): string {
  if (!csrfKey) {
    return urlValue;
  }

  const url = new URL(urlValue);
  url.searchParams.set('csrfKey', csrfKey);
  return url.toString();
}

function getPostPages(document: cheerio.CheerioAPI, profileUrl: string): {
  lastPage: number;
  templateUrl?: string;
} {
  const links = document('.ipsPagination a, .ipsPagination_page a').toArray();
  const pageNumbers = links.map(link => {
    const element = document(link);
    const value = element.attr('data-page')
      || element.closest('[data-page]').attr('data-page')
      || element.attr('href')?.match(/\/page\/(\d+)(?:\/|$)/)?.[1];
    const number = Number.parseInt(value || '', 10);
    return Number.isNaN(number) ? undefined : number;
  }).filter((value): value is number => value !== undefined);

  const lastLink = document('.ipsPagination_last a').first();
  const pageTwoLink = links.map(link => document(link))
    .find(link => link.attr('data-page') === '2'
      || link.closest('[data-page]').attr('data-page') === '2'
      || /\/page\/2(?:\/|$)/.test(link.attr('href') || ''));
  const templateHref = pageTwoLink?.attr('href') || lastLink.attr('href');

  return {
    lastPage: Math.max(1, ...pageNumbers),
    templateUrl: templateHref ? new URL(templateHref, profileUrl).toString() : undefined,
  };
}

function getProfilePageUrl(profileUrl: string, pageNumber: number, templateUrl?: string, csrfKey?: string): string {
  const url = templateUrl
    ? new URL(templateUrl)
    : new URL(`${profileUrl.replace(/\/$/, '')}/content/page/${pageNumber}/?type=forums_topic_post&listResort=1`);
  if (/\/page\/\d+(?:\/|$)/.test(url.pathname)) {
    url.pathname = url.pathname.replace(/\/page\/\d+(?=\/|$)/, `/page/${pageNumber}`);
  } else {
    url.pathname = `${url.pathname.replace(/\/$/, '')}/page/${pageNumber}/`;
  }
  url.searchParams.set('listResort', '1');
  if (csrfKey) {
    url.searchParams.set('csrfKey', csrfKey);
  }
  return url.toString();
}

function getAggregateDetails(sources: SourceRecord[]): {
  personalDetails: PersonalDetails;
  personalDetailsSourceUrl?: string;
  serviceDetails: ServiceDetails | null;
  serviceDetailsSourceUrl?: string;
} {
  const personalDetails: PersonalDetails = {};
  const personalSources = sources
    .filter(source => source.extractedPersonalDetails)
    .sort((left, right) => getPersonalPriority(right.kind) - getPersonalPriority(left.kind));
  for (const source of personalSources) {
    for (const [key, value] of Object.entries(source.extractedPersonalDetails || {})) {
      const personalKey = key as keyof PersonalDetails;
      if (personalDetails[personalKey] === undefined && typeof value === 'number') {
        personalDetails[personalKey] = value;
      }
    }
  }

  const serviceSources = sources
    .filter(source => source.extractedServiceDetails)
    .sort((left, right) => getServicePriority(right.kind) - getServicePriority(left.kind));
  let serviceDetails: ServiceDetails | null = null;
  for (const source of serviceSources) {
    const incoming = source.extractedServiceDetails;
    if (!incoming) {
      continue;
    }
    if (!serviceDetails) {
      serviceDetails = structuredClone(incoming);
      continue;
    }

    serviceDetails = mergeServiceDetails(serviceDetails, incoming);
  }

  return {
    personalDetails,
    personalDetailsSourceUrl: personalSources[0]?.url,
    serviceDetails,
    serviceDetailsSourceUrl: serviceSources[0]?.url,
  };
}

function getPersonalPriority(kind: string): number {
  switch (kind) {
    case 'post-signature':
      return 4;
    case 'post':
    case 'activity':
      return 3;
    case 'profile-interest':
      return 2;
    case 'profile-services':
      return 1;
    default:
      return 0;
  }
}

function getServicePriority(kind: string): number {
  switch (kind) {
    case 'post-signature':
      return 6;
    case 'post':
    case 'activity':
      return 5;
    case 'profile-interest':
      return 2;
    case 'profile-services':
      return 1;
    default:
      return 0;
  }
}

function mergeServiceDetails(existing: ServiceDetails, incoming: ServiceDetails): ServiceDetails {
  const merged: ServiceDetails = {
    ...incoming,
    ...existing,
    baseRates: {...incoming.baseRates, ...existing.baseRates},
  };

  if (incoming.outcallRates || existing.outcallRates) {
    merged.outcallRates = {...incoming.outcallRates, ...existing.outcallRates};
  }
  if (incoming.dominationRates || existing.dominationRates) {
    merged.dominationRates = {...incoming.dominationRates, ...existing.dominationRates};
  }
  if (incoming.services || existing.services) {
    merged.services = {...incoming.services, ...existing.services};
  }
  if (incoming.rateOverrides || existing.rateOverrides) {
    const overrides = new Map<string, NonNullable<ServiceDetails['rateOverrides']>[number]>();
    for (const override of [...(incoming.rateOverrides || []), ...(existing.rateOverrides || [])]) {
      overrides.set(override.after, override);
    }
    merged.rateOverrides = [...overrides.values()];
  }
  if (incoming.schedule || existing.schedule) {
    const schedules = new Map<string, NonNullable<ServiceDetails['schedule']>[number]>();
    for (const schedule of [...(incoming.schedule || []), ...(existing.schedule || [])]) {
      schedules.set(JSON.stringify(schedule), schedule);
    }
    merged.schedule = [...schedules.values()];
  }

  return merged;
}

async function collectEscort(
  worker: Worker,
  candidate: EscortCandidate,
): Promise<CollectedEscort> {
  const sources = new Map<string, SourceRecord>();
  const errors: string[] = [];
  const profilePage = await loadPage(worker, candidate.profileUrl);
  if (!profilePage) {
    throw new Error(`Profile page was not found: ${candidate.profileUrl}`);
  }

  const profileDocument = profilePage.document;
  const sidebarDetails = profileDocument('.cProfileSidebarBlock li:nth-child(3)');
  sidebarDetails.each((_, element) => {
    addSource(sources, candidate.profileUrl, 'profile-interest', profileDocument(element).text());
  });

  const servicesTab = profileDocument('a[href*="tab=field_core_pfield_11"]').first().attr('href');
  if (servicesTab) {
    const tabUrl = resolveForumUrl(servicesTab, candidate.profileUrl);
    try {
      const tabPage = await loadPage(worker, tabUrl);
      if (tabPage) {
        addSource(
          sources,
          tabUrl,
          'profile-services',
          tabPage.document('#elProfileTabs_content').text(),
        );
      }
    } catch (error) {
      errors.push(`Could not load services tab ${tabUrl}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const latestPostUrl = profileDocument(
    '.ipsStreamItem_title [href][data-linktype="link"]',
  ).first().attr('href');
  if (latestPostUrl) {
    const signatureUrl = resolveForumUrl(latestPostUrl, candidate.profileUrl);
    try {
      const signaturePage = await loadPage(worker, signatureUrl);
      if (signaturePage) {
        const commentId = new URL(signatureUrl).searchParams.get('comment');
        const comment = commentId
          ? signaturePage.document(`[data-commentid="${commentId}"]`)
          : signaturePage.document('[data-commentid]').first();
        addSource(
          sources,
          signatureUrl,
          'post-signature',
          comment.find('[data-role="memberSignature"]').first().text(),
        );
      }
    } catch (error) {
      errors.push(`Could not load latest signature ${signatureUrl}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const csrfKey = getCsrfKey(profileDocument);
  const firstPostsUrl = addCsrfKey(
    `${candidate.profileUrl.replace(/\/$/, '')}/content/?type=forums_topic_post`,
    csrfKey,
  );
  let postsPage: PageResult | null = null;
  try {
    postsPage = await loadPage(worker, firstPostsUrl, {json: true});
  } catch (error) {
    errors.push(`Could not load post history ${firstPostsUrl}: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (postsPage) {
    let {lastPage, templateUrl} = getPostPages(postsPage.document, candidate.profileUrl);
    const oldestPostDate = Date.now() - MAX_POST_AGE;
    let foundCompletePostDetails = false;

    for (let pageNumber = 1; pageNumber <= lastPage; pageNumber++) {
      if (pageNumber > 1) {
        const pageUrl = getProfilePageUrl(candidate.profileUrl, pageNumber, templateUrl, csrfKey);
        try {
          postsPage = await loadPage(worker, pageUrl, {json: true, allowNotFound: true});
        } catch (error) {
          errors.push(`Could not load post history page ${pageUrl}: ${error instanceof Error ? error.message : String(error)}`);
          break;
        }
        if (!postsPage) {
          break;
        }
      }

      const currentPageUrl = pageNumber === 1
        ? firstPostsUrl
        : getProfilePageUrl(candidate.profileUrl, pageNumber, templateUrl, csrfKey);
      let reachedOldPost = false;
      postsPage.document('[data-role="commentContent"]').each((_, element) => {
        const content = postsPage!.document(element);
        const post = content.closest('.cPost, .ipsComment');
        const dateValue = post.find('time').first().attr('datetime');
        const postDate = dateValue ? Date.parse(dateValue) : undefined;
        if (postDate !== undefined && !Number.isNaN(postDate) && postDate < oldestPostDate) {
          reachedOldPost = true;
          return false;
        }

        content.find('.ipsQuote').remove();
        const sourceUrl = getCommentSourceUrl(content, currentPageUrl);
        const text = content.text();
        addSource(sources, sourceUrl, 'post', text);
        const extractedService = escortInfoExtractor.extractServiceDetails(text);
        if (extractedService) {
          const combined = getAggregateDetails([...sources.values()]);
          foundCompletePostDetails = combined.personalDetails.age !== undefined
            && combined.personalDetails.height !== undefined
            && combined.personalDetails.weight !== undefined;
        }
        return true;
      });

      if (reachedOldPost || foundCompletePostDetails) {
        break;
      }
      if (pageNumber === 1) {
        ({lastPage, templateUrl} = getPostPages(postsPage.document, candidate.profileUrl));
      }
    }
  }

  const partial = getAggregateDetails([...sources.values()]);
  if (!partial.serviceDetails || Object.keys(partial.personalDetails).length === 0) {
    const activityUrl = addCsrfKey(
      `${candidate.profileUrl.replace(/\/$/, '')}/content/?all_activity=1&listResort=1`,
      csrfKey,
    );
    try {
      const activityPage = await loadPage(worker, activityUrl, {json: true});
      if (activityPage) {
        const lastActivityLink = activityPage.document(
          '.ipsPagination_last a, .ipsPagination_page:last-child a',
        ).last().attr('href');
        const lastActivityUrl = lastActivityLink
          ? addCsrfKey(resolveForumUrl(lastActivityLink, activityUrl), csrfKey)
          : activityUrl;
        const lastActivityPage = lastActivityUrl === activityUrl
          ? activityPage
          : await loadPage(worker, lastActivityUrl, {json: true});

        if (lastActivityPage) {
          lastActivityPage.document('.ipsStreamItem').each((_, element) => {
            const item = lastActivityPage.document(element);
            const snippet = item.find('.ipsStreamItem_snippet').first();
            const href = item.find('.ipsStreamItem_title a[href]').first().attr('href');
            const sourceUrl = href ? resolveForumUrl(href, lastActivityUrl) : lastActivityUrl;
            addSource(sources, sourceUrl, 'activity', snippet.text());
          });
        }
      }
    } catch (error) {
      errors.push(`Could not load activity history ${activityUrl}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const sourceRecords = [...sources.values()].filter(source =>
    source.extractedPersonalDetails !== null
    || source.extractedServiceDetails !== null,
  );
  return {
    sources: sourceRecords,
    errors,
  };
}

function getProfileOutputPath(candidate: EscortCandidate): string {
  const safeName = candidate.user.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .toLowerCase() || 'profile';
  const stableId = createHash('sha256')
    .update(new URL(candidate.profileUrl).pathname.toLowerCase())
    .digest('hex')
    .slice(0, 8);
  return path.join(OUTPUT_DIRECTORY, `${safeName}-${stableId}.json`);
}

async function run(maxProfiles = getMaxProfiles(process.argv.slice(2))): Promise<void> {
  const sections = sectionsService.getCitySections();
  const workers = Math.min(
    availableParallelism() * 2,
    maxProfiles ?? Number.MAX_SAFE_INTEGER,
  );
  const clients: Worker[] = [];
  const listingErrors: string[] = [];
  const candidates = new Map<string, EscortCandidate>();
  let profileOccurrences = 0;
  let listingPagesScanned = 0;
  const proxyLimiters = new Map<number, RequestLimiter>();

  await fs.mkdir(OUTPUT_DIRECTORY, {recursive: true});

  try {
    for (let index = 0; index < workers; index++) {
      const requestClient = await utils.makeApiRequestContext(true);
      if (requestClient.proxyIndex === null) {
        throw new Error('A proxy is required for every API request client.');
      }
      let limiter = proxyLimiters.get(requestClient.proxyIndex);
      if (!limiter) {
        limiter = new RequestLimiter();
        proxyLimiters.set(requestClient.proxyIndex, limiter);
      }
      clients.push({
        api: requestClient.context,
        limiter,
      });
    }

    const pageJobs = makePageJobs(sections);
    console.info(`Scanning up to ${pageJobs.length} listing pages across ${sections.length} sections using ${workers} proxy clients.`);
    await runJobs(pageJobs, clients, async (job, worker) => {
      const url = getPageUrl(job.url, job.pageNumber);
      listingPagesScanned++;
      try {
        const page = await loadPage(worker, url, {allowNotFound: true});
        if (!page) {
          console.info(`No page ${job.pageNumber} for ${job.city}: ${job.url}`);
          return;
        }

        for (const candidate of scrapeSectionPage(page, job)) {
          profileOccurrences++;
          const key = new URL(candidate.profileUrl).pathname.toLowerCase();
          if (!candidates.has(key) && (maxProfiles === undefined || candidates.size < maxProfiles)) {
            candidates.set(key, candidate);
          }
        }
        console.info(`Scanned ${job.city} page ${job.pageNumber}: ${candidates.size} unique profiles found.`);
      } catch (error) {
        const message = `Failed to scan ${job.city} page ${job.pageNumber} (${url}): ${error instanceof Error ? error.message : String(error)}`;
        listingErrors.push(message);
        console.error(message);
      }
    }, () => maxProfiles !== undefined && candidates.size >= maxProfiles);

    console.info(`Collecting details for ${candidates.size} unique profiles.`);
    const allCandidates = [...candidates.values()]
      .sort((left, right) => left.profileUrl.localeCompare(right.profileUrl));
    const candidateJobs = allCandidates;
    if (maxProfiles !== undefined && candidates.size >= maxProfiles) {
      console.info(`Stopped discovery after finding ${candidates.size} unique profiles (limit ${maxProfiles}).`);
    }
    let completed = 0;

    await runJobs(candidateJobs, clients, async (candidate, worker) => {
      let result: CollectedEscort;
      try {
        result = await collectEscort(worker, candidate);
      } catch (error) {
        result = {
          sources: [],
          errors: [error instanceof Error ? error.message : String(error)],
        };
      }

      const profileFile = getProfileOutputPath(candidate);
      await fs.writeFile(profileFile, `${JSON.stringify({
        profileName: candidate.user,
        profileUrl: candidate.profileUrl,
        sources: result.sources,
      }, null, 2)}\n`, 'utf8');
      if (result.errors.length > 0) {
        console.error(`Errors collecting ${candidate.user}: ${result.errors.join('; ')}`);
      }
      completed++;
      console.info(
        `Saved ${completed}/${candidateJobs.length}: ${candidate.user} (${result.sources.length} extracted sources).`,
      );
    });

    console.info(
      `Finished: ${listingPagesScanned}/${pageJobs.length} listing pages, ${profileOccurrences} marked profile references, ${candidates.size} unique profiles, ${listingErrors.length} listing errors.`,
    );
  } finally {
    await Promise.all(clients.map(client => client.api.dispose()));
  }
}

export const extractor = {
  run,
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  extractor.run().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
