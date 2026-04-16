import { randomUUID } from 'crypto';
import type OpenAI from 'openai';
import type { BrowserSession } from '../../browser/index.js';
import type { AgentEvent } from '../../types/agent.js';
import type { PageSummary } from '../../types/browser.js';
import type { AnalyzePageResult } from '../sessions/AnalyzePageSession.js';
import type { ActionableElementsResult } from '../sessions/ActionableElementsSession.js';
import { sessionCache } from '../sessions/SessionCache.js';

type EventCallback = (event: AgentEvent, page?: PageSummary) => void;

type SubAIResult =
  | { kind: 'analyze'; result: AnalyzePageResult; usage: AgentEvent['tokenUsage'] }
  | { kind: 'actionable'; result: ActionableElementsResult; usage: AgentEvent['tokenUsage'] };

const createEvent = (
  type: AgentEvent['type'],
  message: string,
  state: AgentEvent['state'] = 'done',
  id = randomUUID(),
  tokenUsage?: AgentEvent['tokenUsage'],
  request?: string,
  diagnostics?: AgentEvent['diagnostics'],
  response?: string,
  result?: string,
): AgentEvent => ({
  id,
  state,
  type,
  message,
  request,
  response,
  result,
  createdAt: new Date().toISOString(),
  tokenUsage,
  diagnostics,
});

export class SubAIDispatcher {
  private sessions: ReturnType<typeof sessionCache.create>;
  private browserSession: BrowserSession;
  private client: OpenAI;
  private model: string;
  private onEvent: EventCallback;

  constructor(options: {
    client: OpenAI;
    model: string;
    browserSession: BrowserSession;
    onEvent: EventCallback;
  }) {
    this.client = options.client;
    this.model = options.model;
    this.browserSession = options.browserSession;
    this.onEvent = options.onEvent;
    this.sessions = sessionCache.create();
  }

  async execute(toolName: string, args: Record<string, unknown>, currentPage: PageSummary): Promise<SubAIResult> {
    if (toolName === 'analyze_page') {
      return this.handleAnalyzePage(args, currentPage);
    }

    if (toolName === 'get_actionable_elements') {
      return this.handleGetActionableElements(args, currentPage);
    }

    throw new Error(`Unknown sub-AI tool: ${toolName}`);
  }

  discardSessions(): void {
    this.sessions.discardAll();
  }

  private async getLivePage(currentPage: PageSummary): Promise<PageSummary> {
    try {
      return await this.browserSession.getCurrentPage();
    } catch {
      return currentPage;
    }
  }

  async buildDiagnostics(page: PageSummary): Promise<AgentEvent['diagnostics']> {
    const rawHtml = await this.browserSession.getHtml();
    return {
      url: page.url,
      title: page.title,
      summary: page.structuredText,
      actionableElements: page.actionableElements,
      rawHtml,
    };
  }

