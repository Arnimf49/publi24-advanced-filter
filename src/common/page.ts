export interface BrowserError extends Error {
  code?: number;
}

interface TypeConfig {
  throttleAfter: number;
  cooldown: number;
  delayBetween?: number;
}

const DEFAULT_CONFIG: TypeConfig = {
  throttleAfter: 20,
  cooldown: 10000,
  delayBetween: 0,
};

const CONFIG_OVERRIDES: Record<string, TypeConfig> = {
  'nimfomane.com': {
    throttleAfter: 3,
    cooldown: 13500,
    delayBetween: 1800,
  },
};

interface QueueItem {
  url: string;
  resolve: (value: Document) => void;
  reject: (reason: Error) => void;
  priority: number;
}

const PAGE_TYPE: Record<string, {
  CACHE: Record<string, Error | Document>;
  queue: QueueItem[];
  running: boolean;
  cooldowns: number[];
  lastStartedAt: number;
  pendingRequests: Map<string, Promise<Document>>;
}> = {};

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

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitUntilAllowed(type: string, config: TypeConfig) {
  while (true) {
    const now = Date.now();

    PAGE_TYPE[type].cooldowns = PAGE_TYPE[type].cooldowns.filter(t => t > now);

    if (PAGE_TYPE[type].cooldowns.length < config.throttleAfter) {
      const sinceLast = now - PAGE_TYPE[type].lastStartedAt;
      const delayBetween = config.delayBetween || 0;
      if (sinceLast >= delayBetween) return;

      await sleep(delayBetween - sinceLast);
    } else {
      const waitUntil = Math.min(...PAGE_TYPE[type].cooldowns);
      await sleep(waitUntil - now);
    }
  }
}

function startRequest(type: string, config: TypeConfig, item: QueueItem) {
  const now = Date.now();
  PAGE_TYPE[type].lastStartedAt = now;
  PAGE_TYPE[type].cooldowns.push(now + config.cooldown);

  executeRequest(type, item).catch(() => {});
}

async function executeRequest(type: string, item: QueueItem) {
  try {
    const pageResponse = await fetch(item.url);

    if (!pageResponse.ok) {
      const error = new Error(`Failed to load ${item.url}`) as BrowserError;
      error.code = pageResponse.status;
      if (pageResponse.status >= 400 && pageResponse.status < 500 && pageResponse.status !== 429) {
        PAGE_TYPE[type].CACHE[item.url] = error;
      }
      item.reject(error);
      return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(await pageResponse.text(), 'text/html');
    PAGE_TYPE[type].CACHE[item.url] = doc;
    item.resolve(doc);
  } catch (fetchError) {
    const error = fetchError instanceof Error ? fetchError : new Error(`Network error fetching ${item.url}`);
    (error as BrowserError).code = 503;
    item.reject(error);
  }
}

async function runQueue(type: string, config: TypeConfig) {
  if (PAGE_TYPE[type].running) return;
  PAGE_TYPE[type].running = true;

  while (PAGE_TYPE[type].queue.length > 0) {
    await waitUntilAllowed(type, config);

    PAGE_TYPE[type].queue.sort((a, b) => b.priority - a.priority);
    const item = PAGE_TYPE[type].queue.shift()!;
    startRequest(type, config, item);
  }

  PAGE_TYPE[type].running = false;
}

export const page = {
  async load(url: string, priority: number = 100): Promise<Document> {
    const domain = getDomainFromUrl(url);
    const config = getConfigForDomain(domain);
    const type = domain;

    if (!PAGE_TYPE[type]) {
      PAGE_TYPE[type] = {
        CACHE: {},
        queue: [],
        running: false,
        cooldowns: [],
        lastStartedAt: 0,
        pendingRequests: new Map(),
      };
    }

    if (PAGE_TYPE[type].CACHE[url]) {
      const cachedItem = PAGE_TYPE[type].CACHE[url];
      if (cachedItem instanceof Error) {
        throw cachedItem;
      }
      return cachedItem;
    }

    const existingRequest = PAGE_TYPE[type].pendingRequests.get(url);
    if (existingRequest) {
      const queueIndex = PAGE_TYPE[type].queue.findIndex(item => item.url === url);
      if (queueIndex !== -1 && PAGE_TYPE[type].queue[queueIndex].priority < priority) {
        PAGE_TYPE[type].queue[queueIndex].priority = priority;
      }
      return existingRequest;
    }

    const promise = new Promise<Document>((resolve, reject) => {
      const item = { url, resolve, reject, priority };
      PAGE_TYPE[type].queue.push(item);
      runQueue(type, config);
    });

    PAGE_TYPE[type].pendingRequests.set(url, promise);

    promise.finally(() => {
      PAGE_TYPE[type].pendingRequests.delete(url);
    });

    return promise;
  }
}
