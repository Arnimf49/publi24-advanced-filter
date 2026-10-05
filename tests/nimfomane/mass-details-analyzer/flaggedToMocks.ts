import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const OUTPUT_DIRECTORY = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'output',
);
const FLAGGED_OUTPUT_PATH = path.join(OUTPUT_DIRECTORY, 'flagged-extractions.json');
const MOCKS_DIRECTORY = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'mocks');

type MockKind = 'personal' | 'service';

interface FlaggedExtraction {
  file: string;
  sourceIndex: number;
  sourceId?: string;
}

interface SourceRecord {
  sourceId?: string;
  text: string;
}

interface ProfileFile {
  sources: SourceRecord[];
}

function parseArguments(args: string[]): {
  index: number;
  kind: MockKind;
  falsePositive: boolean;
} {
  const index = Number(args[0]);
  const kindIndex = args.indexOf('--kind');
  const kind = args[kindIndex + 1];
  const falsePositiveIndex = args.indexOf('--false-positive');
  const falsePositive = args[falsePositiveIndex + 1];

  if (!Number.isSafeInteger(index) || index < 0
    || (kind !== 'personal' && kind !== 'service')
    || (falsePositive !== 'true' && falsePositive !== 'false')) {
    throw new Error(
      'Usage: flaggedToMocks.ts <flagged-index> --kind personal|service --false-positive true|false',
    );
  }

  return {index, kind, falsePositive: falsePositive === 'true'};
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, 'utf8')) as T;
}

async function nextMockNumber(directory: string, prefix: string): Promise<number> {
  const entries = await fs.readdir(directory);
  const numbers = entries.flatMap(entry => {
    const match = new RegExp(`^${prefix}(\\d+)\\.txt$`).exec(entry);
    return match ? [Number.parseInt(match[1], 10)] : [];
  });

  return numbers.length ? Math.max(...numbers) + 1 : 1;
}

function normalizeMockText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

async function findExistingMocks(directory: string, text: string): Promise<string[]> {
  const normalizedText = normalizeMockText(text);
  const entries = await fs.readdir(directory, {withFileTypes: true});
  const matches: string[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.txt')) {
      continue;
    }

    const existingText = await fs.readFile(path.join(directory, entry.name), 'utf8');
    if (normalizeMockText(existingText) === normalizedText) {
      matches.push(entry.name);
    }
  }

  return matches.sort();
}

async function run(): Promise<void> {
  const {index, kind, falsePositive} = parseArguments(process.argv.slice(2));
  const flagged = await readJson<FlaggedExtraction[]>(FLAGGED_OUTPUT_PATH);
  const flaggedExtraction = flagged[index];

  if (!flaggedExtraction) {
    throw new Error(`No flagged extraction exists at index ${index}.`);
  }

  const profilePath = path.join(OUTPUT_DIRECTORY, flaggedExtraction.file);
  const profile = await readJson<ProfileFile>(profilePath);
  const source = profile.sources.find(candidate =>
    candidate.sourceId === flaggedExtraction.sourceId,
  ) ?? profile.sources[flaggedExtraction.sourceIndex];

  if (!source) {
    throw new Error(
      `Source index ${flaggedExtraction.sourceIndex} does not exist in ${flaggedExtraction.file}.`,
    );
  }

  const directory = path.join(
    MOCKS_DIRECTORY,
    kind === 'personal' ? 'personal-details-texts' : 'service-texts',
  );
  const existingMocks = await findExistingMocks(directory, source.text);

  if (existingMocks.length > 0) {
    throw new Error(
      `Mock already exists in ${path.basename(directory)}: ${existingMocks.join(', ')}`,
    );
  }

  const prefix = falsePositive ? 'false-sample' : 'sample';
  const fileName = `${prefix}${await nextMockNumber(directory, prefix)}.txt`;
  await fs.writeFile(path.join(directory, fileName), `${source.text.trim()}\n`, 'utf8');

  console.log(fileName);
}

export const flaggedToMocks = {
  run,
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  flaggedToMocks.run().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
