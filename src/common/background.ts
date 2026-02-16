import {browserApi} from "./globals";

interface PermissionsResponse {
  data_collection: string[] | undefined;
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

  if (message.type === 'REQUEST_PERMISSIONS') {
    browserApi.permissions.request({
      // @ts-ignore
      data_collection: ['websiteActivity', 'technicalAndInteraction']
    }).then((granted: boolean) => {
      sendResponse({ granted });
    }).catch((error: any) => {
      console.error('Error requesting permissions:', error);
      sendResponse({ granted: false });
    });

    return true;
  }

  return false;
});
