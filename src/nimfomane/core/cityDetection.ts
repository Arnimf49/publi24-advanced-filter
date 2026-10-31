import {sectionsService} from './sectionsService';

type AvailabilityStatus = 'available' | 'unavailable';

export type VisitEndSignal = {
  kind: 'unavailable' | 'lastDay' | 'lastDays';
  days?: number;
  endOffsetDays: number;
};

const UNAVAILABLE_PATTERN = /\b(?:indisponibil\w*|am\s+plecat|nu\s+(?:mai\s+)?(?:sunt\s+)?disponibil\w*)\b/;
const AVAILABLE_PATTERN = /\b(?:am\s+ajuns|disponibil\w*|locuri\s+disponibil\w*|ma\s+gasiti|va\s+astept)\b/;
const LAST_DAYS_PATTERN = /\bultimele\s+(\d{1,2})\s+(?:de\s+)?zile\b/;
const LAST_DAY_PATTERN = /\bultima\s+zi(?:i|le)?\b/;
const TOMORROW_PATTERN = /\bmaine\b/;
const DAY_MS = 24 * 60 * 60 * 1000;

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

function getVisitEndSignal(text: string): VisitEndSignal | undefined {
  const normalizedText = normalizeActivityText(text);

  if (UNAVAILABLE_PATTERN.test(normalizedText)) {
    return {kind: 'unavailable', endOffsetDays: 0};
  }

  const lastDaysMatch = LAST_DAYS_PATTERN.exec(normalizedText);
  if (lastDaysMatch) {
    const days = Number.parseInt(lastDaysMatch[1], 10);
    return {
      kind: 'lastDays',
      days,
      endOffsetDays: Math.max(0, days - 1),
    };
  }

  const lastDayMatch = LAST_DAY_PATTERN.exec(normalizedText);
  if (lastDayMatch) {
    const contextStart = Math.max(0, lastDayMatch.index - 30);
    const contextEnd = lastDayMatch.index + lastDayMatch[0].length + 30;
    const isTomorrow = TOMORROW_PATTERN.test(normalizedText.slice(contextStart, contextEnd));
    return {kind: 'lastDay', endOffsetDays: isTomorrow ? 1 : 0};
  }

  return undefined;
}

function getVisitEndTime(signal: VisitEndSignal, postDate?: number): number | undefined {
  if (postDate === undefined) {
    return undefined;
  }

  if (signal.kind === 'unavailable') {
    return postDate;
  }

  const endOfPostDay = new Date(postDate);
  endOfPostDay.setHours(24, 0, 0, 0);

  return endOfPostDay.getTime() + signal.endOffsetDays * DAY_MS;
}

type CurrentCity = {
  name: string;
  topicUrl: string;
  unavailable?: true;
};

type CityLink = {
  url: string;
  city: string;
  topicUrl: string;
  topicTitle: string;
  date?: number;
  streamItem: Element;
};

function getCityLinks(doc: Document): CityLink[] {
  const cityLinks: CityLink[] = [];

  for (const link of Array.from(doc.querySelectorAll('.ipsStreamItem_status a:last-child'))) {
    const anchor = link as HTMLAnchorElement;
    const city = sectionsService.getCityFromForumUrl(anchor.href);
    const streamItem = link.closest('.ipsStreamItem');
    const topicLink = streamItem?.querySelector<HTMLAnchorElement>('.ipsStreamItem_title a[data-linktype="link"]');
    const datetime = streamItem?.querySelector('.ipsStreamItem_meta time')?.getAttribute('datetime');
    const date = datetime ? Date.parse(datetime) : undefined;

    if (city && streamItem && topicLink?.href) {
      cityLinks.push({
        url: anchor.href,
        city,
        topicUrl: topicLink.href,
        topicTitle: topicLink.textContent?.trim() || '',
        date: date !== undefined && !Number.isNaN(date) ? date : undefined,
        streamItem,
      });
    }
  }

  return cityLinks;
}

function getActivityText(cityLink: CityLink): string {
  return cityLink.streamItem.querySelector('.ipsStreamItem_snippet')?.textContent
    || cityLink.streamItem.textContent
    || '';
}

function getCityLinkStatus(cityLink: CityLink, now: number): AvailabilityStatus | undefined {
  const activityText = getActivityText(cityLink);
  const status = getAvailabilityStatus(cityLink.topicTitle)
    ?? getAvailabilityStatus(activityText);

  if (status !== 'available') {
    return status;
  }

  const signal = getVisitEndSignal(cityLink.topicTitle) ?? getVisitEndSignal(activityText);
  if (!signal || signal.kind === 'unavailable') {
    return status;
  }

  const endTime = getVisitEndTime(signal, cityLink.date);
  if (endTime !== undefined && now >= endTime) {
    return 'unavailable';
  }

  return status;
}

function findCurrentCity(doc: Document, now: number = Date.now()): CurrentCity | undefined {
  const cityLinks = getCityLinks(doc);

  for (const cityLink of cityLinks) {
    const status = getCityLinkStatus(cityLink, now);

    if (status) {
      return {
        name: cityLink.city,
        topicUrl: cityLink.topicUrl,
        ...(status === 'unavailable' ? {unavailable: true as const} : {}),
      };
    }
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

  getAvailableCityFromElement(
    element: Element,
    fallbackUrl?: string,
    availabilityElement: Element = element,
  ): string | undefined {
    if (getAvailabilityStatus(availabilityElement.textContent || '') !== 'available') {
      return undefined;
    }

    return this.getCityFromElement(element, fallbackUrl);
  },

  getCityHistory(doc: Document): string[] {
    return getCityLinks(doc).map(cityLink => cityLink.city);
  },

  getAvailabilityStatus(text: string): AvailabilityStatus | undefined {
    return getAvailabilityStatus(text);
  },

  getVisitEndSignal(text: string): VisitEndSignal | undefined {
    return getVisitEndSignal(text);
  },

  findCurrentCity,
};
