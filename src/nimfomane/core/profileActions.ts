import {elementHelpers} from "./elementHelpers";
import {NimfomaneStorage, EscortItem} from "./storage";
import {sectionsService} from "./sectionsService";
import {page, BrowserError} from "../../common/page";
import {jsonPage} from "./jsonPage";
import {NimfomaneMemoryStorage} from "./memoryStorage";

const CACHE_DURATION = 24 * 60 * 60 * 1000;

type AvailabilityStatus = 'available' | 'unavailable';

const UNAVAILABLE_PATTERN = /\b(?:indisponibil\w*|am\s+plecat|nu\s+(?:mai\s+)?(?:sunt\s+)?disponibil\w*)\b/;
const AVAILABLE_PATTERN = /\b(?:am\s+ajuns|disponibil\w*|ma\s+gasiti|va\s+astept)\b/;

function normalizeActivityText(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
}

function getAvailabilityStatus(text: string): AvailabilityStatus | undefined {
  const normalizedText = normalizeActivityText(text);

  if (UNAVAILABLE_PATTERN.test(normalizedText)) {
    return 'unavailable';
  }

  if (AVAILABLE_PATTERN.test(normalizedText)) {
    return 'available';
  }

  return undefined;
}

function findCurrentCity(doc: Document): {name: string; topicUrl: string} | undefined {
  const streamItems = doc.querySelectorAll('.ipsStreamItem_status a:last-child');
  const cityLinks: Array<{url: string; city: string; topicUrl: string}> = [];
  const citiesWithStatus = new Set<string>();
  let hasAvailabilityStatus = false;

  for (const link of Array.from(streamItems)) {
    const href = (link as HTMLAnchorElement).href;
    const city = sectionsService.getCityFromForumUrl(href);

    if (city) {
      const streamItem = link.closest('.ipsStreamItem');
      const topicLink = streamItem?.querySelector<HTMLAnchorElement>('.ipsStreamItem_title a[data-linktype="link"]');
      const topicUrl = topicLink?.href;

      if (topicUrl) {
        cityLinks.push({url: href, city, topicUrl});

        if (!citiesWithStatus.has(city)) {
          const activityText = streamItem?.querySelector('.ipsStreamItem_snippet')?.textContent
            || streamItem?.textContent
            || '';
          const status = getAvailabilityStatus(activityText);

          if (status) {
            hasAvailabilityStatus = true;
            citiesWithStatus.add(city);

            if (status === 'available') {
              return {
                name: city,
                topicUrl,
              };
            }
          }
        }
      }
    }
  }

  if (hasAvailabilityStatus) {
    return undefined;
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
      const currentCity = findCurrentCity(doc);
      if (currentCity) {
        const existing = NimfomaneStorage.getEscort(user).profileStats || {};
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
