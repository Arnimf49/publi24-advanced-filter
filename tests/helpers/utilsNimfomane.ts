import {Page} from "playwright-core";

export const utilsNimfomane = {
  async open(page: Page, url?: string) {
    await page.goto(url || `https://nimfomane.com/forum/forum/35-escorte-din-cluj/`);
    await page.waitForTimeout(600);
  },

  async waitForFirstImage(page: Page) {
    const firstImage = page.locator('[data-wwid="topic-image"] img').first();
    await firstImage.waitFor();
    const src = await firstImage.getAttribute('src');
    const parentHandle = await firstImage.evaluateHandle(el => el.parentElement);
    const user = await parentHandle.getAttribute('data-wwuser');
    const id = await parentHandle.getAttribute('data-wwtopic');

    return {firstImage, src, user, id};
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

  async setTopicStorageProp(page: Page, id: string, prop: string, value: any) {
    await page.evaluate(
      ({id, prop, value}) => {
        const topic = JSON.parse(localStorage.getItem(`p24fa:nimfo:topic:${id}`));
        topic[prop] = value;
        localStorage.setItem(`p24fa:nimfo:topic:${id}`, JSON.stringify(topic));
      },
      {id, prop, value}
    )
  },

  async setEscortStorageProp(page: Page, user: string, prop: string, value: any) {
    await page.evaluate(
      ({user, prop, value}) => {
        const topic = JSON.parse(localStorage.getItem(`p24fa:nimfo:escort:${user}`));
        topic[prop] = value;
        localStorage.setItem(`p24fa:nimfo:escort:${user}`, JSON.stringify(topic));
      },
      {user, prop, value}
    )
  },
};
