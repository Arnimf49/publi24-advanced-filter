import {utils} from "../../common/utils";
import {WWStorage} from "./storage";

const STORAGE_CLEANUP_LIMIT_PERCENT = 80;
const STORAGE_CLEANUP_RETENTION_MONTHS = [12, 6, 3, 1];

const isStorageOverCleanupLimit = (): boolean => {
  try {
    const storageUsagePercent = utils.getStorageUsagePercent();
    return storageUsagePercent !== null && storageUsagePercent > STORAGE_CLEANUP_LIMIT_PERCENT;
  } catch (error) {
    console.error('Failed to check storage usage:', error);
    return false;
  }
};

export const storageCleanup = {
  async shouldRun(): Promise<boolean> {
    if (localStorage.getItem('_pw_init') === 'true') {
      return true;
    }

    if (Math.random() < 0.00001) {
      return true;
    }

    return isStorageOverCleanupLimit();
  },

  async run(): Promise<void> {
    for (const retentionMonths of STORAGE_CLEANUP_RETENTION_MONTHS) {
      await WWStorage.cleanupStale(retentionMonths);

      if (!isStorageOverCleanupLimit()) {
        return;
      }
    }
  },
};
