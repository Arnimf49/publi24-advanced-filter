import {Page} from "playwright-core";
import fs from "node:fs";
import {NIMFOMANE_STORAGE_JSON} from "./utils";
import {expect} from "playwright/test";
import {EscortItem, TopicItem} from "../../src/nimfomane/core/storage";

let atLoad = 0;

export const utilsNimfomane = {
  async throttleNavigation<T>(page: Page, callback: () => Promise<T>) {
    if (atLoad !== 0) {
      await page.goto('about:blank');
      await page.waitForTimeout(3000);
    }
    ++atLoad;
    return await callback();
  },

  async throttleReload(page: Page) {
    const url = page.url();
    await page.goto('about:blank');
    await page.waitForTimeout(3000);
    return page.goto(url);
  },

  async goto(page: Page, url: string) {
    let response = await utilsNimfomane.throttleNavigation(page, () => page.goto(url));
    if (response.status() === 404) {
      response = await utilsNimfomane.throttleReload(page);
    }
    expect(response.status()).toEqual(200);
    return response;
  },

  async open(page: Page, config: {url?: string, loadStorage?: boolean} = {}) {
    const url = typeof config === 'string' ? config : config.url;
    const loadStorage = typeof config === 'object' ? config.loadStorage : true;

    if (loadStorage !== false && fs.existsSync(NIMFOMANE_STORAGE_JSON)) {
      const localStorageData = JSON.parse(fs.readFileSync(NIMFOMANE_STORAGE_JSON, 'utf-8'));
      await page.addInitScript((data: any) => {
        if (window.localStorage.getItem('_pw_init_nimfo') === 'true') {
          return;
        }

        for (const [key, value] of Object.entries(data)) {
          window.localStorage.setItem(key, value as string);
        }

        window.localStorage.setItem('_pw_init_nimfo', 'true');
      }, localStorageData);
    }

    await utilsNimfomane.goto(page, url || `https://nimfomane.com/forum/forum/35-escorte-din-cluj/`);
    await page.waitForTimeout(600);
  },

  async waitForFirstImage(page: Page, wait: number = 1000) {
    for (let i = 0; i < 6; i++) {
      let index = 10;
      while (index >= 0) {
        const parentHandle = page.locator('[data-wwtopic]').nth(index--)
        const firstImage = parentHandle.locator('[data-wwid="topic-image-img"]');

        if (await firstImage.isVisible()) {
          const src = await firstImage.getAttribute('src');
          const user = await parentHandle.locator('[data-wwid="topic-image"]')
            .getAttribute('data-wwuser');
          const id = await parentHandle.getAttribute('data-wwtopic');

          return {firstImage, src, user, id};
        }
      }

      await page.waitForTimeout(wait);
    }

    throw new Error('Failed to find first image in time');
  },

  async getUserProfileLink(page: Page, user: string) {
    return await page.evaluate(
      (user) => JSON.parse(localStorage.getItem(`p24fa:nimfo:escort:${user}`)).profileLink,
      user
    )
  },

  async deleteUserProfileStorage(page: Page, user: string) {
    return await page.evaluate(
      (user) => localStorage.removeItem(`p24fa:nimfo:escort:${user}`),
      user
    )
  },

  async deleteTopicInfoStorage(page: Page, id: string) {
    return await page.evaluate(
      (id) => localStorage.removeItem(`p24fa:nimfo:topic:${id}`),
      id
    )
  },

  async getTopicStorageProp(page: Page, id: string, prop: keyof TopicItem) {
    return await page.evaluate(
      ({id, prop}) => {
        const topic = JSON.parse(localStorage.getItem(`p24fa:nimfo:topic:${id}`) || '{}');
        return topic[prop];
      },
      {id, prop}
    )
  },

  async setTopicStorageProp(page: Page, id: string, prop: keyof TopicItem, value: any) {
    await page.evaluate(
      ({id, prop, value}) => {
        const topic = JSON.parse(localStorage.getItem(`p24fa:nimfo:topic:${id}`) || '{}');
        topic[prop] = value;
        localStorage.setItem(`p24fa:nimfo:topic:${id}`, JSON.stringify(topic));
      },
      {id, prop, value}
    )
  },

  async setEscortStorageProp(page: Page, user: string, prop: keyof EscortItem, value: any) {
    await page.evaluate(
      ({user, prop, value}) => {
        const topic = JSON.parse(localStorage.getItem(`p24fa:nimfo:escort:${user}`) || '{}');
        topic[prop] = value;
        localStorage.setItem(`p24fa:nimfo:escort:${user}`, JSON.stringify(topic));
      },
      {user, prop, value}
    )
  },

  async deleteEscortStorage(page: Page, user: string) {
    return await page.evaluate(
      (user) => localStorage.removeItem(`p24fa:nimfo:escort:${user}`),
      user
    )
  },
};