  private async runSubAITool<T>(
    toolName: string,
    args: Record<string, unknown>,
    currentPage: PageSummary,
    run: (livePage: PageSummary, onChildEvent: (event: AgentEvent, page?: PageSummary) => void) => Promise<T>,
    fallback: (message: string) => T,
    mainAIReasoning?: string,
  ): Promise<{ result: T; usage: AgentEvent['tokenUsage'] }> {
    const toolEventId = randomUUID();
    const startedAt = new Date().toISOString();

    this.onEvent({ ...createEvent('tool', toolName, 'running', toolEventId, undefined, JSON.stringify(args, null, 2)), reasoning: mainAIReasoning });

    const diagnostics = await this.buildDiagnostics(currentPage);
    const livePage = await this.getLivePage(currentPage);

    let capturedUsage: AgentEvent['tokenUsage'] = { scope: 'sub', input: 0, cachedInput: 0, output: 0, total: 0 };
    let capturedSentContext: string | undefined;

    let result: T;
    try {
      result = await run(livePage, (event: AgentEvent, _page?: PageSummary) => {
        if (event.tokenUsage) { capturedUsage = event.tokenUsage; }
        if (event.request && !capturedSentContext) { capturedSentContext = event.request; }

        if (event.type === 'tool' && event.state === 'done') {
          this.onEvent({ ...event, parentId: toolEventId, diagnostics });
        } else {
          this.onEvent({ ...event, parentId: toolEventId });
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.onEvent({
        ...createEvent('tool', toolName, 'failed', toolEventId, capturedUsage, JSON.stringify(args, null, 2), undefined, undefined, message),
        reasoning: mainAIReasoning,
        createdAt: startedAt,
        completedAt: new Date().toISOString(),
      });
      return { result: fallback(message), usage: capturedUsage };
    }

    const diagnosticsWithContext = diagnostics && capturedSentContext
      ? { ...diagnostics, sentContext: capturedSentContext }
      : diagnostics;

    this.onEvent({
      ...createEvent('tool', toolName, 'done', toolEventId, capturedUsage, JSON.stringify(args, null, 2), diagnosticsWithContext, undefined, JSON.stringify(result, null, 2)),
      reasoning: mainAIReasoning,
      createdAt: startedAt,
      completedAt: new Date().toISOString(),
    });

    return { result, usage: capturedUsage };
  }

  private async handleAnalyzePage(
    args: Record<string, unknown>,
    currentPage: PageSummary,
  ): Promise<{ kind: 'analyze'; result: AnalyzePageResult; usage: AgentEvent['tokenUsage'] }> {
    const { reason: reasonValue, ...argsWithoutReason } = args;
    const mainAIReasoning = typeof reasonValue === 'string' ? reasonValue : undefined;
    const modes = Array.isArray(argsWithoutReason.modes) ? argsWithoutReason.modes.filter((m): m is string => typeof m === 'string') : [];

    if (modes.length === 0) {
      return {
        kind: 'analyze',
        result: { reasoning: 'No modes provided', suggestedActions: [], findings: {}, phoneNumbers: [] },
        usage: { scope: 'sub', input: 0, cachedInput: 0, output: 0, total: 0 },
      };
    }

    const session = this.sessions.getOrCreateAnalyze(this.client, this.model, currentPage.url);
    const { result, usage } = await this.runSubAITool(
      'AI TOOL - analyze_page',
      argsWithoutReason,
      currentPage,
      (livePage, onChildEvent) => session.analyze(modes, livePage, onChildEvent, mainAIReasoning),
      (message) => ({ reasoning: message, suggestedActions: [], findings: {}, phoneNumbers: [] } as AnalyzePageResult),
      mainAIReasoning,
    );

    return { kind: 'analyze', result, usage };
  }

  private async handleGetActionableElements(
    args: Record<string, unknown>,
    currentPage: PageSummary,
  ): Promise<{ kind: 'actionable'; result: ActionableElementsResult; usage: AgentEvent['tokenUsage'] }> {
    const { reason: reasonValue, ...argsWithoutReason } = args;
    const mainAIReasoning = typeof reasonValue === 'string' ? reasonValue : undefined;
    const mode = typeof argsWithoutReason.mode === 'string' ? argsWithoutReason.mode : '';

    if (!mode) {
      return {
        kind: 'actionable',
        result: { mode: '', reasoning: 'No mode provided', elements: [], shouldClickAllAtOnce: false },
        usage: { scope: 'sub', input: 0, cachedInput: 0, output: 0, total: 0 },
      };
    }

    const session = this.sessions.getOrCreateActionable(this.client, this.model, currentPage.url);
    const { result, usage } = await this.runSubAITool(
      'AI TOOL - get_actionable_elements',
      argsWithoutReason,
      currentPage,
      (livePage, onChildEvent) => session.call(mode, livePage, onChildEvent, mainAIReasoning),
      (message) => ({ mode, reasoning: message, elements: [], shouldClickAllAtOnce: false } as ActionableElementsResult),
      mainAIReasoning,
    );

    return { kind: 'actionable', result, usage };
  }
}

export const subAIDispatcher = {
  create: (options: {
    client: OpenAI;
    model: string;
    browserSession: BrowserSession;
    onEvent: EventCallback;
  }) => new SubAIDispatcher(options),
};
