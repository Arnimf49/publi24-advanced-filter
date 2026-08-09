import {bgApi} from '../../common/background/bgApi';
import {AdUuid} from './storage';
import {dataCompression} from './dataCompression';

export interface InspectorAd {
  id: string;
  title: string;
  description: string;
  phone: string;
  views: number;
  created_at: string;
  updated_at: string;
  geolocation: string;
  images: string[];
  urls: {'inspector-escorte': string; publi24: string;};
}

const API_URL = 'https://api.inspector-escorte.com/v1/ads';
const RATE_LIMIT = 7;

let tokens = RATE_LIMIT;
let lastRefill = Date.now();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function refillTokens(): void {
  const now = Date.now();
  const elapsedSeconds = (now - lastRefill) / 1000;

  tokens = Math.min(RATE_LIMIT, tokens + elapsedSeconds * RATE_LIMIT);
  lastRefill = now;
}

function getPubli24AdKey(url: string): string {
  return dataCompression.compressAdLink(url).replace(/\/+$/, '').toLowerCase();
}

async function waitForToken(): Promise<void> {
  refillTokens();

  if (tokens >= 1) {
    tokens -= 1;
    return;
  }

  await sleep(((1 - tokens) / RATE_LIMIT) * 1000);
  return waitForToken();
}

const pingPromise: Promise<boolean> = bgApi.backgroundFetch(`${API_URL}?limit=1&phone=test`)
  .then((response) => {
    if (!response.ok) {
      console.error('Inspector escorte call failed: ' + response.data);
    }
    return response.ok
  })
  .catch(() => false);

export const inspectorEscorteApi = {
  isEnabledAndAvailable(): Promise<boolean> {
    if (localStorage.getItem('_pw_disable_inspector_escorte_integration') === 'true') {
      return Promise.resolve(false);
    }

    return pingPromise;
  },

  async fetchAds(phone: string): Promise<InspectorAd[] | null> {
    try {
      await waitForToken();

      const response = await bgApi.backgroundFetch(`${API_URL}?limit=100&phone=${encodeURIComponent(phone)}`);
      if (!response.ok) {
        console.error('Inspector escorte call failed: ' + response.data);
        return null;
      }

      const result = response.data as {data: InspectorAd[]};
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      return result.data.filter((ad) => new Date(ad.updated_at) >= oneMonthAgo);
    } catch (error) {
      console.error('fetchAds error:', error);
      return null;
    }
  },

  mergeDuplicateSources(inspectorAds: InspectorAd[], localAds: AdUuid[]): {inspectorAds: InspectorAd[]; localOnlyAds: AdUuid[]} {
    const inspectorKeys = new Set(inspectorAds.map((ad) => getPubli24AdKey(ad.urls.publi24)));

    const localKeys = new Set<string>();
    const localOnlyAds = localAds.filter((ad) => {
      const key = getPubli24AdKey(ad.url);
      if (inspectorKeys.has(key) || localKeys.has(key)) {
        return false;
      }

      localKeys.add(key);
      return true;
    });

    return {
      inspectorAds,
      localOnlyAds,
    };
  },
};
