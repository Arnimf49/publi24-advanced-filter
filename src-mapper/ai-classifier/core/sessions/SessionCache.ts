import type OpenAI from 'openai';
import { AnalyzePageSession } from './AnalyzePageSession.js';
import { actionableElementsSession } from './ActionableElementsSession.js';
import type { ActionableElementsSession } from './ActionableElementsSession.js';

const analyzePageSession = {
  create: (client: OpenAI, model: string, pageUrl: string) => new AnalyzePageSession(client, model, pageUrl),
};

class SessionCache {
  private analyzeSessions: Map<string, AnalyzePageSession>;
  private actionableSessions: Map<string, ActionableElementsSession>;

  constructor() {
    this.analyzeSessions = new Map();
    this.actionableSessions = new Map();
  }

  getOrCreateAnalyze(
    client: OpenAI,
    model: string,
    pageUrl: string,
  ): AnalyzePageSession {
    const key = this.normalizeUrlForKey(pageUrl);

    if (!this.analyzeSessions.has(key)) {
      const session = analyzePageSession.create(client, model, pageUrl);
      this.analyzeSessions.set(key, session);
    }

    return this.analyzeSessions.get(key)!;
  }

  getOrCreateActionable(
    client: OpenAI,
    model: string,
    pageUrl: string,
  ): ActionableElementsSession {
    const key = this.normalizeUrlForKey(pageUrl);

    if (!this.actionableSessions.has(key)) {
      const session = actionableElementsSession.create(client, model, pageUrl);
      this.actionableSessions.set(key, session);
    }

    return this.actionableSessions.get(key)!;
  }

  discardAll(): void {
    this.analyzeSessions.clear();
    this.actionableSessions.clear();
  }

  private normalizeUrlForKey(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.origin + parsed.pathname;
    } catch {
      return url;
    }
  }
}

export const sessionCache = {
  create: () => new SessionCache(),
};
