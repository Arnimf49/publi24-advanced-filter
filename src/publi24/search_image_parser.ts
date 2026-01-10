import {WWBrowserStorage} from "./core/browserStorage";
import {IS_MOBILE_VIEW} from "../common/globals";
import {utils} from "../common/utils";
import {addSearchLoader, addContinueButton} from "./core/searchUI";

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


function getDesktopExactLink(): HTMLButtonElement | null {
  return document.body.querySelector<HTMLButtonElement>('[aria-describedby="reverse-image-search-button-tooltip"]');
}

function getMobileExactLink(): Node | null {
  const xpath = "//*[text()='Potriviri exacte']";
  const matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  return matchingElement;
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
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

function isExactMatchButtonSelected(button: HTMLElement): boolean {
  const parent = button.parentElement;
  return parent!.hasAttribute('selected');
}

function hasNoResults(): boolean {
  return !!document.querySelector(
    '[alt="Failure info image"], [alt="Imagine cu informații despre eroare"], [id="OotqVd"], [data-psd-lens-error-card]'
  );
}

function getDesktopResults(): string[] {
  const linkItems: NodeListOf<HTMLAnchorElement> = document.body.querySelectorAll<HTMLAnchorElement>('li > a');
  return Array.from(linkItems)
    .map((n) => n.getAttribute('href'))
    .filter((href): href is string => href !== null);
}

function getMobileResults(): string[] {
  const linkItems: NodeListOf<HTMLAnchorElement> = document.body.querySelectorAll<HTMLAnchorElement>('[id="rso"] [href][data-hveid]');
  return Array.from(linkItems)
    .map((n) => n.getAttribute('href'))
    .filter((href): href is string => href !== null);
}

function areLinksFullyLoaded(isMobile: boolean): boolean {
  const getResults = isMobile ? getMobileResults : getDesktopResults;
  const links = getResults();

  if (links.length === 0) {
    return false;
  }

  return links.every(href => !href.startsWith('/'));
}

function waitForStableResults(isMobile: boolean, stabilityMs: number): Promise<string[]> {
  return new Promise<string[]>(resolve => {
    const getResults = isMobile ? getMobileResults : getDesktopResults;
    let lastResultsJson = '';
    let stableStartTime: number | null = null;

    const intervalId = window.setInterval(() => {
      const currentResults = getResults();
      const currentResultsJson = JSON.stringify(currentResults);

      if (currentResultsJson === lastResultsJson) {
        if (stableStartTime === null) {
          stableStartTime = Date.now();
        } else if (Date.now() - stableStartTime >= stabilityMs) {
          clearInterval(intervalId);
          resolve(currentResults);
        }
      } else {
        stableStartTime = null;
        lastResultsJson = currentResultsJson;
      }
    }, 50);
  });
}

async function readImageLinks(isMobile: boolean, done: (results: string[]) => void): Promise<void> {
  try {
    let exactButton = isMobile ? getMobileExactLink() : getDesktopExactLink();

    if (!exactButton) {
      console.error("Exact match button not found.");
      done([]);
      return;
    }

    (exactButton as HTMLElement).click();

    utils.debugLog('Waiting for exact button to be selected...');
    await waitForCondition(
      () => isExactMatchButtonSelected((isMobile ? getMobileExactLink() : getDesktopExactLink()) as HTMLElement),
      50
    );

    await wait(50);

    utils.debugLog('Waiting for progress bars to be gone...');
    await waitForCondition(
      () => !document.querySelector('[id="rso"] [role="progressbar"]'),
      50
    );

    await wait(50);

    utils.debugLog( 'Waiting for links to be fully loaded (none start with /)...');
    await waitForCondition(
      () => hasNoResults() || areLinksFullyLoaded(isMobile),
      50
    );

    if (hasNoResults()) {
      done([]);
      return;
    }

    const results = await waitForStableResults(isMobile, 150);
    done(results);
  } catch (error) {
    console.error("Error reading image links:", error);
    done([]);
  }
}


async function parseResults(wwid: string): Promise<void> {
  const callback = (results: string[]): void => {
    getStorageLock().then(() => {
      const imageResultsKey = `ww:image_results:${wwid}`;

      WWBrowserStorage.get(imageResultsKey).then((data: { [key: string]: any }) => {
        let currentImageResults: string[] = (data[imageResultsKey] as string[] | undefined) || [];
        let combinedData = [...currentImageResults, ...results];
        combinedData = combinedData.filter((item, pos) => combinedData.indexOf(item) === pos);

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
      addSearchLoader(`căutare după poze ..`, isManual, 100, topOffset);
    }
    else if (IS_MOBILE_VIEW) {
      const count = searchData.count;
      const length = searchData.imgs?.length || 0;

      if (length > 0) {
        const percent =((length - count + 1) / length) * 100;
        addSearchLoader(`căutare după poze (${length - count + 1}/${length}) ..`, isManual, percent, topOffset);
      }
    }
  } else {
    console.log("No active image search found, or count is zero, or wwid missing.");
  }
}).catch(error => {
  console.error("Failed to retrieve initial image search state:", error);
});
