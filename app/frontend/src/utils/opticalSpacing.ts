import { computeContoursBounds } from './contourUtils.ts';
import type { Point, GlyphContour } from './contourUtils.ts';
import type { Glyph } from '../types/font.ts';

export type ShapeCategory = 'stem' | 'curve' | 'diagonal' | 'open' | 'symbol';

export interface GlyphOpticalProfile {
  leftCategory: ShapeCategory;
  rightCategory: ShapeCategory;
  leftCoeff: number;
  rightCoeff: number;
  description: string;
}

// Classical Typographical Classification Table
const TYPOGRAPHICAL_LOOKUP: Record<string, { left: ShapeCategory; right: ShapeCategory; leftCoeff: number; rightCoeff: number; desc: string }> = {
  // Uppercase
  A: { left: 'diagonal', right: 'diagonal', leftCoeff: 0.30, rightCoeff: 0.30, desc: 'Diagonal / Diagonal' },
  B: { left: 'stem', right: 'curve', leftCoeff: 1.00, rightCoeff: 0.65, desc: 'Vertical Stem / Curved Bowls' },
  C: { left: 'curve', right: 'open', leftCoeff: 0.65, rightCoeff: 0.40, desc: 'Curved Bowl / Open Aperture' },
  D: { left: 'stem', right: 'curve', leftCoeff: 1.00, rightCoeff: 0.65, desc: 'Vertical Stem / Curved Bowl' },
  E: { left: 'stem', right: 'open', leftCoeff: 1.00, rightCoeff: 0.55, desc: 'Vertical Stem / Open Arms' },
  F: { left: 'stem', right: 'open', leftCoeff: 1.00, rightCoeff: 0.35, desc: 'Vertical Stem / Open Arm' },
  G: { left: 'curve', right: 'stem', leftCoeff: 0.65, rightCoeff: 0.90, desc: 'Curved Bowl / Vertical Spur' },
  H: { left: 'stem', right: 'stem', leftCoeff: 1.00, rightCoeff: 1.00, desc: 'Dual Vertical Stems' },
  I: { left: 'stem', right: 'stem', leftCoeff: 1.00, rightCoeff: 1.00, desc: 'Single Vertical Stem' },
  J: { left: 'open', right: 'stem', leftCoeff: 0.40, rightCoeff: 0.90, desc: 'Curved Tail / Vertical Stem' },
  K: { left: 'stem', right: 'diagonal', leftCoeff: 1.00, rightCoeff: 0.35, desc: 'Vertical Stem / Diagonals' },
  L: { left: 'stem', right: 'open', leftCoeff: 1.00, rightCoeff: 0.35, desc: 'Vertical Stem / Bottom Foot' },
  M: { left: 'stem', right: 'stem', leftCoeff: 0.95, rightCoeff: 0.95, desc: 'Dual Vertical Stems' },
  N: { left: 'stem', right: 'stem', leftCoeff: 1.00, rightCoeff: 0.95, desc: 'Dual Vertical Stems' },
  O: { left: 'curve', right: 'curve', leftCoeff: 0.65, rightCoeff: 0.65, desc: 'Symmetrical Curved Oval' },
  P: { left: 'stem', right: 'curve', leftCoeff: 1.00, rightCoeff: 0.65, desc: 'Vertical Stem / Top Bowl' },
  Q: { left: 'curve', right: 'diagonal', leftCoeff: 0.65, rightCoeff: 0.50, desc: 'Curved Oval / Tail' },
  R: { left: 'stem', right: 'diagonal', leftCoeff: 1.00, rightCoeff: 0.40, desc: 'Vertical Stem / Slanted Leg' },
  S: { left: 'curve', right: 'curve', leftCoeff: 0.70, rightCoeff: 0.70, desc: 'Compound Double Curves' },
  T: { left: 'open', right: 'open', leftCoeff: 0.30, rightCoeff: 0.30, desc: 'Overhanging Top Crossbar' },
  U: { left: 'stem', right: 'stem', leftCoeff: 0.95, rightCoeff: 0.95, desc: 'Dual Stems / Curved Bottom' },
  V: { left: 'diagonal', right: 'diagonal', leftCoeff: 0.25, rightCoeff: 0.25, desc: 'Slanted Diagonals' },
  W: { left: 'diagonal', right: 'diagonal', leftCoeff: 0.30, rightCoeff: 0.30, desc: 'Wide Double Diagonals' },
  X: { left: 'diagonal', right: 'diagonal', leftCoeff: 0.35, rightCoeff: 0.35, desc: 'Intersecting Diagonals' },
  Y: { left: 'diagonal', right: 'diagonal', leftCoeff: 0.30, rightCoeff: 0.30, desc: 'Diagonal Arms / Central Stem' },
  Z: { left: 'diagonal', right: 'diagonal', leftCoeff: 0.50, rightCoeff: 0.50, desc: 'Horizontal Bars / Diagonal' },

  // Lowercase
  a: { left: 'curve', right: 'stem', leftCoeff: 0.65, rightCoeff: 0.90, desc: 'Curved Bowl / Vertical Stem' },
  b: { left: 'stem', right: 'curve', leftCoeff: 1.00, rightCoeff: 0.65, desc: 'Tall Ascender / Lower Bowl' },
  c: { left: 'curve', right: 'open', leftCoeff: 0.65, rightCoeff: 0.40, desc: 'Curved Bowl / Open Gap' },
  d: { left: 'curve', right: 'stem', leftCoeff: 0.65, rightCoeff: 1.00, desc: 'Lower Bowl / Tall Ascender' },
  e: { left: 'curve', right: 'curve', leftCoeff: 0.65, rightCoeff: 0.60, desc: 'Curved Oval / Eye' },
  f: { left: 'stem', right: 'open', leftCoeff: 0.85, rightCoeff: 0.35, desc: 'Vertical Stem / Overhang Hook' },
  g: { left: 'curve', right: 'curve', leftCoeff: 0.65, rightCoeff: 0.65, desc: 'Curved Bowls / Loop' },
  h: { left: 'stem', right: 'stem', leftCoeff: 1.00, rightCoeff: 0.95, desc: 'Tall Stem / Arch & Foot' },
  i: { left: 'stem', right: 'stem', leftCoeff: 1.00, rightCoeff: 1.00, desc: 'Single Vertical Stem' },
  j: { left: 'open', right: 'stem', leftCoeff: 0.40, rightCoeff: 0.90, desc: 'Bottom Hook / Stem' },
  k: { left: 'stem', right: 'diagonal', leftCoeff: 1.00, rightCoeff: 0.35, desc: 'Tall Stem / Diagonals' },
  l: { left: 'stem', right: 'stem', leftCoeff: 1.00, rightCoeff: 1.00, desc: 'Single Vertical Ascender' },
  m: { left: 'stem', right: 'stem', leftCoeff: 0.95, rightCoeff: 0.95, desc: 'Triple Stems' },
  n: { left: 'stem', right: 'stem', leftCoeff: 1.00, rightCoeff: 0.95, desc: 'Stem / Arch & Foot' },
  o: { left: 'curve', right: 'curve', leftCoeff: 0.65, rightCoeff: 0.65, desc: 'Symmetrical Curved Oval' },
  p: { left: 'stem', right: 'curve', leftCoeff: 1.00, rightCoeff: 0.65, desc: 'Descender Stem / Bowl' },
  q: { left: 'curve', right: 'stem', leftCoeff: 0.65, rightCoeff: 1.00, desc: 'Bowl / Descender Stem' },
  r: { left: 'stem', right: 'open', leftCoeff: 1.00, rightCoeff: 0.40, desc: 'Stem / Outward Ear' },
  s: { left: 'curve', right: 'curve', leftCoeff: 0.70, rightCoeff: 0.70, desc: 'Compound Double Curves' },
  t: { left: 'open', right: 'open', leftCoeff: 0.60, rightCoeff: 0.50, desc: 'Crossbar / Curved Tail' },
  u: { left: 'stem', right: 'stem', leftCoeff: 0.95, rightCoeff: 1.00, desc: 'Stems / Bottom Curve' },
  v: { left: 'diagonal', right: 'diagonal', leftCoeff: 0.25, rightCoeff: 0.25, desc: 'Slanted Diagonals' },
  w: { left: 'diagonal', right: 'diagonal', leftCoeff: 0.30, rightCoeff: 0.30, desc: 'Double Diagonals' },
  x: { left: 'diagonal', right: 'diagonal', leftCoeff: 0.35, rightCoeff: 0.35, desc: 'Intersecting Diagonals' },
  y: { left: 'diagonal', right: 'diagonal', leftCoeff: 0.25, rightCoeff: 0.35, desc: 'Diagonals / Tail' },
  z: { left: 'diagonal', right: 'diagonal', leftCoeff: 0.50, rightCoeff: 0.50, desc: 'Horizontal Bars / Diagonal' },

  // Numbers
  '0': { left: 'curve', right: 'curve', leftCoeff: 0.65, rightCoeff: 0.65, desc: 'Curved Oval' },
  '1': { left: 'open', right: 'stem', leftCoeff: 0.55, rightCoeff: 0.95, desc: 'Slanted Beak / Stem' },
  '2': { left: 'curve', right: 'diagonal', leftCoeff: 0.65, rightCoeff: 0.50, desc: 'Curved Head / Base Bar' },
  '3': { left: 'curve', right: 'curve', leftCoeff: 0.60, rightCoeff: 0.65, desc: 'Curved Head / Lower Bowl' },
  '4': { left: 'diagonal', right: 'stem', leftCoeff: 0.30, rightCoeff: 0.85, desc: 'Open Triangle / Stem' },
  '5': { left: 'stem', right: 'curve', leftCoeff: 0.80, rightCoeff: 0.65, desc: 'Upper Bar / Lower Bowl' },
  '6': { left: 'curve', right: 'curve', leftCoeff: 0.65, rightCoeff: 0.65, desc: 'Curved Back / Lower Bowl' },
  '7': { left: 'diagonal', right: 'diagonal', leftCoeff: 0.40, rightCoeff: 0.30, desc: 'Top Bar / Diagonal Leg' },
  '8': { left: 'curve', right: 'curve', leftCoeff: 0.65, rightCoeff: 0.65, desc: 'Double Curved Bowls' },
  '9': { left: 'curve', right: 'curve', leftCoeff: 0.65, rightCoeff: 0.65, desc: 'Upper Bowl / Curved Tail' },

  // Common Punctuation & Symbols
  '.': { left: 'symbol', right: 'symbol', leftCoeff: 0.80, rightCoeff: 0.80, desc: 'Period' },
  ',': { left: 'symbol', right: 'symbol', leftCoeff: 0.70, rightCoeff: 0.60, desc: 'Comma' },
  ':': { left: 'symbol', right: 'symbol', leftCoeff: 0.80, rightCoeff: 0.80, desc: 'Colon' },
  ';': { left: 'symbol', right: 'symbol', leftCoeff: 0.70, rightCoeff: 0.65, desc: 'Semicolon' },
  '-': { left: 'symbol', right: 'symbol', leftCoeff: 0.50, rightCoeff: 0.50, desc: 'Hyphen' },
  '!': { left: 'stem', right: 'stem', leftCoeff: 0.90, rightCoeff: 0.90, desc: 'Exclamation Mark' },
  '?': { left: 'curve', right: 'open', leftCoeff: 0.65, rightCoeff: 0.45, desc: 'Question Mark' },
  '(': { left: 'curve', right: 'open', leftCoeff: 0.50, rightCoeff: 0.40, desc: 'Open Parenthesis' },
  ')': { left: 'open', right: 'curve', leftCoeff: 0.40, rightCoeff: 0.50, desc: 'Close Parenthesis' },
};

