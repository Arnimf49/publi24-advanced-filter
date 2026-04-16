import dotenv from 'dotenv';

dotenv.config({ override: true });

const getNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return parsed;
};

const getBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (!value) {
    return fallback;
  }

  return value === '1' || value.toLowerCase() === 'true';
};

export const config = {
  port: getNumber(process.env.DOMAIN_MAPPER_PORT, 3001),
  model: process.env.DOMAIN_MAPPER_MODEL ?? 'gpt-4o-mini',
  maxHops: getNumber(process.env.DOMAIN_MAPPER_MAX_HOPS, 12),
  maxToolCalls: getNumber(process.env.DOMAIN_MAPPER_MAX_TOOL_CALLS, 18),
  confidenceThreshold: getNumber(process.env.DOMAIN_MAPPER_CONFIDENCE_THRESHOLD, 70),
  headless: getBoolean(process.env.DOMAIN_MAPPER_HEADLESS, false),
  openAiApiKey: process.env.OPENAI_API_KEY?.trim() ?? '',
  concurrency: getNumber(process.env.DOMAIN_MAPPER_CONCURRENCY, 1),
};
