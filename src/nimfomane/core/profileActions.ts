import {elementHelpers} from "./elementHelpers";
import {NimfomaneStorage, EscortItem} from "./storage";
import {cityService} from "./cityService";
import {page} from "../../common/page";

const CACHE_DURATION = 24 * 60 * 60 * 1000;

async function findCurrentCity(doc: Document): Promise<{name: string; topicUrl: string} | undefined> {
  const streamItems = doc.querySelectorAll('.ipsStreamItem_status a:last-child');
  const cityLinks: Array<{url: string; city: string; topicUrl: string}> = [];

  for (const link of Array.from(streamItems)) {
    const href = (link as HTMLAnchorElement).href;
    const city = cityService.getCityFromForumUrl(href);

    if (city) {
      const streamItem = link.closest('.ipsStreamItem');
      const topicLink = streamItem?.querySelector('.ipsStreamItem_title a') as HTMLAnchorElement;
      const topicUrl = topicLink?.href;

      if (topicUrl) {
        cityLinks.push({url: href, city, topicUrl});
      }
    }
  }

  for (let i = 0; i < cityLinks.length - 2; i++) {
    if (
      cityLinks[i].city === cityLinks[i + 1].city &&
      cityLinks[i].city === cityLinks[i + 2].city
    ) {
      return {
        name: cityLinks[i].city,
        topicUrl: cityLinks[i].topicUrl,
      };
    }
  }

  return undefined;
}

export const profileActions = {
  determineEscort() {
    if (elementHelpers.isProfilePageEscort(document)) {
      const user = document.querySelector<HTMLElement>('h1.ipsPageHead_barText')!.innerText.trim();
      NimfomaneStorage.setEscortProp(user, 'profileLink', location.toString().replace(/\/content\/.+$|\/$|\?.+$/, '') + '/')
    }
  },

  async loadProfileStats(user: string, profileUrl: string, priority: number = 110): Promise<void> {
    try {
      const doc = await page.load(profileUrl, {priority});

      const stats: EscortItem['profileStats'] = {};

      const profileStatsDiv = doc.querySelector('#elProfileStats');
      if (profileStatsDiv) {
        const postsItem = profileStatsDiv.querySelector<HTMLLIElement>('ul li:first-child');
        console.log(postsItem!.innerText);
        stats.posts = parseInt(postsItem!.innerText.replace(/Posts|,/g, '').trim());

        const lastVisitedItem = profileStatsDiv.querySelector<HTMLLIElement>('ul li:nth-child(3) time');
        stats.lastVisited = lastVisitedItem!.getAttribute('datetime') || undefined;
      }

      const repScoreElement = doc.querySelector('.cProfileRepScore');
      if (repScoreElement) {
        stats.reputation = repScoreElement.textContent!.trim();
      }

      const currentCity = await findCurrentCity(doc);
      if (currentCity) {
        stats.currentCity = currentCity;
      }

      NimfomaneStorage.setEscortProp(user, 'profileStats', stats);
      NimfomaneStorage.setEscortProp(user, 'profileStatsTime', Date.now());
    } catch (error) {
      console.error(`Error loading profile stats for ${user}:`, error);
    }
  },

  shouldLoadProfileStats(user: string): boolean {
    const escort = NimfomaneStorage.getEscort(user);

    if (!escort.profileStatsTime) {
      return true;
    }

    const age = Date.now() - escort.profileStatsTime;
    return age > CACHE_DURATION;
  },

  isProfileStatsStale(user: string): boolean {
    const escort = NimfomaneStorage.getEscort(user);

    if (!escort.profileStatsTime) {
      return false;
    }

    const age = Date.now() - escort.profileStatsTime;
    return age > CACHE_DURATION;
  }
};
