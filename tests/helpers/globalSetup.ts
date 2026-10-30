import {PUBLI24_COOKIES_JSON, PUBLI24_STORAGE_JSON, NIMFOMANE_STORAGE_JSON, utils, COOKIES_JSON} from "./utils";
import fs from "node:fs";
import path from "node:path";
import {utilsPubli} from "./utilsPubli";
import {utilsNimfomane} from "./utilsNimfomane";
import dotenv from 'dotenv';

dotenv.config();

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 15 * 1000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry(label: string, fn: () => Promise<void>): Promise<void> {
  const maxAttempts = process.env.CI ? MAX_ATTEMPTS : 1;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await fn();
      return;
    } catch (error) {
      lastError = error;
      console.error(`[global-setup:${label}] Attempt ${attempt}/${maxAttempts} failed:`, error);

      if (attempt < maxAttempts) {
        console.log(`[global-setup:${label}] Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await delay(RETRY_DELAY_MS);
      }
    }
  }

  throw lastError;
}

async function setupPubli24Once() {
  const MAX_AGE_MS = 15 * 60 * 1000; // 15 min
  const shouldSkip = fs.existsSync(PUBLI24_STORAGE_JSON) && fs.existsSync(PUBLI24_COOKIES_JSON) && (() => {
    const stats = fs.statSync(PUBLI24_STORAGE_JSON);
    const age = Date.now() - stats.mtimeMs;
    return age < MAX_AGE_MS;
  })();

  if (shouldSkip) {
    console.log('[global-setup:publi24] Skipping localStorage save (cache is fresh)');
    return;
  }

  console.log('[global-setup:publi24] Setting up publi24 data...');
  const context = await utils.makeContext();

  try {
    const page = await context.newPage();

    if (fs.existsSync(COOKIES_JSON)) {
      await context.addCookies(JSON.parse(fs.readFileSync(COOKIES_JSON).toString()));
    }

    await utilsPubli.open(context, page, {loadStorage: false});
    utilsPubli.clearPopups(page);
    const articleWithDuplicates = await utilsPubli.findAdWithDuplicates(page, true);
    const article = (await articleWithDuplicates.$('[data-wwid="investigate_img"]'))
      ? articleWithDuplicates
      : await utilsPubli.findFirstAdWithImageSearch(page);

    if (!process.env.MANUAL_PRIME) {
      await utilsPubli.resolveGooglePage(await article.waitForSelector('[data-wwid="investigate_img"]'), context, page);
    } else {
      // manual
      await article.waitForSelector('[data-wwid="investigate_img"]');
      await page.pause();
    }

    const localStorageData = await utils.getLocalStorageData(page);

    fs.mkdirSync(path.dirname(PUBLI24_STORAGE_JSON), { recursive: true });
    fs.writeFileSync(PUBLI24_STORAGE_JSON, JSON.stringify(localStorageData, null, 2));
    fs.mkdirSync(path.dirname(PUBLI24_COOKIES_JSON), { recursive: true });
    fs.writeFileSync(PUBLI24_COOKIES_JSON, JSON.stringify(await context.cookies(), null, 2));

    console.log('[global-setup:publi24] Setup complete');
  } finally {
    await context.close();
  }
}

async function setupPubli24() {
  await withRetry('publi24', setupPubli24Once);
}

async function setupNimfomaneOnce() {
  const MAX_AGE_MS = 40 * 60 * 1000;
  const shouldSkip = fs.existsSync(NIMFOMANE_STORAGE_JSON) && (() => {
    const stats = fs.statSync(NIMFOMANE_STORAGE_JSON);
    const age = Date.now() - stats.mtimeMs;
    return age < MAX_AGE_MS;
  })();

  if (shouldSkip) {
    console.log('[global-setup:nimfomane] Skipping localStorage save (cache is fresh)');
    return;
  }

  console.log('[global-setup:nimfomane] Setting up nimfomane data...');
  const context = await utils.makeContext();

  try {
    const page = await context.newPage();

    await utilsNimfomane.open(page, {loadStorage: false});
    await utilsNimfomane.waitForNthImage(page);

    const localStorageData = await utils.getLocalStorageData(page);

    fs.mkdirSync(path.dirname(NIMFOMANE_STORAGE_JSON), { recursive: true });
    fs.writeFileSync(NIMFOMANE_STORAGE_JSON, JSON.stringify(localStorageData, null, 2));

    console.log('[global-setup:nimfomane] Setup complete');
  } finally {
    await context.close();
  }
}

async function setupNimfomane() {
  await withRetry('nimfomane', setupNimfomaneOnce);
}

export default async () => {
  await Promise.all([
    setupPubli24(),
    setupNimfomane(),
  ]);
};
