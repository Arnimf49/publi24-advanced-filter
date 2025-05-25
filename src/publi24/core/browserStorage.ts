import StorageChange = chrome.storage.StorageChange;
import {IS_SAFARI_IOS} from "../../common/globals";

// @ts-ignore
if (typeof browser === "undefined" && typeof chrome !== "undefined") {
  // @ts-ignore
  var browser = chrome;
}

const WWBrowserStorageCache: Record<string, any> = {};
const watchKeys: string[] = [];

export const WWBrowserStorage = {
  async get(key: string | string[]): Promise<Record<string, any>> {
    if (!IS_SAFARI_IOS) {
      return browser.storage.local.get(key);
    }

    const keys = (typeof key === 'string' ? [key] : key);

    keys
      .filter((k) => watchKeys.includes(k))
      .forEach((k) => watchKeys.push(k));

    try {
      const data = await browser.storage.local.get(key);
      Object.entries(data).forEach(([cacheKey, value]) => {
        WWBrowserStorageCache[cacheKey] = value;
      });
      return data;
    } catch (e: any) {
      console.error("Storage get error, falling back to cache:", e);

      const data: Record<string, any> = {__from__cache: true};
      keys.forEach((k) => {
        data[k] = WWBrowserStorageCache[k];
      });
      return data;
    }
  },

  async set(key: string, data: any): Promise<void> {
    if (!IS_SAFARI_IOS) {
      return browser.storage.local.set({ [key]: data });
    }

    try {
      // Try to do a get first. When set breaks for some reason it doesn't even throw just breaks everything.
      // Get still throws and can be caught, so this is how we test that set will work.
      await browser.storage.local.get(key);
    } catch (e: any) {
      console.error(e);
      // On safari the browser storage api breaks after returning from another tab. Reload to reset.
      window.location.reload();
      throw e;
    }

    try {
      return browser.storage.local.set({ [key]: data });
    } catch (error) {
      throw error;
    }
  },

  listen(listener: (changes: { [key: string]: StorageChange }) => void) {
    if (!IS_SAFARI_IOS) {
      // This is also broken on safari.
      browser.storage.local.onChanged.addListener(listener);
    } else {
      const currentValues: Record<string, any> = {};

      setInterval(async () => {
        const newValues = await WWBrowserStorage.get(watchKeys);
        const changes: Record<string, StorageChange> = {};

        Object.entries(newValues).forEach(([key, data]) => {
          if (currentValues[key] === data) {
            changes[key] = {oldValue: currentValues[key], newValue: data};
            currentValues[key] = data;
          }
        });

        listener(changes);
      }, 500);
    }
  }
};
