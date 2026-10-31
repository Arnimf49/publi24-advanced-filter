/* The presentation reuses components from the extension, which read the
 * WebExtension `chrome` API at module load. A regular page has no extension
 * APIs, so provide the small subset those components touch. */

type ChromeShim = Record<string, any>;

const browserWindow = window as unknown as {chrome?: ChromeShim};
const existingChrome: ChromeShim = browserWindow.chrome ?? {};

const existingStorage: ChromeShim = existingChrome.storage ?? {};
const existingLocal: ChromeShim = existingStorage.local ?? {};

browserWindow.chrome = {
  ...existingChrome,
  runtime: {
    lastError: null,
    sendMessage: () => undefined,
    onMessage: {
      addListener: () => undefined,
    },
    ...existingChrome.runtime,
  },
  storage: {
    ...existingStorage,
    local: {
      get: async () => ({}),
      set: async () => undefined,
      onChanged: {
        addListener: () => undefined,
        removeListener: () => undefined,
      },
      ...existingLocal,
    },
  },
  extension: {
    inIncognitoContext: false,
    ...existingChrome.extension,
  },
  permissions: {
    contains: async () => true,
    getAll: async () => ({}),
    ...existingChrome.permissions,
  },
};
