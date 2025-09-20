import { test as base, type BrowserContext } from '@playwright/test';
import {$} from "execa";
import {utils} from "./utils";


export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, use, testInfo) => {
    const context = await utils.makeContext();

    if (process.env.CI && process.env.DISPLAY) {
      setTimeout(() => $`xdotool key Escape`, 1100);
    }

    const start = Date.now();
    await use(context);
    await context.close();

    // Prevent too many requests, except for nimfomane tests
    if (
      !process.env.DEBUG &&
      !process.env.PWDEBUG &&
      !testInfo.file.includes("/nimfomane/")
    ) {
      const duration = (Date.now() - start) / 1000;
      const delay = Math.max(0, (8 - duration) * 1000);
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
