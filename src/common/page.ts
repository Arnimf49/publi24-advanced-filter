type PageLoadPromise = Promise<Response> & { is_resolved?: boolean };

export interface BrowserError extends Error {
  code?: number;
}

interface TypeConfig {
  cooldown: number;
  throttleAfter: number;
}

const DEFAULT_CONFIG: TypeConfig = {
  cooldown: 10000,
  throttleAfter: 20,
};

const CONFIG_OVERRIDES: Record<string, TypeConfig> = {
  'nimfomane.com': {
    cooldown: 12000,
    throttleAfter: 10,
  },
};

const PAGE_TYPE: Record<string, {
  CACHE: Record<string, Error | HTMLElement>,
  PAGE_LOAD_PROMISES: { [url: string]: PageLoadPromise },
  ALL_PAGE_LOAD_PROMISES: PageLoadPromise[],
  PAGE_LOAD_REQUESTS: number,
}> = {}

function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
}

function getConfigForDomain(domain: string): TypeConfig {
  return CONFIG_OVERRIDES[domain] || DEFAULT_CONFIG;
}

export const page = {
  async load(url: string) {
    const domain = getDomainFromUrl(url);
    const config = getConfigForDomain(domain);
    const type = domain;
    if (!PAGE_TYPE[type]) {
      PAGE_TYPE[type] = {
        CACHE: {},
        PAGE_LOAD_PROMISES: {},
        ALL_PAGE_LOAD_PROMISES: [],
        PAGE_LOAD_REQUESTS: 0,
      };
    }

    const returnFromCache = (cacheUrl: string): HTMLElement => {
      const cachedItem = PAGE_TYPE[type].CACHE[cacheUrl];
      if (cachedItem instanceof Error) {
        throw cachedItem;
      }
      return cachedItem as HTMLElement;
    }

    if (PAGE_TYPE[type].CACHE[url]) {
      return returnFromCache(url);
    }
    // @ts-ignore
    if (PAGE_TYPE[type].PAGE_LOAD_PROMISES[url]) {
      await PAGE_TYPE[type].PAGE_LOAD_PROMISES[url];
      await new Promise<void>((r) => setTimeout(r, 200));
      return returnFromCache(url);
    }

    PAGE_TYPE[type].PAGE_LOAD_REQUESTS++;

    if (PAGE_TYPE[type].PAGE_LOAD_REQUESTS > config.throttleAfter) {
      PAGE_TYPE[type].ALL_PAGE_LOAD_PROMISES = PAGE_TYPE[type].ALL_PAGE_LOAD_PROMISES.filter(p => !p.is_resolved);
      await Promise.race([
        Promise.all(PAGE_TYPE[type].ALL_PAGE_LOAD_PROMISES),
        new Promise<void>((r) => setTimeout(r, config.cooldown + 1000))
      ]);
      if (PAGE_TYPE[type].PAGE_LOAD_REQUESTS > config.throttleAfter) {
        await new Promise<void>((r) => setTimeout(r, config.cooldown / 2));
      }
    }

    const promise: PageLoadPromise = fetch(url);
    PAGE_TYPE[type].PAGE_LOAD_PROMISES[url] = promise;
    const trackablePromise = promise.then(() => {
      promise.is_resolved = true;
    }).catch(() => {
      promise.is_resolved = true
    });
    PAGE_TYPE[type].ALL_PAGE_LOAD_PROMISES.push(promise);

    trackablePromise.catch(e => console.warn("Page load tracking promise failed:", e));

    setTimeout(() => {
      PAGE_TYPE[type].PAGE_LOAD_REQUESTS = Math.max(0, PAGE_TYPE[type].PAGE_LOAD_REQUESTS - 1);
      delete PAGE_TYPE[type].PAGE_LOAD_PROMISES[url];
    }, config.cooldown);

    let pageResponse: Response;
    try {
      pageResponse = await promise;
    } catch (fetchError) {
      const error = fetchError instanceof Error ? fetchError : new Error(`Network error fetching ${url}`);
      (error as BrowserError).code = 503;
      PAGE_TYPE[type].CACHE[url] = error;
      throw error;
    }

    if (!pageResponse.ok) {
      const error = new Error(`Failed to load ${url}`) as BrowserError;
      error.code = pageResponse.status;
      PAGE_TYPE[type].CACHE[url] = error;
      throw error;
    }

    const template = document.createElement('div');
    template.innerHTML = await pageResponse.text();
    PAGE_TYPE[type].CACHE[url] = template;

    return template;
  }
}
