export interface ActionableElement {
  id: string;
  element?: string;
  role?: string;
  tagName?: string;
  name: string;
  contextHint?: string;
  href: string | null;
  actionabilityReasons?: string[];
  isLikelyEntryGate?: boolean;
}

export interface PageSummary {
  url: string;
  title: string;
  startHost: string | null;
  currentHost: string | null;
  sameHostAsStart: boolean;
  structuredText: string;
  structuredTextWithIds: string;
  phoneNumbers: string[];
  countryHints: string[];
  tldHint: string | null;
  canGoBack: boolean;
  navigationSteps: number;
  pageFlags: string[];
  actionableElements: ActionableElement[];
}

export interface BrowserToolSuccess {
  ok: true;
  page: PageSummary;
}

export interface BrowserToolError {
  ok: false;
  errorCode: string;
  message: string;
  recoverable: boolean;
}

export type BrowserToolResult = BrowserToolSuccess | BrowserToolError;
