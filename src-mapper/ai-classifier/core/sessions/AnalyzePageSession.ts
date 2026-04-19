import type OpenAI from 'openai';
import type { ChatCompletionTool, ChatCompletionMessageToolCall } from 'openai/resources/chat/completions';
import { llmConversation } from '../llmConversation.js';
import { subSessionContext } from '../subSessionContext.js';
import type { PageSnapshot, PageDiff } from '../subSessionContext.js';
import type { AgentEvent } from '../../types/agent.js';
import { MODE_PROMPTS } from './analyzePageModes.js';
import { extraction } from '../../browser/extraction.js';
import { loadPrompt } from '../../prompts/loadPrompt.js';

const SYSTEM_PROMPT = loadPrompt('analyzePageSystem.md');

const { LlmConversation } = llmConversation;
const { SubSessionContext } = subSessionContext;

type EventCallback = (event: AgentEvent) => void;

interface FindingResult {
  reason: string;
  suggestedActions: string[] | null;
  data: unknown;
}

export interface AnalyzePageResult {
  reasoning: string;
  suggestedActions: string[];
  findings: {
    escortListingDomain?: {
      isEscortListing: 'yes' | 'no' | 'maybe';
      isAgency: boolean | null;
      hasVerificationGating: boolean;
      topNavigation: string[] | null;
    };
    hasEscortProfile?: {
      found: boolean;
      hasProfileRevealingButtons: boolean;
      profilePages: string[] | null;
    };
    hasEscortList?: {
      found: boolean;
      escortProfileUrls: string[] | null;
      mightFindListOnPage: string[] | null;
    };
    hasCountrySelect?: {
      found: boolean;
      detectedCountry: string | null;
      nextBestPages: string[] | null;
    };
    phoneSearchResult?: {
      phonesFound: boolean;
      contactGated: boolean;
    };
    pageChange?: {
      reasoning: string;
    };
    registeredPhoneNumbers?: string[];
  };
  phoneNumbers: string[];
}

