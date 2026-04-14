import {WWStorage} from "./storage";
import {utils} from "../../common/utils";
import escortListingDomainsData from '../../../escort-listing-domains.json';
import {dataCompression} from "./dataCompression";

export interface EscortDomainEntry {
  country: string;
  domain: string;
  siteNames: string[];
}

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

const PRIO_DOMAINS: string[] = [
  'publi24.ro',
  'www.publi24.ro',
  'nimfomane.com',
  'ddcforum.com',
];

const escortListingEntries: EscortDomainEntry[] = escortListingDomainsData as unknown as EscortDomainEntry[];
const escortDomainToCountry = new Map<string, string>();
const escortSiteNameToCountry = new Map<string, string>();
const escortSiteNameToDomain = new Map<string, string>();
const escortSiteNameCountries = new Map<string, Set<string>>();

for (const entry of escortListingEntries) {
  escortDomainToCountry.set(entry.domain, entry.country);
  for (const sn of entry.siteNames) {
    const key = sn.toLowerCase();
    escortSiteNameToDomain.set(key, entry.domain);

    if (!escortSiteNameCountries.has(key)) {
      escortSiteNameCountries.set(key, new Set());
    }
    escortSiteNameCountries.get(key)!.add(entry.country);
  }
}

for (const [key, countries] of escortSiteNameCountries) {
  const resolvedCountry = countries.size > 1 ? 'general' : [...countries][0];
  escortSiteNameToCountry.set(key, resolvedCountry);
}

// A raw image result: either an absolute URL string, or a [siteName, gotoPath] tuple
// when the absolute URL could not be determined (Google Lens /goto redirect).
export type ImageResult = string | [string, string];

interface ProcessedLink {
  link: string;
  isDead: boolean;
  isSafe: boolean;
  isSuspicious: boolean;
}

interface DomainInfo {
  rawDomain: string;
  links: ProcessedLink[];
  isSafe: boolean;
  isEscortListing: boolean;
  flag: string | null;
}

interface ImageLinkDomainGroup {
  domain: string;
  rawDomain: string;
  links: ProcessedLink[];
  isSafe: boolean;
  isEscortListing: boolean;
  flag: string | null;
}

function countryToFlag(cc: string): string {
  return cc === 'general' ? '🌐' : utils.countryCodeToFlagEmoji(cc);
}

function getFlagForDomain(domain: string): string | null {
  const cc = escortDomainToCountry.get(domain);
  if (cc !== undefined) {
    return countryToFlag(cc);
  }

  // subdomain check — e.g. sub.example.com against example.com
  for (const [d, c] of escortDomainToCountry) {
    if (domain.endsWith('.' + d)) {
      return countryToFlag(c);
    }
  }

  return null;
}

