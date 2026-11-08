import {WWBrowserStorage} from "./core/browserStorage";
import {google} from "../common/google";
import {IS_MOBILE_VIEW} from "../common/globals";
import {utils} from "../common/utils";
import {addSearchLoader, addContinueButton, withRetry} from "./core/searchUI";
import {ImageResult, ImageSearchError} from "./core/linksFilter";
import {lensSelection} from "./search/lensSelection";
import {lensPage} from "./search/lensPage";

interface ImageSearchData {
  wwid: string;
  imgs: string[];
  count: number;
  locked?: boolean;
  manual?: boolean;
}

interface LockCheckData {
  locked?: boolean;
  [key: string]: any;
}

const STORAGE_KEY_IMG_SEARCH = `ww:img_search_started_for`;
const topOffset = IS_MOBILE_VIEW ? 0 : 20;
const EXACT_BUTTON_TIMEOUT_MS = 3000;
const EXACT_AVAILABLE_TIMEOUT_MS = 5000;
const EXACT_SELECT_TIMEOUT_MS = 5000;
const PROGRESS_TIMEOUT_MS = 5000;
const EXACT_RESULTS_TIMEOUT_MS = 8000;

function getStorageLock(): Promise<void> {
  return new Promise<void>(resolve => {
    const intervalId: number = window.setInterval(() => {
      WWBrowserStorage.get(STORAGE_KEY_IMG_SEARCH).then((data: { [key: string]: any }) => {
        const lockData = data[STORAGE_KEY_IMG_SEARCH] as LockCheckData | undefined;
        if (lockData?.locked) {
          return;
        }

        WWBrowserStorage.set(STORAGE_KEY_IMG_SEARCH, {
          ...(data[STORAGE_KEY_IMG_SEARCH] || {}),
          locked: true,
        }).then(() => {
          clearInterval(intervalId);
          resolve();
        }).catch(error => {
          console.error("Failed to set storage lock:", error);
          clearInterval(intervalId);
        });

      }).catch(error => {
        console.error("Failed to get storage for lock check:", error);
        clearInterval(intervalId);
      });
    }, 50);
  });
}

function releaseStorageLock(): Promise<void> {
  return WWBrowserStorage.get(STORAGE_KEY_IMG_SEARCH).then((data: { [key: string]: any }) => {
    return WWBrowserStorage.set(STORAGE_KEY_IMG_SEARCH, {
      ...(data[STORAGE_KEY_IMG_SEARCH] || {}),
      locked: false,
    });
  }).catch(error => {
    console.error("Failed to release storage lock:", error);
    return Promise.reject(error);
  });
}

function deduplicateResults<T>(results: T[]): T[] {
  const seen = new Set<string>();
  return results.filter(item => {
    if (isImageSearchError(item)) {
      return true;
    }

    const key = JSON.stringify(item);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function isImageSearchError(item: unknown): item is ImageSearchError {
  return typeof item === 'object'
    && item !== null
    && !Array.isArray(item)
    && (item as ImageSearchError).type === 'err';
}

function getDesktopExactLink(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('[aria-describedby="reverse-image-search-button-tooltip"]')
    ?? lensPage.getExactMatchTextElement();
}

function getMobileExactLink(): HTMLElement | null {
  return lensPage.getExactMatchTextElement();
}

function waitForCondition(checkFn: () => boolean, intervalMs: number): Promise<void> {
  return new Promise<void>(resolve => {
    const intervalId = window.setInterval(() => {
      if (checkFn()) {
        clearInterval(intervalId);
        resolve();
      }
    }, intervalMs);
  });
}

function waitForConditionOrTimeout(checkFn: () => boolean, intervalMs: number, timeoutMs: number): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    if (checkFn()) {
      resolve(true);
      return;
    }

    const deadline = Date.now() + timeoutMs;
    const intervalId = window.setInterval(() => {
      if (checkFn()) {
        clearInterval(intervalId);
        resolve(true);
        return;
      }

      if (Date.now() >= deadline) {
        clearInterval(intervalId);
        resolve(false);
      }
    }, intervalMs);
  });
}

