import { randomUUID } from 'crypto';
import type OpenAI from 'openai';
import { loadPrompt } from '../../prompts/loadPrompt.js';
import type { AgentEvent } from '../../types/agent.js';
import type { PageSummary } from '../../types/browser.js';
import type { EscortDomainEntry } from '../../types/tools.js';

export type TriageResult = {
  isDefinitelyNotEscortListing: boolean;
  confidence: number;
  reasoning: string;
  /** When set, triage wants to emit a review verdict immediately without running the main agent. */
  directReview?: string;
  /** When set, triageBad is confident this is a BAD domain — emit BAD without running main agent. */
  directBad?: string;
  /** When set, triageGood confirmed escort + has country — emit escort verdict directly without main agent. */
  directEscort?: { country: string; reasoning: string };
};

type EventCallback = (event: AgentEvent, page?: PageSummary) => void;

const createEvent = (
  type: AgentEvent['type'],
  message: string,
  state: AgentEvent['state'] = 'done',
  id = randomUUID(),
  tokenUsage?: AgentEvent['tokenUsage'],
  startedAt?: string,
): AgentEvent => ({
  id,
  state,
  type,
  message,
  createdAt: startedAt ?? new Date().toISOString(),
  completedAt: startedAt ? new Date().toISOString() : undefined,
  tokenUsage,
});

const isAccessGatePage = (pageSnapshot: PageSummary): boolean => {
  const combined = `${pageSnapshot.title} ${pageSnapshot.structuredText.slice(0, 1500)}`;
  return /cloudflare|checking your browser|ddos.guard|security.verif|bot.protect|human.verif|just a moment|access.denied|enable.javascript.*continue|verif.*you.*human/i.test(combined);
};

const STRONG_SIBLING_BAD_THRESHOLD = 5;

const buildSiblingBadSection = (siblingBadDomains: string[]): string => {
  if (siblingBadDomains.length === 0) {
    return '';
  }

  const isStrongPattern = siblingBadDomains.length >= STRONG_SIBLING_BAD_THRESHOLD;

  if (isStrongPattern) {
    return `**Sibling Subdomain Signal — STRONG BAD PATTERN (${siblingBadDomains.length} sibling subdomains):**
The following subdomains of the same root domain are classified as BAD or queued for review:
${siblingBadDomains.slice(0, 10).map((d) => `- ${d}`).join('\n')}${siblingBadDomains.length > 10 ? `\n- ... and ${siblingBadDomains.length - 10} more` : ''}
IMPORTANT: This root domain has a well-established BAD pattern with ${siblingBadDomains.length} sibling subdomains. Set siblingBadVerdict to "bad" unless the current page contains unmistakable real escort listing content (actual named profiles with descriptions, services, rates, and contact details). Thin pages, doorway pages, generic adult text, or ambiguous content should be classified "bad" given this strong pattern.`;
  }

  return `**Sibling Subdomain Signal — BAD:**
The following subdomains of the same root domain are classified as BAD or share the same root domain pattern:
${siblingBadDomains.map((d) => `- ${d}`).join('\n')}
These are distinct sub-sites under the same root — not country/locale selectors. Use the siblingBadVerdict field to indicate whether this site fits the same BAD pattern.`;
};

/**
 * Main triage (merged with triageBad): determines if site is definitely not escort,
 * and when sibling bad domains are present, also evaluates the bad signal in the same call.
 */
