import {PUBLI24_COOKIES_JSON, PUBLI24_STORAGE_JSON, NIMFOMANE_STORAGE_JSON, utils} from "./utils";
import fs from "node:fs";
import path from "node:path";
import {utilsPubli} from "./utilsPubli";
import {utilsNimfomane} from "./utilsNimfomane";


async function setupPubli24() {
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
  const page = await context.newPage();

  await utilsPubli.open(context, page, {loadStorage: false});
  utilsPubli.clearPopups(page);
  const article = await utilsPubli.findAdWithDuplicates(page, true);

  await utilsPubli.resolveGooglePage(await article.waitForSelector('[data-wwid="investigate_img"]'), context, page);

  const localStorageData = await utils.getLocalStorageData(page);

  fs.mkdirSync(path.dirname(PUBLI24_STORAGE_JSON), { recursive: true });
  fs.writeFileSync(PUBLI24_STORAGE_JSON, JSON.stringify(localStorageData, null, 2));
  fs.mkdirSync(path.dirname(PUBLI24_COOKIES_JSON), { recursive: true });
  fs.writeFileSync(PUBLI24_COOKIES_JSON, JSON.stringify(await context.cookies(), null, 2));

  await context.close();
  console.log('[global-setup:publi24] Setup complete');
}

async function setupNimfomane() {
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
  const page = await context.newPage();

  await utilsNimfomane.open(page, {loadStorage: false});
  await utilsNimfomane.waitForFirstImage(page);

  const localStorageData = await utils.getLocalStorageData(page);

  fs.mkdirSync(path.dirname(NIMFOMANE_STORAGE_JSON), { recursive: true });
  fs.writeFileSync(NIMFOMANE_STORAGE_JSON, JSON.stringify(localStorageData, null, 2));

  await context.close();
  console.log('[global-setup:nimfomane] Setup complete');
}

export default async () => {
  await Promise.all([
    setupPubli24(),
    setupNimfomane(),
  ]);
};
