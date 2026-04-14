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

/**
 * Collect domain + site name pairs from a Google Lens result page.
 * Called on each secondary Lens tab before it closes.
 */
export async function collectFromLensPage(lensPage: Page): Promise<void> {
  try {
    const entries = await lensPage.evaluate((): Array<{ domain: string; source: string; siteNames: string[] }> => {
      const results: Array<{ domain: string; source: string; siteNames: string[] }> = [];

      const linkEls: NodeListOf<HTMLAnchorElement> = document.querySelectorAll<HTMLAnchorElement>('[id="rso"] [href][data-hveid]');
      console.log(linkEls.length);

      linkEls.forEach((linkEl) => {
        const href = linkEl.getAttribute('href');
        if (!href) return;

        let resolvedHref: string;
        try {
          resolvedHref = href.startsWith('/goto')
            ? (new URLSearchParams(href.split('?')[1] || '').get('url') ?? href)
            : href;
        } catch (_) {
          return;
        }

        let domain: string;
        try {
          domain = new URL(resolvedHref).hostname.replace(/^www\./, '');
        } catch (_) {
          return;
        }

        const siteNameEl = linkEl.querySelector('.wyccme div:last-child');
        const siteName = siteNameEl?.textContent?.trim() || '';
        results.push({ domain, source: resolvedHref, siteNames: siteName ? [siteName] : [] });
      });

      return results;
    });

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


