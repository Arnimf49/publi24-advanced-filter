const ALL_COUNTRY_CODES = [
  'general', 'ad', 'ae', 'af', 'ag', 'ai', 'al', 'am', 'ao', 'aq', 'ar', 'as', 'at',
  'au', 'aw', 'ax', 'az', 'ba', 'bb', 'bd', 'be', 'bf', 'bg', 'bh', 'bi', 'bj',
  'bl', 'bm', 'bn', 'bo', 'bq', 'br', 'bs', 'bt', 'bv', 'bw', 'by', 'bz', 'ca',
  'cc', 'cd', 'cf', 'cg', 'ch', 'ci', 'ck', 'cl', 'cm', 'cn', 'co', 'cr', 'cu',
  'cv', 'cw', 'cx', 'cy', 'cz', 'de', 'dj', 'dk', 'dm', 'do', 'dz', 'ec', 'ee',
  'eg', 'eh', 'er', 'es', 'et', 'fi', 'fj', 'fk', 'fm', 'fo', 'fr', 'ga', 'gb',
  'gd', 'ge', 'gf', 'gg', 'gh', 'gi', 'gl', 'gm', 'gn', 'gp', 'gq', 'gr', 'gs',
  'gt', 'gu', 'gw', 'gy', 'hk', 'hm', 'hn', 'hr', 'ht', 'hu', 'id', 'ie', 'il',
  'im', 'in', 'io', 'iq', 'ir', 'is', 'it', 'je', 'jm', 'jo', 'jp', 'ke', 'kg',
  'kh', 'ki', 'km', 'kn', 'kp', 'kr', 'kw', 'ky', 'kz', 'la', 'lb', 'lc', 'li',
  'lk', 'lr', 'ls', 'lt', 'lu', 'lv', 'ly', 'ma', 'mc', 'md', 'me', 'mf', 'mg',
  'mh', 'mk', 'ml', 'mm', 'mn', 'mo', 'mp', 'mq', 'mr', 'ms', 'mt', 'mu', 'mv',
  'mw', 'mx', 'my', 'mz', 'na', 'nc', 'ne', 'nf', 'ng', 'ni', 'nl', 'no', 'np',
  'nr', 'nu', 'nz', 'om', 'pa', 'pe', 'pf', 'pg', 'ph', 'pk', 'pl', 'pm', 'pn',
  'pr', 'ps', 'pt', 'pw', 'py', 'qa', 're', 'ro', 'rs', 'ru', 'rw', 'sa', 'sb',
  'sc', 'sd', 'se', 'sg', 'sh', 'si', 'sj', 'sk', 'sl', 'sm', 'sn', 'so', 'sr',
  'ss', 'st', 'sv', 'sx', 'sy', 'sz', 'tc', 'td', 'tf', 'tg', 'th', 'tj', 'tk',
  'tl', 'tm', 'tn', 'to', 'tr', 'tt', 'tv', 'tw', 'tz', 'ua', 'ug', 'um', 'us',
  'uy', 'uz', 'va', 'vc', 've', 'vg', 'vi', 'vn', 'vu', 'wf', 'ws', 'ye', 'yt',
  'za', 'zm', 'zw',
] as const;

