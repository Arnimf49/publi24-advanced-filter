import type OpenAI from 'openai';
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
  ChatCompletionMessageToolCall,
} from 'openai/resources/chat/completions';
import type { ResponseFormatJSONSchema } from 'openai/resources/shared';

/**
 * Token usage statistics from an LLM API call.
 */
export interface TokenUsage {
  input: number;
  cachedInput: number;
  output: number;
  total: number;
}

/**
 * Manages a persistent LLM conversation with message history and API interaction.
 *
 * This class handles:
 * - Building and maintaining a conversation message array
 * - Making OpenAI API completion calls
 * - Automatically appending assistant responses to conversation history
 * - Token-based conversation trimming
 *
 * **Critical invariant:** Callers MUST add a tool result message (via `addToolResult`)
 * for every tool call returned by `complete()`. The conversation cannot proceed
 * correctly if tool calls are left unanswered.
 *
 * **Usage pattern:**
 * ```ts
 * const conversation = new LlmConversation(client, 'gpt-4');
 * conversation.addSystemMessage('You are a helpful assistant.');
 * conversation.addUserMessage('Hello!');
 *
 * const result = await conversation.complete({});
 * if (result.toolCalls.length > 0) {
 *   for (const call of result.toolCalls) {
 *     // Execute tool...
 *     conversation.addToolResult(call.id, toolOutput);
 *   }
 * }
 * ```
 */
export class LlmConversation {
  private messages: ChatCompletionMessageParam[];
  private client: OpenAI;
  private model: string;

  /**
   * Creates a new LLM conversation manager.
   *
   * @param client - The OpenAI client instance to use for API calls
   * @param model - The model identifier (e.g., 'gpt-4', 'gpt-3.5-turbo')
   */
  constructor(client: OpenAI, model: string) {
    this.messages = [];
    this.client = client;
    this.model = model;
  }

  /**
   * Adds a system message to the conversation.
   * System messages set the behavior and context for the assistant.
   *
   * @param content - The system message content
   */
  addSystemMessage(content: string): void {
    this.messages.push({
      role: 'system',
      content,
    });
  }

  /**
   * Adds a user message to the conversation.
   *
   * @param content - The user message content
   */
  addUserMessage(content: string): void {
    this.messages.push({
      role: 'user',
      content,
    });
  }

  /**
   * Adds a tool result message to the conversation.
   *
   * **Important:** This MUST be called for every tool call returned by `complete()`.
   * Failing to provide results for all tool calls will break the conversation flow.
   *
   * @param toolCallId - The ID of the tool call being responded to
   * @param content - The tool execution result as a string
   */
  addToolResult(toolCallId: string, content: string): void {
    this.messages.push({
      role: 'tool',
      tool_call_id: toolCallId,
      content,
    });
  }

  /**
   * Requests a completion from the LLM and automatically adds the assistant's
   * response to the conversation history.
   *
   * The returned tool calls (if any) MUST all receive responses via `addToolResult()`
   * before the next `complete()` call.
   *
   * @param options - Completion options
   * @param options.tools - Available tools the model can call
   * @param options.toolChoice - How the model should choose tools ('auto', 'required', 'none')
   * @param options.temperature - Sampling temperature (0-2)
   * @param options.responseFormat - JSON schema for structured output
   *
   * @returns The assistant's tool calls, text content, and token usage
   * @throws If the API call fails or returns an invalid response
   */
  async complete(options: {
    tools?: ChatCompletionTool[];
    toolChoice?: 'auto' | 'required' | 'none';
    temperature?: number;
    responseFormat?: ResponseFormatJSONSchema;
  }): Promise<{
    toolCalls: ChatCompletionMessageToolCall[];
    content: string | null;
    usage: TokenUsage;
  }> {
    const { tools, toolChoice, temperature, responseFormat } = options;

    const completionOptions: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
      model: this.model,
      messages: this.messages,
    };

    if (tools !== undefined && tools.length > 0) {
      completionOptions.tools = tools;
    }

    if (toolChoice !== undefined) {
      completionOptions.tool_choice = toolChoice;
    }

    if (temperature !== undefined) {
      completionOptions.temperature = temperature;
    }

    if (responseFormat !== undefined) {
      completionOptions.response_format = responseFormat;
    }

    const response = await this.client.chat.completions.create(completionOptions);

    const choice = response.choices[0];
    if (!choice) {
      throw new Error('OpenAI API returned no choices');
    }

    const assistantMessage = choice.message;

    // Add the assistant's message to conversation history
    this.messages.push({
      role: 'assistant',
      content: assistantMessage.content,
      tool_calls: assistantMessage.tool_calls,
    });

    const usage = response.usage;
    if (!usage) {
      throw new Error('OpenAI API returned no usage information');
    }

    return {
      toolCalls: assistantMessage.tool_calls || [],
      content: assistantMessage.content,
      usage: {
        input: usage.prompt_tokens,
        cachedInput: usage.prompt_tokens_details?.cached_tokens ?? 0,
        output: usage.completion_tokens,
        total: usage.total_tokens,
      },
    };
  }

  /**
   * Trims the conversation to fit within a maximum token budget by removing
   * older messages while preserving the most recent context.
   *
   * **Note:** This is a simple implementation that removes messages from the front
   * of the conversation. A production implementation should use proper token counting
   * and preserve system messages.
   *
   * @param maxTokens - The maximum number of tokens to retain (rough estimate)
   */
  trimToFit(maxTokens: number): void {
    // Rough estimate: 4 characters per token
    const estimatedCharsPerToken = 4;
    const targetChars = maxTokens * estimatedCharsPerToken;

    let currentChars = 0;
    for (const message of this.messages) {
      if (typeof message.content === 'string') {
        currentChars += message.content.length;
      }
    }

    // Remove messages from the front until we're under budget
    while (currentChars > targetChars && this.messages.length > 1) {
      const removed = this.messages.shift();
      if (removed && typeof removed.content === 'string') {
        currentChars -= removed.content.length;
      }
    }
  }

  /**
   * Gets the current number of messages in the conversation.
   */
  get messageCount(): number {
    return this.messages.length;
  }
}

export const llmConversation = {
  LlmConversation,
};
