import { browserApi } from '../globals';

export const bgApi = {
  resolveGotoUrls(gotoPaths: string[]): Promise<(string | null)[]> {
    return new Promise(resolve =>
      // @ts-ignore
      browserApi.runtime.sendMessage({ type: 'RESOLVE_GOTO_URLS', gotoPaths }, (response: { locations: (string | null)[] }) =>
        resolve(response.locations)
      )
    );
  },
};
