import {adData} from "./adData";
import {google} from "../../common/google";
import {dateLib} from "./dateLib";
import {WWStorage} from "./storage";
import type {Publi24Status, Publi24StatusEntry, Publi24StatusValue} from "./storage";
import {WWBrowserStorage} from "./browserStorage";
import {bgApi} from "../../common/background/bgApi";
import {ImageResult, ImageSearchError, linksFilter} from "./linksFilter";
import {WWMemoryStorage} from "./memoryStorage";
import {utils} from "../../common/utils";

const GOTO_RESOLVE_DELAY_MS = 1000;
const GOTO_WAIT_INCREMENT_MS = 20;

function isImageResult(result: ImageResult | ImageSearchError): result is ImageResult {
  return typeof result === 'string' || Array.isArray(result);
}

function getImageResultUrl(result: ImageResult): string {
  return Array.isArray(result) ? google.toAbsoluteUrl(result[1]) : result;
}

function isGotoResult(result: ImageResult): boolean {
  return Array.isArray(result)
    && linksFilter.isPubli24Result(result)
    && google.isDomain(getImageResultUrl(result));
}

async function loadCurrentAdAnalysisMeta(item: Element): Promise<{ location: string, date: Date | null }> {
  let location = adData.getItemLocation(item);
  let date: Date | null = null;

  try {
    const page = await adData.loadInAdPage(item);
    location = adData.getItemLocation(page, true) || location;
    const pageDate = adData.getPageDate(page);
    date = dateLib.isValidDate(pageDate) ? pageDate : null;
  } catch (error) {
    console.error('Error loading current ad analysis metadata:', error);
  }

  return { location, date };
}

async function analyzePubli24AdLink(
  link: string,
  currentAd: { location: string, date: Date | null },
): Promise<{ status: Publi24StatusValue | null, city: string | null }> {
  let page: Document;

  try {
    page = await adData.loadInAdPage(null, link);
  } catch (error: any) {
    if (error?.code === 404 || error?.code === 410) {
      return { status: 'dead', city: null };
    }

    console.error(`Error loading publi24 ad "${link}":`, error);
    return { status: null, city: null };
  }

  const location = adData.getItemLocation(page, true);
  const locationParts = adData.getItemLocationParts(page, true);
  const pageDate = adData.getPageDate(page);

  if (!location || !dateLib.isValidDate(pageDate)) {
    return { status: null, city: null };
  }

  if (!currentAd.location) {
    return { status: null, city: null };
  }

  if (location !== currentAd.location && !(location.includes('Sector') && currentAd.location.includes('Sector'))) {
    if (!dateLib.isValidDate(currentAd.date)) {
      return { status: null, city: null };
    }

    // dateDiff = current ad date - duplicate page date.
    // Below 2 means the duplicate is recent/not old -> unsafe.
    const dateDiff = dateLib.dayDiff(pageDate, currentAd.date);
    if (Number.isNaN(dateDiff)) {
      return { status: null, city: null };
    }

    return {
      status: dateDiff < 2 ? 'dup_n_old' : 'dup_old',
      city: locationParts[0] ?? null,
    };
  }

  return { status: 'safe', city: null };
}

function createStatusWriter(id: string, statuses: Publi24StatusEntry[]) {
  let queue: Promise<void> = Promise.resolve();

  const snapshot = (): Publi24StatusEntry[] => statuses.map(entry => entry ? {
    status: entry.status,
    ...(entry.city ? { city: entry.city } : {}),
  } : null);

  return {
    set(index: number, status: Publi24StatusValue | null, city: string | null = null): Promise<void> {
      const entry: Publi24Status | null = status === null
        ? null
        : {
            status,
            ...(city && (status === 'dup_old' || status === 'dup_n_old') ? { city } : {}),
          };
      statuses[index] = entry;
      const data = snapshot();

      queue = queue
        .then(() => WWStorage.setAdPubli24Statuses(id, data))
        .catch((error) => {
          console.error('Error writing publi24 image statuses:', error);
        });

      return queue;
    },

    flush(): Promise<void> {
      return queue;
    },
  };
}

