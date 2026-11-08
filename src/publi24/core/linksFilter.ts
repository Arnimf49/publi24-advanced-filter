import type {Publi24StatusEntry, Publi24StatusValue} from "./storage";
import {google} from "../../common/google";
import {utils} from "../../common/utils";
import escortListingDomainsData from '../../../escort-listing-domains.json';

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
  'telefon.4id.ro',
  'portabilitate.ro',
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
// when the absolute URL could not be determined (Google Lens /goto or /url redirect).
export type ImageResult = string | [string, string];

export interface ImageSearchError {
  type: 'err';
}

// A raw search result: either an absolute URL string, or a [displayName, gotoPath] tuple
// when Google renders a /goto or /url redirect hiding the real destination URL.
export type SearchResult = string | [string, string];

interface ProcessedLink {
  link: string;
  isDead: boolean;
  isSafe: boolean;
  isSuspicious: boolean;
  isUnknown: boolean;
  isListing: boolean;
  listingLabel: string | null;
  city: string | null;
  status: Publi24StatusValue | null;
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

function getResultUrl(result: ImageResult): string {
  return Array.isArray(result) ? google.toAbsoluteUrl(result[1]) : result;
}

function getAdIdFromUrl(url: string): string | null {
  const match = url.match(/.+\/([^./]+)\.html/);
  return match ? match[1] : null;
}

function isPubli24ImageResult(result: ImageResult): boolean {
  if (Array.isArray(result)) {
    const siteName = result[0].trim().toLowerCase().replace(/^www\./, '');
    return siteName === 'publi24' || siteName === 'publi24.ro';
  }

  try {
    const hostname = new URL(result, 'https://www.google.com').hostname.replace(/^www\./, '').toLowerCase();
    return hostname === 'publi24.ro';
  } catch (error) {
    console.error(`Error parsing image result URL "${result}":`, error);
    return false;
  }
}

function isPubli24AdLink(url: string): boolean {
  try {
    const parsedUrl = new URL(url, 'https://www.google.com');
    return parsedUrl.hostname.replace(/^www\./, '').toLowerCase() === 'publi24.ro'
      && parsedUrl.pathname.includes('/anunt/');
  } catch (error) {
    console.error(`Error parsing publi24 URL "${url}":`, error);
    return false;
  }
}

function getLastPathPart(url: string): string | null {
  try {
    const pathname = new URL(url, 'https://www.google.com').pathname;
    const parts = pathname.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];

    return lastPart ? decodeURIComponent(lastPart) : null;
  } catch (error) {
    console.error(`Error parsing URL path "${url}":`, error);
    return null;
  }
}

function normalizePubli24Url(url: string): string {
  try {
    const parsedUrl = new URL(url, 'https://www.google.com');

    if (parsedUrl.hostname.replace(/^www\./, '').toLowerCase() !== 'publi24.ro' || !parsedUrl.searchParams.has('q')) {
      return url;
    }

    parsedUrl.searchParams.delete('q');
    return parsedUrl.href;
  } catch (error) {
    console.error(`Error normalizing publi24 URL "${url}":`, error);
    return url;
  }
}

