import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { cleanUnknownDomains } from './clean-unknown-domains.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const UNKNOWN_DOMAINS_FILE = resolve(__dirname, 'unknown-domains.json');
const BAD_DOMAINS_FILE = resolve(__dirname, 'bad-domains.json');
const ESCORT_DOMAINS_FILE = resolve(__dirname, '..', 'escort-listing-domains.json');

let unknownDomains = {};
let badDomains = [];
let escortDomains = {};
let processedDomains = new Set();

const ALL_COUNTRY_CODES = [
  'general', 'ad', 'ae', 'af', 'ag', 'ai', 'al', 'am', 'ao', 'aq', 'ar', 'as', 'at',
  'au', 'aw', 'ax', 'az', 'ba', 'bb', 'bd', 'be', 'bf', 'bg', 'bh', 'bi', 'bj',
  'bl', 'bm', 'bn', 'bo', 'bq', 'br', 'bs', 'bt', 'bv', 'bw', 'by', 'bz', 'ca',
  'cc', 'cd', 'cf', 'cg', 'ch', 'ci', 'ck', 'cl', 'cm', 'cn', 'co', 'cr', 'cu',
  'cv', 'cw', 'cx', 'cy', 'cz', 'de', 'dj', 'dk', 'dm', 'do', 'dz', 'ec', 'ee',
  'eg', 'eh', 'er', 'es', 'et', 'fi', 'fj', 'fk', 'fm', 'fo', 'fr', 'ga', 'gb',
  'gd', 'ge', 'gf', 'gg', 'gh', 'gi', 'gl', 'gm', 'gn', 'gp', 'gq', 'gr', 'gs',
  'gt', 'gu', 'gw', 'gy', 'hk', 'hm', 'hn', 'hr', 'ht', 'hu', 'id', 'ie', 'il',
  'im', 'in', 'io', 'iq', 'ir', 'is', 'it', 'je', 'jm', 'jo', 'jp', 'ke', 'kg',
  'kh', 'ki', 'km', 'kn', 'kp', 'kr', 'kw', 'ky', 'kz', 'la', 'lb', 'lc', 'li',
  'lk', 'lr', 'ls', 'lt', 'lu', 'lv', 'ly', 'ma', 'mc', 'md', 'me', 'mf', 'mg',
  'mh', 'mk', 'ml', 'mm', 'mn', 'mo', 'mp', 'mq', 'mr', 'ms', 'mt', 'mu', 'mv',
  'mw', 'mx', 'my', 'mz', 'na', 'nc', 'ne', 'nf', 'ng', 'ni', 'nl', 'no', 'np',
  'nr', 'nu', 'nz', 'om', 'pa', 'pe', 'pf', 'pg', 'ph', 'pk', 'pl', 'pm', 'pn',
  'pr', 'ps', 'pt', 'pw', 'py', 'qa', 're', 'ro', 'rs', 'ru', 'rw', 'sa', 'sb',
  'sc', 'sd', 'se', 'sg', 'sh', 'si', 'sj', 'sk', 'sl', 'sm', 'sn', 'so', 'sr',
  'ss', 'st', 'sv', 'sx', 'sy', 'sz', 'tc', 'td', 'tf', 'tg', 'th', 'tj', 'tk',
  'tl', 'tm', 'tn', 'to', 'tr', 'tt', 'tv', 'tw', 'tz', 'ua', 'ug', 'um', 'us',
  'uy', 'uz', 'va', 'vc', 've', 'vg', 'vi', 'vn', 'vu', 'wf', 'ws', 'ye', 'yt',
  'za', 'zm', 'zw'
];

