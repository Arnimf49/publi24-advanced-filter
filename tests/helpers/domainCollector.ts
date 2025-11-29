import { ElementHandle } from 'playwright-core';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const UNKNOWN_DOMAINS_FILE = resolve('src-mapper/unknown-domains.json');

export async function collectUnknownDomains(ad: ElementHandle): Promise<void> {
  try {
    const allLinks = await ad.$$('[data-wwid="image-results"] a[href]');
    if (allLinks.length === 0) return;

    const domains: string[] = [];

    for (const link of allLinks) {
      const className = await link.getAttribute('class');
      const href = await link.getAttribute('href');

      if (href && className && className.includes('linkUnsafe')) {
        try {
          const domain = new URL(href).hostname.replace(/^www\./, '');
          domains.push(domain);
        } catch (error) {
          console.warn(`Failed to parse URL: ${href}`);
        }
      }
    }

    if (domains.length > 0) {
      addDomainsToFile(domains);
    }
  } catch (error) {
    console.warn('Failed to collect unknown domains:', error);
  }
}

function addDomainsToFile(newDomains: string[]): void {
  let existingDomains: string[] = [];

  if (existsSync(UNKNOWN_DOMAINS_FILE)) {
    try {
      existingDomains = JSON.parse(readFileSync(UNKNOWN_DOMAINS_FILE, 'utf8'));
    } catch (error) {
      existingDomains = [];
    }
  } else {
    writeFileSync(UNKNOWN_DOMAINS_FILE, '[]');
  }

  const allDomains = [...new Set([...existingDomains, ...newDomains])];

  if (allDomains.length > existingDomains.length) {
    writeFileSync(UNKNOWN_DOMAINS_FILE, JSON.stringify(allDomains, null, 2));
    console.log(`🔍 Added ${allDomains.length - existingDomains.length} new unknown domains to unknown-domains.json`);
  }
}
