import {elementHelpers} from "./elementHelpers";
import {NimfomaneStorage, EscortItem} from "./storage";
import {page, BrowserError} from "../../common/page";
import {jsonPage} from "./jsonPage";
import {NimfomaneMemoryStorage} from "./memoryStorage";
import {cityDetection} from './cityDetection';

const CACHE_DURATION = 24 * 60 * 60 * 1000;

function shouldLoadProfileStats(user: string): boolean {
  const escort = NimfomaneStorage.getEscort(user);

  if (!escort.profileStatsTime) {
    return true;
  }

  const age = Date.now() - escort.profileStatsTime;
  return age > CACHE_DURATION;
}

export const profileActions = {
  determineEscort() {
    if (elementHelpers.isProfilePageEscort(document)) {
      const user = document.querySelector<HTMLElement>('h1.ipsPageHead_barText')!.innerText.trim();
      NimfomaneStorage.setEscortProp(user, 'profileLink', location.toString().replace(/\/content\/.+$|\/$|\?.+$/, '') + '/')
    }
  },

  async loadProfileStats(user: string, profileUrl: string, priority: number = 110): Promise<void> {
    const contentUrl = profileUrl.replace(/\/$/, '') + '/content/?all_activity=1&listResort=1';
    let profileLoaded = false;
    NimfomaneMemoryStorage.setProfileStatsError(user, null);

    const profilePromise = page.load(profileUrl, {priority}).then(doc => {
      const stats: EscortItem['profileStats'] = {};
      profileLoaded = true;

      const profileStatsDiv = doc.querySelector('#elProfileStats');
      if (profileStatsDiv) {
        const postsItem = profileStatsDiv.querySelector<HTMLLIElement>('ul li:first-child');
        stats.posts = parseInt(postsItem!.innerText.replace(/Posts|,/g, '').trim());

        const lastVisitedItem = profileStatsDiv.querySelector<HTMLLIElement>('ul li:nth-child(3) time');
        stats.lastVisited = lastVisitedItem!.getAttribute('datetime') || undefined;
      }

      const repScoreElement = doc.querySelector('.cProfileRepScore');
      if (repScoreElement) {
        stats.reputation = repScoreElement.textContent!.trim();
      }

      const existing = NimfomaneStorage.getEscort(user).profileStats || {};
      NimfomaneStorage.setEscortProp(user, 'profileStats', {...existing, ...stats});
      NimfomaneStorage.setEscortProp(user, 'profileNotFound', undefined);
      NimfomaneMemoryStorage.setProfileStatsError(user, null);
      NimfomaneStorage.setEscortProp(
        user,
        'isUnverified',
        elementHelpers.isNeverificataProfilePage(doc) ? true : undefined,
      );
    }).catch(error => {
      if ((error as BrowserError).code === 404) {
        NimfomaneStorage.setEscortProp(user, 'profileNotFound', true);
      }
      NimfomaneMemoryStorage.setProfileStatsError(user, error instanceof Error ? error.message : String(error));
      console.error(`Error loading profile page for ${user}:`, error);
    });

    const contentPromise = jsonPage.load(contentUrl, {priority}).then(doc => {
      const currentCity = cityDetection.findCurrentCity(doc);
      const existing = NimfomaneStorage.getEscort(user).profileStats || {};

      if (currentCity) {
        NimfomaneStorage.setEscortProp(user, 'profileStats', {...existing, currentCity});
      }
    }).catch(error => console.error(`Error loading content page for ${user}:`, error));

    await Promise.all([profilePromise, contentPromise]);
    if (profileLoaded) {
      NimfomaneStorage.setEscortProp(user, 'profileStatsTime', Date.now());
    }
  },

  async refreshFavoritesProfileStats() {
    const favorites = NimfomaneStorage.getFavorites();
    const toRefresh = favorites.filter(user => shouldLoadProfileStats(user));

    for (let i = 0; i < toRefresh.length; i++) {
      const user = toRefresh[i];
      const escort = NimfomaneStorage.getEscort(user);
      const profileUrl = escort.profileLink || `https://www.nimfomane.com/forum/profile/${encodeURIComponent(user)}/`;
      await profileActions.loadProfileStats(user, profileUrl);
      if (i < toRefresh.length - 1) {
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  },

  hasNeverLoadedProfileStats(user: string): boolean {
    return !NimfomaneStorage.getEscort(user).profileStatsTime;
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
