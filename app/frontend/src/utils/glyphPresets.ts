export interface GlyphPresetPack {
  id: string;
  name: string;
  region: string;
  description: string;
  characters: string[];
}

export const GLYPH_PRESET_PACKS: GlyphPresetPack[] = [
  {
    id: 'german',
    name: 'German (DACH)',
    region: 'DE / AT / CH',
    description: 'Umlauts (Ä, Ö, Ü) and Eszett (ß, ẞ) for German, Austrian & Swiss typography.',
    characters: ['Ä', 'ä', 'Ö', 'ö', 'Ü', 'ü', 'ß', 'ẞ']
  },
  {
    id: 'serbian',
    name: 'Serbian Cyrillic',
    region: 'SR / RS',
    description: 'Vuk Karadžić 30-letter Serbian Cyrillic alphabet (Upper & Lower).',
    characters: [
      'А', 'а', 'Б', 'б', 'В', 'в', 'Г', 'г', 'Д', 'д', 
      'Ђ', 'ђ', 'Е', 'е', 'Ж', 'ж', 'З', 'з', 'И', 'и', 
      'Ј', 'ј', 'К', 'к', 'Л', 'л', 'Љ', 'љ', 'М', 'м', 
      'Н', 'н', 'Њ', 'њ', 'О', 'о', 'П', 'п', 'Р', 'р', 
      'С', 'с', 'Т', 'т', 'Ћ', 'ћ', 'У', 'у', 'Ф', 'ф', 
      'Х', 'х', 'Ц', 'ц', 'Ч', 'ч', 'Џ', 'џ', 'Ш', 'ш'
    ]
  },
  {
    id: 'french',
    name: 'French',
    region: 'FR / BE / CH',
    description: 'Accents, cedilla, and ligatures (œ, æ) for French typography.',
    characters: [
      'À', 'à', 'Â', 'â', 'Ç', 'ç', 'É', 'é', 'È', 'è', 
      'Ê', 'ê', 'Ë', 'ë', 'Î', 'î', 'Ï', 'ï', 'Ô', 'ô', 
      'Ù', 'ù', 'Û', 'û', 'Ü', 'ü', 'Ÿ', 'ÿ', 'Œ', 'œ', 
      'Æ', 'æ'
    ]
  },
  {
    id: 'spanish',
    name: 'Spanish',
    region: 'ES / MX / LATAM',
    description: 'Tildes, acute vowels, eñe (Ñ/ñ) and inverted marks (¡, ¿).',
    characters: [
      'Á', 'á', 'É', 'é', 'Í', 'í', 'Ó', 'ó', 'Ú', 'ú', 
      'Ü', 'ü', 'Ñ', 'ñ', '¡', '¿'
    ]
  },
  {
    id: 'nordic',
    name: 'Nordic & Scandinavian',
    region: 'NO / SE / DK / FI / IS',
    description: 'Danish, Norwegian, Swedish, Finnish and Icelandic special letters.',
    characters: [
      'Å', 'å', 'Æ', 'æ', 'Ø', 'ø', 'Ä', 'ä', 'Ö', 'ö',
      'Ð', 'ð', 'Þ', 'þ'
    ]
  },
  {
    id: 'central_european',
    name: 'Central European',
    region: 'PL / CZ / SK / HU',
    description: 'Háčeks, ogoneks, strokes and acute marks for Polish, Czech, and Slovak.',
    characters: [
      'Ą', 'ą', 'Ć', 'ć', 'Ę', 'ę', 'Ł', 'ł', 'Ń', 'ń', 
      'Ó', 'ó', 'Ś', 'ś', 'Ź', 'ź', 'Ż', 'ż', 'Č', 'č', 
      'Ď', 'ď', 'Ě', 'ě', 'Ň', 'ň', 'Ř', 'ř', 'Š', 'š', 
      'Ť', 'ť', 'Ů', 'ů', 'Ž', 'ž'
    ]
  },
  {
    id: 'currency',
    name: 'Currency & Commercial',
    region: 'Global',
    description: 'Major monetary symbols and commercial legal indicators.',
    characters: ['€', '£', '¥', '₽', '¢', '¤', '₹', '₩', '§', '¶', '©', '®', '™']
  },
  {
    id: 'typography',
    name: 'Typographic Punctuation',
    region: 'Publishing',
    description: 'Editorial dashes, smart quotes, ellipses, and typographic bullets.',
    characters: ['—', '–', '«', '»', '„', '“', '”', '‘', '’', '…', '•', '·', '‹', '›', '†', '‡']
  }
];

/**
 * Returns the case pair of a given character.
 * For example, given 'Ä', returns ['Ä', 'ä']. Given 'ä', returns ['ä', 'Ä'].
 * Given 'ß', returns ['ß', 'ẞ'].
 */
export function getPairedCase(char: string): string[] {
  if (!char || char.length === 0) return [];

  // Special handling for German Eszett
  if (char === 'ß') return ['ß', 'ẞ'];
  if (char === 'ẞ') return ['ẞ', 'ß'];

  const upper = char.toUpperCase();
  const lower = char.toLowerCase();

  if (upper !== lower) {
    if (char === upper) {
      return [upper, lower];
    } else {
      return [lower, upper];
    }
  }

  return [char];
}

/**
 * Parses user input (characters, words, or unicode hex codes like U+00C4 or 00C4)
 * and resolves all individual unique characters with optional case pairing.
 */
export function resolveCharactersFromInput(rawInput: string, autoPairCase: boolean): string[] {
  if (!rawInput) return [];

  const trimmed = rawInput.trim();
  const results = new Set<string>();

  // Check if user entered a hex pattern like U+00C4 or 00E4
  const hexMatch = trimmed.match(/^U\+?([0-9a-fA-F]{4,6})$/i);
  if (hexMatch) {
    const codePoint = parseInt(hexMatch[1], 16);
    if (!isNaN(codePoint) && codePoint > 0) {
      const char = String.fromCodePoint(codePoint);
      if (autoPairCase) {
        getPairedCase(char).forEach(c => results.add(c));
      } else {
        results.add(char);
      }
      return Array.from(results);
    }
  }

  // Otherwise, split raw string into individual Unicode characters / codepoints
  for (const char of trimmed) {
    if (char === '\n' || char === '\r' || char === '\t') continue;
    if (autoPairCase) {
      getPairedCase(char).forEach(c => results.add(c));
    } else {
      results.add(char);
    }
  }

  return Array.from(results);
}
