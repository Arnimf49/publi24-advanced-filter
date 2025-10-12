#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UNKNOWN_DOMAINS_FILE = resolve(__dirname, '..', 'unknown-domains.json');

function createClickableLink(domain) {
  return `https://${domain}`;
}

function main() {
  if (!existsSync(UNKNOWN_DOMAINS_FILE)) {
    writeFileSync(UNKNOWN_DOMAINS_FILE, '[]');
    console.log('No unknown domains found.');
    return;
  }

  let domains;
  try {
    domains = JSON.parse(readFileSync(UNKNOWN_DOMAINS_FILE, 'utf8'));
  } catch (error) {
    console.error('Error reading unknown-domains.json:', error.message);
    return;
  }

  if (!Array.isArray(domains) || domains.length === 0) {
    console.log('No unknown domains found.');
    return;
  }

  domains.sort().forEach((domain, index) => {
    const number = `${index + 1}.`.padStart(4);
    const clickableLink = createClickableLink(domain);
    console.log(`\u001b[90m${number}\u001b[0m \u001b[91m${clickableLink}\u001b[0m`);
  });

  console.log(`\n\u001b[2mTotal: ${domains.length} domains\u001b[0m`);
}

main();
