import {NimfomaneStorage} from "./storage";
import {BrowserError, page} from "../../common/page";

export const escortActions = {
  async determineMainProfileImage(user: string) {
    let profileContentUrl = NimfomaneStorage.getEscort(user).profileLink + 'content';
    let pageChecks = 0;

    do {
      const pageData = await page.load(profileContentUrl, 'nimfomane:page');

      const image = pageData.querySelector('.ipsStreamItem_snippet [data-background-src]');
      if (image) {
        NimfomaneStorage.setEscortProp(user, 'optimizedProfileImage', image.getAttribute('data-background-src'));
        NimfomaneStorage.setEscortProp(user, 'optimizedProfileImageTime', Date.now());
        return;
      }

      const nextPage = pageData.querySelector('.ipsPagination_next a');
      if (!nextPage) {
        NimfomaneStorage.setEscortProp(user, 'optimizedProfileImage', null);
        NimfomaneStorage.setEscortProp(user, 'optimizedProfileImageTime', Date.now());
        return;
      }
      profileContentUrl = nextPage.getAttribute('href')!;
      ++pageChecks;
    } while (pageChecks < 10);

    NimfomaneStorage.setEscortProp(user, 'optimizedProfileImage', null);
    NimfomaneStorage.setEscortProp(user, 'optimizedProfileImageTime', Date.now());
  },

  async loadImages(user: string, pageNum: number): Promise<string[] | null> {
    let url = NimfomaneStorage.getEscort(user).profileLink + 'content';
    if (pageNum !== 0) {
      url += '/page/' + (pageNum + 1);
    }

    try {
      const pageData = await page.load(url, 'nimfomane');
      const pageExists = !!pageData.querySelector(`[data-page="${pageNum + 1}"]`)

      if (pageNum !== 0 && !pageExists) {
        return null;
      }

      const imageElements = pageData.querySelectorAll('.ipsStreamItem_snippet [data-background-src]');

      // @ts-ignore
      return [...imageElements].map(el => el.getAttribute('data-background-src'));
    } catch (e: any | BrowserError) {
      if (e.code === 404) {
        return null;
      }
      throw e;
    }
  }
}
