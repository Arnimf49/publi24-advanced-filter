export interface PersonalDetails {
  age?: number;
  height?: number;
  weight?: number;
}

export interface EscortRates {
  '30m'?: number;
  '1h'?: number;
  '1.5h'?: number;
  '2h'?: number;
}

export type ServiceAvailability = boolean | {extraCost: number};

export type EscortServiceName =
  | 'op'
  | 'on'
  | 'np'
  | 'nn'
  | 'deepthroat'
  | 'fk'
  | 'cim'
  | 'cof'
  | 'cob'
  | 'massage'
  | 'ap'
  | 'anal'
  | 'hj'
  | '69'
  | 'gfe'
  | 'prostateMassage'
  | 'pse'
  | 'cuni'
  | 'ani'
  | '3some'
  | 'couples'
  | 'lesbyShow'
  | 'shower'
  | 'bdsm';

export interface ServiceDetails {
  baseRates: EscortRates;
  outcallRates?: EscortRates;
  services?: Partial<Record<EscortServiceName, ServiceAvailability>>;
}

const SMALL_CAPS = {
  'ᴬ': 'A', 'ᴮ': 'B', 'ᴰ': 'D', 'ᴱ': 'E', 'ᴳ': 'G', 'ᴴ': 'H', 'ᴵ': 'I', 'ᴶ': 'J', 'ᴷ': 'K', 'ᴸ': 'L', 'ᴹ': 'M', 'ᴺ': 'N', 'ᴼ': 'O', 'ᴾ': 'P', 'ᴿ': 'R', 'ᵀ': 'T', 'ᵁ': 'U', 'ⱽ': 'V', 'ᵂ': 'W',
  'ᴀ': 'a', 'ʙ': 'b', 'ᴄ': 'c', 'ᴅ': 'd', 'ᴇ': 'e', 'ꜰ': 'f', 'ɢ': 'g', 'ʜ': 'h', 'ɪ': 'i', 'ᴊ': 'j', 'ᴋ': 'k', 'ʟ': 'l', 'ᴍ': 'm', 'ɴ': 'n', 'ᴏ': 'o', 'ᴘ': 'p', 'ʀ': 'r', 'ꜱ': 's', 'ᴛ': 't', 'ᴜ': 'u', 'ᴠ': 'v', 'ᴡ': 'w', 'ʏ': 'y',
};

