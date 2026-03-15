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
    } else if (diffDays < 30) {
      return `de ${diffDays} zile`;
    } else {
      return dateString;
    }
  }
};
