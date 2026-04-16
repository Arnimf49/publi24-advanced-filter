import type { PageSummary } from './browser.js';

export type DomainOutcomeKind = 'escort' | 'bad' | 'review';
export type EscortContactAccess = 'phone_visible' | 'shared_venue_phone' | 'contact_gated';

export interface UnknownDomainEntry {
  source?: string | null;
  siteNames: string[];
}

export interface DomainCandidate extends UnknownDomainEntry {
  domain: string;
}

export interface EscortDomainEntry {
  country: string;
  domain: string;
  siteNames: string[];
}

export interface ClassificationProposal {
  kind: DomainOutcomeKind;
  reasoning: string;
  confidence: number;
  country: string | null;
  phoneNumber: string | null;
  phoneNumbers: string[];
  contactAccess: EscortContactAccess | null;
  /** Which component produced this verdict */
  submitter?: 'triage_bad' | 'triage_good' | 'main_agent' | 'triage_access_gate';
  /** Total wall-clock ms from run() start to verdict */
  durationMs?: number;
}

export interface AgentRunResult {
  proposal: ClassificationProposal;
  page: PageSummary | null;
}
