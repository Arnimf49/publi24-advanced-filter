import { Page } from 'playwright-core';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const UNKNOWN_DOMAINS_FILE = resolve('src-mapper/unknown-domains.json');
const ESCORT_DOMAINS_FILE = resolve('escort-listing-domains.json');

interface UnknownDomainEntry {
  source: string;
  siteNames: string[];
}

interface EscortDomainEntry {
  country: string;
  domain: string;
  siteNames: string[];
}

interface LensLink {
  href: string;
  siteName: string;
}

/**
 * Collect domain + site name pairs from a Google Lens result page.
 * Called on each secondary Lens tab before it closes.
 */
export async function collectFromLensPage(lensPage: Page): Promise<void> {
  try {
    const links = await lensPage.evaluate((): LensLink[] => {
      const linkEls = document.querySelectorAll<HTMLAnchorElement>(
        '[id="rso"] [href][data-hveid], [id="rso"] a[href], li > a[href]'
      );

      return Array.from(linkEls).flatMap((linkEl): LensLink[] => {
        const href = linkEl.getAttribute('href');
        if (!href) return [];

        const siteNameEl = linkEl.querySelector('.wyccme div:last-child');
        return [{href, siteName: siteNameEl?.textContent?.trim() || ''}];
      });
    });

    const entries: Array<{ domain: string; source: string; siteNames: string[] }> = [];
    for (const {href, siteName} of links) {
      let source = new URL(href, 'https://www.google.com').href;

      try {
        const linkUrl = new URL(source);
        if (linkUrl.hostname === 'www.google.com' && linkUrl.pathname === '/goto') {
          const knownDomain = escortDomainBySiteName.get(siteName.toLowerCase());
          if (knownDomain) {
            entries.push({domain: knownDomain, source, siteNames: siteName ? [siteName] : []});
            continue;
          }

          const response = await lensPage.context().request.get(source, {maxRedirects: 10});
          source = response.url();
        }

        const resolvedUrl = new URL(source);
        const domain = resolvedUrl.hostname.replace(/^www\./, '');
        if (domain === 'google.com') {
          continue;
        }

        entries.push({domain, source, siteNames: siteName ? [siteName] : []});
      } catch (error) {
        console.warn(`Failed to resolve Lens result link "${source}":`, error);
      }
    }

    if (entries.length > 0) {
      saveEntries(entries);
    }
  } catch (error) {
    console.warn('Failed to collect from Lens page:', error);
  }
}

function loadJSON<T>(file: string, fallback: T): T {
  try {
    return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback;
  } catch (_) {
    return fallback;
  }
}

const escortDomainBySiteName = new Map<string, string>(
  loadJSON<EscortDomainEntry[]>(ESCORT_DOMAINS_FILE, []).flatMap(({domain, siteNames}) =>
    siteNames.map(siteName => [siteName.trim().toLowerCase(), domain] as [string, string])
  )
);

function saveEntries(newEntries: Array<{ domain: string; source: string; siteNames: string[] }>): void {
  const escortDomains: EscortDomainEntry[] = loadJSON(ESCORT_DOMAINS_FILE, []);
  const unknownDomains: Record<string, UnknownDomainEntry> = loadJSON(UNKNOWN_DOMAINS_FILE, {});

  const escortMap = new Map<string, EscortDomainEntry>(escortDomains.map(e => [e.domain, e]));

  let escortUpdated = false;
  let unknownAdded = 0;

  for (const { domain, source, siteNames } of newEntries) {
    if (escortMap.has(domain)) {
      const entry = escortMap.get(domain)!;
      const merged = [...new Set([...entry.siteNames, ...siteNames])];
      if (merged.length !== entry.siteNames.length) {
        entry.siteNames = merged;
        escortUpdated = true;
      }
    } else if (!unknownDomains[domain]) {
      unknownDomains[domain] = { source, siteNames };
      unknownAdded++;
    } else {
      const existing = unknownDomains[domain];
      existing.siteNames = [...new Set([...existing.siteNames, ...siteNames])];
    }
  }

  if (escortUpdated) {
    const sorted = [...escortMap.values()].sort((a, b) => a.country.localeCompare(b.country) || a.domain.localeCompare(b.domain));
    writeFileSync(ESCORT_DOMAINS_FILE, JSON.stringify(sorted, null, 2) + '\n');
    console.log(`✅ Updated siteNames in escort-listing-domains.json`);
  }

  const sortedUnknown = Object.fromEntries(
    Object.entries(unknownDomains).sort(([a], [b]) => a.localeCompare(b))
  );
  writeFileSync(UNKNOWN_DOMAINS_FILE, JSON.stringify(sortedUnknown, null, 2));

  if (unknownAdded > 0) {
    console.log(`🔍 Added ${unknownAdded} new unknown domains to unknown-domains.json`);
  }
}
