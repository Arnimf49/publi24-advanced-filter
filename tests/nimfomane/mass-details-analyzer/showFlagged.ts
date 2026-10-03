import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const OUTPUT_DIRECTORY = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'output',
);
const FLAGGED_OUTPUT_PATH = path.join(OUTPUT_DIRECTORY, 'flagged-extractions.json');

interface SourceRecord {
  sourceId?: string;
  text: string;
  extractedPersonalDetails: unknown;
  extractedServiceDetails: unknown;
}

interface ProfileFile {
  sources: SourceRecord[];
}

interface FlaggedExtraction {
  file: string;
  sourceIndex: number;
  reason: string;
}

function parseIndex(value: string | undefined): number {
  const index = value === undefined ? Number.NaN : Number(value);
  if (!Number.isSafeInteger(index) || index < 0) {
    throw new Error('Usage: showFlagged.ts <non-negative flagged index>');
  }

  return index;
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, 'utf8')) as T;
}

function cleanSourceText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function run(): Promise<void> {
  const index = parseIndex(process.argv[2]);
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

  console.log(`Source text:\n${cleanSourceText(source.text)}`);
  if (source.extractedPersonalDetails !== null) {
    console.log(
      `\nExtracted personal details:\n${JSON.stringify(source.extractedPersonalDetails, null, 2)}`,
    );
  }

  if (source.extractedServiceDetails !== null) {
    console.log(
      `\nExtracted service details:\n${JSON.stringify(source.extractedServiceDetails, null, 2)}`,
    );
  }

  console.log(`\nFlagged reason: ${flaggedExtraction.reason}`);
}

export const showFlagged = {
  run,
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  showFlagged.run().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