function loadFiles() {
  try {
    if (existsSync(UNKNOWN_DOMAINS_FILE)) {
      const raw = JSON.parse(readFileSync(UNKNOWN_DOMAINS_FILE, 'utf8'));
      unknownDomains = typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
      console.log(`Loaded ${Object.keys(unknownDomains).length} unknown domains`);
    } else {
      console.error('unknown-domains.json not found!');
      unknownDomains = {};
    }

    if (existsSync(BAD_DOMAINS_FILE)) {
      badDomains = JSON.parse(readFileSync(BAD_DOMAINS_FILE, 'utf8'));
    } else {
      badDomains = [];
      writeFileSync(BAD_DOMAINS_FILE, JSON.stringify([], null, 2));
    }

    if (existsSync(ESCORT_DOMAINS_FILE)) {
      escortDomains = JSON.parse(readFileSync(ESCORT_DOMAINS_FILE, 'utf8'));
    } else {
      escortDomains = [];
      writeFileSync(ESCORT_DOMAINS_FILE, JSON.stringify(escortDomains, null, 2));
    }

  } catch (error) {
    console.error('Error loading files:', error);
  }
}

function getNextDomain() {
  const domain = Object.keys(unknownDomains).find(d => !processedDomains.has(d));
  if (!domain) return null;
  return { domain, ...unknownDomains[domain] };
}

function remainingCount() {
  return Object.keys(unknownDomains).filter(d => !processedDomains.has(d)).length;
}

function extractCountryFromDomain(domain) {
  if (domain.endsWith('.co.uk')) {
    return 'gb';
  }

  const match = domain.match(/\.([a-z]{2})$/i);
  if (match) {
    const tld = match[1].toLowerCase();
    if (ALL_COUNTRY_CODES.includes(tld)) {
      return tld;
    }
  }

  const multiPartMatch = domain.match(/\.([a-z]{2})\.[a-z]{2,}$/i);
  if (multiPartMatch) {
    const secondLevel = multiPartMatch[1].toLowerCase();
    if (ALL_COUNTRY_CODES.includes(secondLevel)) {
      return secondLevel;
    }
  }

  return null;
}

function saveEscortDomains() {
  const sorted = [...escortDomains].sort((a, b) => a.country.localeCompare(b.country) || a.domain.localeCompare(b.domain));
  writeFileSync(ESCORT_DOMAINS_FILE, JSON.stringify(sorted, null, 2) + '\n');
}

app.get('/api/domains', (req, res) => {
  const next = getNextDomain();
  if (!next) {
    return res.json({ domain: null, remaining: 0, done: true });
  }

  const suggestedCountry = extractCountryFromDomain(next.domain);

  res.json({
    domain: next.domain,
    siteNames: next.siteNames,
    source: next.source,
    remaining: remainingCount(),
    countries: ALL_COUNTRY_CODES,
    suggestedCountry,
    done: false
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    remaining: remainingCount(),
    total: Object.keys(unknownDomains).length,
    processed: processedDomains.size
  });
});

app.post('/api/map-bad', (req, res) => {
  const { domain } = req.body;

  if (!domain || !unknownDomains[domain]) {
    return res.status(400).json({ error: 'Invalid domain' });
  }

  if (!badDomains.includes(domain)) {
    badDomains.push(domain);
    badDomains.sort((a, b) => a.localeCompare(b));
    writeFileSync(BAD_DOMAINS_FILE, JSON.stringify(badDomains, null, 2) + '\n');
  }

  processedDomains.add(domain);

  res.json({ success: true, remaining: remainingCount() });
});

app.post('/api/map-escort', (req, res) => {
  const { domain, country } = req.body;

  const unknownEntry = unknownDomains[domain];
  if (!domain || !unknownEntry) {
    return res.status(400).json({ error: 'Invalid domain' });
  }

  if (!country || !ALL_COUNTRY_CODES.includes(country)) {
    return res.status(400).json({ error: 'Invalid country code' });
  }

  const existing = escortDomains.find(e => e.domain === domain);
  if (existing) {
    existing.siteNames = [...new Set([...existing.siteNames, ...unknownEntry.siteNames])];
  } else {
    escortDomains.push({ country, domain, siteNames: unknownEntry.siteNames });
  }

  saveEscortDomains();
  processedDomains.add(domain);

  res.json({ success: true, remaining: remainingCount() });
});

cleanUnknownDomains();
loadFiles();

app.listen(PORT, () => {
  console.log(`Domain mapping server running on http://localhost:${PORT}`);
});
