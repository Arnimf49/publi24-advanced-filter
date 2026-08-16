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
  | 'facesitting'
  | 'facefuck'
  | 'fk'
  | 'cim'
  | 'cof'
  | 'cob'
  | 'massage'
  | 'uro'
  | 'squirt'
  | 'rolePlay'
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
  | 'dom'
  | 'domSoft'
  | 'domHard'
  | 'domination'
  | 'verbalHum'
  | 'dirtyTalk'
  | 'whipping'
  | 'spitting'
  | 'strapOn'
  | 'fisting'
  | 'goldenShower'
  | 'footfetish'
  | 'fingering';

export interface ServiceDetails {
  baseRates: EscortRates;
  outcallRates?: EscortRates;
  rateOverrides?: RateOverride[];
  schedule?: EscortSchedule[];
  dominationRates?: EscortRates;
  services?: Partial<Record<EscortServiceName, ServiceAvailability>>;
}

export interface RateOverride {
  after: string;
  rates?: EscortRates;
}

export interface EscortSchedule {
  days?: string;
  start: string;
  end: string;
}

const SMALL_CAPS = {
  'ᴬ': 'A', 'ᴮ': 'B', 'ᴰ': 'D', 'ᴱ': 'E', 'ᴳ': 'G', 'ᴴ': 'H', 'ᴵ': 'I', 'ᴶ': 'J', 'ᴷ': 'K', 'ᴸ': 'L', 'ᴹ': 'M', 'ᴺ': 'N', 'ᴼ': 'O', 'ᴾ': 'P', 'ᴿ': 'R', 'ᵀ': 'T', 'ᵁ': 'U', 'ⱽ': 'V', 'ᵂ': 'W',
  'ᴀ': 'a', 'ʙ': 'b', 'ᴄ': 'c', 'ᴅ': 'd', 'ᴇ': 'e', 'ꜰ': 'f', 'ɢ': 'g', 'ʜ': 'h', 'ɪ': 'i', 'ᴊ': 'j', 'ᴋ': 'k', 'ʟ': 'l', 'ᴍ': 'm', 'ɴ': 'n', 'ᴏ': 'o', 'ᴘ': 'p', 'ʀ': 'r', 'ꜱ': 's', 'ᴛ': 't', 'ᴜ': 'u', 'ᴠ': 'v', 'ᴡ': 'w', 'ʏ': 'y',
};

