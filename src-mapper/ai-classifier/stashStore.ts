import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StashedRun, StashListItem } from './types/state.js';

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const STASH_DIR = join(ROOT_DIR, 'stash');
const INDEX_PATH = join(ROOT_DIR, 'stash-index.json');

const domainToSlug = (domain: string): string => domain.replace(/[^a-z0-9.-]/gi, '_');

const ensureDirs = (): void => {
  mkdirSync(STASH_DIR, { recursive: true });
};

const loadIndex = (): StashListItem[] => {
  if (!existsSync(INDEX_PATH)) {
    return [];
  }

  try {
    return JSON.parse(readFileSync(INDEX_PATH, 'utf8')) as StashListItem[];
  } catch (error) {
    console.error('[StashStore] Failed to parse stash index, starting empty:', error);
    return [];
  }
};

const saveIndex = (index: StashListItem[]): void => {
  ensureDirs();
  writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2), 'utf8');
};

let index: StashListItem[] = loadIndex();

const add = (run: StashedRun): void => {
  ensureDirs();

  const slug = domainToSlug(run.domain);
  const runPath = join(STASH_DIR, `${slug}.json`);
  writeFileSync(runPath, JSON.stringify(run, null, 2), 'utf8');

  const item: StashListItem = {
    domain: run.domain,
    source: run.source,
    siteNames: run.siteNames,
    suggestedCountry: run.suggestedCountry,
    proposal: run.proposal,
    stashedAt: run.stashedAt,
  };

  index = [item, ...index.filter((entry) => entry.domain !== run.domain)];
  saveIndex(index);
};

const get = (domain: string): StashedRun | null => {
  const slug = domainToSlug(domain);
  const runPath = join(STASH_DIR, `${slug}.json`);

  if (!existsSync(runPath)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(runPath, 'utf8')) as StashedRun;
  } catch (error) {
    console.error(`[StashStore] Failed to read stashed run for ${domain}:`, error);
    return null;
  }
};

const list = (): StashListItem[] => [...index];

const remove = (domain: string): void => {
  ensureDirs();

  const slug = domainToSlug(domain);
  const runPath = join(STASH_DIR, `${slug}.json`);

  if (existsSync(runPath)) {
    try {
      unlinkSync(runPath);
    } catch (error) {
      console.error(`[StashStore] Failed to delete stash file for ${domain}:`, error);
    }
  }

  index = index.filter((entry) => entry.domain !== domain);
  saveIndex(index);
};

const count = (): number => index.length;

const getDomains = (): Set<string> => new Set(index.map((entry) => entry.domain));

export const stashStore = {
  add,
  get,
  list,
  remove,
  count,
  getDomains,
};
