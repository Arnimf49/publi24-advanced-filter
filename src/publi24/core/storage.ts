import {WWBrowserStorage} from "./browserStorage";
import {IS_MOBILE_VIEW, IS_PROMOTER} from "../../common/globals";

export interface AdUuid {
  id: string;
  url: string;
}

interface AdItem {
  visibility?: boolean;
  phone?: string | null;
  noPhone?: boolean;
  duplicatesInOtherLoc?: string[] | null;
  duplicatesInOtherLocNotOld?: string[] | null;
  deadLinks?: string[] | null;
  phoneTime?: number;
  imagesTime?: number;
  lastSeen?: number;
  analyzedAt?: number;
  height?: any;
  weight?: any;
  age?: any;
  [key: string]: any;
}

interface PhoneItem {
  hidden?: boolean;
  hideResetAt?: number;
  ads?: string[]; // Format: "id|url"
  adsOptimized?: string;
  hideReason?: string;
  height?: any;
  weight?: any;
  age?: any;
  firstSeen?: number;
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
  settingsChanged: [] as Array<() => void>,
};

function compressAdLink(url: string): string {
  const match = url.match(/https:\/\/www\.publi24\.ro\/anunturi\/(.*)\/anunt\/[^/]+\/([^.]+)\.html/);
  if (match) {
    return `${match[1]}/${match[2]}`;
  }
  return url;
}

function decompressAdLink(compressed: string): string {
  if (compressed.startsWith('http')) {
    return compressed;
  }
  const parts = compressed.split('/');
  if (parts.length >= 2) {
    const id = parts[parts.length - 1];
    const path = parts.slice(0, -1).join('/');
    return `https://www.publi24.ro/anunturi/${path}/anunt/titlu-sters/${id}.html`;
  }
  return compressed;
}

function parseAdUuid(uuid: string): AdUuid {
  const parts = uuid.split('|');
  return {
    id: parts[0],
    url: parts.length >= 2 ? decompressAdLink(parts[1]) : ''
  };
}

function serializeAdUuid(adUuid: AdUuid): string {
  return `${adUuid.id}|${compressAdLink(adUuid.url)}`;
}

