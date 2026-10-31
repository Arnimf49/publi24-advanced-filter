import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import type {Request, Response} from '@playwright/test';
import {test} from '../../helpers/fixture';
import {utilsNimfomane} from '../../helpers/utilsNimfomane';

/**
 * One-off diagnostic probe. It is skipped unless RATE_LIMIT_PROBE=1.
 *
 *   RATE_LIMIT_PROBE=1 SKIP_GLOBAL_SETUP=1 \
 *     npx playwright test tests/nimfomane/utility/imagesModalRateLimitProbe.spec.ts --project=nimfomane
 *
 * It opens the images modal for a profile, keeps scrolling until a 429 is
 * observed (or the probe budget is exhausted), and writes every request/response
 * with timings and headers to test-results/rate-limit-probe/.
 */

const PROFILE_URL = 'https://nimfomane.com/forum/profile/352467-mina24/';
const PROFILE_CONTENT_RE = /\/forum\/profile\/352467-mina24\/content/;
const OUTPUT_DIR = path.resolve('test-results/rate-limit-probe');
const DEFAULT_MAX_DURATION_MS = 10 * 60 * 1000;
const MAX_DURATION_MS = Number.parseInt(process.env.PROBE_MAX_MS ?? '', 10) || DEFAULT_MAX_DURATION_MS;
const MAX_CONTENT_REQUESTS = Number.parseInt(process.env.PROBE_MAX_CONTENT_REQUESTS ?? '', 10) || 400;

interface ProbeRecord {
  seq: number;
  phase: 'pre-modal' | 'modal';
  startedAt: number;
  method: string;
  url: string;
  host: string;
  resourceType: string;
  isJson: boolean;
  isProfileContent: boolean;
  pageNumber: number | null;
  requestHeaders: Record<string, string>;
  status?: number;
  responseAt?: number;
  durationMs?: number;
  responseHeaders?: Record<string, string>;
  bodySnippet?: string;
  bodyReadError?: string;
  failure?: string;
}

interface ClientLimiterConfig {
  regularHtml: {throttleAfter: number; cooldown: number; delayBetween: number};
  jsonPartial: {throttleAfter: number; cooldown: number; delayBetween: number};
}

const CLIENT_LIMITER: ClientLimiterConfig = {
  regularHtml: {throttleAfter: 3, cooldown: 13500, delayBetween: 1800},
  jsonPartial: {throttleAfter: 7, cooldown: 6000, delayBetween: 500},
};

function filterHeaders(headers: Record<string, string>): Record<string, string> {
  const interesting = [
    'accept',
    'x-requested-with',
    'content-type',
    'retry-after',
    'x-ratelimit-limit',
    'x-ratelimit-remaining',
    'x-ratelimit-reset',
    'x-rate-limit-limit',
    'x-rate-limit-remaining',
    'x-rate-limit-reset',
    'cf-ray',
    'cf-cache-status',
    'server',
    'date',
    'x-powered-by',
  ];
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (interesting.includes(key.toLowerCase())) {
      result[key.toLowerCase()] = value;
    }
  }
  return result;
}

function readBodyWithTimeout(response: Response, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Response body read timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    response.text().then(
      text => {
        clearTimeout(timer);
        resolve(text);
      },
      error => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function getPageNumber(url: string): number | null {
  const pageMatch = url.match(/\/content\/page\/(\d+)/);
  if (pageMatch) {
    return Number.parseInt(pageMatch[1], 10);
  }
  if (PROFILE_CONTENT_RE.test(url)) {
    return 1;
  }
  return null;
}

function median(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[middle - 1] + sorted[middle]) / 2)
    : sorted[middle];
}

function percentile(values: number[], fraction: number): number | null {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * fraction));
  return sorted[index];
}

function maxStartedInWindow(
  records: ProbeRecord[],
  windowMs: number,
  predicate: (record: ProbeRecord) => boolean = () => true,
): number {
  const starts = records
    .filter(predicate)
    .map(record => record.startedAt)
    .sort((first, second) => first - second);
  let maximum = 0;
  let windowStart = 0;
  for (let index = 0; index < starts.length; index++) {
    while (starts[windowStart] < starts[index] - windowMs) {
      windowStart += 1;
    }
    maximum = Math.max(maximum, index - windowStart + 1);
  }
  return maximum;
}

