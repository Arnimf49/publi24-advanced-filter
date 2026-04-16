import type OpenAI from 'openai';
import { diffLines } from 'diff';
import { llmConversation } from '../llmConversation.js';
import { subSessionContext } from '../subSessionContext.js';
import type { PageSnapshot } from '../subSessionContext.js';
import type { ActionableElement } from '../../types/browser.js';
import type { AgentEvent } from '../../types/agent.js';
import { randomUUID } from 'node:crypto';
import { loadPrompt } from '../../prompts/loadPrompt.js';

const SYSTEM_PROMPT = loadPrompt('actionableElementsSystem.md');

const MODE_INSTRUCTIONS: Record<string, string> = {
  'accept-verification': loadPrompt('actionableElementsModes/accept-verification.md'),
  'reveal-phone-number': loadPrompt('actionableElementsModes/reveal-phone-number.md'),
  'profile-revealing':   loadPrompt('actionableElementsModes/profile-revealing.md'),
  'get-in-contact':      loadPrompt('actionableElementsModes/get-in-contact.md'),
};

const { LlmConversation } = llmConversation;
const { SubSessionContext } = subSessionContext;

/**
 * Result returned by ActionableElementsSession.call()
 */
export interface ActionableElementsResult {
  mode: string;
  reasoning: string;
  elements: ActionableElement[];
  shouldClickAllAtOnce: boolean;
}

/**
 * Event callback type for emitting agent events
 */
type EventCallback = (event: AgentEvent, page?: any) => void;

/**
 * JSON schema for structured output from the LLM.
 * The model returns only element IDs; full objects are hydrated from the input snapshot.
 */
const actionableElementsSchema = {
  type: 'object' as const,
  properties: {
    mode: { type: 'string' as const },
    reasoning: { type: 'string' as const },
    elementIds: {
      type: 'array' as const,
      items: { type: 'string' as const },
    },
    shouldClickAllAtOnce: { type: 'boolean' as const },
  },
  required: ['mode', 'reasoning', 'elementIds', 'shouldClickAllAtOnce'],
  additionalProperties: false,
};

/**
 * Manages a persistent sub-AI session for analyzing actionable elements.
 *
 * This class handles:
 * - Single-mode operation per call
 * - Persistent conversation state across calls
 * - Element diff computation for efficiency
 * - Mode instruction injection (once per mode)
 * - Structured JSON output (not tool calling)
 *
 * **Usage pattern:**
 * ```ts
 * const session = actionableElementsSession.create(client, 'gpt-4', pageUrl);
 *
 * // First call: receives full element list
 * const result1 = await session.call('accept-verification', snapshot1, onEvent);
 *
 * // Subsequent calls: receive only element diffs
 * const result2 = await session.call('reveal-phone-number', snapshot2, onEvent);
 * ```
 */
export class ActionableElementsSession {
  private conversation: InstanceType<typeof LlmConversation>;
  private context: InstanceType<typeof SubSessionContext>;
  private lastStructuredTextWithIds: string | null = null;

  constructor(client: OpenAI, model: string, _pageUrl: string) {
    this.conversation = new LlmConversation(client, model);
    this.context = new SubSessionContext();

    this.conversation.addSystemMessage(SYSTEM_PROMPT);
  }

