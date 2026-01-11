import {NimfomaneStorage} from "./storage";
import {page} from "../../common/page";

export interface Image {
  url: string;
  date: string;
}

export const escortActions = {
  updatePreviewImage(user: string, imageUrl: string) {
    NimfomaneStorage.setEscortProp(user, 'optimizedProfileImage', imageUrl);
    NimfomaneStorage.setEscortProp(user, 'optimizedProfileImageTime', Date.now());
  },

  async determineMainProfileImage(user: string, priority: number = 100) {
    let profileContentUrl = NimfomaneStorage.getEscort(user).profileLink + 'content';
    let pageChecks = 0;

    do {
      const pageData = await page.load(profileContentUrl, priority);

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

  async loadImages(user: string, pageNum: number, priority: number = 100): Promise<Image[] | null> {
    let url = NimfomaneStorage.getEscort(user).profileLink + 'content';
    if (pageNum !== 0) {
      url += '/page/' + (pageNum + 1);
    }

    const pageData = await page.load(url, priority);
    const pageExists = !!pageData.querySelector(`[data-page="${pageNum + 1}"]`)

    if (pageNum !== 0 && !pageExists) {
      return null;
    }

    const imageElements = pageData.querySelectorAll('.ipsStreamItem_snippet [data-background-src]');

    // @ts-ignore
    const images = [...imageElements].map(el => {
      return {
        url: el.getAttribute('data-background-src'),
        date: el.closest('.ipsStreamItem_container').querySelector('time').innerText,
      }
    });

    if (pageNum === 0 && images.length > 0) {
      escortActions.updatePreviewImage(user, images[0].url);
    }

    return images;
  }
}
