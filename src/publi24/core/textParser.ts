import {utils} from "../../common/utils";

export type AdContentTuple = [string, number | boolean];

const ROMANIAN_DIGIT_WORDS: Record<string, string> = {
  zero: '0',
  unu: '1',
  doi: '2',
  trei: '3',
  patru: '4',
  cinci: '5',
  sase: '6',
  sapte: '7',
  opt: '8',
  noua: '9',
};

function normalizeRomanianDigitToken(token: string): string | null {
  const digits = token.replace(/\D/g, '');
  const withoutPunctuation = token.replace(/[.,]/g, '');

  if (digits.length > 0 && digits === withoutPunctuation) {
    return digits;
  }

  const word = utils.removeDiacritics(token).toLowerCase();
  if (ROMANIAN_DIGIT_WORDS[word]) {
    return ROMANIAN_DIGIT_WORDS[word];
  }

  return null;
}

export const textParser = {
  extractPhoneFromText(text: string): string | undefined {
    const normalizedText = utils.removeDiacritics(text);

    const compact = normalizedText.replace(/[\s.\-–—(),:;]/g, '');
    const normalMatch = compact.match(/(?:^|[^\d])(\+?407\d{8}|07\d{8})(?:[^\d]|$)/);
    if (normalMatch) {
      return normalMatch[1].replace(/^\+?40/, '0');
    }

    const tokens = normalizedText.split(/[\s.\-–—(),:;\[\]{}]+/).filter(Boolean);
    for (let i = 0; i < tokens.length; i++) {
      const start = tokens[i].toLowerCase();

      if (start === '07' || start === '+40' || start === '40') {
        let digits = start.replace(/\D/g, '');
        let j = i + 1;

        while (j < tokens.length && digits.length < 12) {
          const part = normalizeRomanianDigitToken(tokens[j]);
          if (!part) {
            break;
          }
          digits += part;
          j++;
        }

        if (digits.startsWith('40') && digits.length === 11 && digits.charAt(2) === '7') {
          return '0' + digits.slice(2);
        }

        if (digits.startsWith('07') && digits.length === 10) {
          return digits;
        }
      }
    }

    return undefined;
  },

  extractAdContentDataFromText(title: string, content: string): AdContentTuple[] {
    const data: AdContentTuple[] = [];
    let match: RegExpMatchArray | null;

    const attemptApplyHeight = (height: number): void => {
      if (height >= 135 && height <= 200) {
        data.push(['height', height]);
      }
    }
    const attemptApplyWeight = (weight: number): void => {
      if (weight >= 35 && weight <= 145) {
        data.push(['weight', weight]);
      }
    }

    if ((match = content.match(/(1[.,'" ] ?[3-9]\d)/))) {
      const str: string = match[1].replace(/[,'" ]/, '.').replace(' ', '');
      attemptApplyHeight(Number.parseFloat(str) * 100);
    }
    if (!data.find(d => d[0] === 'height') && (match = content.match(/[^\d%](1[3-9]\d) ?[^\d%]/))) {
      attemptApplyHeight(Number.parseInt(match[1], 10));
    }
    if (!data.find(d => d[0] === 'height') && (match = content.match(/inaltimea? (1[3-9]\d)/i))) {
      attemptApplyHeight(Number.parseInt(match[1], 10));
    }

    if ((match = content.match(/(\d+) ?(de )?(kg|kilo)/i))) {
      attemptApplyWeight(Number.parseInt(match[1], 10));
    }
    if ((match = content.match(/kg ?(\d+)/i))) {
      attemptApplyWeight(Number.parseInt(match[1], 10));
    }

    if ((match = content.match(/(\d+) ?(de )?ani(?! de)/i))
      || (match = content.match(/anca (\d+)/i))
      || (match = content.match(/matura (\d+)/i))
      || (match = content.match(/(\d+) ?(yrs|years)/i))) {
      const age = Number.parseInt(match[1], 10);
      if (age >= 17 && age <= 70) {
        data.push(['age', age]);
      }
    }

    if (content.match(/(\W|^)(show\s+web|web\s+show|show\s+la\s+web|show\s+(a-zA-Z)+\s+web|si\s+webb?)(\W|$)/i)) {
      data.push(['showWeb', true]);
    }
    if (content.match(/(\W|^)(botox|siliconata|silicoane)(\W|$)/i)) {
      data.push(['botox', true]);
    }
    if (content.match(/(\W|^)(party)(\W|$)/i)) {
      data.push(['party', true]);
    }
    if (content.match(/(\W|^)(cu sau fara(?!\s+jucarii)|cum\s+vrei\s+tu|cum\s+te\s+simti\s+mai\s+bine|totale\s+fara[,.;]|cu\s+tot\s+ce\s+vrei)(\W|$)/i)) {
      data.push(['btsRisc', true]);
    }
    if (
      (
        content.match(/(\W|^)(out\s*call|(doa?r|numai|decat)\s+(deplasar|depalsar|deplsar)(i{1,4}|e)|ma deplasez|nu (am|detin) locatie)(\W|$)/i)
        || title.match(/(\W|^)(out\s*call|(deplasar|depalsar|deplsar)(i{1,4}|e))(\W|$)/i)
      )
      && !content.match(/(\W|^)(in\s*call|la\s+mine|locatie\s+proprie|si\s+deplasar[ie]|si\s+locatie|locatia\s+mea|in\s+locatie|nu\s+fac\s+deplasari)(\W|$)/i)) {
      data.push(['onlyTrips', true]);
    }
    if (content.match(/(\W|^)(ts|trans|transs?exuala?)(\W|$)/i)) {
      data.push(['trans', true]);
    }
    if (content.match(/(\W|^)(matura)(\W|$)/i)) {
      data.push(['mature', true]);
    }

    return data;
  },
};
