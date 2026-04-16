import type { ActionableElement } from './browser.js';

export interface AgentEvent {
  id: string;
  parentId?: string;
  state: 'running' | 'done' | 'failed';
  type: 'ai' | 'status' | 'tool' | 'decision' | 'error';
  message: string;
  request?: string;
  response?: string;
  result?: string;
  reasoning?: string;
  createdAt: string;
  completedAt?: string;
  tokenUsage?: {
    scope?: 'main' | 'sub';
    input: number;
    cachedInput: number;
    output: number;
    total: number;
  };
  diagnostics?: {
    url: string;
    title: string;
    summary: string;
    sentContext?: string;
    actionableElements: ActionableElement[];
    rawHtml: string;
  };
}
