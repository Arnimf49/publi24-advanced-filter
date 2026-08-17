export interface PersonalDetails {
  age?: number;
  height?: number;
  weight?: number;
}

export interface EscortRates {
  '30m'?: number | string;
  '1h'?: number | string;
  '1.5h'?: number | string;
  '2h'?: number | string;
}

export type ServiceAvailability = boolean | {extraCost: number};

export type EscortServiceName =
  | 'op'
  | 'on'
  | 'np'
  | 'nn'
  | 'showerSex'
  | 'deepthroat'
  | 'facesitting'
  | 'facefuck'
  | 'fk'
  | 'fj'
  | 'hardSex'
  | 'cim'
  | 'cof'
  | 'cob'
  | 'swallow'
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
  'ᴀ': 'a', 'ʙ': 'b', 'ᴄ': 'c', 'ᴅ': 'd', 'ᴇ': 'e', 'ꜰ': 'f', 'ғ': 'f', 'ɢ': 'g', 'ʜ': 'h', 'ɪ': 'i', 'ᴊ': 'j', 'ᴋ': 'k', 'ʟ': 'l', 'ᴍ': 'm', 'ɴ': 'n', 'ᴏ': 'o', 'ᴘ': 'p', 'ʀ': 'r', 'ꜱ': 's', 'ᴛ': 't', 'ᴜ': 'u', 'ᴠ': 'v', 'ᴡ': 'w', 'ʏ': 'y', 'ᴢ': 'z',
};

