import {page} from "../../common/page";
import {utils} from "../../common/utils";
import {elementHelpers} from "./elementHelpers";
import {NimfomaneStorage} from "./storage";

export const topicActions = {
  async getEscortOfTopic(lastPageUrl: string): Promise<[string, string] | null> {
    let pageChecked = 0;
    let url = lastPageUrl;

    do {
      const pageData = await page.load(url, 'nimfomane:page');

      const allUsers = pageData.querySelectorAll<HTMLLinkElement>('.cAuthorPane_author a');
      const escortUsers = Array.from(allUsers).filter(elementHelpers.isUserLinkEscort);
      if (escortUsers.length) {
        return elementHelpers.userLinkDestruct(utils.mostRepeated(escortUsers, (v) => v.innerText))
      }

      const commentAuthorSections = pageData.querySelectorAll('.ipsComment_author');
      const unverifiedAuthorSections = Array.from(commentAuthorSections)
        .filter(section => section.querySelector<HTMLElement>('[data-role="group"]')?.innerText.match(/neverificat[aă]/i));
      const unverifiedUsers = unverifiedAuthorSections.map(section => section.querySelector<HTMLLinkElement>('.cAuthorPane_author a')!);
      if (unverifiedUsers.length) {
        return elementHelpers.userLinkDestruct(utils.mostRepeated(unverifiedUsers, (v) => v.innerText))
      }

      url = pageData.querySelector('[rel="prev"]')?.getAttribute('href')!;
      ++pageChecked;
    } while (pageChecked < 3 && url);

    return null;
  },

  async determineTopPosterEscort(lastPageUrl: string): Promise<boolean> {
    const pageData = await page.load(lastPageUrl, 'nimfomane');

    const topPostersSection = pageData.querySelector('.cTopicOverview__section--users');
    if (!topPostersSection) {
      return false;
    }

    const firstTopPoster = pageData.querySelectorAll('.cTopicOverview__dataItem')[0];
    if (!firstTopPoster) {
      return false;
    }

    const [url, user] = elementHelpers.userLinkDestruct(firstTopPoster.querySelector<HTMLLinkElement>('a')!);

    if (NimfomaneStorage.hasEscort(user)) {
      NimfomaneStorage.setEscortProp(user, 'profileLink', url.replace(/\?.*$/, ''));
      return true;
    }

    const userPage = await page.load(url, 'nimfomane');
    if (elementHelpers.isUsePageEscort(userPage)) {
      NimfomaneStorage.setEscortProp(user, 'profileLink', url.replace(/\?.*$/, ''));
      return true;
    }

    return false;
  }
}
