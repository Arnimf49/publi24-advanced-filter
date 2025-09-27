import {COOKIES_JSON, STORAGE_JSON, utils} from "./utils";
import fs from "node:fs";
import {utilsPubli} from "./utilsPubli";

const MAX_AGE_MS = 5 * 60 * 1000; // 5 min

export default async () => {
  const shouldSkip = fs.existsSync(STORAGE_JSON) && fs.existsSync(COOKIES_JSON) && (() => {
    const stats = fs.statSync(STORAGE_JSON);
    const age = Date.now() - stats.mtimeMs;
    return age < MAX_AGE_MS;
  })();

  if (shouldSkip) {
    console.log('[global-setup] Skipping localStorage save (cache is fresh)');
    return;
  }

  const context = await utils.makeContext();
  const page = await context.newPage();

  await utilsPubli.open(context, page, {loadStorage: false});
  utilsPubli.clearPopups(page);
  await utilsPubli.findAdWithDuplicates(page);

  const localStorageData = await page.evaluate(() => {
    const data: any = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    return data;
  });

  fs.writeFileSync('tests/helpers/localStorage.json', JSON.stringify(localStorageData, null, 2));
  fs.writeFileSync('tests/helpers/cookies.json', JSON.stringify(await context.cookies(), null, 2));

  await context.close();
};
