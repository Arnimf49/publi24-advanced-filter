import OpenAI from 'openai';
import { randomUUID } from 'crypto';
import type { ChatCompletionMessageToolCall } from 'openai/resources/chat/completions';
import { type BrowserSession } from '../../browser/index.js';
import { config } from '../../config.js';
import { loadPrompt } from '../../prompts/loadPrompt.js';
import { phoneSignals } from '../../utilities/phoneSignals.js';
import { tools } from '../../tools/dispatch.js';
import { llmConversation } from '../llmConversation.js';
import type {
  AgentEvent,
} from '../../types/agent.js';
import type {
  AgentRunResult,
} from '../../types/tools.js';
import type {
  BrowserToolResult,
  PageSummary,
} from '../../types/browser.js';
import type {
  ClassificationProposal,
  DomainCandidate,
} from '../../types/tools.js';
import type { AnalyzePageResult } from '../sessions/AnalyzePageSession.js';
import type { ActionableElementsResult } from '../sessions/ActionableElementsSession.js';
import { agentLedger, type AgentLedger } from './AgentLedger.js';
import { subAIDispatcher, SubAIDispatcher } from './SubAIDispatcher.js';
import { triage } from './triage.js';
import { validation } from './validation.js';
import type { EscortDomainEntry } from '../../types/tools.js';

const { LlmConversation } = llmConversation;

type ToolDispatchResult =
  | { kind: 'browser'; result: BrowserToolResult }
  | { kind: 'analyze'; result: AnalyzePageResult; usage: AgentEvent['tokenUsage'] }
  | { kind: 'actionable'; result: ActionableElementsResult; usage: AgentEvent['tokenUsage'] }
  | { kind: 'terminal'; proposal: ClassificationProposal };

type EventCallback = (event: AgentEvent, page?: PageSummary) => void;

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

const isErrorPage = (page: PageSummary): boolean => {
  const title = page.title.toLowerCase();
  const text = page.structuredText.toLowerCase();
  const ERROR_PATTERNS = /\b(404|page not found|not found|error 404|404 not found|this page (does not|doesn't) exist|page (does not|doesn't) exist|no page found|listing (has )?expired|ad (has )?expired|anun[tț] expirat|anuncio expirado|anzeige.*(abgelaufen|nicht mehr)|annonce.*expir|annonce.*supprim|page.*expir|expired listing|this listing is no longer available|this ad (is|has been) (removed|deleted|expired)|page.*(removed|deleted)|lien.*bris[eé]|broken.?link)\b/;
  return ERROR_PATTERNS.test(title) || ERROR_PATTERNS.test(text.slice(0, 500));
};

export class MainAgent {
  private conversation: InstanceType<typeof LlmConversation>;
  private subAI: SubAIDispatcher | null = null;
  private ledger: AgentLedger;
  private candidate: DomainCandidate;
  private onEvent: EventCallback;
  private client: OpenAI;
  private model: string;
  private browserSession: BrowserSession | null = null;
  private signal: AbortSignal | null = null;
  private siblingBadDomains: string[] = [];
  private siblingEscortDomains: EscortDomainEntry[] = [];
  private runStart = 0;

  constructor(options: {
    client: OpenAI;
    model: string;
    candidate: DomainCandidate;
    onEvent: EventCallback;
    browserSession?: BrowserSession;
    signal?: AbortSignal;
    siblingBadDomains?: string[];
    siblingEscortDomains?: EscortDomainEntry[];
  }) {
    this.client = options.client;
    this.model = options.model;
    this.candidate = options.candidate;
    this.onEvent = options.onEvent;
    this.browserSession = options.browserSession ?? null;
    this.signal = options.signal ?? null;
    this.siblingBadDomains = options.siblingBadDomains ?? [];
    this.siblingEscortDomains = options.siblingEscortDomains ?? [];

    this.conversation = new LlmConversation(options.client, options.model);
    this.ledger = agentLedger.create();
  }

  private stamp(proposal: ClassificationProposal, submitter: ClassificationProposal['submitter']): ClassificationProposal {
    return { ...proposal, submitter, durationMs: Date.now() - this.runStart };
  }

