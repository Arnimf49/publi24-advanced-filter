import {WWBrowserStorage} from "./core/browserStorage";
import {IS_MOBILE_VIEW} from "./core/globals";

interface ImageSearchData {
  wwid: string;
  imgs: string[];
  count: number;
  locked?: boolean;
}

interface LockCheckData {
  locked?: boolean;
  [key: string]: any;
}

const STORAGE_KEY_IMG_SEARCH = `ww:img_search_started_for`;

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

async function readImageLinksDesktop(_: string, done: (results: string[]) => void): Promise<void> {
  const searchExactBtn = getDesktopExactLink();
  if (!searchExactBtn) {
    console.error("Desktop exact link button not found.");
    done([]);
    return;
  }
  searchExactBtn.click();

  const intervalId: number = window.setInterval(() => {
    const hasNoResultsIcon = !!document.querySelector('[alt="Failure info image"], [alt="Imagine cu informații despre eroare"]');
    const linkItems: NodeListOf<HTMLAnchorElement> = document.body.querySelectorAll<HTMLAnchorElement>('li > a');

    if (!hasNoResultsIcon && linkItems.length === 0) {
      return;
    }

    clearInterval(intervalId);

    const resultUrls: string[] = Array.from(linkItems)
      .map((n) => n.getAttribute('href'))
      .filter((href): href is string => href !== null);
    done(resultUrls);
  }, 500);
}

function getMobileExactLink(): Node | null {
  const xpath = "//*[text()='Potriviri exacte']";
  const matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  return matchingElement;
}

function readImageLinksMobile(_: string, done: (results: string[]) => void): void {
  new Promise<void>(resolve => {
    let intervalId = window.setInterval(() => {
      const link = getMobileExactLink();
      if (link && typeof (link as HTMLElement).click === 'function') {
        (link as HTMLElement).click();
        clearInterval(intervalId);
        resolve();
      }
    }, 700);
  }).then(() => {
    setTimeout(() => {
      let attempt = 0;
      let intervalId: number | null = null;

      intervalId = window.setInterval(() => {
        const hasNoResultsIcon = !!document.querySelector('[alt="Failure info image"], [alt="Imagine cu informații despre eroare"], [id="OotqVd"], [data-psd-lens-error-card]');
        const linkItems: NodeListOf<HTMLAnchorElement> = document.body.querySelectorAll<HTMLAnchorElement>('[id="rso"] [href]');

        if ((!hasNoResultsIcon && attempt < 50) && linkItems.length === 0) {
          attempt++;
          return;
        }

        if (intervalId !== null) {
          clearInterval(intervalId);
        }

        const resultUrls: string[] = Array.from(linkItems)
          .map((n) => n.getAttribute('href'))
          .filter((href): href is string => href !== null);
        done(resultUrls);
      }, 100);
    }, 800);
  }).catch(error => {
    console.error("Error finding or clicking mobile exact link:", error);
    done([]);
  });
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

              WWBrowserStorage.set(searchStatusKey, {
                wwid: searchStatus.wwid,
                imgs,
                count: newCount,
              }).then(() => {
                console.log('Done. Found: ' + results.length);
                console.log('Found: ' + results.join('\n'));

                if (IS_MOBILE_VIEW  && newCount !== 0) {
                  const nextImageIndex = imgs.length - newCount;
                  if (nextImageIndex >= 0 && nextImageIndex < imgs.length) {
                    window.location.href = imgs[nextImageIndex];
                  } else {
                    console.warn("Calculated next image index is out of bounds. Closing window.");
                    window.close();
                  }
                } else {
                  window.close();
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

  if (getMobileExactLink()) {
    console.log('.. on mobile');
    readImageLinksMobile(wwid, callback);
  } else if (getDesktopExactLink()) {
    console.log('.. on desktop');
    readImageLinksDesktop(wwid, callback);
  } else {
    console.warn("Could not determine view type (mobile/desktop) or find trigger element.");
  }
}

function addLoader(percent: number): void {
  const loader = document.createElement('div');
  document.body.appendChild(loader);

  loader.style.background = 'rgb(87 82 82)';
  loader.style.position = 'fixed';
  loader.style.top = '60px';
  loader.style.width = 'calc(100% - 50px)';
  loader.style.left = '50%';
  loader.style.transform = 'translateX(-50%)';
  loader.style.height = '22px';
  loader.style.padding = '4px';
  loader.style.borderRadius = '4px';
  loader.style.boxShadow = '2px 2px 12px 2px rgba(0,0,0,0.4)';
  loader.style.zIndex = '9999';

  const progress = document.createElement('div');
  loader.appendChild(progress);

  progress.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  progress.style.height = '100%';
  progress.style.background = 'rgb(97 147 59)';
  progress.style.borderRadius = '4px';
  progress.style.transition = 'width 0.2s ease-in-out';

  const text = document.createElement('div');
  text.innerHTML = 'căutare după poze ..';
  loader.appendChild(text);

  text.style.position = 'absolute';
  text.style.top = '50%';
  text.style.left = '50%';
  text.style.transform = 'translate(-50%, -50%)';
  text.style.color = 'white';
  text.style.mixBlendMode = 'overlay';
  text.style.fontWeight = 'bold';
  text.style.whiteSpace = 'nowrap';
}


WWBrowserStorage.get(STORAGE_KEY_IMG_SEARCH).then((data: { [key: string]: any }) => {
  const searchData = data[STORAGE_KEY_IMG_SEARCH] as ImageSearchData | undefined;

  if (searchData && searchData.count && searchData.count > 0 && searchData.wwid) {
    parseResults(searchData.wwid);

    if (IS_MOBILE_VIEW) {
      const count = searchData.count;
      const length = searchData.imgs?.length || 0;
      if (length > 0) {
        const percent = ((length - count + 1) / length) * 100;
        addLoader(percent);
      } else {
        addLoader(0);
      }
    }
  } else {
    console.log("No active image search found, or count is zero, or wwid missing.");
  }
}).catch(error => {
  console.error("Failed to retrieve initial image search state:", error);
});
