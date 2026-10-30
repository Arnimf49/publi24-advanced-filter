import {cityDetection} from './cityDetection';
import type {PauseEntry, VisitedCity} from './storage';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_VISITED_CITIES = 32;
const MIN_PAUSE_DAYS = 2;

export interface CityActivityPost {
  city: string;
  date?: number;
  text: string;
}

export interface CityTimelineResult {
  visitedCities: VisitedCity[];
  currentCitySince?: number;
  currentPauseSince?: number;
}

interface CityVisit {
  city: string;
  startDate?: number;
  endDate?: number;
  hasEndSignal: boolean;
}

function getDayDiff(start?: number, end?: number): number | undefined {
  if (start === undefined || end === undefined) {
    return undefined;
  }

  return Math.ceil((end - start) / DAY_MS);
}

function createVisit(post: CityActivityPost): CityVisit {
  const signal = cityDetection.getVisitEndSignal(post.text);

  return {
    city: post.city,
    startDate: post.date,
    endDate: post.date === undefined
      ? undefined
      : post.date + (signal?.endOffsetDays ?? 0) * DAY_MS,
    hasEndSignal: signal !== undefined,
  };
}

function build(posts: CityActivityPost[], now: number = Date.now()): CityTimelineResult {
  const visits: CityVisit[] = [];
  let currentVisit: CityVisit | undefined;

  for (const post of posts) {
    const signal = cityDetection.getVisitEndSignal(post.text);

    if (!currentVisit || currentVisit.city !== post.city || signal !== undefined) {
      if (currentVisit && visits.length >= MAX_VISITED_CITIES) {
        break;
      }

      currentVisit = createVisit(post);
      visits.push(currentVisit);
    } else {
      currentVisit.startDate = post.date ?? currentVisit.startDate;
    }
  }

  const mergedVisits: CityVisit[] = [];

  for (const visit of visits) {
    const newerVisit = mergedVisits.at(-1);
    const pauseDays = newerVisit
      ? getDayDiff(visit.endDate, newerVisit.startDate)
      : undefined;

    if (
      newerVisit
      && newerVisit.city === visit.city
      && (pauseDays === undefined || pauseDays < MIN_PAUSE_DAYS)
    ) {
      newerVisit.startDate = visit.startDate ?? newerVisit.startDate;
      continue;
    }

    mergedVisits.push(visit);
  }

  const visitedCities: VisitedCity[] = [];

  for (let index = 0; index < mergedVisits.length; index++) {
    const visit = mergedVisits[index];
    const stayDays = Math.max(1, getDayDiff(visit.startDate, visit.endDate) ?? 1);
    visitedCities.push([visit.city, stayDays]);

    const olderVisit = mergedVisits[index + 1];
    if (!olderVisit) {
      continue;
    }

    const pauseDays = getDayDiff(olderVisit.endDate, visit.startDate);
    if (pauseDays !== undefined && pauseDays >= MIN_PAUSE_DAYS) {
      visitedCities.push({pause: pauseDays});
    }
  }

  const newestVisit = mergedVisits[0];
  let currentCitySince: number | undefined;
  let currentPauseSince: number | undefined;

  if (newestVisit) {
    const hasEnded = newestVisit.hasEndSignal
      && newestVisit.endDate !== undefined
      && now >= newestVisit.endDate;

    if (hasEnded) {
      currentPauseSince = newestVisit.endDate;
    } else {
      currentCitySince = newestVisit.startDate;
    }
  }

  return {visitedCities, currentCitySince, currentPauseSince};
}

function isPause(entry: VisitedCity): entry is PauseEntry {
  return typeof entry === 'object' && !Array.isArray(entry) && typeof entry.pause === 'number';
}

function getOngoingDays(since: number, now: number = Date.now()): number {
  return Math.max(1, Math.ceil(Math.max(0, now - since) / DAY_MS));
}

export const cityTimeline = {
  build,
  isPause,
  getOngoingDays,
};
