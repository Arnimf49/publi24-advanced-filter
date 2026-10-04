import dotenv from 'dotenv';
import OpenAI from 'openai';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {flaggerPrompt} from './flaggerPrompt';

dotenv.config({override: true});

const MODEL = 'gpt-5.6-luna';
const REQUEST_CONCURRENCY = 10;
const OUTPUT_DIRECTORY = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'output',
);
const FLAGGED_OUTPUT_PATH = path.join(OUTPUT_DIRECTORY, 'flagged-extractions.json');
const CACHE_OUTPUT_PATH = path.join(OUTPUT_DIRECTORY, 'flagger-cache.json');

interface SourceRecord extends Record<string, unknown> {
  sourceId?: string;
  url: string;
  kind: string;
  text: string;
}

interface ProfileFile {
  profileName: string;
  profileUrl: string;
  sources: SourceRecord[];
}

interface SourceTask {
  profileName: string;
  profileUrl: string;
  file: string;
  sourceIndex: number;
  source: SourceRecord;
  sourceId: string;
}

interface FlaggedExtraction {
  profileName: string;
  profileUrl: string;
  sourceId: string;
  file: string;
  sourceIndex: number;
  sourceKind: string;
  reason: string;
}

interface AnalysisResult {
  flagged: boolean;
  reason: string;
}

interface CacheRecord {
  sourceId: string;
  inputHash: string;
  flagged: boolean;
  reason: string;
}

