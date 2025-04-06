import {IS_SAFARI_IOS} from "./globals";

// @ts-ignore
if (typeof browser === "undefined" && typeof chrome !== "undefined") {
  // @ts-ignore
  var browser = chrome;
}

const WWBrowserStorageCache: Record<string, any> = {};

interface WWBrowserStorageInterface {
  get(key: string | string[] | Record<string, any> | null): Promise<Record<string, any>>;
  set(key: string, data: any): Promise<void>;
}

export const WWBrowserStorage: WWBrowserStorageInterface = {
  async get(key: string | string[] | Record<string, any> | null): Promise<Record<string, any>> {
    if (!IS_SAFARI_IOS) {
      return browser.storage.local.get(key);
    }

    try {
      const data = await browser.storage.local.get(key);
      Object.entries(data).forEach(([cacheKey, value]) => {
        WWBrowserStorageCache[cacheKey] = value;
      });
      return data;
    } catch (e: any) {
      console.error("Storage get error, falling back to cache:", e);
      const fallbackData: Record<string, any> = { __from__cache: true };

      let keysToFetch: string[] = [];
      if (typeof key === 'string') {
        keysToFetch = [key];
      } else if (Array.isArray(key)) {
        keysToFetch = key;
      } else if (typeof key === 'object' && key !== null) {
        keysToFetch = Object.keys(key);
      }

      keysToFetch.forEach((k: string) => {
        fallbackData[k] = WWBrowserStorageCache[k];
      });

      return fallbackData;
    }
  },

  async set(key: string, data: any): Promise<void> {
    if (IS_SAFARI_IOS) {
      WWBrowserStorageCache[key] = data;
    }

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
    }

    return browser.storage.local.set({ [key]: data });
  }
};
