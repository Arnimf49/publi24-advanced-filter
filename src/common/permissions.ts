import {browserApi} from "./globals";

interface PermissionsResponse {
  data_collection: string[] | undefined;
}

export interface HostPermissionsResponse {
  google: boolean;
  lens: boolean;
  inspectorEscorte: boolean;
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

  async getHostPermissions(): Promise<HostPermissionsResponse> {
    return new Promise((resolve) => {
      // @ts-ignore
      browserApi.runtime.sendMessage(
        { type: 'GET_HOST_PERMISSIONS' },
        (response: HostPermissionsResponse) => {
          if (browserApi.runtime.lastError) {
            console.error('Error getting host permissions:', browserApi.runtime.lastError);
            resolve({
              google: true,
              lens: true,
              inspectorEscorte: true,
            });
          } else {
            resolve(response);
          }
        }
      );
    });
  },
};