function hasNoResults(): boolean {
  const hasErrorElement = document.querySelector(
    '[alt="Failure info image"], [alt="Imagine cu informații despre eroare"], [id="OotqVd"], [data-psd-lens-error-card]'
  );

  if (hasErrorElement) {
    return true;
  }

  const noExactMatchesTexts = [
    'Nu au fost găsite potriviri exacte',
    'No exact matches were found',
  ];
  return Array.from(document.querySelectorAll<HTMLElement>('[role="heading"]')).some(element => {
    const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    return noExactMatchesTexts.some(noExactMatchesText => text.includes(noExactMatchesText));
  });
}

function hasSearchError(): boolean {
  const searchErrorTexts = [
    'Something went wrong',
    'A apărut o eroare',
  ];

  return Array.from(document.querySelectorAll<HTMLElement>('[role="heading"]')).some(element => {
    const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    return searchErrorTexts.includes(text);
  });
}

function isPubli24Result(result: ImageResult): boolean {
  if (Array.isArray(result)) {
    return (result as [string, string])[0].toLowerCase() === 'publi24';
  }
  return result.includes('publi24.ro');
}

function isPubli24AdPageResult(anchor: HTMLAnchorElement): boolean {
  const secondDiv = anchor.querySelector<HTMLElement>('.wyccme > div:nth-child(2)');

  if (!secondDiv) {
    // The exact-match result layout has no listing metadata; keep it.
    return true;
  }

  const spans = secondDiv.querySelectorAll(':scope > span');

  if (spans.length >= 3) {
    return true;
  }

  if (spans.length === 1) {
    const match = spans[0].textContent?.trim().match(/(\d+)\s+x\s+(\d+)/);
    if (match) {
      return parseInt(match[1], 10) > 300 || parseInt(match[2], 10) > 550;
    }
  }

  return false;
}

function filterPubli24AdPageResults(isMobile: boolean, results: ImageResult[]): ImageResult[] {
  const selector = isMobile
    ? '[id="rso"] [href][data-hveid]'
    : 'li > a';
  const anchors = Array.from(document.body.querySelectorAll<HTMLAnchorElement>(selector));

  return results.filter(result => {
    if (!isPubli24Result(result)) {
      return true;
    }

    const url = getResultUrl(result);
    const anchor = anchors.find(a => a.getAttribute('href') === url);
    if (!anchor) {
      return true;
    }

    return isPubli24AdPageResult(anchor);
  });
}

function getDesktopResults(): ImageResult[] {
  const linkItems: NodeListOf<HTMLAnchorElement> = document.body.querySelectorAll<HTMLAnchorElement>('li > a');
  return Array.from(linkItems)
    .map((n) => n.getAttribute('href'))
    .filter((href): href is string => href !== null);
}

function getMobileSiteName(anchor: HTMLAnchorElement): string {
  const siteNameElement = anchor.querySelector('.wyccme div:last-child');
  const siteName = siteNameElement?.textContent?.trim();

  if (siteName) {
    return siteName;
  }

  const leaf = Array.from(anchor.querySelectorAll('div'))
    .find(element => {
      const text = element.textContent?.trim() ?? '';
      return element.children.length === 0
        && text.length > 0
        && text.length <= 30
        && !/^\d+\s*x\s*\d+$/.test(text);
    });

  return leaf?.textContent?.trim() ?? '';
}

function getMobileResults(): ImageResult[] {
  const linkItems: NodeListOf<HTMLAnchorElement> = document.body.querySelectorAll<HTMLAnchorElement>('[id="rso"] [href][data-hveid]');
  return Array.from(linkItems)
    .map((n): ImageResult | null => {
      const href = n.getAttribute('href');
      if (href === null) return null;
      if (google.isRedirectPath(href)) {
        return [getMobileSiteName(n), href];
      }
      return href;
    })
    .filter((r): r is ImageResult => r !== null);
}

function getResultUrl(result: ImageResult): string {
  return Array.isArray(result) ? result[1] : result;
}

function getResults(isMobile: boolean): ImageResult[] {
  return isMobile ? getMobileResults() : getDesktopResults();
}

