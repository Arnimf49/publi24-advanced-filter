import {test} from "../../helpers/fixture";
import {utilsPubli} from "../../helpers/utilsPubli";
import {BrowserContext, Page} from "playwright-core";
import {collectFromLensPage} from "../../helpers/domainCollector";
import {solve} from "recaptcha-solver";
import {existsSync, readFileSync, writeFileSync} from "fs";
import {resolve, dirname} from "path";
import {fileURLToPath} from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHECKED_ADS_FILE = resolve(__dirname, '../../data/publi24/checked-ad-ids.json');

function loadCheckedAds(): Set<string> {
  if (!existsSync(CHECKED_ADS_FILE)) return new Set();
  try {
    return new Set(JSON.parse(readFileSync(CHECKED_ADS_FILE, 'utf8')));
  } catch (_) {
    return new Set();
  }
}

function saveCheckedAd(id: string, checkedAds: Set<string>): void {
  checkedAds.add(id);
  writeFileSync(CHECKED_ADS_FILE, JSON.stringify([...checkedAds], null, 2) + '\n');
}

async function getTotalPages(page: Page): Promise<number> {
  try {
    const items = await page.$$('.pagination li');
    if (items.length < 2) return 1;
    const text = await items[items.length - 2].textContent();
    const n = parseInt(text?.trim() ?? '', 10);
    return isNaN(n) ? 1 : n;
  } catch (_) {
    return 1;
  }
}

function pickRandomPage(total: number, visited: Set<number>): number | null {
  const candidates = Array.from({ length: total }, (_, i) => i + 1).filter(p => !visited.has(p));
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

async function resolveLensPage(
  triggerButton: () => Promise<any>,
  context: BrowserContext,
  page: Page,
): Promise<void> {
  const secondaryPages: Page[] = [];
  context.on('page', p => secondaryPages.push(p));

  await (await triggerButton()).click();
  await page.waitForTimeout(2500);

  for (const altPage of secondaryPages) {
    if (altPage.url().startsWith('https://www.google.com/sorry/index')) {
      try {
        await solve(altPage, {
          delay: process.env.CI ? 200 : 64,
          wait: process.env.CI ? 7000 : 5000,
        });
      } catch (e: any) {
        if (e.message?.includes('No resource with given identifier found')) {
          continue;
        }
        throw e;
      }
      await page.waitForTimeout(1400);
    }

    // Wait for the continue button which appears once parsing is complete.
    await altPage.waitForSelector('[data-ww-search-continue]', { timeout: 20000 });

    await collectFromLensPage(altPage);

    if (altPage.isClosed()) {
      continue;
    }

    try {
      await Promise.all([
        altPage.locator('[data-ww-search-continue]').click(),
        altPage.waitForEvent('close', {timeout: 3000}),
      ])
    } catch (e: any) {
      if (e.message?.includes('Target page, context or browser has been close')) {
        continue;
      }
      throw e;
    }
  }
}

test.skip('Collect Lens image domains.', async ({ page, context }, testInfo) => {
  testInfo.setTimeout(60000 * 60 * 6);

  const checkedAds = loadCheckedAds();
  const visitedPages = new Set<number>();

  // Enable manual image search so pages stay open long enough to collect data.
  await utilsPubli.open(context, page, {
    page: 1,
    location: ''
  });
  await page.click('[data-wwid="menu-button"]');
  await page.click('[data-wwid="settings-button"]');
  await page.locator('[data-wwid="manual-image-search-switch"]').click();
  await page.click('[data-wwid="close"]');

  const totalPages = await getTotalPages(page);
  console.log(`Total pages: ${totalPages}`);

  while (true) {
    const nextPage = pickRandomPage(totalPages, visitedPages);
    if (nextPage === null) {
      console.log('All pages visited.');
      break;
    }

    visitedPages.add(nextPage);
    if (nextPage !== 1) {
      await utilsPubli.open(context, page, {
        page: nextPage,
        location: ''
      });
    }
    console.log(`Visiting page ${nextPage}`);

    const articles = await page.$$('[data-articleid]');

    for (const ad of articles) {
      const adId = await ad.getAttribute('data-articleid');
      if (!adId || checkedAds.has(adId)) continue;

      const articleImageSearchButton = await ad.$('[data-wwid="investigate_img"]');
      if (!articleImageSearchButton) continue;
      await articleImageSearchButton.isVisible();

      await resolveLensPage(() => ad.$('[data-wwid="investigate_img"]'), context, page);

      saveCheckedAd(adId, checkedAds);

      await page.waitForTimeout(8000 + Math.random() * 10000);
    }
  }
});

