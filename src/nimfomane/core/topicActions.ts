import {page} from "../../common/page";
import {utils} from "../../common/utils";
import {elementHelpers} from "./elementHelpers";
import {NimfomaneStorage} from "./storage";

export const topicActions = {
  async getEscortOfTopic(lastPageUrl: string, minPostCount?: number): Promise<[string, string] | null> {
    let pageChecked = 0;
    let url = lastPageUrl;

    do {
      const pageData = await page.load(url);

      const allUsers = pageData.querySelectorAll<HTMLLinkElement>('.cAuthorPane_author a');
      const escortUsers = Array.from(allUsers).filter(elementHelpers.isUserLinkEscort);
      if (escortUsers.length >= (minPostCount || 1)) {
        const mostRepeatedUser = utils.mostRepeated(escortUsers, (v) => v.innerText);
        const postCount = escortUsers.filter(u => u.innerText === mostRepeatedUser.innerText).length;
        if (postCount >= (minPostCount || 1)) {
          return elementHelpers.userLinkDestruct(mostRepeatedUser);
        }
      }

      const commentAuthorSections = pageData.querySelectorAll('.ipsComment_author');
      const unverifiedAuthorSections = Array.from(commentAuthorSections)
        .filter(section => section.querySelector<HTMLElement>('[data-role="group"]')?.innerText.match(/neverificat[aă]/i));
      const unverifiedUsers = unverifiedAuthorSections.map(section => section.querySelector<HTMLLinkElement>('.cAuthorPane_author a')!);
      if (unverifiedUsers.length >= (minPostCount || 1)) {
        const mostRepeatedUser = utils.mostRepeated(unverifiedUsers, (v) => v.innerText);
        const postCount = unverifiedUsers.filter(u => u.innerText === mostRepeatedUser.innerText).length;
        if (postCount >= (minPostCount || 1)) {
          return elementHelpers.userLinkDestruct(mostRepeatedUser);
        }
      }

      url = pageData.querySelector('[rel="prev"]')?.getAttribute('href')!;
      ++pageChecked;
    } while (pageChecked < 3 && url);

    return null;
  },

  async determineTopPosterEscort(lastPageUrl: string): Promise<boolean | null> {
    const pageData = await page.load(lastPageUrl);

    const topPostersSection = pageData.querySelector('.cTopicOverview__section--users');
    if (!topPostersSection) {
      return null;
    }

    const firstTopPoster = pageData.querySelectorAll('.cTopicOverview__dataItem')[0];
    if (!firstTopPoster) {
      return null;
    }

    const [url, user] = elementHelpers.userLinkDestruct(firstTopPoster.querySelector<HTMLLinkElement>('a')!);

    if (NimfomaneStorage.hasEscort(user)) {
      NimfomaneStorage.setEscortProp(user, 'profileLink', url.replace(/\?.*$/, ''));
      return true;
    }

    const userPage = await page.load(url);
    if (elementHelpers.isProfilePageEscort(userPage)) {
      NimfomaneStorage.setEscortProp(user, 'profileLink', url.replace(/\?.*$/, ''));
      return true;
    }

    return false;
  }
}
