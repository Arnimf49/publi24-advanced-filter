import type { AgentLedger } from './AgentLedger.js';
import type { ClassificationProposal, DomainCandidate } from '../../types/tools.js';
import type { PageSummary } from '../../types/browser.js';
import { phoneSignals } from '../../utilities/phoneSignals.js';

export type ValidationResult = { ok: true } | { ok: false; reason: string };

const hasExplicitEscortEvidence = (page: PageSummary): boolean => {
  const combined = `${page.title}
${page.structuredText}`;
  return [
    /\bescort\b/i,
    /dame de companie/i,
    /\bsex workers?\b/i,
    /\bescorta\b/i,
    /\bescorte\b/i,
    /\bkurv/i,
    /\bprostitut/i,
    /\bcompanionship\b/i,
    /\berotic services?\b/i,
    /\badult companionship\b/i,
  ].some((pattern) => pattern.test(combined));
};

const hasSharedVenueSignals = (page: PageSummary): boolean => {
  const combined = `${page.title}
${page.structuredText}`;
  return [
    /\bbrothel\b/i,
    /\bbordell?\b/i,
    /\blaufhaus\b/i,
    /\bsauna club\b/i,
    /\bsaunaclub\b/i,
    /\bfkk\b/i,
    /\beros(?:[ -]?(?:center|centre|centrum))?\b/i,
    /\bsex club\b/i,
    /\bsexclub\b/i,
    /\bclub\b/i,
    /\bsingle house\b/i,
    /\bhouse\b/i,
    /\bhaus\b/i,
  ].some((pattern) => pattern.test(combined));
};

const isLikelyThinChatBaitPage = (page: PageSummary): boolean => {
  const combined = `${page.title}
${page.structuredText}`;
  const hasChatBaitText = [
    /\bstart chat\b/i,
    /\bchat now\b/i,
    /\blive chat\b/i,
    /\bprivate chat\b/i,
    /\bprivate conversation\b/i,
    /\bprivate conversations\b/i,
    /\bmessage me\b/i,
    /\bsign up to chat\b/i,
    /\bjoin to chat\b/i,
    /\btalk privately\b/i,
  ].some((pattern) => pattern.test(combined));

  const hasSameHostProfileHref = page.actionableElements.some((element) => {
    if (!element.href) {
      return false;
    }

    try {
      const url = new URL(element.href);
      if (!['http:', 'https:'].includes(url.protocol) || url.host !== page.startHost) {
        return false;
      }

      return url.pathname !== '/' && url.pathname !== '';
    } catch {
      return false;
    }
  });

  return hasChatBaitText && !hasSameHostProfileHref && page.phoneNumbers.length === 0;
};

const getConsistentPhoneCountryHint = (phoneNumbers: string[]): string | null => {
  const hints = phoneSignals.getPhoneCountryHints(phoneNumbers);
  if (hints.length !== 1) {
    return null;
  }

  return hints[0];
};

const findEquivalentVerifiedPhone = (verifiedPhoneNumbers: Set<string>, candidatePhone: string): string | null => {
  for (const verifiedPhoneNumber of verifiedPhoneNumbers) {
    if (phoneSignals.arePhoneNumbersEquivalent(verifiedPhoneNumber, candidatePhone)) {
      return verifiedPhoneNumber;
    }
  }

  return null;
};

