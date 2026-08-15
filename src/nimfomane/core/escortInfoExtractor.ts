export interface PersonalDetails {
  age?: number;
  height?: number;
  weight?: number;
}

export interface EscortRates {
  halfHour?: number;
  hour?: number;
  hourAndHalf?: number;
  twoHours?: number;
}

export interface ServiceAvailability {
  practiced: boolean;
  extraCost?: number;
}

export type EscortServiceName =
  | 'op'
  | 'on'
  | 'normalProtected'
  | 'normalUnprotected'
  | 'deepthroat'
  | 'fk'
  | 'cim'
  | 'cof'
  | 'cob'
  | 'massage'
  | 'ap'
  | 'anal'
  | 'handJob'
  | 'sixtyNine'
  | 'gfe'
  | 'prostateMassage'
  | 'pse'
  | 'cunnilingus'
  | 'anilingus'
  | 'threesome'
  | 'couples'
  | 'lesbyShow'
  | 'dusImpreuna'
  | 'bdsm';

export interface ServiceDetails {
  baseRates: EscortRates;
  outcallRates: EscortRates;
  services: Partial<Record<EscortServiceName, ServiceAvailability>>;
}

const SMALL_CAPS = {
  'ᴬ': 'A', 'ᴮ': 'B', 'ᴰ': 'D', 'ᴱ': 'E', 'ᴳ': 'G', 'ᴴ': 'H', 'ᴵ': 'I', 'ᴶ': 'J', 'ᴷ': 'K', 'ᴸ': 'L', 'ᴹ': 'M', 'ᴺ': 'N', 'ᴼ': 'O', 'ᴾ': 'P', 'ᴿ': 'R', 'ᵀ': 'T', 'ᵁ': 'U', 'ⱽ': 'V', 'ᵂ': 'W',
  'ᴀ': 'a', 'ʙ': 'b', 'ᴄ': 'c', 'ᴅ': 'd', 'ᴇ': 'e', 'ꜰ': 'f', 'ɢ': 'g', 'ʜ': 'h', 'ɪ': 'i', 'ᴊ': 'j', 'ᴋ': 'k', 'ʟ': 'l', 'ᴍ': 'm', 'ɴ': 'n', 'ᴏ': 'o', 'ᴘ': 'p', 'ʀ': 'r', 'ꜱ': 's', 'ᴛ': 't', 'ᴜ': 'u', 'ᴠ': 'v', 'ᴡ': 'w', 'ʏ': 'y',
};

const SERVICE_PATTERNS: Record<EscortServiceName, RegExp> = {
  op: /\b(?:op|oral\s+(?:sex\s+)?(?:protejat|pro)|sex\s+oral\s+(?:protejat|pro)|oral\s+[pn]\s*\/\s*[pn])\b|\b(?:sex\s+)?oral\b[^\n.;]{0,35}\bprotejat\b/g,
  on: /\b(?:on|oral\s+(?:sex\s+)?(?:neprotejat|nepro)|sex\s+oral\s+(?:neprotejat|nepro)|oral\s+[pn]\s*\/\s*[pn])\b|\b(?:sex\s+)?oral\b[^\n.;]{0,35}\bneprotejat\b/g,
  normalProtected: /\b(?:sex\s+)?normal\s+(?:\(\s*)?(?:(?:obligatoriu|doar)\s+)?protejat\s*\)?/g,
  normalUnprotected: /\b(?:sex\s+)?normal\s+neprotejat\b/g,
  deepthroat: /\bdeep\s*throat\b|\bdeepthroat\b|\bdeep\b|\boral\s+adanc\b/g,
  fk: /\b(?:fk|french\s+kiss)\b/g,
  cim: /\bcim\b|\bfinaliz\w*\s+orala\b/g,
  cof: /\bcof\b|\bfinaliz\w*\s+faciala\b|\b(?:orala|faciala)\s*(?:\/|,|sau)\s*faciala\b/g,
  cob: /\bcob\b|\bfin\s+corp\b|\bfinaliz\w*\s+corporala\b|\b(?:orala|faciala)\s*(?:\/|,|sau)\s*corporala\b|\bfinaliz\w*\s+pe\s+sani\w*\b/g,
  massage: /\bmasaj(?:e|ul)?\b|\bmassage\b/g,
  ap: /\bap\b|\banal\s+protejat\b/g,
  anal: /\banal\b/g,
  handJob: /\bhand\s*jo+b\b|\bjob\s+manual\b/g,
  sixtyNine: /\b69\b/g,
  gfe: /\bgfe\b/g,
  prostateMassage: /\bmasaj\s+prostatic\b|\bprostat(?:a|ic)\b/g,
  pse: /\bpse\b|porn\s+star\s+experience/g,
  cunnilingus: /\bcunn?ilingus\b|\bcunni\b/g,
  anilingus: /\bann?ilingus\b|\bcunni\s*\/\s*ani\b/g,
  threesome: /\b(?:sex|intalniri)\s+in\s+3\b|\b(?:mmf|mff|3some)\b|\bintalniri\s+cu\s+(?:o\s+)?colega\b/g,
  couples: /\bcupl(?:u|uri)\b/g,
  lesbyShow: /\b(?:show\s+lesb\w*|lesb\w*\s+show)\b/g,
  dusImpreuna: /\bdus\s+(?:impreuna|asistat|in\s+doi)\b/g,
  bdsm: /\bbdsm\b|\bdominare\w*\b|\bdominatie\w*\b|\brough\b/g,
};