/**
 * Geometric Silhouette Analyzer:
 * For non-standard characters, inspects contour point distribution along vertical slices
 * to identify whether the left and right silhouettes act as flat stems, curves, or diagonals.
 */
export function analyzeContourSilhouette(contours: GlyphContour[]): { leftCategory: ShapeCategory; rightCategory: ShapeCategory; leftCoeff: number; rightCoeff: number; description: string } {
  if (!contours || contours.length === 0) {
    return {
      leftCategory: 'stem',
      rightCategory: 'stem',
      leftCoeff: 1.0,
      rightCoeff: 1.0,
      description: 'Default (Empty Outlines)'
    };
  }

  const bounds = computeContoursBounds(contours);
  const height = bounds.height;
  const width = bounds.width;

  if (height <= 0 || width <= 0) {
    return {
      leftCategory: 'stem',
      rightCategory: 'stem',
      leftCoeff: 1.0,
      rightCoeff: 1.0,
      description: 'Default (Zero Size)'
    };
  }

  // Sample horizontal bounds across 5 vertical slices (from 20% to 80% height)
  const sliceY = [0.25, 0.50, 0.75].map(ratio => bounds.minY + ratio * height);
  const minXSlice: number[] = [];
  const maxXSlice: number[] = [];

  sliceY.forEach(y => {
    let minX = Infinity;
    let maxX = -Infinity;

    contours.forEach(c => {
      for (let i = 0; i < c.length; i++) {
        const p1 = c[i];
        const p2 = c[(i + 1) % c.length];

        if ((p1.y <= y && p2.y >= y) || (p2.y <= y && p1.y >= y)) {
          const dy = p2.y - p1.y;
          const t = Math.abs(dy) < 0.0001 ? 0.5 : (y - p1.y) / dy;
          const x = p1.x + t * (p2.x - p1.x);
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }
      }
    });

    minXSlice.push(minX === Infinity ? bounds.minX : minX);
    maxXSlice.push(maxX === -Infinity ? bounds.maxX : maxX);
  });

  // Evaluate Left Edge Silhouette
  let leftCategory: ShapeCategory = 'stem';
  let leftCoeff = 1.0;

  const leftVariance = Math.max(...minXSlice) - Math.min(...minXSlice);
  if (leftVariance < 0.06 * width) {
    // Nearly perfectly straight vertical wall
    leftCategory = 'stem';
    leftCoeff = 1.0;
  } else if (minXSlice[1] < minXSlice[0] && minXSlice[1] < minXSlice[2]) {
    // Convex bow in the middle -> Curved shape
    leftCategory = 'curve';
    leftCoeff = 0.65;
  } else {
    // Slanted or wide gap
    leftCategory = 'diagonal';
    leftCoeff = 0.35;
  }

  // Evaluate Right Edge Silhouette
  let rightCategory: ShapeCategory = 'stem';
  let rightCoeff = 1.0;

  const rightVariance = Math.max(...maxXSlice) - Math.min(...maxXSlice);
  if (rightVariance < 0.06 * width) {
    rightCategory = 'stem';
    rightCoeff = 1.0;
  } else if (maxXSlice[1] > maxXSlice[0] && maxXSlice[1] > maxXSlice[2]) {
    rightCategory = 'curve';
    rightCoeff = 0.65;
  } else {
    rightCategory = 'diagonal';
    rightCoeff = 0.35;
  }

  return {
    leftCategory,
    rightCategory,
    leftCoeff,
    rightCoeff,
    description: `Silhouette (${leftCategory} / ${rightCategory})`
  };
}

