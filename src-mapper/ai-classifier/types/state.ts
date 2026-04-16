import type { AgentEvent } from './agent.js';
import type { PageSummary } from './browser.js';
import type { ClassificationProposal } from './tools.js';

export type RunMode = 'manual' | 'auto_accept' | 'run_all';

export interface CurrentRunState {
  domain: string;
  source: string | null;
  siteNames: string[];
  suggestedCountry: string | null;
  status: 'idle' | 'processing' | 'awaiting_review' | 'saving';
  events: AgentEvent[];
  page: PageSummary | null;
  proposal: ClassificationProposal | null;
}

/** Lightweight summary of an active run (no events) sent in the SSE stream. */
export interface ActiveRunSummary {
  domain: string;
  source: string | null;
  siteNames: string[];
  status: CurrentRunState['status'];
  proposal: ClassificationProposal | null;
}

/** Lightweight stash list entry — no events, no page data. */
export interface StashListItem {
  domain: string;
  source: string | null;
  siteNames: string[];
  suggestedCountry: string | null;
  proposal: ClassificationProposal;
  stashedAt: string;
}

/** Full stashed run stored on disk — includes events and page snapshot. */
export interface StashedRun extends StashListItem {
  events: AgentEvent[];
  page: PageSummary | null;
  html: string;
}

export interface PublicState {
  running: boolean;
  pausing: boolean;
  runMode: RunMode;
  done: boolean;
  /** Full detail of the currently focused/selected active run (includes events). */
  current: CurrentRunState | null;
  /** Lightweight summaries of all active runs for the run picker. */
  activeRuns: ActiveRunSummary[];
  remaining: number;
  total: number;
  stashedCount: number;
  countries: string[];
}
