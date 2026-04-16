export type AgentLedger = {
  visitedUrls: string[];
  verifiedPhoneNumbers: string[];
  reusedVerifiedPhones: string[];
  rejectedPhones: string[];
  isAgencyDetected: boolean;
  escortEvidenceEstablished: boolean;
  hasVerificationGatingDetected: boolean;
  contactGatedDetected: boolean;
  specificCountry: string | null;
  hasVerifiedPhoneAction: boolean;
  revealPhoneElementIds: string[];
  hasPhoneRevealAttempt: boolean;
  failedPhoneRevealAttempts: number;
  failedClickElementIds: string[];
  failedToolHistory: string[];
  hasRedirectBaitAttempt: boolean;
  revealPhoneSearchAttempts: number;
  profileNotFoundCount: number;
};

const isHomepageUrl = (value: string | null | undefined): boolean => {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.pathname === '/' || url.pathname === '';
  } catch {
    return false;
  }
};

const getHomepageUrl = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const isHomepageOpenFailure = (message: string): boolean => {
  return /ERR_TOO_MANY_REDIRECTS/i.test(message) || /chrome-error:\/\/chromewebdata\//i.test(message);
};

const appendUnique = (items: string[], value: string, limit = 12): void => {
  const trimmed = value.trim();
  if (!trimmed) {
    return;
  }

  if (items.includes(trimmed)) {
    return;
  }

  items.push(trimmed);
  if (items.length > limit) {
    items.splice(0, items.length - limit);
  }
};

const create = (): AgentLedger => ({
  visitedUrls: [],
  verifiedPhoneNumbers: [],
  reusedVerifiedPhones: [],
  rejectedPhones: [],
  isAgencyDetected: false,
  escortEvidenceEstablished: false,
  hasVerificationGatingDetected: false,
  contactGatedDetected: false,
  specificCountry: null,
  hasVerifiedPhoneAction: false,
  revealPhoneElementIds: [],
  hasPhoneRevealAttempt: false,
  failedPhoneRevealAttempts: 0,
  failedClickElementIds: [],
  failedToolHistory: [],
  hasRedirectBaitAttempt: false,
  revealPhoneSearchAttempts: 0,
  profileNotFoundCount: 0,
});

export const agentLedger = {
  create,
  appendUnique,
  isHomepageUrl,
  getHomepageUrl,
  isHomepageOpenFailure,
};
