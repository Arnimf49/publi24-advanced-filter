import {sectionsService} from './sectionsService';

type AvailabilityStatus = 'available' | 'unavailable';

const UNAVAILABLE_PATTERN = /\b(?:indisponibil\w*|am\s+plecat|nu\s+(?:mai\s+)?(?:sunt\s+)?disponibil\w*)\b/;
const AVAILABLE_PATTERN = /\b(?:am\s+ajuns|disponibil\w*|locuri\s+disponibil\w*|ma\s+gasiti|va\s+astept)\b/;

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

type CityLink = {
  url: string;
  city: string;
  topicUrl: string;
  streamItem: Element;
};

function getCityLinks(doc: Document): CityLink[] {
  const cityLinks: CityLink[] = [];

  for (const link of Array.from(doc.querySelectorAll('.ipsStreamItem_status a:last-child'))) {
    const anchor = link as HTMLAnchorElement;
    const city = sectionsService.getCityFromForumUrl(anchor.href);
    const streamItem = link.closest('.ipsStreamItem');
    const topicLink = streamItem?.querySelector<HTMLAnchorElement>('.ipsStreamItem_title a[data-linktype="link"]');

    if (city && streamItem && topicLink?.href) {
      cityLinks.push({url: anchor.href, city, topicUrl: topicLink.href, streamItem});
    }
  }

  return cityLinks;
}

function findCurrentCity(doc: Document): {name: string; topicUrl: string} | undefined {
  const cityLinks = getCityLinks(doc);
  const citiesWithStatus = new Set<string>();
  let hasAvailabilityStatus = false;

  for (const cityLink of cityLinks) {
    if (!citiesWithStatus.has(cityLink.city)) {
      const activityText = cityLink.streamItem.querySelector('.ipsStreamItem_snippet')?.textContent
        || cityLink.streamItem.textContent
        || '';
      const status = getAvailabilityStatus(activityText);

      if (status) {
        hasAvailabilityStatus = true;
        citiesWithStatus.add(cityLink.city);

        if (status === 'available') {
          return {
            name: cityLink.city,
            topicUrl: cityLink.topicUrl,
          };
        }
      }
    }
  }

  if (hasAvailabilityStatus) {
    return undefined;
  }

  for (let i = 0; i < cityLinks.length - 2; i++) {
    if (
      cityLinks[i].city === cityLinks[i + 1].city
      && cityLinks[i].city === cityLinks[i + 2].city
    ) {
      return {
        name: cityLinks[i].city,
        topicUrl: cityLinks[i].topicUrl,
      };
    }
  }

  return undefined;
}

export const cityDetection = {
  getCityFromElement(element: Element, fallbackUrl?: string): string | undefined {
    let current: Element | null = element;
    while (current) {
      for (const link of Array.from(current.querySelectorAll<HTMLAnchorElement>('a[href]'))) {
        const city = sectionsService.getCityFromForumUrl(link.href);
        if (city) {
          return city;
        }
      }

      current = current.parentElement;
    }

    return fallbackUrl ? sectionsService.getCityFromForumUrl(fallbackUrl) || undefined : undefined;
  },

  getAvailableCityFromElement(element: Element, fallbackUrl?: string): string | undefined {
    if (getAvailabilityStatus(element.textContent || '') !== 'available') {
      return undefined;
    }

    return this.getCityFromElement(element, fallbackUrl);
  },

  getCityHistory(doc: Document): string[] {
    return getCityLinks(doc).map(cityLink => cityLink.city);
  },

  findCurrentCity,
};
