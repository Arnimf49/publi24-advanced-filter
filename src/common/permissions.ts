import {browserApi} from "./globals";

interface PermissionsResponse {
  data_collection: string[] | undefined;
}

export const permissions = {
  async getDataCollectionPermissions(): Promise<PermissionsResponse> {
    return new Promise((resolve) => {
      // @ts-ignore
      browserApi.runtime.sendMessage(
        { type: 'GET_PERMISSIONS' },
        (response: PermissionsResponse) => {
          if (browserApi.runtime.lastError) {
            console.error('Error getting permissions:', browserApi.runtime.lastError);
            resolve({
              data_collection: undefined,
            });
          } else {
            resolve(response);
          }
        }
      );
    });
  },
};