/**
 * Returns optical profile for a character.
 * Uses typographical rules if known; otherwise analyzes vector silhouette geometry.
 */
export function getOpticalProfile(char: string, contours?: GlyphContour[]): GlyphOpticalProfile {
  if (TYPOGRAPHICAL_LOOKUP[char]) {
    const item = TYPOGRAPHICAL_LOOKUP[char];
    return {
      leftCategory: item.left,
      rightCategory: item.right,
      leftCoeff: item.leftCoeff,
      rightCoeff: item.rightCoeff,
      description: item.desc
    };
  }

  if (contours && contours.length > 0) {
    return analyzeContourSilhouette(contours);
  }

  // Fallback generic
  return {
    leftCategory: 'stem',
    rightCategory: 'stem',
    leftCoeff: 1.0,
    rightCoeff: 1.0,
    description: 'Standard Neutral'
  };
}

/**
 * Calculates proposed optical sidebearings, advance width, and required contour translation X shift.
 */
export function calculateOpticalSpacing(params: {
  char: string;
  glyph: Glyph;
  basePadding: number;
  contours?: GlyphContour[];
}): {
  proposedLsb: number;
  proposedRsb: number;
  proposedAdvance: number;
  artworkWidth: number;
  shiftX: number;
  profile: GlyphOpticalProfile;
} {
  const { char, glyph, basePadding, contours } = params;
  const profile = getOpticalProfile(char, contours);

  let artworkWidth = 0;
  let currentMinX = glyph.lsb || 0;

  if (contours && contours.length > 0) {
    const bounds = computeContoursBounds(contours);
    artworkWidth = bounds.width;
    currentMinX = bounds.minX;
  } else if (glyph.advanceWidth > 0) {
    artworkWidth = Math.max(0, glyph.advanceWidth - (glyph.lsb + glyph.rsb));
  }

  // Calculate optical sidebearings with minimum clearance floor of 5 units
  const proposedLsb = Math.max(5, Math.round(basePadding * profile.leftCoeff));
  const proposedRsb = Math.max(5, Math.round(basePadding * profile.rightCoeff));
  const proposedAdvance = Math.round(proposedLsb + artworkWidth + proposedRsb);
  const shiftX = Math.round(proposedLsb - currentMinX);

  return {
    proposedLsb,
    proposedRsb,
    proposedAdvance,
    artworkWidth,
    shiftX,
    profile
  };
}
