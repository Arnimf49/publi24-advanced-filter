import {NimfomaneStorage} from "./storage";
import {page} from "../../common/page";
import {utils} from "../../common/utils";

export interface Image {
  url: string;
  date: string;
}

const extractPhoneFromElements = (elements: NodeListOf<HTMLElement> | HTMLElement[]): string | null => {
  for (const element of elements) {
    const normalized = utils.normalizeDigits(element.innerText);
    const matches = normalized.match(/07(\d ?){8}/g);
    if (matches) {
      return matches[matches.length - 1].replace(/\s/g, '');
    }
  }
  return null;
};

export const escortActions = {
  async determinePhone(user: string, priority: number = 100) {
    utils.debugLog('Determining escort phone', {user, priority});

    const escort = NimfomaneStorage.getEscort(user);
    if (!escort.profileLink) {
      return;
    }

    let phone;
    const profileUrl = escort.profileLink.replace(/\/$/, '');

    const topicPageData = await page.load(`${profileUrl}/content/?type=forums_topic`, priority);
    const topicTitles = topicPageData.querySelectorAll<HTMLElement>('.ipsDataItem_title');

    phone = extractPhoneFromElements(topicTitles);
    if (phone) {
      NimfomaneStorage.setEscortProp(user, 'phone', phone);
      NimfomaneStorage.setEscortProp(user, 'phoneDeterminationTime', Date.now());
      return;
    }

    const profilePageData = await page.load(profileUrl, priority);
    const genericItems = profilePageData.querySelectorAll<HTMLElement>('.ipsDataItem_generic');

    phone = extractPhoneFromElements(genericItems);
    if (phone) {
      NimfomaneStorage.setEscortProp(user, 'phone', phone);
      NimfomaneStorage.setEscortProp(user, 'phoneDeterminationTime', Date.now());
      return;
    }

    const postPageData = await page.load(`${profileUrl}/content/?type=forums_topic_post`, priority);
    const commentContents = postPageData.querySelectorAll<HTMLElement>('[data-role="commentContent"]');

    phone = extractPhoneFromElements(commentContents);
    if (phone) {
      NimfomaneStorage.setEscortProp(user, 'phone', phone);
      NimfomaneStorage.setEscortProp(user, 'phoneDeterminationTime', Date.now());
      return;
    }

    NimfomaneStorage.setEscortProp(user, 'phone', false);
    NimfomaneStorage.setEscortProp(user, 'phoneDeterminationTime', Date.now());
  },

  updatePreviewImage(user: string, imageUrl: string) {
    NimfomaneStorage.setEscortProp(user, 'optimizedProfileImage', imageUrl);
    NimfomaneStorage.setEscortProp(user, 'optimizedProfileImageTime', Date.now());
  },

  async determineMainProfileImage(user: string, priority: number = 100) {
    utils.debugLog('Determining escort main profile image', {user, priority});

    const escort = NimfomaneStorage.getEscort(user);

    if (!escort.profileLink) {
      throw new Error('Cannot determine profile image, missing escort data: ' + user);
    }

    let profileContentUrl = escort.profileLink + 'content';
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

    const images = [...imageElements].map(el => {
      return {
        url: el.getAttribute('data-background-src')!,
        date: el.closest('.ipsStreamItem_container')!.querySelector('time')!.innerText,
      }
    });

    if (pageNum === 0 && images.length > 0) {
      escortActions.updatePreviewImage(user, images[0].url);
    }

    return images;
  }
}
