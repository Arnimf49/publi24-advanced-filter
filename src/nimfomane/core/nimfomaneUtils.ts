export const nimfomaneUtils = {
  normalizeCmsUrl(str: string) {
    return str.replace(/\\([()])/g, '$1');
  }
}
