import {WWStorage} from "./storage";

const BLACKLISTED_LINKS: string[] = [
  'https://meiwakucheck.com/',
  'https://www.jpnumber.com/',
  'https://telefonforsaljare.nu/',
  'https://www.180.se/',
  'https://www.180.dk/',
  'https://www.eniro.se/',
  'https://z1kk2ror.canina101.es/',
  'https://www.telefonforsaljare.nu/',
  'https://denwam.com/',
  'https://cinetesuna.ro/',
  'https://www.france-inverse.com/',
  'http://www.zibadpl.blogfa.com/',
  'https://www.telephoneannuaire.fr/',
  'https://nmqzg.forschungsstelle-ordensgeschichte.de/',
  'https://k6q4ubh5h.echantillon-lipton.fr/',
  'https://4qkhz6bjo.thiasbarber.fr/',
  'https://www.denwam.com/',
  'https://www.leelam.af/',
  'http://kto-zvonil.com.ua/',
  'https://www.hitta.se/',
  'https://chonso.mobifone.vn/',
  'http://chonso.mobifone.vn/',
  'https://denwacho.net/',
  'https://www.telefonforsaljare.nu/',
  'https://sunat.ro/',
  'https://www.telefoncontact.online/',
  'https://www.telefonreclamatii.online/',
  'https://www.contact-telefon.online/',
  'https://mobile.inelenco.com/',
  'https://genealogic.review/',
  'https://www.merinfo.se/',
  'https://telefon-kontakte.ch/',
  'http://www.telefonforsaljare.nu/',
  'https://www.telnavi.jp/',
  'https://www.reverseau.com/',
  'https://www.telguarder.com/',
  'https://information.com/people/',
  'https://health.information.com/reverse-phone-lookup/',
  'https://www.reverseaustralia.com/',
  'https://unmask.com/',
  'https://www.e-aidem.com/',
  'https://phone-book.tw/',
  'https://escorte.lol/',
  'https://haisalut.ro/',
  'https://tel-search.net/',
  'https://www.publi24.ro/cv?jobapplyid=',
];

const SAFE_LAST_DOMAIN_PARTS: string[] = [
  '.ro',
  'nimfomane.com',
  'ddcforum.com',
  'escorte.pro',
  'escortsromania.net',
  'excorte.net',
  'brailaescorte.com',
  'sexyro.com',
  'xlamma.com',
  'escorte-cluj.com',
  'escorte365.com',
  'anunt.online'
];

const PRIO_DOMAINS: string[] = [
  'publi24.ro',
  'www.publi24.ro',
  'nimfomane.com',
  'ddcforum.com',
];

interface ProcessedLink {
  link: string;
  isDead: boolean;
  isSafe: boolean;
  isSuspicious: boolean;
}

interface DomainInfo {
  links: ProcessedLink[];
  isSafe: boolean;
}

interface ImageLinkDomainGroup {
  domain: string;
  links: ProcessedLink[];
  isSafe: boolean;
}

export const linksFilter = {
  filterLinks(links: string[], itemUrl: string): string[] {
    return links.filter((l: string) => !BLACKLISTED_LINKS.some((b: string) => l.indexOf(b) === 0) && itemUrl !== l);
  },

  sortLinks(links: string[]): string[] {
    return links.sort((l1: string, l2: string): number => {
      const d1: number = PRIO_DOMAINS.findIndex((d: string) => l1.includes('//' + d));
      const d2: number = PRIO_DOMAINS.findIndex((d: string) => l2.includes('//' + d));

      if (d1 !== -1 && d2 !== -1) {
        return d1 - d2;
      }
      if (d2 !== -1) {
        return 1;
      }
      if (d1 !== -1) {
        return -1;
      }

      return l1.localeCompare(l2);
    });
  },

  processImageLinks(id: string, links: string[], itemUrl: string): ImageLinkDomainGroup[] {
    const domainMap: { [domain: string]: DomainInfo } = {};
    const duplicatesInOtherLoc: string[] = WWStorage.getAdDuplicatesInOtherLocation(id);
    const duplicatesNotOldInOtherLoc: string[] = WWStorage.getAdNotOldDuplicatesInOtherLocation(id);
    const deadLinks: string[] = WWStorage.getAdDeadLinks(id);

    links
      .filter((link: string): boolean => {
        return !(link.startsWith("https://www.publi24.ro/") && !link.includes("/anunt/")) &&
          link !== itemUrl;
      })
      .forEach((link: string) => {
        try {
          const urlObj = new URL(link);
          const domain: string = urlObj.hostname.replace(/^www\./, '');
          const isDomainSafe: boolean = SAFE_LAST_DOMAIN_PARTS.some((part: string) => domain.endsWith(part));

          const linkObj: ProcessedLink = {
            link,
            isDead: deadLinks.includes(link),
            isSafe: isDomainSafe && !duplicatesInOtherLoc.includes(link),
            isSuspicious: duplicatesNotOldInOtherLoc.includes(link),
          };

          if (!domainMap[domain]) {
            domainMap[domain] = {links: [linkObj], isSafe: isDomainSafe};
          } else {
            domainMap[domain].links.push(linkObj);
          }
        } catch (error: any) {
          console.error(`Error processing link "${link}":`, error.message);
        }
      });

    return Object.entries(domainMap)
      .map(([domain, {links: domainLinks, isSafe}]: [string, DomainInfo]): ImageLinkDomainGroup => ({
        domain,
        links: domainLinks,
        isSafe
      }))
      .sort((groupA: ImageLinkDomainGroup, groupB: ImageLinkDomainGroup): number => {
        const isPrioA = PRIO_DOMAINS.includes(groupA.domain);
        const isPrioB = PRIO_DOMAINS.includes(groupB.domain);

        if (isPrioA && !isPrioB) return -1;
        if (!isPrioA && isPrioB) return 1;
        if (groupA.isSafe && !groupB.isSafe) return -1;
        if (!groupA.isSafe && groupB.isSafe) return 1;
        return groupA.domain.localeCompare(groupB.domain);
      });
  },
};