export const WWStorage = {

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
    if (value === null || value === undefined) {
      delete item[prop];
    } else {
      item[prop] = value;
    }
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
    WWStorage.setAdProp(id, 'visibility', visible ? 1 : 0);
  },

  isAdVisible(id: string): boolean {
    const value = WWStorage.getAdProp<number | boolean>(id, 'visibility');
    return value !== false && value !== 0;
  },

  setAdPhone(id: string, phone: string): void {
    WWStorage.setAdProp(id, 'phone', phone);
    WWStorage.delAdProp(id, 'noPhone');

    const firstSeen = WWStorage.getPhoneProp<number>(phone, 'firstSeen');
    if (!firstSeen) {
      WWStorage.setPhoneProp(phone, 'firstSeen', Date.now());
    }
  },

  getAdPhone(id: string): string | null | undefined {
    return WWStorage.getAdProp<string | null>(id, 'phone');
  },

  setAdNoPhone(id: string, value: boolean = true): void {
    WWStorage.setAdProp(id, 'noPhone', value ? 1 : 0);
  },

  hasAdNoPhone(id: string): boolean {
    const value = WWStorage.getAdProp<number | boolean>(id, 'noPhone');
    return value === true || value === 1;
  },

  addAdDuplicateInOtherLocation(id: string, link: string, old: boolean = true): void {
    const compressedLink = compressAdLink(link);
    const list = WWStorage.getAdProp<string[]>(id, 'duplicatesInOtherLoc') || [];
    if (!list.includes(compressedLink)) {
      list.push(compressedLink);
      WWStorage.setAdProp(id, 'duplicatesInOtherLoc', list);
    }

    if (!old) {
      const notOldList = WWStorage.getAdProp<string[]>(id, 'duplicatesInOtherLocNotOld') || [];
      if (!notOldList.includes(compressedLink)) {
        notOldList.push(compressedLink);
        WWStorage.setAdProp(id, 'duplicatesInOtherLocNotOld', notOldList);
      }
    }
  },

  clearAdDuplicatesInOtherLocation(id: string): void {
    WWStorage.setAdProp(id, 'duplicatesInOtherLoc', null);
    WWStorage.setAdProp(id, 'duplicatesInOtherLocNotOld', null);
  },

  hasAdDuplicatesInOtherLocation(id: string): boolean {
    return WWStorage.getAdDuplicatesInOtherLocation(id).length > 0;
  },

  getAdDuplicatesInOtherLocation(id: string): string[] {
    const list = WWStorage.getAdProp<string[]>(id, 'duplicatesInOtherLoc') || [];
    return list.map(link => decompressAdLink(link));
  },

  getAdNotOldDuplicatesInOtherLocation(id: string): string[] {
    const list = WWStorage.getAdProp<string[]>(id, 'duplicatesInOtherLocNotOld') || [];
    return list.map(link => decompressAdLink(link));
  },

  addAdDeadLink(id: string, link: string): void {
    const compressedLink = compressAdLink(link);
    const list = WWStorage.getAdProp<string[]>(id, 'deadLinks') || [];
    if (!list.includes(compressedLink)) {
      list.push(compressedLink);
      WWStorage.setAdProp(id, 'deadLinks', list);
    }
  },

  clearAdDeadLinks(id: string): void {
    WWStorage.setAdProp(id, 'deadLinks', null);
  },

  getAdDeadLinks(id: string): string[] {
    const list = WWStorage.getAdProp<string[]>(id, 'deadLinks') || [];
    return list.map(link => decompressAdLink(link));
  },

  setInvestigatedTime(id: string, timestamp: number): void {
    WWStorage.setAdProp(id, 'phoneTime', timestamp);
  },

  setSeenTime(id: string, timestamp: number): void {
    WWStorage.setAdProp(id, 'lastSeen', timestamp);
  },

  getSeenTime(id: string): number | undefined {
    return WWStorage.getAdProp(id, 'lastSeen');
  },

  setAnalyzedTime(id: string, timestamp: number): void {
    WWStorage.setAdProp(id, 'analyzedAt', timestamp);
  },

  getAnalyzedAt(id: string): number | undefined {
    return WWStorage.getAdProp(id, 'analyzedAt');
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

  getAdHeight(id: string): any {
    return WWStorage.getAdProp(id, 'height');
  },

  getAdWeight(id: string): any {
    return WWStorage.getAdProp(id, 'weight');
  },

  getAdAge(id: string): any {
    return WWStorage.getAdProp(id, 'age');
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
    if (value === null || value === undefined) {
      delete item[prop];
    } else {
      item[prop] = value;
    }
    localStorage.setItem(`ww2:phone:${phone}`, JSON.stringify(item));
    _WW_STORE_CACHE.phone[phone] = { ...item };
    WWStorage.triggerPhoneChanged(phone);
  },

  getPhoneProp<T = any>(phone: string, prop: string): T | undefined {
    const item = this.getPhoneItem(phone);
    return item[prop] as T | undefined;
  },

  setPhoneHidden(phone: string, h: boolean = true): void {
    WWStorage.setPhoneProp(phone, 'hidden', h ? 1 : 0);
    if (!h) {
      WWStorage.setPhoneProp(phone, 'hideResetAt', null);
      WWStorage.setPhoneProp(phone, 'hideReason', null);
    }
  },

  isPhoneHidden(phone: string): boolean {
    const value = WWStorage.getPhoneProp<number | boolean>(phone, 'hidden');
    return value === true || value === 1;
  },

  getPhoneHideResetAt(phone: string): number | undefined {
    return WWStorage.getPhoneProp<number>(phone, 'hideResetAt');
  },

  setPhoneHideResetAt(phone: string, timestamp: number | null): void {
    WWStorage.setPhoneProp(phone, 'hideResetAt', timestamp);
  },

  getPhoneAds(phone: string): AdUuid[] {
    const ads = WWStorage.getPhoneProp<string[] | string>(phone, 'ads');
    if (typeof ads === 'string') {
      return [];
    }
    const adsArray = Array.isArray(ads) ? [...ads] : [];
    return adsArray.map(uuidStr => parseAdUuid(uuidStr));
  },

  addPhoneAd(phone: string, id: string, url: string): void {
    if (!phone || !id || !url) {
      return;
    }

    const ads = WWStorage.getPhoneAds(phone);
    const newAdUuid: AdUuid = {id, url};
    if (!ads.some(adUuid => adUuid.id === id)) {
      ads.push(newAdUuid);
      WWStorage.setPhoneProp(phone, 'ads', ads.map(adUuid => serializeAdUuid(adUuid)));
    }
  },

  removePhoneAd(phone: string, uuidOrId: string | AdUuid): void {
    if (!phone || !uuidOrId) {
      return;
    }

    const id = typeof uuidOrId === 'string' ? uuidOrId : uuidOrId.id;

    const ads = WWStorage.getPhoneAds(phone);
    const initialLength = ads.length;
    const filteredAds = ads.filter(adUuid => adUuid.id !== id);

    if (filteredAds.length < initialLength) {
      WWStorage.setPhoneProp(phone, 'ads', filteredAds.map(adUuid => serializeAdUuid(adUuid)));
    }
  },

  setPhoneAdFirst(phone: string, uuid: AdUuid): void {
    if (!phone || !uuid) {
      return;
    }
    const ads = WWStorage.getPhoneAds(phone);
    const index = ads.findIndex(adUuid => adUuid.id === uuid.id);
    if (index > 0) {
      ads.splice(index, 1);
      ads.unshift(uuid);
      WWStorage.setPhoneProp(phone, 'ads', ads.map(adUuid => serializeAdUuid(adUuid)));
    } else if (index === -1) {
      ads.unshift(uuid);
      WWStorage.setPhoneProp(phone, 'ads', ads.map(adUuid => serializeAdUuid(adUuid)));
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

  getPhoneFirstSeen(phone: string): number {
    const firstSeen = WWStorage.getPhoneProp<number>(phone, 'firstSeen');
    if (!firstSeen) {
      const now = Date.now();
      WWStorage.setPhoneProp(phone, 'firstSeen', now);
      return now;
    }
    return firstSeen;
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

  setAdDeduplication(enabled: boolean): void {
    localStorage.setItem('ww:ad_deduplication', enabled ? 'true' : 'false');
  },

  isAdDeduplicationEnabled(): boolean {
    return localStorage.getItem('ww:ad_deduplication') === 'true';
  },

  setAutoHideEnabled(enabled: boolean): void {
    localStorage.setItem('ww:auto-hide', enabled ? 'true' : 'false');
  },

  isAutoHideEnabled(): boolean {
    return localStorage.getItem('ww:auto-hide') === 'true';
  },

  setNextOnlyVisibleEnabled(enabled: boolean): void {
    localStorage.setItem('ww:next-only-visible', enabled ? 'true' : 'false');
  },

  isNextOnlyVisibleEnabled(): boolean {
    return localStorage.getItem('ww:next-only-visible') === 'true';
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

  setDefaultManualHideReasonEnabled(enabled: boolean): void {
    localStorage.setItem('ww:default-manual-hide-reason-enabled', enabled ? 'true' : 'false');
  },

  isDefaultManualHideReasonEnabled(): boolean {
    return localStorage.getItem('ww:default-manual-hide-reason-enabled') === 'true';
  },

  setDefaultManualHideReason(reason: string): void {
    localStorage.setItem('ww:default-manual-hide-reason', reason);
  },

  getDefaultManualHideReason(): string {
    return localStorage.getItem('ww:default-manual-hide-reason') || 'aspect';
  },

  setWhatsappMessageEnabled(enabled: boolean): void {
    localStorage.setItem('ww:whatsapp-message-enabled', enabled ? 'true' : 'false');
    WWStorage.triggerSettingsChanged();
  },

  isWhatsappMessageEnabled(): boolean {
    return localStorage.getItem('ww:whatsapp-message-enabled') === 'true';
  },

  setWhatsappMessage(message: string): void {
    localStorage.setItem('ww:whatsapp-message', message);
    WWStorage.triggerSettingsChanged();
  },

  getWhatsappMessage(): string {
    return localStorage.getItem('ww:whatsapp-message') || '';
  },

  setManualPhoneSearchEnabled(enabled: boolean): void {
    localStorage.setItem('ww:manual-phone-search-enabled', enabled ? 'true' : 'false');
  },

  isManualPhoneSearchEnabled(): boolean {
    return localStorage.getItem('ww:manual-phone-search-enabled') === 'true';
  },

  setManualImageSearchEnabled(enabled: boolean): void {
    localStorage.setItem('ww:manual-image-search-enabled', enabled ? 'true' : 'false');
  },

  isManualImageSearchEnabled(): boolean {
    return [(IS_MOBILE_VIEW || IS_PROMOTER) ? '' : null, 'true'].includes(localStorage.getItem('ww:manual-image-search-enabled'));
  },

  getVersion(): string | null {
    return localStorage.getItem('ww:storage:version');
  },

  getAnalyticsSentVersion(): number | null {
    const value = localStorage.getItem('ww:analytics-sent-version');
    return value ? parseInt(value, 10) : null;
  },

  setAnalyticsSentVersion(version: number): void {
    localStorage.setItem('ww:analytics-sent-version', String(version));
  },

  getAnalyticsLastChecked(): number | null {
    const value = localStorage.getItem('ww:analytics-last-checked');
    return value ? parseInt(value, 10) : null;
  },

  setAnalyticsLastChecked(timestamp: number): void {
    localStorage.setItem('ww:analytics-last-checked', String(timestamp));
  },

  getVersionSeen(): string | null {
    return localStorage.getItem('ww:version-seen');
  },

  setVersionSeen(version: string): void {
    localStorage.setItem('ww:version-seen', version);
  },

  setAdTutorial(id: string, enabled: boolean): void {
    WWStorage.setAdProp(id, 'tutorial', enabled);
  },

  isAdTutorial(id: string): boolean {
    return WWStorage.getAdProp<boolean>(id, 'tutorial') === true;
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

  onSettingsChanged(callback: () => void) {
    _WW_CALLBACKS.settingsChanged.push(callback);
  },

  removeOnSettingsChanged(callback: () => void) {
    _WW_CALLBACKS.settingsChanged = _WW_CALLBACKS.settingsChanged.filter(c => c !== callback);
  },

  triggerSettingsChanged() {
    _WW_CALLBACKS.settingsChanged.forEach(callback => callback());
  },

  exportData(): Record<string, string> {
    const allItems: Record<string, string> = { ...localStorage };
    Object.keys(allItems).forEach(key => {
      if (!key.match(/^ww2?:/)) {
        delete allItems[key];
      }
    });
    return allItems;
  },

  async importData(data: Record<string, string>) {
    Object.entries(data).forEach(([key, data]) => {
      if (key.match(/^ww2?:/)) {
        localStorage.setItem(key, data);
      }
    });
    await WWStorage.upgrade();
  },

  async upgrade(): Promise<void> {
    const version = WWStorage.getVersion();
    const currentVersion = 7;
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
      },

      // --- MIGRATION from v4 to v5 ---
      4: () => {
        console.log("Running migration v4 -> v5");
        const favs = WWStorage.getFavorites();
        favs.forEach(fav => {
          const ads = WWStorage.getPhoneAds(fav);
          const first = ads[0];
          if (first) {
            const firstPhone = WWStorage.getAdPhone(first.id);
            if (!firstPhone) {
              WWStorage.toggleFavorite(fav);
            } else if (firstPhone !== fav) {
              WWStorage.toggleFavorite(fav);
              WWStorage.toggleFavorite(firstPhone, true);
            }
          }
        })
      },

      // --- MIGRATION from v5 to v6 ---
      5: () => {
        console.log("Running migration v5 -> v6");
        const allItems: Record<string, string> = { ...localStorage };

        Object.entries(allItems).forEach(([key, value]) => {
          try {
            if (key.match(/^ww2:phone:/)) {
              const phoneItem: PhoneItem = JSON.parse(value);
              if (phoneItem.ads && Array.isArray(phoneItem.ads)) {
                let modified = false;
                phoneItem.ads = phoneItem.ads.map(adEntry => {
                  const parts = adEntry.split('|');
                  if (parts.length >= 2 && parts[1].startsWith('http')) {
                    modified = true;
                    return `${parts[0]}|${compressAdLink(parts[1])}`;
                  }
                  return adEntry;
                });
                if (modified) {
                  localStorage.setItem(key, JSON.stringify(phoneItem));
                }
              }
            } else if (key.match(/^ww2:[^:]+$/)) {
              const adItem: AdItem = JSON.parse(value);
              let modified = false;

              if (adItem.duplicatesInOtherLoc && Array.isArray(adItem.duplicatesInOtherLoc)) {
                adItem.duplicatesInOtherLoc = adItem.duplicatesInOtherLoc.map(link => {
                  if (link.startsWith('http')) {
                    modified = true;
                    return compressAdLink(link);
                  }
                  return link;
                });
              }

              if (adItem.duplicatesInOtherLocNotOld && Array.isArray(adItem.duplicatesInOtherLocNotOld)) {
                adItem.duplicatesInOtherLocNotOld = adItem.duplicatesInOtherLocNotOld.map(link => {
                  if (link.startsWith('http')) {
                    modified = true;
                    return compressAdLink(link);
                  }
                  return link;
                });
              }

              if (adItem.deadLinks && Array.isArray(adItem.deadLinks)) {
                adItem.deadLinks = adItem.deadLinks.map(link => {
                  if (link.startsWith('http')) {
                    modified = true;
                    return compressAdLink(link);
                  }
                  return link;
                });
              }

              if (modified) {
                localStorage.setItem(key, JSON.stringify(adItem));
              }
            }
          } catch (e) {
            console.error(`Migration v5 error processing key ${key}:`, e);
          }
        });

        _WW_STORE_CACHE.item = {};
        _WW_STORE_CACHE.phone = {};
        console.log("Migration v5 -> v6 complete: All links compressed");
      },

      // --- MIGRATION from v6 to v7 ---
      6: () => {
        console.log("Running migration v6 -> v7");
        const allItems: Record<string, string> = { ...localStorage };
        let cleanedCount = 0;

        Object.entries(allItems).forEach(([key, value]) => {
          try {
            if (key.match(/^ww2:(phone:|[^:]+$)/)) {
              const item = JSON.parse(value);
              let modified = false;

              Object.keys(item).forEach(prop => {
                if (item[prop] === null || item[prop] === undefined) {
                  delete item[prop];
                  modified = true;
                } else if (key.match(/^ww2:[^:]+$/) && (prop === 'visibility' || prop === 'noPhone') && typeof item[prop] === 'boolean') {
                  item[prop] = item[prop] ? 1 : 0;
                  modified = true;
                } else if (key.match(/^ww2:phone:/) && prop === 'hidden' && typeof item[prop] === 'boolean') {
                  item[prop] = item[prop] ? 1 : 0;
                  modified = true;
                }
              });

              if (modified) {
                localStorage.setItem(key, JSON.stringify(item));
                cleanedCount++;
              }
            }
          } catch (e) {
            console.error(`Migration v6 error processing key ${key}:`, e);
          }
        });

        _WW_STORE_CACHE.item = {};
        _WW_STORE_CACHE.phone = {};
        console.log(`Migration v6 -> v7 complete: Removed null properties and converted booleans from ${cleanedCount} items`);
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
