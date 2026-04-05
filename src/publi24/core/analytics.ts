import {WWStorage} from "./storage";
import {userId} from "../../common/userId";
import {permissions} from "../../common/permissions";
import {supabaseClient} from "../../common/supabase/supabaseClient";

// @ts-ignore
if (typeof browser === "undefined" && typeof chrome !== "undefined") {
  // @ts-ignore
  var browser = chrome;
}

interface MonthCount {
  [month: string]: number;
}

interface AnalyticsData {
  id: string;
  phone_search_count: number;
  image_search_count: number;
  phone_search_monthly: MonthCount;
  image_search_monthly: MonthCount;
  favs_count: number;
  hidden_count: number;
  settings_enabled: {
    focusMode: boolean;
    adDeduplication: boolean;
    autoHide: boolean;
    nextOnlyVisible: boolean;
    defaultManualHideReason: boolean;
    whatsappMessage: boolean;
    manualPhoneSearch: boolean;
    manualImageSearch: boolean;
  };
  user_agent: string;
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
  const phoneSearchMonthly: MonthCount = {};
  const imageSearchMonthly: MonthCount = {};
  const last6Months = getLast6Months();
  let hiddenCount = 0;

  last6Months.forEach(month => {
    phoneSearchMonthly[month] = 0;
    imageSearchMonthly[month] = 0;
  });

  const allItems = WWStorage.exportData();

  Object.entries(allItems).forEach(([key, value]) => {
    const adMatch = key.match(/^ww2:([A-F0-9-]+)$/);
    if (adMatch) {
      try {
        const adData = JSON.parse(value);

        if (adData.phoneTime) {
          const month = getMonthKey(adData.phoneTime);
          if (phoneSearchMonthly.hasOwnProperty(month)) {
            phoneSearchMonthly[month]++;
          }
        }

        if (adData.imagesTime) {
          const month = getMonthKey(adData.imagesTime);
          if (imageSearchMonthly.hasOwnProperty(month)) {
            imageSearchMonthly[month]++;
          }
        }

        if (adData.visibility === 0 || adData.visibility === false) {
          hiddenCount++;
        }
      } catch (e) {
        console.error('Error parsing ad data for analytics:', e);
      }
    }

    const phoneMatch = key.match(/^ww2:phone:(.+)$/);
    if (phoneMatch) {
      try {
        const phoneData = JSON.parse(value);
        if (phoneData.hidden === 1 || phoneData.hidden === true) {
          hiddenCount++;
        }
      } catch (e) {
        // Skip invalid data
      }
    }
  });

  const favsCount = WWStorage.getFavorites().length;

  const settingsEnabled = {
    focusMode: WWStorage.isFocusMode(),
    adDeduplication: WWStorage.isAdDeduplicationEnabled(),
    autoHide: WWStorage.isAutoHideEnabled(),
    nextOnlyVisible: WWStorage.isNextOnlyVisibleEnabled(),
    defaultManualHideReason: WWStorage.isDefaultManualHideReasonEnabled(),
    whatsappMessage: WWStorage.isWhatsappMessageEnabled(),
    manualPhoneSearch: WWStorage.isManualPhoneSearchEnabled(),
    manualImageSearch: WWStorage.isManualImageSearchEnabled(),
  };

  return {
    id: userId.get()!,
    phone_search_count: WWStorage.getAnalytics().phoneSearchCount,
    image_search_count: WWStorage.getAnalytics().imageSearchCount,
    phone_search_monthly: phoneSearchMonthly,
    image_search_monthly: imageSearchMonthly,
    favs_count: favsCount,
    hidden_count: hiddenCount,
    settings_enabled: settingsEnabled,
    user_agent: navigator.userAgent,
  };
}

async function acquirePermission() {
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

export async function sendAnalyticsEvent(): Promise<void> {
  if (!userId.get()) {
    console.log('Analytics user ID not set, skipping');
    return;
  }

  if (!await acquirePermission()) {
    return;
  }

  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  const { lastChecked } = WWStorage.getAnalytics();

  if (lastChecked && lastChecked > oneDayAgo) {
    console.log('Analytics already sent today, skipping');
    return;
  }

  const analyticsData = collectAnalyticsData();

  try {
    const response = await supabaseClient.request('/rest/v1/analytics_v2', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({
        id: analyticsData.id,
        phone_search_count: analyticsData.phone_search_count,
        image_search_count: analyticsData.image_search_count,
        phone_search_monthly: analyticsData.phone_search_monthly,
        image_search_monthly: analyticsData.image_search_monthly,
        favs_count: analyticsData.favs_count,
        hidden_count: analyticsData.hidden_count,
        settings_enabled: analyticsData.settings_enabled,
        user_agent: analyticsData.user_agent,
        updated_at: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      console.log('Analytics event sent successfully');
      WWStorage.setAnalytics({ ...WWStorage.getAnalytics(), lastChecked: now });
    } else {
      console.error('Failed to send analytics event:', response.status);
      WWStorage.setAnalytics({ ...WWStorage.getAnalytics(), lastChecked: now });
    }
  } catch (error) {
    console.error('Error sending analytics event:', error);
    WWStorage.setAnalytics({ ...WWStorage.getAnalytics(), lastChecked: now });
  }
}

