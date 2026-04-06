const CITY_TO_LINKS: Record<string, string[]> = {
  'București': [
    'https://nimfomane.com/forum/forum/49-escorte-testate-bucuresti/',
    'https://nimfomane.com/forum/forum/5-top-escorte-bucuresti/',
    'https://nimfomane.com/forum/forum/362-escorte-de-lux-bucuresti/',
    'https://nimfomane.com/forum/forum/127-masaj-erotic/',
  ],
  'Constanța': [
    'https://nimfomane.com/forum/forum/15-escorte-din-constanta/',
    'https://nimfomane.com/forum/forum/157-masaj-erotic-constanta/',
    'https://nimfomane.com/forum/forum/303-top-escorte-constanta/',
  ],
  'Timișoara': [
    'https://nimfomane.com/forum/forum/21-escorte-timisoara/',
    'https://nimfomane.com/forum/forum/135-masaj-erotic-timisoara/',
    'https://nimfomane.com/forum/forum/217-top-escorte-tm/',
  ],
  'Cluj': [
    'https://nimfomane.com/forum/forum/35-escorte-din-cluj/',
    'https://nimfomane.com/forum/forum/137-masaj-erotic-cluj-napoca/',
  ],
  'Oradea': [
    'https://nimfomane.com/forum/forum/19-escorte-oradea/',
    'https://nimfomane.com/forum/forum/145-masaj-erotic-oradea/',
  ],
  'Ploiești': [
    'https://nimfomane.com/forum/forum/14-escorte-ploiesti/',
    'https://nimfomane.com/forum/forum/140-masaj-erotic-ploiesti/',
  ],
  'Brașov': [
    'https://nimfomane.com/forum/forum/17-escorte-brasov-si-imprejurimi/',
    'https://nimfomane.com/forum/forum/136-masaj-erotic-brasov/',
  ],
  'Craiova': [
    'https://nimfomane.com/forum/forum/12-escorte-craiova/',
    'https://nimfomane.com/forum/forum/133-masaj-erotic-craiova/',
  ],
  'Iași': [
    'https://nimfomane.com/forum/forum/11-escorte-iasi/',
    'https://nimfomane.com/forum/forum/134-masaj-erotic-iasi/',
  ],
  'Pitești': [
    'https://nimfomane.com/forum/forum/27-escorte-pitesti/',
    'https://nimfomane.com/forum/forum/143-masaj-erotic-pitesti/',
  ],
  'Sibiu': [
    'https://nimfomane.com/forum/forum/20-escorte-sibiu/',
    'https://nimfomane.com/forum/forum/146-masaj-erotic-sibiu/',
  ],
  'Mureș': [
    'https://nimfomane.com/forum/forum/36-escorte-mures/',
    'https://nimfomane.com/forum/forum/158-masaj-erotic-mures/',
  ],
  'Arad': [
    'https://nimfomane.com/forum/forum/18-escorte-arad/',
    'https://nimfomane.com/forum/forum/144-masaj-erotic-arad/',
  ],
  'Hunedoara': [
    'https://nimfomane.com/forum/forum/25-escorte-din-hunedoara-deva-si-imprejurimi/',
  ],
  'Bacău': [
    'https://nimfomane.com/forum/forum/28-escorte-din-bacau/',
    'https://nimfomane.com/forum/forum/138-masaj-erotic-bacau/',
  ],
  'Galați': [
    'https://nimfomane.com/forum/forum/10-escorte-galati/',
    'https://nimfomane.com/forum/forum/132-masaj-erotic-galati/',
  ],
  'Baia Mare': [
    'https://nimfomane.com/forum/forum/30-escorte-baia-mare/',
    'https://nimfomane.com/forum/forum/152-masaj-erotic-baia-mare/',
  ],
  'Buzău': ['https://nimfomane.com/forum/forum/47-escorte-buzau/'],
  'Suceava': ['https://nimfomane.com/forum/forum/16-escorte-suceava/'],
  'Târgoviște': ['https://nimfomane.com/forum/forum/39-escorte-targoviste/'],
  'Focșani': ['https://nimfomane.com/forum/forum/13-escorte-focsani/'],
  'Brăila': ['https://nimfomane.com/forum/forum/22-escorte-braila/'],
  'Râmnicu Vâlcea': ['https://nimfomane.com/forum/forum/37-escorte-ramnicu-valcea/'],
  'Alba': ['https://nimfomane.com/forum/forum/90-escorte-alba/'],
  'Târgu Jiu': ['https://nimfomane.com/forum/forum/29-escorte-targu-jiu/'],
  'Bistrița': ['https://nimfomane.com/forum/forum/34-escorte-bistrita/'],
  'Satu Mare': ['https://nimfomane.com/forum/forum/33-escorte-satu-mare/'],
  'Mehedinți': ['https://nimfomane.com/forum/forum/89-escorte-mehedinti/'],
  'Slatina': ['https://nimfomane.com/forum/forum/23-escorte-slatina/'],
  'Tulcea': ['https://nimfomane.com/forum/forum/38-escorte-tulcea/'],
  'Piatra Neamț': ['https://nimfomane.com/forum/forum/31-escorte-piatra-neamt/'],
  'Botoșani': ['https://nimfomane.com/forum/forum/46-escorte-botosani/'],
  'Caraș-Severin': ['https://nimfomane.com/forum/forum/91-escorte-caras-severin/'],
  'Sălaj': ['https://nimfomane.com/forum/forum/42-escorte-salaj/'],
  'Lugoj': ['https://nimfomane.com/forum/forum/416-escorte-lugoj/'],
  'Turda': ['https://nimfomane.com/forum/forum/417-escorte-turda/'],
  'Alte orașe': ['https://nimfomane.com/forum/forum/9-escorte-din-alte-orase/'],
  'Vaslui': ['https://nimfomane.com/forum/forum/41-escorte-vaslui/'],
  'Teleorman': ['https://nimfomane.com/forum/forum/32-escorte-teleorman/'],
  'Petroșani': ['https://nimfomane.com/forum/forum/24-escorte-petrosani/'],
  'Ialomița': ['https://nimfomane.com/forum/forum/229-escorte-ialomita/'],
  'Giurgiu': ['https://nimfomane.com/forum/forum/26-escorte-giurgiu/'],
  'Miercurea Ciuc': ['https://nimfomane.com/forum/forum/111-escorte-miercurea-ciuc/'],
  'Călărași': ['https://nimfomane.com/forum/forum/40-escorte-calarasi/'],
  'Covasna': ['https://nimfomane.com/forum/forum/43-escorte-covasna/'],
};

const LINK_TO_CITY: Record<string, string> = {};
for (const [city, links] of Object.entries(CITY_TO_LINKS)) {
  for (const link of links) {
    LINK_TO_CITY[link] = city;
  }
}

export const cityService = {
  getCityFromForumUrl(url: string): string | null {
    const normalized = url.replace(/\/page\/\d+\/?$/, '/').replace(/([^/])$/, '$1/');
    return LINK_TO_CITY[normalized] || null;
  },

  getCurrentCity(): string | null {
    const urlCity = this.getCityFromForumUrl(window.location.href);
    if (urlCity) return urlCity;

    const breadcrumbLink = document.querySelector<HTMLAnchorElement>('[data-role="breadcrumbList"] li:nth-child(3) a');
    if (breadcrumbLink?.href) {
      return this.getCityFromForumUrl(breadcrumbLink.href);
    }

    return null;
  }
};
