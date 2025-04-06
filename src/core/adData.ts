import {dateLib} from "./dateLib";
import {misc} from "./misc";
import {IS_AD_PAGE, IS_MOBILE_VIEW} from "./globals";
import {WWStorage} from "./storage";

export interface AdData {
  IS_MOBILE_VIEW: boolean;
  id: string;
  url: string;
  phone: string | null | undefined;
  qrCode: string | null;
  title: string;
  description: string;
  image: string | null | undefined;
  location: string | null | undefined;
  date: string;
  timestamp: number;
  isDateOld: boolean;
  isLocationDifferent: boolean;
}

interface BrowserError extends Error {
  code?: number;
}

type PageLoadPromise = Promise<Response> & { is_resolved?: boolean };

const AD_LOAD_CACHE: { [url: string]: DocumentFragment | HTMLElement | Error } = {};
const PAGE_LOAD_PROMISES: { [url: string]: PageLoadPromise } = {};
let ALL_PAGE_LOAD_PROMISES: PageLoadPromise[] = [];
let PAGE_LOAD_REQUESTS: number = 0;

export const adData = {
  uuidParts(id: string): string[] {
    return id.split('|');
  },

  getPageDate(itemPage: DocumentFragment | HTMLElement): Date {
    const dateText = itemPage.querySelector<HTMLElement>('[itemprop="validFrom"]')?.textContent?.trim();
    if (!dateText) {
      return new Date(0);
    }
    const formattedDateText = dateText.replace(/.*(\d+\.)(\d+\.)(\d+ \d+:\d+:\d+)/, "$1$2$3");
    return new Date(formattedDateText);
  },

  getPageDescription(itemPage: DocumentFragment | HTMLElement): string {
    const descriptionElement = itemPage.querySelector<HTMLElement>('[itemscope] [itemprop="description"]');
    if (!descriptionElement) {
      return '';
    }
    return descriptionElement.innerHTML
      .replace(/<[^>]*>/gi, ' ')
      .replace(/\s+/g, ' ')
      .replace(/Publi24_\d+/, '')
      .trim();
  },

  getPageTitle(itemPage: DocumentFragment | HTMLElement): string {
    const titleElement = itemPage.querySelector<HTMLHeadingElement>('[itemscope] h1[itemprop="name"]');
    return titleElement ? titleElement.innerHTML : '';
  },

  getItemUrl(itemOrUrl: Element | string): string {
    if (typeof itemOrUrl === 'string') {
      return itemOrUrl;
    }
    if (itemOrUrl.className.indexOf('article-item') === -1) {
      return location.toString();
    }
    const linkElement = itemOrUrl.querySelector<HTMLAnchorElement>('.article-title a');
    return linkElement ? linkElement.href : location.toString(); // Provide fallback
  },

  getItemLocation(item: Element | DocumentFragment | HTMLElement | string, itemIsOnAdPage: boolean = false): string {
    let locationText: string | null | undefined;

    if (typeof item === "string") {
      locationText = item;
    } else {
      const targetElement = (item instanceof Element) ? item : item.firstChild as Element;
      if (!targetElement) return '';

      if (IS_AD_PAGE || itemIsOnAdPage) {
        if (IS_MOBILE_VIEW) {
          locationText = targetElement.querySelector<HTMLElement>('[class="location"]')?.textContent;
        } else {
          locationText = targetElement.querySelector<HTMLElement>('[itemtype="https://schema.org/Place"]')?.textContent;
        }
      } else {
        if (item instanceof Element) {
          locationText = item.querySelector<HTMLElement>('[class="article-location"]')?.textContent;
        }
      }
    }

    if (!locationText) {
      return '';
    }

    return locationText.trim().split(',').map((l: string) => l.replace(/[ \n]+/g, '')).sort().join(', ');
  },

  isDueToPhoneHidden(id: string): boolean {
    const phone: string | null | undefined = WWStorage.getAdPhone(id);
    const wasItemHidden: boolean = !WWStorage.isAdVisible(id); // Assuming isAdVisible returns true if visible
    const wasPhoneHidden: boolean = phone ? WWStorage.isPhoneHidden(phone) : false;

    return wasItemHidden && wasPhoneHidden;
  },

  getItemVisibility(id: string): boolean {
    const phone: string | null | undefined = WWStorage.getAdPhone(id);
    const isItemVisible: boolean = WWStorage.isAdVisible(id); // Assuming isAdVisible returns true if visible
    const isPhoneHidden: boolean = phone ? WWStorage.isPhoneHidden(phone) : false;

    return isItemVisible && !isPhoneHidden;
  },

  async loadInAdPage(itemOrUrl: Element | string | null, _url?: string): Promise<HTMLElement> {
    const url: string = _url || (itemOrUrl ? adData.getItemUrl(itemOrUrl) : '');

    if (!url) {
      throw new Error("loadInAdPage requires a valid URL");
    }

    const returnFromCache = (cacheUrl: string): HTMLElement => {
      const cachedItem = AD_LOAD_CACHE[cacheUrl];
      if (cachedItem instanceof Error) {
        throw cachedItem;
      }
      return cachedItem as HTMLElement;
    }

    if (AD_LOAD_CACHE[url]) {
      return returnFromCache(url);
    }
    // @ts-ignore
    if (PAGE_LOAD_PROMISES[url]) {
      await PAGE_LOAD_PROMISES[url];
      await new Promise<void>((r) => setTimeout(r, 200));
      return returnFromCache(url);
    }

    PAGE_LOAD_REQUESTS++;

    if (PAGE_LOAD_REQUESTS > 20) {
      ALL_PAGE_LOAD_PROMISES = ALL_PAGE_LOAD_PROMISES.filter(p => !p.is_resolved);
      await Promise.race([
        Promise.all(ALL_PAGE_LOAD_PROMISES),
        new Promise<void>((r) => setTimeout(r, 11000))
      ]);
      if (PAGE_LOAD_REQUESTS > 20) {
        await new Promise<void>((r) => setTimeout(r, 5000));
      }
    }

    const promise: PageLoadPromise = fetch(url);
    PAGE_LOAD_PROMISES[url] = promise;
    const trackablePromise = promise.then(() => {
      promise.is_resolved = true;
    }).catch(() => {
      promise.is_resolved = true
    });
    ALL_PAGE_LOAD_PROMISES.push(promise);

    trackablePromise.catch(e => console.warn("Page load tracking promise failed:", e));

    setTimeout(() => {
      PAGE_LOAD_REQUESTS = Math.max(0, PAGE_LOAD_REQUESTS - 1);
      delete PAGE_LOAD_PROMISES[url];
    }, 10000);

    let pageResponse: Response;
    try {
      pageResponse = await promise;
    } catch (fetchError) {
      const error = fetchError instanceof Error ? fetchError : new Error(`Network error fetching ${url}`);
      (error as BrowserError).code = 503;
      AD_LOAD_CACHE[url] = error;
      throw error;
    }

    if (!pageResponse.ok) {
      const error = new Error(`Failed to load ${url}`) as BrowserError;
      error.code = pageResponse.status;
      AD_LOAD_CACHE[url] = error;
      throw error;
    }

    const template = document.createElement('div');
    template.innerHTML = await pageResponse.text();
    AD_LOAD_CACHE[url] = template;

    return template;
  },

  async loadInAdsData(adUuids: string[], clean?: (failedUuid: string) => void): Promise<AdData[]> {
    let locationParts: string[] = [];
    if (!IS_AD_PAGE) {
      const countyInput = document.querySelector<HTMLInputElement>('[data-faceted="county_name"]');
      const locationInput = document.querySelector<HTMLInputElement>('[data-faceted="city_name"]');

      if (countyInput?.value) {
        locationParts.push(countyInput.value.toLocaleLowerCase());
      }
      if (locationInput?.value) {
        locationParts.push(locationInput.value.toLocaleLowerCase());
      }
    }

    const itemDataPromises = adUuids.map(async (adUuid): Promise<AdData | null> => {
      const [id, url] = adData.uuidParts(adUuid);
      let itemPage: DocumentFragment | HTMLElement;

      try {
        itemPage = await adData.loadInAdPage(url);
      } catch (e) {
        const error = e as BrowserError;
        if (error.code !== 429 && clean) {
          clean(id + '|' + url);
        }
        console.error(`Failed loading ad data for ${id}:`, e);
        return null;
      }

      try {
        const date = adData.getPageDate(itemPage);
        const dateDiffDays = dateLib.dayDiff(date);
        const pageLocationText = adData.getItemLocation(itemPage, true);

        const phone = WWStorage.getAdPhone(id);
        let qrCode: string | null = null;
        if (phone) {
          try {
            qrCode = await misc.getPhoneQrCode(phone);
          } catch (qrError) {
            console.error(`Failed to generate QR code for ${phone}:`, qrError);
          }
        }

        let image: string | null | undefined;
        if (IS_MOBILE_VIEW) {
          const bgImageMatch = itemPage.querySelector<HTMLElement>('[itemprop="associatedMedia"] li')?.style.background?.match(/url\(['"]([^'"]+)['"]\)/);
          image = bgImageMatch ? bgImageMatch[1] : undefined;
        } else {
          image = itemPage.querySelector<HTMLImageElement>('[itemprop="image"]')?.src;
        }

        return {
          IS_MOBILE_VIEW,
          id,
          url,
          phone,
          qrCode,
          title: adData.getPageTitle(itemPage),
          description: adData.getPageDescription(itemPage).substring(0, 290),
          image,
          location: pageLocationText,
          date: dateLib.diffDaysToDisplay(dateDiffDays, date),
          timestamp: date.getTime(),
          isDateOld: dateDiffDays >= 2,
          isLocationDifferent: locationParts.length > 0 && pageLocationText ? locationParts.some(l => !pageLocationText!.toLocaleLowerCase().includes(l)) : false,
        };
      } catch (processingError) {
        console.error(`Failed processing ad data for ${id} after load:`, processingError);
        return null;
      }
    });

    const resolvedItemData = await Promise.all(itemDataPromises);

    return resolvedItemData
      .filter((f): f is AdData => f !== null)
      .sort((a, b) => b.timestamp - a.timestamp);
  },

  async acquirePhoneNumber(item: Element, id: string): Promise<string | false> {
    let phone: string | undefined;
    let adPage: DocumentFragment | HTMLElement;

    adPage = await adData.loadInAdPage(item);

    if (IS_MOBILE_VIEW) {
      const phoneNumberMatch = adPage.innerHTML.match(/var cnt = ['"](\d+)['"]/);
      if (phoneNumberMatch) {
        phone = phoneNumberMatch[1];
      }
    } else {
      let phoneNumberEncrypted: string | undefined | null;
      if (IS_AD_PAGE) {
        phoneNumberEncrypted = document.querySelector<HTMLInputElement>('[id="EncryptedPhone"]')?.value;
      } else {
        phoneNumberEncrypted = await adData.acquireEncryptedPhoneNumber(item);
      }


      if (phoneNumberEncrypted) {
        const response = await fetch('https://www.publi24.ro/DetailAd/PhoneNumberImages?Length=8', {
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: new URLSearchParams({
            'EncryptedPhone': phoneNumberEncrypted,
            'body': '',
            'X-Requested-With': 'XMLHttpRequest'
          })
        });
        if (!response.ok) {
          throw new Error(`Phone number image fetch failed: ${response.status}`);
        }
        const phoneNumberImgBase64 = await response.text();
        phone = await misc.readNumbersFromBase64Png(phoneNumberImgBase64);
      }
    }

    if (!phone || !phone.trim()) {
      WWStorage.setAdNoPhone(id);
      return false;
    }

    const trimmedPhone = phone.trim();
    WWStorage.setAdPhone(id, trimmedPhone);
    WWStorage.addPhoneAd(trimmedPhone, id, adData.getItemUrl(item));

    if (WWStorage.hasAdNoPhone(id)) {
      WWStorage.setAdNoPhone(id, false);
    }

    return trimmedPhone;
  },

  async acquireEncryptedPhoneNumber(item: Element): Promise<string | undefined> {
    try {
      const adPage = await adData.loadInAdPage(item);
      return adPage.querySelector<HTMLInputElement>('[id="EncryptedPhone"]')?.value ?? undefined;
    } catch (error) {
      console.error("Failed to load ad page for encrypted phone number:", error);
      return undefined;
    }
  },

  async acquireSliderImages(item: Element): Promise<string[]> {
    try {
      const adPage = await adData.loadInAdPage(item);

      if (IS_MOBILE_VIEW) {
        const matches = adPage.innerHTML.match(/https:\/\/s3\.publi24\.ro\/[^.]+\.(?:jpg|webp|png)/g) ?? [];
        return [...new Set(matches)];
      }

      const galleryImages = Array.from(adPage.querySelectorAll<HTMLImageElement>('[id="detail-gallery"] img'))
        .map((img) => img.getAttribute('src')?.replace('/top/', '/extralarge/'))
        .filter((src): src is string => !!src);

      if (galleryImages.length) {
        return galleryImages;
      }

      return Array.from(adPage.querySelectorAll<HTMLImageElement>('.imgZone img'))
        .map((img) => img.getAttribute('src'))
        .filter((src): src is string => !!src);

    } catch (error) {
      console.error("Failed to acquire slider images:", error);
      return [];
    }
  },


  async loadInFirstAvailableAd(uuids: string[], phone: string): Promise<AdData | null> {
    if (!uuids || uuids.length === 0) {
      return null;
    }

    const currentUuid = uuids.shift();
    if (!currentUuid) return null;

    const itemDataArray = await adData.loadInAdsData(
      [currentUuid],
      (failedUuid) => WWStorage.removePhoneAd(phone, failedUuid)
    );

    if (!itemDataArray || itemDataArray.length === 0) {
      return adData.loadInFirstAvailableAd(uuids, phone);
    }

    return itemDataArray[0];
  },
};