const SERVICE_NAMES = Object.keys(SERVICE_PATTERNS) as EscortServiceName[];
const NEGATIVE_WORDS = /\b(?:nu\s+(?:mai\s+)?(?:fac|ofer(?:im)?|practic|prestez|accept|primesc)|fara|niciodata|deloc|nepractic(?:at|a)?|nu\s+se\s+ofera)\b/i;
const NEGATIVE_ACTION = /\b(?:nu\s+(?:mai\s+)?(?:fac|ofer(?:im)?|practic|prestez|accept|primesc)|deloc|nepractic(?:at|a)?)\b/i;
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

    if (/\b(?:persoan|pustan|oameni|client|barbat|baiet|genul|sub|peste)\w*/i.test(line)) {
      continue;
    }
    if (!/\bam\b/i.test(beforeAge) && line.length > 100) {
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
  const negativeBefore = NEGATIVE_ACTION.test(before) || NEGATIVE_WORDS.test(before.slice(-25)) || NEGATIVE_EMOJIS.test(before.slice(-20));
  const negativeAfterWords = /\b(?:nu\s+(?:mai\s+)?(?:fac|ofer(?:im)?|practic|prestez|accept|primesc)|deloc)\b/i.test(after.slice(0, 18));
  const negativeAfter = negativeAfterWords || NEGATIVE_EMOJIS.test(after.slice(0, 20));

  if (negativeBefore && lastPositiveQualifier > before.search(NEGATIVE_WORDS)) {
    return false;
  }

  return negativeBefore || negativeAfter;
}