const ANALYZE_TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'set_escort_listing_domain',
      description: 'Set the verdict for whether this domain is an escort listing site.',
      parameters: {
        type: 'object',
        properties: {
          isEscortListing: {
            type: 'string',
            enum: ['yes', 'no', 'maybe'],
            description: 'Is this an escort listing site?',
          },
          reason: {
            type: 'string',
            description: 'Explanation for the verdict.',
          },
          isAgency: {
            type: ['boolean', 'null'],
            description: 'Is this operated by an agency? null if unknown.',
          },
          topNavigation: {
            type: ['array', 'null'],
            items: { type: 'string' },
            description: 'Navigation targets for maybe verdicts. null otherwise.',
          },
          hasVerificationGating: {
            type: 'boolean',
            description: 'True if any overlay or gate blocks access to content (age verification, cookie consent, adult content warning, GDPR screen, etc). False only when content is fully accessible.',
          },
          suggestedActions: {
            type: ['array', 'null'],
            items: { type: 'string' },
            description: 'Ordered list of suggested next actions for the main agent based on these findings. null if no actions needed.',
          },
        },
        required: ['isEscortListing', 'reason'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_has_escort_profile',
      description: 'Set the verdict for whether the current page contains an individual escort profile.',
      parameters: {
        type: 'object',
        properties: {
          found: {
            type: 'boolean',
            description: 'Does this page contain an escort profile?',
          },
          reason: {
            type: 'string',
            description: 'Explanation for the verdict.',
          },
          hasProfileRevealingButtons: {
            type: 'boolean',
            description: 'True if the profile page has buttons/links that can reveal more profile details, navigate to a full profile, or open a contact/messaging flow — e.g. "View profile", "See full ad", "More details", "Contact", WhatsApp/Telegram links, or any CTA that leads to the escort\'s dedicated page or expands their contact info. False if the current page already shows the complete profile with no further reveal step needed.',
          },
          profilePages: {
            type: ['array', 'null'],
            items: { type: 'string' },
            description: 'URLs or paths of pages that look like individual escort profile pages (e.g. /escorts/anna/, /profile/12345). Must be profile-detail paths, NOT listing/category pages. null if not applicable.',
          },
          suggestedActions: {
            type: ['array', 'null'],
            items: { type: 'string' },
            description: 'Ordered list of suggested next actions for the main agent. null if no actions needed.',
          },
        },
        required: ['found', 'hasProfileRevealingButtons', 'reason'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_has_escort_list',
      description: 'Set the verdict for whether the current page contains a list of escorts.',
      parameters: {
        type: 'object',
        properties: {
          found: {
            type: 'boolean',
            description: 'Does this page contain an escort list?',
          },
          reason: {
            type: 'string',
            description: 'Explanation for the verdict.',
          },
          escortProfileUrls: {
            type: ['array', 'null'],
            items: { type: 'string' },
            description: 'URLs of individual escort profiles found on this page. null if not applicable.',
          },
          mightFindListOnPage: {
            type: ['array', 'null'],
            items: { type: 'string' },
            description: 'URLs or paths of pages where an escort listing might exist (e.g. /escorts/, /girls/, /city-name/). null if not applicable.',
          },
          suggestedActions: {
            type: ['array', 'null'],
            items: { type: 'string' },
            description: 'Ordered list of suggested next actions for the main agent. null if no actions needed.',
          },
        },
        required: ['found', 'reason'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_has_country_select',
      description: 'Set the verdict for whether the page has a country/location selector.',
      parameters: {
        type: 'object',
        properties: {
          found: {
            type: 'boolean',
            description: 'Does this page have a country selector?',
          },
          reason: {
            type: 'string',
            description: 'Explanation for the verdict.',
          },
          nextBestPages: {
            type: ['array', 'null'],
            items: { type: 'string' },
            description: 'URLs or element IDs of pages likely to have country selectors. null if not applicable.',
          },
          detectedCountry: {
            type: ['string', 'null'],
            description: 'When found is false: if the page clearly serves a single country, provide the ISO 3166-1 alpha-2 country code (lowercase, e.g. "es", "ro", "de"). null if unclear or multi-country.',
          },
          suggestedActions: {
            type: ['array', 'null'],
            items: { type: 'string' },
            description: 'Ordered list of suggested next actions for the main agent. null if no actions needed.',
          },
        },
        required: ['found', 'reason'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_phone_search_result',
      description: 'Set the verdict for phone number visibility on this page.',
      parameters: {
        type: 'object',
        properties: {
          phonesFound: {
            type: 'boolean',
            description: 'Are phone numbers visible on this page?',
          },
          contactGated: {
            type: 'boolean',
            description: 'Is contact access blocked by any gate — subscription/login wall, captcha, human-verification challenge, or other mechanism that prevents phone access?',
          },
          reason: {
            type: 'string',
            description: 'Explanation for the verdict.',
          },
          suggestedActions: {
            type: ['array', 'null'],
            items: { type: 'string' },
            description: 'Suggested actions to reveal phone numbers. null if not applicable.',
          },
        },
        required: ['phonesFound', 'contactGated', 'reason'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_page_change',
      description: 'Report what changed on the page as a result of the last action.',
      parameters: {
        type: 'object',
        properties: {
          reasoning: {
            type: 'string',
            description: 'Plain language description of what changed.',
          },
        },
        required: ['reasoning'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'register_phone_numbers',
      description: 'Register phone numbers you can visually read on the page. Call this ONLY when set_has_escort_profile was called with found=true. Include numbers found in plain text, masked placeholders, WhatsApp/Telegram hrefs (e.g. wa.me/+43...), or any other visible contact.',
      parameters: {
        type: 'object',
        properties: {
          phoneNumbers: {
            type: 'array',
            items: { type: 'string' },
            description: 'Phone numbers exactly as seen on the page, including country prefix if visible (e.g. "+43 660 1234567", "0660 1234567", "+4366565704603").',
          },
        },
        required: ['phoneNumbers'],
        additionalProperties: false,
      },
    },
  },
];

export class AnalyzePageSession {
  private conversation: InstanceType<typeof LlmConversation>;
  private context: InstanceType<typeof SubSessionContext>;
  private findings: Map<string, FindingResult>;

  private targetHostname: string;

  constructor(client: OpenAI, model: string, pageUrl: string) {
    this.conversation = new LlmConversation(client, model);
    this.context = new SubSessionContext();
    this.findings = new Map();
    try {
      this.targetHostname = new URL(pageUrl).hostname;
    } catch {
      this.targetHostname = '';
    }
    this.conversation.addSystemMessage(SYSTEM_PROMPT);
  }

  async analyze(
    modes: string[],
    pageSnapshot: PageSnapshot,
    onEvent: EventCallback,
    mainAIReasoning?: string,
  ): Promise<AnalyzePageResult> {
    // Reset findings for this call — findings from previous calls must not bleed through
    this.findings = new Map();
    const newModes = this.context.getNewModes(modes);

    // Always pass the original modes to the user message builder so the Run header is correct.
    // When some modes are already in history (newModes is a subset), append a reminder line
    // at the end so the sub-AI knows exactly which mode(s) to execute now.
    const userMessage = this.buildUserMessage(pageSnapshot, modes, newModes, mainAIReasoning);

    let modeInstructions: string | undefined;
    if (newModes.length > 0) {
      modeInstructions = this.buildModeInstructions(newModes);
      this.conversation.addSystemMessage(modeInstructions);
      newModes.forEach((mode) => {
        if (mode !== 'describe-difference') {
          this.context.markModeInjected(mode);
        }
      });
    }

    this.conversation.addUserMessage(userMessage);

    this.context.updateSnapshot(pageSnapshot);

    const sentContext = modeInstructions
      ? `${modeInstructions}\n\n---\n\n${userMessage}`
      : userMessage;

    const eventId = this.generateEventId();
    onEvent({
      id: eventId,
      state: 'running',
      type: 'ai',
      message: `Analyzing page with modes: ${modes.join(', ')}`,
      request: sentContext,
      createdAt: new Date().toISOString(),
    });

    let result;
    try {
      result = await this.conversation.complete({
        tools: ANALYZE_TOOLS,
        toolChoice: 'required',
        temperature: 0.1,
      });

      onEvent({
        id: eventId,
        state: 'done',
        type: 'ai',
        message: `Analysis complete`,
        createdAt: new Date().toISOString(),
        tokenUsage: {
          scope: 'sub',
          input: result.usage.input,
          cachedInput: result.usage.cachedInput,
          output: result.usage.output,
          total: result.usage.total,
        },
      });
    } catch (error) {
      onEvent({
        id: eventId,
        state: 'failed',
        type: 'error',
        message: `Analysis failed: ${String(error)}`,
        createdAt: new Date().toISOString(),
      });
      throw error;
    }

    if (result.toolCalls.length === 0) {
      throw new Error('LLM did not call any setter tools');
    }

    for (const toolCall of result.toolCalls) {
      const toolResult = this.executeToolCall(toolCall, onEvent);
      this.conversation.addToolResult(toolCall.id, toolResult);

      // Early return gate: if the domain is classified as not an escort listing,
      // stop immediately — remaining tool calls from this batch are irrelevant.
      if (
        toolCall.type === 'function' &&
        toolCall.function.name === 'set_escort_listing_domain'
      ) {
        const finding = this.findings.get('escortListingDomain');
        if (finding) {
          const data = finding.data as NonNullable<AnalyzePageResult['findings']['escortListingDomain']>;
          if (data.isEscortListing === 'no') {
            return this.buildResult(pageSnapshot);
          }
        }
      }
    }

    return this.buildResult(pageSnapshot);
  }

  private buildUserMessage(pageSnapshot: PageSnapshot, modes: string[], newModes: string[], mainAIReasoning?: string): string {
    const diff = this.context.computeDiff(pageSnapshot);

    let content = diff === null
      ? this.buildFullContext(pageSnapshot, modes)
      : this.buildDiffContext(pageSnapshot, diff, modes);

    if (mainAIReasoning) {
      content = `**Agent context:** ${mainAIReasoning}\n\n${content}`;
    }

    // When all requested modes are already in history (no new system message injected),
    // append an explicit reminder so the sub-AI knows which mode to run against this update.
    if (newModes.length === 0 && modes.length > 0) {
      return `${content}\n\n**Please run now your analysis for modes: ${modes.join(', ')}** (instructions already provided above).`;
    }

    return content;
  }

  private buildFullContext(pageSnapshot: PageSnapshot, modes: string[]): string {
    const parts: string[] = [];

    parts.push(`# Page Analysis`);
    parts.push('');
    parts.push(`## Page`);
    parts.push(`URL: ${pageSnapshot.url}`);
    parts.push(`Title: ${pageSnapshot.title}`);
    parts.push('');
    parts.push(`## Content`);
    parts.push(pageSnapshot.structuredText);
    parts.push('');
    parts.push(`**Please run now your analysis for modes: ${modes.join(', ')}**`);

    return parts.join('\n');
  }

  private buildDiffContext(
    pageSnapshot: PageSnapshot,
    diff: PageDiff,
    modes: string[],
  ): string {
    const parts: string[] = [];

    parts.push(`# Page Update`);
    parts.push('');

    if (diff.urlChanged) {
      parts.push(`## URL Changed`);
      parts.push(`New URL: ${pageSnapshot.url}`);
      parts.push('');
    }

    if (diff.titleChanged) {
      parts.push(`## Title Changed`);
      parts.push(`New title: ${pageSnapshot.title}`);
      parts.push('');
    }

    for (const fieldDiff of diff.textFields) {
      parts.push(`## Content changes`);
      if (fieldDiff.addedLines.length > 0) {
        parts.push(`### Added`);
        parts.push(fieldDiff.addedLines.map((l) => `+ ${l}`).join('\n'));
        parts.push('');
      }
      if (fieldDiff.removedLines.length > 0) {
        parts.push(`### Removed`);
        parts.push(fieldDiff.removedLines.map((l) => `- ${l}`).join('\n'));
        parts.push('');
      }
    }

    const hasChanges = parts.length > 2;
    if (!hasChanges) {
      parts.push('No changes detected since last call.');
    } else {
      parts.push('Changes detected since last call. Prefer selecting elements from the added changes. Also consider not selecting ones that were removed.');
    }

    parts.push('');
    parts.push(`**Please run now your analysis for modes: ${modes.join(', ')}**`);

    return parts.join('\n');
  }

  private filterSameHostUrls(urls: unknown): string[] | null {
    if (!Array.isArray(urls)) {
      return null;
    }
    const filtered = (urls as string[]).filter((url) => {
      if (typeof url !== 'string') {
        return false;
      }
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return true;
      }
      try {
        return new URL(url).hostname === this.targetHostname;
      } catch {
        return false;
      }
    });
    return filtered.length > 0 ? filtered : null;
  }

  private buildModeInstructions(modes: string[]): string {
    const parts: string[] = [];

    parts.push(`# Mode Instructions`);
    parts.push('');

    for (const mode of modes) {
      if (mode === 'full') {
        for (const [key, prompt] of Object.entries(MODE_PROMPTS)) {
          if (key !== 'full') {
            parts.push(`## Mode: ${key}`);
            parts.push(prompt);
            parts.push('');
          }
        }
        parts.push(`## Combined Analysis`);
        parts.push(MODE_PROMPTS['full']);
        parts.push('');
      } else {
        const prompt = MODE_PROMPTS[mode];
        if (prompt) {
          parts.push(`## Mode: ${mode}`);
          parts.push(prompt);
          parts.push('');
        }
      }
    }

    return parts.join('\n');
  }

  private executeToolCall(toolCall: ChatCompletionMessageToolCall, onEvent: EventCallback): string {
    if (toolCall.type !== 'function') {
      throw new Error(`Unsupported tool call type: ${toolCall.type}`);
    }

    const { name } = toolCall.function;
    const args = this.parseToolArguments(toolCall);

    let resultMessage: string = '';

    if (name === 'set_escort_listing_domain') {
      this.findings.set('escortListingDomain', {
        reason: String(args.reason),
        suggestedActions: (args.suggestedActions as string[] | null) ?? null,
        data: {
          isEscortListing: args.isEscortListing,
          isAgency: args.isAgency ?? null,
          hasVerificationGating: args.hasVerificationGating === true,
          topNavigation: args.isEscortListing === 'maybe' ? (args.topNavigation ?? null) : null,
        },
      });
      resultMessage = `Verdict recorded: ${args.isEscortListing}`;
    } else if (name === 'set_has_escort_profile') {
      this.findings.set('hasEscortProfile', {
        reason: String(args.reason),
        suggestedActions: (args.suggestedActions as string[] | null) ?? null,
        data: {
          found: Boolean(args.found),
          hasProfileRevealingButtons: Boolean(args.hasProfileRevealingButtons),
          profilePages: this.filterSameHostUrls(args.profilePages),
        },
      });
      resultMessage = `Verdict recorded: ${args.found ? 'found' : 'not found'}`;
    } else if (name === 'set_has_escort_list') {
      this.findings.set('hasEscortList', {
        reason: String(args.reason),
        suggestedActions: (args.suggestedActions as string[] | null) ?? null,
        data: {
          found: Boolean(args.found),
          escortProfileUrls: this.filterSameHostUrls(args.escortProfileUrls),
          mightFindListOnPage: this.filterSameHostUrls(args.mightFindListOnPage),
        },
      });
      resultMessage = `Verdict recorded: ${args.found ? 'found' : 'not found'}`;
    } else if (name === 'set_has_country_select') {
      this.findings.set('hasCountrySelect', {
        reason: String(args.reason),
        suggestedActions: (args.suggestedActions as string[] | null) ?? null,
        data: {
          found: Boolean(args.found),
          detectedCountry: typeof args.detectedCountry === 'string' ? args.detectedCountry.toLowerCase() : null,
          nextBestPages: this.filterSameHostUrls(args.nextBestPages),
        },
      });
      resultMessage = `Verdict recorded: ${args.found ? 'found' : 'not found'}${args.detectedCountry ? ` (detected country: ${args.detectedCountry})` : ''}`;
    } else if (name === 'set_phone_search_result') {
      this.findings.set('phoneSearchResult', {
        reason: String(args.reason),
        suggestedActions: (args.suggestedActions as string[] | null) ?? null,
        data: {
          phonesFound: Boolean(args.phonesFound),
          contactGated: Boolean(args.contactGated),
        },
      });
      resultMessage = `Verdict recorded: phones ${args.phonesFound ? 'found' : 'not found'}, contact ${args.contactGated ? 'gated' : 'not gated'}`;
    } else if (name === 'set_page_change') {
      this.findings.set('pageChange', {
        reason: String(args.reasoning),
        suggestedActions: null,
        data: { reasoning: String(args.reasoning) },
      });
      resultMessage = `Page change recorded`;
    } else if (name === 'register_phone_numbers') {
      const phones = Array.isArray(args.phoneNumbers) ? args.phoneNumbers.map(String) : [];
      this.findings.set('registeredPhoneNumbers', {
        reason: `AI registered ${phones.length} phone number(s)`,
        suggestedActions: null,
        data: phones,
      });
      resultMessage = `Registered phones: ${phones.join(', ') || '(none)'}`;
    } else {
    }

    const eventId = this.generateEventId();
    onEvent({
      id: eventId,
      state: 'done',
      type: 'tool',
      message: `TOOL - ${name}`,
      request: JSON.stringify(args, null, 2),
      result: JSON.stringify(this.findings.get(name.replace('set_', ''))?.data, null, 2),
      createdAt: new Date().toISOString(),
    });

    return resultMessage;
  }

  private parseToolArguments(toolCall: ChatCompletionMessageToolCall): Record<string, unknown> {
    if (toolCall.type !== 'function') {
      throw new Error(`Unsupported tool call type: ${toolCall.type}`);
    }

    try {
      return JSON.parse(toolCall.function.arguments);
    } catch (error) {
      throw new Error(`Invalid arguments for ${toolCall.function.name}: ${String(error)}`);
    }
  }

  private buildResult(pageSnapshot: PageSnapshot): AnalyzePageResult {
    const findings: AnalyzePageResult['findings'] = {};
    const reasoningParts: string[] = [];
    const suggestedActions: string[] = [];

    const escortListingDomain = this.findings.get('escortListingDomain');
    if (escortListingDomain) {
      const data = escortListingDomain.data as NonNullable<AnalyzePageResult['findings']['escortListingDomain']>;
      findings.escortListingDomain = data;
      const gateNote = data.hasVerificationGating
        ? ' Verification gating detected, close all blocking overlays before attempting other click actions.'
        : '';
      reasoningParts.push(`Domain verdict: ${escortListingDomain.reason}${gateNote}`);
      if (data.hasVerificationGating) {
        suggestedActions.push(`Overlay/gate detected. Use get_actionable_elements(mode: 'accept-verification') to dismiss all blocking modals before re-analyzing.`);
      }
      if (escortListingDomain.suggestedActions) {
        suggestedActions.push(...escortListingDomain.suggestedActions);
      }
    }

    const hasEscortProfile = this.findings.get('hasEscortProfile');
    if (hasEscortProfile) {
      findings.hasEscortProfile = hasEscortProfile.data as AnalyzePageResult['findings']['hasEscortProfile'];
      reasoningParts.push(`Escort profile: ${hasEscortProfile.reason}`);
      if (findings.hasEscortProfile?.hasProfileRevealingButtons) {
        suggestedActions.push(`Profile has revealing buttons. You should try to click them to reveal profile information.`);
      }
      if (hasEscortProfile.suggestedActions) {
        suggestedActions.push(...hasEscortProfile.suggestedActions);
      }
    }

    const hasEscortList = this.findings.get('hasEscortList');
    if (hasEscortList) {
      findings.hasEscortList = hasEscortList.data as AnalyzePageResult['findings']['hasEscortList'];
      reasoningParts.push(`Escort list: ${hasEscortList.reason}`);
      if (hasEscortList.suggestedActions) {
        suggestedActions.push(...hasEscortList.suggestedActions);
      }
    }

    const hasCountrySelect = this.findings.get('hasCountrySelect');
    if (hasCountrySelect) {
      findings.hasCountrySelect = hasCountrySelect.data as AnalyzePageResult['findings']['hasCountrySelect'];
      reasoningParts.push(`Country select: ${hasCountrySelect.reason}`);
      if (hasCountrySelect.suggestedActions) {
        suggestedActions.push(...hasCountrySelect.suggestedActions);
      }
    }

    const phoneSearchResult = this.findings.get('phoneSearchResult');
    if (phoneSearchResult) {
      findings.phoneSearchResult = phoneSearchResult.data as AnalyzePageResult['findings']['phoneSearchResult'];
      reasoningParts.push(`Phone search: ${phoneSearchResult.reason}`);
      if (phoneSearchResult.suggestedActions) {
        suggestedActions.push(...phoneSearchResult.suggestedActions);
      }
    }

    const pageChange = this.findings.get('pageChange');
    if (pageChange) {
      findings.pageChange = pageChange.data as AnalyzePageResult['findings']['pageChange'];
      reasoningParts.push(`Page change: ${pageChange.reason}`);
    }

    const registeredEntry = this.findings.get('registeredPhoneNumbers');
    const registeredPhones: string[] = registeredEntry ? (registeredEntry.data as string[]) : [];
    if (registeredPhones.length > 0) {
      findings.registeredPhoneNumbers = registeredPhones;
    }

    const extracted = this.extractPhoneNumbers(pageSnapshot, findings);
    const phoneNumbers = [...new Set([...extracted, ...registeredPhones])];

    return {
      reasoning: reasoningParts.join('\n'),
      suggestedActions,
      findings,
      phoneNumbers,
    };
  }

  private extractPhoneNumbers(
    pageSnapshot: PageSnapshot,
    findings: AnalyzePageResult['findings'],
  ): string[] {
    const shouldExtract =
      findings.hasEscortProfile?.found === true ||
      findings.hasEscortList?.found === true;

    if (!shouldExtract) {
      return [];
    }

    const fromText = extraction.extractPhoneCandidatesFromText(pageSnapshot.structuredText);
    const fromHrefs = pageSnapshot.actionableElements.flatMap((el) =>
      el.href ? extraction.extractPhoneCandidatesFromContactHref(el.href) : [],
    );

    return [...new Set([...fromText, ...fromHrefs])];
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
