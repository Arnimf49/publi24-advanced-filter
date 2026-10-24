import {HostPermissionsResponse, permissions} from "../../common/permissions";

let acquiredState: HostPermissionsResponse | null = null;

function getState(): HostPermissionsResponse {
  return acquiredState ?? {google: true, lens: true, inspectorEscorte: true};
}

async function acquireState(): Promise<HostPermissionsResponse> {
  try {
    acquiredState = await permissions.getHostPermissions();
  } catch (error) {
    console.error('Failed to acquire host permissions:', error);
  }

  return getState();
}

export const hostPermissions = {
  origins: {
    google: 'https://www.google.com/*',
    lens: 'https://lens.google.com/*',
    inspectorEscorte: 'https://api.inspector-escorte.com/*',
  },
  acquire: acquireState,
  get: getState,
};