export const publi24ImageAnalysis = {
  async analyzeFoundImages(id: string, item: Element): Promise<void> {
    WWMemoryStorage.setAnalyzeImagesLoading(id, true);

    let statusWriter: ReturnType<typeof createStatusWriter> | null = null;
    let statuses: Publi24StatusEntry[] | null = null;
    let imageResultsQueue: Promise<void> = Promise.resolve();
    const sameAdIndexes = new Set<number>();

    try {
      const imageResultsKey = `ww:image_results:${id}`;
      const stored: { [key: string]: Array<ImageResult | ImageSearchError> } = await WWBrowserStorage.get(imageResultsKey);
      const storedResults: Array<ImageResult | ImageSearchError> =
        (stored[imageResultsKey] as Array<ImageResult | ImageSearchError> | undefined) || [];
      const publi24Entries: Array<{ result: ImageResult, rawIndex: number }> = [];

      storedResults.forEach((result, rawIndex) => {
        if (isImageResult(result) && linksFilter.isPubli24Result(result)) {
          publi24Entries.push({ result, rawIndex });
        }
      });

      const publi24Results: ImageResult[] = publi24Entries.map(({ result }) => result);

      statuses = publi24Results.map(() => null);
      await WWStorage.setAdPubli24Statuses(id, statuses.map(() => null));

      if (publi24Results.length === 0) {
        return;
      }

      statusWriter = createStatusWriter(id, statuses);

      const persistImageResults = (): Promise<void> => {
        const snapshot = storedResults.map(entry => Array.isArray(entry) ? [entry[0], entry[1]] : entry);

        imageResultsQueue = imageResultsQueue
          .then(() => WWBrowserStorage.set(imageResultsKey, snapshot))
          .then(() => WWStorage.triggerAdChanged(id))
          .catch((error) => {
            console.error('Error writing resolved publi24 image results:', error);
          });

        return imageResultsQueue;
      };

      const setResolvedResultUrl = (statusIndex: number, resolvedUrl: string): void => {
        const entry = publi24Entries[statusIndex];

        if (!entry || !Array.isArray(entry.result)) {
          return;
        }

        storedResults[entry.rawIndex] = [entry.result[0], resolvedUrl];
        persistImageResults();
      };

      const itemUrl = adData.getItemUrl(item);
      const currentAd = await loadCurrentAdAnalysisMeta(item);

      publi24Results.forEach((result, index) => {
        if (linksFilter.isSameAdResult(result, itemUrl)) {
          sameAdIndexes.add(index);
        }
      });

      const directIndexes: number[] = [];
      const gotoIndexes: number[] = [];

      publi24Results.forEach((result, index) => {
        if (sameAdIndexes.has(index)) {
          return;
        }

        if (isGotoResult(result)) {
          gotoIndexes.push(index);
        } else {
          directIndexes.push(index);
        }
      });

      await Promise.all(directIndexes.map(async (index) => {
        try {
          const result = publi24Results[index];
          const link = getImageResultUrl(result);
          let status: Publi24StatusValue | null;
          let city: string | null = null;

          if (!linksFilter.isPubli24Result(link)) {
            status = null;
          } else if (!linksFilter.isPubli24AdLink(link)) {
            status = 'dead';
          } else {
            const analysis = await analyzePubli24AdLink(link, currentAd);
            status = analysis.status;
            city = analysis.city;
          }

          statusWriter!.set(index, status, city);
        } catch (error) {
          console.error(`Error analyzing direct publi24 image result "${publi24Results[index]}":`, error);
          statusWriter!.set(index, null);
        }
      }));

      const processGotoIndex = async (index: number): Promise<boolean> => {
        let resolvedUrl: string | null = null;

        try {
          const result = publi24Results[index] as [string, string];
          resolvedUrl = await bgApi.resolveGotoUrl(result[1]);

          if (!resolvedUrl || google.isDomain(resolvedUrl)) {
            return false;
          }

          resolvedUrl = linksFilter.normalizePubli24Url(resolvedUrl);

          if (linksFilter.isSameAdResult(resolvedUrl, itemUrl)) {
            setResolvedResultUrl(index, resolvedUrl);
            return true;
          }

          let status: Publi24StatusValue | null;
          let city: string | null = null;

          if (!linksFilter.isPubli24Result(resolvedUrl)) {
            status = null;
          } else if (!linksFilter.isPubli24AdLink(resolvedUrl)) {
            status = 'dead';
            setResolvedResultUrl(index, resolvedUrl);
          } else {
            const analysis = await analyzePubli24AdLink(resolvedUrl, currentAd);
            status = analysis.status;
            city = analysis.city;
            setResolvedResultUrl(index, resolvedUrl);
          }

          statusWriter!.set(index, status, city);
          return true;
        } catch (error) {
          console.error(`Error analyzing resolved publi24 image result "${resolvedUrl}":`, error);
          return false;
        }
      };

      let waitMs = GOTO_RESOLVE_DELAY_MS;

      const waitForNextRequest = async (): Promise<void> => {
        await utils.sleep(waitMs);
        waitMs += GOTO_WAIT_INCREMENT_MS;
      };

      const retryIndexes: number[] = [];

      for (let i = 0; i < gotoIndexes.length; i++) {
        if (i > 0) {
          await waitForNextRequest();
        }

        const index = gotoIndexes[i];

        if (!await processGotoIndex(index)) {
          retryIndexes.push(index);
        }
      }

      let pendingRetries = retryIndexes;

      while (pendingRetries.length > 0) {
        await waitForNextRequest();

        const nextRetries: number[] = [];

        for (let i = 0; i < pendingRetries.length; i++) {
          if (i > 0) {
            await waitForNextRequest();
          }

          const index = pendingRetries[i];

          if (!await processGotoIndex(index)) {
            nextRetries.push(index);
          }
        }

        pendingRetries = nextRetries;
      }

      await Promise.all([statusWriter.flush(), imageResultsQueue]);
    }
    catch (error) {
      console.error('Error analyzing images for ad:', error);

      if (statusWriter) {
        await statusWriter.flush();
      }

      await imageResultsQueue;
    }
    finally {
      WWMemoryStorage.setAnalyzeImagesLoading(id, false);
    }
  },
};
