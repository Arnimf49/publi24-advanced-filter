import {browserApi} from "../globals";

interface PermissionsResponse {
  data_collection: string[] | undefined;
}

interface HostPermissionsResponse {
  google: boolean;
  lens: boolean;
  inspectorEscorte: boolean;
}

const GOOGLE_ORIGIN = 'https://www.google.com/*';
const LENS_ORIGIN = 'https://lens.google.com/*';
const INSPECTOR_ESCORTE_ORIGIN = 'https://api.inspector-escorte.com/*';
const GOTO_RESOLVE_TIMEOUT_MS = 15_000;
// Every iOS browser is WebKit and this extension only runs in Orion on iOS.
const IS_IOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
  || /iPhone|iPad|iPod/.test(navigator.platform)
  // iPad desktop-mode user agents report Macintosh; real Macs have no touch.
  || (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1);

async function getHostPermissions(): Promise<HostPermissionsResponse> {
  // Orion on iOS declares the host permissions but does not expose a usable
  // permission state through browser.permissions.contains(). The user cannot
  // toggle these permissions either, so treat the manifest grants as active
  // instead of showing false "missing permissions" warnings.
  if (IS_IOS) {
    console.warn('Orion iOS: assuming declared host permissions are granted.');
    return { google: true, lens: true, inspectorEscorte: true };
  }

  const [google, lens, inspectorEscorte] = await Promise.all([
    browserApi.permissions.contains({ origins: [GOOGLE_ORIGIN] }),
    browserApi.permissions.contains({ origins: [LENS_ORIGIN] }),
    browserApi.permissions.contains({ origins: [INSPECTOR_ESCORTE_ORIGIN] }),
  ]);

  return { google, lens, inspectorEscorte };
}

async function resolveUrl(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GOTO_RESOLVE_TIMEOUT_MS);

  try {
    const res = await fetch(url, { redirect: 'follow', signal: controller.signal, credentials: 'include' });
    return res.url;
  } catch (error) {
    console.error(`Error resolving URL "${url}":`, error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
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

  if (message.type === 'GET_HOST_PERMISSIONS') {
    getHostPermissions()
      .then((response) => sendResponse(response))
      .catch((error) => {
        console.error('Error getting host permissions:', error);
        sendResponse({
          google: true,
          lens: true,
          inspectorEscorte: true,
        });
      });

    return true;
  }

  if (message.type === 'BACKGROUND_FETCH') {
    fetch(message.url as string)
      .then(async (res) => {
        if (!res.ok) {
          sendResponse({ ok: false });
          return;
        }
        const data = await res.json();
        sendResponse({ ok: true, data });
      })
      .catch((error) => {
        console.error('BACKGROUND_FETCH error:', error);
        sendResponse({ ok: false });
      });

    return true;
  }

  if (message.type === 'RESOLVE_GOTO_URL') {
    let url: string;

    try {
      url = new URL(message.gotoPath as string, 'https://www.google.com').href;
    } catch (error) {
      console.error(`Error parsing goto path "${message.gotoPath}":`, error);
      sendResponse({ url: null });
      return true;
    }

    resolveUrl(url).then(resolvedUrl => sendResponse({ url: resolvedUrl }));

    return true;
  }

  return false;
});
