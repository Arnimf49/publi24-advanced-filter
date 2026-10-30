import {NimfomaneStorage} from "./storage";
import {userId} from "../../common/userId";
import {permissions} from "../../common/permissions";
import {supabaseClient} from "../../common/supabase/supabaseClient";
import {browserApi} from "../../common/globals";
import {utils} from "../../common/utils";

interface MonthCount {
  [month: string]: number;
}

interface AnalyticsData {
  id: string;
  favs_count: number;
  hidden_count: number;
  info_analyze_count: number;
  info_analyze_monthly: MonthCount;
  settings_enabled: {
    focusMode: boolean;
    darkMode: boolean;
  };
  user_agent: string;
  storage_size: number | null;
  is_incognito: boolean | null;
}

function detectIncognito(): boolean | null {
  try {
    return browserApi.extension.inIncognitoContext ?? null;
  } catch {
    return null;
  }
}

function getMonthKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getLast6Months(): string[] {
  const months: string[] = [];
  const now = new Date();

  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(getMonthKey(date.getTime()));
  }

  return months;
}

function collectAnalyticsData(): AnalyticsData {
  const infoAnalyzeMonthly: MonthCount = {};
  const last6Months = getLast6Months();
  let hiddenCount = 0;
  let infoAnalyzeCount = 0;

  last6Months.forEach(month => {
    infoAnalyzeMonthly[month] = 0;
  });

  const allItems = NimfomaneStorage.exportData();

  Object.entries(allItems).forEach(([key, value]) => {
    const topicMatch = key.match(/^p24fa:nimfo:topic:(.+)$/);
    if (topicMatch) {
      try {
        const topicData = JSON.parse(value);

        // Escort topics keep their hidden state on the escort record, so only
        // count topics that are not associated with an escort.
        const isAssociatedWithEscort = topicData.isOfEscort === true || !!topicData.ownerUser;
        if (topicData.hidden === true && !isAssociatedWithEscort) {
          hiddenCount++;
        }
      } catch (e) {
        console.error('Error parsing topic data for analytics:', e);
      }
    }

    const escortMatch = key.match(/^p24fa:nimfo:escort:(.+)$/);
    if (escortMatch) {
      try {
        const escortData = JSON.parse(value);

        if (escortData.hidden === true) {
          hiddenCount++;
        }

        if (escortData.escortDetailsTime) {
          infoAnalyzeCount++;

          const month = getMonthKey(escortData.escortDetailsTime);
          if (infoAnalyzeMonthly.hasOwnProperty(month)) {
            infoAnalyzeMonthly[month]++;
          }
        }
      } catch (e) {
        console.error('Error parsing escort data for analytics:', e);
      }
    }
  });

  return {
    id: userId.get()!,
    favs_count: NimfomaneStorage.getFavorites().length,
    hidden_count: hiddenCount,
    info_analyze_count: infoAnalyzeCount,
    info_analyze_monthly: infoAnalyzeMonthly,
    settings_enabled: {
      focusMode: NimfomaneStorage.isFocusMode(),
      darkMode: NimfomaneStorage.isDarkMode(),
    },
    user_agent: navigator.userAgent,
    storage_size: utils.getStorageSizeKb(),
    is_incognito: detectIncognito(),
  };
}

async function acquirePermission(): Promise<boolean> {
  const permissionsData = await permissions.getDataCollectionPermissions();
  if (permissionsData.data_collection === undefined) {
    // Data collection not available on Chrome.
    return true;
  }
  if (!permissionsData.data_collection.includes('technicalAndInteraction')) {
    console.warn('User does not consent to analytics.', permissionsData);
    return false;
  }
  return true;
}

export const analytics = {
  async sendEvent(): Promise<void> {
    if (localStorage.getItem('_pw_init') === 'true') {
      return;
    }

    if (!userId.get()) {
      console.log('Analytics user ID not set, skipping');
      return;
    }

    if (!await acquirePermission()) {
      return;
    }

    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const { lastChecked } = NimfomaneStorage.getAnalytics();

    if (lastChecked && lastChecked > oneDayAgo) {
      console.log('Analytics already sent today, skipping');
      return;
    }

    const analyticsData = collectAnalyticsData();

    try {
      const response = await supabaseClient.request('/rest/v1/analytics_nimfomane', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
          id: analyticsData.id,
          favs_count: analyticsData.favs_count,
          hidden_count: analyticsData.hidden_count,
          info_analyze_count: analyticsData.info_analyze_count,
          info_analyze_monthly: analyticsData.info_analyze_monthly,
          settings_enabled: analyticsData.settings_enabled,
          user_agent: analyticsData.user_agent,
          storage_size: analyticsData.storage_size,
          is_incognito: analyticsData.is_incognito,
          updated_at: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        console.log('Analytics event sent successfully');
      } else {
        console.error('Failed to send analytics event:', response.status);
      }
    } catch (error) {
      console.error('Error sending analytics event:', error);
    } finally {
      NimfomaneStorage.setAnalytics({ lastChecked: now });
    }
  },
};
