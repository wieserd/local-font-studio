export interface Glyph {
  char: string;
  name: string;
  unicode: string;
  isAssigned: boolean;
  advanceWidth: number;
  lsb: number;
  rsb: number;
  xOffset?: number;
  yOffset: number;
  bitmapXOffset?: number;
  bitmapYOffset?: number;
  bitmapScale?: number;
  scale: number;
  svgPath: string; // SVG path d="..." in font coordinate space (1000 UPM)
  originalImage?: string; // Data URL of the source bitmap
  contours?: Array<Array<{ x: number; y: number }>>;
}

export interface FontMetrics {
  upm: number;
  ascender: number;
  descender: number;
  capHeight: number;
  xHeight: number;
  lineGap: number;
  defaultAdvance: number;
  defaultLsb: number;
  defaultRsb: number;
  spaceWidth?: number; // Word space width (U+0020, default 280)
}

export interface KerningPair {
  left: string;
  right: string;
  value: number; // in font units (negative = tighter)
}

export interface FontMetadata {
  family: string;
  style: string;
  designer: string;
  manufacturer: string;
  version: string;
  vendorId: string;
  copyright: string;
  license: string;
}

export interface FontStyleState {
  id: string;
  name: string;
  weightClass: number; // 100 to 900 (e.g. 400 = Regular, 700 = Bold)
  isItalic: boolean;
  metrics: FontMetrics;
  glyphs: Record<string, Glyph>;
  kerningPairs: KerningPair[];
  lastModified: number;
}

export interface ProjectState {
  id: string;
  name: string;
  metadata: FontMetadata;
  activeStyleId: string;
  styles: Record<string, FontStyleState>;
  metrics: FontMetrics;
  glyphs: Record<string, Glyph>;
  kerningPairs: KerningPair[];
  lastModified: number;
}