const SERVICE_PATTERNS: Record<EscortServiceName, RegExp> = {
  op: /\b(?:op|oral\s*(?:sex\s+)?(?:protejat|pro)|sex\s+oral\s*(?:protejat|pro)|oral\s*\(\s*pro\b|sex\s+oral\s*\(\s*pro\b|oral\s+[pn]\s*\/\s*[pn])\b|\b(?:sex\s+)?oral\b[^\n.;]{0,35}\b(?:protejat|pro)\b/g,
  on: /\b(?:on|oral\s*(?:sex\s+)?(?:neprotejat|nepro)|sex\s+oral\s*(?:neprotejat|nepro)|oral\s*\(\s*pro\s*\/\s*nepro\b|oral\s*\(\s*nepro\b|sex\s+oral\s*\(\s*nepro\b|oral\s+[pn]\s*\/\s*[pn])\b|\b(?:sex\s+)?oral\b[^\n.;]{0,35}\b(?:neprotejat|nepro)\b/g,
  np: /\b(?:sex\s+)?normal\b(?!\s+neprotejat)(?:\s*\(\s*(?:(?:obligatoriu|doar)\s+)?protejat\s*[!.,;]?\s*\)|\s+(?:(?:obligatoriu|doar)\s+)?protejat\b|\s+in\s+diferite\s+pozitii\b)/g,
  nn: /\b(?:sex\s+)?normal\s+neprotejat\b/g,
  deepthroat: /\b(?:dt|deep\s*throat|deepthroat|deep)\b|\boral\s+adanc\b/g,
  fk: /\b(?:fk|french\s+kiss)\b/g,
  cim: /\bcim\b|\bfin(?:aliz\w*)?\s+orala\b|\b(?:orala|faciala)\s*(?:\/|,|sau)\s*orala\b/g,
  cof: /\bcof\b|\bfin(?:aliz\w*)?\s+faciala\b|\b(?:orala|faciala)\s*(?:\/|,|sau)\s*faciala\b/g,
  cob: /\bcob\b|\b(?:boob\s+job|sex\s+intre\s+sani)\b|\bfin\s+corp\b|\bfinaliz\w*\s+corporala\b|\b(?:orala|faciala)\s*(?:\/|,|sau)\s*corporala\b|\bfinaliz\w*\s+pe\s+sani\w*\b/g,
  massage: /\bmasaj(?:e|ul)?\b|\bmassage\b/g,
  ap: /\bap\b|\banal\s+protejat\b/g,
  anal: /\banal\b/g,
  hj: /\bhand\s*jo+b\b|\bjob\s+manual\b/g,
  '69': /\b69\b/g,
  gfe: /\bgfe\b/g,
  prostateMassage: /\bmasaj\s+prostatic\b|\bprostat(?:a|ic)\b/g,
  pse: /\bpse\b|porn\s+star\s+experience/g,
  cuni: /\bcunn?ilingus\b|\bcunni\b/g,
  ani: /\ban{1,3}i{1,2}lingus\b|\bcunni\s*\/\s*ani\b/g,
  '3some': /\b(?:sex|intalniri)\s+in\s+3\b|\b(?:mmf|mff|3some)\b|\bintalniri\s+cu\s+(?:o\s+)?colega\b/g,
  couples: /\bcupl(?:u|uri)\b/g,
  lesbyShow: /\b(?:show\s+lesb\w*|lesb\w*\s+show)\b/g,
  shower: /\bdus\s+(?:impreuna|asistat|in\s+doi)\b/g,
  bdsm: /\bbdsm\b|\bdominare\w*\b|\bdominatie\w*\b|\brough\b/g,
};

const SERVICE_NAMES = Object.keys(SERVICE_PATTERNS) as EscortServiceName[];
const NEGATIVE_WORDS = /\b(?:nu\s+(?:mai\s+)?(?:fac|ofer(?:im)?|practic|prestez|accept|primesc)|nu\s+sunt\s+pe\s+stilul|fara|niciodata|deloc|nepractic(?:at|a)?|nu\s+se\s+ofera)\b/i;
const NEGATIVE_ACTION = /\b(?:nu\s+(?:mai\s+)?(?:fac|ofer(?:im)?|practic|prestez|accept|primesc)|nu\s+sunt\s+pe\s+stilul|deloc|nepractic(?:at|a)?)\b/i;
const NEGATIVE_EMOJIS = /[❌✖✘❎🚫⛔🛑]/u;
const RATE_DURATION_WORDS = /\b(?:min(?:ute)?s?|mi|h(?:r)?|ore?|ora)\b|'/i;

function normalizeText(text: string): string {
  const compatibilityText = text.normalize('NFKC').replace(/./gu, character => SMALL_CAPS[character as keyof typeof SMALL_CAPS] || character);
  return compatibilityText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
}

function findAge(text: string): number | undefined {
  const agePattern = /\b(\d{1,2})\s*(?:de\s*)?ani\b/g;

  for (const match of text.matchAll(agePattern)) {
    const age = Number.parseInt(match[1], 10);
    if (age < 17 || age > 70) {
      continue;
    }

    const lineStart = Math.max(text.lastIndexOf('\n', match.index) + 1, 0);
    const lineEnd = text.indexOf('\n', match.index);
    const line = text.slice(lineStart, lineEnd === -1 ? text.length : lineEnd);
    const beforeAge = text.slice(lineStart, match.index);

    if (/\b(?:persoan|pustan|oameni|client|barbat|baiet|genul|sub|peste)\w*/i.test(beforeAge)) {
      continue;
    }
    const profileNameBeforeAge = /\.\s*[a-z]{2,20}\s*$/i.test(beforeAge.slice(-40));
    if (!/\b(?:am|sunt)\b/i.test(beforeAge) && line.length > 100 && !profileNameBeforeAge) {
      continue;
    }

    return age;
  }

  return undefined;
}

function findHeight(text: string): number | undefined {
  const decimalHeight = /(?:^|[^\d])1[.,']\s*([3-9]\d)(?=\s*(?:m(?:etri)?\b|cm\b|inaltime\b|si\b|$|[|#]|[^\da-z]))/g;
  const centimetreHeight = /(?:^|[^\d])(1[3-9]\d)\s*(?:cm\b|centimetri?\b|inaltime\b)/g;

  const decimalMatch = decimalHeight.exec(text);
  if (decimalMatch) {
    return 100 + Number.parseInt(decimalMatch[1], 10);
  }

  const centimetreMatch = centimetreHeight.exec(text);
  if (centimetreMatch) {
    return Number.parseInt(centimetreMatch[1], 10);
  }

  return undefined;
}

function findWeight(text: string): number | undefined {
  const weightMatch = /\b(\d{2,3})\s*(?:de\s*)?(?:kg|kilo(?:grame)?s?)\b/i.exec(text);
  if (!weightMatch) {
    return undefined;
  }

  const weight = Number.parseInt(weightMatch[1], 10);
  return weight >= 35 && weight <= 145 ? weight : undefined;
}

function statementForOccurrence(text: string, start: number, end: number): string {
  const previousBoundary = Math.max(text.lastIndexOf('\n', start - 1), text.lastIndexOf('.', start - 1), text.lastIndexOf('!', start - 1), text.lastIndexOf('?', start - 1), text.lastIndexOf(';', start - 1));
  const nextBoundaries = ['\n', '.', '!', '?', ';'].map(character => text.indexOf(character, end)).filter(index => index !== -1);
  const nextBoundary = nextBoundaries.length ? Math.min(...nextBoundaries) : text.length;
  return text.slice(previousBoundary + 1, nextBoundary);
}

function isNegativeOccurrence(text: string, start: number, end: number): boolean {
  const statement = statementForOccurrence(text, start, end);
  const relativeStart = start - (text.indexOf(statement, Math.max(0, start - statement.length)) || 0);
  const before = statement.slice(0, Math.max(0, relativeStart));
  const after = statement.slice(Math.max(0, relativeStart));
  const lastPositiveQualifier = Math.max(before.lastIndexOf('doar'), before.lastIndexOf('numai'));
  const negativeBefore = NEGATIVE_ACTION.test(before.slice(-80)) || NEGATIVE_WORDS.test(before.slice(-25)) || NEGATIVE_EMOJIS.test(before.slice(-40));
  const negativeAfterWords = /\b(?:nu\s+(?:mai\s+)?(?:fac|ofer(?:im)?|practic|prestez)|deloc)\b/i.test(after.slice(0, 18));
  const negativeAfter = negativeAfterWords || NEGATIVE_EMOJIS.test(after.slice(0, 20));

  if (negativeBefore && lastPositiveQualifier > before.search(NEGATIVE_WORDS)) {
    return false;
  }

  return negativeBefore || negativeAfter;
}

function extraCostNearOccurrence(text: string, service: EscortServiceName, start: number, end: number): number | undefined {
  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  const lineEndIndex = text.indexOf('\n', end);
  const lineEnd = lineEndIndex === -1 ? text.length : lineEndIndex;
  const nearbyStart = Math.max(lineStart, start - 25);
  const nearbyEnd = Math.min(lineEnd, end + 55);
  const nearby = text.slice(nearbyStart, nearbyEnd);
  const serviceEndOffset = end - nearbyStart;
  const hasAnotherService = (costOffset: number): boolean => {
    if (costOffset < serviceEndOffset) {
      let lastService: EscortServiceName | undefined;
      let lastServiceIndex = -1;
      for (const otherService of SERVICE_NAMES) {
        const occurrence = new RegExp(SERVICE_PATTERNS[otherService].source, 'i').exec(nearby.slice(0, costOffset));
        if (occurrence && (occurrence.index ?? -1) > lastServiceIndex) {
          lastService = otherService;
          lastServiceIndex = occurrence.index ?? -1;
        }
      }
      return lastService !== undefined && lastService !== service;
    }

    const between = costOffset >= serviceEndOffset
      ? nearby.slice(serviceEndOffset, costOffset)
      : nearby.slice(costOffset, serviceEndOffset);
    return SERVICE_NAMES.some(otherService => otherService !== service && new RegExp(SERVICE_PATTERNS[otherService].source, 'i').test(between));
  };
  const extraPattern = /(?:\+\s*|extra\s*(?:cost)?\s*[:+]?|in\s+plus\s*|supliment(?:ar)?\s*[:+]?)(\d{2,4})\s*(?:lei|ron)?\b|(\d{2,4})\s*(?:lei|ron)?\s*extra\b|(\d{2,4})\s*(?:lei|ron)?\s*(?:extra|in\s+plus)\b/gi;
  for (const extraMatch of nearby.matchAll(extraPattern)) {
    const extraEnd = (extraMatch.index ?? 0) + extraMatch[0].length;
    const extraMatchEndsBeforeService = extraEnd < serviceEndOffset;
    const betweenExtraAndService = nearby.slice(extraEnd, serviceEndOffset);
    const isDirectExtraBeforeService = extraMatchEndsBeforeService
      && /^extra/i.test(extraMatch[0])
      && !/[)]/u.test(betweenExtraAndService)
      && serviceEndOffset - extraEnd <= 25;
    if ((isDirectExtraBeforeService || !extraMatchEndsBeforeService) && !hasAnotherService(extraEnd)) {
      return Number.parseInt(extraMatch[1] || extraMatch[2] || extraMatch[3], 10);
    }
  }

  if (service === 'cim' || service === 'cof' || service === 'cob') {
    const serviceSuffixExtra = new RegExp(`\\b${service}\\s*\\([^)]*\\)\\s*-\\s*(\\d{2,4})\\s*(?:lei|ron)?\\b`, 'gi');
    for (const suffixMatch of nearby.matchAll(serviceSuffixExtra)) {
      return Number.parseInt(suffixMatch[1], 10);
    }
  }

  const parentheticalPattern = /\(\s*(\d{2,4})\s*(?:lei|ron)?\s*\)/gi;
  for (const parentheticalMatch of nearby.matchAll(parentheticalPattern)) {
    const parentheticalIndex = parentheticalMatch.index ?? 0;
    if (parentheticalIndex >= serviceEndOffset && !hasAnotherService(parentheticalIndex) && !RATE_DURATION_WORDS.test(nearby.slice(Math.max(0, parentheticalIndex - 20), parentheticalIndex + parentheticalMatch[0].length + 20))) {
      return Number.parseInt(parentheticalMatch[1], 10);
    }
  }

  return undefined;
}

function extractOneService(text: string, service: EscortServiceName): ServiceAvailability | undefined {
  const occurrences = [...text.matchAll(SERVICE_PATTERNS[service])];
  if (!occurrences.length) {
    return undefined;
  }

  const lastOccurrence = occurrences[occurrences.length - 1];
  const lastStart = lastOccurrence.index ?? 0;
  const lastEnd = lastStart + lastOccurrence[0].length;
  const practiced = !isNegativeOccurrence(text, lastStart, lastEnd);
  let selectedOccurrence = lastOccurrence;

  if (practiced) {
    const occurrenceWithExtra = [...occurrences].reverse().find(occurrence => {
      const start = occurrence.index ?? 0;
      const end = start + occurrence[0].length;
      return !isNegativeOccurrence(text, start, end) && extraCostNearOccurrence(text, service, start, end) !== undefined;
    });
    if (occurrenceWithExtra) {
      selectedOccurrence = occurrenceWithExtra;
    }
  }

  const start = selectedOccurrence.index ?? 0;
  const end = start + selectedOccurrence[0].length;
  if (!practiced) {
    return false;
  }

  const extraCost = extraCostNearOccurrence(text, service, start, end);
  return extraCost === undefined ? true : {extraCost};
}

function durationFromText(text: string, amountIndex: number, otherAmountIndexes: number[]): keyof EscortRates | undefined {
  const durationPattern = /\b(30|60|90|120)\s*(?:['’]\s*)?(?:de\s*)?(?:(?:min(?:ute)?s?|mi)\b|['’])|\b(o\s+ora\s+si\s+30)\s+minute?\b|\b(1|2)\s*(?:['’]\s*)?(?:h|hr|ore?|ora)\b|\b(doua)\s+ore?\b|\b(ora|h)\b/gi;
  const durations: Array<{index: number; duration: keyof EscortRates}> = [];

  for (const match of text.matchAll(durationPattern)) {
    const minutes = match[1] ? Number.parseInt(match[1], 10) : match[2] ? 90 : match[3] ? Number.parseInt(match[3], 10) * 60 : match[4] ? 120 : 60;
    const duration = minutes === 30 ? '30m' : minutes === 60 ? '1h' : minutes === 90 ? '1.5h' : minutes === 120 ? '2h' : undefined;
    if (duration) {
      durations.push({index: match.index ?? 0, duration});
    }
  }

  const precedingDuration = durations
    .filter(duration => duration.index < amountIndex && !otherAmountIndexes.some(index => index > duration.index && index < amountIndex))
    .sort((left, right) => right.index - left.index)[0];
  const followingDuration = durations
    .filter(duration => duration.index >= amountIndex && !otherAmountIndexes.some(index => index > amountIndex && index < duration.index))
    .sort((left, right) => left.index - right.index)[0];
  const followingIsDirect = followingDuration
    && /\d{2,5}\s*(?:lei|ron)?\s*[-:–]?\s*$/i.test(text.slice(amountIndex, followingDuration.index));
  const followingIsParenthesized = followingDuration
    && text.slice(amountIndex, followingDuration.index).includes('(');

  if (followingDuration && (followingIsDirect || followingIsParenthesized) && followingDuration.index - amountIndex <= 70) {
    return followingDuration.duration;
  }
  if (precedingDuration && amountIndex - precedingDuration.index <= 70) {
    return precedingDuration.duration;
  }
  if (followingDuration && followingDuration.index - amountIndex <= 70) {
    return followingDuration.duration;
  }

  const uniqueDurations = [...new Set(durations.map(duration => duration.duration))];
  return uniqueDurations.length === 1 && !otherAmountIndexes.length ? uniqueDurations[0] : undefined;
}

function amountMatches(line: string): Array<{amount: number; index: number}> {
  const matches: Array<{amount: number; index: number}> = [];
  const moneyPattern = /\b(\d{2,5})\s*(?:de\s*)?(?:lei|ron)\b|\b(\d{2,5})\s*(?=\s*(?:finalizar\w*|fin)\b)|\b(\d{2,5})\s*(?=-\s*\(?\s*(?:fin|final|\d+\s*['’]?\s*(?:min|mi|h|hr|ore?|ora)|\d+\s*\/\s*\d+\s*fin|\d+\s*'))|\b(\d{2,5})\s*(?=\(\s*(?:30|60|90|120)\s*(?:min|mi|h|hr|ore?|ora))|\b(?:finalizar\w*)\D{0,12}(\d{2,5})(?!\s*(?:de\s*)?(?:min|minute|mi|h|hr|ore?|ora)\b)\b|\b(\d{2,5})\s*(?=\s*(?:(?:30|60|90|120)\s*(?:['’]\s*)?(?:min|mi|h|hr|ore?|ora)|(?:1|2)\s*(?:['’]\s*)?(?:h|hr|ore?|ora)|(?:ora|h)\b))|\b(\d{2,5})\s*(?=(?:num(?:arul|ar)\s*)?\(\s*(?:30|60|90|120)\s*(?:min|mi|h|hr|ore?|ora))|\b(\d{2,5})\s*(?=-\s*(?:oral|normal|masaj|diferite|gfe|fk|finaliz\w*|o\s+(?:finaliz\w*|ora)\b|anal)\b)|\b(?:30|60|90|120)\s*(?:['’]\s*)?(?:de\s*)?(?:min(?:ute)?s?|mi)\b[\s:=-]{1,12}(\d{2,5})\b|\b(?:1|2)\s*(?:['’]\s*)?(?:h|hr|ore?|ora)\b[\s:=-]{1,12}(\d{2,5})\b/gi;

  for (const match of line.matchAll(moneyPattern)) {
    const amountText = match[1] || match[2] || match[3] || match[4] || match[5] || match[6] || match[7] || match[8] || match[9] || match[10];
    if (amountText) {
      const matchStart = match.index ?? 0;
      const index = matchStart + match[0].lastIndexOf(amountText);
      const precedingText = line.slice(Math.max(0, index - 20), index);
      const extendedPrecedingText = line.slice(Math.max(0, index - 80), index);
      const followingText = line.slice(matchStart + match[0].length, matchStart + match[0].length + 15);
      if (match[5] && /^(?:30|60|90|120)$/.test(amountText) && /^(?:\s*[-–:]?\s*)?(?:30|60|90|120)?\s*(?:de\s*)?(?:min|minute|mi|h|ora)/i.test(followingText)) {
        continue;
      }
      if (/(?:\+|extra|in\s+plus)\s*$/i.test(precedingText) || /\b(?:cim|cof|cob)\s*\([^)]*\)\s*-\s*$/i.test(extendedPrecedingText) || /^\s*(?:lei|ron)?\s*(?:extra|in\s+plus)\b/i.test(followingText)) {
        continue;
      }
      matches.push({amount: Number.parseInt(amountText, 10), index});
    }
  }

  return matches;
}

function extractRates(text: string): {baseRates: EscortRates; outcallRates: EscortRates} {
  const baseRates: EscortRates = {};
  const outcallRates: EscortRates = {};
  const baseCandidates: Partial<Record<keyof EscortRates, number[]>> = {};
  const outcallCandidates: Partial<Record<keyof EscortRates, number[]>> = {};
  const suppressBaseRates = !/\b(?:servici|meniu|ofer\s+urmatoarele)\b/i.test(text) && /\b(?:duo|colab|show\s+lesb|programari\s+in\s+3)\b/i.test(text);
  let inOutcallSection = false;

  for (const line of text.split('\n')) {
    if (/\bdeplasar\w*\s*:/i.test(line)) {
      inOutcallSection = true;
    }

    const isOutcallLine = inOutcallSection || /\b(?:out\s*call|hotel|deplasar)\w*/i.test(line);
    const isRateLine = /\b(?:lei|ron|pret|preturi|tarif|cadou\w*|price|finalizare|fin\b|\d+\s*(?:min|minute|mi|h|hr|ora|ore))\b|'/i.test(line);
    if (!isRateLine) {
      continue;
    }

    const moneyMatches = amountMatches(line);
    for (const money of moneyMatches) {
      let duration = durationFromText(line, money.index, moneyMatches.filter(otherMoney => otherMoney !== money).map(otherMoney => otherMoney.index));
      const prefix = line.slice(0, money.index);
      const outcallIndex = Math.max(prefix.lastIndexOf('outcall'), prefix.lastIndexOf('out call'), prefix.lastIndexOf('hotel'), prefix.lastIndexOf('deplasar'));
      const serviceContextIndex = Math.max(prefix.lastIndexOf('servici'), prefix.lastIndexOf('pret'), prefix.lastIndexOf('cadou'));
      const isOutcall = isOutcallLine && (inOutcallSection || (outcallIndex > serviceContextIndex && money.index - outcallIndex <= 70));
      if (!duration && /\b(?:finalizare|fin)\w*/i.test(line) && !isOutcall) {
        duration = '30m';
      }
      if (!duration || (suppressBaseRates && !isOutcall)) {
        continue;
      }

      const candidates = isOutcall ? outcallCandidates : baseCandidates;
      candidates[duration] = [...(candidates[duration] || []), money.amount];
    }
  }

  for (const duration of ['30m', '1h', '1.5h', '2h'] as Array<keyof EscortRates>) {
    const base = baseCandidates[duration];
    const outcall = outcallCandidates[duration];
    if (base?.length) {
      baseRates[duration] = Math.min(...base);
    }
    if (outcall?.length) {
      outcallRates[duration] = Math.min(...outcall);
    }
  }

  return {baseRates, outcallRates};
}

export const escortInfoExtractor = {
  extractPersonalDetails(text: string): PersonalDetails | null {
    const normalizedText = normalizeText(text);
    const details: PersonalDetails = {};
    const age = findAge(normalizedText);
    const height = findHeight(normalizedText);
    const weight = findWeight(normalizedText);

    if (age !== undefined) {
      details.age = age;
    }
    if (height !== undefined) {
      details.height = height;
    }
    if (weight !== undefined) {
      details.weight = weight;
    }

    return Object.keys(details).length ? details : null;
  },

  extractServiceDetails(text: string): ServiceDetails | null {
    const normalizedText = normalizeText(text);
    const rates = extractRates(normalizedText);
    const services: Partial<Record<EscortServiceName, ServiceAvailability>> = {};
    const duoOnlyText = !/\b(?:servici|meniu|ofer\s+urmatoarele)\b/i.test(normalizedText)
      && /\b(?:duo|colab|show\s+lesb|programari\s+in\s+3)\b/i.test(normalizedText);
    if (duoOnlyText) {
      return null;
    }

    const hasServiceContext = /\b(?:servici\w*|meniu|ofer\w*|pret(?:uri|urile)|tarif(?:e|ele)|cadou\w*|price|finalizare\w*)\b/i.test(normalizedText);
    if (!Object.keys(rates.baseRates).length && !Object.keys(rates.outcallRates).length && !hasServiceContext) {
      return null;
    }

    const virtualOnlyText = !Object.keys(rates.baseRates).length
      && !Object.keys(rates.outcallRates).length
      && /\b(?:poze|videoclip\w*|filmule\w*|sexting|web\s+show|masturbare)\b/i.test(normalizedText)
      && !/\b(?:servici\w*|meniu|escort\w*|vizit\w*|oral|sex\s+normal|masaj)\b/i.test(normalizedText);
    if (virtualOnlyText) {
      return null;
    }

    for (const service of SERVICE_NAMES) {
      const details = extractOneService(normalizedText, service);
      if (details !== undefined) {
        services[service] = details;
      }
    }

    if (!Object.keys(rates.baseRates).length && !Object.keys(rates.outcallRates).length && !Object.keys(services).length) {
      return null;
    }

    const details: ServiceDetails = {baseRates: rates.baseRates};
    if (Object.keys(rates.outcallRates).length) {
      details.outcallRates = rates.outcallRates;
    }
    if (Object.keys(services).length) {
      details.services = services;
    }

    return details;
  },
};
