export const nimfomaneUtils = {
  normalizeCmsUrl(str: string) {
    return str.replace(/\\([()])/g, '$1');
  },

  imageFullSize(url: string) {
    return url.replace(/_thumb(\.[^.]+)$/, '$1');
  }
}