const PHONE_PREFIX_COUNTRIES = [
  ['+20', 'eg'], ['+27', 'za'], ['+30', 'gr'], ['+31', 'nl'],
  ['+32', 'be'], ['+33', 'fr'], ['+34', 'es'], ['+36', 'hu'], ['+39', 'it'], ['+40', 'ro'],
  ['+41', 'ch'], ['+43', 'at'], ['+44', 'gb'], ['+45', 'dk'], ['+46', 'se'], ['+47', 'no'],
  ['+48', 'pl'], ['+49', 'de'], ['+51', 'pe'], ['+52', 'mx'], ['+53', 'cu'], ['+54', 'ar'],
  ['+55', 'br'], ['+56', 'cl'], ['+57', 'co'], ['+58', 've'], ['+60', 'my'], ['+61', 'au'],
  ['+62', 'id'], ['+63', 'ph'], ['+64', 'nz'], ['+65', 'sg'], ['+66', 'th'], ['+81', 'jp'],
  ['+82', 'kr'], ['+84', 'vn'], ['+86', 'cn'], ['+90', 'tr'], ['+91', 'in'], ['+92', 'pk'],
  ['+93', 'af'], ['+94', 'lk'], ['+95', 'mm'], ['+98', 'ir'], ['+212', 'ma'], ['+213', 'dz'],
  ['+216', 'tn'], ['+218', 'ly'], ['+220', 'gm'], ['+221', 'sn'], ['+230', 'mu'], ['+231', 'lr'],
  ['+234', 'ng'], ['+351', 'pt'], ['+352', 'lu'], ['+353', 'ie'], ['+354', 'is'], ['+355', 'al'],
  ['+356', 'mt'], ['+357', 'cy'], ['+358', 'fi'], ['+359', 'bg'], ['+370', 'lt'], ['+371', 'lv'],
  ['+372', 'ee'], ['+373', 'md'], ['+374', 'am'], ['+375', 'by'], ['+376', 'ad'], ['+377', 'mc'],
  ['+380', 'ua'], ['+381', 'rs'], ['+382', 'me'], ['+385', 'hr'], ['+386', 'si'], ['+387', 'ba'],
  ['+389', 'mk'], ['+420', 'cz'], ['+421', 'sk'], ['+423', 'li'], ['+852', 'hk'], ['+853', 'mo'],
  ['+886', 'tw'], ['+961', 'lb'], ['+962', 'jo'], ['+963', 'sy'], ['+964', 'iq'], ['+965', 'kw'],
  ['+966', 'sa'], ['+971', 'ae'], ['+972', 'il'], ['+974', 'qa'], ['+975', 'bt'], ['+976', 'mn'],
  ['+977', 'np'], ['+995', 'ge'], ['+996', 'kg'], ['+998', 'uz'],
] as const;

const COUNTRY_CODES = [...ALL_COUNTRY_CODES] as string[];

const getPhoneCountryHints = (phoneNumbers: string[]): string[] => {
  const normalized = phoneNumbers
    .map((phoneNumber) => phoneNumber.replace(/[^\d+]/g, ''))
    .filter((phoneNumber) => phoneNumber.startsWith('+'));

  const sortedPrefixes = [...PHONE_PREFIX_COUNTRIES].sort((a, b) => b[0].length - a[0].length);
  const hints = new Set<string>();

  for (const phoneNumber of normalized) {
    const match = sortedPrefixes.find(([prefix]) => phoneNumber.startsWith(prefix));
    if (match) {
      hints.add(match[1]);
    }
  }

  return [...hints];
};

const normalizePhoneNumber = (phoneNumber: string): string => {
  const normalized = phoneNumber.replace(/[^\d+]/g, '');
  if (normalized.startsWith('00')) {
    return `+${normalized.slice(2)}`;
  }

  const digitsOnly = normalized.replace(/[^\d]/g, '');

  if (digitsOnly.length === 11 && digitsOnly.startsWith('8')) {
    return `+7${digitsOnly.slice(1)}`;
  }

  if (digitsOnly.length === 11 && digitsOnly.startsWith('7')) {
    return `+${digitsOnly}`;
  }

  return normalized;
};

const getComparablePhoneVariants = (phoneNumber: string): string[] => {
  const normalized = normalizePhoneNumber(phoneNumber);
  if (!normalized) {
    return [];
  }

  const variants = new Set<string>([normalized]);
  const sortedPrefixes = [...PHONE_PREFIX_COUNTRIES].sort((left, right) => right[0].length - left[0].length);
  const matchingPrefix = sortedPrefixes.find(([prefix]) => normalized.startsWith(prefix));

  if (matchingPrefix) {
    const [prefix] = matchingPrefix;
    const nationalDigits = normalized.slice(prefix.length).replace(/[^\d]/g, '');
    if (nationalDigits) {
      variants.add(`0${nationalDigits}`);
    }
  }

  return [...variants];
};

