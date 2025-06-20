import {dateLib} from "./dateLib";
import {misc} from "./misc";
import {IS_AD_PAGE} from "./globals";
import {WWStorage} from "./storage";
import {IS_MOBILE_VIEW} from "../../common/globals";
import {BrowserError, page} from "../../common/page";

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
          locationText = targetElement.querySelector<HTMLElement>('[class="location"]')?.innerText;
        } else {
          locationText = targetElement.querySelector<HTMLElement>('[itemtype="https://schema.org/Place"]')?.innerText;
        }
      } else {
        if (item instanceof Element) {
          locationText = item.querySelector<HTMLElement>('[class="article-location"]')?.innerText;
        }
      }
    }

    if (!locationText) {
      return '';
    }

    return locationText.trim().split(',').map((l: string) => l.replace(/[ \n]+/g, '')).sort().join(', ');
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

  async loadInAdPage(itemOrUrl: Element | string | null, _url?: string): Promise<HTMLElement> {
    const url: string = _url || (itemOrUrl ? adData.getItemUrl(itemOrUrl) : '');

    if (!url) {
      throw new Error("loadInAdPage requires a valid URL");
    }

    return page.load(url, 'publi24ad');
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
    const previousPhone = WWStorage.getAdPhone(id);

    WWStorage.setAdPhone(id, trimmedPhone);
    WWStorage.addPhoneAd(trimmedPhone, id, adData.getItemUrl(item));

    if (previousPhone) {
      WWStorage.removePhoneAd(previousPhone, id);
      // @TODO: Grave side effect.
      if (WWStorage.getFavorites().includes(previousPhone)) {
        WWStorage.toggleFavorite(previousPhone);
        WWStorage.toggleFavorite(trimmedPhone, true);
      }
    }

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