function areLinksFullyLoaded(results: ImageResult[]): boolean {
  if (results.length === 0) {
    return false;
  }

  return results.every(result => {
    const url = getResultUrl(result);
    return !url.startsWith('/') || google.isRedirectPath(url);
  });
}

function getResultSignature(isMobile: boolean): string {
  return JSON.stringify(getResults(isMobile).map(getResultUrl));
}

function waitForResultsChange(isMobile: boolean, previousSignature: string | null, timeoutMs: number): Promise<ImageResult[]> {
  return new Promise<ImageResult[]>(resolve => {
    const deadline = Date.now() + timeoutMs;
    let lastSignature = '';
    let stableSince = Date.now();

    const intervalId = window.setInterval(() => {
      const results = getResults(isMobile);
      const signature = JSON.stringify(results.map(getResultUrl));
      const changed = previousSignature === null || signature !== previousSignature;
      const noResultsOrError = hasNoResults() || hasSearchError();

      if (signature !== lastSignature) {
        lastSignature = signature;
        stableSince = Date.now();
      }

      // Lens can end up with an empty exact-match result set. Waiting for a
      // non-empty signature in that case would keep us blocked until the
      // timeout, delaying the continue button on mobile.
      const settled = noResultsOrError
        || (changed
          && signature !== '[]'
          && areLinksFullyLoaded(results)
          && Date.now() - stableSince >= 500);

      if (settled || Date.now() >= deadline) {
        clearInterval(intervalId);
        resolve(results);
      }
    }, 100);
  });
}

async function readImageLinks(isMobile: boolean, done: (results: ImageResult[]) => void): Promise<void> {
  try {
    if (isMobile) {
      await lensSelection.expandToFullImage();
    }

    const getExactButton = (): HTMLElement | null => (isMobile ? getMobileExactLink() : getDesktopExactLink());
    const isExactSelected = (): boolean => {
      const button = getExactButton();
      return !!button && lensPage.isExactMatchSelected(button);
    };

    const hasExactButton = await waitForConditionOrTimeout(() => !!getExactButton(), 50, EXACT_BUTTON_TIMEOUT_MS);

    if (!hasExactButton) {
      console.error("Exact match button not found.");
      done([]);
      return;
    }

    const isExactActionable = (): boolean => {
      const button = getExactButton();
      return !!button && lensPage.isExactMatchActionable(button);
    };

    // Lens may render the exact tab before it has a usable link.
    await waitForConditionOrTimeout(isExactActionable, 100, EXACT_AVAILABLE_TIMEOUT_MS);

    // Lens selects the exact tab by itself for some images (notably Firefox
    // with a full-image crop). Clicking it again would restart a search that
    // never completes, so only click when it is not already selected.
    const alreadySelected = isExactSelected();
    const previousSignature = alreadySelected ? null : getResultSignature(isMobile);

    if (alreadySelected) {
      utils.debugLog('Exact matches are already selected; waiting for their results.');
    } else {
      (getExactButton() as HTMLElement).click();

      utils.debugLog('Waiting for exact button to be selected...');
      await waitForConditionOrTimeout(isExactSelected, 50, EXACT_SELECT_TIMEOUT_MS);
    }

    await utils.sleep(50);

    utils.debugLog('Waiting for progress bars to be gone...');
    await waitForConditionOrTimeout(
      () => !document.querySelector('[id="rso"] [role="progressbar"]'),
      50,
      PROGRESS_TIMEOUT_MS
    );

    utils.debugLog('Waiting for the exact result set to replace the visual one...');
    const results = await waitForResultsChange(isMobile, previousSignature, EXACT_RESULTS_TIMEOUT_MS);

    if (hasSearchError() || hasNoResults()) {
      done([]);
      return;
    }

    const filtered = filterPubli24AdPageResults(isMobile, results);
    done(filtered);
  } catch (error) {
    console.error("Error reading image links:", error);
    done([]);
  }
}