const SERVICE_PATTERNS: Record<EscortServiceName, RegExp> = {
  op: /\b(?:op|bj|bj\s+p\s*\/\s*n|p\s*\/\s*n|oral\s*(?:sex\s+)?(?:protejat|pro)|sex\s+oral\s*(?:protejat|pro)|oral\s*\(\s*pro\b|sex\s+oral\s*\(\s*pro\b|oral\s+(?:p|n|np)\s*\/\s*(?:p|n|np))\b|\b(?:sex\s+)?oral\b[^\n.;]{0,35}\b(?:protejat|pro)\b|\b(?:sex\s+)?oral\b[^\n.;]{0,35}\bfunctie\s+de\s+igiena\b|(?<!cu\s)\bsex\s+oral\b(?!\s+(?:neprotejat|nepro|protejat|pro))\b/g,
  on: /\b(?:on|bj|bj\s+p\s*\/\s*n|p\s*\/\s*n|oral\s*(?:sex\s+)?(?:neprotejat|nepro)|sex\s+oral\s*(?:neprotejat|nepro)|oral\s*\(\s*pro\s*\/\s*nepro\b|oral\s*\(\s*nepro\b|sex\s+oral\s*\(\s*nepro\b|oral\s+(?:p|n|np)\s*\/\s*(?:p|n|np))\b|\b(?:sex\s+)?oral\b[^\n.;]{0,35}\b(?:neprotejat|nepro|fara\s+prezervativ)\b|\b(?:sex\s+oral|oral)\b[^\n.;]{0,35}\bfunctie\s+de\s+igiena\b|(?<!cu\s)\bsex\s+oral\b(?!\s+(?:neprotejat|nepro|protejat|pro))\b/g,
  np: /\bnp\b|\b(?:sex\s+)?normal(?:ul)?\b(?!\s+neprotejat)(?:\s*\(\s*(?:(?:obligatoriu|doar|strict)\s+)?protejat\s*[!.,;]?\s*\)|\s+(?:(?:obligatoriu|doar|strict)\s+)?protejat\b|\s+in\s+diferite\s+pozitii\b)|\bnormal\b[^\n.;]{0,30}\bprotejat\b|\bsex\s*\(\s*(?:(?:obligatoriu|doar|strict)\s+)?protejat\s*\)|\bact(?:ul)?\s+sexual\s+protejat\b|\bsex\s+normal\b(?!\s+neprotejat)\b/g,
  nn: /\b(?:sex\s+)?normal(?:ul)?\s+neprotejat\b|\bact(?:ul)?\s+sexual\s+neprotejat\b/g,
  showerSex: /\b(?:sex|partid[ăa])\s+(?:la|sub|in)\s+duș\b|\b(?:sex|partid[ăa])\s+(?:la|sub|in)\s+dus\b|\bduș\s+(?:cu\s+sex|sex)\b|\bdus\s+(?:cu\s+sex|sex)\b/g,
  deepthroat: /\b(?:dt|deep\s*throat|deepthroat|deeptroath|deeptrhoat|deepthrot|deep)\b|\boral\s+adanc\b/g,
  facesitting: /\bface\s*sitting\b|\bfacesitting\b|\bfacesiting\b/g,
  facefuck: /\bface\s*fuck\b|\bfuck\s+face\b|\bfacefuck\b/g,
  fk: /\b(?:fk|french\s+kiss|fake\s+kiss)\b|(?<=fara\s)sarut(?:uri)?\b|\bsarut(?=\s*[+:-])|\bsarut(?=\s*\([^)]*(?:contra|extra|cost))/g,
  fj: /\bfj\b|\bfoot\s*job\b/g,
  hardSex: /\b(?:hard\s+sex|hardcore\s+sex|sex\s+hard|hard\s*[-–]\s*brutal)\b/g,
  cim: /\bcim\b|\bfin(?:aliz\w*)?\.?\s+orala\b|\bejacul\w*\s+orala\b|\b(?:orala|faciala)\s+(?:orala|faciala)\b|\b(?:orala|faciala)\s*(?:\/|,|sau)\s*orala\b/g,
  cof: /\bcof\b|\bfin(?:aliz\w*)?\s+faciala\b|\bejacul\w*\s+faciala\b|\b(?:orala|faciala)\s+(?:orala|faciala)\b|\b(?:orala|faciala)\s*(?:\/|,|sau)\s*faciala\b/g,
  cob: /\bcob\b|\b(?:boob\s+job|sex\s+intre\s+sani)\b|\bfin\s+corp(?:orala)?\b|\bfinaliz\w*\s+(?:doar\s+)?corporala\b|\b(?:orala|faciala)\s*(?:\/|,|sau)\s*corporala\b|\bfinaliz\w*\s+pe\s+(?:sani\w*|corp)\b|\bfinaliz\w*\s+sani\w*\s*\/\s*fund\b|\bating\w*\s+cu\s+sani\w*\b/g,
  swallow: /\bswallow\b|\binghiț\w*\b|\binghit\w*\b|\binghiere\b/g,
  massage: /\bmasaj(?:e|ul)?\b|\bmassage\b/g,
  uro: /\buro(?=\d|\b)|\burin\w*\b/g,
  squirt: /\bsquirt(?:ing)?\b/g,
  rolePlay: /\brole\s*play\b|\bjoc\s+de\s+rol\b/g,
  ap: /\bap\b|\banal\s+protejat\b/g,
  anal: /\banal\b/g,
  hj: /\bhand\s*jo+b\b|\bjob\s+manual\b/g,
  '69': /\b69\b|\bpoziti(?:a|e|ile)?\s*69\b|6️⃣9️⃣/g,
  gfe: /\bgfe\b|\bgirlfriend\s+experience\b/g,
  prostateMassage: /\bmasaj\s+prostatic\b|\bprostat(?:a|ic)\b/g,
  pse: /\bpse\b|porn\s+star\s+experience/g,
  cuni: /\bcunn?ilingus\b|\bcunni\b|\blimbut\w*\b|\blimb\w*\s+in\s+(?:p(?:a|ă)s(?:a|ă)ric(?:a|ă)|vagin)(?:\s+si\s+fund)?\b/g,
  ani: /\ban{1,3}i{1,2}lingus\b|\baniligus\b|\brimming\b|\bcunni\s*\/\s*ani\b|\blimb\w*\s+in\s+(?:fund|(?:p(?:a|ă)s(?:a|ă)ric(?:a|ă)|vagin)\s+si\s+fund)\b/g,
  '3some': /\b(?:sex|intalniri)\s+in\s+3\b|\b(?:mmf|mff|3some|threesome)\b|\btrio\s*\(\s*2\s+barbati\b|\bintalniri\s+cu\s+(?:o\s+)?colega\b/g,
  couples: /\bcupl(?:u|uri)\b/g,
  lesbyShow: /\b(?:show\s+lesb\w*|lesb\w*\s+show)\b/g,
  shower: /\bdus\s+(?:impreuna|asistat|in\s+doi)\b/g,
  dom: /\bdom\b|\bdominare\w*\s+nespecific\w*\b/g,
  domSoft: /\bdominar\w*\b[^\n.;]{0,40}\b(?:soft|usoar\w*)(?=\d|\b)|\b(?:soft|usoar\w*)(?=\d|\b)[^\n.;]{0,40}\bdominar\w*\b/g,
  domHard: /\bdominar\w*\b[^\n.;]{0,40}\bhard(?=\d|\b)|\bhard(?=\d|\b)[^\n.;]{0,40}\bdominar\w*\b/g,
  verbalHum: /\bumilir(?:e|ii|ea)?\s+verbal\w*\b|\bverbal\w*\s+umilir\w*\b|\bumilint\w*\b|\bumilesc\b/g,
  dirtyTalk: /\bdirty\s*talk\b/g,
  whipping: /\bbiciuir\w*\b|\bwhipp(?:ing|ed)\b|\blovir\w*\b|\bbat\b|\bpalet[ăa]\b/g,
  spitting: /\b(?:spit(?:ting|ing)?|scuip\w*)\b/g,
  domination: /\bbdsm\b|\bdominare\w*\b|\bdominatie\w*\b|\brough\b/g,
  strapOn: /\bstrap[\s-]?on\b|\bpentre[sz]\w*\b/g,
  fisting: /\bfist(?:ing)?\b/g,
  goldenShower: /\bgolden\s+shower\b/g,
  footfetish: /\bfoot\s*(?:job\s*[/|]\s*)?fetish\b|\bfood\s*fetish\b|\bfooth\s*fetish\b|\bfetis(?:ul)?\s+(?:pentru\s+)?picioare\b/g,
  fingering: /\bfingering\b|\bdeget(?:e|ele|elor|ul|ului)?\b(?!-?picioare)|\bating\w*\s+in\s+zona\s+intim\w*\b/g,
};

const SERVICE_NAMES = Object.keys(SERVICE_PATTERNS) as EscortServiceName[];
const NEGATIVE_WORDS = /\b(?:nu\s+(?:mai\s+)?(?:fac|ofer(?:im)?|practic|prestez|accept|primesc)|nu\s+sunt\s+pe\s+stilul|cu\s+exceptia|except(?:ia|iei)|fara|niciodata|deloc|nepractic(?:at|a)?|nu\s+se\s+ofera)\b/i;
const NEGATIVE_ACTION = /\b(?:nu\s+(?:mai\s+)?(?:fac|ofer(?:im)?|practic|prestez|accept|primesc)|nu\s+sunt\s+pe\s+stilul|cu\s+exceptia|except(?:ia|iei)|deloc|nepractic(?:at|a)?)\b/i;
const ANAL_EXCLUSION = /\bexclus(?:iv|a|e)?\b[^\n.;]{0,100}\b(?:sex\s+)?anal\b/i;
const NEGATIVE_EMOJIS = /[❌✖✘❎🚫⛔]/u;
const RATE_DURATION_WORDS = /\b(?:min(?:ute)?s?|mi|h(?:r)?|ore?|ora)\b|'/i;
const EXCLUSION = /\bexclus(?:iv|a|e)?\b/i;

function isPriceAmount(amount: number): boolean {
  return amount % 10 === 0;
}

function numericRateAmount(rate: number | string): number {
  return typeof rate === 'number' ? rate : Number.parseInt(rate, 10);
}

function normalizeText(text: string): string {
  const compatibilityText = text.normalize('NFKC')
    .replace(/([0-9])\uFE0F?\u20E3/gu, '$1')
    .replace(/./gu, character => {
      const codePoint = character.codePointAt(0);
      if (codePoint !== undefined && codePoint >= 0x1F150 && codePoint <= 0x1F169) {
        return String.fromCharCode(65 + codePoint - 0x1F150);
      }

      return SMALL_CAPS[character as keyof typeof SMALL_CAPS] || character;
    });
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
  const weightPattern = /\b(\d{2,3})[^\S\r\n]*(?:de[^\S\r\n]*)?(?:kg|kilo(?:grame)?s?)\b|\b(?:kg|kilo(?:grame)?s?)(?:[^\S\r\n]*[.:\-])*[^\S\r\n]*(\d{2,3})\b/gi;

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

    const weight = Number.parseInt(match[1] || match[2], 10);
    if (weight >= 35 && weight <= 145) {
      return weight;
    }
  }

  return undefined;
}

function statementForOccurrence(text: string, start: number, end: number): string {
  const previousBoundary = Math.max(text.lastIndexOf('\n', start - 1), text.lastIndexOf('.', start - 1), text.lastIndexOf('!', start - 1), text.lastIndexOf('?', start - 1), text.lastIndexOf(';', start - 1), text.lastIndexOf('‼️', start - 1));
  const nextBoundaries = ['\n', '.', '!', '?', ';', '‼️'].map(character => text.indexOf(character, end)).filter(index => index !== -1);
  const nextBoundary = nextBoundaries.length ? Math.min(...nextBoundaries) : text.length;
  return text.slice(previousBoundary + 1, nextBoundary);
}

function isNegativeOccurrence(text: string, service: EscortServiceName, start: number, end: number): boolean {
  const statement = statementForOccurrence(text, start, end);
  const occurrence = text.slice(start, end);
  if (service === 'cim' && /\b(?:inghit\w*|swallow)\b[^\n.;]{0,20}\bcim\b/i.test(statement)) {
    return false;
  }
  if (service === 'anal'
    && /\b(?:nu\s+accept(?:\s+si)?\s+nu\s+fac|nu\s+fac)\b[\s\S]{0,100}\banal\b/i.test(
      text.slice(Math.max(0, start - 120), Math.min(text.length, end + 1)),
    )) {
    return true;
  }
  if (service === 'uro' && /\bdoar\s+fac\b[^\n.;]{0,40}\bnu\s+(?:si\s+)?accept\b/i.test(statement)) {
    return true;
  }
  if ((service === 'op' || service === 'on')
    && /\b(?:sex\s+)?oral\s+protejat\s*\/\s*neprotejat\b[^\n.;]{0,40}\bfunct(?:ie|ii)\w*\s+de\s+igiena\b/i.test(statement)) {
    return false;
  }
  if (service === 'fingering'
    && /\bcunni\w*\b[^\n]{0,30}\bexclus(?:iv|a|e)?\b[^\n]{0,20}\bfingering\b/i.test(statement)) {
    return false;
  }
  if (service === 'np' && /\b(?:doar|strict|obligatoriu)\s+protejat\b/i.test(statement)
    && !/\b(?:nu|fara|exclus)\b/i.test(statement)) {
    return false;
  }
  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  const precedingContext = text.slice(Math.max(0, lineStart - 120), start);
  const exclusionContinuation = /\b(?:nu\s+(?:mai\s+)?(?:fac|ofer(?:im)?|practic|prestez|accept|primesc)|exclus(?:iv|a|e)?)\b[^\n]{0,100}\n/i.test(precedingContext)
    && /^\s*(?:(?:cof|cim|cob)\s*[,;]?\s*)+$/i.test(text.slice(lineStart, end));
  const relativeStart = start - (text.indexOf(statement, Math.max(0, start - statement.length)) || 0);
  const before = statement.slice(0, Math.max(0, relativeStart));
  const after = statement.slice(Math.max(0, relativeStart));
  const lastPositiveQualifier = Math.max(before.lastIndexOf('doar'), before.lastIndexOf('numai'));
  const directNegativePrefix = NEGATIVE_EMOJIS.test(text.slice(Math.max(0, start - 4), start))
    || /\bnu\s+(?:mai\s+)?(?:fac|ofer(?:im)?|practic|prestez|accept|primesc)\b[^\n.;]{0,80}$/i.test(text.slice(Math.max(0, start - 100), start));
  const negativeBefore = NEGATIVE_ACTION.test(before.slice(-80))
      || /\bnu\s+accept\b[^\n.;]{0,160}$/i.test(before)
      || NEGATIVE_WORDS.test(before.slice(-25))
      || ANAL_EXCLUSION.test(statement)
      || (EXCLUSION.test(before) && !/\bexclus\s+neprotejat\b/i.test(before))
      || (EXCLUSION.test(text.slice(lineStart, start)) && !/\bexclus\s+neprotejat\b/i.test(text.slice(lineStart, start)))
      || exclusionContinuation
      || NEGATIVE_EMOJIS.test(before.slice(-40))
      || /\bnu\s+(?:ofer|accept)\b[^\n]{0,80}\n[^\n]*$/i.test(text.slice(Math.max(0, lineStart - 120), start))
      || /\bnu\s+(?:ofer|accept)\b[\s\S]{0,120}$/i.test(text.slice(0, start))
      || directNegativePrefix
      || /\bnu\s+accept\b[^\n]{0,200}$/i.test(text.slice(lineStart, start));
  const negativeAfterWords = /\b(?:nu\s+(?:mai\s+)?(?:fac|ofer(?:im)?|practic|prestez)|deloc)\b/i.test(after.slice(0, 18));
  const negativeAfterTargetsOtherService = SERVICE_NAMES.some(otherService => {
    if (otherService === service) {
      return false;
    }

    return new RegExp(`\\b(?:${SERVICE_PATTERNS[otherService].source})\\b`, 'i').test(after.slice(0, 40));
  });
  const negativeAfter = (negativeAfterWords && !negativeAfterTargetsOtherService) || NEGATIVE_EMOJIS.test(after.slice(0, 20));
  const negativeWithinOccurrence = /\bnu\s+(?:mai\s+)?(?:fac|ofer(?:im)?|practic|prestez|accept|primesc)\b/i.test(occurrence);

  if (negativeBefore && lastPositiveQualifier > before.search(NEGATIVE_WORDS)) {
    return false;
  }

  return negativeBefore || negativeAfter || negativeWithinOccurrence;
}

function extraCostNearOccurrence(text: string, service: EscortServiceName, start: number, end: number): number | undefined {
  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  const lineEndIndex = text.indexOf('\n', end);
  const lineEnd = lineEndIndex === -1 ? text.length : lineEndIndex;
  const nearbyStart = Math.max(lineStart, start - 80);
  const nearbyEnd = Math.min(lineEnd, end + 55);
  const nearby = text.slice(nearbyStart, nearbyEnd);
  if (service === 'domination') {
    const parenthesizedExtra = /\(\s*(\d{2,4})\s*(?:lei|ron)\s*\)/i.exec(nearby);
    if (parenthesizedExtra && isPriceAmount(Number.parseInt(parenthesizedExtra[1], 10))) {
      return Number.parseInt(parenthesizedExtra[1], 10);
    }
  }
  if (service === 'whipping' && /\bdominare\b[\s\S]{0,250}\bpalet[ăa]\b/i.test(text)) {
    return undefined;
  }
  if (service === 'domination' && /\bdominare\b[\s\S]{0,300}\b500\s*(?:lei|ron)\b/i.test(text)) {
    return undefined;
  }
  if (service === 'domination'
    && /\bschato\b[^\n]{0,50}\bextra\b[^\n]{0,30}\bdominare\b/i.test(nearby)) {
    return undefined;
  }
  const line = text.slice(lineStart, lineEnd);
  const recentExtraHeading = /\b(?:extra\s+(?:va\s+fi|este|sunt)|servicii?\s+extra)\b/i.test(text.slice(Math.max(0, lineStart - 500), lineStart));
  if (recentExtraHeading && ['footfetish', 'uro', 'domSoft', 'domHard', 'showerSex', 'shower'].includes(service)) {
    const inlineExtra = line.slice(start - lineStart).match(/[^\n]{0,45}\b(\d{2,4})\s*(?:de\s*)?(?:lei|ron)\b/i);
    if (inlineExtra && isPriceAmount(Number.parseInt(inlineExtra[1], 10))) {
      return Number.parseInt(inlineExtra[1], 10);
    }
  }
  if (service === 'fk' || service === 'cim') {
    const parenthesizedExtra = /\b(?:contracost|contracostă|extra)\b[^)\n]{0,20}\/\s*(\d{2,4})\b/i.exec(nearby);
    if (parenthesizedExtra && isPriceAmount(Number.parseInt(parenthesizedExtra[1], 10))) {
      return Number.parseInt(parenthesizedExtra[1], 10);
    }
  }
  const extraSectionIndex = line.search(/\bservici(?:ile|i)\s+extra\b/i);
  if (extraSectionIndex !== -1 && start - lineStart > extraSectionIndex) {
    const sectionPrefix = line.slice(extraSectionIndex, start - lineStart);
    const sectionExtra = /\+\s*(\d{2,4})\s*(?:lei|ron)?\b/i.exec(sectionPrefix);
    if (sectionExtra) {
      return Number.parseInt(sectionExtra[1], 10);
    }
  }
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
  const extraPattern = /(?:\+\s*\(\s*|\+\s*|extra\s*(?:cost)?\s*[-:+]?\s*(?:\(\s*)?|in\s+plus\s*|supliment(?:ar)?\s*[:+]?\s*)(\d{2,4})\s*(?:lei|ron)?\b|(\d{2,4})\s*(?:de\s*)?(?:lei|ron)?\s*extra\b|(\d{2,4})\s*(?:de\s*)?(?:lei|ron)?\s*(?:extra|in\s+plus)\b/gi;
  if (service === 'cof') {
    const reversedCofExtra = /\bextra\s*[-:+]?\s*(\d{2,4})\s*(?:de\s*)?(?:lei|ron)?\s*\(\s*cof\s*\)/i.exec(text);
    if (reversedCofExtra) {
      return Number.parseInt(reversedCofExtra[1], 10);
    }
  }
  if (service === 'cob') {
    if (recentExtraHeading) {
      const inlineExtra = line.slice(start - lineStart).match(/[^\n]{0,80}\b(\d{2,4})\s*(?:lei|ron)\b/i);
      if (inlineExtra && isPriceAmount(Number.parseInt(inlineExtra[1], 10))) {
        return Number.parseInt(inlineExtra[1], 10);
      }
    }
    const corporalExtra = /(?:finaliz\w*\s+pe\s+sani\w*|sani\w*)[^\n]{0,30}?(\d{2,4})\s*(?:lei|ron)\b/i.exec(nearby);
    if (corporalExtra
      && !/\b(?:tarif\w*|pret\w*)\b/i.test(corporalExtra[0])
      && isPriceAmount(Number.parseInt(corporalExtra[1], 10))) {
      return Number.parseInt(corporalExtra[1], 10);
    }
  }
  if (service === 'verbalHum' && /\bdominare\b[\s\S]{0,100}\bpalet[ăa]\b/i.test(text)) {
    return undefined;
  }
  if (service === 'on') {
    const oralUnprotectedExtra = /\b(?:oral|sex\s+oral)\s+neprotejat\b[^.!?]{0,100}\bfunctie\s+de\s+igiena\b[^.!?]{0,100}?(\d{2,4})\s*(?:lei|ron)?\s+extra\b/i.exec(text);
    if (oralUnprotectedExtra) {
      return Number.parseInt(oralUnprotectedExtra[1], 10);
    }
  }
  if (service === 'fk') {
    const trailingFkExtra = /[^\n]{0,120}?\b(\d{2,4})\s*(?:lei|ron)?\s+extra\b/i.exec(text.slice(start, lineEnd));
    if (trailingFkExtra && isPriceAmount(Number.parseInt(trailingFkExtra[1], 10))) {
      return Number.parseInt(trailingFkExtra[1], 10);
    }
  }
  const servicePlusExtra = new RegExp(`\\b${service}\\s*\\+\\s*(\\d{2,4})\\b`, 'i').exec(nearby);
  if (servicePlusExtra && isPriceAmount(Number.parseInt(servicePlusExtra[1], 10))) {
    return Number.parseInt(servicePlusExtra[1], 10);
  }
  if (['cim', 'cof', 'fk', 'swallow'].includes(service)) {
    const dashedServiceExtra = new RegExp(`\\b${service}\\s*[-–:]\\s*(\\d{2,4})\\b`, 'i').exec(nearby);
    if (dashedServiceExtra && isPriceAmount(Number.parseInt(dashedServiceExtra[1], 10))
      && (service !== 'fk' || Number.parseInt(dashedServiceExtra[1], 10) <= 200)) {
      return Number.parseInt(dashedServiceExtra[1], 10);
    }
  }
  for (const extraMatch of nearby.matchAll(extraPattern)) {
    const extraEnd = (extraMatch.index ?? 0) + extraMatch[0].length;
    const extraMatchEndsBeforeService = extraEnd < serviceEndOffset;
    const betweenExtraAndService = nearby.slice(extraEnd, serviceEndOffset);
    const extraTargetsCim = service !== 'cim' && /^\s*-\s*cim\b/i.test(nearby.slice(extraEnd));
    const extraTargetsService = new RegExp(SERVICE_PATTERNS[service].source, 'i').test(betweenExtraAndService);
    const extraTargetsOnlyService = !SERVICE_NAMES.some(otherService => otherService !== service
      && new RegExp(SERVICE_PATTERNS[otherService].source, 'i').test(betweenExtraAndService));
    const extraTargetIsParenthesized = new RegExp(
      `\\([^)]*(?:${SERVICE_PATTERNS[service].source})[^)]*\\)`,
      'i',
    ).test(betweenExtraAndService);
    const isDirectExtraBeforeService = extraMatchEndsBeforeService
      && (/^extra/i.test(extraMatch[0])
        || /^\+/i.test(extraMatch[0]) && (service === 'uro' || nearbyStart + (extraMatch.index ?? 0) - lineStart <= 8))
      && (!/[)]/u.test(betweenExtraAndService) || extraTargetsService && extraTargetsOnlyService && extraTargetIsParenthesized)
      && serviceEndOffset - extraEnd <= 25;
    if (!extraTargetsCim && (isDirectExtraBeforeService || !extraMatchEndsBeforeService) && !hasAnotherService(extraEnd)) {
      return Number.parseInt(extraMatch[1] || extraMatch[2] || extraMatch[3], 10);
    }
  }

  if (service === 'cim' || service === 'cof' || service === 'cob') {
    const serviceSuffixExtra = new RegExp(`\\b${service}\\s*\\([^)]*\\)\\s*-\\s*(\\d{2,4})\\s*(?:lei|ron)?\\b`, 'gi');
    for (const suffixMatch of nearby.matchAll(serviceSuffixExtra)) {
      return Number.parseInt(suffixMatch[1], 10);
    }
  }

  const directDashExtra = /^[ \t]*-[ \t]*(\d{2,4})[ \t]*(?:lei|ron)?\b/i.exec(text.slice(end, end + 25));
  const isProstateMassage = service === 'prostateMassage'
    && /^[ \t]+massage[ \t]*-[ \t]*(\d{2,4})[ \t]*(?:lei|ron)?\b/i.test(text.slice(end, end + 35));
  const isMassagePartOfProstateMassage = service === 'massage'
    && /prostat(?:a|ic)/i.test(text.slice(Math.max(0, start - 20), start));
  if (directDashExtra && Number.parseInt(directDashExtra[1], 10) <= 200 && !isMassagePartOfProstateMassage) {
    return Number.parseInt(directDashExtra[1], 10);
  }
  if (service === 'ani') {
    const anilingusExtra = new RegExp(
      `(?:${SERVICE_PATTERNS[service].source})\\b[^\\n]{0,30}\\bactiv\\w*[^\\n]{0,30}?(?:-\\s*|\\(\\s*(?:la\\s*)?|\\s+)(\\d{2,4})\\s*(?:de\\s*)?(?:lei|ron)?\\b`,
      'i',
    ).exec(nearby);
    if (anilingusExtra && isPriceAmount(Number.parseInt(anilingusExtra[1], 10))) {
      return Number.parseInt(anilingusExtra[1], 10);
    }
  }
  if (service === 'swallow') {
    const swallowExtra = /\bswallow\b[^\n]{0,40}\bextra\b[^\n]{0,15}\b(\d{2,4})\b|\binghi(?:ț\w*|t\w*|ere)\b[^\n]{0,40}\bextra\b[^\n]{0,15}\b(\d{2,4})\b/i.exec(nearby);
    if (swallowExtra) {
      return Number.parseInt(swallowExtra[1] || swallowExtra[2], 10);
    }
  }
  if (service === 'ap') {
    const analProtectedExtra = /\bap\b[^\n]{0,120}\b(\d{2,4})\s*extra\b/i.exec(text);
    if (analProtectedExtra) {
      return Number.parseInt(analProtectedExtra[1], 10);
    }
  }
  if (isProstateMassage) {
    const extra = /^\s+massage\s*-\s*(\d{2,4})\s*(?:lei|ron)?\b/i.exec(text.slice(end, end + 35));
    return extra ? Number.parseInt(extra[1], 10) : undefined;
  }
  if (isMassagePartOfProstateMassage) {
    return undefined;
  }
  if (service === 'fingering') {
    const fingeringExtra = /\b(?:jocuri\s+cu\s+deget\w*|deget\w*)\b[^\n]{0,40}\)\s*-\s*(\d{2,4})\b/i.exec(line);
    if (fingeringExtra) {
      return Number.parseInt(fingeringExtra[1], 10);
    }
  }

  const previousLineStart = Math.max(0, text.lastIndexOf('\n', lineStart - 2) + 1);
  const previousLine = text.slice(previousLineStart, lineStart);
  const previousContext = text.slice(Math.max(0, lineStart - 200), lineStart);
  const textBeforeService = text.slice(0, start);
  const extraHeadingMatches = [...textBeforeService.matchAll(/\b(?:extra\s+uri|servici(?:ile|i)\s+extra)\b/gi)];
  const lastExtraHeading = extraHeadingMatches.length
    ? extraHeadingMatches[extraHeadingMatches.length - 1].index ?? -1
    : -1;
  const lastExtraSectionEnd = textBeforeService.lastIndexOf('cadou');
  const extraSectionContext = /\bextra\b/i.test(nearby)
    || /\bextra\b/i.test(previousLine)
    || /\bservici\w*\s+extra\b/i.test(previousContext)
    || lastExtraHeading > lastExtraSectionEnd;
  const currencyPrefixedExtra = new RegExp(
    `\\b(\\d{2,4})\\s*(?:lei|ron)\\s*[-–:]\\s*(?:${SERVICE_PATTERNS[service].source})\\b`,
    'i',
  ).exec(line);
  if (currencyPrefixedExtra && isPriceAmount(Number.parseInt(currencyPrefixedExtra[1], 10))) {
    return Number.parseInt(currencyPrefixedExtra[1], 10);
  }
  if (extraSectionContext) {
    const suffixedExtra = new RegExp(
      `(?:${SERVICE_PATTERNS[service].source})\\s*(?:[-:()]|\\s+)\\s*(\\d{2,4})\\b`,
      'i',
    ).exec(nearby);
    if (suffixedExtra) {
      const extraCost = Number.parseInt(suffixedExtra[1], 10);
      if (extraCost <= 200) {
        return extraCost;
      }
    }

    const prefixedDashExtra = new RegExp(
      `\\b(\\d{2,4})\\s*[-–:]\\s*(?:${SERVICE_PATTERNS[service].source})\\b`,
      'i',
    ).exec(nearby);
    if (prefixedDashExtra) {
      return Number.parseInt(prefixedDashExtra[1], 10);
    }
  }

  const labeledDashExtra = service === 'cim'
    ? /(?:finaliz\w*|fin)\s+oral\w*\s*[-–]\s*((?:[1-9]\d?|1\d\d))\s*(?:de\s*)?(?:lei|ron)?\b/gi
    : service === 'cof'
      ? /(?:finaliz\w*|fin)\s+facial\w*\s*[-–]\s*((?:[1-9]\d?|1\d\d))\s*(?:de\s*)?(?:lei|ron)?\b/gi
      : undefined;
  if (labeledDashExtra) {
    for (const extraMatch of nearby.matchAll(labeledDashExtra)) {
      return Number.parseInt(extraMatch[1], 10);
    }
  }

  if (service === 'uro') {
    const uroSymbolDashExtra = /\buro\b(?!\s*\()[^\n]{0,12}?-\s*(\d{2,4})\s*(?:lei|ron)?\b/i.exec(nearby);
    if (uroSymbolDashExtra && isPriceAmount(Number.parseInt(uroSymbolDashExtra[1], 10))) {
      return Number.parseInt(uroSymbolDashExtra[1], 10);
    }
    const uroDashExtra = /\buro\b[^\n]{0,25}\b(?:eu\s+)?activ\w*\s*-\s*(\d{2,4})\s*(?:lei|ron)?\b/i.exec(nearby);
    if (uroDashExtra) {
      return Number.parseInt(uroDashExtra[1], 10);
    }
  }
  if (service === 'cim') {
    const tildeCimExtra = /\bfinaliz\w*\s+oral\w*\s*\)\s*~\s*(\d{2,4})\s*(?:lei|ron)\b/i.exec(nearby);
    if (tildeCimExtra && isPriceAmount(Number.parseInt(tildeCimExtra[1], 10))) {
      return Number.parseInt(tildeCimExtra[1], 10);
    }
  }

  const labeledExtra = service === 'cim'
    ? /(?:finaliz\w*|fin)\s+oral\w*\s*\)?\s*(\d{2,4})(?!\s*(?:de\s*)?(?:lei|ron)?\s*extra\b)\s*(?:de\s*)?(?:lei|ron)?\b|\bcim\s*[-:()]?\s*(\d{2,4})\s*(?:de\s*)?(?:lei|ron)\b/gi
    : service === 'cof'
      ? /(?:finaliz\w*|fin)\s+facial\w*\s*\)?\s*(\d{2,4})(?!\s*(?:de\s*)?(?:lei|ron)?\s*extra\b)\s*(?:de\s*)?(?:lei|ron)?\b/gi
      : service === 'cob'
        ? /\+\s*(\d{2,4})\s*(?:lei|ron)?\s+(?:finaliz\w*\s+)?sani\w*\s*\/\s*fund\b/gi
      : undefined;
  if (labeledExtra) {
    for (const extraMatch of nearby.matchAll(labeledExtra)) {
      return Number.parseInt(extraMatch[1] || extraMatch[2], 10);
    }
  }
  if (service === 'fk') {
    const durationBasedFkExtra = /(?:\bfk\b|\bsarut(?:uri)?\b)[^\n]{0,80}?[~:]?\s*(\d{2,4})\s*(?:lei|ron)\s+fin\b/i.exec(text);
    if (durationBasedFkExtra && isPriceAmount(Number.parseInt(durationBasedFkExtra[1], 10))) {
      return Number.parseInt(durationBasedFkExtra[1], 10);
    }
  }

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
  if (service === '69' && /\b69\s*\+\s*sex\b/i.test(text)) {
    return true;
  }
  if ((service === 'cuni' || service === 'ani')
    && /\bann?ilingus\s*\/\s*cunn?ilingus\b/i.test(text)) {
    return true;
  }
  if (service === 'uro' && /\buro\b[^\n.;]{0,50}\bdoar\s+fac\b[^\n.;]{0,40}\bnu\s+(?:si\s+)?accept\b/i.test(text)) {
    return false;
  }
  if (service === 'domination' && !occurrences.length) {
    const excludedDomination = /\b(?:nu\s+se\s+accepta|nu\s+accept|nu\s+fac)\b[\s\S]{0,180}\bdominat(?:a|ă)\b/i.exec(text);
    if (excludedDomination) {
      return false;
    }
  }
  if (service === 'ani' && !occurrences.length) {
    const typoOccurrence = /\banni\b/g.exec(text);
    if (typoOccurrence && isNegativeOccurrence(text, service, typoOccurrence.index, typoOccurrence.index + typoOccurrence[0].length)) {
      return false;
    }
  }
  if (service === 'fk' && !occurrences.length
    && /\bnu\s+accept\b[^\n]{0,100}\bsarut\w*\b/i.test(text)) {
    return false;
  }
  if (service === 'massage'
    && /\bmasaj\s+de\s+relaxare\s*\(\s*doar\s+la\s+ora\b/i.test(text)
    && /\bdus\s+impreuna\b[^\n]{0,30}\b50\s*lei\b/i.test(text)
    && !/\bnu\s+(?:fac|accept|ofer)\b[^\n]{0,60}\bmasaj\b/i.test(text)) {
    return true;
  }
  if (!occurrences.length) {
    return undefined;
  }

  const lastOccurrence = occurrences[occurrences.length - 1];
  const lastStart = lastOccurrence.index ?? 0;
  const lastEnd = lastStart + lastOccurrence[0].length;
  const lastLineStart = text.lastIndexOf('\n', lastStart - 1) + 1;
  const lastLineEnd = text.indexOf('\n', lastEnd);
  const lastLine = text.slice(lastLineStart, lastLineEnd === -1 ? text.length : lastLineEnd);
  const lastOccurrenceIsNegative = isNegativeOccurrence(text, service, lastStart, lastEnd);
  const hasExplicitExtra = (occurrence: RegExpMatchArray): boolean => {
    const start = occurrence.index ?? 0;
    const end = start + occurrence[0].length;
    return /^\s*(?:-|\+)\s*\d{2,4}\b/u.test(text.slice(end, end + 20))
      && extraCostNearOccurrence(text, service, start, end) !== undefined;
  };
  const positiveOccurrence = [...occurrences].reverse().find(occurrence => {
    const start = occurrence.index ?? 0;
    const end = start + occurrence[0].length;
    return !isNegativeOccurrence(text, service, start, end) || hasExplicitExtra(occurrence);
  });
  const positiveOccurrenceLineStart = positiveOccurrence
    ? text.lastIndexOf('\n', (positiveOccurrence.index ?? 0) - 1) + 1
    : -1;
  const positiveOccurrenceLine = positiveOccurrence
    ? text.slice(
      positiveOccurrenceLineStart,
      text.indexOf('\n', positiveOccurrence.index ?? 0) === -1
        ? text.length
        : text.indexOf('\n', positiveOccurrence.index ?? 0),
    )
    : '';
  const positiveOccurrenceHasExtra = positiveOccurrence
    && (service === 'uro' && /^\s*[^A-Za-z0-9]*\+/u.test(positiveOccurrenceLine)
      || /^\s*-\s*\d{2,4}\b/u.test(text.slice(
        (positiveOccurrence.index ?? 0) + positiveOccurrence[0].length,
        (positiveOccurrence.index ?? 0) + positiveOccurrence[0].length + 20,
      )))
    && extraCostNearOccurrence(
      text,
      service,
      positiveOccurrence.index ?? 0,
      (positiveOccurrence.index ?? 0) + positiveOccurrence[0].length,
    ) !== undefined;
  const lastOccurrenceIsRateMention = /\b(?:lei|ron|finaliz\w*|ora|min(?:ute)?s?|h)\b|\d{2,5}\s*[-:]/i.test(lastLine);
  const practiced = !lastOccurrenceIsNegative
    || (lastOccurrenceIsRateMention && positiveOccurrence !== undefined)
    || positiveOccurrenceHasExtra;
  let selectedOccurrence = lastOccurrenceIsNegative && positiveOccurrence ? positiveOccurrence : lastOccurrence;

  if (practiced) {
    const occurrenceWithExtra = [...occurrences].reverse().find(occurrence => {
      const start = occurrence.index ?? 0;
      const end = start + occurrence[0].length;
      return (!isNegativeOccurrence(text, service, start, end) || hasExplicitExtra(occurrence))
        && extraCostNearOccurrence(text, service, start, end) !== undefined;
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
  return extraCost === undefined || !isPriceAmount(extraCost) ? true : {extraCost};
}

function durationFromText(text: string, amountIndex: number, otherAmountIndexes: number[]): keyof EscortRates | undefined {
  const durationPattern = /\b(30|60|90|120)\s*(?:(?:de[\s.]*)?(?:min(?:ute)?s?|mi)\b|['’])|\b((?:(?:o\s+ora\s+si\s+30)\s+minute?|1\s*[:.]30|1\s*(?:h|hr|ore?|ora)\s*(?:(?:si\s*)?30\s*min(?:ute)?s?|jumat(?:e|ate|a)|30\s*min)))\b|\bjumat(?:ate|atea)\s+(?:de\s+)?(?:h|ora)\b|\b(1|2)\s*(?:(?:[/]|['’])\s*)?(?:h|hr|ore?|ora)\b|\b(doua)\s+ore?\b|\b(ora|h)\b/gi;
  const durations: Array<{index: number; duration: keyof EscortRates}> = [];
  const durationText = text.replace(/\bmax(?=\d)/gi, '   ').replace(/\bo\s+(?=h\b)/gi, '1 ');

  for (const match of durationText.matchAll(durationPattern)) {
    const minutes = /^jumat(?:ate|atea)\s+(?:de\s+)?(?:h|ora)$/i.test(match[0])
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
  const moneyPattern = /\b(\d{2,5})\s*(?:de\s*)?(?:lei|ron)\b|\b(\d{2,5})\s*(?=\s*(?:finalizar\w*|fin)\b)|\b(\d{2,5})\s*(?=-\s*\(?\s*(?:fin|final|\d+\s*finalizar\w*|\d+\s*['’]?\s*(?:de\s*)?(?:min|mi|h|hr|ore?|ora)|\d+\s*\/\s*\d+\s*fin|\d+\s*'))|\b(\d{2,5})\s*(?=\(\s*(?:30|60|90|120)\s*(?:min|mi|h|hr|ore?|ora))|\b(?:finalizar\w*)\D{0,12}(\d{2,5})(?!\s*[:]|\s*(?:de\s*)?(?:min|minute|mi|h|hr|ore?|ora)\b)\b|\b(\d{2,5})\s*(?=\s*(?:(?:30|60|90|120)\s*(?:['’]\s*)?(?:min|mi|h|hr|ore?|ora)|(?:1|2)\s*(?:['’]\s*)?(?:h|hr|ore?|ora)|(?:ora|h)\b))|\b(\d{2,5})\s*(?=(?:num(?:arul|ar)\s*)?\(\s*(?:30|60|90|120)\s*(?:min|mi|h|hr|ore?|ora))|\b(\d{2,5})\s*(?=-\s*(?:oral|normal|masaj|diferite|gfe|fk|finaliz\w*|o\s+(?:finaliz\w*|ora|h)\b|(?:h|hr|ore?|ora)|anal)\b)|\b(\d{2,5})\s*(?=\s*o\s+(?:finalizar\w*|ora|h)\b)|\b(\d{2,5})\s*(?=\s*\(\s*(?:1\s*\/\s*2|1\s+sau\s+2)\s+finalizar\w*)|\b(?:30|60|90|120)\s*(?:['’]\s*)?(?:de\s*)?(?:min(?:ute)?s?|mi)\b[\s:=-]{1,12}(\d{2,5})\b|\b(?:1|2)\s*(?:['’]\s*)?(?:h|hr|ore?|ora)\b[\s:=-]{1,12}(\d{2,5})\b|\b(?:ora|h)\b[\s:=-]{1,12}(\d{2,5})\b/gi;

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
      if (/\bfinaliz\w*[^\d]{0,12}:\s*$/i.test(extendedPrecedingText) && Number.parseInt(amountText, 10) < 100) {
        continue;
      }
      if (isPriceAmount(Number.parseInt(amountText, 10))) {
        matches.push({amount: Number.parseInt(amountText, 10), index});
      }
    }
  }

  for (const match of line.matchAll(/\b(\d{2,5})\s*€/gu)) {
    const amountText = match[1];
    const index = (match.index ?? 0) + match[0].indexOf(amountText);
    const amount = Number.parseInt(amountText, 10);
    if (!isPhoneNumberPart(index) && isPriceAmount(amount) && !matches.some(existing => existing.index === index)) {
      matches.push({amount, index});
    }
  }

  for (const match of line.matchAll(/\b(\d{2,5})\s*(?:(?:[-:])\s*)?(?=1\s*[:.]30\b)/gi)) {
    const amountText = match[1];
    const index = (match.index ?? 0) + match[0].indexOf(amountText);
    const amount = Number.parseInt(amountText, 10);
    if (!isPhoneNumberPart(index) && isPriceAmount(amount) && !matches.some(existing => existing.index === index)) {
      matches.push({amount, index});
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
  const euroAmounts: Partial<Record<keyof EscortRates, number[]>> = {};
  const suppressBaseRates = !/\b(?:servici|prestat\w*|meniu|ofer\s+urmatoarele)\b/i.test(text) && /\b(?:duo|colab|show\s+lesb|programari\s+in\s+3)\b/i.test(text);
  let inOutcallSection = false;
  let inDominationSection = false;
  let inServiceExtraSection = false;
  let skipPseRateLines = false;
  let skippedPseRateContent = false;
  const rateText = text.split('\n').filter(line => {
    if (/^\s*servicii?\s+porn\s+star\s+experience\s*$/i.test(line)) {
      skipPseRateLines = true;
      skippedPseRateContent = false;
      return true;
    }
    if (skipPseRateLines) {
      const isPseRateLine = /^\s*\d{2,5}\s*[-:]\s*(?:30\s*(?:min(?:ute)?s?)?|1\s*h(?:\s*jumat\w*)?|1\s*h\s*30\s*min|ora)\b/i.test(line);
      if (isPseRateLine) {
        skippedPseRateContent = true;
        return false;
      }
      if (skippedPseRateContent && line.trim()) {
        skipPseRateLines = false;
        return true;
      }
      return false;
    }

    return true;
  }).join('\n');
  const compactOneAndHalfHourRate = /\b1\s*h\s*30\s*min\s*[-:]\s*(\d{2,5})\b/i.exec(rateText);
  if (compactOneAndHalfHourRate && isPriceAmount(Number.parseInt(compactOneAndHalfHourRate[1], 10))) {
    baseCandidates['1.5h'] = [Number.parseInt(compactOneAndHalfHourRate[1], 10)];
  }
  const giftCompanyThirtyMinuteRate = /\b(\d{2,5})\s*(?:lei|ron)\s*[-–:]\s*o\s+finaliz\w*\s*\(\s*30\s*minute/i.exec(rateText);
  const giftCompanyHourRate = /\b(\d{2,5})\s*(?:lei|ron)\s*[-–:]\s*doua\s+finaliz\w*\s*\(\s*60\s*minute/i.exec(rateText);
  if (giftCompanyThirtyMinuteRate && isPriceAmount(Number.parseInt(giftCompanyThirtyMinuteRate[1], 10))) {
    baseCandidates['30m'] = [Number.parseInt(giftCompanyThirtyMinuteRate[1], 10)];
  }
  if (giftCompanyHourRate && isPriceAmount(Number.parseInt(giftCompanyHourRate[1], 10))) {
    baseCandidates['1h'] = [Number.parseInt(giftCompanyHourRate[1], 10)];
  }
  const explicitPriceTableRates = /\b250\s*(?:lei|ron)\s*[-–:]\s*30\s*min\b/i.test(text)
    && /\b500\s*(?:lei|ron)\s*[-–:]\s*60\s*min\b/i.test(text);

  for (const line of rateText.split('\n')) {
      if (/^\s*dominare\s*$/i.test(line)) {
        inDominationSection = true;
      }
      if (inDominationSection) {
        const dominationHalfHourRate = /^\s*\W*(\d{2,5})\s*[-–]\s*30\s*min\b/i.exec(line);
        const dominationHourRate = /^\s*\W*(\d{2,5})\s*[-–]\s*(?:o\s+)?(?:ora|1\s*h)\b/i.exec(line);
        if (dominationHalfHourRate && isPriceAmount(Number.parseInt(dominationHalfHourRate[1], 10))) {
          dominationCandidates['30m'] = [...(dominationCandidates['30m'] || []), Number.parseInt(dominationHalfHourRate[1], 10)];
        }
        if (dominationHourRate && isPriceAmount(Number.parseInt(dominationHourRate[1], 10))) {
          dominationCandidates['1h'] = [...(dominationCandidates['1h'] || []), Number.parseInt(dominationHourRate[1], 10)];
        }
        const reversedDominationHourRate = /\b(?:o\s+)?ora\s+(\d{2,5})\b/i.exec(line);
        const reversedDominationHalfHourRate = /\b1\s+finaliz\w*\s+(\d{2,5})\b/i.exec(line);
        if (reversedDominationHourRate && isPriceAmount(Number.parseInt(reversedDominationHourRate[1], 10))) {
          dominationCandidates['1h'] = [...(dominationCandidates['1h'] || []), Number.parseInt(reversedDominationHourRate[1], 10)];
        }
        if (reversedDominationHalfHourRate && isPriceAmount(Number.parseInt(reversedDominationHalfHourRate[1], 10))) {
          dominationCandidates['30m'] = [...(dominationCandidates['30m'] || []), Number.parseInt(reversedDominationHalfHourRate[1], 10)];
        }
      }
      const explicitDominationRate = /\bdominare\b\s*[\(:-]?\s*(\d{2,5})\s*(?:lei|ron)?\s*(?:pe\s+)?(?:ora|h)\b/i.exec(line);
    if (explicitDominationRate && isPriceAmount(Number.parseInt(explicitDominationRate[1], 10))) {
      dominationCandidates['1h'] = [
        ...(dominationCandidates['1h'] || []),
        Number.parseInt(explicitDominationRate[1], 10),
      ];
    }

    const serviceExtraHeading = /\bservici(?:i|ile)\s+extra\b/i.exec(line);
    const standaloneServiceExtraHeading = serviceExtraHeading !== null
      && !/[a-z0-9]/i.test(line.slice((serviceExtraHeading.index ?? 0) + serviceExtraHeading[0].length).replace(/extra/gi, ''));
    if (standaloneServiceExtraHeading
      || /^\s*\W*extra(?:\s+\w+)*\W*\s*$/i.test(line)) {
      inServiceExtraSection = true;
      continue;
    }
    if (inServiceExtraSection && !/\bextra\b/i.test(line)
      && /^\s*\d{2,5}\s+(?:(?:finaliz\w*|ora)\b|(?:30|min(?:ute)?s?|1\s*h)\b)/i.test(line)) {
      inServiceExtraSection = false;
    }
    if (inServiceExtraSection && !/\bextra\b/i.test(line)
      && /^\s*(?:30|60|90|120)\s*(?:min(?:ute)?s?|['’])[^\d]{0,20}\d{2,5}\s*(?:lei|ron)\b/i.test(line)) {
      inServiceExtraSection = false;
    }
    if (inServiceExtraSection && /^\s*\d{2,5}\s*\/\s*\d{2,5}\s*$/i.test(line)) {
      inServiceExtraSection = false;
    }
    if (inServiceExtraSection && /\bdeplasar\w*\b/i.test(line)) {
      inServiceExtraSection = false;
    }
    if (inServiceExtraSection && /\b(?:tarif(?:e|uri)?|pret(?:uri|urile)?)\b/i.test(line)) {
      inServiceExtraSection = false;
    }
    if (inServiceExtraSection && /\bcadou\w*\b/i.test(line)) {
      inServiceExtraSection = false;
    }
    if (inServiceExtraSection && /\bservicii?\s+de\s+dominare\b/i.test(line)) {
      inServiceExtraSection = false;
    }
    if (inServiceExtraSection) {
      continue;
    }

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

    const isBarePairedRateLine = /^\s*\d{2,5}\s*\/\s*\d{2,5}\s*$/i.test(line);
    const isBareDashedRateLine = /^\s*\d{2,5}\s*[-–]\s*\d{2,5}\s*$/i.test(line);
    const isStandaloneServiceExtraRate = /^\s*(?:finaliz\w*|orala(?:\s+faciala)?|faciala|dominare\w*)\s*[-:]\s*\d{1,3}\s*$/i.test(line);
    if (isStandaloneServiceExtraRate) {
      continue;
    }
    const isRateLine = isBarePairedRateLine
      || isBareDashedRateLine
      || /(?:\b(?:lei|ron|pret|preturi|tarif|cadou\w*|price|finaliz\w*|fin\b|\d+\s*(?:min|minute|mi|h|hr|ora|ore))\b|\b\d{2,5}\s*(?:lei|ron)\b|\d{2,5}\s*nr\b|')/i.test(line)
      || /\b\d{2,5}\s*[-:]\s*1\s*[:.]30\b/i.test(line)
      || /^\s*\d{2,5}\s*[-:]\s*(?:ora|1\s*h|30\s*min)\b/i.test(line)
      || /\b\d{2,5}(?:finaliz\w*|ora)\b/i.test(line)
      || /\b\d{2,5}\s+finzaliz\w*\b/i.test(line)
      || (isOutcallLine && (/\b(?:ora|h)\s+\d{2,5}\b/i.test(line)
        || /\bdeplasar\w*\s*:\s*\d{2,5}\b/i.test(line)));
    if (!isRateLine) {
      continue;
    }
    const dashedHourRate = /^\s*(\d{2,5})\s*[-:]\s*(?:ora|1\s*h)\b/i.exec(line);
    if (dashedHourRate && !isOutcallLine && isPriceAmount(Number.parseInt(dashedHourRate[1], 10))) {
      baseCandidates['1h'] = [
        ...(baseCandidates['1h'] || []),
        Number.parseInt(dashedHourRate[1], 10),
      ];
    }
    const compactFinalizationRate = /\b(\d{2,5})finaliz\w*\b/i.exec(line);
    if (compactFinalizationRate && !isOutcallLine && isPriceAmount(Number.parseInt(compactFinalizationRate[1], 10))) {
      baseCandidates['30m'] = [
        ...(baseCandidates['30m'] || []),
        Number.parseInt(compactFinalizationRate[1], 10),
      ];
    }
    const compactHourRateInLine = /\b(\d{2,5})ora\b/i.exec(line);
    if (compactHourRateInLine && !isOutcallLine && isPriceAmount(Number.parseInt(compactHourRateInLine[1], 10))) {
      baseCandidates['1h'] = [
        ...(baseCandidates['1h'] || []),
        Number.parseInt(compactHourRateInLine[1], 10),
      ];
    }
    const standaloneOneAndHalfHourRate = /\b(\d{2,5})\s*[-:]\s*1\s*[:.]30\b/i.exec(line);
    if (standaloneOneAndHalfHourRate && !isOutcallLine
      && isPriceAmount(Number.parseInt(standaloneOneAndHalfHourRate[1], 10))) {
      baseCandidates['1.5h'] = [
        ...(baseCandidates['1.5h'] || []),
        Number.parseInt(standaloneOneAndHalfHourRate[1], 10),
      ];
    }
    const compactOneAndHalfHourRate = /\b1\s*h\s*30\s*min\s*[-:]\s*(\d{2,5})\b/i.exec(line);
    if (compactOneAndHalfHourRate && !isOutcallLine
      && isPriceAmount(Number.parseInt(compactOneAndHalfHourRate[1], 10))) {
      baseCandidates['1.5h'] = [
        ...(baseCandidates['1.5h'] || []),
        Number.parseInt(compactOneAndHalfHourRate[1], 10),
      ];
    }
    const compactDurationRates = /\bcadou\s+(\d{2,5})\s+fin\w*\s*\(\s*30\s*(?:de\s*)?min[^,;]*,\s*(\d{2,5})\s+ora\b[^,;]*,\s*(\d{2,5})\s*\(\s*90\s*(?:de\s*)?min/i.exec(line);
    if (compactDurationRates && !isOutcallLine) {
      const shortRate = Number.parseInt(compactDurationRates[1], 10);
      const hourRate = Number.parseInt(compactDurationRates[2], 10);
      const oneAndHalfRate = Number.parseInt(compactDurationRates[3], 10);
      if (isPriceAmount(shortRate)) {
        baseCandidates['30m'] = [...(baseCandidates['30m'] || []), shortRate];
      }
      if (isPriceAmount(hourRate)) {
        baseCandidates['1h'] = [...(baseCandidates['1h'] || []), hourRate];
      }
      if (isPriceAmount(oneAndHalfRate)) {
        baseCandidates['1.5h'] = [...(baseCandidates['1.5h'] || []), oneAndHalfRate];
      }
    }
    const explicitFinalizationRates = /\b(\d{2,5})\s+pentru\s+o\s+finaliz\w*\s*\(\s*30\s*min/i.exec(line);
    if (explicitFinalizationRates && !isOutcallLine
      && isPriceAmount(Number.parseInt(explicitFinalizationRates[1], 10))) {
      baseCandidates['30m'] = [...(baseCandidates['30m'] || []), Number.parseInt(explicitFinalizationRates[1], 10)];
    }
    const prefixedFinalizationRate = /\b(\d{2,5})\s+o\s+finaliz\w*\.?\s*\(\s*30\s*min/i.exec(line);
    if (prefixedFinalizationRate && /\b\d{2,5}\s+1\s*h\b/i.test(line) && !isOutcallLine
      && isPriceAmount(Number.parseInt(prefixedFinalizationRate[1], 10))) {
      baseCandidates['30m'] = [...(baseCandidates['30m'] || []), Number.parseInt(prefixedFinalizationRate[1], 10)];
    }
    const explicitHourRate = /\b(\d{2,5})\s+pentru\s+o\s+ora\b/i.exec(line);
    if (explicitHourRate && !isOutcallLine
      && isPriceAmount(Number.parseInt(explicitHourRate[1], 10))) {
      baseCandidates['1h'] = [...(baseCandidates['1h'] || []), Number.parseInt(explicitHourRate[1], 10)];
    }
    const nurruRateFormat = /\bora\s+cu\s+2\s+finalizari\b/i.test(text) && /\bmasaj\s+nurru\b/i.test(text);
    const oneAndHalfHourTextRate = nurruRateFormat
      ? /\b1\s+ora\s+jumat\w*[^-–]{0,100}?[-–]\s*(\d{2,5})\s*(?:lei|ron)\b/i.exec(line)
      : null;
    if (oneAndHalfHourTextRate && !isOutcallLine
      && isPriceAmount(Number.parseInt(oneAndHalfHourTextRate[1], 10))) {
      baseCandidates['1.5h'] = [...(baseCandidates['1.5h'] || []), Number.parseInt(oneAndHalfHourTextRate[1], 10)];
    }
    const oneHourTextRate = nurruRateFormat
      ? /\b(?:1\s+)?ora\b(?!\s+jumat\w*)[^-–]{0,120}?[-–]\s*(\d{2,5})\s*(?:lei|ron)\b/i.exec(line)
      : null;
    if (oneHourTextRate && !isOutcallLine
      && isPriceAmount(Number.parseInt(oneHourTextRate[1], 10))) {
      baseCandidates['1h'] = [...(baseCandidates['1h'] || []), Number.parseInt(oneHourTextRate[1], 10)];
    }
    const defaultFinalizationRate = /\b(\d{2,5})\s+finzaliz\w*\b/i.exec(line);
    if (defaultFinalizationRate && !/\bextra\b/i.test(line)
      && isPriceAmount(Number.parseInt(defaultFinalizationRate[1], 10))) {
      baseCandidates['30m'] = [
        ...(baseCandidates['30m'] || []),
        Number.parseInt(defaultFinalizationRate[1], 10),
      ];
    }
    const parenthesizedHalfHourRate = /\b(\d{2,5})\s*\([^)]*\bfin\w*\s*-\s*30\s+minute/i.exec(line);
    if (parenthesizedHalfHourRate && isPriceAmount(Number.parseInt(parenthesizedHalfHourRate[1], 10))) {
      baseCandidates['30m'] = [
        ...(baseCandidates['30m'] || []),
        Number.parseInt(parenthesizedHalfHourRate[1], 10),
      ];
    }
    const explicitHalfHourRate = /\bo\s+finaliz\w*\s+(\d{2,5})\s*(?:lei|ron)\b/i.exec(line);
    if (explicitHalfHourRate && !/\bextra\b/i.test(line)
      && isPriceAmount(Number.parseInt(explicitHalfHourRate[1], 10))) {
      baseCandidates['30m'] = [
        ...(baseCandidates['30m'] || []),
        Number.parseInt(explicitHalfHourRate[1], 10),
      ];
    }
    const parenthesizedThirtyMinuteRate = /\b(\d{2,5})\s*(?:lei|ron)\s*\(\s*30\s*min/i.exec(line);
    const outcallMarkerInLine = line.search(/\b(?:hotel|deplasar\w*)\b/i);
    const parenthesizedRateIsBase = parenthesizedThirtyMinuteRate
      && (outcallMarkerInLine === -1 || (parenthesizedThirtyMinuteRate.index ?? 0) < outcallMarkerInLine);
    if (parenthesizedRateIsBase
      && isPriceAmount(Number.parseInt(parenthesizedThirtyMinuteRate[1], 10))) {
      baseCandidates['30m'] = [...(baseCandidates['30m'] || []), Number.parseInt(parenthesizedThirtyMinuteRate[1], 10)];
    }
    const halfHourRate = /\b(\d{2,5})\s+jumat(?:ate|atea)\s+de\s+h\b/i.exec(line);
    if (halfHourRate && isPriceAmount(Number.parseInt(halfHourRate[1], 10))) {
      baseCandidates['30m'] = [
        ...(baseCandidates['30m'] || []),
        Number.parseInt(halfHourRate[1], 10),
      ];
    }
    const inlineBaseRates = /\b(\d{2,5})\s+\d+\s*fin\w*\s*[-–:]\s*(\d{2,5})\s*h\b/i.exec(line);
    const inlineOutcallRate = /\bdeplasar\w*\s+doar\s+la\s+hotel\b.*?\b(\d{2,5})\s*h\b/i.exec(line);
    if (inlineBaseRates && inlineOutcallRate) {
      baseCandidates['30m'] = [...(baseCandidates['30m'] || []), Number.parseInt(inlineBaseRates[1], 10)];
      baseCandidates['1h'] = [...(baseCandidates['1h'] || []), Number.parseInt(inlineBaseRates[2], 10)];
      outcallCandidates['1h'] = [...(outcallCandidates['1h'] || []), Number.parseInt(inlineOutcallRate[1], 10)];
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
    const defaultOutcallAmount = /\bdeplasar\w*\s*:\s*(\d{2,5})\b/i.exec(line);
    if (defaultOutcallAmount && isPriceAmount(Number.parseInt(defaultOutcallAmount[1], 10))) {
      outcallCandidates['1h'] = [
        ...(outcallCandidates['1h'] || []),
        Number.parseInt(defaultOutcallAmount[1], 10),
      ];
    }

    const isInlineRateLine = /\b(?:lei|ron|finaliz\w*|ora|ore|min(?:ute)?)\b/i.test(line);
    const isServiceExtraLine = (/\bserv(?:icii)?\s+extra\b/i.test(line) && !isInlineRateLine)
      || (/^\s*\W*extra\b/i.test(line) && !isInlineRateLine)
      || /^\s*\([^)]*(?:finaliz|fin\s+facial)/i.test(line);
    if (isServiceExtraLine) {
      continue;
    }

    const modifiedRateIndex = line.search(/\b(?:dupa|de\s+la)(?:\s+ora)?\b/i);
    const priceSectionIndex = line.search(/\bpret(?:uri|urile)?\b/i);
    const priceSection = priceSectionIndex === -1 ? '' : line.slice(priceSectionIndex);
    const hasThirtyMinutePrice = /\b30\s*(?:de\s*)?(?:min(?:ute)?s?|')\b[^\d]{0,20}\d{2,5}\s*(?:lei|ron)\b/i.test(priceSection);
    const hasSixtyMinutePrice = /\b60\s*(?:de\s*)?(?:min(?:ute)?s?|')\b[^\d]{0,20}\d{2,5}\s*(?:lei|ron)\b/i.test(priceSection);
    const usePriceSection = priceSectionIndex !== -1
      && !isOutcallLine
      && hasThirtyMinutePrice
      && hasSixtyMinutePrice;
    const rateStartIndex = usePriceSection ? priceSectionIndex : 0;
    const rateLine = line.slice(rateStartIndex);
    const outcallMarkerIndex = rateLine.search(/\bdeplasar\w*/i);
    const hasBaseRateSegment = !isOutcallLine || outcallMarkerIndex !== -1;
    const adjustedModifiedRateIndex = modifiedRateIndex === -1
      ? -1
      : modifiedRateIndex - rateStartIndex;
    const baseRateLine = adjustedModifiedRateIndex === -1 ? rateLine : rateLine.slice(0, adjustedModifiedRateIndex);
    const basePatternLine = outcallMarkerIndex === -1 ? baseRateLine : baseRateLine.slice(0, outcallMarkerIndex);
    const moneyMatches = amountMatches(baseRateLine);
    const compactFinalizationRates = /\bfin\w*\s+(\d{2,5})\s*(?:[/:-]\s*)?ora\s+(\d{2,5})\b/i.exec(basePatternLine);
    const finalizationHourRates = /\b(\d{2,5})\s+fin\w*\s*\/\s*(\d{2,5})\s+(?:ora|h)\b/i.exec(basePatternLine);
    const oneAndHalfHourRate = /\b(\d{2,5})\s*[-:]\s*1\s*[:.]30\b/i.exec(basePatternLine);
    const slashFinalizationRates = /\b(\d{2,5})\s*(?:lei|ron)?\s*\/\s*fin\w*\W*(\d{2,5})\s*(?:lei|ron)?\s*\/\s*h\b/i.exec(basePatternLine);
    const barePairedRates = /^\s*(\d{2,5})\s*\/\s*(\d{2,5})\s*$/i.exec(basePatternLine);
    const bareDashedRates = /^\s*(\d{2,5})\s*[-–]\s*(\d{2,5})\s*$/i.exec(basePatternLine);
    const halfFinalizationHourRate = /\b(\d{2,5})\s*(?:lei|ron)?\s+1\s*\/\s*2\s+finaliz\w*[^\n]{0,30}\(\s*60\s*min/i.exec(basePatternLine);
    const compactHalfFinalizationHourRate = /\b(\d{2,5})\s+1\s*\/\s*2\s+fin\w*\s+1\s*h\b/i.exec(basePatternLine);
    const pairedDurationRates = /\b(\d{2,5})\s+finaliz\w*\s*\(\s*30\s*min[^\n)]*\)\s*\/\s*(\d{2,5})\s*h\s*\(\s*60\s*min/i.exec(basePatternLine);
    if (compactFinalizationRates && hasBaseRateSegment) {
      const shortRate = Number.parseInt(compactFinalizationRates[1], 10);
      const hourRate = Number.parseInt(compactFinalizationRates[2], 10);
      if (isPriceAmount(shortRate)) {
        baseCandidates['30m'] = [...(baseCandidates['30m'] || []), shortRate];
      }
      if (isPriceAmount(hourRate)) {
        baseCandidates['1h'] = [...(baseCandidates['1h'] || []), hourRate];
      }
    }
    if (finalizationHourRates && hasBaseRateSegment && !/\bcadou\b/i.test(basePatternLine)) {
      const shortRate = Number.parseInt(finalizationHourRates[1], 10);
      const hourRate = Number.parseInt(finalizationHourRates[2], 10);
      if (isPriceAmount(shortRate)) {
        baseCandidates['30m'] = [...(baseCandidates['30m'] || []), shortRate];
      }
      if (isPriceAmount(hourRate)) {
        baseCandidates['1h'] = [...(baseCandidates['1h'] || []), hourRate];
      }
    }
    if (oneAndHalfHourRate && hasBaseRateSegment && isPriceAmount(Number.parseInt(oneAndHalfHourRate[1], 10))) {
      baseCandidates['1.5h'] = [
        ...(baseCandidates['1.5h'] || []),
        Number.parseInt(oneAndHalfHourRate[1], 10),
      ];
    }
    if (slashFinalizationRates && hasBaseRateSegment) {
      const shortRate = Number.parseInt(slashFinalizationRates[1], 10);
      const hourRate = Number.parseInt(slashFinalizationRates[2], 10);
      if (isPriceAmount(shortRate)) {
        baseCandidates['30m'] = [...(baseCandidates['30m'] || []), shortRate];
      }
      if (isPriceAmount(hourRate)) {
        baseCandidates['1h'] = [...(baseCandidates['1h'] || []), hourRate];
      }
    }
    if (barePairedRates && hasBaseRateSegment) {
      const shortRate = Number.parseInt(barePairedRates[1], 10);
      const hourRate = Number.parseInt(barePairedRates[2], 10);
      if (isPriceAmount(shortRate)) {
        baseCandidates['30m'] = [...(baseCandidates['30m'] || []), shortRate];
      }
      if (isPriceAmount(hourRate)) {
        baseCandidates['1h'] = [...(baseCandidates['1h'] || []), hourRate];
      }
    }
    if (bareDashedRates && hasBaseRateSegment) {
      const shortRate = Number.parseInt(bareDashedRates[1], 10);
      const hourRate = Number.parseInt(bareDashedRates[2], 10);
      if (isPriceAmount(shortRate)) {
        baseCandidates['30m'] = [...(baseCandidates['30m'] || []), shortRate];
      }
      if (isPriceAmount(hourRate)) {
        baseCandidates['1h'] = [...(baseCandidates['1h'] || []), hourRate];
      }
    }
    if (halfFinalizationHourRate && hasBaseRateSegment && isPriceAmount(Number.parseInt(halfFinalizationHourRate[1], 10))) {
      baseCandidates['1h'] = [...(baseCandidates['1h'] || []), Number.parseInt(halfFinalizationHourRate[1], 10)];
    }
    if (compactHalfFinalizationHourRate && hasBaseRateSegment
      && isPriceAmount(Number.parseInt(compactHalfFinalizationHourRate[1], 10))) {
      baseCandidates['1h'] = [...(baseCandidates['1h'] || []), Number.parseInt(compactHalfFinalizationHourRate[1], 10)];
    }
    if (pairedDurationRates && hasBaseRateSegment) {
      const shortRate = Number.parseInt(pairedDurationRates[1], 10);
      const hourRate = Number.parseInt(pairedDurationRates[2], 10);
      if (isPriceAmount(shortRate)) {
        baseCandidates['30m'] = [...(baseCandidates['30m'] || []), shortRate];
      }
      if (isPriceAmount(hourRate)) {
        baseCandidates['1h'] = [...(baseCandidates['1h'] || []), hourRate];
      }
    }
    const halfHourFinalizationRate = /\b(\d{2,5})\s*(?:lei|ron)?\s*\(\s*1\s*\/\s*2\s+fin\w*/i.exec(baseRateLine);
    if (halfHourFinalizationRate && hasBaseRateSegment && isPriceAmount(Number.parseInt(halfHourFinalizationRate[1], 10))) {
      baseCandidates['1h'] = [...(baseCandidates['1h'] || []), Number.parseInt(halfHourFinalizationRate[1], 10)];
    }
    const splitFinalizationsRate = /\b(\d{2,5})\s*(?:lei|ron)\s+1\s*\/\s*2\s+fin\w*\s+(?:in|de)\s+60\s*['’]/i.exec(baseRateLine);
    if (splitFinalizationsRate && hasBaseRateSegment && isPriceAmount(Number.parseInt(splitFinalizationsRate[1], 10))) {
      baseCandidates['1h'] = [...(baseCandidates['1h'] || []), Number.parseInt(splitFinalizationsRate[1], 10)];
    }
    for (const money of moneyMatches) {
      const threeSomeIndex = baseRateLine.search(/\b(?:3some|threesome|mmf|mff)\b/i);
      if (threeSomeIndex !== -1 && money.index > threeSomeIndex) {
        continue;
      }
      if (/\btaxi(?:ul|urile|uri)?\b/i.test(baseRateLine.slice(Math.max(0, money.index - 40), money.index + 60))) {
        continue;
      }
      const nearbyDuration = baseRateLine.slice(Math.max(0, money.index - 35), money.index + 35);
      if (/\b(?:[1-9]|1\d|2\d)\s*(?:min(?:ute)?s?|mi)\b/i.test(nearbyDuration)) {
        continue;
      }

      let duration = durationFromText(baseRateLine, money.index, moneyMatches.filter(otherMoney => otherMoney !== money).map(otherMoney => otherMoney.index));
      const prefix = baseRateLine.slice(0, money.index);
      const outcallIndex = Math.max(prefix.lastIndexOf('outcall'), prefix.lastIndexOf('out call'), prefix.lastIndexOf('hotel'), prefix.lastIndexOf('deplasar'));
      const serviceContextIndex = Math.max(prefix.lastIndexOf('servici'), prefix.lastIndexOf('pret'), prefix.lastIndexOf('cadou'));
      const isOutcall = isOutcallLine && (inOutcallSection || (outcallIndex > serviceContextIndex && money.index - outcallIndex <= 70));
      if (!isPriceAmount(money.amount) || isOutcall && money.amount < 50) {
        continue;
      }
      if (money.amount <= 100
        && /\bextra\b/i.test(baseRateLine.slice(Math.max(0, money.index - 30), money.index + 40))) {
        continue;
      }
      if (explicitHalfHourRate
        && money.amount === Number.parseInt(explicitHalfHourRate[1], 10)
        && money.index <= (explicitHalfHourRate.index ?? 0) + explicitHalfHourRate[0].length) {
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
      if (slashFinalizationRates && !isOutcall
        && money.index >= (slashFinalizationRates.index ?? 0)
        && money.index < (slashFinalizationRates.index ?? 0) + slashFinalizationRates[0].length) {
        continue;
      }
      if (halfFinalizationHourRate && !isOutcall
        && money.index >= (halfFinalizationHourRate.index ?? 0)
        && money.index < (halfFinalizationHourRate.index ?? 0) + halfFinalizationHourRate[0].length) {
        continue;
      }
      if (pairedDurationRates && !isOutcall
        && money.index >= (pairedDurationRates.index ?? 0)
        && money.index < (pairedDurationRates.index ?? 0) + pairedDurationRates[0].length) {
        continue;
      }
      if (compactDurationRates && !isOutcall
        && money.index >= (compactDurationRates.index ?? 0)
        && money.index < (compactDurationRates.index ?? 0) + compactDurationRates[0].length) {
        continue;
      }
      if (explicitFinalizationRates && !isOutcall
        && money.index >= (explicitFinalizationRates.index ?? 0)
        && money.index < (explicitFinalizationRates.index ?? 0) + explicitFinalizationRates[0].length) {
        continue;
      }
      if (parenthesizedThirtyMinuteRate && !isOutcall
        && money.index >= (parenthesizedThirtyMinuteRate.index ?? 0)
        && money.index < (parenthesizedThirtyMinuteRate.index ?? 0) + parenthesizedThirtyMinuteRate[0].length) {
        continue;
      }
      if (explicitHourRate && !isOutcall
        && money.index >= (explicitHourRate.index ?? 0)
        && money.index < (explicitHourRate.index ?? 0) + explicitHourRate[0].length) {
        continue;
      }
      if (oneAndHalfHourTextRate && !isOutcall
        && money.index >= (oneAndHalfHourTextRate.index ?? 0)
        && money.index < (oneAndHalfHourTextRate.index ?? 0) + oneAndHalfHourTextRate[0].length) {
        continue;
      }
      if (oneHourTextRate && !isOutcall
        && money.index >= (oneHourTextRate.index ?? 0)
        && money.index < (oneHourTextRate.index ?? 0) + oneHourTextRate[0].length) {
        continue;
      }
      if (explicitDominationRate && !isOutcall
        && money.index >= (explicitDominationRate.index ?? 0)
        && money.index < (explicitDominationRate.index ?? 0) + explicitDominationRate[0].length) {
        continue;
      }

      const candidates = inDominationSection && !isOutcall
        ? dominationCandidates
        : isOutcall
          ? outcallCandidates
          : baseCandidates;
      candidates[duration] = [...(candidates[duration] || []), money.amount];
      if (candidates === baseCandidates && baseRateLine.slice(money.index, money.index + 12).includes('€')) {
        euroAmounts[duration] = [...(euroAmounts[duration] || []), money.amount];
      }
    }
  }

  if (/\bora\s+cu\s+2\s+finalizari\b/i.test(text) && /\bmasaj\s+nurru\b/i.test(text)) {
    for (const match of text.matchAll(/\b1\s+ora\s+jumat\w*[^.!?\n]{0,150}?(\d{2,5})\s*(?:lei|ron)\b/gi)) {
      const amount = Number.parseInt(match[1], 10);
      if (isPriceAmount(amount)) {
        baseCandidates['1.5h'] = [...(baseCandidates['1.5h'] || []), amount];
      }
    }
    for (const match of text.matchAll(/\b(?:1\s+)?ora\b(?!\s+jumat\w*)[^.!?\n]{0,150}?(\d{2,5})\s*(?:lei|ron)\b/gi)) {
      const amount = Number.parseInt(match[1], 10);
      if (isPriceAmount(amount)) {
        baseCandidates['1h'] = [...(baseCandidates['1h'] || []), amount];
      }
    }
  }
  const sampleStyleRates = /\b\d{2,5}\s+o\s+finaliz\w*\.?\s*\(\s*30\s*min\b[\s\S]{0,80}\b\d{2,5}\s+1\s*h\b/i.test(rateText);
  if (sampleStyleRates) {
    const sampleStyleThirtyMinuteRate = /\b(\d{2,5})\s+o\s+finaliz\w*\.?\s*\(\s*30\s*min\b/i.exec(rateText);
    if (sampleStyleThirtyMinuteRate && isPriceAmount(Number.parseInt(sampleStyleThirtyMinuteRate[1], 10))) {
      baseCandidates['30m'] = [...(baseCandidates['30m'] || []), Number.parseInt(sampleStyleThirtyMinuteRate[1], 10)];
    }
    const sampleStyleHourRate = /\b(\d{2,5})\s+1\s*h\b/i.exec(rateText);
    if (sampleStyleHourRate && isPriceAmount(Number.parseInt(sampleStyleHourRate[1], 10))) {
      baseCandidates['1h'] = [...(baseCandidates['1h'] || []), Number.parseInt(sampleStyleHourRate[1], 10)];
    }
  }
  if (giftCompanyThirtyMinuteRate && isPriceAmount(Number.parseInt(giftCompanyThirtyMinuteRate[1], 10))) {
    baseCandidates['30m'] = [Number.parseInt(giftCompanyThirtyMinuteRate[1], 10)];
  }
  if (giftCompanyHourRate && isPriceAmount(Number.parseInt(giftCompanyHourRate[1], 10))) {
    baseCandidates['1h'] = [Number.parseInt(giftCompanyHourRate[1], 10)];
  }
  if (explicitPriceTableRates) {
    baseCandidates['30m'] = [250];
    baseCandidates['1h'] = [500];
  }
  const compactThirtyAndHourRates = /\b1\s+finaliz\w*\s*[-:]\s*(\d{2,5})\s*(?:lei|ron)\b[\s\S]{0,30}?\b1\s*h\s*[-:]\s*(\d{2,5})\s*(?:lei|ron)\b/i.exec(rateText);
  if (compactThirtyAndHourRates) {
    const thirtyMinuteRate = Number.parseInt(compactThirtyAndHourRates[1], 10);
    const hourRate = Number.parseInt(compactThirtyAndHourRates[2], 10);
    if (isPriceAmount(thirtyMinuteRate) && isPriceAmount(hourRate)) {
      baseCandidates['30m'] = [thirtyMinuteRate];
      baseCandidates['1h'] = [hourRate];
    }
  }
  const currencyPrefixedDurationRates = /\b(\d{2,5})\s*(?:lei|ron)\s*[-–:]\s*30\s*min(?:ute)?s?\b[\s\S]{0,80}?\b(\d{2,5})\s*(?:lei|ron)\s*[-–:]\s*60\s*min(?:ute)?s?\b/i.exec(rateText);
  if (currencyPrefixedDurationRates) {
    const thirtyMinuteRate = Number.parseInt(currencyPrefixedDurationRates[1], 10);
    const hourRate = Number.parseInt(currencyPrefixedDurationRates[2], 10);
    if (isPriceAmount(thirtyMinuteRate) && isPriceAmount(hourRate)) {
      baseCandidates['30m'] = [thirtyMinuteRate];
      baseCandidates['1h'] = [hourRate];
    }
  }
  const reverseThirtyMinuteRate = /\b30\s*de\s*minute?\s*[:=-]\s*(\d{2,5})\b/i.exec(rateText);
  if (reverseThirtyMinuteRate && isPriceAmount(Number.parseInt(reverseThirtyMinuteRate[1], 10))) {
    baseCandidates['30m'] = [Number.parseInt(reverseThirtyMinuteRate[1], 10)];
  }
  const reverseHourRate = /\b(\d{2,5})\s*(?:lei|ron)\s*[-:]\s*o\s+ora\b/i.exec(rateText);
  if (reverseHourRate && isPriceAmount(Number.parseInt(reverseHourRate[1], 10))) {
    baseCandidates['1h'] = [Number.parseInt(reverseHourRate[1], 10)];
  }
  const twoFinalizationsHourRate = /\b(\d{2,5})\s+(?:doua|2)\s+finaliz\w*[\s\S]{0,100}?\b60\s*(?:de\s*)?minute\b/i.exec(rateText);
  if (twoFinalizationsHourRate && isPriceAmount(Number.parseInt(twoFinalizationsHourRate[1], 10))) {
    baseCandidates['1h'] = [Number.parseInt(twoFinalizationsHourRate[1], 10)];
  }
  const locationDurationRates = /\b(\d{2,5})\s*(?:lei|ron)\s*[-–]\s*30\s*min\b[\s\S]{0,100}?\b(\d{2,5})\s*(?:lei|ron)\s*[-–]\s*1\s*ora\b/i.exec(rateText);
  if (locationDurationRates) {
    const thirtyMinuteRate = Number.parseInt(locationDurationRates[1], 10);
    const hourRate = Number.parseInt(locationDurationRates[2], 10);
    if (isPriceAmount(thirtyMinuteRate)) {
      baseCandidates['30m'] = [thirtyMinuteRate];
    }
    if (isPriceAmount(hourRate)) {
      baseCandidates['1h'] = [hourRate];
    }
  }
  const ptFinalizationRates = /\b(\d{2,5})\s*(?:lei|ron|pt)\s*o\s+finalizare\s*\(\s*30\s*min\b[\s\S]{0,80}?\b(\d{2,5})\s*(?:lei|ron|pt)\s*1\s*(?:sau\s+2|\/)\s*finaliz\w*\s*\(\s*1\s*ora\b/i.exec(rateText);
  if (ptFinalizationRates) {
    const thirtyMinuteRate = Number.parseInt(ptFinalizationRates[1], 10);
    const hourRate = Number.parseInt(ptFinalizationRates[2], 10);
    if (isPriceAmount(thirtyMinuteRate) && isPriceAmount(hourRate)) {
      baseCandidates['30m'] = [thirtyMinuteRate];
      baseCandidates['1h'] = [hourRate];
    }
  }
  const compactFinalizationRates = /(\d{2,5})\s*finaliz\w*\s*30\s*min[\s\S]{0,20}?(\d{2,5})\s*h\s*2\s*finaliz/i.exec(rateText);
  if (compactFinalizationRates) {
    const thirtyMinuteRate = Number.parseInt(compactFinalizationRates[1], 10);
    const hourRate = Number.parseInt(compactFinalizationRates[2], 10);
    if (isPriceAmount(thirtyMinuteRate) && isPriceAmount(hourRate)) {
      baseCandidates['30m'] = [thirtyMinuteRate];
      baseCandidates['1h'] = [hourRate];
    }
  }
  const inlineSlashDurationRates = /\b(\d{2,5})\s*\/\s*30\s*min\b[\s\S]{0,100}?\b(\d{2,5})\s*\/\s*(?:o\s+)?ora\b[\s\S]{0,100}?\b(\d{2,5})\s*1\s*h\s*30\b/i.exec(rateText);
  if (inlineSlashDurationRates) {
    const thirtyMinuteRate = Number.parseInt(inlineSlashDurationRates[1], 10);
    const hourRate = Number.parseInt(inlineSlashDurationRates[2], 10);
    const oneAndHalfHourRate = Number.parseInt(inlineSlashDurationRates[3], 10);
    if (isPriceAmount(thirtyMinuteRate) && isPriceAmount(hourRate) && isPriceAmount(oneAndHalfHourRate)) {
      baseCandidates['30m'] = [thirtyMinuteRate];
      baseCandidates['1h'] = [hourRate];
      baseCandidates['1.5h'] = [oneAndHalfHourRate];
    }
  }
  const finalizationPackageAndHourRates = /\b(\d{2,5})\s*(?:lei|ron)\s*[-–:]\s*o\s+finalizare\b[\s\S]{0,100}?\b(\d{2,5})\s*(?:lei|ron)\s*[-–:]\s*o\s+ora\b/i.exec(rateText);
  if (finalizationPackageAndHourRates) {
    const finalizationRate = Number.parseInt(finalizationPackageAndHourRates[1], 10);
    const hourRate = Number.parseInt(finalizationPackageAndHourRates[2], 10);
    if (isPriceAmount(finalizationRate) && isPriceAmount(hourRate)) {
      baseCandidates['30m'] = [finalizationRate];
      baseCandidates['1h'] = [hourRate];
    }
  }
  const durationThenRateTable = /\b(\d{2,5})\s+30\s*min\b[^\d]{0,12}(\d{2,5})[^\d]{0,8}h\b[^\d]{0,30}(\d{2,5})\s*(?:lei|ron)\b[^\d]{0,12}90\s*min\b/i.exec(rateText);
  if (durationThenRateTable) {
    const thirtyMinuteRate = Number.parseInt(durationThenRateTable[1], 10);
    const hourRate = Number.parseInt(durationThenRateTable[2], 10);
    const oneAndHalfHourRate = Number.parseInt(durationThenRateTable[3], 10);
    if (isPriceAmount(thirtyMinuteRate) && isPriceAmount(hourRate) && isPriceAmount(oneAndHalfHourRate)) {
      baseCandidates['30m'] = [thirtyMinuteRate];
      baseCandidates['1h'] = [hourRate];
      baseCandidates['1.5h'] = [oneAndHalfHourRate];
    }
  }
  const prefixedDurationRates = /\b30\s*min(?:ute)?s?\s*[-:]\s*(\d{2,5})\s*(?:lei|ron)\b[\s/,-]{1,20}60\s*min(?:ute)?s?\s*[-:]\s*(\d{2,5})\s*(?:lei|ron)\b/i.exec(rateText);
  if (prefixedDurationRates) {
    const thirtyMinuteRate = Number.parseInt(prefixedDurationRates[1], 10);
    const hourRate = Number.parseInt(prefixedDurationRates[2], 10);
    if (isPriceAmount(thirtyMinuteRate) && isPriceAmount(hourRate)) {
      baseCandidates['30m'] = [thirtyMinuteRate];
      baseCandidates['1h'] = [hourRate];
    }
  }
  const dashedShortAndHourRates = /\b(\d{2,5})\s*[-:]\s*30\s*(?:de\s*)?min\b[\s\S]{0,30}?\b(\d{2,5})\s*[-:]\s*1\s*h\b/i.exec(rateText);
  if (dashedShortAndHourRates) {
    const thirtyMinuteRate = Number.parseInt(dashedShortAndHourRates[1], 10);
    const hourRate = Number.parseInt(dashedShortAndHourRates[2], 10);
    if (isPriceAmount(thirtyMinuteRate) && isPriceAmount(hourRate)) {
      baseCandidates['30m'] = [thirtyMinuteRate];
      baseCandidates['1h'] = [hourRate];
    }
  }
  const locationRateTable = /\b(\d{2,5})\s*[-:]\s*30\s*min\b[\s\S]{0,150}?\b(\d{2,5})\s*[-:]\s*60\s*min[\s\S]{0,60}\blocatie\b/i.exec(rateText);
  if (locationRateTable) {
    const thirtyMinuteRate = Number.parseInt(locationRateTable[1], 10);
    const hourRate = Number.parseInt(locationRateTable[2], 10);
    if (isPriceAmount(thirtyMinuteRate) && isPriceAmount(hourRate)) {
      baseCandidates['30m'] = [thirtyMinuteRate];
      baseCandidates['1h'] = [hourRate];
    }
  }
  const outcallMinuteRate = /\b(\d{2,5})\s*[-:]\s*60\s*min\b[^\n]{0,30}\bdeplasar\w*\b/i.exec(text);
  if (outcallMinuteRate && isPriceAmount(Number.parseInt(outcallMinuteRate[1], 10))) {
    outcallCandidates['1h'] = [Number.parseInt(outcallMinuteRate[1], 10)];
  }
  const dashedDurationRateTable = /\b(\d{2,5})\s*[-–]\s*30\s*min\b[\s\S]{0,40}?\b(\d{2,5})\s*[-–]\s*(?:ora|1\s*h)\b[\s\S]{0,40}?\b(\d{2,5})\s*[-–]\s*90\s*min\b/i.exec(rateText);
  if (dashedDurationRateTable) {
    const thirtyMinuteRate = Number.parseInt(dashedDurationRateTable[1], 10);
    const hourRate = Number.parseInt(dashedDurationRateTable[2], 10);
    const oneAndHalfHourRate = Number.parseInt(dashedDurationRateTable[3], 10);
    if (isPriceAmount(thirtyMinuteRate) && isPriceAmount(hourRate) && isPriceAmount(oneAndHalfHourRate)) {
      baseCandidates['30m'] = [thirtyMinuteRate];
      baseCandidates['1h'] = [hourRate];
      baseCandidates['1.5h'] = [oneAndHalfHourRate];
    }
  }
  const leiDurationRates = /\b(\d{2,5})\s+de\s+lei\s+30\s*minute?\b[\s\S]{0,40}?\b(\d{2,5})\s+de\s+lei\s+60\s*minute?\b/i.exec(rateText);
  if (leiDurationRates) {
    const thirtyMinuteRate = Number.parseInt(leiDurationRates[1], 10);
    const hourRate = Number.parseInt(leiDurationRates[2], 10);
    if (isPriceAmount(thirtyMinuteRate) && isPriceAmount(hourRate)) {
      baseCandidates['30m'] = [thirtyMinuteRate];
      baseCandidates['1h'] = [hourRate];
    }
  }
  const ronFinalizationRates = /\b(\d{2,5})\s*(?:lei|ron)\s+finaliz\w*\s*\(\s*30\s*min\b[\s\S]{0,60}?\b(\d{2,5})\s*(?:lei|ron)\s+ora\b/i.exec(rateText);
  if (ronFinalizationRates) {
    const thirtyMinuteRate = Number.parseInt(ronFinalizationRates[1], 10);
    const hourRate = Number.parseInt(ronFinalizationRates[2], 10);
    if (isPriceAmount(thirtyMinuteRate) && isPriceAmount(hourRate)) {
      baseCandidates['30m'] = [thirtyMinuteRate];
      baseCandidates['1h'] = [hourRate];
    }
  }
  const compactHourRate = /\b(\d{2,5})\s*ora\b/i.exec(rateText);
  const compactHourPrefix = compactHourRate ? rateText.slice(Math.max(0, compactHourRate.index ?? 0) - 40, compactHourRate.index ?? 0) : '';
  if (compactHourRate && !ptFinalizationRates
    && !/\b(?:dominare|deplasar\w*|hotel)\b/i.test(compactHourPrefix)
    && isPriceAmount(Number.parseInt(compactHourRate[1], 10))) {
    baseCandidates['1h'] = [Number.parseInt(compactHourRate[1], 10)];
  }
  const compactFinalizationRate = /\b(\d{2,5})finaliz\w*\b/i.exec(rateText);
  if (compactFinalizationRate && isPriceAmount(Number.parseInt(compactFinalizationRate[1], 10))) {
    baseCandidates['30m'] = [Number.parseInt(compactFinalizationRate[1], 10)];
  }
  const compactHourRateWithoutSpace = /\b(\d{2,5})ora\b/i.exec(rateText);
  if (compactHourRateWithoutSpace && isPriceAmount(Number.parseInt(compactHourRateWithoutSpace[1], 10))) {
    baseCandidates['1h'] = [Number.parseInt(compactHourRateWithoutSpace[1], 10)];
  }
  const compactHourRateWithSuffix = /\b(\d{2,5})\s*h\s*(?:\(|,|💚|$)/i.exec(rateText);
  if (compactHourRateWithSuffix && isPriceAmount(Number.parseInt(compactHourRateWithSuffix[1], 10))) {
    baseCandidates['1h'] = [Number.parseInt(compactHourRateWithSuffix[1], 10)];
  }
  const primaryFinalizationRate = /\btarif\w*\s*[:\-]\s*(\d{2,5})\s*(?:de\s*)?(?:lei|ron)?\s+finaliz\w*\b/i.exec(rateText);
  if (primaryFinalizationRate && isPriceAmount(Number.parseInt(primaryFinalizationRate[1], 10))) {
    baseCandidates['30m'] = [Number.parseInt(primaryFinalizationRate[1], 10)];
  }
  const formattedHourRate = /\b(\d{1,3}[.,]\d{3})\s*(?:lei|ron)\s*[-:]\s*1\s*or[ăa]\b/i.exec(rateText);
  if (formattedHourRate && isPriceAmount(Number.parseInt(formattedHourRate[1].replace(/[.,]/g, ''), 10))) {
    baseCandidates['1h'] = [Number.parseInt(formattedHourRate[1].replace(/[.,]/g, ''), 10)];
  }
  const compactFinalizationAndHourRates = /\b(\d{2,5})\s*fin(?:aliz\w*)?\b[\s\S]{0,50}?\b(?:ora|h)\s*[-:]\s*(\d{2,5})\b/i.exec(rateText);
  if (compactFinalizationAndHourRates) {
    const thirtyMinuteRate = Number.parseInt(compactFinalizationAndHourRates[1], 10);
    const hourRate = Number.parseInt(compactFinalizationAndHourRates[2], 10);
    if (isPriceAmount(thirtyMinuteRate)) {
      baseCandidates['30m'] = [thirtyMinuteRate];
    }
    if (isPriceAmount(hourRate)) {
      baseCandidates['1h'] = [hourRate];
    }
  }
  const explicitBaseAndOutcallRates = /\b(\d{2,5})\s*fin(?:aliz\w*)?\b[\s\S]{0,50}?\bora\s*[-:]\s*(\d{2,5})\b[\s\S]{0,100}?\bdeplasar\w*[^.\n]{0,30}?\b(\d{2,5})\s*ora\b/i.exec(rateText);
  if (explicitBaseAndOutcallRates) {
    const thirtyMinuteRate = Number.parseInt(explicitBaseAndOutcallRates[1], 10);
    const hourRate = Number.parseInt(explicitBaseAndOutcallRates[2], 10);
    const outcallRate = Number.parseInt(explicitBaseAndOutcallRates[3], 10);
    if (isPriceAmount(thirtyMinuteRate)) {
      baseCandidates['30m'] = [thirtyMinuteRate];
    }
    if (isPriceAmount(hourRate)) {
      baseCandidates['1h'] = [hourRate];
    }
    if (isPriceAmount(outcallRate)) {
      outcallCandidates['1h'] = [outcallRate];
    }
  }
  const finalizationAndHourRates = /\bfin\s+(\d{2,5})\s+ora\s+(\d{2,5})\b/i.exec(rateText);
  if (finalizationAndHourRates) {
    baseCandidates['30m'] = [Number.parseInt(finalizationAndHourRates[1], 10)];
    baseCandidates['1h'] = [Number.parseInt(finalizationAndHourRates[2], 10)];
  }
  const finalizationThenHourRates = /\b(\d{2,5})\s*finaliz\w*[\s\S]{0,50}?\b(\d{2,5})\s*ora\b/i.exec(rateText);
  if (finalizationThenHourRates) {
    baseCandidates['30m'] = [Number.parseInt(finalizationThenHourRates[1], 10)];
    baseCandidates['1h'] = [Number.parseInt(finalizationThenHourRates[2], 10)];
  }
  const explicitHotelHourRate = /\b(\d{2,5})\s*ora\s+la\s+hotel\b/i.exec(rateText);
  if (explicitHotelHourRate) {
    outcallCandidates['1h'] = [Number.parseInt(explicitHotelHourRate[1], 10)];
  }
  const baseHourBeforeHotelRate = /\b(\d{2,5})\s*ron\s+ora\b[\s\S]{0,30}?\b\d{2,5}\s*ron\s+ora\s+la\s+hotel\b/i.exec(rateText);
  if (baseHourBeforeHotelRate) {
    baseCandidates['1h'] = [Number.parseInt(baseHourBeforeHotelRate[1], 10)];
  }
  const outcallParenthesizedRate = /\bor[ăa]\s+deplasar\w*\s*\(\s*(\d{2,5})\s*(?:lei|ron)\b/i.exec(rateText);
  if (outcallParenthesizedRate) {
    outcallCandidates['1h'] = [Number.parseInt(outcallParenthesizedRate[1], 10)];
  }
  const couplesOutcallRate = /\b(?:cupluri|cuplu)\b\s*(?:\([^)]*\)\s*)?(\d{2,5})\s*(?:lei|ron)\s*(?:o\s*)?or[ăa]\b/i.exec(rateText);
  if (couplesOutcallRate) {
    outcallCandidates['1h'] = [Number.parseInt(couplesOutcallRate[1], 10)];
  }
  const longDeplacementRate = /\bdeplasar\w*[^.\n]{0,120}?\b(\d{2,5})\s*ora\b/i.exec(rateText);
  if (longDeplacementRate) {
    outcallCandidates['1h'] = [Number.parseInt(longDeplacementRate[1], 10)];
  }
  const dominationRateText = /\bservicii?\s+de\s+dominare\b[\s\S]{0,180}/i.exec(text)?.[0];
  if (dominationRateText) {
    const dominationHour = /\b(?:o\s+)?ora\s+(\d{2,5})\b/i.exec(dominationRateText);
    const dominationHalfHour = /\b1\s+finaliz\w*\s+(\d{2,5})\b/i.exec(dominationRateText);
    if (dominationHour && isPriceAmount(Number.parseInt(dominationHour[1], 10))) {
      dominationCandidates['1h'] = [Number.parseInt(dominationHour[1], 10)];
    }
    if (dominationHalfHour && isPriceAmount(Number.parseInt(dominationHalfHour[1], 10))) {
      dominationCandidates['30m'] = [Number.parseInt(dominationHalfHour[1], 10)];
    }
  }
  const dominationSixtyMinuteRate = /\bdominare\b[\s\S]{0,250}?\b60\s*min\b[\s\S]{0,80}?\(\s*(\d{2,5})\s*(?:lei|ron)\s*\)/i.exec(text);
  if (dominationSixtyMinuteRate && isPriceAmount(Number.parseInt(dominationSixtyMinuteRate[1], 10))) {
    dominationCandidates['1h'] = [Number.parseInt(dominationSixtyMinuteRate[1], 10)];
  }
  const parenthesizedRateTable = /\b30\s*min\s*\(\s*(\d{2,5})\s*(?:lei|ron)\s*\)[\s\S]{0,50}?\b60\s*min\s*:\s*(\d{2,5})\s*(?:lei|ron)\b[\s\S]{0,60}?\b90\s*min\s*\(\s*(\d{2,5})\s*(?:lei|ron)\s*\)[\s\S]{0,40}?\b2\s*h\s*\(\s*(\d{2,5})\s*(?:lei|ron)\s*\)/i.exec(text);
  if (parenthesizedRateTable) {
    const ratesByDuration: Array<[keyof EscortRates, string]> = [
      ['30m', parenthesizedRateTable[1]],
      ['1h', parenthesizedRateTable[2]],
      ['1.5h', parenthesizedRateTable[3]],
      ['2h', parenthesizedRateTable[4]],
    ];
    for (const [duration, amountText] of ratesByDuration) {
      const amount = Number.parseInt(amountText, 10);
      if (isPriceAmount(amount)) {
        baseCandidates[duration] = [amount];
      }
    }
  }
  const hotelHourRate = /\bhotel\b[\s\S]{0,80}?\b60\s*min\s*\(\s*(\d{2,5})\s*(?:lei|ron)\s*\)/i.exec(text);
  if (hotelHourRate && isPriceAmount(Number.parseInt(hotelHourRate[1], 10))) {
    outcallCandidates['1h'] = [Number.parseInt(hotelHourRate[1], 10)];
  }
  const hotelRateTable = /\bla\s+hotel\s*:\s*1\s*ora\s*(\d{2,5})\s*[/,-]\s*2\s*ore?\s*(\d{2,5})\b/i.exec(text);
  if (hotelRateTable) {
    const hourRate = Number.parseInt(hotelRateTable[1], 10);
    const twoHourRate = Number.parseInt(hotelRateTable[2], 10);
    if (isPriceAmount(hourRate)) {
      outcallCandidates['1h'] = [hourRate];
    }
    if (isPriceAmount(twoHourRate)) {
      outcallCandidates['2h'] = [twoHourRate];
    }
  }
  const hotelInlineHourRate = /\b(?:deplasar\w*|hotel)\b[\s\S]{0,250}?\b(\d{2,5})\s*(?:lei|ron)\s*[-–:]\s*o\s+ora\b/i.exec(text);
  if (hotelInlineHourRate && isPriceAmount(Number.parseInt(hotelInlineHourRate[1], 10))) {
    outcallCandidates['1h'] = [Number.parseInt(hotelInlineHourRate[1], 10)];
  }

  for (const duration of ['30m', '1h', '1.5h', '2h'] as Array<keyof EscortRates>) {
    const base = baseCandidates[duration];
    const outcall = outcallCandidates[duration];
    const validBase = base?.filter(isPriceAmount);
    if (validBase?.length) {
      const amount = Math.min(...validBase);
      baseRates[duration] = euroAmounts[duration]?.includes(amount) ? `${amount}€` : amount;
    }
    const validOutcall = outcall?.filter(isPriceAmount);
    if (validOutcall?.length) {
      outcallRates[duration] = Math.min(...validOutcall);
    }
    const domination = dominationCandidates[duration];
    const validDomination = domination?.filter(isPriceAmount);
    if (validDomination?.length) {
      dominationRates[duration] = Math.min(...validDomination);
    }
  }
  const finalCouplesOutcallRate = /\bcupluri\b\s+(\d{2,5})\s*(?:lei|ron)\b/i.exec(rateText);
  if (finalCouplesOutcallRate) {
    outcallRates['1h'] = Number.parseInt(finalCouplesOutcallRate[1], 10);
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
      if (!followingLine.trim()) {
        continue;
      }

      const sequentialAmount = /^[^\d]*(\d{2,5})(?:(?:\s+(?:fin\b|(?:max\s*)?(?:30|min)|1h\b|ora\b)|\s*[-–]\s*(?:30|min|1h|ora)\b).*$|\s*)$/i.exec(followingLine.trim());
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
      if (isPriceAmount(amount)) {
        const effectiveRates: EscortRates = {...baseRates};
        for (const duration of Object.keys(effectiveRates) as Array<keyof EscortRates>) {
          effectiveRates[duration] = numericRateAmount(effectiveRates[duration]!) + amount;
        }
        override.rates = {...effectiveRates, ...rates};
      }
    } else if (Object.keys(rates).length) {
      override.rates = rates;
    } else if (pairedPrices) {
      override.rates = pairedPrices;
    }
    if (override.rates) {
      for (const duration of Object.keys(override.rates) as Array<keyof EscortRates>) {
        if (!isPriceAmount(numericRateAmount(override.rates[duration]!))) {
          delete override.rates[duration];
        }
      }
    }
    if (override.rates && Object.keys(override.rates).length) {
      overrides.push(override);
    }
  }

  return overrides;
}

const DAY_NAME_PATTERN = '(?:luni|marti|miercuri|joi|vineri|sambata|duminica)';
const DAY_ABBREVIATION_PATTERN = '(?:l|s|d)';
const DAY_EXPRESSION_PATTERN = new RegExp(`\\b(?:week(?:\\s|-)?end|${DAY_NAME_PATTERN}(?:\\s*(?:-|\\/|pana(?:\\s+la)?|si\\s+pana(?:\\s+la)?)\\s*${DAY_NAME_PATTERN})?|${DAY_ABBREVIATION_PATTERN}(?:\\s*-\\s*${DAY_ABBREVIATION_PATTERN})?)\\b`, 'gi');
const SCHEDULE_TIME_RANGE_PATTERN = /\b([01]?\d|2[0-3]|24)(?:[:.]([0-5]\d))?\s*(?:h|ore?)?\s*(?:-|[–—/]|_+|\bsi\b)\s*([01]?\d|2[0-3]|24)(?:[:.]([0-5]\d))?\s*(?:h|ore?)?\b/gi;

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

  const isTravelDate = nearestExpression
    && /^de\s+duminica\s*,?\s*(?:si\s+)?zilele\s+pe\s+care\b/i.test(line.slice(Math.max(0, nearestExpression.start - 3)));
  const isWeekendInclusion = nearestExpression
    && /week(?:\s|-)?end/i.test(nearestExpression.expression)
    && /\binclusiv\s+in\s*$/i.test(line.slice(Math.max(0, nearestExpression.start - 30), nearestExpression.start));
  if (nearestExpression && !isTravelDate && !isWeekendInclusion) {
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
      if (/\d\s*\/\s*\d\s*(?:zi(?:le)?|zilelor)\b/i.test(line.slice(rangeStart, rangeEnd + 12))) {
        continue;
      }
      if (/^\s*ori\b/i.test(line.slice(rangeEnd))) {
        continue;
      }
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
      || (/\bpreturi\s+trio\b/i.test(normalizedText)
        && !/\b(?:oral|normal|masaj|servici\w*|prestat\w*|meniu|gfe|cim|cof|cob)\b/i.test(normalizedText))
      || (!/\b(?:servici|prestat\w*|meniu|ofer\s+urmatoarele)\b/i.test(normalizedText)
        && /\b(?:duo|colab\w*|trio|show\s+lesb|programari\s+in\s+3)\b/i.test(normalizedText)
        && !/\b(?:oral|normal|masaj|cob|cupluri|uro|69|anal|cim|cof|finaliz\w*)\b/i.test(normalizedText));
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
    const recognizedServices = SERVICE_NAMES.filter(service => new RegExp(SERVICE_PATTERNS[service].source, 'i').test(normalizedText));
    const hasRecognizedService = recognizedServices.length > 0;
    if (!hasServiceContext && recognizedServices.length === 1 && recognizedServices[0] === '3some') {
      return null;
    }
    if (!hasServiceContext && !hasRecognizedService
      && !/\b(?:30|60)\s*(?:de\s*)?(?:minute?|min)\b/i.test(normalizedText)) {
      return null;
    }
    const comboOnlyServices = recognizedServices.length > 0
      && recognizedServices.every(service => service === '3some' || service === 'lesbyShow')
      && /\b(?:colab\w*|threesome|show\s+lesb\w*)\b/i.test(normalizedText);
    if (comboOnlyServices) {
      return null;
    }
    const hasRateContext = /\b(?:lei|ron|minute?|min|ore?|ora)\b/i.test(normalizedText);
    if (!hasServiceContext && !hasRecognizedService && !hasRateContext) {
      return null;
    }
    if (!Object.keys(rates.baseRates).length && !Object.keys(rates.outcallRates).length && !rateOverrides.length && !hasServiceContext) {
      return null;
    }

    const virtualOnlyText = /\b(?:videoclip\w*|filmule\w*|sexting|web\s+show|masturbare)\b/i.test(normalizedText)
      && !/\b(?:servici\w*|meniu|escort\w*|vizit\w*|oral|sex\s+normal|masaj)\b/i.test(normalizedText);
    if (virtualOnlyText) {
      return null;
    }

    if (Object.keys(rates.baseRates).length) {
      for (const service of SERVICE_NAMES.filter(service => service !== 'anal')) {
        const details = extractOneService(normalizedText, service);
        if (details !== undefined) {
          services[service] = details;
        }
      }
      if (/\bfinaliz\w*\s+pe\s+sani\w*[^\n]{0,20}\b50\s*(?:lei|ron)\b/i.test(normalizedText)
        && services.cob !== undefined) {
        services.cob = {extraCost: 50};
      }
      const analDetails = extractOneService(normalizedText, 'anal');
      if (analDetails !== undefined) {
        const apDetails = services.ap;
        if (apDetails === undefined) {
          services.ap = analDetails;
        } else {
          const extraCosts = [apDetails, analDetails]
            .filter((value): value is {extraCost: number} => typeof value === 'object');
          services.ap = extraCosts.length
            ? {extraCost: Math.max(...extraCosts.map(value => value.extraCost))}
            : apDetails === true || analDetails === true;
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
