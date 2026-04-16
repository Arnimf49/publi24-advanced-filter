import type { ChatCompletionMessageToolCall } from 'openai/resources/chat/completions';
import type { ClassificationProposal, DomainCandidate } from '../types/tools.js';
import { definitions, terminalToolDefinitions } from './definitions.js';

type TerminalExecution = {
  kind: 'terminal';
  proposal: ClassificationProposal;
};

type SubAIExecution = {
  kind: 'sub_ai';
  toolName: string;
  args: Record<string, unknown>;
};

type ToolExecution = TerminalExecution | SubAIExecution;

const subAIToolNames = new Set([
  'analyze_page',
  'get_actionable_elements',
]);

const parseArguments = (toolCall: ChatCompletionMessageToolCall): Record<string, unknown> => {
  if (toolCall.type !== 'function') {
    throw new Error(`Unsupported tool call type: ${toolCall.type}`);
  }

  try {
    return JSON.parse(toolCall.function.arguments);
  } catch (error) {
    throw new Error(`Invalid arguments for ${toolCall.function.name}: ${String(error)}`);
  }
};

const execute = async (_candidate: DomainCandidate, toolCall: ChatCompletionMessageToolCall): Promise<ToolExecution> => {
  if (toolCall.type !== 'function') {
    return {
      kind: 'terminal',
        proposal: {
          kind: 'review',
          country: null,
          phoneNumber: null,
          phoneNumbers: [],
          contactAccess: null,
          reasoning: `Unsupported tool call type: ${toolCall.type}`,
          confidence: 0,
        },
    };
  }

  const args = parseArguments(toolCall);
  const { name } = toolCall.function;

  if (subAIToolNames.has(name)) {
    return {
      kind: 'sub_ai',
      toolName: name,
      args,
    };
  }

  if (name === 'classify_as_escort') {
    return {
      kind: 'terminal',
      proposal: {
        kind: 'escort',
        country: String(args.country).trim().toLowerCase(),
        phoneNumber: typeof args.phoneNumber === 'string' ? String(args.phoneNumber).trim() : null,
        phoneNumbers: [],
        contactAccess:
          args.contactAccess === 'contact_gated'
            ? 'contact_gated'
            : args.contactAccess === 'shared_venue_phone'
              ? 'shared_venue_phone'
              : 'phone_visible',
        reasoning: String(args.reasoning),
        confidence: Number(args.confidence),
      },
    };
  }

  if (name === 'classify_as_bad') {
    return {
      kind: 'terminal',
      proposal: {
        kind: 'bad',
        country: null,
        phoneNumber: null,
        phoneNumbers: [],
        contactAccess: null,
        reasoning: String(args.reasoning),
        confidence: Number(args.confidence),
      },
    };
  }

  return {
    kind: 'terminal',
      proposal: {
        kind: 'review',
        country: null,
        phoneNumber: null,
        phoneNumbers: [],
        contactAccess: null,
        reasoning: String(args.reasoning ?? 'Manual review requested by AI.'),
        confidence: 0,
      },
  };
};

export const tools = {
  execute,
  toolDefinitions: definitions,
  terminalToolDefinitions,
};

export const dispatch = {
  execute,
};
