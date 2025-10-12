export const utils = {
  debugLog(message: string | number, data?: any) {
    if (process.env.WATCH_MODE) {
      console.log(`[WW-DEBUG] ${message}`, data || '');
    }
  },
  mostRepeated<T>(arr: T[], transformer: ((v: T) => string) = ((v) => v + '')): T {
    const counts = arr.reduce((acc, val) => {
      acc[transformer(val)] = acc[transformer(val)] ? {
        count: acc[transformer(val)].count + 1,
        item: val,
      } : {
        count: 1,
        item: val,
      };
      return acc;
    }, {} as Record<string, {count: number, item: T}>);

    let maxValue = arr[0];
    let maxCount: number = 0;

    for (const [_, item] of Object.entries(counts)) {
      if (item.count > maxCount) {
        maxCount = item.count;
        maxValue = item.item;
      }
    }

    return maxValue;
  },

  getScrollParent(node: Node | null, checkHeight: boolean = true): HTMLElement | Window {
    if (node == null) {
      return window;
    }

    if (node === document.body || node === document.documentElement) {
      return window;
    }

    if (node instanceof Element && (node.scrollHeight > node.clientHeight || !checkHeight)) {
      const style = window.getComputedStyle(node);
      if (style.overflowY === 'scroll' || style.overflowY === 'auto') {
        return node as HTMLElement;
      }
    }

    return utils.getScrollParent(node.parentNode, checkHeight);
  },

  normalizeDigits(str: string): string {
    // Handle emoji keycap digits
    str = str.replace(/(\d)\uFE0F\u20E3/g, '$1');

    // Handle bold math digits 𝟎-𝟗
    const boldDigits = "𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗";
    str = str.replace(/[\u{1D7CE}-\u{1D7D7}]/gu, (char) => {
      const index = boldDigits.indexOf(char);
      return index !== -1 ? String(index) : char;
    });

    return str;
  },

  parseRomanianDate(input: string) {
    const now = new Date();
    const months: Record<string, number> = {
      ianuarie: 0, februarie: 1, martie: 2, aprilie: 3,
      mai: 4, iunie: 5, iulie: 6, august: 7,
      septembrie: 8, octombrie: 9, noiembrie: 10, decembrie: 11
    };

    const lower = input.toLowerCase().trim();

    if (lower.startsWith('azi')) {
      const [, time] = lower.split(' ');
      const [h, m] = time.split(':').map(Number);
      const date = new Date(now);
      date.setHours(h, m, 0, 0);
      return date;
    }

    if (lower.startsWith('ieri')) {
      const [, time] = lower.split(' ');
      const [h, m] = time.split(':').map(Number);
      const date = new Date(now);
      date.setDate(date.getDate() - 1);
      date.setHours(h, m, 0, 0);
      return date;
    }

    const match = lower.match(/^([a-zăîâșț]+)\s+(\d{1,2})$/);
    if (match) {
      const [, monthStr, dayStr] = match;
      if (!monthStr || !months[monthStr]) {
        return null;
      }
      const month = months[monthStr] as number;
      const day = parseInt(dayStr, 10);
      if (month !== undefined) {
        return new Date(now.getFullYear(), month, day);
      }
    }

    return null;
  },

  countryCodeToFlagEmoji(countryCode: string) {
    const codePoints = [...countryCode.toUpperCase()].map(
      char => 0x1F1E6 + char.charCodeAt(0) - 65
    );
    return String.fromCodePoint(...codePoints);
  }
}
