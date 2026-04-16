import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import type { DomainCandidate, EscortDomainEntry, UnknownDomainEntry } from './types/tools.js';
import { phoneSignals } from './utilities/phoneSignals.js';

// Known second-level "meta-TLD" segments (e.g. com.ro, co.uk, com.au)
const META_TLD_PARTS = new Set(['com', 'org', 'net', 'co', 'gov', 'edu', 'ac', 'mil', 'biz', 'info', 'med', 'nom', 'sch']);

// Subdomains that represent locale/country/language selection and should not be treated as sibling signals
// for the BAD triage check (country-code subs like 'de', 'fr' are locale selectors, not distinct sub-sites).
// NOTE: for escort triage we intentionally keep country-code subdomains since they ARE meaningful.
const COUNTRY_SELECTOR_SUBDOMAINS = new Set([
  ...phoneSignals.ALL_COUNTRY_CODES,
  'www', 'm', 'mail', 'blog', 'cdn', 'api', 'staging', 'dev', 'test', 'preview', 'static',
  'media', 'img', 'images', 'news', 'shop', 'store', 'app', 'ww1', 'ww2',
]);

// Subdomains that are purely technical/meta and never meaningful for escort sibling detection
const TECH_SUBDOMAINS = new Set([
  'www', 'm', 'mail', 'cdn', 'api', 'staging', 'dev', 'test', 'preview', 'static',
  'media', 'img', 'images', 'app', 'ww1', 'ww2',
]);

// Map common country alias subdomains to ISO codes (e.g. 'uk' is commonly used for 'gb')
const SUBDOMAIN_COUNTRY_ALIASES: Record<string, string> = {
  uk: 'gb',
};

/**
 * Infers the most likely country for a new domain given its subdomain and known sibling escort entries.
 *
 * Rules (in priority order):
 * 1. If the subdomain directly maps to an ISO country code (or alias), use it — but only if it
 *    does NOT conflict with all siblings pointing to a different country (prevents 'fr'=French
 *    language being misread as France=fr when the site is Finnish).
 * 2. If all non-general siblings share the same country, use that country.
 * 3. Use the most common non-general sibling country.
 * 4. Return null if no clear signal.
 */
const inferEscortCountry = (subdomain: string | null, siblings: EscortDomainEntry[]): string | null => {
  const nonGeneralSiblings = siblings.filter((s) => s.country !== 'general');

  const getMostCommon = (): string | null => {
    if (nonGeneralSiblings.length === 0) {
      return null;
    }

    const counts: Record<string, number> = {};
    for (const s of nonGeneralSiblings) {
      counts[s.country] = (counts[s.country] ?? 0) + 1;
    }

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const [topCountry, topCount] = sorted[0];
    const total = nonGeneralSiblings.length;

    // Require clear majority (>= 60%) to use as inferred country
    return topCount / total >= 0.6 ? topCountry : null;
  };

  if (subdomain) {
    const normalizedSub = subdomain.toLowerCase();

    // Check direct ISO match or alias
    const isoCandidate =
      (phoneSignals.ALL_COUNTRY_CODES as readonly string[]).includes(normalizedSub)
        ? normalizedSub
        : (SUBDOMAIN_COUNTRY_ALIASES[normalizedSub] ?? null);

    if (isoCandidate) {
      // Validate: does the sibling majority agree? If all siblings point elsewhere, it's
      // probably a language sub (e.g. 'fr' = French on a Finnish site).
      const majority = getMostCommon();
      if (!majority || majority === isoCandidate) {
        return isoCandidate;
      }
      // Siblings disagree — fall through to use sibling majority
    }
  }

  return getMostCommon();
};

/**
 * Returns the "registered" root domain for a given domain string.
 * Handles single-part TLDs (e.g. sexfemei.ro → sexfemei.ro) and
 * compound TLDs (e.g. alesia-si-carla.escorte.com.ro → escorte.com.ro).
 */
