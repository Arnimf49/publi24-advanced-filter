export type RunMode = 'manual' | 'auto_accept' | 'run_all';
export type DomainOutcomeKind = 'escort' | 'bad' | 'review';
export type EscortContactAccess = 'phone_visible' | 'shared_venue_phone' | 'contact_gated';
export type PanelMode = 'log' | 'review' | 'diagnostics' | 'stash-actions';

export type AgentEvent = {
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
    accessibilityText: string;
    actionableElements: ActionableElement[];
    rawHtml: string;
  };
};

export type ActionableElement = {
  id: string;
  role: string;
  tagName: string;
  name: string;
  href: string | null;
  actionabilityReasons: string[];
  isLikelyEntryGate: boolean;
};

export type PageSummary = {
  url: string;
  title: string;
  startHost: string | null;
  currentHost: string | null;
  sameHostAsStart: boolean;
  accessibilityText: string;
  bodyText: string;
  phoneNumbers: string[];
  countryHints: string[];
  tldHint: string | null;
  canGoBack: boolean;
  navigationSteps: number;
  pageFlags: string[];
  actionableElements: ActionableElement[];
};

export type ClassificationProposal = {
  kind: DomainOutcomeKind;
  reasoning: string;
  confidence: number;
  country: string | null;
  phoneNumber: string | null;
  phoneNumbers: string[];
  contactAccess: EscortContactAccess | null;
  submitter?: 'triage_bad' | 'triage_good' | 'main_agent' | 'triage_access_gate';
  durationMs?: number;
};

export type ActiveRunSummary = {
  domain: string;
  source: string | null;
  siteNames: string[];
  status: 'idle' | 'processing' | 'awaiting_review' | 'saving';
  proposal: ClassificationProposal | null;
};

export type CurrentRunState = {
  domain: string;
  source: string | null;
  siteNames: string[];
  suggestedCountry: string | null;
  status: 'idle' | 'processing' | 'awaiting_review' | 'saving';
  events: AgentEvent[];
  page: PageSummary | null;
  proposal: ClassificationProposal | null;
};

export type StashListItem = {
  domain: string;
  source: string | null;
  siteNames: string[];
  suggestedCountry: string | null;
  proposal: ClassificationProposal;
  stashedAt: string;
};

export type StashedRun = StashListItem & {
  events: AgentEvent[];
  page: PageSummary | null;
  html: string;
};

export type PublicState = {
  running: boolean;
  pausing: boolean;
  runMode: RunMode;
  done: boolean;
  current: CurrentRunState | null;
  activeRuns: ActiveRunSummary[];
  remaining: number;
  total: number;
  stashedCount: number;
  countries: string[];
};

export type DiagnosticsPayload = {
  domain: string;
  url: string;
  title: string;
  structuredText: string;
  accessibilityText: string;
  actionableElements: ActionableElement[];
  html: string;
};
