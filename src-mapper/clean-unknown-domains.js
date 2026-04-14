#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const UNKNOWN_DOMAINS_FILE = resolve(__dirname, 'unknown-domains.json');
const BAD_DOMAINS_FILE = resolve(__dirname, 'bad-domains.json');
const ESCORT_DOMAINS_FILE = resolve(__dirname, '..', 'escort-listing-domains.json');

function loadJSON(filepath, defaultValue = []) {
  if (!existsSync(filepath)) {
    console.log(`⚠️  File not found: ${filepath}`);
    return defaultValue;
  }

  try {
    return JSON.parse(readFileSync(filepath, 'utf8'));
  } catch (error) {
    console.error(`❌ Error reading ${filepath}:`, error.message);
    return defaultValue;
  }
}

export function cleanUnknownDomains() {
  console.log('🧹 Cleaning unknown domains...\n');

  let unknownDomains = loadJSON(UNKNOWN_DOMAINS_FILE, {});
  const badDomains = loadJSON(BAD_DOMAINS_FILE, []);
  const escortDomains = loadJSON(ESCORT_DOMAINS_FILE, []);

  const initialCount = Object.keys(unknownDomains).length;
  console.log(`📊 Initial count: ${initialCount} domains`);

  const allEscortDomains = escortDomains.map(e => e.domain);
  const allBadDomains = badDomains;
  console.log(`📋 Found ${allBadDomains.length} bad domains`);
  console.log(`📋 Found ${allEscortDomains.length} escort listing domains`);

  for (const domain of [...allBadDomains, ...allEscortDomains]) {
    delete unknownDomains[domain];
  }

  const classifiedRemoved = initialCount - Object.keys(unknownDomains).length;
  if (classifiedRemoved > 0) {
    console.log(`✂️  Removed ${classifiedRemoved} already classified domains`);
  }

  const sorted = Object.fromEntries(
    Object.entries(unknownDomains).sort(([a], [b]) => a.localeCompare(b))
  );

  writeFileSync(UNKNOWN_DOMAINS_FILE, JSON.stringify(sorted, null, 2));

  const finalCount = Object.keys(sorted).length;
  console.log(`\n✅ Cleanup complete!`);
  console.log(`📊 Final count: ${finalCount} domains`);
  console.log(`🗑️  Total removed: ${initialCount - finalCount} domains\n`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanUnknownDomains();
}
