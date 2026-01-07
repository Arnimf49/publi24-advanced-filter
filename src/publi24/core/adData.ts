import {dateLib} from "./dateLib";
import {misc} from "./misc";
import {IS_AD_PAGE} from "./globals";
import {WWStorage} from "./storage";
import {IS_MOBILE_VIEW} from "../../common/globals";
import {BrowserError, page} from "../../common/page";
import {utils} from "../../common/utils";

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

export interface FavoritesData {
  inLocation: AdData[];
  notInLocation: AdData[];
  noAds: string[];
}

export const adData = {
  uuidParts(id: string): string[] {
    return id.split('|');
  },

  getPageDate(itemPage: DocumentFragment | HTMLElement): Date {
    const dateText = itemPage.querySelector<HTMLElement>('[itemprop="validFrom"], .detail-info div i, .valid-from')?.textContent?.trim();
    if (!dateText) {
      return new Date(0);
    }
    const formattedDateText = dateText.replace(/.*(\d+\.)(\d+\.)(\d+ \d+:\d+:\d+)/, "$1$2$3");
    return new Date(formattedDateText);
  },

  getPageImage(itemPage: DocumentFragment | HTMLElement): string | undefined {
    if (IS_MOBILE_VIEW) {
      const bgImageMatch = itemPage.querySelector<HTMLElement>('[itemprop="associatedMedia"] li')?.style.background?.match(/url\(['"]([^'"]+)['"]\)/);
      return bgImageMatch ? bgImageMatch[1] : undefined;
    }

    return itemPage.querySelector<HTMLImageElement>('[itemprop="image"], .detailViewImg')?.src;
  },

  getItemDate(item: Element) {
    if (IS_AD_PAGE()) {
      throw new Error('Not implemented: getItemDate for ad page');
    } else {
      const dateStr = item.querySelector<HTMLElement>('[class="article-date"]')!.innerText;
      return utils.parseRomanianDate(dateStr);
    }
  },

  getPageDescription(itemPage: DocumentFragment | HTMLElement): string {
    const descriptionElement = itemPage.querySelector<HTMLElement>('[itemscope] [itemprop="description"], .article-description');
    if (!descriptionElement) {
      return '';
    }
    return descriptionElement.innerHTML
      .replace(/<[^>]*>/gi, ' ')
      .replace(/\s+/g, ' ')
      .replace(/Publi24_\d+/, '')
      .replace(/ID anunț\s*:\s*\d+/, '')
      .trim();
  },

  getPageTitle(itemPage: DocumentFragment | HTMLElement): string {
    const titleElement = itemPage.querySelector<HTMLHeadingElement>('[itemscope] h1[itemprop="name"], .article-detail h1, .detail-title h1');
    return titleElement ? titleElement.innerHTML : '';
  },

  getItemLocation(item: Element | DocumentFragment | HTMLElement | string, itemIsOnAdPage: boolean = false): string {
    let locationText: string | null | undefined;

    if (typeof item === "string") {
      locationText = item;
    } else {
      if (IS_AD_PAGE() || itemIsOnAdPage) {
        const targetElement = (item instanceof Element) ? item : item.firstChild as Element;
        if (targetElement) {
          if (IS_MOBILE_VIEW) {
            locationText = targetElement.querySelector<HTMLElement>('.location')?.innerText;
          } else {
            locationText = targetElement.querySelector<HTMLElement>('[itemtype="https://schema.org/Place"], .detail-info div p')?.innerText;
          }
        }
      }

      if (!locationText) {
        locationText = item.querySelector<HTMLElement>('.article-location')?.innerText;
      }
    }

    if (!locationText) {
      return '';
    }

    return locationText.trim().split(',').map((l: string) => l.replace(/[ \n]+/g, '')).sort().join(', ');
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

  isDueToPhoneHidden(id: string): boolean {
    const phone = WWStorage.getAdPhone(id);
    const wasItemHidden = !WWStorage.isAdVisible(id);
    const wasPhoneHidden = phone ? WWStorage.isPhoneHidden(phone) : false;

    return !wasItemHidden && wasPhoneHidden;
  },

  getItemVisibility(id: string): boolean {
    const phone: string | null | undefined = WWStorage.getAdPhone(id);
    const isItemVisible: boolean = WWStorage.isAdVisible(id);
    const isPhoneHidden: boolean = phone ? WWStorage.isPhoneHidden(phone) : false;

    return isItemVisible && !isPhoneHidden;
  },

  isStaleAnalyze(id: string) {
    return WWStorage.getAnalyzedAt(id) === undefined
      || Date.now() - (WWStorage.getAnalyzedAt(id) || 0) > 1.296e+9 // 15 days;
  },

  hasAdNewerDuplicate(id: string) {
    const phone = WWStorage.getAdPhone(id);

    if (!phone) {
      return false;
    }

    const allAdIds = WWStorage.getPhoneAds(phone)
      .map(uuid => adData.uuidParts(uuid)[0]);
    const otherAdIds = allAdIds.filter(adId => id !== adId);
    const thisSeenTime = WWStorage.getSeenTime(id) || 0;

    if (!otherAdIds.length) {
      return false;
    }

    let newestTime = 0;
    otherAdIds.forEach(adId => {
      const time = WWStorage.getSeenTime(adId) || 0;
      if (time > newestTime) {
        newestTime = time;
      }
    });

    if (thisSeenTime === newestTime) {
      const firstWithTime = allAdIds.filter((id) => {
        const time = WWStorage.getSeenTime(id) || 0;
        return time === thisSeenTime;
      })[0];

      return firstWithTime !== id;
    }

    return thisSeenTime < newestTime;
  },

  async loadInAdPage(itemOrUrl: Element | string | null, _url?: string): Promise<HTMLElement> {
    const url: string = _url || (itemOrUrl ? adData.getItemUrl(itemOrUrl) : '');

    if (!url) {
      throw new Error("loadInAdPage requires a valid URL");
    }

    return page.load(url);
  },

  async loadInAdsData(adUuids: string[], clean?: (failedUuid: string) => void): Promise<AdData[]> {
    let locationParts: string[] = [];
    if (!IS_AD_PAGE()) {
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



        return {
          IS_MOBILE_VIEW,
          id,
          url,
          phone,
          qrCode,
          title: adData.getPageTitle(itemPage),
          description: adData.getPageDescription(itemPage).substring(0, 290),
          image: adData.getPageImage(itemPage),
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


  async loadInFirstAvailableAd(uuids: string[], phone: string, requirePhone: boolean = false): Promise<AdData | null> {
    if (!uuids || uuids.length === 0) {
      return null;
    }

    const currentUuid = uuids.shift();
    if (!currentUuid) return null;

    // This is to prevent showing in case of favorites ads without phone number.
    // As in this case it cannot be removed from favorites.
    if (requirePhone && WWStorage.hasAdNoPhone(adData.uuidParts(currentUuid)[0])) {
      return adData.loadInFirstAvailableAd(uuids, phone);
    }

    const itemDataArray = await adData.loadInAdsData(
      [currentUuid],
      (failedUuid) => WWStorage.removePhoneAd(phone, failedUuid)
    );

    if (!itemDataArray || itemDataArray.length === 0) {
      return adData.loadInFirstAvailableAd(uuids, phone);
    }

    return itemDataArray[0];
  },

  async loadFavoritesData(): Promise<FavoritesData> {
    const phones = WWStorage.getFavorites();
    const data: FavoritesData = {
      inLocation: [],
      notInLocation: [],
      noAds: [],
    };

    let promises: Promise<void>[] = [];

    for (let phone of phones) {
      promises.push(adData.loadInFirstAvailableAd(WWStorage.getPhoneAds(phone), phone, true).then((item) => {
        if (item) {
          if (item.isLocationDifferent) {
            data.notInLocation.push(item);
          } else {
            data.inLocation.push(item);
          }
        } else {
          data.noAds.push(phone);
        }
      }));
    }

    await Promise.all(promises);

    const sorter = (a: AdData, b: AdData): number => b.timestamp - a.timestamp;
    data.inLocation = data.inLocation.sort(sorter);
    data.notInLocation = data.notInLocation.sort(sorter);

    return data;
  },
};