function countStartedBetween(
  records: ProbeRecord[],
  from: number,
  to: number,
  predicate: (record: ProbeRecord) => boolean,
): number {
  return records.filter(record => record.startedAt >= from && record.startedAt <= to && predicate(record)).length;
}

function summarize(records: ProbeRecord[], meta: Record<string, unknown>) {
  const modalRecords = records.filter(record => record.phase === 'modal');
  const contentRecords = modalRecords.filter(record => record.isProfileContent);
  const imageRecords = modalRecords.filter(record => record.resourceType === 'image');
  const nimfomaneRecords = modalRecords.filter(record => record.host === 'nimfomane.com');

  const byStatus: Record<string, number> = {};
  const byResourceType: Record<string, number> = {};
  for (const record of modalRecords) {
    const statusKey = record.failure ? `failed:${record.failure}` : String(record.status ?? 'pending');
    byStatus[statusKey] = (byStatus[statusKey] ?? 0) + 1;
    byResourceType[record.resourceType] = (byResourceType[record.resourceType] ?? 0) + 1;
  }

  const rateLimited = modalRecords
    .filter(record => record.status === 429)
    .sort((a, b) => (a.responseAt ?? 0) - (b.responseAt ?? 0));
  const first429 = rateLimited[0];
  const first429At = first429?.responseAt ?? null;

  const contentIntervals: number[] = [];
  for (let index = 1; index < contentRecords.length; index++) {
    contentIntervals.push(contentRecords[index].startedAt - contentRecords[index - 1].startedAt);
  }

  const contentAfter429 = first429At === null
    ? []
    : contentRecords
      .filter(record => record.startedAt > first429At)
      .map(record => ({
        startedAt: record.startedAt - first429At,
        status: record.status ?? null,
        pageNumber: record.pageNumber,
      }));

  const is429 = (record: ProbeRecord) => record.status === 429;

  const first429Context = first429At === null
    ? null
    : {
        responseAt: first429At,
        url: first429?.url,
        resourceType: first429?.resourceType,
        responseHeaders: first429?.responseHeaders,
        bodySnippet: first429?.bodySnippet,
        modalAgeMs: first429At - Number(meta.modalOpenedAt),
        startsBefore429: {
          allRequests: {
            last1s: countStartedBetween(modalRecords, first429At - 1000, first429At, () => true),
            last5s: countStartedBetween(modalRecords, first429At - 5000, first429At, () => true),
            last10s: countStartedBetween(modalRecords, first429At - 10000, first429At, () => true),
            last30s: countStartedBetween(modalRecords, first429At - 30000, first429At, () => true),
          },
          nimfomaneRequests: {
            last1s: countStartedBetween(nimfomaneRecords, first429At - 1000, first429At, () => true),
            last5s: countStartedBetween(nimfomaneRecords, first429At - 5000, first429At, () => true),
            last10s: countStartedBetween(nimfomaneRecords, first429At - 10000, first429At, () => true),
            last30s: countStartedBetween(nimfomaneRecords, first429At - 30000, first429At, () => true),
          },
          contentRequests: {
            last1s: countStartedBetween(contentRecords, first429At - 1000, first429At, () => true),
            last5s: countStartedBetween(contentRecords, first429At - 5000, first429At, () => true),
            last10s: countStartedBetween(contentRecords, first429At - 10000, first429At, () => true),
            last30s: countStartedBetween(contentRecords, first429At - 30000, first429At, () => true),
          },
          imageRequests: {
            last1s: countStartedBetween(imageRecords, first429At - 1000, first429At, () => true),
            last5s: countStartedBetween(imageRecords, first429At - 5000, first429At, () => true),
            last10s: countStartedBetween(imageRecords, first429At - 10000, first429At, () => true),
            last30s: countStartedBetween(imageRecords, first429At - 30000, first429At, () => true),
          },
        },
        contentStartsLast5s: contentRecords
          .filter(record => record.startedAt >= first429At - 5000 && record.startedAt <= first429At)
          .map(record => ({
            offsetMs: record.startedAt - first429At,
            pageNumber: record.pageNumber,
            status: record.status ?? null,
          })),
        imageStartsLast5s: imageRecords
          .filter(record => record.startedAt >= first429At - 5000 && record.startedAt <= first429At)
          .map(record => ({
            offsetMs: record.startedAt - first429At,
            host: record.host,
            status: record.status ?? null,
            url: record.url.slice(0, 160),
          })),
      };

  return {
    generatedAt: new Date().toISOString(),
    meta,
    maxRequestsPerWindow: {
      all: {
        last1s: maxStartedInWindow(modalRecords, 1000),
        last5s: maxStartedInWindow(modalRecords, 5000),
        last10s: maxStartedInWindow(modalRecords, 10000),
        last30s: maxStartedInWindow(modalRecords, 30000),
        last60s: maxStartedInWindow(modalRecords, 60000),
      },
      images: {
        last1s: maxStartedInWindow(modalRecords, 1000, record => record.resourceType === 'image'),
        last5s: maxStartedInWindow(modalRecords, 5000, record => record.resourceType === 'image'),
        last10s: maxStartedInWindow(modalRecords, 10000, record => record.resourceType === 'image'),
        last30s: maxStartedInWindow(modalRecords, 30000, record => record.resourceType === 'image'),
        last60s: maxStartedInWindow(modalRecords, 60000, record => record.resourceType === 'image'),
      },
      content: {
        last1s: maxStartedInWindow(modalRecords, 1000, record => record.isProfileContent),
        last5s: maxStartedInWindow(modalRecords, 5000, record => record.isProfileContent),
        last10s: maxStartedInWindow(modalRecords, 10000, record => record.isProfileContent),
        last30s: maxStartedInWindow(modalRecords, 30000, record => record.isProfileContent),
        last60s: maxStartedInWindow(modalRecords, 60000, record => record.isProfileContent),
      },
    },
    totals: {
      allRecords: records.length,
      modalRecords: modalRecords.length,
      nimfomaneRecords: nimfomaneRecords.length,
      contentRecords: contentRecords.length,
      imageRecords: imageRecords.length,
      distinctContentPages: new Set(
        contentRecords.map(record => record.pageNumber).filter((pageNumber): pageNumber is number => pageNumber !== null),
      ).size,
      byStatus,
      byResourceType,
    },
    contentRequestIntervalsMs: {
      min: contentIntervals.length ? Math.min(...contentIntervals) : null,
      max: contentIntervals.length ? Math.max(...contentIntervals) : null,
      median: median(contentIntervals),
      p90: percentile(contentIntervals, 0.9),
      values: contentIntervals,
    },
    rateLimit: {
      first429At,
      first429Url: first429?.url ?? null,
      first429: first429Context,
      rateLimitedCount: rateLimited.length,
      rateLimitedByResourceType: rateLimited.reduce<Record<string, number>>((accumulator, record) => {
        accumulator[record.resourceType] = (accumulator[record.resourceType] ?? 0) + 1;
        return accumulator;
      }, {}),
      rateLimitedByHost: rateLimited.reduce<Record<string, number>>((accumulator, record) => {
        accumulator[record.host] = (accumulator[record.host] ?? 0) + 1;
        return accumulator;
      }, {}),
      contentStartsAfterFirst429: contentAfter429,
      all429s: rateLimited.map(record => ({
        responseAt: record.responseAt,
        url: record.url,
        resourceType: record.resourceType,
        status: record.status,
        retryAfter: record.responseHeaders?.['retry-after'] ?? null,
        bodySnippet: record.bodySnippet,
      })),
      isAnyRateLimit: rateLimited.length > 0,
      is429: rateLimited.some(is429),
    },
  };
}

