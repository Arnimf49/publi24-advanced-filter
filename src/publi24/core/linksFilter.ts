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
  'https://information.com/people/',
  'https://health.information.com/reverse-phone-lookup/',
  'https://www.publi24.ro/cv?jobapplyid=',
  'https://www.180.no/',
  'https://www.thenile.co.nz/',
  'https://www.awesomebooks.com/',
  'https://www.abebooks.de/',
  'https://www.thriftbooks.com/',
  'https://booksrun.com/',
  'https://junkcall.org/',
];

const BLACKLISTED_DOMAIN_SUFFIXES: string[] = [
  'cloudfront.net',
  'meiwakucheck.com',
  'jpnumber.com',
  'telefonforsaljare.nu',
  '180.se',
  '180.dk',
  'eniro.se',
  'canina101.es',
  'denwam.com',
  'cinetesuna.ro',
  'france-inverse.com',
  'zibadpl.blogfa.com',
  'telephoneannuaire.fr',
  'forschungsstelle-ordensgeschichte.de',
  'echantillon-lipton.fr',
  'thiasbarber.fr',
  'leelam.af',
  'kto-zvonil.com.ua',
  'hitta.se',
  'mobifone.vn',
  'denwacho.net',
  'sunat.ro',
  'telefoncontact.online',
  'telefonreclamatii.online',
  'contact-telefon.online',
  'inelenco.com',
  'genealogic.review',
  'merinfo.se',
  'telefon-kontakte.ch',
  'telnavi.jp',
  'reverseau.com',
  'telguarder.com',
  'reverseaustralia.com',
  'unmask.com',
  'e-aidem.com',
  'phone-book.tw',
  'escorte.lol',
  'haisalut.ro',
  'tel-search.net',
];

const BLACKLISTED_DOMAIN_PATTERNS: RegExp[] = [
  /^(?:[^.]+\.)*z\d+\.web\.core\.windows\.net$/,
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

export interface ImageSearchError {
  type: 'err';
}

// A raw search result: either an absolute URL string, or a [displayName, gotoPath] tuple
// when Google renders a /goto redirect hiding the real destination URL.
export type SearchResult = string | [string, string];

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

function isGotoPath(gotoPath: string): boolean {
  try {
    return new URL(gotoPath, 'https://www.google.com').pathname === '/goto';
  } catch (error) {
    console.error(`Error parsing possible Google redirect URL "${gotoPath}":`, error);
    return false;
  }
}

function getDomain(value: string): string {
  return value.trim().toLowerCase()
    .replace(/^(?:https?:)?\/\//, '')
    .split(/[/?#\s|]/, 1)[0]
    .replace(/\.$/, '')
    .replace(/^www\./, '');
}

function hasDomainSuffix(value: string, domainSuffixes: string[]): boolean {
  const domain = getDomain(value);
  return domainSuffixes.some((suffix: string) => {
    const normalizedSuffix = getDomain(suffix).replace(/^\.+|\.+$/g, '');
    return domain === normalizedSuffix || domain.endsWith(`.${normalizedSuffix}`);
  });
}

function matchesDomainPattern(value: string, domainPatterns: RegExp[]): boolean {
  const domain = getDomain(value);
  return domainPatterns.some((pattern: RegExp) => pattern.test(domain));
}

function getSearchResultTitle(result: SearchResult): string {
  if (!Array.isArray(result)) {
    return '';
  }

  const separatorIndex = result[0].indexOf(' | ');
  return (separatorIndex === -1 ? result[0] : result[0].slice(separatorIndex + 3))
    .trim();
}

function hasPhoneNumberInSearchResultTitle(result: SearchResult): boolean {
  return /07\d{8}/.test(getSearchResultTitle(result));
}

function isNimfomaneTopicUrl(result: SearchResult): boolean {
  return typeof result === 'string' && result.startsWith('https://nimfomane.com/forum/topic/');
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

  filterLinks(links: SearchResult[], itemUrl: string): SearchResult[] {
    return links
      .filter((l: SearchResult) => {
        if (typeof l === 'string' && isGotoPath(l)) {
          return false;
        }

        if (Array.isArray(l)) {
          const name = l[0];
          return !hasDomainSuffix(name, BLACKLISTED_DOMAIN_SUFFIXES)
            && !matchesDomainPattern(name, BLACKLISTED_DOMAIN_PATTERNS)
            && !BLACKLISTED_LINKS.some(
              (b: string) => name.startsWith(b
                .replace(/^https?:\/\//, '')
                .replace(/\/$/, '')
              )
            );
        }
        return !hasDomainSuffix(l, BLACKLISTED_DOMAIN_SUFFIXES)
          && !matchesDomainPattern(l, BLACKLISTED_DOMAIN_PATTERNS)
          && !BLACKLISTED_LINKS.some((b: string) => l.indexOf(b) === 0)
          && !linksFilter.isUrlSameAd(l, itemUrl);
      });
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

  sortLinks(links: SearchResult[]): SearchResult[] {
    return links.sort((l1: SearchResult, l2: SearchResult): number => {
      const isTopic1 = isNimfomaneTopicUrl(l1);
      const isTopic2 = isNimfomaneTopicUrl(l2);

      if (isTopic1 !== isTopic2) {
        return isTopic1 ? -1 : 1;
      }

      const hasPhone1 = hasPhoneNumberInSearchResultTitle(l1);
      const hasPhone2 = hasPhoneNumberInSearchResultTitle(l2);

      if (hasPhone1 !== hasPhone2) {
        return hasPhone1 ? -1 : 1;
      }

      const u1 = Array.isArray(l1) ? l1[0] : l1;
      const u2 = Array.isArray(l2) ? l2[0] : l2;
      const d1: number = PRIO_DOMAINS.findIndex((d: string) => u1.includes('//' + d) || u1.startsWith(d + '/') || u1.startsWith(d + ' '));
      const d2: number = PRIO_DOMAINS.findIndex((d: string) => u2.includes('//' + d) || u2.startsWith(d + '/') || u2.startsWith(d + ' '));

      if (d1 !== -1 && d2 !== -1) {
        if (d1 !== d2) {
          return d1 - d2;
        }
        return u1.localeCompare(u2);
      }
      if (d2 !== -1) {
        return 1;
      }
      if (d1 !== -1) {
        return -1;
      }

      return u1.localeCompare(u2);
    });
  },

  isNimfomaneTopic(result: SearchResult): boolean {
    if (!Array.isArray(result)) {
      return result.startsWith('https://nimfomane.com/forum/topic/');
    }

    const displayName = result[0].toLowerCase();
    return displayName.startsWith('nimfomane.com ') || displayName.startsWith('nimfomane.com | ');
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
        const isPubli24QueryLink = !Array.isArray(result)
          && rawDomain === 'publi24.ro'
          && link.includes('?q=');
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
          isDead: isPubli24QueryLink || (!!compressedLink && deadLinks.includes(compressedLink)),
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