const getRegisteredDomain = (domain: string): string => {
  const parts = domain.split('.');
  if (parts.length <= 2) {
    return domain;
  }

  const tld = parts[parts.length - 1];
  const secondLast = parts[parts.length - 2];

  // Compound TLD: something like com.ro, co.uk, org.nz — take last 3 parts as root
  if (META_TLD_PARTS.has(secondLast) && tld.length === 2) {
    return parts.slice(-3).join('.');
  }

  return parts.slice(-2).join('.');
};

/**
 * Returns the subdomain prefix of a domain relative to its registered root.
 * Returns null if the domain IS the registered root (no subdomain).
 */
const getSubdomain = (domain: string, registeredRoot: string): string | null => {
  if (domain === registeredRoot) {
    return null;
  }

  const suffix = `.${registeredRoot}`;
  if (domain.endsWith(suffix)) {
    return domain.slice(0, domain.length - suffix.length);
  }

  return null;
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const UNKNOWN_DOMAINS_FILE = resolve(__dirname, '..', 'unknown-domains.json');
const BAD_DOMAINS_FILE = resolve(__dirname, '..', 'bad-domains.json');
const ESCORT_DOMAINS_FILE = resolve(__dirname, '..', '..', 'escort-listing-domains.json');

const readJsonFile = <T>(filePath: string, defaultValue: T): T => {
  if (!existsSync(filePath)) {
    return defaultValue;
  }

  return JSON.parse(readFileSync(filePath, 'utf8')) as T;
};

const writeJsonFile = (filePath: string, value: unknown): void => {
  writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
};

const create = () => {
  let unknownDomains = readJsonFile<Record<string, UnknownDomainEntry>>(UNKNOWN_DOMAINS_FILE, {});
  let badDomains = readJsonFile<string[]>(BAD_DOMAINS_FILE, []);
  let escortDomains = readJsonFile<EscortDomainEntry[]>(ESCORT_DOMAINS_FILE, []);
  const initialTotalCount = Object.keys(unknownDomains).length;

  const persistUnknownDomains = (): void => {
    writeJsonFile(UNKNOWN_DOMAINS_FILE, unknownDomains);
  };

  const getNextDomain = (excludedDomains: Set<string>): DomainCandidate | null => {
    const domain = Object.keys(unknownDomains).find((item) => !excludedDomains.has(item));
    if (!domain) {
      return null;
    }

    return {
      domain,
      source: unknownDomains[domain].source ?? null,
      siteNames: unknownDomains[domain].siteNames ?? [],
    };
  };

  const getRemainingCount = (excludedDomains: Set<string>): number => {
    return Object.keys(unknownDomains).filter((domain) => !excludedDomains.has(domain)).length;
  };

  const getTotalCount = (): number => {
    return initialTotalCount;
  };

  const getSuggestedCountry = (domain: string): string | null => {
    return phoneSignals.extractCountryFromDomain(domain);
  };

  const mapBad = (domain: string): number => {
    if (!unknownDomains[domain]) {
      throw new Error(`Invalid domain: ${domain}`);
    }

    if (!badDomains.includes(domain)) {
      badDomains.push(domain);
      badDomains.sort((left, right) => left.localeCompare(right));
      writeJsonFile(BAD_DOMAINS_FILE, badDomains);
    }

    delete unknownDomains[domain];
    persistUnknownDomains();

    return Object.keys(unknownDomains).length;
  };

  const mapEscort = (domain: string, country: string): number => {
    const unknownEntry = unknownDomains[domain];
    if (!unknownEntry) {
      throw new Error(`Invalid domain: ${domain}`);
    }

    if (!(phoneSignals.ALL_COUNTRY_CODES as readonly string[]).includes(country)) {
      throw new Error(`Invalid country code: ${country}`);
    }

    const existing = escortDomains.find((escortDomain) => escortDomain.domain === domain);
    if (existing) {
      existing.country = country;
      existing.siteNames = [...new Set([...existing.siteNames, ...unknownEntry.siteNames])].sort((left, right) => left.localeCompare(right));
    } else {
      escortDomains.push({
        country,
        domain,
        siteNames: [...unknownEntry.siteNames].sort((left, right) => left.localeCompare(right)),
      });
    }

    escortDomains.sort((left, right) => left.country.localeCompare(right.country) || left.domain.localeCompare(right.domain));
    writeJsonFile(ESCORT_DOMAINS_FILE, escortDomains);

    delete unknownDomains[domain];
    persistUnknownDomains();

    return Object.keys(unknownDomains).length;
  };

  const requeueUnknown = (domain: string): void => {
    const unknownEntry = unknownDomains[domain];
    if (!unknownEntry) {
      throw new Error(`Invalid domain: ${domain}`);
    }

    delete unknownDomains[domain];
    unknownDomains = {
      ...unknownDomains,
      [domain]: unknownEntry,
    };

    persistUnknownDomains();
  };

  /** Save a domain as bad without requiring it to be in the queue (used for stash accept). */
  const mapBadDirect = (domain: string): void => {
    if (!badDomains.includes(domain)) {
      badDomains.push(domain);
      badDomains.sort((left, right) => left.localeCompare(right));
      writeJsonFile(BAD_DOMAINS_FILE, badDomains);
    }

    if (unknownDomains[domain]) {
      delete unknownDomains[domain];
      persistUnknownDomains();
    }
  };

  /** Save a domain as escort without requiring it to be in the queue (used for stash accept). */
  const mapEscortDirect = (domain: string, country: string, siteNames: string[]): void => {
    if (!(phoneSignals.ALL_COUNTRY_CODES as readonly string[]).includes(country)) {
      throw new Error(`Invalid country code: ${country}`);
    }

    const existing = escortDomains.find((escortDomain) => escortDomain.domain === domain);
    if (existing) {
      existing.country = country;
      existing.siteNames = [...new Set([...existing.siteNames, ...siteNames])].sort((left, right) => left.localeCompare(right));
    } else {
      escortDomains.push({
        country,
        domain,
        siteNames: [...siteNames].sort((left, right) => left.localeCompare(right)),
      });
    }

    escortDomains.sort((left, right) => left.country.localeCompare(right.country) || left.domain.localeCompare(right.domain));
    writeJsonFile(ESCORT_DOMAINS_FILE, escortDomains);

    if (unknownDomains[domain]) {
      delete unknownDomains[domain];
      persistUnknownDomains();
    }
  };

  /** Remove a domain from the queue without saving to any output file (e.g. stashed for later review). */
  const dequeue = (domain: string): void => {
    if (!unknownDomains[domain]) {
      return;
    }

    delete unknownDomains[domain];
    persistUnknownDomains();
  };

  const getSiblingBadDomains = (domain: string): string[] => {
    const root = getRegisteredDomain(domain);

    return badDomains.filter((bad) => {
      if (bad === domain) {
        return false;
      }

      const badRoot = getRegisteredDomain(bad);
      if (badRoot !== root) {
        return false;
      }

      const sub = getSubdomain(bad, root);
      if (sub === null) {
        return false;
      }

      return !COUNTRY_SELECTOR_SUBDOMAINS.has(sub.toLowerCase());
    });
  };

  const getSiblingEscortDomains = (domain: string): EscortDomainEntry[] => {
    const root = getRegisteredDomain(domain);

    return escortDomains.filter((escort) => {
      if (escort.domain === domain) {
        return false;
      }

      const escortRoot = getRegisteredDomain(escort.domain);
      if (escortRoot !== root) {
        return false;
      }

      const sub = getSubdomain(escort.domain, root);

      // Exclude purely technical subdomains (www, cdn, etc.) but keep country/language/city subs
      if (sub !== null && TECH_SUBDOMAINS.has(sub.toLowerCase())) {
        return false;
      }

      return true;
    });
  };

  return {
    getNextDomain,
    getRemainingCount,
    getSuggestedCountry,
    getTotalCount,
    getSiblingBadDomains,
    getSiblingEscortDomains,
    mapBad,
    mapEscort,
    mapBadDirect,
    mapEscortDirect,
    requeueUnknown,
    dequeue,
  };
};

export const domainStore = {
  create,
};

export { inferEscortCountry, getRegisteredDomain, getSubdomain };
