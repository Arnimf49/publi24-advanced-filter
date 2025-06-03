import {WWBrowserStorage} from "./browserStorage";

interface AdItem {
  visibility?: boolean;
  phone?: string | null;
  noPhone?: boolean;
  duplicatesInOtherLoc?: string[] | null;
  duplicatesInOtherLocNotOld?: string[] | null;
  deadLinks?: string[] | null;
  phoneTime?: number;
  imagesTime?: number;
  [key: string]: any;
}

interface PhoneItem {
  hidden?: boolean;
  ads?: string[]; // Format: "id|url"
  adsOptimized?: string;
  hideReason?: string;
  height?: any;
  weight?: any;
  age?: any;
  [key: string]: any;
}

interface WwStoreCache {
  item: Record<string, AdItem>;
  phone: Record<string, PhoneItem>;
  save: string[] | null;
}

export interface AutoHideCriterias {
  maxAge?: boolean;
  maxAgeValue?: number;
  minHeight?: boolean;
  minHeightValue?: number;
  maxHeight?: boolean;
  maxHeightValue?: number;
  maxWeight?: boolean;
  maxWeightValue?: number;
  mature?: boolean;
  trans?: boolean;
  botox?: boolean;
  onlyTrips?: boolean;
  showWeb?: boolean;
  btsRisc?: boolean;
  party?: boolean;
}

const _WW_STORE_CACHE: WwStoreCache = {
  item: {},
  phone: {},
  save: null,
};

const _WW_CALLBACKS = {
  adChanged: {} as Record<string, Array<() => void>>,
  phoneChanged: {} as Record<string, Array<() => void>>,
  favsChanged: [] as Array<() => void>,
};