const hasAttemptedHomepageRecovery = (visitedUrls: string[]): boolean => {
  for (const value of visitedUrls) {
    try {
      const url = new URL(value);
      if (url.pathname === '/' || url.pathname === '') {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
};

const startedFromHomepage = (visitedUrls: string[]): boolean => {
  const firstVisitedUrl = visitedUrls[0];
  if (!firstVisitedUrl) {
    return false;
  }

  try {
    const url = new URL(firstVisitedUrl);
    return url.pathname === '/' || url.pathname === '';
  } catch {
    return false;
  }
};

const reasoningMentionsSharedVenue = (reasoning: string): boolean => {
  return [
    /\bshared.{0,20}venue\b/i,
    /\bvenue.{0,20}phone\b/i,
    /\bclub\b/i,
    /\bbrothel\b/i,
    /\blaufhaus\b/i,
    /\bsauna.{0,10}club\b/i,
    /\bhouse\b/i,
    /\bhaus\b/i,
    /\bsingle.{0,10}phone\b/i,
    /\bone.{0,10}shared.{0,10}(phone|number)\b/i,
    /\bagency\b/i,
    /\bescort.{0,20}agenc(y|ies)\b/i,
    /\bshared.{0,20}(contact|number)\b/i,
    /\bcentral.{0,20}(phone|number|contact)\b/i,
  ].some((pattern) => pattern.test(reasoning));
};

const reasoningMentionsContactGate = (reasoning: string): boolean => {
  return [
    /\blogin\b/i,
    /\bsubscription\b/i,
    /\bsubscribe\b/i,
    /\bpaywall\b/i,
    /\bsign.{0,10}in\b/i,
    /\bregistration\b/i,
    /\bregister\b/i,
    /\bmembership\b/i,
    /\bhuman.{0,20}verif/i,
    /\bverif.{0,20}human/i,
    /\bcaptcha\b/i,
    /\bpress.{0,10}hold\b/i,
    /\boverlay\b/i,
    /\bcontact.{0,20}gate/i,
    /\bgated\b/i,
    /\bblocked\b/i,
    /\bgate\b/i,
  ].some((pattern) => pattern.test(reasoning));
};

const isClearlyUnrelatedReview = (reasoning: string, _page: PageSummary): boolean => {
  const lowerReasoning = reasoning.toLowerCase();
  const hasUnrelatedClaim = [
    'unrelated',
    'non-escort',
    'not escort',
    'not an escort',
    'normal business',
    'normal service',
  ].some((phrase) => lowerReasoning.includes(phrase));

  const hasOnlyLoginBlocker = [
    'login',
    'subscription',
    'paywall',
    'sign in',
    'registration',
  ].some((phrase) => lowerReasoning.includes(phrase));

  return hasUnrelatedClaim && hasOnlyLoginBlocker;
};

const isWeakReviewReasoning = (reasoning: string): boolean => {
  const trimmed = reasoning.trim();
  if (trimmed.length < 40) {
    return true;
  }

  const hasConcreteEvidence = [
    'evidence',
    'phone',
    'profile',
    'listing',
    'attempted',
    'tried',
    'found',
    'blocked',
    'gate',
    'wall',
    'verification',
  ].some((keyword) => reasoning.toLowerCase().includes(keyword));

  return !hasConcreteEvidence;
};

const isSameOrSubdomain = (page: PageSummary): boolean => {
  if (page.sameHostAsStart) {
    return true;
  }

  if (!page.currentHost || !page.startHost) {
    return false;
  }

  const current = page.currentHost.toLowerCase();
  const start = page.startHost.toLowerCase();

  return current === start ||
    current.endsWith(`.${start}`) ||
    start.endsWith(`.${current}`);
};

const validateProposal = (
  proposal: ClassificationProposal,
  ledger: AgentLedger,
  page: PageSummary,
  _candidate: DomainCandidate,
): ValidationResult => {
  const verifiedPhoneNumbers = new Set(ledger.verifiedPhoneNumbers);
  const reusedVerifiedPhoneCount = ledger.reusedVerifiedPhones.length;
  const startedOnHomepage = startedFromHomepage(ledger.visitedUrls);
  const attemptedHomepageRecovery = hasAttemptedHomepageRecovery(ledger.visitedUrls);

  if (proposal.kind === 'review') {
    const reasoning = proposal.reasoning.trim();

    if (isClearlyUnrelatedReview(reasoning, page)) {
      return {
        ok: false,
        reason: 'Review verdict rejected because the reasoning already says the site is unrelated/non-escort and the remaining blocker is only a login or subscription wall. Classify it as BAD rather than review.',
      };
    }

    if (
      (hasExplicitEscortEvidence(page) || ledger.escortEvidenceEstablished) &&
      reasoningMentionsContactGate(reasoning) &&
      ledger.contactGatedDetected
    ) {
      return {
        ok: false,
        reason: 'Review verdict rejected because escort evidence is established and a contact gate was confirmed by tooling (contactGatedDetected). A gated phone with escort evidence must be classify_as_escort with contactAccess="contact_gated", not review.',
      };
    }

    if (!hasExplicitEscortEvidence(page) && isLikelyThinChatBaitPage(page)) {
      return {
        ok: false,
        reason: 'Review verdict rejected because the page looks like thin chat/profile bait with private-chat style invitations but no real same-host profile/detail links or phone evidence. Classify it as BAD rather than review.',
      };
    }

    if (reusedVerifiedPhoneCount > 0 && verifiedPhoneNumbers.size < 2 && !hasSharedVenueSignals(page)) {
      return {
        ok: false,
        reason: 'Review verdict rejected because the same verified real phone was reused across different same-host profiles/pages and no second distinct real phone was found. Without clear venue-style club/house evidence, that pattern counts against the site; classify it as BAD rather than review.',
      };
    }

    if (
      !startedOnHomepage &&
      hasExplicitEscortEvidence(page) &&
      verifiedPhoneNumbers.size === 1 &&
      !attemptedHomepageRecovery
    ) {
      return {
        ok: false,
        reason: 'Review verdict rejected because explicit escort evidence and one verified real phone already exist, but homepage recovery has not been attempted yet. Use open_homepage and continue through sensible same-host listing/profile paths before requesting review.',
      };
    }

    if (!reasoning || isWeakReviewReasoning(reasoning)) {
      return {
        ok: false,
        reason: 'Review verdict rejected because it did not include a concrete reason. Explain what you tried, what evidence you found, and what specifically remains unclear or blocked.',
      };
    }

    return { ok: true };
  }

  if (proposal.kind === 'bad') {
    if (
      ledger.escortEvidenceEstablished &&
      verifiedPhoneNumbers.size === 0 &&
      ledger.revealPhoneSearchAttempts === 0 &&
      !ledger.hasRedirectBaitAttempt
    ) {
      return {
        ok: false,
        reason:
          'BAD verdict rejected because established escort evidence exists but no phone reveal was ever attempted. The absence of a visible phone is not proof the site is not an escort site — the phone may be gated or hidden. Use get_actionable_elements(mode: "reveal-phone-number"), attempt to click the returned element, then reassess.',
      };
    }

    if (
      ledger.escortEvidenceEstablished &&
      verifiedPhoneNumbers.size === 0 &&
      ledger.revealPhoneSearchAttempts > 0 &&
      !ledger.contactGatedDetected
    ) {
      return {
        ok: false,
        reason:
          'BAD verdict rejected because escort evidence is established and phone reveal was attempted but no contact mechanism was found (no phone, no gate, no messaging). A directory listing with real escort profiles but no actionable contact info should be classify_as_review, not BAD.',
      };
    }

    if (
      ledger.hasRedirectBaitAttempt &&
      verifiedPhoneNumbers.size > 0
    ) {
      return {
        ok: false,
        reason:
          'BAD verdict rejected because real phone numbers were already found before redirect bait was encountered. The site has real escort content even though some links redirect externally. Use classify_as_review instead.',
      };
    }

    return { ok: true };
  }

  if (proposal.kind !== 'escort') {
    return { ok: true };
  }

  if (proposal.country === null || proposal.country === undefined) {
    return {
      ok: false,
      reason: 'Escort verdict rejected because country is null. Use a valid ISO country code (e.g. de, ro, fr) or "general" for multi-country sites.',
    };
  }

  if (['unknown', 'n/a', 'none'].includes(proposal.country)) {
    return {
      ok: false,
      reason: 'Escort verdict rejected because a specific country is still required. Use a valid ISO country code or "general" for multi-country sites.',
    };
  }

  if (proposal.country === 'general') {
    return { ok: true };
  }

  if (!phoneSignals.ALL_COUNTRY_CODES.some((countryCode: string) => countryCode === proposal.country)) {
    return {
      ok: false,
      reason: `Escort verdict rejected because the provided country (${proposal.country}) is not a valid country code. Use a supported lowercase ISO-like code such as de, ro, fr, etc.`,
    };
  }

  if (proposal.contactAccess === 'contact_gated') {
    if (!ledger.escortEvidenceEstablished) {
      return {
        ok: false,
        reason: 'Escort verdict rejected because contact_gated requires established escort evidence from analyze_page findings.',
      };
    }

    const hasGateEvidence =
      ledger.hasPhoneRevealAttempt ||
      ledger.hasVerifiedPhoneAction ||
      ledger.contactGatedDetected ||
      ledger.failedPhoneRevealAttempts > 0 ||
      reasoningMentionsContactGate(proposal.reasoning);

    if (!hasGateEvidence || !isSameOrSubdomain(page)) {
      return {
        ok: false,
        reason: 'Escort verdict rejected because contact_gated requires either a phone reveal attempt that hit a gate, or a phone search analysis that detected a contact gate (login/subscription wall, captcha, or human-verification). Ensure analyze_page(modes: ["searching-phone-number"]) was called and returned contactGated: true, or use get_actionable_elements(mode: "reveal-phone-number") and click the returned element.',
      };
    }

    return { ok: true };
  }

  const normalizedPhone = phoneSignals.normalizePhoneNumber(proposal.phoneNumber ?? '');
  if (!normalizedPhone) {
    return {
      ok: false,
      reason: 'Escort verdict rejected because no phone number was provided. You must call verify_phone_action with a real phone number found on the page before classifying as escort. If no phone is visible, navigate to a profile page or use analyze_page(modes: [\'searching-phone-number\']).',
    };
  }

  if (!phoneSignals.isRealPhoneNumber(normalizedPhone)) {
    return {
      ok: false,
      reason: `Escort verdict rejected because the provided phone number (${proposal.phoneNumber}) is only a short code or gateway number, not a real phone number.`,
    };
  }

  const pagePhones = page.phoneNumbers.map((phoneNumber: string) => phoneSignals.normalizePhoneNumber(phoneNumber));
  const comparableTargets = phoneSignals.getComparablePhoneVariants(normalizedPhone);
  const comparableTargetDigits = comparableTargets.map((digits: string) => digits.replace(/[^\d]/g, ''));
  const combinedPageEvidence = [
    ...page.phoneNumbers,
    page.title,
    page.structuredText,
  ]
    .join('\n')
    .replace(/[^\d+]/g, '');
  const phoneAppearsInEvidence =
    comparableTargets.some((phoneNumber) => pagePhones.includes(phoneNumber)) ||
    comparableTargetDigits.some((digits) => combinedPageEvidence.includes(digits)) ||
    ledger.verifiedPhoneNumbers.some((vp) => {
      const vpNorm = phoneSignals.normalizePhoneNumber(vp);
      return vpNorm === normalizedPhone || comparableTargets.includes(vpNorm);
    });

  if (!phoneAppearsInEvidence) {
    return {
      ok: false,
      reason: `Escort verdict rejected because the provided phone number (${proposal.phoneNumber}) was not found in any visited page evidence or verified phones. Either navigate to a page where this phone is visible, find a different phone number, or if no real phone can be found, classify as BAD or flag for review with a concrete blocker.`,
    };
  }

  if (!ledger.hasVerifiedPhoneAction) {
    return {
      ok: false,
      reason: 'Escort verdict rejected because verify_phone_action was not successfully completed for the found phone number.',
    };
  }

  if (proposal.contactAccess === 'shared_venue_phone') {
    if (!isSameOrSubdomain(page)) {
      return {
        ok: false,
        reason: 'Escort verdict rejected because shared_venue_phone requires current evidence on the original same-host venue site.',
      };
    }

    if (!verifiedPhoneNumbers.has(normalizedPhone)) {
      return {
        ok: false,
        reason: 'Escort verdict rejected because shared_venue_phone requires that the provided venue phone itself was verified successfully.',
      };
    }

    if (!hasExplicitEscortEvidence(page)) {
      return {
        ok: false,
        reason: 'Escort verdict rejected because shared_venue_phone requires explicit escort evidence from analyze_page findings.',
      };
    }

    if (!reasoningMentionsSharedVenue(proposal.reasoning)) {
      return {
        ok: false,
        reason: 'Escort verdict rejected because shared_venue_phone reasoning must explicitly explain that this is a venue-style club/house/brothel/laufhaus or agency operation using one shared phone.',
      };
    }

    if (reusedVerifiedPhoneCount < 1) {
      return {
        ok: false,
        reason: 'Escort verdict rejected because shared_venue_phone requires confirming the same phone number appears on at least 2 different profiles. Navigate to another escort profile on this site and verify the phone number there before submitting shared_venue_phone.',
      };
    }

    if (proposal.country && proposal.country !== 'general') {
      const venuePhoneCountryHint = getConsistentPhoneCountryHint([...verifiedPhoneNumbers]);
      if (venuePhoneCountryHint && venuePhoneCountryHint !== proposal.country) {
        return {
          ok: false,
          reason: `Escort verdict rejected because the verified venue phone evidence points to ${venuePhoneCountryHint} while the proposed country was ${proposal.country}.`,
        };
      }
    }

    return { ok: true };
  }

  if (verifiedPhoneNumbers.size < 2) {
    const hasOneVerifiedPhone = verifiedPhoneNumbers.size === 1;
    const visitedManyPages = ledger.visitedUrls.length >= 4;
    if (hasOneVerifiedPhone && visitedManyPages) {
      return {
        ok: false,
        reason: 'Escort verdict rejected: only 1 distinct verified phone was found after visiting multiple pages. The site may be real but the second phone is unreachable. Use flag_for_review so a human can assess — do NOT classify as BAD.',
      };
    }

    return {
      ok: false,
      reason: 'Escort verdict rejected because escort classification now requires 2 distinct verified real phone numbers. If you are currently on a profile/detail page, one real phone there is normal: navigate to other same-host profiles/listings and collect a second distinct real phone number before deciding. SMS short codes and gateway numbers do not count. Only if sensible same-host additional profiles still fail to produce 2 distinct real phone numbers should you classify the site as BAD.',
    };
  }

  if (proposal.country && proposal.country !== 'general') {
    const verifiedPhoneCountryHint = getConsistentPhoneCountryHint([...verifiedPhoneNumbers]);
    if (verifiedPhoneCountryHint && verifiedPhoneCountryHint !== proposal.country) {
      return {
        ok: false,
        reason: `Escort verdict rejected because the verified phone evidence points to ${verifiedPhoneCountryHint} while the proposed country was ${proposal.country}. If the site is clearly multi-country, use "general" or the dominant country based on broader evidence. If it does not clearly look multi-country yet, inspect 3 more sensible same-host profiles/listings and compare their phones/cities before flagging for review.`,
      };
    }
  }

  return { ok: true };
};

export const validation = {
  validateProposal,
  hasExplicitEscortEvidence,
  hasSharedVenueSignals,
  isLikelyThinChatBaitPage,
  findEquivalentVerifiedPhone,
};
