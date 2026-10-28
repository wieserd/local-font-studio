import type { Glyph, FontMetrics, KerningPair } from '../types/font.ts';

export interface TypesetChar {
  char: string;
  isAssigned: boolean;
  advancePx: number;
  kernFontUnits: number;
  scaleFactor: number;
  glyphScale: number;
  xOffsetPx: number;
  yOffsetPx: number;
  baselineY: number;
  svgPath: string;
  glyph?: Glyph;
}

export interface TypesetWord {
  id: string;
  chars: TypesetChar[];
  wordWidthPx: number;
}

export interface TypesetToken {
  type: 'word' | 'space';
  raw: string;
  word?: TypesetWord;
  widthPx: number;
}

export interface TypesetParagraph {
  id: string;
  tokens: TypesetToken[];
}

export interface TypesetOptions {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  enableKerning: boolean;
}

export interface CoverageAudit {
  totalUnique: number;
  coveredChars: string[];
  missingChars: string[];
  coveragePercent: number;
}

/**
 * Tokenize and typeset arbitrary text using project font metrics, glyph vectors, and kerning.
 */
export function typesetText(
  text: string,
  glyphs: Record<string, Glyph>,
  metrics: FontMetrics,
  kerningPairs: KerningPair[],
  options: TypesetOptions
): TypesetParagraph[] {
  const upm = metrics.upm || 1000;
  const scaleFactor = options.fontSize / upm;
  const lineHeightPx = options.fontSize * options.lineHeight;
  const halfLeading = ((options.lineHeight - 1) * options.fontSize) / 2;
  const baselineY = halfLeading + (metrics.ascender * options.fontSize) / upm;

  // Build kerning lookup map for O(1) pair queries
  const kerningMap = new Map<string, number>();
  if (options.enableKerning && Array.isArray(kerningPairs)) {
    for (const pair of kerningPairs) {
      kerningMap.set(`${pair.left}:${pair.right}`, pair.value);
    }
  }

  const rawParagraphs = text.split('\n');

  return rawParagraphs.map((paragraphStr, pIdx) => {
    // Match consecutive non-whitespace or whitespace
    const matches = paragraphStr.match(/\S+|\s+/g) || [];
    const tokens: TypesetToken[] = [];

    matches.forEach((tokenStr, tIdx) => {
      const isWhitespace = /^\s+$/.test(tokenStr);

      if (isWhitespace) {
        const spaceGlyph = glyphs[' '];
        const spaceWidthUnits = (spaceGlyph && spaceGlyph.advanceWidth)
          ? spaceGlyph.advanceWidth
          : (metrics.spaceWidth || 280);
        const spaceAdvance = spaceWidthUnits * scaleFactor;
        const totalSpaceWidth = (spaceAdvance + options.letterSpacing) * tokenStr.length;
        tokens.push({
          type: 'space',
          raw: tokenStr,
          widthPx: Math.max(3, totalSpaceWidth),
        });
      } else {
        const chars = tokenStr.split('');
        let totalWordWidth = 0;

        const typesetChars: TypesetChar[] = chars.map((char, cIdx) => {
          const nextChar = cIdx < chars.length - 1 ? chars[cIdx + 1] : null;
          const kernFontUnits = (nextChar && options.enableKerning)
            ? (kerningMap.get(`${char}:${nextChar}`) || 0)
            : 0;

          const glyph = glyphs[char];
          const isAssigned = Boolean(glyph && glyph.isAssigned && glyph.svgPath);

          const rawAdvance = glyph?.advanceWidth ?? metrics.defaultAdvance ?? 600;
          const effectiveAdvance = rawAdvance + kernFontUnits;
          const advancePx = Math.max(1, (effectiveAdvance * scaleFactor) + options.letterSpacing);

          totalWordWidth += advancePx;

          const glyphScale = (glyph?.scale || 100) / 100;
          const xOffsetPx = (glyph?.xOffset || 0) * scaleFactor;
          const yOffsetPx = (glyph?.yOffset || 0) * scaleFactor;

          return {
            char,
            isAssigned,
            advancePx,
            kernFontUnits,
            scaleFactor,
            glyphScale,
            xOffsetPx,
            yOffsetPx,
            baselineY,
            svgPath: glyph?.svgPath || '',
            glyph,
          };
        });

        tokens.push({
          type: 'word',
          raw: tokenStr,
          word: {
            id: `w-${pIdx}-${tIdx}`,
            chars: typesetChars,
            wordWidthPx: totalWordWidth,
          },
          widthPx: totalWordWidth,
        });
      }
    });

    return {
      id: `p-${pIdx}`,
      tokens,
    };
  });
}

/**
 * Audits sample text against the font project glyph inventory.
 */
export function auditSampleTextCoverage(
  text: string,
  glyphs: Record<string, Glyph>
): CoverageAudit {
  const cleanChars = text.replace(/\s+/g, '').split('');
  const uniqueSet = new Set(cleanChars);
  const uniqueChars = Array.from(uniqueSet);

  const coveredChars: string[] = [];
  const missingChars: string[] = [];

  for (const char of uniqueChars) {
    const glyph = glyphs[char];
    if (glyph && glyph.isAssigned && glyph.svgPath) {
      coveredChars.push(char);
    } else {
      missingChars.push(char);
    }
  }

  const totalUnique = uniqueChars.length;
  const coveragePercent = totalUnique > 0
    ? Math.round((coveredChars.length / totalUnique) * 100)
    : 100;

  return {
    totalUnique,
    coveredChars: coveredChars.sort(),
    missingChars: missingChars.sort(),
    coveragePercent,
  };
}