export const linksFilter = {
  isAdUrl(url: ImageResult) {
    if (Array.isArray(url)) {
      return (url as [string, string])[0].toLowerCase() === 'publi24';
    }
    return url.startsWith("https://www.publi24.ro/") && url.includes("/anunt/");
  },

  isUrlSameAd(url: string, adUrl: string) {
    return linksFilter.isAdUrl(url) &&
      url.replace(/.+\/([^.\/]+)\.html.*/, '$1') === adUrl.replace(/.+\/([^.\/]+)\.html.*/, '$1');
  },

  filterLinks(links: string[], itemUrl: string): string[] {
    return links.filter(
      (l: string) =>
        !BLACKLISTED_LINKS.some((b: string) => l.indexOf(b) === 0)
        && !linksFilter.isUrlSameAd(l, itemUrl)
    );
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
        if (d1 !== d2) {
          return d1 - d2;
        }
        return l1.localeCompare(l2);
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

  processImageLinks(id: string, links: ImageResult[], itemUrl: string): ImageLinkDomainGroup[] {
    const domainMap: { [domain: string]: DomainInfo } = {};
    const duplicatesInOtherLoc: string[] = WWStorage.getAdDuplicatesInOtherLocation(id);
    const duplicatesNotOldInOtherLoc: string[] = WWStorage.getAdNotOldDuplicatesInOtherLocation(id);
    const deadLinks: string[] = WWStorage.getAdDeadLinks(id);

    function getPriority(l: ProcessedLink) {
      if (l.isDead) return 4;
      if (!l.isSafe && l.isSuspicious) return 2;
      if (!l.isSafe) return 1;
      if (l.isSuspicious) return 3;
      return 4;
    }

    links.forEach((result: ImageResult) => {
      try {
        let link: string;
        let rawDomain: string;
        let compressedLink: string | null;
        let escortListingFlag: string | null;

        if (Array.isArray(result)) {
          const [siteName, gotoPath] = result;
          link = new URL(gotoPath, 'https://www.google.com').href;
          rawDomain = escortSiteNameToDomain.get(siteName.toLowerCase()) ?? siteName;
          compressedLink = null;
          const cc = escortSiteNameToCountry.get(siteName.toLowerCase());
          escortListingFlag = cc !== undefined ? countryToFlag(cc) : null;
        } else {
          if (linksFilter.isUrlSameAd(result, itemUrl)) {
            return;
          }
          link = result;
          rawDomain = new URL(link).hostname.replace(/^www\./, '');
          const isPubliLink = linksFilter.isAdUrl(link);
          compressedLink = isPubliLink ? dataCompression.compressAdLink(link) : link;
          escortListingFlag = getFlagForDomain(rawDomain);
        }
        let isDomainSafe = false;
        let isDomainSuspicious = false;
        let isEscortListing = false;
        let flag: string | null = null;

        if (escortListingFlag === '🇷🇴') {
          isDomainSafe = compressedLink ? !duplicatesInOtherLoc.includes(compressedLink) : true;
          isDomainSuspicious = !!compressedLink && duplicatesNotOldInOtherLoc.includes(compressedLink);
          flag = '🇷🇴';
        } else if (escortListingFlag) {
          isDomainSuspicious = true;
          isEscortListing = true;
          flag = escortListingFlag;
        }

        const linkObj: ProcessedLink = {
          link,
          isDead: !!compressedLink && deadLinks.includes(compressedLink),
          isSafe: isDomainSafe,
          isSuspicious: isDomainSuspicious,
        };

        if (!domainMap[rawDomain]) {
          domainMap[rawDomain] = { rawDomain, links: [linkObj], isSafe: isDomainSafe, isEscortListing, flag };
        } else {
          const newPriority = getPriority(linkObj);
          const insertIndex = domainMap[rawDomain].links.findIndex(existing => newPriority < getPriority(existing));
          if (insertIndex === -1) {
            domainMap[rawDomain].links.push(linkObj);
          } else {
            domainMap[rawDomain].links.splice(insertIndex, 0, linkObj);
          }
        }
      } catch (error: any) {
        console.error(`Error processing link "${result}":`, error.message);
      }
    });

    return Object.values(domainMap)
      .map(({rawDomain, links: domainLinks, isSafe, isEscortListing, flag}: DomainInfo): ImageLinkDomainGroup => {
        const displayDomain = flag ? `${flag}  ${rawDomain}` : rawDomain;
        return { domain: displayDomain, rawDomain, links: domainLinks, isSafe, isEscortListing, flag };
      })
      .sort((groupA: ImageLinkDomainGroup, groupB: ImageLinkDomainGroup): number => {
        const prioA = PRIO_DOMAINS.indexOf(groupA.rawDomain);
        const prioB = PRIO_DOMAINS.indexOf(groupB.rawDomain);
        if (prioA !== -1 && prioB !== -1) {
          return prioA - prioB;
        }
        if (prioA !== -1) {
          return -1;
        }
        if (prioB !== -1) {
          return 1;
        }

        // Tier: safe=0, escort-listing=1, unknown=2
        const tierA = groupA.isSafe ? 0 : groupA.isEscortListing ? 1 : 2;
        const tierB = groupB.isSafe ? 0 : groupB.isEscortListing ? 1 : 2;
        if (tierA !== tierB) {
          return tierA - tierB;
        }
        return groupA.rawDomain.localeCompare(groupB.rawDomain);
      });
  },
};