async function parseResults(wwid: string): Promise<void> {
  const callback = (results: ImageResult[]): void => {
    getStorageLock().then(() => {
      const imageResultsKey = `ww:image_results:${wwid}`;

      WWBrowserStorage.get([imageResultsKey, STORAGE_KEY_IMG_SEARCH]).then((data: { [key: string]: any }) => {
        let currentImageResults: Array<ImageResult | ImageSearchError> =
          (data[imageResultsKey] as Array<ImageResult | ImageSearchError> | undefined) || [];
        let resultEntries: Array<ImageResult | ImageSearchError> = results;
        if (hasSearchError()) {
          resultEntries = [{type: 'err'}];
        }
        let combinedData = deduplicateResults([...currentImageResults, ...resultEntries]);

        WWBrowserStorage.set(imageResultsKey, combinedData).then(() => {
          releaseStorageLock();
          setTimeout(async () => {
            const searchStatusKey = `ww:img_search_started_for`;
            await WWBrowserStorage.get(searchStatusKey).then(searchStatusData => {
              const searchStatus = searchStatusData[searchStatusKey];

              const newCount = searchStatus.count - 1;
              const imgs = searchStatus.imgs;
              const isManual = searchStatus.manual ?? false;

              WWBrowserStorage.set(searchStatusKey, {
                wwid: searchStatus.wwid,
                imgs,
                count: newCount,
                manual: isManual,
              }).then(() => {
                console.log('Done. Found: ' + results.length);
                console.log('Found: ' + results.join('\n'));

                if (IS_MOBILE_VIEW && newCount !== 0) {
                  const nextImageIndex = imgs.length - newCount;
                  if (nextImageIndex >= 0 && nextImageIndex < imgs.length) {
                    console.log('Next: ', imgs[nextImageIndex]);
                    if (isManual) {
                      addContinueButton(() => {
                        window.location.href = imgs[nextImageIndex];
                      });
                    } else {
                      window.location.href = imgs[nextImageIndex];
                    }
                  } else {
                    console.warn("Calculated next image index is out of bounds. Closing window.");
                    if (isManual) {
                      addContinueButton(() => {
                        window.close();
                      });
                    } else {
                      window.close();
                    }
                  }
                } else {
                  console.warn("Closing window.");
                  if (isManual) {
                    addContinueButton(() => {
                      window.close();
                    });
                  } else {
                    window.close();
                  }
                }
              }).catch(error => {
                console.error("Error setting search status:", error);
              });

            }).catch(error => {
              console.error("Error getting search status:", error);
            });
          }, Math.round(Math.random() * 100)); // Randomized delay avoid race conditions.
        }).catch(error => {
          console.error("Error setting image results:", error);
          releaseStorageLock();
        });
      }).catch(error => {
        console.error("Error getting image results:", error);
        releaseStorageLock();
      });
    });
  };

  console.log('Running');

  let isMobile = false;
  let isDesktop = false;

  await waitForCondition(() => {
    isMobile = !!getMobileExactLink();
    isDesktop = !!getDesktopExactLink();
    return isMobile || isDesktop;
  }, 50);

  if (isMobile) {
    console.log('.. on mobile');
    readImageLinks(true, callback);
  } else if (isDesktop) {
    console.log('.. on desktop');
    readImageLinks(false, callback);
  } else {
    console.warn("Could not determine view type (mobile/desktop) or find trigger element.");
  }
}

WWBrowserStorage.get(STORAGE_KEY_IMG_SEARCH).then((data: { [key: string]: any }) => {
  const searchData = data[STORAGE_KEY_IMG_SEARCH] as ImageSearchData | undefined;

  if (searchData && searchData.count && searchData.count > 0 && searchData.wwid) {
    parseResults(searchData.wwid);
    const isManual = searchData.manual ?? false;

    if (isManual && !IS_MOBILE_VIEW) {
      withRetry(() => addSearchLoader(`căutare după poze ..`, isManual, 100, topOffset));
    }
    else if (IS_MOBILE_VIEW) {
      const count = searchData.count;
      const length = searchData.imgs?.length || 0;

      if (length > 0) {
        const percent =((length - count + 1) / length) * 100;
        withRetry(() => addSearchLoader(`căutare după poze (${length - count + 1}/${length}) ..`, isManual, percent, topOffset));
      }
    }
  } else {
    console.log("No active image search found, or count is zero, or wwid missing.");
  }
}).catch(error => {
  console.error("Failed to retrieve initial image search state:", error);
});
