const GOOGLE_ORIGIN = 'https://www.google.com';

export const google = {
  isDomain(url: string | null): boolean {
    if (!url) {
      return false;
    }

    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return hostname === 'google.com'
        || hostname.endsWith('.google.com')
        || /(^|\.)google\.[a-z]+(\.[a-z]+)*$/.test(hostname);
    } catch (error) {
      console.error(`Error parsing possible Google URL "${url}":`, error);
      return false;
    }
  },

  isRedirectPath(path: string): boolean {
    try {
      const pathname = new URL(path, GOOGLE_ORIGIN).pathname;
      return pathname === '/goto' || pathname === '/url';
    } catch (error) {
      console.error(`Error parsing possible Google redirect URL "${path}":`, error);
      return false;
    }
  },

  toAbsoluteUrl(path: string): string {
    return new URL(path, GOOGLE_ORIGIN).href;
  },
};
