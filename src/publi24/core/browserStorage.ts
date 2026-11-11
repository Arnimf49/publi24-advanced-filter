import StorageChange = chrome.storage.StorageChange;
import {browserApi, IS_SAFARI_IOS} from "../../common/globals";

const WWBrowserStorageCache: Record<string, any> = {};
const watchKeys: string[] = [];

// On iOS (Orion) the native bridge behind the extension storage API briefly
// disappears while the browser switches WebViews, e.g. right after opening the
// Google search or Lens tab. Calls made in that window throw
// "undefined is not an object (evaluating 'window.webkit.messageHandlers')",
// and the bridge is back a fraction of a second later. Retry instead of
// treating the call as failed (or reloading the page).
const IOS_STORAGE_RETRY_ATTEMPTS = 15;
const IOS_STORAGE_RETRY_DELAY_MS = 100;

async function retryStorage<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < IOS_STORAGE_RETRY_ATTEMPTS; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt < IOS_STORAGE_RETRY_ATTEMPTS - 1) {
        await new Promise<void>((resolve) => setTimeout(resolve, IOS_STORAGE_RETRY_DELAY_MS));
      }
    }
  }

  throw lastError;
}

export const WWBrowserStorage = {
  async get(key: string | string[]): Promise<Record<string, any>> {
    if (!IS_SAFARI_IOS) {
      return browserApi.storage.local.get(key);
    }

    const keys = (typeof key === 'string' ? [key] : key);

    keys
      .filter((k) => watchKeys.includes(k))
      .forEach((k) => watchKeys.push(k));

    try {
      const data = await retryStorage(() => browserApi.storage.local.get(key));

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
      await browserApi.storage.local.set({ [key]: data });
      return;
    }

    try {
      // Try to do a get first. When set breaks for some reason it doesn't even throw just breaks everything.
      // Get still throws and can be caught, so this is how we test that set will work.
      await retryStorage(() => browserApi.storage.local.get(key));
    } catch (e: any) {
      console.error("Storage set check error, not writing:", e);
      throw e;
    }

    await retryStorage(() => browserApi.storage.local.set({ [key]: data }));
  },

  listen(listener: (changes: { [key: string]: StorageChange }) => void) {
    if (!IS_SAFARI_IOS) {
      // This is also broken on safari.
      browserApi.storage.local.onChanged.addListener(listener);

      return () => browserApi.storage.local.onChanged.removeListener(listener)
    }

    const currentValues: Record<string, any> = {};
    const interval = setInterval(async () => {
      const newValues = await WWBrowserStorage.get(watchKeys);
      const changes: Record<string, StorageChange> = {};

      Object.entries(newValues).forEach(([key, data]) => {
        if (currentValues[key] !== data) {
          changes[key] = {oldValue: currentValues[key], newValue: data};
          currentValues[key] = data;
        }
      });

      if (Object.keys(changes).length > 0) {
        listener(changes);
      }
    }, 500);

    return () => clearInterval(interval);
  },

  when(key: string, value: any, then: () => any) {
    if (!IS_SAFARI_IOS) {
      const conditionChecker = (changes: { [key: string]: StorageChange }) => {
        if (changes[key]?.newValue === value) {
          removeListener();
          then();
        }
      };
      const removeListener = this.listen(conditionChecker);

      return removeListener;
    }

    // WebKit/Orion: `storage.local.onChanged` and the key registry behind
    // `listen()` are unreliable, so poll the single key directly.
    let cancelled = false;

    const check = async (): Promise<void> => {
      const data = await WWBrowserStorage.get(key);

      // A cached value may be stale while the iOS bridge is unavailable.
      if (!(data as any).__from__cache && data[key] === value) {
        then();
        return;
      }

      if (!cancelled) {
        setTimeout(check, 500);
      }
    };

    check().catch(error => console.error('Error waiting for storage value:', error));

    return () => {
      cancelled = true;
    };
  },
};
