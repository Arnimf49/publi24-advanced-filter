const isOlderThanMonths = (dateString: string, months: number): boolean => {
  const targetDate = new Date(dateString);
  const ageMs = Date.now() - targetDate.getTime();
  const monthMs = 30 * 24 * 60 * 60 * 1000;

  return !Number.isNaN(targetDate.getTime()) && ageMs > months * monthMs;
};

export const dateLib = {
  getRelativeTime(dateString: string): string {
    const targetDate = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - targetDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'acum';
    } else if (diffMinutes === 1) {
      return 'de 1 minut';
    } else if (diffMinutes < 60) {
      return `de ${diffMinutes} minute`;
    } else if (diffHours === 1) {
      return 'de 1 oră';
    } else if (diffHours < 24) {
      return `de ${diffHours} ore`;
    } else if (diffDays === 1) {
      return 'de 1 zi';
    } else if (diffDays <= 60) {
      return `de ${diffDays} zile`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);

      if (diffMonths < 12) {
        return diffMonths === 1 ? 'de 1 lună' : `de ${diffMonths} luni`;
      }

      const years = diffMonths / 12;
      const formattedYears = Number.isInteger(years) ? `${years}` : years.toFixed(1);
      return years === 1 ? 'de 1 an' : `de ${formattedYears} ani`;
    }
  },
  isOlderThanMonths,
};
