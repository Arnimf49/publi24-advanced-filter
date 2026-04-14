import {browserApi} from "../globals";

interface PermissionsResponse {
  data_collection: string[] | undefined;
}

async function batchThrottle<T>(items: T[], batchSize: number, delayMs: number, fn: (item: T) => Promise<unknown>): Promise<unknown[]> {
  const results: unknown[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    if (i > 0) {
      await new Promise(r => setTimeout(r, delayMs));
    }
    results.push(...await Promise.all(items.slice(i, i + batchSize).map(fn)));
  }

  return results;
}

browserApi.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_PERMISSIONS') {
    browserApi.permissions.getAll().then((permissions: any) => {
      const response: PermissionsResponse = {
        data_collection: permissions.data_collection,
      };

      sendResponse(response);
    }).catch((error: any) => {
      console.error('Error getting permissions:', error);
      sendResponse({
        data_collection: undefined,
      });
    });

    return true;
  }

  if (message.type === 'RESOLVE_GOTO_URLS') {
    const urls = (message.gotoPaths as string[])
      .map(p => new URL(p, 'https://www.google.com').href);
    batchThrottle(urls, 10, 5000, async url => {
      try {
        const res = await fetch(url, { redirect: 'follow' });
        return res.url;
      } catch (error) {
        console.error(error);
        return null;
      }
    }).then(locations => sendResponse({ locations }));
    return true;
  }

  return false;
});
