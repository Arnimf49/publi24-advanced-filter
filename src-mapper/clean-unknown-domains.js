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

  // Load all files
  let unknownDomains = loadJSON(UNKNOWN_DOMAINS_FILE, []);
  const badDomains = loadJSON(BAD_DOMAINS_FILE, []);
  const escortDomains = loadJSON(ESCORT_DOMAINS_FILE, {});

  const initialCount = unknownDomains.length;
  console.log(`📊 Initial count: ${initialCount} domains`);

  // Remove duplicates and empty strings
  const uniqueDomains = [...new Set(unknownDomains)].filter(d => d && d.trim());
  const duplicatesRemoved = initialCount - uniqueDomains.length;
  if (duplicatesRemoved > 0) {
    console.log(`🔄 Removed ${duplicatesRemoved} duplicates/empty entries`);
  }

  // Get all escort listing domains
  const allEscortDomains = Object.values(escortDomains).flat();
  console.log(`📋 Found ${badDomains.length} bad domains`);
  console.log(`📋 Found ${allEscortDomains.length} escort listing domains`);

  // Filter out classified domains
  const beforeFilterCount = uniqueDomains.length;
  unknownDomains = uniqueDomains.filter(
    domain => !badDomains.includes(domain) && !allEscortDomains.includes(domain)
  );
  const classifiedRemoved = beforeFilterCount - unknownDomains.length;

  if (classifiedRemoved > 0) {
    console.log(`✂️  Removed ${classifiedRemoved} already classified domains`);
  }

  // Sort domains
  unknownDomains.sort();

  // Save cleaned file
  writeFileSync(UNKNOWN_DOMAINS_FILE, JSON.stringify(unknownDomains, null, 2));

  console.log(`\n✅ Cleanup complete!`);
  console.log(`📊 Final count: ${unknownDomains.length} domains`);
  console.log(`🗑️  Total removed: ${initialCount - unknownDomains.length} domains\n`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanUnknownDomains();
}
