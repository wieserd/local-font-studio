import * as opentypeModule from 'opentype.js';
import type { ProjectState } from '../types/font.ts';
import { parseSvgPathToContours } from './contourUtils.ts';

// Universal ESM / CJS opentype resolution
const rawModule: Record<string, any> = opentypeModule;
const opentype: any = rawModule.Font ? rawModule : rawModule['default'];

export interface ExportFontOptions {
  format: 'ttf' | 'otf';
  includeKerning: boolean;
  includeLigatures?: boolean;
  runValidation?: boolean;
  filename?: string;
}

export interface ExportResult {
  success: boolean;
  filename: string;
  byteLength: number;
  glyphCount: number;
  blobUrl: string;
  error?: string;
}

/**
 * Compiles active project state into an installable desktop font binary (.otf / .ttf)
 * and triggers a browser file download.
 */
export function buildAndDownloadFont(
  project: ProjectState,
  options: ExportFontOptions
): ExportResult {
  try {
    const metrics = project.metrics;
    const upm = metrics.upm || 1000;
    const capHeight = metrics.capHeight || 700;
    const defaultAdvance = metrics.defaultAdvance || 600;

    // 1. Create standard .notdef glyph (Index 0 in all OpenType / TrueType fonts)
    const notdefPath = new opentype.Path();
    const notdefWidth = Math.round(defaultAdvance * 0.65);
    const notdefX = Math.round((defaultAdvance - notdefWidth) / 2);
    
    // Outer frame
    notdefPath.moveTo(notdefX, 0);
    notdefPath.lineTo(notdefX + notdefWidth, 0);
    notdefPath.lineTo(notdefX + notdefWidth, capHeight);
    notdefPath.lineTo(notdefX, capHeight);
    notdefPath.close();

    // Inner cutout
    const pad = 40;
    if (notdefWidth > pad * 2 && capHeight > pad * 2) {
      notdefPath.moveTo(notdefX + pad, pad);
      notdefPath.lineTo(notdefX + pad, capHeight - pad);
      notdefPath.lineTo(notdefX + notdefWidth - pad, capHeight - pad);
      notdefPath.lineTo(notdefX + notdefWidth - pad, pad);
      notdefPath.close();
    }

    const notdefGlyph = new opentype.Glyph({
      name: '.notdef',
      unicode: 0,
      advanceWidth: defaultAdvance,
      path: notdefPath,
    });

    const fontGlyphs: opentype.Glyph[] = [notdefGlyph];
    const glyphsMap = project.glyphs || {};

    // 2. Ensure Space glyph (Unicode 32) exists with accurate word spacing
    const spaceGlyphData = glyphsMap[' '];
    const spaceAdvance = Math.max(10, Math.round(spaceGlyphData?.advanceWidth || metrics.spaceWidth || 280));
    fontGlyphs.push(new opentype.Glyph({
      name: 'space',
      unicode: 32,
      advanceWidth: spaceAdvance,
      path: new opentype.Path(),
    }));

    // 3. Convert all assigned project glyphs to opentype.Glyph
    Object.values(glyphsMap).forEach((g) => {
      if (g.char === ' ') return; // Already encoded as clean empty glyph above

      if (!g.isAssigned || !g.svgPath) {
        return;
      }

      const charCode = g.char.charCodeAt(0);
      const scaleRatio = (g.scale || 100) / 100;
      const xOffset = g.xOffset || 0;
      const yOffset = g.yOffset || 0;

      // Extract contours (either stored or parsed from svgPath)
      const contours = (g.contours && g.contours.length > 0)
        ? g.contours
        : parseSvgPathToContours(g.svgPath);

      const path = new opentype.Path();

      contours.forEach((contour) => {
        if (contour.length < 2) return;

        const startX = Math.round((contour[0].x * scaleRatio) + xOffset);
        const startY = Math.round((contour[0].y * scaleRatio) + yOffset);
        path.moveTo(startX, startY);

        for (let i = 1; i < contour.length; i++) {
          const ptX = Math.round((contour[i].x * scaleRatio) + xOffset);
          const ptY = Math.round((contour[i].y * scaleRatio) + yOffset);
          path.lineTo(ptX, ptY);
        }

        path.close();
      });

      const advWidth = Math.round((g.advanceWidth || defaultAdvance) * scaleRatio);

      const opentypeGlyph = new opentype.Glyph({
        name: g.name || g.char,
        unicode: charCode,
        advanceWidth: Math.max(10, advWidth),
        path,
      });

      fontGlyphs.push(opentypeGlyph);
    });

    // 4. Instantiate OpenType font
    const familyName = project.name || project.metadata?.family || 'My Typeface';
    const styleName = project.metadata?.style || 'Regular';

    const font = new opentype.Font({
      familyName,
      styleName,
      unitsPerEm: upm,
      ascender: metrics.ascender || 800,
      descender: metrics.descender || -200,
      glyphs: fontGlyphs,
    });

    // 5. Apply GPOS kerning pairs if enabled
    if (options.includeKerning && Array.isArray(project.kerningPairs)) {
      const kerningObj: Record<string, number> = {};
      project.kerningPairs.forEach((pair) => {
        const leftIdx = font.charToGlyphIndex(pair.left);
        const rightIdx = font.charToGlyphIndex(pair.right);
        if (leftIdx > 0 && rightIdx > 0) {
          kerningObj[`${leftIdx},${rightIdx}`] = pair.value;
        }
      });
      font.kerningPairs = kerningObj;
    }

    // 6. Compile into ArrayBuffer
    const arrayBuffer = font.toArrayBuffer();
    const byteLength = arrayBuffer.byteLength;

    // 7. Generate clean downloadable filename
    const sanitizedFamily = familyName.replace(/[^a-zA-Z0-9_-]/g, '-');
    const sanitizedStyle = styleName.replace(/[^a-zA-Z0-9_-]/g, '-');
    const extension = options.format === 'ttf' ? 'ttf' : 'otf';
    const proposedName = options.filename || `${sanitizedFamily}-${sanitizedStyle}.${extension}`;

    // 8. Trigger real browser file download
    const mimeType = options.format === 'ttf' ? 'font/ttf' : 'font/otf';
    const blob = new Blob([arrayBuffer], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = proposedName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    return {
      success: true,
      filename: proposedName,
      byteLength,
      glyphCount: fontGlyphs.length,
      blobUrl,
    };
  } catch (err: any) {
    console.error('Failed to compile font binary:', err);
    return {
      success: false,
      filename: options.filename || 'font.otf',
      byteLength: 0,
      glyphCount: 0,
      blobUrl: '',
      error: err?.message || String(err),
    };
  }
}