const runMain = async (
  client: OpenAI,
  model: string,
  pageSnapshot: PageSummary,
  onEvent: EventCallback,
  siblingBadDomains: string[],
): Promise<{ isDefinitelyNotEscortListing: boolean; confidence: number; reasoning: string; siblingBadVerdict: 'bad' | 'review' | 'none' }> => {
  const phoneList = pageSnapshot.phoneNumbers.length > 0 ? pageSnapshot.phoneNumbers.join(', ') : '(none)';
  const siblingBadDomainsSection = buildSiblingBadSection(siblingBadDomains);

  const prompt = loadPrompt('triagePromptBad.md')
    .replace('{{pageUrl}}', pageSnapshot.url)
    .replace('{{pageTitle}}', pageSnapshot.title || '(none)')
    .replace('{{accessibilityText}}', '')
    .replace('{{structuredText}}', pageSnapshot.structuredText.slice(0, 2000))
    .replace('{{phoneNumbers}}', phoneList)
    .replace('{{siblingBadDomainsSection}}', siblingBadDomainsSection);

  const triageEventId = randomUUID();
  const triageStartedAt = new Date().toISOString();
  onEvent(createEvent('ai', 'Running triage (bad) assessment', 'running', triageEventId));

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'Return strict JSON only. No markdown. No prose outside JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'triage_result',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              isDefinitelyNotEscortListing: { type: 'boolean' },
              confidence: { type: 'number' },
              reasoning: { type: 'string' },
              siblingBadVerdict: { type: 'string', enum: ['bad', 'review', 'none'] },
            },
            required: ['isDefinitelyNotEscortListing', 'confidence', 'reasoning', 'siblingBadVerdict'],
            additionalProperties: false,
          },
        },
      },
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content;
    const parsed = content ? JSON.parse(content) : null;

    if (!parsed || typeof parsed.isDefinitelyNotEscortListing !== 'boolean' || typeof parsed.confidence !== 'number') {
      onEvent(createEvent('error', 'Triage returned invalid result', 'failed', triageEventId));
      return { isDefinitelyNotEscortListing: false, confidence: 0, reasoning: 'Triage failed to return valid result', siblingBadVerdict: 'none' };
    }

    const usage = completion.usage;
    const isAccessGate = /cloudflare|security.verif|bot.protect|captcha|ddos.protect|access.denied|checking.your.browser|human.verif|just.a.moment/i.test(parsed.reasoning || '');
    const result = {
      isDefinitelyNotEscortListing: isAccessGate ? false : parsed.isDefinitelyNotEscortListing,
      confidence: isAccessGate ? 0 : parsed.confidence,
      reasoning: isAccessGate ? `Access gate detected — passing to main agent for deeper analysis. Original triage reasoning: ${parsed.reasoning}` : (parsed.reasoning || ''),
      siblingBadVerdict: (isAccessGate ? 'none' : (parsed.siblingBadVerdict ?? 'none')) as 'bad' | 'review' | 'none',
    };

    const label = siblingBadDomains.length > 0 ? '[triageBad] ' : '';
    if (usage) {
      onEvent(
        createEvent('ai', `${label}${result.reasoning}`, 'done', triageEventId, {
          scope: 'main',
          input: usage.prompt_tokens,
          cachedInput: usage.prompt_tokens_details?.cached_tokens ?? 0,
          output: usage.completion_tokens,
          total: usage.total_tokens,
        }, triageStartedAt),
      );
    }

    return result;
  } catch (error) {
    onEvent(createEvent('error', `Triage failed: ${error}`, 'failed', triageEventId, undefined, triageStartedAt));
    return { isDefinitelyNotEscortListing: false, confidence: 0, reasoning: 'Triage call failed', siblingBadVerdict: 'none' };
  }
};

/**
 * triageGood: runs only when sibling escort domains exist.
 * Can only confirm escort classification or say "not applicable" — never BAD.
 * AI determines country from page URL and content.
 */
