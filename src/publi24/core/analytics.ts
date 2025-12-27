import {WWStorage} from "./storage";

// @ts-ignore
if (typeof browser === "undefined" && typeof chrome !== "undefined") {
  // @ts-ignore
  var browser = chrome;
}

const SBU_B64 = 'aHR0cHM6Ly9vcWp0eGxiY3R4bnJkZ2pudmdicC5zdXBhYmFzZS5jbw==';
const SBK_B64 = 'c2JfcHVibGlzaGFibGVfX2NtdTdNSzhlcHl5MWJXa1N3TzBFZ193Wl9PaWJaMg==';



function hasMonthOldData(): boolean {
  const now = Date.now();
  const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);

  const allTimestamps: number[] = [];

  const allItems = WWStorage.exportData();
  Object.entries(allItems).forEach(([key, value]) => {
    const adMatch = key.match(/^ww2:([A-F0-9-]+)$/);
    if (adMatch) {
      try {
        const adData = JSON.parse(value);
        if (adData.phoneTime) allTimestamps.push(adData.phoneTime);
        if (adData.imagesTime) allTimestamps.push(adData.imagesTime);
      } catch (e) {
        // Skip invalid data
      }
    }
  });

  return allTimestamps.some(timestamp => timestamp <= oneMonthAgo);
}

interface MonthCount {
  [month: string]: number;
}

interface AnalyticsData {
  phone_search_count: MonthCount;
  image_search_count: MonthCount;
  favs_count: number;
  settings_enabled: {
    focusMode: boolean;
    adDeduplication: boolean;
    autoHide: boolean;
    nextOnlyVisible: boolean;
    defaultManualHideReason: boolean;
    whatsappMessage: boolean;
  };
  os: string;
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
  const phoneSearchCount: MonthCount = {};
  const imageSearchCount: MonthCount = {};
  const last6Months = getLast6Months();

  last6Months.forEach(month => {
    phoneSearchCount[month] = 0;
    imageSearchCount[month] = 0;
  });

  const allItems = WWStorage.exportData();

  Object.entries(allItems).forEach(([key, value]) => {
    const adMatch = key.match(/^ww2:([A-F0-9-]+)$/);
    if (adMatch) {
      try {
        const adData = JSON.parse(value);

        if (adData.phoneTime) {
          const month = getMonthKey(adData.phoneTime);
          if (phoneSearchCount.hasOwnProperty(month)) {
            phoneSearchCount[month]++;
          }
        }

        if (adData.imagesTime) {
          const month = getMonthKey(adData.imagesTime);
          if (imageSearchCount.hasOwnProperty(month)) {
            imageSearchCount[month]++;
          }
        }
      } catch (e) {
        console.error('Error parsing ad data for analytics:', e);
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
  };

  const userAgent = navigator.userAgent;
  const os = getOS(userAgent);

  return {
    phone_search_count: phoneSearchCount,
    image_search_count: imageSearchCount,
    favs_count: favsCount,
    settings_enabled: settingsEnabled,
    os,
    user_agent: userAgent,
  };
}

function getOS(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS X') || userAgent.includes('Macintosh')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  return 'Unknown';
}

export async function sendAnalyticsEvent(): Promise<void> {
  const sentVersion = WWStorage.getAnalyticsSentVersion();

  if (sentVersion === 1) {
    console.log('Analytics event already sent, skipping');
    return;
  }

  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  const lastChecked = WWStorage.getAnalyticsLastChecked();

  if (lastChecked && lastChecked > oneDayAgo) {
    console.log('Analytics already checked today, skipping');
    return;
  }

  if (!hasMonthOldData()) {
    console.log('No month-old data yet, updating check time');
    WWStorage.setAnalyticsLastChecked(now);
    return;
  }

  const analyticsData = collectAnalyticsData();

  try {
    const response = await fetch(`${atob(SBU_B64)}/rest/v1/analytics_v1`, {
      method: 'POST',
      headers: {
        'apikey': atob(SBK_B64),
        'Authorization': `Bearer ${atob(SBK_B64)}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        phone_search_count: analyticsData.phone_search_count,
        image_search_count: analyticsData.image_search_count,
        favs_count: analyticsData.favs_count,
        settings_enabled: analyticsData.settings_enabled,
        os: analyticsData.os,
        user_agent: analyticsData.user_agent,
      }),
    });

    if (response.ok) {
      console.log('Analytics event sent successfully');
      WWStorage.setAnalyticsSentVersion(1);
      WWStorage.setAnalyticsLastChecked(now);
    } else {
      console.error('Failed to send analytics event:', response.status);
      WWStorage.setAnalyticsLastChecked(now);
    }
  } catch (error) {
    console.error('Error sending analytics event:', error);
    WWStorage.setAnalyticsLastChecked(now);
  }
}
