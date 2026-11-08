type VersionEntry = {
  version: string;
};

/**
 * Returns the entries that are newer than the last seen version.
 * History is ordered newest first, so everything before the seen entry is new.
 * When the seen version is not part of the history anymore, we assume it is
 * older than every entry and treat the whole history as unread.
 */
const getNewVersions = <T extends VersionEntry>(versionHistory: T[], seenVersion: string | null): T[] => {
  if (!seenVersion) {
    return [];
  }

  const seenIndex = versionHistory.findIndex(entry => entry.version === seenVersion);

  if (seenIndex === -1) {
    return versionHistory;
  }

  return versionHistory.slice(0, seenIndex);
};

export const versionUtils = {
  getNewVersions,
};
