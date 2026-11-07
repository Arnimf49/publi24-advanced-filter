import { browserApi } from '../globals';

export const bgApi = {
  resolveGotoUrl(gotoPath: string): Promise<string | null> {
    return new Promise(resolve =>
      // @ts-ignore
      browserApi.runtime.sendMessage({ type: 'RESOLVE_GOTO_URL', gotoPath }, (response: { url: string | null }) =>
        resolve(response?.url ?? null)
      )
    );
  },

  backgroundFetch(url: string): Promise<{ ok: boolean; data?: unknown }> {
    return new Promise(resolve =>
      // @ts-ignore
      browserApi.runtime.sendMessage({ type: 'BACKGROUND_FETCH', url }, (response: { ok: boolean; data?: unknown }) =>
        resolve(response)
      )
    );
  },
};