function extraCostNearOccurrence(text: string, service: EscortServiceName, start: number, end: number): number | undefined {
  const nearbyStart = Math.max(0, start - 25);
  const nearbyEnd = Math.min(text.length, end + 55);
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
  const extraPattern = /(?:\+\s*|extra\s*(?:cost)?\s*[:+]?|in\s+plus\s*|supliment(?:ar)?\s*[:+]?)(\d{2,4})\s*(?:lei|ron)?\b|(\d{2,4})\s*(?:lei|ron)?\s*extra\b/gi;
  for (const extraMatch of nearby.matchAll(extraPattern)) {
    const extraEnd = (extraMatch.index ?? 0) + extraMatch[0].length;
    const extraMatchEndsBeforeService = extraEnd < serviceEndOffset;
    const isDirectExtraBeforeService = extraMatchEndsBeforeService
      && /^extra/i.test(extraMatch[0])
      && serviceEndOffset - extraEnd <= 25;
    if ((isDirectExtraBeforeService || !extraMatchEndsBeforeService) && !hasAnotherService(extraEnd)) {
      return Number.parseInt(extraMatch[1] || extraMatch[2], 10);
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
  const start = lastOccurrence.index ?? 0;
  const end = start + lastOccurrence[0].length;
  const practiced = !isNegativeOccurrence(text, start, end);
  const details: ServiceAvailability = {practiced};

  if (practiced) {
    const extraCost = extraCostNearOccurrence(text, service, start, end);
    if (extraCost !== undefined) {
      details.extraCost = extraCost;
    }
  }

  return details;
}

function durationFromText(text: string, amountIndex: number): keyof EscortRates | undefined {
  const durationPattern = /\b(30|60|90|120)\s*(?:de\s*)?(?:min(?:ute)?s?|mi|')|\b(1|2)\s*(?:h|hr|ore?|ora)\b|\b(ora|h)\b/gi;
  const durations: Array<{index: number; duration: keyof EscortRates}> = [];

  for (const match of text.matchAll(durationPattern)) {
    const minutes = match[1] ? Number.parseInt(match[1], 10) : match[2] ? Number.parseInt(match[2], 10) * 60 : 60;
    const duration = minutes === 30 ? 'halfHour' : minutes === 60 ? 'hour' : minutes === 90 ? 'hourAndHalf' : minutes === 120 ? 'twoHours' : undefined;
    if (duration) {
      durations.push({index: match.index ?? 0, duration});
    }
  }

  const followingDuration = durations
    .filter(duration => duration.index >= amountIndex)
    .sort((left, right) => left.index - right.index)[0];
  if (followingDuration && followingDuration.index - amountIndex <= 70) {
    return followingDuration.duration;
  }

  durations.sort((left, right) => Math.abs(left.index - amountIndex) - Math.abs(right.index - amountIndex));
  return durations[0]?.index !== undefined && Math.abs(durations[0].index - amountIndex) <= 70 ? durations[0].duration : undefined;
}

function amountMatches(line: string): Array<{amount: number; index: number}> {
  const matches: Array<{amount: number; index: number}> = [];
  const moneyPattern = /\b(\d{2,5})\s*(?:lei|ron)\b|\b(\d{2,5})\s*(?=\s*(?:finalizar\w*|fin)\b)|\b(\d{2,5})\s*(?=-\s*\(?\s*(?:fin|final|\d+\s*(?:min|mi|h|hr|ore?|ora)|\d+\s*\/\s*\d+\s*fin|\d+\s*'))|\b(\d{2,5})\s*(?=\(\s*(?:30|60|90|120)\s*(?:min|mi|h|hr|ore?|ora))|\b(?:finalizar\w*)\D{0,12}(\d{2,5})\b/gi;

  for (const match of line.matchAll(moneyPattern)) {
    const amountText = match[1] || match[2] || match[3] || match[4] || match[5];
    if (amountText) {
      const index = match.index ?? 0;
      const precedingText = line.slice(Math.max(0, index - 20), index);
      const followingText = line.slice(index + match[0].length, index + match[0].length + 15);
      if (match[5] && /^(?:\s*[-–:]?\s*)?(?:30|60|90|120)?\s*(?:de\s*)?(?:min|minute|mi|h|ora)/i.test(followingText)) {
        continue;
      }
      if (/(?:\+|extra|in\s+plus)\s*$/i.test(precedingText) || /^\s*(?:lei|ron)?\s*extra\b/i.test(followingText)) {
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

  for (const line of text.split('\n')) {
    const isOutcallLine = /\b(?:out\s*call|hotel|deplasar)\w*/i.test(line);
    const isRateLine = /\b(?:lei|ron|pret|preturi|tarif|cadou\w*|price|finalizare|fin\b|\d+\s*(?:min|minute|mi|h|hr|ora|ore))\b|'/i.test(line);
    if (!isRateLine) {
      continue;
    }

    for (const money of amountMatches(line)) {
      let duration = durationFromText(line, money.index);
      const isOutcall = isOutcallLine && /\b(?:out\s*call|hotel|deplasar)\w*/i.test(line.slice(Math.max(0, money.index - 70), money.index));
      if (!duration && /\b(?:finalizare|fin)\w*/i.test(line) && !isOutcall) {
        duration = 'halfHour';
      }
      if (!duration || (suppressBaseRates && !isOutcall)) {
        continue;
      }

      const candidates = isOutcall ? outcallCandidates : baseCandidates;
      candidates[duration] = [...(candidates[duration] || []), money.amount];
    }
  }

  for (const duration of ['halfHour', 'hour', 'hourAndHalf', 'twoHours'] as Array<keyof EscortRates>) {
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

    for (const service of SERVICE_NAMES) {
      const details = extractOneService(normalizedText, service);
      if (details) {
        services[service] = details;
      }
    }

    if (!Object.keys(rates.baseRates).length && !Object.keys(rates.outcallRates).length && !Object.keys(services).length) {
      return null;
    }

    return {...rates, services};
  },
};