export const WWStorage = {
  getAdStoreKeys(id: string): string[] {
    const upperId = id.toUpperCase();
    const phone = WWStorage.getAdPhone(upperId);
    const baseKey = `ww2:${upperId}`;
    return [baseKey].concat(phone ? [
      `ww2:phone:${phone}`,
      `ww:favs`,
    ] : []);
  },

  getAdItem(id: string): AdItem {
    const upperId = id.toUpperCase();
    if (_WW_STORE_CACHE.item[upperId]) {
      return _WW_STORE_CACHE.item[upperId];
    }

    const itemString = localStorage.getItem(`ww2:${upperId}`);
    const item: AdItem = itemString ? JSON.parse(itemString) : {};
    _WW_STORE_CACHE.item[upperId] = item;
    return item;
  },

  setAdProp(id: string, prop: string, value: any): void {
    const upperId = id.toUpperCase();
    const item = this.getAdItem(upperId);
    item[prop] = value;
    localStorage.setItem(`ww2:${upperId}`, JSON.stringify(item));
    _WW_STORE_CACHE.item[upperId] = { ...item };
    WWStorage.triggerAdChanged(id);
  },

  delAdProp(id: string, prop: string): void {
    const upperId = id.toUpperCase();
    const item = this.getAdItem(upperId);
    if (item.hasOwnProperty(prop)) {
      delete item[prop];
      localStorage.setItem(`ww2:${upperId}`, JSON.stringify(item));
      _WW_STORE_CACHE.item[upperId] = { ...item };
      WWStorage.triggerAdChanged(id);
    }
  },

  getAdProp<T = any>(id: string, prop: string): T | undefined {
    const upperId = id.toUpperCase();
    const item = this.getAdItem(upperId);
    return item[prop] as T | undefined;
  },

  setAdVisibility(id: string, visible: boolean): void {
    WWStorage.setAdProp(id, 'visibility', visible);
  },

  isAdVisible(id: string): boolean {
    return WWStorage.getAdProp<boolean>(id, 'visibility') !== false;
  },

  setAdPhone(id: string, phone: string): void {
    WWStorage.setAdProp(id, 'phone', phone);
    WWStorage.delAdProp(id, 'noPhone');
  },

  getAdPhone(id: string): string | null | undefined {
    return WWStorage.getAdProp<string | null>(id, 'phone');
  },

  setAdNoPhone(id: string, value: boolean = true): void {
    WWStorage.setAdProp(id, 'noPhone', value);
  },

  hasAdNoPhone(id: string): boolean {
    return WWStorage.getAdProp<boolean>(id, 'noPhone') === true;
  },

  addAdDuplicateInOtherLocation(id: string, link: string, old: boolean = true): void {
    const list = WWStorage.getAdProp<string[]>(id, 'duplicatesInOtherLoc') || [];
    if (!list.includes(link)) {
      list.push(link);
      WWStorage.setAdProp(id, 'duplicatesInOtherLoc', list);
    }

    if (!old) {
      const notOldList = WWStorage.getAdProp<string[]>(id, 'duplicatesInOtherLocNotOld') || [];
      if (!notOldList.includes(link)) {
        notOldList.push(link);
        WWStorage.setAdProp(id, 'duplicatesInOtherLocNotOld', notOldList);
      }
    }
  },

  clearAdDuplicatesInOtherLocation(id: string): void {
    WWStorage.setAdProp(id, 'duplicatesInOtherLoc', null);
    WWStorage.setAdProp(id, 'duplicatesInOtherLocNotOld', null);
  },

  hasAdDuplicatesInOtherLocation(id: string): boolean {
    const duplicates = WWStorage.getAdProp<string[] | null>(id, 'duplicatesInOtherLoc');
    return !!duplicates && duplicates.length > 0;
  },

  getAdDuplicatesInOtherLocation(id: string): string[] {
    return WWStorage.getAdProp<string[]>(id, 'duplicatesInOtherLoc') || [];
  },

  getAdNotOldDuplicatesInOtherLocation(id: string): string[] {
    return WWStorage.getAdProp<string[]>(id, 'duplicatesInOtherLocNotOld') || [];
  },

  addAdDeadLink(id: string, link: string): void {
    const list = WWStorage.getAdProp<string[]>(id, 'deadLinks') || [];
    if (!list.includes(link)) {
      list.push(link);
      WWStorage.setAdProp(id, 'deadLinks', list);
    }
  },

  clearAdDeadLinks(id: string): void {
    WWStorage.setAdProp(id, 'deadLinks', null);
  },

  getAdDeadLinks(id: string): string[] {
    return WWStorage.getAdProp<string[]>(id, 'deadLinks') || [];
  },

  setInvestigatedTime(id: string, timestamp: number): void {
    WWStorage.setAdProp(id, 'phoneTime', timestamp);
  },

  getInvestigatedTime(id: string): number | undefined {
    return WWStorage.getAdProp<number>(id, 'phoneTime');
  },

  setAdImagesInvestigatedTime(id: string, timestamp: number): void {
    WWStorage.setAdProp(id, 'imagesTime', timestamp);
  },

  getAdImagesInvestigatedTime(id: string): number | undefined {
    return WWStorage.getAdProp<number>(id, 'imagesTime');
  },

  async getAdSearchResults(id: string): Promise<{search?: string[], images?: []}> {
    return WWBrowserStorage.get([`ww:search_results:${id}`, `ww:image_results:${id}`])
      .then((results) => {
        return {search: results[`ww:search_results:${id}`], images: results[`ww:image_results:${id}`]};
      })
  },

  getPhoneItem(phone: string): PhoneItem {
    if (_WW_STORE_CACHE.phone[phone]) {
      return _WW_STORE_CACHE.phone[phone];
    }

    const itemString = localStorage.getItem(`ww2:phone:${phone}`);
    const item: PhoneItem = itemString ? JSON.parse(itemString) : {};
    _WW_STORE_CACHE.phone[phone] = item;
    return item;
  },

  setPhoneProp(phone: string, prop: string, value: any): void {
    const item = this.getPhoneItem(phone);
    item[prop] = value;
    localStorage.setItem(`ww2:phone:${phone}`, JSON.stringify(item));
    _WW_STORE_CACHE.phone[phone] = { ...item };
    WWStorage.triggerPhoneChanged(phone);
  },

  getPhoneProp<T = any>(phone: string, prop: string): T | undefined {
    const item = this.getPhoneItem(phone);
    return item[prop] as T | undefined;
  },

  setPhoneHidden(phone: string, h: boolean = true): void {
    WWStorage.setPhoneProp(phone, 'hidden', h);
  },

  isPhoneHidden(phone: string): boolean {
    return WWStorage.getPhoneProp<boolean>(phone, 'hidden') === true;
  },

  getPhoneAds(phone: string): string[] {
    const ads = WWStorage.getPhoneProp<string[] | string>(phone, 'ads');
    if (typeof ads === 'string') {
      return [];
    }
    return Array.isArray(ads) ? [...ads] : [];
  },

  addPhoneAd(phone: string, id: string, url: string): void {
    if (!phone || !id || !url) {
      return;
    }

    const ads = WWStorage.getPhoneAds(phone);
    const adEntry = `${id}|${url}`;
    if (!ads.some(adString => adString.startsWith(`${id}|`))) {
      ads.push(adEntry);
      WWStorage.setPhoneProp(phone, 'ads', ads);
    }
  },

  removePhoneAd(phone: string, uuid: string): void {
    if (!phone || !uuid) {
      return;
    }

    let ads = WWStorage.getPhoneAds(phone);
    const initialLength = ads.length;
    ads = ads.filter(adEntry => adEntry !== uuid);

    if (ads.length < initialLength) {
      WWStorage.setPhoneProp(phone, 'ads', ads);
    }
  },

  setPhoneAdFirst(phone: string, uuid: string): void {
    if (!phone || !uuid) {
      return;
    }
    let ads = WWStorage.getPhoneAds(phone);
    const index = ads.indexOf(uuid);
    if (index > 0) {
      ads.splice(index, 1);
      ads.unshift(uuid);
      WWStorage.setPhoneProp(phone, 'ads', ads);
    } else if (index === -1) {
      ads.unshift(uuid);
      WWStorage.setPhoneProp(phone, 'ads', ads);
    }
  },

  getLastTimeAdsOptimized(phone: string): number {
    const timeString = WWStorage.getPhoneProp<string>(phone, 'adsOptimized');
    return timeString ? +timeString : 0;
  },

  setOptimizedAdsNow(phone: string): void {
    WWStorage.setPhoneProp(phone, 'adsOptimized', String(Date.now()));
  },

  setPhoneHiddenReason(phone: string, reason: string): void {
    WWStorage.setPhoneProp(phone, 'hideReason', reason);
  },

  getPhoneHiddenReason(phone: string): string | undefined {
    return WWStorage.getPhoneProp<string>(phone, 'hideReason');
  },

  getPhoneHeight(phone: string): any {
    return WWStorage.getPhoneProp(phone, 'height');
  },

  getPhoneWeight(phone: string): any {
    return WWStorage.getPhoneProp(phone, 'weight');
  },

  getPhoneAge(phone: string): any {
    return WWStorage.getPhoneProp(phone, 'age');
  },

  getFavorites(): string[] {
    if (_WW_STORE_CACHE.save) {
      return [..._WW_STORE_CACHE.save]; // Return a copy
    }
    const saveString = localStorage.getItem('ww:favs');
    const save: string[] = saveString ? JSON.parse(saveString) : [];
    _WW_STORE_CACHE.save = save;
    return [...save]; // Return a copy
  },

  clearFavorites(): void {
    const temp = [...(_WW_STORE_CACHE.save || [])];

    localStorage.removeItem('ww:favs');
    _WW_STORE_CACHE.save = null;

    temp.forEach((phone) => WWStorage.triggerPhoneChanged(phone))
    WWStorage.triggerFavsChanged();
  },

  toggleFavorite(phone: string | undefined, forceAdd: boolean = false): void {
    if (!phone || phone == '') {
      return;
    }

    let items = WWStorage.getFavorites();
    const isFavorite = items.includes(phone);

    if (!forceAdd && isFavorite) {
      items = items.filter(it => it !== phone);
    } else if (!isFavorite) {
      items.push(phone);
    } else {
      return;
    }

    localStorage.setItem('ww:favs', JSON.stringify(items));
    _WW_STORE_CACHE.save = items;

    WWStorage.triggerPhoneChanged(phone);
    WWStorage.triggerFavsChanged();
  },

  isFavorite(phone: string): boolean {
    return WWStorage.getFavorites().includes(phone);
  },

  setFocusMode(enabled: boolean): void {
    localStorage.setItem('ww:focus_mode', enabled ? 'true' : 'false');
  },

  isFocusMode(): boolean {
    return localStorage.getItem('ww:focus_mode') === 'true';
  },

  setAutoHideEnabled(enabled: boolean): void {
    localStorage.setItem('ww:auto-hide', enabled ? 'true' : 'false');
  },

  isAutoHideEnabled(): boolean {
    return localStorage.getItem('ww:auto-hide') === 'true';
  },

  setAutoHideCriteria(criteria: keyof AutoHideCriterias, enabled?: boolean, value?: number | string): void {
    const current = WWStorage.getAutoHideCriterias();
    if (enabled !== undefined) {
      (current[criteria] as any) = enabled;
    }
    if (value !== undefined) {
      // @ts-ignore
      (current[criteria + 'Value'] as any) = value;
    }
    localStorage.setItem('ww:auto-hide:criteria', JSON.stringify(current));
  },

  isAutoHideCriteriaEnabled(criteria: keyof AutoHideCriterias): boolean {
    return !!WWStorage.getAutoHideCriterias()[criteria];
  },

  getAutoHideCriterias(): AutoHideCriterias {
    const criteriaString = localStorage.getItem('ww:auto-hide:criteria');
    return criteriaString ? JSON.parse(criteriaString) : {};
  },

  hasBeenShownInfo(): boolean {
    return localStorage.getItem('ww:info-shown') === 'true';
  },

  setHasBeenShownInfo(): void {
    localStorage.setItem('ww:info-shown', 'true');
  },

  setShownMessage(name: string): void {
    localStorage.setItem('ww:shown-message', name);
  },

  hasShownMessage(name: string): boolean {
    return localStorage.getItem('ww:shown-message') === name;
  },

  setFindNextVisibleAd(value: boolean = true) {
    localStorage.setItem('ww:find-next', value ? 'true' : 'false');
  },
  isFindNextVisibleAd() {
    return localStorage.getItem('ww:find-next') == 'true';
  },

  getVersion(): string | null {
    return localStorage.getItem('ww:storage:version');
  },


  onAdChanged(id: string, callback: () => void) {
    _WW_CALLBACKS.adChanged[id] = _WW_CALLBACKS.adChanged[id] || [];
    _WW_CALLBACKS.adChanged[id].push(callback);
  },

  removeOnAdChanged(id: string, callback: () => void) {
    _WW_CALLBACKS.adChanged[id] = _WW_CALLBACKS.adChanged[id].filter(c => c !== callback);
  },

  triggerAdChanged(id: string) {
    (_WW_CALLBACKS.adChanged[id] || []).forEach(callback => callback());
  },

  onFavsChanged(callback: () => void) {
    _WW_CALLBACKS.favsChanged.push(callback);
  },

  removeOnFavsChanged(callback: () => void) {
    _WW_CALLBACKS.favsChanged = _WW_CALLBACKS.favsChanged.filter(c => c !== callback);
  },

  triggerFavsChanged() {
    _WW_CALLBACKS.favsChanged.forEach(callback => callback());
  },

  onPhoneChanged(phone: string | undefined, callback: () => void) {
    if (!phone || phone === '') {
      return;
    }

    _WW_CALLBACKS.phoneChanged[phone] = _WW_CALLBACKS.phoneChanged[phone] || [];
    _WW_CALLBACKS.phoneChanged[phone].push(callback);
  },

  removeOnPhoneChanged(phone: string | undefined, callback: () => void) {
    if (!phone || phone === '') {
      return;
    }

    _WW_CALLBACKS.phoneChanged[phone] = _WW_CALLBACKS.phoneChanged[phone].filter(c => c !== callback);
  },

  triggerPhoneChanged(phone: string) {
    (_WW_CALLBACKS.phoneChanged[phone] || []).forEach(callback => callback());
  },


  async upgrade(): Promise<void> {
    const version = WWStorage.getVersion();
    const currentVersion = 4;
    const parsedVersion = version ? parseInt(version, 10) : currentVersion;

    type MigrationFunction = () => void;
    const migrations: Record<number, MigrationFunction> = {
      // --- MIGRATION from v1 to v2 ---
      1: () => {
        console.log("Running migration v1 -> v2");
        const allItems: Record<string, string> = { ...localStorage };

        Object.entries(allItems).forEach(([key, value]) => {
          let match: RegExpMatchArray | null;
          try {
            if ((match = key.match(/^ww:visibility:([^:]+)$/))) {
              WWStorage.setAdVisibility(match[1], value !== 'false');
            } else if ((match = key.match(/^ww:phone:([^:]+)$/))) {
              WWStorage.setAdPhone(match[1], value.trim());
            } else if ((match = key.match(/^ww:phone:([^:]+):visible$/))) {
              WWStorage.setPhoneHidden(match[1].trim(), value === 'false');
            } else if ((match = key.match(/^ww:no_phone:([^:]+)$/))) {
              WWStorage.setAdNoPhone(match[1].trim(), true);
            }
            if (match) {
              localStorage.removeItem(match[0]);
            }
          } catch (e) {
            console.error(`Migration v1 error processing key ${key}:`, e);
          }
        });
      },

      // --- MIGRATION from v2 to v3 ---
      2: () => {
        console.log("Running migration v2 -> v3");
        const allItems: Record<string, string> = { ...localStorage };

        Object.entries(allItems).forEach(([key, value]) => {
          let match: RegExpMatchArray | null;
          try {
            if ((match = key.match(/^ww2:hidden-phones$/))) {
              const phones: string[] = JSON.parse(value);
              phones.forEach((phone) => WWStorage.setPhoneHidden(phone, true));
            } else if ((match = key.match(/^ww2:phone-ads:([^:]+)$/))) {
              const phone = match[1];
              const adsArray: string[] = JSON.parse(value);
              adsArray.forEach(adString => {
                const parts = adString.split('|');
                if (parts.length >= 2) {
                  WWStorage.addPhoneAd(phone, parts[0], parts.slice(1).join('|'));
                }
              });
            } else if ((match = key.match(/^ww2:phone-h-reason:([^:]+)$/))) {
              WWStorage.setPhoneHiddenReason(match[1], value);
            }
            if (match) {
              localStorage.removeItem(match[0]);
            }
          } catch (e) {
            console.error(`Migration v2 error processing key ${key}:`, e);
          }
        });
      },

      // --- MIGRATION from v3 to v4 ---
      3: () => {
        console.log("Running migration v3 -> v4");
        const favsString = localStorage.getItem('ww:temp_save');
        if (favsString) {
          const favs: string[] = JSON.parse(favsString);
          favs.forEach(f => {
            try {
              const id = f.split('|')[0];
              const phone = WWStorage.getAdPhone(id);
              if (phone) {
                WWStorage.toggleFavorite(phone, true);
              }
            } catch (e) {
              console.error(`Migration v3 error processing favorite entry ${f}:`, e);
            }
          });
          localStorage.removeItem('ww:temp_save');
        }
      }
    };

    if (parsedVersion < currentVersion) {
      console.log(`Upgrading WWStorage from v${parsedVersion} to v${currentVersion}`);
      for (let i = parsedVersion; i < currentVersion; i++) {
        if (migrations[i]) {
          try {
            console.log(`Running migration for v${i + 1}...`);
            migrations[i]();
            console.log(`Migration for v${i + 1} completed.`);
          } catch (e) {
            console.error(`Error during migration for v${i + 1}:`, e);
          }
        } else {
          console.warn(`No migration found for version ${i+1}`);
        }
      }

      localStorage.setItem('ww:storage:version', String(currentVersion));
      console.log(`WWStorage upgrade complete. Current version: ${currentVersion}`);
    } else {
      console.log(`WWStorage is up to date (v${currentVersion}).`);
    }
  }
};

WWBrowserStorage.listen((changes) => {
  Object.keys(changes).forEach(key => {
    let match: any;

    if ((match = key.match(/^ww:(search_results|image_results):([^:]+)$/))) {
      WWStorage.triggerAdChanged(match[2]);
    }
  })
});
