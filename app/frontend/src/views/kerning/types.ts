import { KerningPair, Glyph } from '../../types/font';

export interface KerningPairItem extends KerningPair {
  id: string; // e.g. "A:V"
}

export type KerningTool = 'select' | 'adjust' | 'classes' | 'optical' | 'swap' | 'stream';