interface CacheFile {
  records: CacheRecord[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseProfileFile(value: unknown, filePath: string): ProfileFile {
  if (
    !isRecord(value)
    || typeof value.profileName !== 'string'
    || typeof value.profileUrl !== 'string'
    || !Array.isArray(value.sources)
  ) {
    throw new Error(`Invalid profile file format: ${filePath}`);
  }

  const sources = value.sources.map((source, index) => {
    if (
      !isRecord(source)
      || typeof source.url !== 'string'
      || typeof source.kind !== 'string'
      || typeof source.text !== 'string'
      || (source.sourceId !== undefined && typeof source.sourceId !== 'string')
    ) {
      throw new Error(`Invalid source at index ${index} in ${filePath}`);
    }
    return source as SourceRecord;
  });

  return {
    profileName: value.profileName,
    profileUrl: value.profileUrl,
    sources,
  };
}

function getSourceId(source: SourceRecord): string {
  if (source.sourceId) {
    return source.sourceId;
  }

  const sourceUrl = new URL(source.url);
  sourceUrl.searchParams.delete('csrfKey');
  sourceUrl.hash = '';

  return createHash('sha256')
    .update(`${source.kind}\n${sourceUrl.toString()}`)
    .digest('hex')
    .slice(0, 16);
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(item => stableSerialize(item)).join(',')}]`;
  }
  if (isRecord(value)) {
    return `{${Object.keys(value).sort().map(key =>
      `${JSON.stringify(key)}:${stableSerialize(value[key])}`,
    ).join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

function getInputHash(source: SourceRecord): string {
  return createHash('sha256')
    .update(stableSerialize({
      text: source.text,
      extractedPersonalDetails: source.extractedPersonalDetails,
      extractedServiceDetails: source.extractedServiceDetails,
    }))
    .digest('hex');
}

async function loadCache(): Promise<Map<string, CacheRecord>> {
  try {
    const parsed: unknown = JSON.parse(await fs.readFile(CACHE_OUTPUT_PATH, 'utf8'));
    if (!isRecord(parsed) || !Array.isArray(parsed.records)) {
      throw new Error(`Invalid flagger cache format: ${CACHE_OUTPUT_PATH}`);
    }

    const records = parsed.records.map((record, index) => {
      if (
        !isRecord(record)
        || typeof record.sourceId !== 'string'
        || typeof record.inputHash !== 'string'
        || typeof record.flagged !== 'boolean'
        || typeof record.reason !== 'string'
      ) {
        throw new Error(`Invalid flagger cache record at index ${index}.`);
      }
      return record as unknown as CacheRecord;
    });
    return new Map(records.map(record => [record.sourceId, record]));
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return new Map();
    }
    throw error;
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

async function loadSourceTasks(): Promise<SourceTask[]> {
  const entries = await fs.readdir(OUTPUT_DIRECTORY, {withFileTypes: true});
  const profileFiles = entries
    .filter(entry =>
      entry.isFile()
      && entry.name.endsWith('.json')
      && entry.name !== path.basename(FLAGGED_OUTPUT_PATH)
      && entry.name !== path.basename(CACHE_OUTPUT_PATH)
    )
    .map(entry => entry.name)
    .sort();
  const tasks: SourceTask[] = [];

  for (const fileName of profileFiles) {
    const filePath = path.join(OUTPUT_DIRECTORY, fileName);
    const profile = parseProfileFile(
      JSON.parse(await fs.readFile(filePath, 'utf8')) as unknown,
      filePath,
    );
    for (const [sourceIndex, source] of profile.sources.entries()) {
      tasks.push({
        profileName: profile.profileName,
        profileUrl: profile.profileUrl,
        file: fileName,
        sourceIndex,
        source,
        sourceId: getSourceId(source),
      });
    }
  }

  return tasks;
}

function parseAnalysisResult(content: string | null): AnalysisResult {
  if (!content) {
    throw new Error('OpenAI returned an empty analysis response.');
  }

  const result: unknown = JSON.parse(content);
  if (
    !isRecord(result)
    || typeof result.flagged !== 'boolean'
    || typeof result.reason !== 'string'
  ) {
    throw new Error('OpenAI returned an invalid analysis response.');
  }

  if (result.flagged && !result.reason.trim()) {
    throw new Error('OpenAI flagged a source without providing a reason.');
  }

  return {
    flagged: result.flagged,
    reason: result.reason.trim(),
  };
}

async function analyzeSource(client: OpenAI, task: SourceTask): Promise<AnalysisResult> {
  const completion = await client.chat.completions.create({
    model: MODEL,
    reasoning_effort: 'low',
    ...(MODEL.startsWith('gpt-5') ? {} : {temperature: 0}),
    response_format: {type: 'json_object'},
    messages: [
      {
        role: 'system',
        content: flaggerPrompt.getSystemPrompt(),
      },
      {
        role: 'user',
        content: JSON.stringify({
          profileName: task.profileName,
          profileUrl: task.profileUrl,
          source: task.source,
        }),
      },
    ],
  });

  const result = parseAnalysisResult(completion.choices[0]?.message.content ?? null);
  return result;
}

function getNoCache(args: string[]): boolean {
  for (const arg of args) {
    if (arg !== '--no-cache') {
      throw new Error(`Unknown argument: ${arg}. Usage: flagger.ts [--no-cache]`);
    }
  }
  return args.includes('--no-cache');
}

async function run(noCache = getNoCache(process.argv.slice(2))): Promise<void> {
  if (noCache) {
    await fs.rm(CACHE_OUTPUT_PATH, {force: true});
    console.info(`Deleted flagger cache at ${CACHE_OUTPUT_PATH}.`);
    return;
  }

  const tasks = await loadSourceTasks();
  const cache = await loadCache();
  const analyses: AnalysisResult[] = new Array(tasks.length);
  const tasksToAnalyze = tasks.filter(task => {
    const cached = cache.get(task.sourceId);
    return !cached || cached.inputHash !== getInputHash(task.source);
  });

  let client: OpenAI | undefined;
  if (tasksToAnalyze.length > 0) {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured.');
    }
    client = new OpenAI({apiKey});
  }

  let nextTask = 0;

  console.info(
    `Analyzing ${tasks.length} sources with ${MODEL}; `
    + `${tasks.length - tasksToAnalyze.length} cached, ${tasksToAnalyze.length} to analyze`
    + '.',
  );

  const getFlagged = (): FlaggedExtraction[] => analyses.flatMap((result, index): FlaggedExtraction[] =>
    result.flagged
      ? [{
          profileName: tasks[index].profileName,
          profileUrl: tasks[index].profileUrl,
          sourceId: tasks[index].sourceId,
          file: tasks[index].file,
          sourceIndex: tasks[index].sourceIndex,
          sourceKind: tasks[index].source.kind,
          reason: result.reason,
        }]
      : []);
  const writeResults = async (): Promise<void> => {
    await fs.writeFile(
      CACHE_OUTPUT_PATH,
      `${JSON.stringify({records: [...cache.values()]}, null, 2)}\n`,
      'utf8',
    );
    const flagged = getFlagged();
    await fs.writeFile(FLAGGED_OUTPUT_PATH, `${JSON.stringify(flagged, null, 2)}\n`, 'utf8');
    console.info(`Saved ${flagged.length} flagged sources to ${FLAGGED_OUTPUT_PATH}.`);
  };
  let saveQueue: Promise<void> = Promise.resolve();
  const saveProgress = async (): Promise<void> => {
    const pendingSave = saveQueue.then(writeResults);
    saveQueue = pendingSave;
    await pendingSave;
  };

  await Promise.all(
    Array.from({length: Math.min(REQUEST_CONCURRENCY, tasks.length)}, async () => {
      while (nextTask < tasks.length) {
        const index = nextTask++;
        const task = tasks[index];
        const inputHash = getInputHash(task.source);
        const cached = cache.get(task.sourceId);
        const isCached = cached?.inputHash === inputHash;
        if (isCached) {
          analyses[index] = {flagged: cached.flagged, reason: cached.reason};
        } else {
          if (!client) {
            throw new Error('OpenAI client was not initialized for an uncached source.');
          }
          analyses[index] = await analyzeSource(client, task);
          cache.set(task.sourceId, {
            sourceId: task.sourceId,
            inputHash,
            ...analyses[index],
          });
          await saveProgress();
        }
        console.info(`${isCached ? 'Used cached result for' : 'Analyzed'} ${index + 1}/${tasks.length} sources.`);
      }
    }),
  );

  await saveProgress();
}

export const flagger = {
  run,
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  flagger.run().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
