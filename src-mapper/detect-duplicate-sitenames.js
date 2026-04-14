#!/usr/bin/env node

import data from '../escort-listing-domains.json' with { type: 'json' };

const siteNameToDomains = new Map();

for (const entry of data) {
  for (const name of entry.siteNames) {
    const normalized = name.toLowerCase();
    if (!siteNameToDomains.has(normalized)) {
      siteNameToDomains.set(normalized, []);
    }
    siteNameToDomains.get(normalized).push({ domain: entry.domain, country: entry.country, original: name });
  }
}

const duplicates = [...siteNameToDomains.entries()].filter(([, domains]) => {
  if (domains.length < 2) {
    return false;
  }

  const countries = new Set(domains.map((d) => d.country));
  return countries.size > 1;
});

if (duplicates.length === 0) {
  console.log('No duplicate site names found.');
  process.exit(0);
}

duplicates.sort(([a], [b]) => a.localeCompare(b));

for (const [name, domains] of duplicates) {
  console.log(`\n"${domains[0].original}" (${domains.length} domains):`);
  for (const { domain, country } of domains) {
    console.log(`  - [${country}] ${domain}`);
  }
}

console.log(`\nTotal duplicate site names: ${duplicates.length}`);