const runGood = async (
  client: OpenAI,
  model: string,
  pageSnapshot: PageSummary,
  onEvent: EventCallback,
  siblingEscortDomains: EscortDomainEntry[],
): Promise<{ isConfirmedEscort: boolean; country: string; reasoning: string }> => {
  const siblingList = siblingEscortDomains.map((e) => `- ${e.domain} [country: ${e.country}]`).join('\n');

  const prompt = loadPrompt('triageGoodPrompt.md')
    .replace('{{pageUrl}}', pageSnapshot.url)
    .replace('{{pageTitle}}', pageSnapshot.title || '(none)')
    .replace('{{accessibilityText}}', '')
    .replace('{{structuredText}}', pageSnapshot.structuredText)
    .replace('{{siblingEscortDomains}}', siblingList);

  const eventId = randomUUID();
  const startedAt = new Date().toISOString();
  onEvent(createEvent('ai', 'Running sibling-escort triage', 'running', eventId));

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'Return strict JSON only. No markdown. No prose outside JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'triage_good_result',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              isConfirmedEscort: { type: 'boolean' },
              country: { type: 'string' },
              reasoning: { type: 'string' },
            },
            required: ['isConfirmedEscort', 'country', 'reasoning'],
            additionalProperties: false,
          },
        },
      },
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content;
    const parsed = content ? JSON.parse(content) : null;

    if (!parsed || typeof parsed.isConfirmedEscort !== 'boolean') {
      onEvent(createEvent('error', 'triageGood returned invalid result', 'failed', eventId));
      return { isConfirmedEscort: false, country: 'general', reasoning: 'triageGood failed to return valid result' };
    }

    const usage = completion.usage;
    if (usage) {
      onEvent(
        createEvent('ai', `[triageGood] ${parsed.reasoning}`, 'done', eventId, {
          scope: 'main',
          input: usage.prompt_tokens,
          cachedInput: usage.prompt_tokens_details?.cached_tokens ?? 0,
          output: usage.completion_tokens,
          total: usage.total_tokens,
        }, startedAt),
      );
    }

    return {
      isConfirmedEscort: parsed.isConfirmedEscort,
      country: parsed.country || 'general',
      reasoning: parsed.reasoning,
    };
  } catch (error) {
    onEvent(createEvent('error', `triageGood failed: ${error}`, 'failed', eventId, undefined, startedAt));
    return { isConfirmedEscort: false, country: 'general', reasoning: 'triageGood call failed' };
  }
};

const run = async (
  client: OpenAI,
  model: string,
  pageSnapshot: PageSummary,
  onEvent: EventCallback,
  siblingBadDomains: string[] = [],
  siblingEscortDomains: EscortDomainEntry[] = [],
): Promise<TriageResult> => {
  if (isAccessGatePage(pageSnapshot)) {
    const reason = 'Initial page is blocked by an access gate (Cloudflare / bot-protection / security verification) — cannot assess site content.';
    onEvent(createEvent('ai', reason));
    return { isDefinitelyNotEscortListing: false, confidence: 0, reasoning: reason, directReview: reason };
  }

  const mainResult = await runMain(client, model, pageSnapshot, onEvent, siblingBadDomains);

  // siblingBadVerdict takes priority: direct bad/review outcomes skip the main agent
  if (mainResult.siblingBadVerdict === 'bad') {
    return {
      isDefinitelyNotEscortListing: false,
      confidence: 0,
      reasoning: mainResult.reasoning,
      directBad: mainResult.reasoning,
    };
  }

  if (mainResult.siblingBadVerdict === 'review') {
    return {
      isDefinitelyNotEscortListing: false,
      confidence: 0,
      reasoning: mainResult.reasoning,
      directReview: mainResult.reasoning,
    };
  }

  if (mainResult.isDefinitelyNotEscortListing) {
    return { isDefinitelyNotEscortListing: true, confidence: mainResult.confidence, reasoning: mainResult.reasoning };
  }

  // triageGood: only runs when escort sibling data is present
  if (siblingEscortDomains.length > 0) {
    const goodResult = await runGood(client, model, pageSnapshot, onEvent, siblingEscortDomains);

    if (goodResult.isConfirmedEscort && goodResult.country) {
      return {
        isDefinitelyNotEscortListing: false,
        confidence: 0,
        reasoning: goodResult.reasoning,
        directEscort: { country: goodResult.country, reasoning: goodResult.reasoning },
      };
    }
  }

  return { isDefinitelyNotEscortListing: mainResult.isDefinitelyNotEscortListing, confidence: mainResult.confidence, reasoning: mainResult.reasoning };
};

export const triage = {
  run,
};


