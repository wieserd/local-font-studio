import { Glyph } from '../../types/font';

export type ViewMode = 'split' | 'string' | 'table' | 'vertical';
export type CategoryFilter = 'all' | 'uppercase' | 'lowercase' | 'numbers' | 'symbols' | 'assigned';

export interface GlyphMetricData {
  char: string;
  glyph: Glyph;
  hasArtwork: boolean;
  artworkWidth: number;
  lsb: number;
  rsb: number;
  advanceWidth: number;
  category: 'uppercase' | 'lowercase' | 'numbers' | 'symbols';
}

export function getCategory(char: string): 'uppercase' | 'lowercase' | 'numbers' | 'symbols' {
  if (/[A-Z]/.test(char)) return 'uppercase';
  if (/[a-z]/.test(char)) return 'lowercase';
  if (/[0-9]/.test(char)) return 'numbers';
  return 'symbols';
}
