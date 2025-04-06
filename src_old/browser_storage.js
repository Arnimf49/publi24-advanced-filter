const WWBrowserStorageCache = {};

const WWBrowserStorage = {
  async get(key) {
    if (!IS_SAFARI_IOS) {
      return browser.storage.local.get(key);
    }

    try {
      const data = await browser.storage.local.get(key);
      Object.entries(data).forEach(([key, value]) => {
        WWBrowserStorageCache[key] = value;
      });
      return data;
    } catch (e) {
      console.error(e);
      const data = {__from__cache: true};
      (typeof key === 'string' ? [key] : key).forEach((k) => {
        data[k] = WWBrowserStorageCache[k];
      });
      return data;
    }
  },
  async set(key, data) {
    if (!IS_SAFARI_IOS) {
      return browser.storage.local.set({[key]: data});
    }

    try {
      // Try to do a get first. When set breaks for some reason it doesn't even throw just breaks everything.
      // Get still throws and can be caught, so this is how we test that set will work.
      await browser.storage.local.get(key);
    } catch (e) {
      console.error(e);
      // On safari the browser storage api breaks after returning from another tab. Reload to reset.
      window.location.reload();
    }

    return browser.storage.local.set({[key]: data});
  }
};

