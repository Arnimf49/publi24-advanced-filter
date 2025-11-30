import {WWStorage} from "./storage";
import {utils} from "../../common/utils";
import escortListingDomainsData from '../../../escort-listing-domains.json';

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
  'anunt.online',
  'escort-romania.com',
  'letgosex.com',
  'sexy-escorte.com',
  'escortero.net',
  'escorteromania.info',
  'escorterecomandate.com',
];

const PRIO_DOMAINS: string[] = [
  'publi24.ro',
  'www.publi24.ro',
  'nimfomane.com',
  'ddcforum.com',
];

const ESCORT_LISTING_SITE_DOMAINS: Record<string, string[]> = escortListingDomainsData;

interface ProcessedLink {
  link: string;
  isDead: boolean;
  isSafe: boolean;
  isSuspicious: boolean;
}

interface DomainInfo {
  links: ProcessedLink[];
  isSafe: boolean;
  isEscortListing: boolean;
  flag: string | null;
}

interface ImageLinkDomainGroup {
  domain: string;
  links: ProcessedLink[];
  isSafe: boolean;
  isEscortListing: boolean;
  flag: string | null;
}

function getFlagForDomain(domain: string): string | null {
  for (const [cc, domains] of Object.entries(ESCORT_LISTING_SITE_DOMAINS)) {
    if (domains.some(d => domain.endsWith(d))) {
      if (cc === 'general') {
        return '🌐';
      }
      return utils.countryCodeToFlagEmoji(cc);
    }
  }
  return null;
}

export const linksFilter = {
  filterLinks(links: string[], itemUrl: string): string[] {
    return links.filter((l: string) => !BLACKLISTED_LINKS.some((b: string) => l.indexOf(b) === 0) && itemUrl !== l);
  },

  getImageResultsStatus(imageSearchDomains: ImageLinkDomainGroup[] | undefined, isStale?: boolean): 'green' | 'yellow' | 'red' | null {
    if (imageSearchDomains === undefined) {
      return null;
    }

    if (imageSearchDomains.length === 0) {
      return isStale ? 'yellow' : 'green';
    }

    let countryEscortSources = 0;
    let hasRedLinks = false;
    let hasYellowLinks = false;

    imageSearchDomains.forEach(domainData => {
      if (domainData.isEscortListing) {
        countryEscortSources++;
      }

      domainData.links.forEach(linkData => {
        if (!linkData.isSafe && !linkData.isSuspicious && !linkData.isDead) {
          hasRedLinks = true;
        }
        if (linkData.isSuspicious && !linkData.isDead) {
          hasYellowLinks = true;
        }
      });
    });

    if (hasRedLinks || countryEscortSources > 3) {
      return 'red';
    }

    if (hasYellowLinks || isStale) {
      return 'yellow';
    }

    return 'green';
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
          link.replace(/.+\/([^.\/]+)\.html.*/, '$1') !== itemUrl.replace(/.+\/([^.\/]+)\.html.*/, '$1');
      })
      .forEach((link: string) => {
        try {
          const urlObj = new URL(link);
          const originalDomain = urlObj.hostname.replace(/^www\./, '');

          const isSafeLastDomain = SAFE_LAST_DOMAIN_PARTS.some(part =>
            originalDomain.endsWith(part)
          );

          let isDomainSafe = false;
          let isDomainSuspicious = false;
          let isEscortListing = false;
          let flag = null;
          let displayDomain = originalDomain;

          if (isSafeLastDomain) {
            isDomainSafe = !duplicatesInOtherLoc.includes(link);
            isDomainSuspicious = duplicatesNotOldInOtherLoc.includes(link);
            flag = '🇷🇴';
            displayDomain = `🇷🇴  ${originalDomain}`;
          } else {
            const externalEscortListingFlag = getFlagForDomain(originalDomain);
            if (externalEscortListingFlag) {
              isDomainSafe = false;
              isDomainSuspicious = true;
              isEscortListing = true;
              flag = externalEscortListingFlag;
              displayDomain = `${externalEscortListingFlag} ${originalDomain}`;
            }
          }

          const linkObj: ProcessedLink = {
            link,
            isDead: deadLinks.includes(link),
            isSafe: isDomainSafe,
            isSuspicious: isDomainSuspicious,
          };

          if (!domainMap[displayDomain]) {
            domainMap[displayDomain] = {
              links: [linkObj],
              isSafe: isSafeLastDomain,
              isEscortListing,
              flag
            };
          } else {
            function getPriority(link: ProcessedLink) {
              if (link.isDead) return 4;
              if (!link.isSafe && link.isSuspicious) return 2;
              if (!link.isSafe) return 1;
              if (link.isSuspicious) return 3;
              return 4;
            }
            const newPriority = getPriority(linkObj);
            const insertIndex = domainMap[displayDomain].links.findIndex(existing => {
              const existingPriority = getPriority(existing);
              return newPriority < existingPriority;
            });

            if (insertIndex === -1) {
              domainMap[displayDomain].links.push(linkObj);
            } else {
              domainMap[displayDomain].links.splice(insertIndex, 0, linkObj);
            }
          }
        } catch (error: any) {
          console.error(`Error processing link "${link}":`, error.message);
        }
      });

    return Object.entries(domainMap)
      .map(([domain, {links: domainLinks, isSafe, isEscortListing, flag}]: [string, DomainInfo]): ImageLinkDomainGroup => ({
        domain,
        links: domainLinks,
        isSafe,
        isEscortListing,
        flag
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
