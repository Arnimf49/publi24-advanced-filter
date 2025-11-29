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

let unknownDomains = [];
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
      unknownDomains = JSON.parse(readFileSync(UNKNOWN_DOMAINS_FILE, 'utf8'));
      // Filter out empty strings
      unknownDomains = unknownDomains.filter(d => d && d.trim());
      console.log(`Loaded ${unknownDomains.length} unknown domains`);
    } else {
      console.error('unknown-domains.json not found!');
      unknownDomains = [];
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
      escortDomains = { general: [] };
      writeFileSync(ESCORT_DOMAINS_FILE, JSON.stringify(escortDomains, null, 2));
    }

  } catch (error) {
    console.error('Error loading files:', error);
  }
}

function getNextDomain() {
  return unknownDomains.find(domain => !processedDomains.has(domain));
}

function extractCountryFromDomain(domain) {
  if (domain.endsWith('.co.uk')) {
    return 'gb';
  }

  // Try to extract country code from TLD
  // First try last 2 chars after last dot (e.g., .fr, .de, .pl, .ro)
  const match = domain.match(/\.([a-z]{2})$/i);
  if (match) {
    const tld = match[1].toLowerCase();
    if (ALL_COUNTRY_CODES.includes(tld)) {
      return tld;
    }
  }

  // Try second-level domain for cases like other compound TLDs
  const multiPartMatch = domain.match(/\.([a-z]{2})\.[a-z]{2,}$/i);
  if (multiPartMatch) {
    const secondLevel = multiPartMatch[1].toLowerCase();
    if (ALL_COUNTRY_CODES.includes(secondLevel)) {
      return secondLevel;
    }
  }

  return null;
}

app.get('/api/domains', (req, res) => {
  const nextDomain = getNextDomain();
  if (!nextDomain) {
    return res.json({ domain: null, remaining: 0, done: true });
  }

  const suggestedCountry = extractCountryFromDomain(nextDomain);

  res.json({
    domain: nextDomain,
    remaining: unknownDomains.length - processedDomains.size,
    countries: ALL_COUNTRY_CODES,
    suggestedCountry,
    done: false
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    remaining: unknownDomains.length - processedDomains.size,
    total: unknownDomains.length,
    processed: processedDomains.size
  });
});

app.post('/api/map-bad', (req, res) => {
  const { domain } = req.body;

  if (!domain || !unknownDomains.includes(domain)) {
    return res.status(400).json({ error: 'Invalid domain' });
  }

  if (!badDomains.includes(domain)) {
    badDomains.push(domain);
    badDomains.sort();
    writeFileSync(BAD_DOMAINS_FILE, JSON.stringify(badDomains, null, 2));
  }

  processedDomains.add(domain);

  res.json({ success: true, remaining: unknownDomains.length - processedDomains.size });
});

app.post('/api/map-escort', (req, res) => {
  const { domain, country } = req.body;

  if (!domain || !unknownDomains.includes(domain)) {
    return res.status(400).json({ error: 'Invalid domain' });
  }

  if (!country || !ALL_COUNTRY_CODES.includes(country)) {
    return res.status(400).json({ error: 'Invalid country code' });
  }

  if (!escortDomains[country]) {
    escortDomains[country] = [];
  }

  if (!escortDomains[country].includes(domain)) {
    escortDomains[country].push(domain);
    escortDomains[country].sort();

    const sortedEscortDomains = Object.keys(escortDomains)
      .sort()
      .reduce((acc, key) => {
        acc[key] = escortDomains[key];
        return acc;
      }, {});

    writeFileSync(ESCORT_DOMAINS_FILE, JSON.stringify(sortedEscortDomains, null, 2));
  }

  processedDomains.add(domain);

  res.json({ success: true, remaining: unknownDomains.length - processedDomains.size });
});

cleanUnknownDomains();
loadFiles();

app.listen(PORT, () => {
  console.log(`Domain mapping server running on http://localhost:${PORT}`);
});