  async run(): Promise<AgentRunResult> {
    if (!this.browserSession) {
      throw new Error('Browser session is required');
    }

    this.runStart = Date.now();

    this.subAI = subAIDispatcher.create({
      client: this.client,
      model: this.model,
      browserSession: this.browserSession,
      onEvent: this.onEvent,
    });

    const openEventId = randomUUID();
    this.onEvent(createEvent('status', `Opening ${this.candidate.source ?? `https://${this.candidate.domain}`}`, 'running', openEventId));

    const openResult = await this.browserSession.openCandidate(this.candidate);

    if (!openResult.ok) {
      this.onEvent(createEvent('error', `Failed to open: ${openResult.message}`, 'failed', openEventId));

      if (/download is starting/i.test(openResult.message ?? '')) {
        return {
          page: null,
          proposal: this.stamp({
            kind: 'bad',
            country: null,
            phoneNumber: null,
            phoneNumbers: [],
            contactAccess: null,
            reasoning: `Domain source URL triggers a file download instead of loading a webpage. This is not an escort listing site.`,
            confidence: 95,
          }, 'main_agent'),
        };
      }

      if (/ERR_SSL|ERR_NAME_NOT_RESOLVED|ERR_CONNECTION_REFUSED|ERR_CONNECTION_TIMED_OUT|ERR_TUNNEL_CONNECTION_FAILED|net::/i.test(openResult.message ?? '')) {
        return {
          page: null,
          proposal: this.stamp({
            kind: 'bad',
            country: null,
            phoneNumber: null,
            phoneNumbers: [],
            contactAccess: null,
            reasoning: `Domain is unreachable (network/SSL error): ${openResult.message}`,
            confidence: 90,
          }, 'main_agent'),
        };
      }

      return {
        page: null,
        proposal: this.stamp({
          kind: 'review',
          country: null,
          phoneNumber: null,
          phoneNumbers: [],
          contactAccess: null,
          reasoning: `Could not open the domain: ${openResult.message}`,
          confidence: 0,
        }, 'main_agent'),
      };
    }

    const initialPage = openResult.page;
    agentLedger.appendUnique(this.ledger.visitedUrls, initialPage.url, 24);

    this.onEvent(createEvent('status', `Opened: ${initialPage.url}`, 'done', openEventId), initialPage);

    // If the initial URL landed on a 404/error page, silently navigate to homepage first
    // so triage and the main agent have a better page to analyse.
    let startPage = initialPage;
    if (isErrorPage(initialPage) && !agentLedger.isHomepageUrl(initialPage.url)) {
      this.onEvent(createEvent('status', 'Initial page appears to be an error page — navigating to homepage', 'done'), initialPage);
      const homepageResult = await this.browserSession.openHomepage();
      if (homepageResult.ok) {
        startPage = homepageResult.page;
        agentLedger.appendUnique(this.ledger.visitedUrls, startPage.url, 24);
      }
    }

    const triageResult = await triage.run(this.client, this.model, startPage, this.onEvent, this.siblingBadDomains, this.siblingEscortDomains);

    if (triageResult.directBad) {
      this.onEvent(createEvent('decision', `triageBad classified as BAD: ${triageResult.directBad}`), startPage);
      return {
        page: startPage,
        proposal: this.stamp({
          kind: 'bad',
          country: null,
          phoneNumber: null,
          phoneNumbers: [],
          contactAccess: null,
          reasoning: `Sibling bad-domain signal confirmed: ${triageResult.directBad}`,
          confidence: 90,
        }, 'triage_bad'),
      };
    }

    if (triageResult.directEscort) {
      const { country, reasoning } = triageResult.directEscort;
      this.onEvent(createEvent('decision', `triageGood confirmed escort [${country}]: ${reasoning}`), startPage);
      return {
        page: startPage,
        proposal: this.stamp({
          kind: 'escort',
          country,
          phoneNumber: null,
          phoneNumbers: [],
          contactAccess: null,
          reasoning: `Sibling escort-domain signal confirmed: ${reasoning}`,
          confidence: 88,
        }, 'triage_good'),
      };
    }

    if (triageResult.directReview) {
      this.onEvent(createEvent('decision', `Triage flagged for review: ${triageResult.directReview}`), startPage);
      return {
        page: startPage,
        proposal: this.stamp({
          kind: 'review',
          country: null,
          phoneNumber: null,
          phoneNumbers: [],
          contactAccess: null,
          reasoning: triageResult.directReview,
          confidence: 0,
        }, 'triage_access_gate'),
      };
    }

    if (triageResult.isDefinitelyNotEscortListing && triageResult.confidence >= 90) {
      this.onEvent(createEvent('decision', `Triage classified as BAD: ${triageResult.reasoning}`), startPage);
      return {
        page: startPage,
        proposal: this.stamp({
          kind: 'bad',
          country: null,
          phoneNumber: null,
          phoneNumbers: [],
          contactAccess: null,
          reasoning: `Triage determined site is not an escort listing: ${triageResult.reasoning}`,
          confidence: triageResult.confidence,
        }, 'triage_bad'),
      };
    }

    this.conversation.addSystemMessage(loadPrompt('mainPrompt.md'));

    let initialContextMsg = loadPrompt('initialContext.md')
      .replace('{{domain}}', this.candidate.domain)
      .replace('{{sourceUrl}}', this.candidate.source ?? `https://${this.candidate.domain}`)
      .replace('{{siteNames}}', this.candidate.siteNames.join(', ') || '(none)')
      .replace('{{pageUrl}}', startPage.url)
      .replace('{{pageTitle}}', startPage.title || '(none)');

    this.conversation.addUserMessage(initialContextMsg);

    return this.executeMainLoop(startPage);
  }

  private async executeMainLoop(initialPage: PageSummary): Promise<AgentRunResult> {
    let currentPage = initialPage;
    let toolCallCount = 0;
    let hopCount = 0;
    let consecutiveRejections = 0;
    let lastRejectedTool: string | null = null;
    let homepageCountryAnalysisDone = false;

    while (toolCallCount < config.maxToolCalls) {
      if (this.signal?.aborted) {
        this.onEvent(createEvent('status', 'Agent paused by user', 'done'), currentPage);
        return {
          page: currentPage,
          proposal: this.stamp({
            kind: 'review',
            country: null,
            phoneNumber: null,
            phoneNumbers: [],
            contactAccess: null,
            reasoning: 'Agent run was stopped by pause.',
            confidence: 0,
          }, 'main_agent'),
        };
      }

      const turnEventId = randomUUID();
      const turnStartedAt = new Date().toISOString();
      this.onEvent(createEvent('ai', 'Requesting next action', 'running', turnEventId));

      let result;
      try {
        result = await this.conversation.complete({
          tools: tools.toolDefinitions,
          toolChoice: 'auto',
          temperature: 0.1,
        });
      } catch (error) {
        this.onEvent({
          ...createEvent('error', `LLM call failed: ${error}`, 'failed', turnEventId),
          createdAt: turnStartedAt,
          completedAt: new Date().toISOString(),
        });
        return {
          page: currentPage,
          proposal: this.stamp({
            kind: 'review',
            country: null,
            phoneNumber: null,
            phoneNumbers: [],
            contactAccess: null,
            reasoning: `LLM API call failed: ${error}`,
            confidence: 0,
          }, 'main_agent'),
        };
      }

      const aiMessage = result.toolCalls.length > 0
        ? `Responded with ${result.toolCalls.length} tool call${result.toolCalls.length === 1 ? '' : 's'}`
        : (result.content || 'No response');

      this.onEvent(
        {
          ...createEvent(
            'ai',
            aiMessage,
            'done',
            turnEventId,
            {
              scope: 'main',
              input: result.usage.input,
              cachedInput: result.usage.cachedInput,
              output: result.usage.output,
              total: result.usage.total,
            },
            undefined,
            undefined,
            result.content && result.toolCalls.length > 0 ? result.content : undefined,
          ),
          createdAt: turnStartedAt,
          completedAt: new Date().toISOString(),
        },
      );

      if (result.toolCalls.length === 0) {
        return {
          page: currentPage,
          proposal: this.stamp({
            kind: 'review',
            country: null,
            phoneNumber: null,
            phoneNumbers: [],
            contactAccess: null,
            reasoning: 'Agent did not call any tools',
            confidence: 0,
          }, 'main_agent'),
        };
      }

      const toolCall = result.toolCalls[0];
      toolCallCount += 1;

      const toolName = toolCall.type === 'function' ? toolCall.function.name : '';

      const urlBeforeDispatch = currentPage.url;

      // Determine whether the clicked element is a plain anchor (href, not javascript:).
      // Plain anchors either navigate (URL changes) or do nothing useful — no DOM mutation expected.
      // Buttons and non-href elements can open modals/reveals without changing the URL.
      const clickedElementIds: string[] = (() => {
        if (toolCall.type !== 'function') { return []; }
        try {
          const args = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
          const ids = args.elementIds;
          const id = args.elementId;
          if (Array.isArray(ids)) { return ids.map(String); }
          if (typeof id === 'string') { return [id]; }
        } catch { /* ignore */ }
        return [];
      })();

      const isPlainAnchorClick = clickedElementIds.length > 0 && clickedElementIds.every((id) => {
        const el = currentPage.actionableElements.find((e) => e.id === id);
        if (!el) { return false; }
        const tag = (el.tagName ?? '').toLowerCase();
        const href = el.href ?? '';
        return tag === 'a' && href !== '' && !href.startsWith('javascript:');
      });

      const dispatchResult = await this.dispatchToolCall(toolCall, currentPage);

      if (dispatchResult.kind === 'terminal') {
        if (!homepageCountryAnalysisDone && dispatchResult.proposal.kind === 'escort') {
          homepageCountryAnalysisDone = true;
          const note = await this.runHomepageCountryAnalysis(currentPage);
          if (note) {
            this.conversation.addToolResult(toolCall.id, note);
            this.conversation.addUserMessage('Homepage country selector analysis is complete (see above). Now re-evaluate your classification with this additional context and call the appropriate terminal tool.');
            continue;
          }
        }

        if (!homepageCountryAnalysisDone) {
          homepageCountryAnalysisDone = true;
        }

        const validationResult = validation.validateProposal(dispatchResult.proposal, this.ledger, currentPage, this.candidate);
        if (validationResult.ok) {
          this.onEvent(createEvent('decision', `Classification: ${dispatchResult.proposal.kind}`), currentPage);
          return {
            page: currentPage,
            proposal: this.stamp(dispatchResult.proposal, 'main_agent'),
          };
        } else {
          const toolResultMessage = this.buildToolResultMessage({
            ok: false,
            errorCode: 'validation_failed',
            message: validationResult.reason,
            recoverable: true,
          }, currentPage);

          this.conversation.addToolResult(toolCall.id, toolResultMessage);
          this.onEvent(createEvent('error', `Proposal rejected: ${validationResult.reason}`, 'failed'), currentPage);

          const toolName = toolCall.type === 'function' ? toolCall.function.name : 'unknown';
          const rejectionKey = `${toolName}:${validationResult.reason}`;
          if (rejectionKey === lastRejectedTool) {
            consecutiveRejections += 1;
          } else {
            consecutiveRejections = 1;
            lastRejectedTool = rejectionKey;
          }

          if (consecutiveRejections >= 2) {
            this.onEvent(createEvent('error', 'Aborting: same rejection repeated twice in a row', 'failed'), currentPage);
            return {
              page: currentPage,
              proposal: this.stamp({
                kind: 'review',
                country: null,
                phoneNumber: null,
                phoneNumbers: [],
                contactAccess: null,
                reasoning: `Classification aborted after ${consecutiveRejections} consecutive identical rejections of "${toolName.split(':')[0]}". Last rejection: ${validationResult.reason}`,
                confidence: 0,
              }, 'main_agent'),
            };
          }
          continue;
        }
      }

      consecutiveRejections = 0;
      lastRejectedTool = null;

      if (dispatchResult.kind === 'browser') {
        const isCrossDomainError = !dispatchResult.result.ok && (
          dispatchResult.result.errorCode === 'click_opened_new_tab' ||
          dispatchResult.result.errorCode === 'click_navigated_cross_domain' ||
          dispatchResult.result.errorCode === 'open_element_href_cross_domain'
        ) && !dispatchResult.result.recoverable;

        if (isCrossDomainError) {
          this.ledger.hasRedirectBaitAttempt = true;

          // Extract element IDs from the tool call args and mark them failed
          let clickedIds: string[] = [];
          try {
            const parsedArgs = JSON.parse(toolCall.type === 'function' ? toolCall.function.arguments : '{}') as Record<string, unknown>;
            if (toolName === 'click_element') {
              const rawIds = parsedArgs.elementIds;
              clickedIds = Array.isArray(rawIds) ? rawIds.map(String) : [];
            } else {
              const eid = typeof parsedArgs.elementId === 'string' ? parsedArgs.elementId : null;
              if (eid) {
                clickedIds = [eid];
              }
            }
          } catch {
            // ignore parse errors
          }

          for (const id of clickedIds) {
            agentLedger.appendUnique(this.ledger.failedClickElementIds, id, 32);
            if (this.ledger.revealPhoneElementIds.includes(id)) {
              this.ledger.failedPhoneRevealAttempts += 1;
            }
          }
          this.ledger.contactGatedDetected = true;
        }

        if (dispatchResult.result.ok) {
          currentPage = dispatchResult.result.page;
          agentLedger.appendUnique(this.ledger.visitedUrls, currentPage.url, 24);
          hopCount += 1;

          if (hopCount >= config.maxHops) {
            this.onEvent(createEvent('error', 'Reached max hops limit', 'failed'), currentPage);
            // Must respond to all tool calls before making the next API request.
            this.conversation.addToolResult(toolCall.id, JSON.stringify({ ok: true, message: 'Hop limit reached.' }));
            this.stubExtraToolCalls(result.toolCalls, toolCall.id);
            if (!homepageCountryAnalysisDone && this.ledger.escortEvidenceEstablished) {
              homepageCountryAnalysisDone = true;
              const note = await this.runHomepageCountryAnalysis(currentPage);
              if (note) {
                this.conversation.addUserMessage(`Homepage country selector analysis:\n${note}`);
              }
            }
            homepageCountryAnalysisDone = true;
            const terminalProposal = await this.requestTerminalVerdict(currentPage);
            return {
              page: currentPage,
              proposal: this.stamp(terminalProposal, 'main_agent'),
            };
          }
        }

        const browserToolName = toolCall.type === 'function' ? toolCall.function.name : '';
        const trimmed = this.trimBrowserToolResult(browserToolName, dispatchResult.result);
        let toolResultMessage = this.buildToolResultMessage(trimmed, currentPage);

        // After every successful browser action, automatically run a lightweight page analysis.
        // Skip only when the URL didn't change AND the element was a plain anchor (href-only) or
        // verify_phone_action — these cannot open modals or mutate the DOM meaningfully.
        const urlDidChange = currentPage.url !== urlBeforeDispatch;
        const isNonMutatingAction = toolName === 'verify_phone_action' || isPlainAnchorClick;
        if (dispatchResult.result.ok && (urlDidChange || !isNonMutatingAction) && this.subAI) {
          const autoModes = ['has-escort-profile', 'has-escort-list', 'searching-phone-number', 'describe-difference'];
          const autoAnalysis = await this.subAI.execute(
            'analyze_page',
            { modes: autoModes, reason: 'Automatic post-navigation analysis' },
            currentPage,
          );
          if (autoAnalysis.kind === 'analyze') {
            this.updateLedgerFromAnalysis(autoAnalysis.result);
            toolResultMessage += '\n\n--- Automatic page analysis ---\n' + JSON.stringify(autoAnalysis.result, null, 2);

            if (this.ledger.profileNotFoundCount >= 3) {
              const hasPhone = this.ledger.verifiedPhoneNumbers.length > 0;
              if (hasPhone) {
                toolResultMessage += '\n\n[NOTE] No individual escort profile has been found after 3 navigations to presumed profile pages, despite a visible phone number. Stop searching. The site initially appeared to contain escort listings with a visible phone number, but after navigating to multiple profiles, no additional verified phone numbers were found and no further escort evidence was established. Flag for review with that explanation.';
              } else {
                toolResultMessage += '\n\n[NOTE] No individual escort profile has been found after 3 navigations to presumed profile pages. Stop searching for profiles. If the domain is confirmed as an escort listing site, classify based on what you know — use contact_gated if no phone access is available, or flag_for_review if genuinely uncertain.';
              }
            }

            if (this.ledger.verifiedPhoneNumbers.length >= 2) {
              toolResultMessage += `\n\n[NOTE] You have already verified ${this.ledger.verifiedPhoneNumbers.length} distinct phone numbers (${this.ledger.verifiedPhoneNumbers.join(', ')}). The phone verification goal is satisfied. Stop navigating to more profiles. Deliver your final verdict now using classify_as_escort.`;
            } else if (this.ledger.isAgencyDetected && this.ledger.verifiedPhoneNumbers.length >= 1) {
              toolResultMessage += `\n\n[NOTE] Agency site detected and phone verified (${this.ledger.verifiedPhoneNumbers.join(', ')}). Agency sites use a single shared phone for all profiles — you do not need a second distinct phone number. Deliver your final verdict now using classify_as_escort.`;
            }
          }
        }

        this.conversation.addToolResult(toolCall.id, toolResultMessage);
      }

      if (dispatchResult.kind === 'analyze') {
        this.updateLedgerFromAnalysis(dispatchResult.result);
        const toolResultMessage = this.buildToolResultMessage(dispatchResult.result, currentPage);
        this.conversation.addToolResult(toolCall.id, toolResultMessage);
      }

      if (dispatchResult.kind === 'actionable') {
        if (dispatchResult.result.mode === 'reveal-phone-number') {
          this.ledger.revealPhoneSearchAttempts += 1;

          if (dispatchResult.result.elements.length > 0) {
            // Filter out elements that have already been clicked and failed
            dispatchResult.result.elements = dispatchResult.result.elements.filter(
              (el) => !this.ledger.failedClickElementIds.includes(el.id),
            );

            for (const element of dispatchResult.result.elements) {
              agentLedger.appendUnique(this.ledger.revealPhoneElementIds, element.id, 32);
            }
          }
        }

        const toolResultMessage = this.buildToolResultMessage(dispatchResult.result, currentPage);
        this.conversation.addToolResult(toolCall.id, toolResultMessage);
      }

      if (result.toolCalls.length > 1) {
        this.stubExtraToolCalls(result.toolCalls, toolCall.id);
      }
    }

    this.onEvent(createEvent('error', 'Exhausted max tool calls', 'failed'), currentPage);
    const terminalProposal = await this.requestTerminalVerdict(currentPage);
    return {
      page: currentPage,
      proposal: this.stamp(terminalProposal, 'main_agent'),
    };
  }

  private async dispatchToolCall(
    toolCall: ChatCompletionMessageToolCall,
    currentPage: PageSummary,
  ): Promise<ToolDispatchResult> {
    if (toolCall.type !== 'function') {
      return {
        kind: 'terminal',
        proposal: {
          kind: 'review',
          country: null,
          phoneNumber: null,
          phoneNumbers: [],
          contactAccess: null,
          reasoning: 'Invalid tool call type',
          confidence: 0,
        },
      };
    }

    const toolName = toolCall.function.name;
    let args: Record<string, unknown> = {};
    try {
      args = JSON.parse(toolCall.function.arguments);
    } catch {
      return {
        kind: 'browser',
        result: {
          ok: false,
          errorCode: 'invalid_arguments',
          message: 'Failed to parse tool arguments',
          recoverable: true,
        },
      };
    }

    if (toolName === 'classify_as_escort' || toolName === 'classify_as_bad' || toolName === 'flag_for_review') {
      return this.handleTerminalTool(toolName, args);
    }

    if (this.subAI) {
      const toolExecution = await tools.execute(this.candidate, toolCall);
      if (toolExecution.kind === 'sub_ai') {
        return this.subAI.execute(toolExecution.toolName, toolExecution.args, currentPage);
      }
    }

    return this.handleBrowserTool(toolName, args, currentPage);
  }

  private async handleBrowserTool(
    name: string,
    args: Record<string, unknown>,
    currentPage: PageSummary,
  ): Promise<{ kind: 'browser'; result: BrowserToolResult }> {
    const { reason: reasonValue, ...argsWithoutReason } = args;
    const toolReasoning = typeof reasonValue === 'string' ? reasonValue : undefined;

    const toolEventId = randomUUID();
    const startedAt = new Date().toISOString();
    this.onEvent({
      ...createEvent(
        'tool',
        `TOOL - ${name}`,
        'running',
        toolEventId,
        undefined,
        JSON.stringify(argsWithoutReason, null, 2),
      ),
      reasoning: toolReasoning,
    });

    let execution: BrowserToolResult;

    if (!this.browserSession) {
      execution = {
        ok: false,
        errorCode: 'no_browser_session',
        message: 'Browser session is not available',
        recoverable: false,
      };
    } else {
      if (name === 'click_element') {
        const rawIds = args.elementIds;
        const elementIds = Array.isArray(rawIds)
          ? rawIds.map(String)
          : [String(args.elementId ?? rawIds)];
        execution = await this.browserSession.clickElement(elementIds);
      } else if (name === 'open_element_href') {
        const elementId = typeof args.elementId === 'string' ? args.elementId : null;
        const href = typeof args.href === 'string' ? args.href : null;
        execution = await this.browserSession.openElementHref(elementId, href);
      } else if (name === 'open_homepage') {
        execution = await this.browserSession.openHomepage();
      } else if (name === 'verify_phone_action') {
        const phoneArg = String(args.phoneNumber);
        const normalizedArgPhone = phoneSignals.normalizePhoneNumber(phoneArg);
        const alreadyVerified = this.ledger.verifiedPhoneNumbers.some((vp) =>
          phoneSignals.arePhoneNumbersEquivalent(vp, normalizedArgPhone),
        );
        if (alreadyVerified) {
          agentLedger.appendUnique(this.ledger.reusedVerifiedPhones, normalizedArgPhone ?? phoneArg, 16);
          const isAgencyPattern =
            this.ledger.isAgencyDetected ||
            (this.ledger.reusedVerifiedPhones.length >= 1 && this.ledger.visitedUrls.length >= 3);
          const agencyNote = isAgencyPattern
            ? ' This is consistent with an agency site where all escort profiles share a single central phone number. You have visited multiple profiles and confirmed the same phone number. You do NOT need a second distinct phone — submit your verdict now using classify_as_escort.'
            : ' Do not re-verify the same number — move on to find a different phone number on another profile.';
          execution = {
            ok: false,
            errorCode: 'already_verified',
            message: `Phone ${phoneArg} is already in the verified phones list.${agencyNote}`,
            recoverable: true,
          };
        } else {
          execution = await this.browserSession.verifyPhoneAction(phoneArg);
        }
      } else {
        execution = {
          ok: false,
          errorCode: 'unknown_tool',
          message: `Unknown browser tool: ${name}`,
          recoverable: false,
        };
      }
    }

    if (!execution.ok) {
      agentLedger.appendUnique(this.ledger.failedToolHistory, `${name}: ${execution.message}`);
      this.onEvent(
        {
          ...createEvent(
            'tool',
            `TOOL - ${name}`,
            'failed',
            toolEventId,
            undefined,
            JSON.stringify(argsWithoutReason, null, 2),
            undefined,
            undefined,
            JSON.stringify(execution, null, 2),
          ),
          reasoning: toolReasoning,
          createdAt: startedAt,
          completedAt: new Date().toISOString(),
        },
        currentPage,
      );

      if (name === 'click_element' && Array.isArray(args.elementIds)) {
        for (const id of args.elementIds as string[]) {
          agentLedger.appendUnique(this.ledger.failedClickElementIds, id, 32);
          if (this.ledger.revealPhoneElementIds.includes(id)) {
            this.ledger.failedPhoneRevealAttempts += 1;
          }
        }
      }
    } else {
      const diagnostics = await this.subAI!.buildDiagnostics(execution.page);

      this.onEvent(
        {
          ...createEvent(
            'tool',
            `TOOL - ${name}`,
            'done',
            toolEventId,
            undefined,
            JSON.stringify(argsWithoutReason, null, 2),
            diagnostics,
            undefined,
            JSON.stringify(this.trimBrowserToolResult(name, execution), null, 2),
          ),
          reasoning: toolReasoning,
          createdAt: startedAt,
          completedAt: new Date().toISOString(),
        },
        execution.page,
      );

      if (execution.page.url !== currentPage.url) {
        this.onEvent(createEvent('status', `Navigated to: ${execution.page.url}`), execution.page);
      }

      if (name === 'verify_phone_action' && typeof args.phoneNumber === 'string') {
        const normalizedPhone = phoneSignals.normalizePhoneNumber(args.phoneNumber);
        if (normalizedPhone) {
          agentLedger.appendUnique(this.ledger.verifiedPhoneNumbers, normalizedPhone, 16);
          this.ledger.hasVerifiedPhoneAction = true;
        }
      }

      if (name === 'click_element' && Array.isArray(args.elementIds)) {
        for (const id of args.elementIds as string[]) {
          if (this.ledger.revealPhoneElementIds.includes(id)) {
            this.ledger.hasPhoneRevealAttempt = true;
          }
        }
      }
    }

    return {
      kind: 'browser',
      result: execution,
    };
  }

  private async handleTerminalTool(name: string, args: Record<string, unknown>): Promise<{ kind: 'terminal'; proposal: ClassificationProposal }> {
    const execution = await tools.execute(this.candidate, { type: 'function', id: randomUUID(), function: { name, arguments: JSON.stringify(args) } });

    if (execution.kind !== 'terminal') {
      return {
        kind: 'terminal',
        proposal: {
          kind: 'review',
          country: null,
          phoneNumber: null,
          phoneNumbers: [],
          contactAccess: null,
          reasoning: 'Terminal tool execution failed',
          confidence: 0,
        },
      };
    }

    return {
      kind: 'terminal',
      proposal: {
        ...execution.proposal,
        phoneNumbers: execution.proposal.kind === 'escort' ? [...this.ledger.verifiedPhoneNumbers] : [],
      },
    };
  }

  private trimBrowserToolResult(name: string, result: BrowserToolResult): unknown {
    if (!result.ok) {
      return result;
    }

    const isNavigation = name === 'open_element_href' || name === 'open_homepage';
    if (isNavigation) {
      const { url, title, canGoBack, sameHostAsStart } = result.page;
      return {
        ok: true,
        page: { url, title, canGoBack, sameHostAsStart },
      };
    }

    const { url, title, pageFlags, canGoBack, sameHostAsStart } = result.page;
    return {
      ok: true,
      page: { url, title, pageFlags, canGoBack, sameHostAsStart },
    };
  }

  private buildToolResultMessage(result: unknown, currentPage: PageSummary): string {
    const statePrefix = [
      `Current URL: ${currentPage.url}`,
      `Current Title: ${currentPage.title || '(none)'}`,
      `Visited URLs: ${this.ledger.visitedUrls.slice(-8).join(', ') || '(none)'}`,
      `Verified Phones: ${this.ledger.verifiedPhoneNumbers.join(', ') || '(none)'}`,
      this.ledger.hasVerificationGatingDetected ? `Verification Gating: detected` : '',
      '',
    ].filter(Boolean).join('\n');

    let message = statePrefix + JSON.stringify(result);

    if (this.ledger.verifiedPhoneNumbers.length >= 2) {
      message += `\n\n[NOTE] Phone goal reached: ${this.ledger.verifiedPhoneNumbers.length} distinct verified phones (${this.ledger.verifiedPhoneNumbers.join(', ')}). Stop searching. Deliver your final verdict now using classify_as_escort.`;
    } else if (this.ledger.isAgencyDetected && this.ledger.verifiedPhoneNumbers.length >= 1) {
      message += `\n\n[NOTE] Agency site detected and phone verified (${this.ledger.verifiedPhoneNumbers.join(', ')}). Agency sites share one central phone — you do not need a second distinct number. Deliver your final verdict now using classify_as_escort.`;
    }

    return message;
  }

  private updateLedgerFromAnalysis(result: AnalyzePageResult): void {
    if (result.findings.escortListingDomain?.isEscortListing === 'yes') {
      this.ledger.escortEvidenceEstablished = true;
    }

    if (result.findings.escortListingDomain?.isAgency) {
      this.ledger.isAgencyDetected = true;
    }

    if (result.findings.escortListingDomain?.hasVerificationGating) {
      this.ledger.hasVerificationGatingDetected = true;
    }

    if (result.findings.hasEscortProfile?.found || result.findings.hasEscortList?.found) {
      this.ledger.escortEvidenceEstablished = true;
    }

    if (result.findings.hasEscortProfile !== undefined && !result.findings.hasEscortProfile.found) {
      this.ledger.profileNotFoundCount += 1;
    }

    if (result.findings.phoneSearchResult?.contactGated) {
      this.ledger.contactGatedDetected = true;
    }

    for (const phone of result.phoneNumbers) {
      const normalized = phoneSignals.normalizePhoneNumber(phone);
      if (normalized && !phoneSignals.isRealPhoneNumber(normalized)) {
        agentLedger.appendUnique(this.ledger.rejectedPhones, phone, 16);
      }
    }
  }

  /**
   * If the homepage has not been visited yet, navigate to it and run a has-country-select
   * analysis. Returns a note string to inject into the conversation, or null if skipped.
   */
  private async runHomepageCountryAnalysis(currentPage: PageSummary): Promise<string | null> {
    if (!this.subAI || !this.browserSession) {
      return null;
    }

    const homepageUrl = agentLedger.getHomepageUrl(currentPage.url);
    const alreadyVisitedHomepage = this.ledger.visitedUrls.some((u) => agentLedger.isHomepageUrl(u));

    let homepagePage = currentPage;

    if (!alreadyVisitedHomepage && homepageUrl) {
      this.onEvent(createEvent('status', 'Running homepage country selector analysis', 'running'), currentPage);
      const result = await this.browserSession.openHomepage();
      if (result.ok) {
        homepagePage = result.page;
        agentLedger.appendUnique(this.ledger.visitedUrls, homepagePage.url, 24);
      }
    } else if (!alreadyVisitedHomepage) {
      return null;
    }

    const analysis = await this.subAI.execute(
      'analyze_page',
      { modes: ['has-country-select'], reason: 'Homepage country selector analysis' },
      homepagePage,
    );

    if (analysis.kind !== 'analyze') {
      return null;
    }

    this.updateLedgerFromAnalysis(analysis.result);

    const countrySelect = analysis.result.findings.hasCountrySelect;
    if (!countrySelect) {
      return null;
    }

    if (countrySelect.found) {
      return `[Homepage country selector analysis] The homepage has a country/region selector — this site covers multiple countries. Use country: "general" in your classification.`;
    }

    if (countrySelect.detectedCountry) {
      return `[Homepage country selector analysis] No country selector found. The page clearly serves a single country: "${countrySelect.detectedCountry}". Use this as the country in your classification unless stronger evidence contradicts it.`;
    }

    return `[Homepage country selector analysis] No country selector found on the homepage.`;
  }

  private stubExtraToolCalls(toolCalls: ChatCompletionMessageToolCall[], primaryId: string): void {
    for (const extra of toolCalls) {
      if (extra.id !== primaryId) {
        this.conversation.addToolResult(
          extra.id,
          JSON.stringify({ ok: false, errorCode: 'stale_tool_call_skipped', message: 'Skipped because an earlier browser tool call may have changed the page.', recoverable: true }),
        );
      }
    }
  }

  private async requestTerminalVerdict(currentPage: PageSummary): Promise<ClassificationProposal> {
    this.conversation.addUserMessage(
      'Browser interaction limit reached. Do not call any more browser tools. Using only the accumulated evidence, return exactly one terminal decision tool now.\n' +
      '- If escort evidence is strong and a verified phone exists: classify_as_escort.\n' +
      '- If escort evidence is strong and the phone is gated by captcha, login wall, subscription, or human-verification: classify_as_escort with contactAccess="contact_gated". A gate is NOT a reason for review.\n' +
      '- If escort evidence is strong but no phone could be found despite attempts and no clear gate was detected: flag_for_review — do NOT classify as BAD just because no phone was found.\n' +
      '- If there is no meaningful escort evidence at all: classify_as_bad.\n' +
      '- If genuinely uncertain: flag_for_review with a concrete explanation of what was tried and what remains unclear.',
    );

    const maxAttempts = 2;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await this.conversation.complete({
          tools: tools.terminalToolDefinitions,
          toolChoice: 'required',
          temperature: 0.1,
        });

        const toolCall = result.toolCalls.find((entry: ChatCompletionMessageToolCall) => entry.type === 'function');
        if (!toolCall) {
          // Stub all tool calls so conversation remains valid if we retry.
          for (const tc of result.toolCalls) {
            this.conversation.addToolResult(tc.id, JSON.stringify({ ok: false, errorCode: 'no_function_call', message: 'No function tool call found.' }));
          }
          return {
            kind: 'review',
            country: null,
            phoneNumber: null,
            phoneNumbers: [],
            contactAccess: null,
            reasoning: 'Agent reached the maximum browser interaction limit and could not produce a final verdict.',
            confidence: 0,
          };
        }

        // Respond to any extra tool calls so the conversation invariant is maintained.
        this.stubExtraToolCalls(result.toolCalls, toolCall.id);

        const execution = await tools.execute(this.candidate, toolCall);
        if (execution.kind !== 'terminal') {
          return {
            kind: 'review',
            country: null,
            phoneNumber: null,
            phoneNumbers: [],
            contactAccess: null,
            reasoning: 'Agent reached the maximum browser interaction limit and did not return a terminal verdict.',
            confidence: 0,
          };
        }

        const validationResult = validation.validateProposal(execution.proposal, this.ledger, currentPage, this.candidate);
        if (!validationResult.ok) {
          if (attempt < maxAttempts - 1) {
            this.conversation.addToolResult(
              toolCall.id,
              JSON.stringify({
                ok: false,
                errorCode: 'validation_failed',
                message: validationResult.reason,
                recoverable: true,
              }),
            );
            this.conversation.addUserMessage(
              `Your verdict was rejected: ${validationResult.reason}\n` +
              'Read the rejection reason carefully and return a corrected terminal decision now.',
            );
            continue;
          }

          return {
            kind: 'review',
            country: null,
            phoneNumber: null,
            phoneNumbers: [],
            contactAccess: null,
            reasoning: `Agent reached the maximum browser interaction limit. Final verdict attempt was rejected: ${validationResult.reason}`,
            confidence: 0,
          };
        }

        return execution.proposal;
      } catch (error) {
        return {
          kind: 'review',
          country: null,
          phoneNumber: null,
          phoneNumbers: [],
          contactAccess: null,
          reasoning: `Failed to get terminal verdict: ${error}`,
          confidence: 0,
        };
      }
    }

    return {
      kind: 'review',
      country: null,
      phoneNumber: null,
      phoneNumbers: [],
      contactAccess: null,
      reasoning: 'Agent reached the maximum browser interaction limit and exhausted all terminal verdict attempts.',
      confidence: 0,
    };
  }
}

export const mainAgent = {
  create: (options: {
    client: OpenAI;
    model: string;
    candidate: DomainCandidate;
    onEvent: EventCallback;
    browserSession?: BrowserSession;
    signal?: AbortSignal;
    siblingBadDomains?: string[];
    siblingEscortDomains?: EscortDomainEntry[];
  }) => new MainAgent(options),
};
