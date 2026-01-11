import { test as base, type BrowserContext } from '@playwright/test';
import {utils} from "./utils";
import {Page} from "playwright-core";

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, use, testInfo) => {
    const context = await utils.makeContext();

    const setupDebugLogListener = (page: Page) => {
      page.on('console', (msg) => {
        const text = msg.text();
        if (text.startsWith('[WW-DEBUG]')) {
          console.log(`\x1b[36m${text}\x1b[0m`);
        }
      });
    };

    context.pages().forEach(setupDebugLogListener);
    context.on('page', setupDebugLogListener);

    const start = Date.now();
    await use(context);
    await context.close();

    if (
      !process.env.DEBUG &&
      !process.env.PWDEBUG &&
      testInfo.file.includes("/publi24/")
    ) {
      const duration = (Date.now() - start) / 1000;
      const delay = Math.max(0, ((process.env.CI == 'true' ? 14 : 8) - duration) * 1000);
      await new Promise(r => setTimeout(r, delay));
    }

    if (
      !process.env.DEBUG &&
      !process.env.PWDEBUG &&
      testInfo.file.includes("/nimfomane/")
    ) {
      const delay = (process.env.CI == 'true' ? 6 : 4) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  },
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background)
      background = await context.waitForEvent('serviceworker');

    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
});
export const expect = test.expect;