const arePhoneNumbersEquivalent = (leftPhoneNumber: string, rightPhoneNumber: string): boolean => {
  const leftVariants = getComparablePhoneVariants(leftPhoneNumber);
  const rightVariants = getComparablePhoneVariants(rightPhoneNumber);
  if (leftVariants.length === 0 || rightVariants.length === 0) {
    return false;
  }

  for (const leftVariant of leftVariants) {
    const leftDigits = leftVariant.replace(/[^\d]/g, '');
    if (!leftDigits) {
      continue;
    }

    for (const rightVariant of rightVariants) {
      const rightDigits = rightVariant.replace(/[^\d]/g, '');
      if (!rightDigits) {
        continue;
      }

      if (leftVariant === rightVariant || leftDigits === rightDigits) {
        return true;
      }

      const shorter = leftDigits.length <= rightDigits.length ? leftDigits : rightDigits;
      const longer = leftDigits.length <= rightDigits.length ? rightDigits : leftDigits;
      const lengthDifference = longer.length - shorter.length;
      if (shorter.length >= 7 && lengthDifference > 0 && lengthDifference <= 4) {
        if (longer.startsWith(shorter) || longer.endsWith(shorter)) {
          return true;
        }
      }
    }
  }

  return false;
};

const collapseEquivalentPhoneNumbers = (phoneNumbers: string[]): string[] => {
  const sortedPhoneNumbers = [...phoneNumbers].sort((left, right) => {
    return right.replace(/[^\d]/g, '').length - left.replace(/[^\d]/g, '').length;
  });
  const uniquePhoneNumbers: string[] = [];

  for (const phoneNumber of sortedPhoneNumbers) {
    if (!isRealPhoneNumber(phoneNumber)) {
      continue;
    }

    if (uniquePhoneNumbers.some((existingPhoneNumber) => arePhoneNumbersEquivalent(existingPhoneNumber, phoneNumber))) {
      continue;
    }

    uniquePhoneNumbers.push(phoneNumber);
  }

  return uniquePhoneNumbers;
};

const isRealPhoneNumber = (phoneNumber: string): boolean => {
  const normalized = normalizePhoneNumber(phoneNumber);
  const digitsOnly = normalized.replace(/[^\d]/g, '');

  if (digitsOnly.length < 7) {
    return false;
  }

  // Reject numbers with extremely low digit diversity (e.g. "0001100110").
  // Real phone numbers use a variety of digits; repetitive patterns are fake.
  const digitCounts: Record<string, number> = {};
  for (const d of digitsOnly) {
    digitCounts[d] = (digitCounts[d] ?? 0) + 1;
  }

  const maxFrequency = Math.max(...Object.values(digitCounts));
  if (maxFrequency / digitsOnly.length > 0.6) {
    return false;
  }

  const uniqueDigits = Object.keys(digitCounts).length;
  if (uniqueDigits <= 2 && digitsOnly.length >= 7) {
    return false;
  }

  return true;
};

const extractCountryFromDomain = (domain: string): string | null => {
  if (domain.endsWith('.co.uk')) {
    return 'gb';
  }

  const match = domain.match(/\.([a-z]{2})$/i);
  if (match) {
    const tld = match[1].toLowerCase();
    if (COUNTRY_CODES.includes(tld)) {
      return tld;
    }
  }

  const multiPartMatch = domain.match(/\.([a-z]{2})\.[a-z]{2,}$/i);
  if (multiPartMatch) {
    const secondLevel = multiPartMatch[1].toLowerCase();
    if (COUNTRY_CODES.includes(secondLevel)) {
      return secondLevel;
    }
  }

  return null;
};

export const phoneSignals = {
  arePhoneNumbersEquivalent,
  ALL_COUNTRY_CODES,
  collapseEquivalentPhoneNumbers,
  extractCountryFromDomain,
  getComparablePhoneVariants,
  getPhoneCountryHints,
  isRealPhoneNumber,
  normalizePhoneNumber,
};
