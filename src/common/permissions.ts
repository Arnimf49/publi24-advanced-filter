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

  async requestDataCollectionPermissions(): Promise<boolean> {
    const current = await this.getDataCollectionPermissions();

    if (current.data_collection === undefined) {
      return false;
    }

    return new Promise((resolve) => {
      // @ts-ignore
      browserApi.runtime.sendMessage(
        { type: 'REQUEST_PERMISSIONS' },
        (response: { granted: boolean }) => {
          if (browserApi.runtime.lastError) {
            console.error('Error requesting permissions:', browserApi.runtime.lastError);
            resolve(false);
          } else {
            resolve(response.granted);
          }
        }
      );
    });
  },
};