const SERVICE_PATTERNS: Record<EscortServiceName, RegExp> = {
  op: /\b(?:op|bj|bj\s+p\s*\/\s*n|p\s*\/\s*n|oral\s*(?:sex\s+)?(?:protejat|pro)|sex\s+oral\s*(?:protejat|pro)|oral\s*\(\s*pro\b|sex\s+oral\s*\(\s*pro\b|oral\s+(?:p|n|np)\s*\/\s*(?:p|n|np))\b|\b(?:sex\s+)?oral\b[^\n.;]{0,35}\b(?:protejat|pro)\b/g,
  on: /\b(?:on|bj|bj\s+p\s*\/\s*n|p\s*\/\s*n|oral\s*(?:sex\s+)?(?:neprotejat|nepro)|sex\s+oral\s*(?:neprotejat|nepro)|oral\s*\(\s*pro\s*\/\s*nepro\b|oral\s*\(\s*nepro\b|sex\s+oral\s*\(\s*nepro\b|oral\s+(?:p|n|np)\s*\/\s*(?:p|n|np))\b|\b(?:sex\s+)?oral\b[^\n.;]{0,35}\b(?:neprotejat|nepro|fara\s+prezervativ)\b/g,
  np: /\bnp\b|\b(?:sex\s+)?normal(?:ul)?\b(?!\s+neprotejat)(?:\s*\(\s*(?:(?:obligatoriu|doar)\s+)?protejat\s*[!.,;]?\s*\)|\s+(?:(?:obligatoriu|doar)\s+)?protejat\b|\s+in\s+diferite\s+pozitii\b)|\bsex\s*\(\s*(?:(?:obligatoriu|doar)\s+)?protejat\s*\)|\bact(?:ul)?\s+sexual\s+protejat\b/g,
  nn: /\b(?:sex\s+)?normal(?:ul)?\s+neprotejat\b|\bact(?:ul)?\s+sexual\s+neprotejat\b/g,
  deepthroat: /\b(?:dt|deep\s*throat|deepthroat|deep)\b|\boral\s+adanc\b/g,
  facesitting: /\bface\s*sitting\b|\bfacesitting\b/g,
  facefuck: /\bface\s*fuck\b|\bfacefuck\b/g,
  fk: /\b(?:fk|french\s+kiss)\b|(?<=fara\s)sarut(?:uri)?\b/g,
  cim: /\bcim\b|\bfin(?:aliz\w*)?\s+orala\b|\bejacul\w*\s+orala\b|\b(?:orala|faciala)\s*(?:\/|,|sau)\s*orala\b/g,
  cof: /\bcof\b|\bfin(?:aliz\w*)?\s+faciala\b|\bejacul\w*\s+faciala\b|\b(?:orala|faciala)\s*(?:\/|,|sau)\s*faciala\b/g,
  cob: /\bcob\b|\b(?:boob\s+job|sex\s+intre\s+sani)\b|\bfin\s+corp\b|\bfinaliz\w*\s+corporala\b|\b(?:orala|faciala)\s*(?:\/|,|sau)\s*corporala\b|\bfinaliz\w*\s+pe\s+sani\w*\b/g,
  massage: /\bmasaj(?:e|ul)?\b|\bmassage\b/g,
  uro: /\buro\b|\burin\w*\b/g,
  squirt: /\bsquirt(?:ing)?\b/g,
  rolePlay: /\brole\s*play\b|\bjoc\s+de\s+rol\b/g,
  ap: /\bap\b|\banal\s+protejat\b/g,
  anal: /\banal\b/g,
  hj: /\bhand\s*jo+b\b|\bjob\s+manual\b/g,
  '69': /\b69\b|\bpoziti(?:a|e|ile)?\s*69\b/g,
  gfe: /\bgfe\b|\bgirlfriend\s+experience\b/g,
  prostateMassage: /\bmasaj\s+prostatic\b|\bprostat(?:a|ic)\b/g,
  pse: /\bpse\b|porn\s+star\s+experience/g,
  cuni: /\bcunn?ilingus\b|\bcunni\b/g,
  ani: /\ban{1,3}i{1,2}lingus\b|\bcunni\s*\/\s*ani\b/g,
  '3some': /\b(?:sex|intalniri)\s+in\s+3\b|\b(?:mmf|mff|3some|threesome)\b|\bintalniri\s+cu\s+(?:o\s+)?colega\b/g,
  couples: /\bcupl(?:u|uri)\b/g,
  lesbyShow: /\b(?:show\s+lesb\w*|lesb\w*\s+show)\b/g,
  shower: /\bdus\s+(?:impreuna|asistat|in\s+doi)\b/g,
  dom: /\bdom\b|\bdominare\w*\s+nespecific\w*\b/g,
  domSoft: /\bdominar\w*\b[^\n.;]{0,40}\bsoft\b|\bsoft\b[^\n.;]{0,40}\bdominar\w*\b/g,
  domHard: /\bdominar\w*\b[^\n.;]{0,40}\bhard\b|\bhard\b[^\n.;]{0,40}\bdominar\w*\b/g,
  verbalHum: /\bumilir(?:e|ii|ea)?\s+verbal\w*\b|\bverbal\w*\s+umilir\w*\b|\bumilint\w*\b/g,
  dirtyTalk: /\bdirty\s*talk\b/g,
  whipping: /\bbiciuir\w*\b|\bwhipp(?:ing|ed)\b|\blovir\w*\b/g,
  spitting: /\b(?:spit(?:ting|ing)?|scuipat\w*)\b/g,
  domination: /\bbdsm\b|\bdominare\w*\b|\bdominatie\w*\b|\brough\b/g,
  strapOn: /\bstrap[\s-]?on\b/g,
  fisting: /\bfist(?:ing)?\b/g,
  goldenShower: /\bgolden\s+shower\b/g,
  footfetish: /\bfoot\s*fetish\b|\bfooth\s*fetish\b|\bfetis(?:ul)?\s+(?:pentru\s+)?picioare\b/g,
  fingering: /\bfingering\b|\bdeget(?:e|ele|elor|ul|ului)?\b(?!-?picioare)/g,
};

const SERVICE_NAMES = Object.keys(SERVICE_PATTERNS) as EscortServiceName[];
const NEGATIVE_WORDS = /\b(?:nu\s+(?:mai\s+)?(?:fac|ofer(?:im)?|practic|prestez|accept|primesc)|nu\s+sunt\s+pe\s+stilul|cu\s+exceptia|except(?:ia|iei)|fara|niciodata|deloc|nepractic(?:at|a)?|nu\s+se\s+ofera)\b/i;
const NEGATIVE_ACTION = /\b(?:nu\s+(?:mai\s+)?(?:fac|ofer(?:im)?|practic|prestez|accept|primesc)|nu\s+sunt\s+pe\s+stilul|cu\s+exceptia|except(?:ia|iei)|deloc|nepractic(?:at|a)?)\b/i;
const ANAL_EXCLUSION = /\bexclus(?:iv|a|e)?\b[^\n.;]{0,100}\b(?:sex\s+)?anal\b/i;
const NEGATIVE_EMOJIS = /[❌✖✘❎🚫⛔🛑]/u;
const RATE_DURATION_WORDS = /\b(?:min(?:ute)?s?|mi|h(?:r)?|ore?|ora)\b|'/i;

function isPriceAmount(amount: number): boolean {
  return amount % 10 === 0;
}

function normalizeText(text: string): string {
  const compatibilityText = text.normalize('NFKC').replace(/./gu, character => SMALL_CAPS[character as keyof typeof SMALL_CAPS] || character);
  return compatibilityText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
}

function isQuestionSentence(text: string, start: number, end: number): boolean {
  const previousQuestion = text.lastIndexOf('?', start - 1);
  if (previousQuestion !== -1 && start - previousQuestion <= 40) {
    return true;
  }

  const sentenceStart = Math.max(
    text.lastIndexOf('.', start - 1),
    text.lastIndexOf('!', start - 1),
    text.lastIndexOf('?', start - 1),
    text.lastIndexOf('\n', start - 1),
  ) + 1;
  const sentenceEndCandidates = ['.', '!', '?', '\n']
    .map(character => text.indexOf(character, end))
    .filter(index => index !== -1);
  const sentenceEnd = sentenceEndCandidates.length ? Math.min(...sentenceEndCandidates) : text.length;
  const sentence = text.slice(sentenceStart, sentenceEnd).trim();

  return sentence.includes('?')
    || /^(?:cine|ce|cum|cand|unde|de\s+ce|cat(?:a|i|e)?|care|ai\s+(?:spus|zis)|ați\s+(?:spus|zis))\b/i.test(sentence);
}

function findAge(text: string): number | undefined {
  const agePattern = /\b(\d{1,2})\s*(?:de\s*)?ani\b/g;

  for (const match of text.matchAll(agePattern)) {
    const matchStart = match.index ?? 0;
    const matchEnd = matchStart + match[0].length;
    if (isQuestionSentence(text, matchStart, matchEnd)) {
      continue;
    }

    const age = Number.parseInt(match[1], 10);
    if (age < 17 || age > 70) {
      continue;
    }

    const lineStart = Math.max(text.lastIndexOf('\n', match.index) + 1, 0);
    const lineEnd = text.indexOf('\n', match.index);
    const line = text.slice(lineStart, lineEnd === -1 ? text.length : lineEnd);
    const beforeAge = text.slice(lineStart, match.index);

    if (/\b(?:de\s+)?la\s*$/i.test(beforeAge)) {
      continue;
    }

    if (/\b\d{1,2}\s*[-–—]\s*$/i.test(beforeAge)) {
      continue;
    }

    if (/\b(?:limita\s+de\s+varsta|varsta\s+(?:minima|maxima)|(?:pe|la)\s+vremea\s+aceea)\b/i.test(beforeAge)) {
      continue;
    }

    if (/\b\d{1,2}\s*,\s*\d{1,2}\s+sau\s*$/i.test(beforeAge)) {
      continue;
    }

    if (/\b(?:persoan|pustan|oameni|client|barbat|baiet|genul|sub|peste)\w*/i.test(beforeAge)) {
      continue;
    }
    const profileNameBeforeAge = /\.\s*[a-z]{2,20}\s*$/i.test(beforeAge.slice(-40));
    const profileDetailsAfterAge = /^\s*[/|>]\s*(?:\d{2,3}\s*(?:kg|kilo(?:grame)?s?)|1[.,']\s*\d{2})\b/i.test(line.slice(match.index! + match[0].length - lineStart));
    const profileIntroduction = /\b(?:am|sunt|numele\s+meu\s+este|ma\s+numesc)\b/i.test(beforeAge);
    if (!profileIntroduction && line.length > 100 && !profileNameBeforeAge && !profileDetailsAfterAge) {
      continue;
    }

    return age;
  }

  return undefined;
}

function findHeight(text: string): number | undefined {
  const decimalHeight = /(?:^|[^\d])1(?:[.,']|\s+)\s*([3-9]\d)(?=\s*(?:m(?:etri)?\b|cm\b|inaltime\b|si\b|$|[|#]|[^\da-z]))/g;
  const centimetreHeight = /(?:^|[^\d])(1[3-9]\d)\s*(?:cm\b|centimetri?\b|inaltime\b)/g;

  for (const decimalMatch of text.matchAll(decimalHeight)) {
  const matchStart = decimalMatch.index ?? 0;
  const matchEnd = matchStart + decimalMatch[0].length;
  if (!isQuestionSentence(text, matchStart, matchEnd)) {
    return 100 + Number.parseInt(decimalMatch[1], 10);
  }
  }

  for (const centimetreMatch of text.matchAll(centimetreHeight)) {
  const matchStart = centimetreMatch.index ?? 0;
  const matchEnd = matchStart + centimetreMatch[0].length;
  if (!isQuestionSentence(text, matchStart, matchEnd)) {
    return Number.parseInt(centimetreMatch[1], 10);
  }
  }

  return undefined;
}

function findWeight(text: string): number | undefined {
  const weightPattern = /\b(\d{2,3})\s*(?:de\s*)?(?:kg|kilo(?:grame)?s?)\b/gi;

  for (const match of text.matchAll(weightPattern)) {
    const matchStart = match.index ?? 0;
    const matchEnd = matchStart + match[0].length;
    if (isQuestionSentence(text, matchStart, matchEnd)) {
      continue;
    }

    const beforeWeight = text.slice(Math.max(0, match.index! - 30), match.index);
    if (/\b(?:sub|peste|maxim(?:um)?|limita)\s*$/i.test(beforeWeight)) {
      continue;
    }
    if (/\b(?:pus\s+pe\s+mine|dat\s+jos)\b/i.test(beforeWeight)) {
      continue;
    }

    const weight = Number.parseInt(match[1], 10);
    if (weight >= 35 && weight <= 145) {
      return weight;
    }
  }

  return undefined;
}

function statementForOccurrence(text: string, start: number, end: number): string {
  const previousBoundary = Math.max(text.lastIndexOf('\n', start - 1), text.lastIndexOf('.', start - 1), text.lastIndexOf('!', start - 1), text.lastIndexOf('?', start - 1), text.lastIndexOf(';', start - 1));
  const nextBoundaries = ['\n', '.', '!', '?', ';'].map(character => text.indexOf(character, end)).filter(index => index !== -1);
  const nextBoundary = nextBoundaries.length ? Math.min(...nextBoundaries) : text.length;
  return text.slice(previousBoundary + 1, nextBoundary);
}

function isNegativeOccurrence(text: string, service: EscortServiceName, start: number, end: number): boolean {
  const statement = statementForOccurrence(text, start, end);
  const relativeStart = start - (text.indexOf(statement, Math.max(0, start - statement.length)) || 0);
  const before = statement.slice(0, Math.max(0, relativeStart));
  const after = statement.slice(Math.max(0, relativeStart));
  const lastPositiveQualifier = Math.max(before.lastIndexOf('doar'), before.lastIndexOf('numai'));
  const negativeBefore = service === 'fingering'
    ? text.slice(start, end).toLowerCase() !== 'fingering'
      && /\b(?:nu\s+(?:mai\s+)?(?:fac|ofer(?:im)?|practic|prestez|accept|primesc)|fara)\b[^\n.;]{0,100}$/i.test(before)
    : NEGATIVE_ACTION.test(before.slice(-80)) || NEGATIVE_WORDS.test(before.slice(-25)) || ANAL_EXCLUSION.test(statement) || NEGATIVE_EMOJIS.test(before.slice(-40));
  const negativeAfterWords = /\b(?:nu\s+(?:mai\s+)?(?:fac|ofer(?:im)?|practic|prestez)|deloc)\b/i.test(after.slice(0, 18));
  const negativeAfterTargetsOtherService = SERVICE_NAMES.some(otherService => {
    if (otherService === service) {
      return false;
    }

    return new RegExp(`\\b(?:${SERVICE_PATTERNS[otherService].source})\\b`, 'i').test(after.slice(0, 40));
  });
  const negativeAfter = (negativeAfterWords && !negativeAfterTargetsOtherService) || NEGATIVE_EMOJIS.test(after.slice(0, 20));

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
  const extraPattern = /(?:\+\s*\(\s*|\+\s*|extra\s*(?:cost)?\s*[:+]?|in\s+plus\s*|supliment(?:ar)?\s*[:+]?)(\d{2,4})\s*(?:lei|ron)?\b|(\d{2,4})\s*(?:lei|ron)?\s*extra\b|(\d{2,4})\s*(?:lei|ron)?\s*(?:extra|in\s+plus)\b/gi;
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

  const labeledExtra = service === 'cim'
    ? /(?:finaliz\w*|fin)\s+oral\w*\s*\)?\s*(\d{2,4})(?!\s*(?:de\s*)?(?:lei|ron)?\s*extra\b)\s*(?:de\s*)?(?:lei|ron)?\b/gi
    : service === 'cof'
      ? /(?:finaliz\w*|fin)\s+facial\w*\s*\)?\s*(\d{2,4})(?!\s*(?:de\s*)?(?:lei|ron)?\s*extra\b)\s*(?:de\s*)?(?:lei|ron)?\b/gi
      : undefined;
  if (labeledExtra) {
    for (const extraMatch of nearby.matchAll(labeledExtra)) {
      return Number.parseInt(extraMatch[1], 10);
    }
  }

  const previousLineStart = Math.max(0, text.lastIndexOf('\n', lineStart - 2) + 1);
  const previousLine = text.slice(previousLineStart, lineStart);
  const previousContext = text.slice(Math.max(0, lineStart - 200), lineStart);
  if (/\bextra\b/i.test(nearby) || /\bextra\b/i.test(previousLine) || /\bservici\w*\s+extra\b/i.test(previousContext)) {
    const serviceDashExtra = new RegExp(`\\b${service}\\s*[-–:]\\s*(\\d{2,4})\\s*(?:lei|ron)?\\b`, 'gi');
    for (const suffixMatch of nearby.matchAll(serviceDashExtra)) {
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
  const practiced = !isNegativeOccurrence(text, service, lastStart, lastEnd);
  let selectedOccurrence = lastOccurrence;

  if (practiced) {
    const occurrenceWithExtra = [...occurrences].reverse().find(occurrence => {
      const start = occurrence.index ?? 0;
      const end = start + occurrence[0].length;
      return !isNegativeOccurrence(text, service, start, end) && extraCostNearOccurrence(text, service, start, end) !== undefined;
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
  const durationPattern = /\b(30|60|90|120)\s*(?:(?:de[\s.]*)?(?:min(?:ute)?s?|mi)\b|['’])|\b(o\s+ora\s+si\s+30)\s+minute?\b|\bjumatatea\s+(?:de\s+)?ora\b|\b(1|2)\s*(?:(?:[/]|['’])\s*)?(?:h|hr|ore?|ora)\b|\b(doua)\s+ore?\b|\b(ora|h)\b/gi;
  const durations: Array<{index: number; duration: keyof EscortRates}> = [];
  const durationText = text.replace(/\bmax(?=\d)/gi, '   ');

  for (const match of durationText.matchAll(durationPattern)) {
    const minutes = /^jumatatea\s+(?:de\s+)?ora$/i.test(match[0])
      ? 30
      : match[1] ? Number.parseInt(match[1], 10) : match[2] ? 90 : match[3] ? Number.parseInt(match[3], 10) * 60 : match[4] ? 120 : 60;
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
  const splitFinalizationsDuration = /^\s*(?:lei|ron)?\s*(?:1\s*\/\s*2|1\s+sau\s+2)\s+fin(?:alizar\w*)?\s+(?:in|de)\s+60\s*['’]/i.test(text.slice(amountIndex, amountIndex + 70));
  if (splitFinalizationsDuration) {
    return '1h';
  }
  const followingIsDirect = followingDuration
    && /\d{2,5}\s*(?:de\s*)?(?:lei|ron)?\s*(?:o\s+)?[-:–/]?\s*$/i.test(text.slice(amountIndex, followingDuration.index));
  const followingIsParenthesized = followingDuration
    && text.slice(amountIndex, followingDuration.index).includes('(');

  if (followingDuration && (followingIsDirect || followingIsParenthesized) && followingDuration.index - amountIndex <= 70) {
    const precedingHasEarlierAmount = precedingDuration
      && otherAmountIndexes.some(index => index < precedingDuration.index && precedingDuration.index - index <= 40);
    if (followingIsParenthesized && precedingDuration && !precedingHasEarlierAmount) {
      return precedingDuration.duration;
    }

    return followingDuration.duration;
  }
  if (precedingDuration && amountIndex - precedingDuration.index <= 70) {
    return precedingDuration.duration;
  }
  if (followingDuration && followingDuration.index - amountIndex <= 70) {
    return followingDuration.duration;
  }

  if (/\b1\s*-\s*2\s+finalizar\w*/i.test(text.slice(amountIndex, amountIndex + 70))) {
    return '2h';
  }

  if (/\b(?:1\s*\/\s*2|1\s+sau\s+2)\s+finalizar\w*/i.test(text.slice(amountIndex, amountIndex + 70))) {
    return '1h';
  }

  const uniqueDurations = [...new Set(durations.map(duration => duration.duration))];
  return uniqueDurations.length === 1 && !otherAmountIndexes.length ? uniqueDurations[0] : undefined;
}

function amountMatches(line: string): Array<{amount: number; index: number}> {
  const matches: Array<{amount: number; index: number}> = [];
  const moneyPattern = /\b(\d{2,5})\s*(?:de\s*)?(?:lei|ron)\b|\b(\d{2,5})\s*(?=\s*(?:finalizar\w*|fin)\b)|\b(\d{2,5})\s*(?=-\s*\(?\s*(?:fin|final|\d+\s*finalizar\w*|\d+\s*['’]?\s*(?:min|mi|h|hr|ore?|ora)|\d+\s*\/\s*\d+\s*fin|\d+\s*'))|\b(\d{2,5})\s*(?=\(\s*(?:30|60|90|120)\s*(?:min|mi|h|hr|ore?|ora))|\b(?:finalizar\w*)\D{0,12}(\d{2,5})(?!\s*[:]|\s*(?:de\s*)?(?:min|minute|mi|h|hr|ore?|ora)\b)\b|\b(\d{2,5})\s*(?=\s*(?:(?:30|60|90|120)\s*(?:['’]\s*)?(?:min|mi|h|hr|ore?|ora)|(?:1|2)\s*(?:['’]\s*)?(?:h|hr|ore?|ora)|(?:ora|h)\b))|\b(\d{2,5})\s*(?=(?:num(?:arul|ar)\s*)?\(\s*(?:30|60|90|120)\s*(?:min|mi|h|hr|ore?|ora))|\b(\d{2,5})\s*(?=-\s*(?:oral|normal|masaj|diferite|gfe|fk|finaliz\w*|o\s+(?:finaliz\w*|ora)\b|(?:h|hr|ore?|ora)|anal)\b)|\b(\d{2,5})\s*(?=\s*o\s+(?:finalizar\w*|ora)\b)|\b(\d{2,5})\s*(?=\s*\(\s*(?:1\s*\/\s*2|1\s+sau\s+2)\s+finalizar\w*)|\b(?:30|60|90|120)\s*(?:['’]\s*)?(?:de\s*)?(?:min(?:ute)?s?|mi)\b[\s:=-]{1,12}(\d{2,5})\b|\b(?:1|2)\s*(?:['’]\s*)?(?:h|hr|ore?|ora)\b[\s:=-]{1,12}(\d{2,5})\b|\b(?:ora|h)\b[\s:=-]{1,12}(\d{2,5})\b/gi;

  const formattedMoneyPattern = /\b(\d{1,3}(?:[.,]\d{3})+)\s*(?:lei|ron)\b/gi;
  const isPhoneNumberPart = (index: number): boolean => {
    const phonePattern = /(?:^|[^\d])\d{3,4}(?:[\s.-]\d{3,4}){1,2}(?=$|[^\d])/g;
    for (const phoneMatch of line.matchAll(phonePattern)) {
      const phoneStart = phoneMatch.index ?? 0;
      const phoneEnd = phoneStart + phoneMatch[0].length;
      if (index >= phoneStart && index <= phoneEnd) {
        return true;
      }
    }

    return false;
  };

  for (const match of line.matchAll(formattedMoneyPattern)) {
    const amountText = match[1];
    const matchStart = match.index ?? 0;
    const index = matchStart + match[0].indexOf(amountText);
    if (!isPhoneNumberPart(index) && isPriceAmount(Number.parseInt(amountText.replace(/[.,]/g, ''), 10))) {
      matches.push({amount: Number.parseInt(amountText.replace(/[.,]/g, ''), 10), index});
    }
  }

  for (const match of line.matchAll(moneyPattern)) {
    const amountText = match[1] || match[2] || match[3] || match[4] || match[5] || match[6] || match[7] || match[8] || match[9] || match[10] || match[11] || match[12] || match[13];
    if (amountText) {
      const matchStart = match.index ?? 0;
      const index = matchStart + match[0].lastIndexOf(amountText);
      if (isPhoneNumberPart(index) || /[\d.,]/.test(line[index - 1] || '')) {
        continue;
      }
      if (/^finalizar\w*/i.test(line.slice(index + amountText.length))) {
        continue;
      }
      const precedingText = line.slice(Math.max(0, index - 20), index);
      const extendedPrecedingText = line.slice(Math.max(0, index - 80), index);
      const followingText = line.slice(matchStart + match[0].length, matchStart + match[0].length + 15);
      if (/^(?:30|60|90|120)$/.test(amountText) && /^(?:\s*[-–:]?\s*)?(?:30|60|90|120)?\s*(?:de\s*)?(?:min|minute|mi|h|ora)/i.test(followingText)) {
        continue;
      }
      if (/(?:\+|extra|in\s+plus)\s*$/i.test(precedingText) || /\b(?:cim|cof|cob)\s*\([^)]*\)\s*-\s*$/i.test(extendedPrecedingText) || /^\s*(?:de\s*)?(?:lei|ron)?\s*(?:extra|in\s+plus)\b/i.test(followingText)) {
        continue;
      }
      if (Number.parseInt(amountText, 10) < 100 && /^\s*-\s*\d+\s*(?:min|minute|mi|h|hr|ora|ore)\b/i.test(followingText)) {
        continue;
      }
      if (/\bfinaliz\w*[^\d]{0,12}:\s*$/i.test(extendedPrecedingText)) {
        continue;
      }
      if (isPriceAmount(Number.parseInt(amountText, 10))) {
        matches.push({amount: Number.parseInt(amountText, 10), index});
      }
    }
  }

  for (const match of line.matchAll(/\b(\d{2,5})\s*nr\b/gi)) {
    const amountText = match[1];
    const index = (match.index ?? 0) + match[0].indexOf(amountText);
    if (!isPhoneNumberPart(index) && isPriceAmount(Number.parseInt(amountText, 10)) && !matches.some(existing => existing.index === index)) {
      matches.push({amount: Number.parseInt(amountText, 10), index});
    }
  }

  for (const match of line.matchAll(/\b(\d{2,5})\s*\(\s*1\s*-\s*2\s+finalizar\w*/gi)) {
    const amountText = match[1];
    const index = (match.index ?? 0) + match[0].indexOf(amountText);
    if (!isPhoneNumberPart(index) && isPriceAmount(Number.parseInt(amountText, 10)) && !matches.some(existing => existing.index === index)) {
      matches.push({amount: Number.parseInt(amountText, 10), index});
    }
  }

  for (const match of line.matchAll(/\b(\d{2,5})\s+\d+\s*fin(?:alizar\w*)?\s*\/\s*(?:30|60|90|120)\s*min\b/gi)) {
    const amountText = match[1];
    const index = (match.index ?? 0) + match[0].indexOf(amountText);
    if (!isPhoneNumberPart(index) && isPriceAmount(Number.parseInt(amountText, 10)) && !matches.some(existing => existing.index === index)) {
      matches.push({amount: Number.parseInt(amountText, 10), index});
    }
  }

  return matches;
}

function extractRates(text: string): {baseRates: EscortRates; outcallRates: EscortRates; dominationRates: EscortRates} {
  const baseRates: EscortRates = {};
  const outcallRates: EscortRates = {};
  const dominationRates: EscortRates = {};
  const baseCandidates: Partial<Record<keyof EscortRates, number[]>> = {};
  const outcallCandidates: Partial<Record<keyof EscortRates, number[]>> = {};
  const dominationCandidates: Partial<Record<keyof EscortRates, number[]>> = {};
  const suppressBaseRates = !/\b(?:servici|prestat\w*|meniu|ofer\s+urmatoarele)\b/i.test(text) && /\b(?:duo|colab|show\s+lesb|programari\s+in\s+3)\b/i.test(text);
  let inOutcallSection = false;
  let inDominationSection = false;

  for (const line of text.split('\n')) {
    if (/\b(?:servicii?\s+de\s+dominare|dominare\s+activ[ăa])\b/i.test(line)) {
      inDominationSection = true;
    }
    if (/\bnu\s+(?:prestez|accept)\b/i.test(line)) {
      inDominationSection = false;
    }

    if (/\bdeplasar\w*\s*:/i.test(line)) {
      inOutcallSection = true;
    }

    const isOutcallLine = inOutcallSection || /\b(?:out\s*call|hotel|deplasar)\w*/i.test(line);
    const isAvailabilityLine = /\b(?:disponibil\w*|program\w*|pana\s+la)\b.*\b(?:ora|h)\b/i.test(line)
      && !/\b(?:lei|ron|pret\w*|tarif\w*|finaliz\w*|fin)\b/i.test(line);
    if (isAvailabilityLine) {
      continue;
    }

    const isRateLine = /(?:\b(?:lei|ron|pret|preturi|tarif|cadou\w*|price|finaliz\w*|fin\b|\d+\s*(?:min|minute|mi|h|hr|ora|ore))\b|\b\d{2,5}\s*(?:lei|ron)\b|\d{2,5}\s*nr\b|')/i.test(line)
      || (isOutcallLine && /\b(?:ora|h)\s+\d{2,5}\b/i.test(line));
    if (!isRateLine) {
      continue;
    }
    const directOutcallHours = /\b(?:ora|h)\s+(\d{2,5})\b/gi.test(line)
      ? [...line.matchAll(/\b(?:ora|h)\s+(\d{2,5})\b/gi)]
      : [];
    const directOutcallAmount = /\b(?:out\s*call|hotel|deplasar)\w*\b/i.test(line)
      ? directOutcallHours
        .map(match => Number.parseInt(match[1], 10))
        .reverse()
        .find(amount => amount >= 50 && isPriceAmount(amount))
      : undefined;
    if (directOutcallAmount !== undefined && directOutcallAmount >= 50) {
      outcallCandidates['1h'] = [...(outcallCandidates['1h'] || []), directOutcallAmount];
    }

    const isServiceExtraLine = /\bserv(?:icii)?\s+extra\b/i.test(line)
      || /^\s*\([^)]*(?:finaliz|fin\s+facial)/i.test(line);
    if (isServiceExtraLine) {
      continue;
    }

    const modifiedRateIndex = line.search(/\b(?:dupa|de\s+la)(?:\s+ora)?\b/i);
    const baseRateLine = modifiedRateIndex === -1 ? line : line.slice(0, modifiedRateIndex);
    const moneyMatches = amountMatches(baseRateLine);
    const compactFinalizationRates = /\bfin\w*\s+(\d{2,5})\s+ora\s+(\d{2,5})\b/i.exec(baseRateLine);
    if (compactFinalizationRates && !isOutcallLine) {
      const shortRate = Number.parseInt(compactFinalizationRates[1], 10);
      const hourRate = Number.parseInt(compactFinalizationRates[2], 10);
      if (isPriceAmount(shortRate)) {
        baseCandidates['30m'] = [...(baseCandidates['30m'] || []), shortRate];
      }
      if (isPriceAmount(hourRate)) {
        baseCandidates['1h'] = [...(baseCandidates['1h'] || []), hourRate];
      }
    }
    const splitFinalizationsRate = /\b(\d{2,5})\s*(?:lei|ron)\s+1\s*\/\s*2\s+fin\w*\s+(?:in|de)\s+60\s*['’]/i.exec(baseRateLine);
    if (splitFinalizationsRate && !isOutcallLine && isPriceAmount(Number.parseInt(splitFinalizationsRate[1], 10))) {
      baseCandidates['1h'] = [...(baseCandidates['1h'] || []), Number.parseInt(splitFinalizationsRate[1], 10)];
    }
    for (const money of moneyMatches) {
      let duration = durationFromText(baseRateLine, money.index, moneyMatches.filter(otherMoney => otherMoney !== money).map(otherMoney => otherMoney.index));
      const prefix = baseRateLine.slice(0, money.index);
      const outcallIndex = Math.max(prefix.lastIndexOf('outcall'), prefix.lastIndexOf('out call'), prefix.lastIndexOf('hotel'), prefix.lastIndexOf('deplasar'));
      const serviceContextIndex = Math.max(prefix.lastIndexOf('servici'), prefix.lastIndexOf('pret'), prefix.lastIndexOf('cadou'));
      const isOutcall = isOutcallLine && (inOutcallSection || (outcallIndex > serviceContextIndex && money.index - outcallIndex <= 70));
      if (!isPriceAmount(money.amount) || isOutcall && money.amount < 50) {
        continue;
      }
      const finalizationIndex = line.search(/\b(?:finalizare|fin)\w*/i);
      if (!duration && finalizationIndex !== -1 && money.index <= finalizationIndex + 40 && !isOutcall) {
        duration = '30m';
      }
      if (!duration && /\d{2,5}\s*nr\b/i.test(line) && !isOutcall) {
        duration = '30m';
      }
      if (!duration || (suppressBaseRates && !isOutcall)) {
        continue;
      }
      if (compactFinalizationRates && !isOutcall
        && money.index >= (compactFinalizationRates.index ?? 0)
        && money.index < (compactFinalizationRates.index ?? 0) + compactFinalizationRates[0].length) {
        continue;
      }

      const candidates = inDominationSection && !isOutcall
        ? dominationCandidates
        : isOutcall
          ? outcallCandidates
          : baseCandidates;
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
    const domination = dominationCandidates[duration];
    if (domination?.length) {
      dominationRates[duration] = Math.min(...domination);
    }
  }

  return {baseRates, outcallRates, dominationRates};
}

function extractRateOverrides(text: string, baseRates: EscortRates): RateOverride[] {
  const overrides: RateOverride[] = [];
  const thresholdPattern = /\b(?:dupa|de\s+la)(?:\s+ora)?\s+(\d{1,2})(?:[:.](\d{2}))?\b/gi;
  const durations = ['30m', '1h', '1.5h', '2h'] as Array<keyof EscortRates>;

  for (const thresholdMatch of text.matchAll(thresholdPattern)) {
    const hour = Number.parseInt(thresholdMatch[1], 10);
    const minute = thresholdMatch[2] ? Number.parseInt(thresholdMatch[2], 10) : 0;
    if (hour > 23 || minute > 59) {
      continue;
    }

    const thresholdEnd = (thresholdMatch.index ?? 0) + thresholdMatch[0].length;
    const lineEnd = text.indexOf('\n', thresholdEnd);
    const firstLineEnd = lineEnd === -1 ? text.length : lineEnd;
    const tail = text.slice(thresholdEnd, firstLineEnd);
    const followingLines = text.slice(firstLineEnd + 1).split('\n');
    const sequentialAmounts: number[] = [];
    for (const followingLine of followingLines) {
      const sequentialAmount = /^[^\d]*(\d{2,5})[^\d]*$/.exec(followingLine.trim());
      if (!sequentialAmount) {
        break;
      }

      sequentialAmounts.push(Number.parseInt(sequentialAmount[1], 10));
      if (sequentialAmounts.length >= durations.filter(duration => baseRates[duration] !== undefined).length) {
        break;
      }
    }
    const override: RateOverride = {after: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`};
    const surchargeMatch = /\+\s*(\d{2,5})\s*(?:lei|ron)?\b|\bcu\s+(\d{2,5})\s*(?:de\s+)?(?:lei|ron)?\s+in\s+plus\b/i.exec(tail);
    const rates = extractRates(tail).baseRates;
    if (!Object.keys(rates).length && sequentialAmounts.length) {
      for (const [index, duration] of durations.filter(duration => baseRates[duration] !== undefined).entries()) {
        const amount = sequentialAmounts[index];
        if (amount !== undefined) {
          rates[duration] = amount;
        }
      }
    }
    const pairedPricesMatch = /\bpret(?:urile|uri)?\s+sunt\s+(\d{2,5})\s*\/\s*(\d{2,5})\b/i.exec(tail);
    const pairedPrices = pairedPricesMatch && Object.keys(baseRates).includes('30m') && Object.keys(baseRates).includes('1h')
      ? {'30m': Number.parseInt(pairedPricesMatch[1], 10), '1h': Number.parseInt(pairedPricesMatch[2], 10)}
      : undefined;
    const surcharge = surchargeMatch?.[1] || surchargeMatch?.[2];
    if (surcharge) {
      const amount = Number.parseInt(surcharge, 10);
      const effectiveRates: EscortRates = {...baseRates};
      for (const duration of Object.keys(effectiveRates) as Array<keyof EscortRates>) {
        effectiveRates[duration] = effectiveRates[duration]! + amount;
      }
      override.rates = {...effectiveRates, ...rates};
    } else if (Object.keys(rates).length) {
      override.rates = rates;
    } else if (pairedPrices) {
      override.rates = pairedPrices;
    }
    if (override.rates) {
      overrides.push(override);
    }
  }

  return overrides;
}

const DAY_NAME_PATTERN = '(?:luni|marti|miercuri|joi|vineri|sambata|duminica)';
const DAY_ABBREVIATION_PATTERN = '(?:l|s|d)';
const DAY_EXPRESSION_PATTERN = new RegExp(`\\b(?:week(?:\\s|-)?end|${DAY_NAME_PATTERN}(?:\\s*(?:-|pana(?:\\s+la)?|si\\s+pana(?:\\s+la)?)\\s*${DAY_NAME_PATTERN})?|${DAY_ABBREVIATION_PATTERN}(?:\\s*-\\s*${DAY_ABBREVIATION_PATTERN})?)\\b`, 'gi');
const SCHEDULE_TIME_RANGE_PATTERN = /\b([01]?\d|2[0-3]|24)(?:[:.]([0-5]\d))?\s*(?:h|ore?)?\s*(?:-|[–—/]|\bsi\b)\s*([01]?\d|2[0-3]|24)(?:[:.]([0-5]\d))?\s*(?:h|ore?)?\b/gi;

function containsScheduleTimeRange(text: string): boolean {
  SCHEDULE_TIME_RANGE_PATTERN.lastIndex = 0;
  return SCHEDULE_TIME_RANGE_PATTERN.test(text);
}

function normalizeScheduleDays(expression: string): string {
  const normalized = expression.replace(/\s+/g, ' ').trim().toLocaleLowerCase();
  const dayNames: Record<string, string> = {
    l: 'luni',
    lu: 'luni',
    ma: 'marti',
    mi: 'miercuri',
    j: 'joi',
    v: 'vineri',
    s: 'sambata',
    d: 'duminica',
  };
  const compact = normalized.replace(/\s/g, '');
  if (/^week-?end$/.test(compact)) {
    return 'sambata-duminica';
  }

  const shorthandParts = compact.split('-');
  if (shorthandParts.length === 2 && shorthandParts.every(part => dayNames[part])) {
    return `${dayNames[shorthandParts[0]]}-${dayNames[shorthandParts[1]]}`;
  }

  if (dayNames[compact]) {
    return dayNames[compact];
  }

  const days = normalized.match(new RegExp(DAY_NAME_PATTERN, 'g')) || [];
  if (days.length > 1) {
    return `${days[0]}-${days[days.length - 1]}`;
  }

  return days[0] || normalized;
}

function scheduleDaysNearRange(line: string, rangeStart: number, rangeEnd: number): string | undefined {
  const dayExpressions = [...line.matchAll(DAY_EXPRESSION_PATTERN)].map(match => ({
    expression: match[0],
    start: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length,
  }));
  const precedingExpression = dayExpressions
    .filter(expression => expression.end <= rangeStart)
    .map(expression => ({
      ...expression,
      hasRangeBetween: containsScheduleTimeRange(line.slice(expression.end, rangeStart)),
      distance: rangeStart - expression.end,
    }))
    .filter(expression => expression.distance <= 70 && !expression.hasRangeBetween)
    .sort((left, right) => left.distance - right.distance)[0];
  const followingExpression = dayExpressions
    .filter(expression => expression.start >= rangeEnd)
    .map(expression => ({
      ...expression,
      distance: expression.start - rangeEnd,
    }))
    .filter(expression => expression.distance <= 70)
    .sort((left, right) => left.distance - right.distance)[0];
  const nearestExpression = precedingExpression || followingExpression;
  SCHEDULE_TIME_RANGE_PATTERN.lastIndex = 0;

  const isWeekendInclusion = nearestExpression
    && /week(?:\s|-)?end/i.test(nearestExpression.expression)
    && /\binclusiv\s+in\s*$/i.test(line.slice(Math.max(0, nearestExpression.start - 30), nearestExpression.start));
  if (nearestExpression && !isWeekendInclusion) {
    return normalizeScheduleDays(nearestExpression.expression);
  }

  return /\binclusiv\s+in\s+weekend\b/i.test(line) ? 'zilnic' : undefined;
}

function extractSchedule(text: string): EscortSchedule[] {
  const schedules: EscortSchedule[] = [];

  for (const line of text.split('\n')) {
    const hasScheduleContext = /\b(?:program\w*|orar|interval|disponib\w*)\b/i.test(line)
      || DAY_EXPRESSION_PATTERN.test(line)
      || /⏰/u.test(line);
    DAY_EXPRESSION_PATTERN.lastIndex = 0;
    if (!hasScheduleContext) {
      continue;
    }

    for (const match of line.matchAll(SCHEDULE_TIME_RANGE_PATTERN)) {
      const rangeStart = match.index ?? 0;
      const rangeEnd = rangeStart + match[0].length;
      const schedule: EscortSchedule = {
        start: `${match[1].padStart(2, '0')}:${match[2] || '00'}`,
        end: `${match[3].padStart(2, '0')}:${match[4] || '00'}`,
      };
      const days = scheduleDaysNearRange(line, rangeStart, rangeEnd);
      if (days) {
        schedule.days = days;
      }

      const duplicate = schedules.some(existing => existing.start === schedule.start
        && existing.end === schedule.end
        && existing.days === schedule.days);
      const repeatedUndeclaredHours = !schedule.days && schedules.some(existing => existing.start === schedule.start
        && existing.end === schedule.end
        && existing.days);
      if (!duplicate && !repeatedUndeclaredHours) {
        schedules.push(schedule);
      }
    }
  }

  return schedules;
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
    const rateOverrides = extractRateOverrides(normalizedText, rates.baseRates);
    const schedule = extractSchedule(normalizedText);
    const services: Partial<Record<EscortServiceName, ServiceAvailability>> = {};
    const duoOnlyText = /\bcombo\b/i.test(normalizedText)
      || (!/\b(?:servici|prestat\w*|meniu|ofer\s+urmatoarele)\b/i.test(normalizedText)
        && /\b(?:duo|colab|show\s+lesb|programari\s+in\s+3)\b/i.test(normalizedText));
    if (duoOnlyText) {
      return null;
    }

    const temporaryPromotionOnlyText = /\bpromot\w*\b/i.test(normalizedText)
      && /\bservicii\s+clasice\b/i.test(normalizedText)
      && /\bsemnatur\w*\b/i.test(normalizedText);
    const limitedPromotionText = /\blocur\w*\s+limitat\w*\b/i.test(normalizedText)
      && /\bscot\w*\s+la\s+bataie\b/i.test(normalizedText);
    if (temporaryPromotionOnlyText || limitedPromotionText) {
      return null;
    }

    const hasServiceContext = /\b(?:servici\w*|prestat\w*|meniu|ofer\w*|pret(?:uri|urile)|tarif(?:e|ele)|cadou\w*|price|finalizare\w*)\b/i.test(normalizedText);
    if (!Object.keys(rates.baseRates).length && !Object.keys(rates.outcallRates).length && !rateOverrides.length && !hasServiceContext) {
      return null;
    }

    const virtualOnlyText = /\b(?:videoclip\w*|filmule\w*|sexting|web\s+show|masturbare)\b/i.test(normalizedText)
      && !/\b(?:servici\w*|meniu|escort\w*|vizit\w*|oral|sex\s+normal|masaj)\b/i.test(normalizedText);
    if (virtualOnlyText) {
      return null;
    }

    if (Object.keys(rates.baseRates).length) {
      for (const service of SERVICE_NAMES) {
        const details = extractOneService(normalizedText, service);
        if (details !== undefined) {
          services[service] = details;
        }
      }

      if (services.domSoft !== undefined || services.domHard !== undefined) {
        delete services.dom;
        delete services.domination;
      }
    }

    if (!Object.keys(rates.baseRates).length) {
      return null;
    }

    const details: ServiceDetails = {baseRates: rates.baseRates};
    if (Object.keys(rates.outcallRates).length) {
      details.outcallRates = rates.outcallRates;
    }
    if (Object.keys(rates.dominationRates).length) {
      details.dominationRates = rates.dominationRates;
    }
    if (rateOverrides.length) {
      details.rateOverrides = rateOverrides;
    }
    if (schedule.length) {
      details.schedule = schedule;
    }
    if (Object.keys(services).length) {
      details.services = services;
    }

    return details;
  },
};