test.skip(
  process.env.RATE_LIMIT_PROBE !== '1',
  'One-off rate limit probe. Set RATE_LIMIT_PROBE=1 to run it.',
);

test('probe nimfomane 429 behaviour while scrolling the images modal', async ({page, context}, testInfo) => {
  testInfo.setTimeout(MAX_DURATION_MS + 3 * 60 * 1000);

  const records: ProbeRecord[] = [];
  const byRequest = new Map<Request, ProbeRecord>();
  const bodyReads: Promise<void>[] = [];
  let seq = 0;
  let modalOpenedAt = 0;

  page.on('request', (request: Request) => {
    const url = request.url();
    if (!url.startsWith('http')) {
      return;
    }

    let host = 'unknown';
    try {
      host = new URL(url).hostname;
    } catch (error) {
      console.warn(`[probe] Could not parse request URL ${url}: ${error instanceof Error ? error.message : String(error)}`);
    }

    const headers = request.headers();
    const record: ProbeRecord = {
      seq: ++seq,
      phase: modalOpenedAt > 0 ? 'modal' : 'pre-modal',
      startedAt: Date.now(),
      method: request.method(),
      url,
      host,
      resourceType: request.resourceType(),
      isJson: (headers['x-requested-with'] ?? '').toLowerCase().includes('xmlhttprequest')
        || (headers['accept'] ?? '').includes('application/json'),
      isProfileContent: PROFILE_CONTENT_RE.test(url),
      pageNumber: getPageNumber(url),
      requestHeaders: filterHeaders(headers),
    };

    byRequest.set(request, record);
    records.push(record);
  });

  page.on('response', (response: Response) => {
    const record = byRequest.get(response.request());
    if (!record) {
      return;
    }

    record.status = response.status();
    record.responseAt = Date.now();
    record.durationMs = record.responseAt - record.startedAt;
    record.responseHeaders = filterHeaders(response.headers());

    if (record.status >= 400) {
      const bodyRead = readBodyWithTimeout(response, 3000)
        .then(body => {
          record.bodySnippet = body.slice(0, 1200);
        })
        .catch((error: unknown) => {
          record.bodyReadError = error instanceof Error ? error.message : String(error);
        });
      bodyReads.push(bodyRead);
    }

    if (record.isProfileContent) {
      console.log(
        `[probe] content page=${record.pageNumber ?? '?'} status=${record.status} ` +
        `duration=${record.durationMs}ms url=${record.url}`,
      );
    }
    if (record.status === 429) {
      console.log(`\x1b[31m[probe] 429 ${record.resourceType} ${record.url}\x1b[0m`);
      console.log('[probe] 429 headers', record.responseHeaders);
    }
  });

  page.on('requestfailed', (request: Request) => {
    const record = byRequest.get(request);
    if (!record) {
      return;
    }
    record.failure = request.failure()?.errorText ?? 'unknown failure';
    record.responseAt = Date.now();
    record.durationMs = record.responseAt - record.startedAt;
    console.log(`[probe] failed ${record.resourceType} ${record.url}: ${record.failure}`);
  });

  const proxyServers = (process.env.PROXY_SERVERS ?? '')
    .split(',')
    .map(server => server.trim())
    .filter(server => server.length > 0);
  let proxyCounter: number | null = null;
  try {
    proxyCounter = Number.parseInt(fs.readFileSync('tests/data/.proxy-counter', 'utf-8').trim(), 10) || 0;
  } catch (error) {
    console.warn(`[probe] Could not read proxy counter: ${error instanceof Error ? error.message : String(error)}`);
  }
  const proxyIndex = proxyCounter === null || proxyServers.length === 0
    ? null
    : (proxyCounter - 1 + proxyServers.length) % proxyServers.length;

  console.log('[probe] opening profile', PROFILE_URL);
  console.log('[probe] proxy', proxyIndex === null ? 'none' : `${proxyIndex}: ${proxyServers[proxyIndex]}`);
  console.log('[probe] client limiter', JSON.stringify(CLIENT_LIMITER));

  await utilsNimfomane.open(page, {url: PROFILE_URL});

  const photosButton = page.locator('[data-wwid="all-photos-button"]');
  await photosButton.waitFor({state: 'visible', timeout: 30000});

  await photosButton.click();
  modalOpenedAt = Date.now();

  await page.locator('[data-wwid="escort-images"]').waitFor({state: 'visible', timeout: 30000});
  await page.locator('[data-wwid="escort-images"] [data-wwid="escort-image"] img').first()
    .waitFor({state: 'visible', timeout: 30000});

  const startedAt = Date.now();
  let lastReportAt = startedAt;
  let ended = false;
  let sessionEnd = 'budget-exhausted';
  let lastState: Record<string, unknown> | null = null;
  let loggedScroller = false;

  while (Date.now() - startedAt < MAX_DURATION_MS) {
    lastState = await page.evaluate(() => {
      const root = document.querySelector<HTMLElement>('[data-wwid="escort-images"]');
      if (!root) {
        return {missing: true};
      }

      // The actual scroll parent is the modal container (Modal uses
      // overflow-y: scroll), which is an ancestor of the images root. Walk up
      // to the document as well as down into the root to find every scroller.
      const candidates = new Set<HTMLElement>();
      let ancestor: HTMLElement | null = root;
      while (ancestor) {
        candidates.add(ancestor);
        ancestor = ancestor.parentElement;
      }
      for (const element of root.querySelectorAll<HTMLElement>('*')) {
        candidates.add(element);
      }

      const scrollers = [...candidates].filter(element => {
        const style = getComputedStyle(element);
        return element.scrollHeight > element.clientHeight + 20
          && (style.overflowY === 'auto' || style.overflowY === 'scroll');
      });
      scrollers.sort((first, second) => second.scrollHeight - first.scrollHeight);
      const scroller = scrollers[0];
      const previousScrollTop = scroller?.scrollTop ?? null;
      if (scroller) {
        scroller.scrollTo({top: scroller.scrollHeight, behavior: 'instant'});
      }

      return {
        missing: false,
        scrollerFound: !!scroller,
        scrollerTag: scroller ? `${scroller.tagName.toLowerCase()}[data-wwid="${scroller.getAttribute('data-wwid') ?? ''}"]` : null,
        scrollHeight: scroller?.scrollHeight ?? null,
        clientHeight: scroller?.clientHeight ?? null,
        previousScrollTop,
        scrollTop: scroller?.scrollTop ?? null,
        images: root.querySelectorAll('[data-wwid="escort-image"]').length,
        loading: !!root.querySelector('[data-wwid="loader"]'),
        error: root.querySelector('[data-wwid="escort-images-error"]')?.textContent?.trim() ?? null,
        ended: !!root.querySelector('[data-wwid="escort-images-end"]'),
      };
    });

    if (!loggedScroller) {
      loggedScroller = true;
      console.log('[probe] scroller', JSON.stringify({
        found: lastState.scrollerFound,
        tag: lastState.scrollerTag,
        scrollHeight: lastState.scrollHeight,
        clientHeight: lastState.clientHeight,
        previousScrollTop: lastState.previousScrollTop,
        scrollTop: lastState.scrollTop,
      }));
    }

    if (lastState.missing) {
      sessionEnd = 'modal-missing';
      break;
    }

    const observed429 = records
      .filter(record => record.phase === 'modal' && record.status === 429)
      .sort((first, second) => (first.responseAt ?? 0) - (second.responseAt ?? 0))[0];
    if (observed429) {
      sessionEnd = '429-observed';
      break;
    }

    if (lastState.error) {
      sessionEnd = 'ui-error';
      break;
    }

    if (lastState.ended) {
      ended = true;
      sessionEnd = 'end-of-images';
      break;
    }

    if (records.filter(record => record.phase === 'modal' && record.isProfileContent).length >= MAX_CONTENT_REQUESTS) {
      sessionEnd = 'content-budget-exhausted';
      break;
    }

    if (Date.now() - lastReportAt >= 10000) {
      lastReportAt = Date.now();
      const contentCount = records.filter(record => record.phase === 'modal' && record.isProfileContent).length;
      const imageCount = records.filter(record => record.phase === 'modal' && record.resourceType === 'image').length;
      console.log(
        `[probe] t=${Math.round((Date.now() - startedAt) / 1000)}s ` +
        `images=${lastState.images} contentRequests=${contentCount} imageRequests=${imageCount} ` +
        `loading=${lastState.loading}`,
      );
    }

    await page.waitForTimeout(250);
  }

  // Give pending response handlers a moment so the final 429 body/headers land.
  // Each body read is capped at 3s; the extra race is a hard stop in case a
  // stalled Playwright response never settles.
  await Promise.race([
    Promise.allSettled(bodyReads),
    new Promise(resolve => setTimeout(resolve, 5000)),
  ]);
  await page.waitForTimeout(500);

  const observed429 = records
    .filter(record => record.phase === 'modal' && record.status === 429)
    .sort((first, second) => (first.responseAt ?? 0) - (second.responseAt ?? 0))[0];
  const successfulImage = records.find(record => (
    record.phase === 'modal' && record.resourceType === 'image' && record.status === 200 && record.host === 'nimfomane.com'
  ));

  // After the first 429, check whether the block is scoped to the content
  // endpoint, to all dynamic forum pages, or to the whole proxy IP. These
  // requests go through the context request API so they do not pollute the
  // page-level request timeline.
  let scopeCheck: Record<string, unknown> | null = null;
  if (observed429) {
    const nonce = Date.now();
    const targets: Record<string, string | null> = {
      sameContentUrl: `${observed429.url}${observed429.url.includes('?') ? '&' : '?'}probe=${nonce}`,
      profileDocument: `${PROFILE_URL}?probe=${nonce}`,
      forumListing: `https://nimfomane.com/forum/forum/35-escorte-din-cluj/?probe=${nonce}`,
      staticUpload: successfulImage?.url ?? null,
    };

    const result: Record<string, unknown> = {};
    for (const [name, url] of Object.entries(targets)) {
      if (!url) {
        result[name] = {skipped: true};
        continue;
      }
      try {
        const response = await context.request.get(url, {
          failOnStatusCode: false,
          maxRedirects: 0,
          timeout: 20000,
          headers: {'cache-control': 'no-cache'},
        });
        result[name] = {
          status: response.status(),
          retryAfter: response.headers()['retry-after'] ?? null,
          contentType: response.headers()['content-type'] ?? null,
        };
        console.log(`[probe] scope check ${name}: ${response.status()}`);
      } catch (error) {
        result[name] = {error: error instanceof Error ? error.message : String(error)};
        console.log(`[probe] scope check ${name} failed: ${String(error)}`);
      }
    }
    scopeCheck = result;
  }

  const meta = {
    profileUrl: PROFILE_URL,
    proxyConfigured: proxyServers.length > 0,
    proxyIndex,
    proxyServer: proxyIndex === null ? null : proxyServers[proxyIndex],
    clientLimiter: CLIENT_LIMITER,
    imageThrottle: {windowMs: 10_000, limit: 50},
    modalOpenedAt,
    probeStartedAt: startedAt,
    probeEndedAt: Date.now(),
    probeDurationMs: Date.now() - startedAt,
    sessionEnd,
    ended,
    lastState,
    maxDurationMs: MAX_DURATION_MS,
    maxContentRequests: MAX_CONTENT_REQUESTS,
    scopeCheck,
  };

  const summary = summarize(records, meta);
  fs.mkdirSync(OUTPUT_DIR, {recursive: true});

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = path.join(OUTPUT_DIR, `run-${stamp}.json`);
  const logPath = path.join(OUTPUT_DIR, `run-${stamp}.log`);

  fs.writeFileSync(jsonPath, JSON.stringify({summary, records}, null, 2));

  const line = (text: string) => `${text}\n`;
  const reportLines: string[] = [];
  reportLines.push(line('=== NIMFOMANE RATE LIMIT PROBE ==='));
  reportLines.push(line(JSON.stringify(summary, null, 2)));
  reportLines.push(line('=== CONTENT REQUEST TIMELINE (modal) ==='));
  for (const record of records.filter(candidate => candidate.phase === 'modal' && candidate.isProfileContent)) {
    reportLines.push(line(
      `${new Date(record.startedAt).toISOString()} page=${record.pageNumber ?? '?'} ` +
      `status=${record.status ?? 'pending'} duration=${record.durationMs ?? '?'}ms ` +
      `gapFromPrev=${record.seq}`,
    ));
  }
  reportLines.push(line('=== ALL 429 RESPONSES ==='));
  for (const record of records.filter(candidate => candidate.status === 429)) {
    reportLines.push(line(JSON.stringify(record, null, 2)));
  }

  fs.writeFileSync(logPath, reportLines.join(''));

  console.log('\n========== PROBE SUMMARY ==========');
  console.log(JSON.stringify(summary.totals, null, 2));
  console.log(JSON.stringify(summary.contentRequestIntervalsMs, null, 2));
  console.log(JSON.stringify(summary.rateLimit, null, 2));
  console.log(`[probe] wrote ${jsonPath}`);
  console.log(`[probe] wrote ${logPath}`);
});