  /**
   * Analyzes actionable elements for a specific mode.
   *
   * @param mode - The analysis mode (e.g., 'accept-verification', 'reveal-phone-number')
   * @param pageSnapshot - Current page snapshot with actionable elements
   * @param onEvent - Callback for emitting agent events
   * @returns Filtered elements matching the mode criteria with reasoning
   */
  async call(
    mode: string,
    pageSnapshot: PageSnapshot,
    onEvent: EventCallback,
    mainAIReasoning?: string,
  ): Promise<ActionableElementsResult> {
    // Check if mode instructions need to be injected
    const newModes = this.context.getNewModes([mode]);

    if (newModes.length > 0) {
      const instructions = MODE_INSTRUCTIONS[mode];
      if (!instructions) {
        const validModes = Object.keys(MODE_INSTRUCTIONS).join(', ');
        throw new Error(`Unknown get_actionable_elements mode: "${mode}". Valid modes are: ${validModes}`);
      }

      this.conversation.addSystemMessage(instructions);
      this.context.markModeInjected(mode);
    }

    const isFirstCall = this.lastStructuredTextWithIds === null;

    let userMessage: string;
    if (isFirstCall) {
      userMessage = this.buildFullSnapshotMessage(mode, pageSnapshot);
    } else {
      userMessage = this.buildDiffMessage(mode, pageSnapshot, this.lastStructuredTextWithIds!);
    }

    if (mainAIReasoning) {
      userMessage = `**Agent context:** ${mainAIReasoning}\n\n${userMessage}`;
    }

    this.conversation.addUserMessage(userMessage);

    const eventId = randomUUID();
    onEvent({
      id: eventId,
      state: 'running',
      type: 'ai',
      message: `Analyzing elements for mode: ${mode}`,
      request: userMessage,
      createdAt: new Date().toISOString(),
    });

    const inputElementMap = new Map(
      pageSnapshot.actionableElements.map((el) => [el.id, el]),
    );

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await this.conversation.complete({
          temperature: 0.1,
          responseFormat: {
            type: 'json_schema',
            json_schema: {
              name: 'actionable_elements_result',
              strict: true,
              schema: actionableElementsSchema,
            },
          },
        });

        if (!result.content) {
          throw new Error('LLM returned no content');
        }

        const raw = JSON.parse(result.content) as { mode: string; reasoning: string; elementIds: string[]; shouldClickAllAtOnce: boolean };

        const staleIds = raw.elementIds.filter((id) => !inputElementMap.has(id));
        if (staleIds.length > 0) {
          const validIds = pageSnapshot.actionableElements.map((el) => el.id).join(', ');
          this.conversation.addUserMessage(
            `The following element IDs you returned are not present in the current page: ${staleIds.join(', ')}. ` +
            `Please select only from the valid IDs available: ${validIds || '(none)'}. Try again.`,
          );
          lastError = new Error(`LLM returned stale element ID(s): ${staleIds.join(', ')}`);
          continue;
        }

        const elements: ActionableElement[] = raw.elementIds.map((id) => inputElementMap.get(id)!);

        const parsed: ActionableElementsResult = {
          mode: raw.mode,
          reasoning: raw.reasoning,
          elements,
          shouldClickAllAtOnce: raw.shouldClickAllAtOnce,
        };

        onEvent({
          id: eventId,
          state: 'done',
          type: 'ai',
          message: parsed.reasoning,
          result: `Found ${parsed.elements.length} matching elements for mode: ${mode}`,
          createdAt: new Date().toISOString(),
          tokenUsage: {
            scope: 'sub',
            input: result.usage.input,
            cachedInput: result.usage.cachedInput,
            output: result.usage.output,
            total: result.usage.total,
          },
        });

        this.lastStructuredTextWithIds = pageSnapshot.structuredTextWithIds;

        return parsed;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        onEvent({
          id: eventId,
          state: 'failed',
          type: 'error',
          message: `Analysis failed: ${lastError.message}`,
          createdAt: new Date().toISOString(),
        });

        throw lastError;
      }
    }

    onEvent({
      id: eventId,
      state: 'failed',
      type: 'error',
      message: `Analysis failed after ${maxRetries} attempts: ${lastError?.message}`,
      createdAt: new Date().toISOString(),
    });

    throw lastError!;
  }

  private buildFullSnapshotMessage(
    mode: string,
    snapshot: PageSnapshot,
  ): string {
    return [
      `# Analysis Request`,
      `Mode: ${mode}`,
      `URL: ${snapshot.url}`,
      `Title: ${snapshot.title}`,
      ``,
      `## Page Content`,
      snapshot.structuredTextWithIds,
      ``,
      `Return IDs of elements (marked as [id=xxx]) that match the "${mode}" mode criteria.`,
    ].join('\n');
  }

  private buildDiffMessage(
    mode: string,
    snapshot: PageSnapshot,
    previousTextWithIds: string,
  ): string {
    const changes = diffLines(previousTextWithIds, snapshot.structuredTextWithIds);

    const added: string[] = [];
    const removed: string[] = [];
    for (const part of changes) {
      if (part.added) {
        added.push(...part.value.split('\n').filter(Boolean));
      } else if (part.removed) {
        removed.push(...part.value.split('\n').filter(Boolean));
      }
    }

    const parts: string[] = [
      `# Analysis Request (Update)`,
      `Mode: ${mode}`,
    ];

    if (snapshot.title) {
      parts.push(`URL: ${snapshot.url} — ${snapshot.title}`);
    }

    if (added.length > 0 || removed.length > 0) {
      parts.push(``, `## Content changes`);
      if (added.length > 0) {
        parts.push(...added.map((l) => `+ ${l}`));
      }
      if (removed.length > 0) {
        parts.push(...removed.map((l) => `- ${l}`));
      }
    } else {
      parts.push(``, `No content changes since last action.`);
    }

    parts.push(``, `Return IDs of elements (marked as [id=xxx]) that match the "${mode}" mode criteria.`);

    return parts.join('\n');
  }
}

export const actionableElementsSession = {
  create: (client: OpenAI, model: string, pageUrl: string) =>
    new ActionableElementsSession(client, model, pageUrl),
};
