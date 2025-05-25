export const utils = {
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
  }
}
