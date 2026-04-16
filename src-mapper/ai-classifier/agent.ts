import OpenAI from 'openai';
import { config } from './config.js';
import { mainAgent } from './core/agent/MainAgent.js';
import type { BrowserSession } from './browser/BrowserSession.js';
import type { AgentEvent } from './types/agent.js';
import type { AgentRunResult, EscortDomainEntry } from './types/tools.js';
import type { DomainCandidate } from './types/tools.js';
import type { PageSummary } from './types/browser.js';

/**
 * Entry point for domain classification agent.
 * Delegates to MainAgent class for actual execution.
 */
const run = async (
  candidate: DomainCandidate,
  browserSession: BrowserSession,
  onEvent: (event: AgentEvent, page?: PageSummary) => void,
  signal?: AbortSignal,
  siblingBadDomains: string[] = [],
  siblingEscortDomains: EscortDomainEntry[] = [],
): Promise<AgentRunResult> => {
  if (!config.openAiApiKey) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const client = new OpenAI({ apiKey: config.openAiApiKey });

  const agentInstance = mainAgent.create({
    client,
    model: config.model,
    candidate,
    onEvent,
    browserSession,
    signal,
    siblingBadDomains,
    siblingEscortDomains,
  });

  return agentInstance.run();
};

export const agent = {
  run,
};
