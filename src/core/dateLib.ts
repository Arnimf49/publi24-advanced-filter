export const dateLib = {
  dayDiff(date: Date, compareDate?: Date): number {
    const compareTime = (compareDate || new Date()).getTime();
    const dateTime = date.getTime();
    return Math.floor((compareTime - dateTime) / 8.64e+7);
  },

  diffDaysToDisplay(diffDays: number, date: Date): string {
    if (diffDays >= 2) {
      return `de ${diffDays} zile`;
    }

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let prefix: string = 'alaltăieri';

    if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
      prefix = 'azi';
    } else if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear()) {
      prefix = 'ieri';
    }

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes.toString();

    return `${prefix} la ${hours}:${formattedMinutes}`;
  },

  calculateTimeSince(time?: number): { daysString?: string; stale?: boolean } {
    if (!time) return {};
    const now = Date.now();
    const days = Math.floor((now - time) / 8.64e+7);
    const daysString = days === 0 ? 'recent' : days === 1 ? `de o zi` : `de ${days} zile`;
    const stale = days > 15;
    return { daysString, stale };
  }
};