function isSameAdResult(result: ImageResult, itemUrl: string): boolean {
  if (!isPubli24ImageResult(result)) {
    return false;
  }

  const adId = getAdIdFromUrl(getResultUrl(result));
  const itemAdId = getAdIdFromUrl(itemUrl);

  return !!adId && !!itemAdId && adId === itemAdId;
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
    if (!linksFilter.isAdUrl(url)) {
      return false;
    }

    const adId = getAdIdFromUrl(url);
    const itemAdId = getAdIdFromUrl(adUrl);

    return !!adId && !!itemAdId && adId === itemAdId;
  },

  isPubli24Result(result: ImageResult): boolean {
    return isPubli24ImageResult(result);
  },

  isPubli24AdLink(url: string): boolean {
    return isPubli24AdLink(url);
  },

  normalizePubli24Url(url: string): string {
    return normalizePubli24Url(url);
  },

  isSameAdResult(result: ImageResult, itemUrl: string): boolean {
    return isSameAdResult(result, itemUrl);
  },

  filterLinks(links: SearchResult[], itemUrl: string): SearchResult[] {
    return links
      .filter((l: SearchResult) => {
        if (typeof l === 'string' && google.isRedirectPath(l)) {
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
        if (!linkData.isSafe && !linkData.isSuspicious && !linkData.isDead && !linkData.isUnknown) {
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

  processImageLinks(links: ImageResult[], itemUrl: string, publi24Statuses: Publi24StatusEntry[] = []): ImageLinkDomainGroup[] {
    const domainMap: { [domain: string]: DomainInfo } = {};
    const seenPubli24Urls = new Set<string>();
    let publi24Index = 0;

    function getPriority(l: ProcessedLink) {
      if (l.isDead) return 4;
      if (!l.isSafe && l.isSuspicious) return 2;
      if (!l.isSafe) return 1;
      if (l.isSuspicious) return 3;
      return 4;
    }

    links.forEach((result: ImageResult) => {
      try {
        const isPubli24 = isPubli24ImageResult(result);
        const statusEntry = isPubli24 ? (publi24Statuses[publi24Index++] ?? null) : null;
        let link: string;
        let rawDomain: string;
        let escortListingFlag: string | null;

        if (Array.isArray(result)) {
          const [siteName, gotoPath] = result;
          link = google.toAbsoluteUrl(gotoPath);
          rawDomain = escortSiteNameToDomain.get(siteName.toLowerCase()) ?? siteName;
          const cc = escortSiteNameToCountry.get(siteName.toLowerCase());
          escortListingFlag = cc !== undefined ? countryToFlag(cc) : null;
        } else {
          if (linksFilter.isUrlSameAd(result, itemUrl)) {
            return;
          }
          link = result;
          rawDomain = new URL(link).hostname.replace(/^www\./, '');
          escortListingFlag = getFlagForDomain(rawDomain);
        }

        let isListing = false;
        let listingLabel: string | null = null;

        if (isPubli24) {
          link = normalizePubli24Url(link);
          isListing = isPubli24ImageResult(link) && !isPubli24AdLink(link);
          listingLabel = isListing ? getLastPathPart(link) : null;

          const dedupeKey = isListing ? `listing:${listingLabel ?? link}` : link;

          if (seenPubli24Urls.has(dedupeKey)) {
            return;
          }

          seenPubli24Urls.add(dedupeKey);
        }

        if (isPubli24 && isSameAdResult(result, itemUrl)) {
          return;
        }

        let linkObj: ProcessedLink;
        let isDomainSafe = false;
        let isDomainSuspicious = false;
        let isEscortListing = false;
        let flag: string | null = null;

        if (isPubli24) {
          const status = statusEntry?.status ?? null;

          linkObj = {
            link,
            isDead: status === 'dead',
            isSafe: status === 'safe',
            isSuspicious: status === 'dup_old',
            isUnknown: status === null,
            isListing,
            listingLabel,
            city: statusEntry?.city ?? null,
            status,
          };

          flag = escortListingFlag ?? getFlagForDomain(rawDomain);
          isDomainSafe = status === 'safe';
          isEscortListing = false;
        } else {
          if (escortListingFlag === '🇷🇴') {
            isDomainSafe = true;
            flag = '🇷🇴';
          } else if (escortListingFlag) {
            isDomainSuspicious = true;
            isEscortListing = true;
            flag = escortListingFlag;
          }

          linkObj = {
            link,
            isDead: false,
            isSafe: isDomainSafe,
            isSuspicious: isDomainSuspicious,
            isUnknown: false,
            isListing: false,
            listingLabel: null,
            city: null,
            status: null,
          };
        }

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
