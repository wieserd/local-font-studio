import type { Point, GlyphContour } from './contourUtils.ts';
import { contoursToSvgPath, computeContoursBounds, parseSvgPathToContours } from './contourUtils.ts';
import type { FontMetrics } from '../types/font.ts';

export interface SvgImportResult {
  success: boolean;
  svgPath: string;
  advanceWidth: number;
  lsb: number;
  rsb: number;
  isFontNative: boolean;
  warnings?: string[];
  error?: string;
}

/**
 * Parses SVG path data (including M, L, H, V, C, S, Q, Z and relative commands)
 * into an array of polygonal contours.
 */
export function parseSvgPathStringToContours(d: string): GlyphContour[] {
  if (!d || !d.trim()) return [];

  const contours: GlyphContour[] = [];
  let currentContour: Point[] = [];
  let currentX = 0;
  let currentY = 0;
  let startX = 0;
  let startY = 0;

  // Normalize path string: separate letters and numbers with spaces
  const tokens: string[] = [];
  const regex = /([a-df-z])|([-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?)/gi;
  let match;
  while ((match = regex.exec(d)) !== null) {
    tokens.push(match[0]);
  }

  let i = 0;
  let lastCmd = '';

  const getNum = (): number => {
    if (i >= tokens.length) return 0;
    const val = parseFloat(tokens[i++]);
    return isNaN(val) ? 0 : val;
  };

  const isCmd = (token: string) => /^[a-z]$/i.test(token);

  while (i < tokens.length) {
    let cmd = tokens[i];
    if (isCmd(cmd)) {
      i++;
      lastCmd = cmd;
    } else {
      // Repeated coordinate with implicit command
      cmd = lastCmd === 'M' ? 'L' : lastCmd === 'm' ? 'l' : lastCmd;
    }

    switch (cmd) {
      case 'M': {
        if (currentContour.length > 0) {
          contours.push(currentContour);
          currentContour = [];
        }
        currentX = getNum();
        currentY = getNum();
        startX = currentX;
        startY = currentY;
        currentContour.push({ x: currentX, y: currentY });
        lastCmd = 'M';
        break;
      }
      case 'm': {
        if (currentContour.length > 0) {
          contours.push(currentContour);
          currentContour = [];
        }
        currentX += getNum();
        currentY += getNum();
        startX = currentX;
        startY = currentY;
        currentContour.push({ x: currentX, y: currentY });
        lastCmd = 'm';
        break;
      }
      case 'L': {
        currentX = getNum();
        currentY = getNum();
        currentContour.push({ x: currentX, y: currentY });
        break;
      }
      case 'l': {
        currentX += getNum();
        currentY += getNum();
        currentContour.push({ x: currentX, y: currentY });
        break;
      }
      case 'H': {
        currentX = getNum();
        currentContour.push({ x: currentX, y: currentY });
        break;
      }
      case 'h': {
        currentX += getNum();
        currentContour.push({ x: currentX, y: currentY });
        break;
      }
      case 'V': {
        currentY = getNum();
        currentContour.push({ x: currentX, y: currentY });
        break;
      }
      case 'v': {
        currentY += getNum();
        currentContour.push({ x: currentX, y: currentY });
        break;
      }
      case 'C': {
        // Cubic bezier: x1 y1, x2 y2, x y
        const x1 = getNum();
        const y1 = getNum();
        const x2 = getNum();
        const y2 = getNum();
        const endX = getNum();
        const endY = getNum();

        // Sample 4 intermediate points along the bezier curve
        for (let step = 1; step <= 4; step++) {
          const t = step / 4;
          const u = 1 - t;
          const px = u * u * u * currentX + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * endX;
          const py = u * u * u * currentY + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * endY;
          currentContour.push({ x: Math.round(px), y: Math.round(py) });
        }

        currentX = endX;
        currentY = endY;
        break;
      }
      case 'c': {
        const x1 = currentX + getNum();
        const y1 = currentY + getNum();
        const x2 = currentX + getNum();
        const y2 = currentY + getNum();
        const endX = currentX + getNum();
        const endY = currentY + getNum();

        for (let step = 1; step <= 4; step++) {
          const t = step / 4;
          const u = 1 - t;
          const px = u * u * u * currentX + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * endX;
          const py = u * u * u * currentY + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * endY;
          currentContour.push({ x: Math.round(px), y: Math.round(py) });
        }

        currentX = endX;
        currentY = endY;
        break;
      }
      case 'Q': {
        // Quadratic bezier: x1 y1, x y
        const x1 = getNum();
        const y1 = getNum();
        const endX = getNum();
        const endY = getNum();

        for (let step = 1; step <= 3; step++) {
          const t = step / 3;
          const u = 1 - t;
          const px = u * u * currentX + 2 * u * t * x1 + t * t * endX;
          const py = u * u * currentY + 2 * u * t * y1 + t * t * endY;
          currentContour.push({ x: Math.round(px), y: Math.round(py) });
        }

        currentX = endX;
        currentY = endY;
        break;
      }
      case 'q': {
        const x1 = currentX + getNum();
        const y1 = currentY + getNum();
        const endX = currentX + getNum();
        const endY = currentY + getNum();

        for (let step = 1; step <= 3; step++) {
          const t = step / 3;
          const u = 1 - t;
          const px = u * u * currentX + 2 * u * t * x1 + t * t * endX;
          const py = u * u * currentY + 2 * u * t * y1 + t * t * endY;
          currentContour.push({ x: Math.round(px), y: Math.round(py) });
        }

        currentX = endX;
        currentY = endY;
        break;
      }
      case 'Z':
      case 'z': {
        if (currentContour.length > 0) {
          contours.push(currentContour);
          currentContour = [];
        }
        currentX = startX;
        currentY = startY;
        break;
      }
      default: {
        // Unknown command or coordinate argument, consume and continue
        getNum();
        break;
      }
    }
  }

  if (currentContour.length > 0) {
    contours.push(currentContour);
  }

  return contours;
}

/**
 * Extracts and maps raw SVG text into a font glyph vector path and typography metrics.
 */
export function parseSvgToGlyphPath(
  svgString: string,
  metrics: FontMetrics
): SvgImportResult {
  try {
    if (!svgString || !svgString.trim()) {
      return { success: false, svgPath: '', advanceWidth: 600, lsb: 40, rsb: 40, isFontNative: false, error: 'Empty SVG content' };
    }

    const upm = metrics.upm || 1000;
    const ascender = metrics.ascender || 800;
    const defaultAdvance = metrics.defaultAdvance || 600;
    const defaultLsb = metrics.defaultLsb || 40;

    // Check if the SVG was exported by Local Font Studio or is a font-native SVG with transform="scale(1, -1)"
    const isFontNative = (
      svgString.includes('scale(1, -1)') ||
      svgString.includes('scale(1,-1)') ||
      svgString.includes('Generated by Local Font Studio')
    );

    // Parse viewBox width and height if present
    const viewBoxMatch = svgString.match(/viewBox=["']\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*["']/i);
    let vbWidth = viewBoxMatch ? parseFloat(viewBoxMatch[3]) : defaultAdvance;
    let vbHeight = viewBoxMatch ? parseFloat(viewBoxMatch[4]) : upm;

    // Collect all path d attributes
    const pathDRegex = /<path[^>]*\bd=["']([^"']+)["']/gi;
    const dSegments: string[] = [];
    let pMatch;
    while ((pMatch = pathDRegex.exec(svgString)) !== null) {
      if (pMatch[1] && pMatch[1].trim()) {
        dSegments.push(pMatch[1].trim());
      }
    }

    // Also look for polygon points
    const polygonRegex = /<polygon[^>]*\bpoints=["']([^"']+)["']/gi;
    while ((pMatch = polygonRegex.exec(svgString)) !== null) {
      const pts = pMatch[1].trim().split(/[\s,]+/);
      if (pts.length >= 4) {
        let pathD = `M ${pts[0]} ${pts[1]}`;
        for (let k = 2; k < pts.length; k += 2) {
          pathD += ` L ${pts[k]} ${pts[k + 1]}`;
        }
        pathD += ' Z';
        dSegments.push(pathD);
      }
    }

    if (dSegments.length === 0) {
      return {
        success: false,
        svgPath: '',
        advanceWidth: defaultAdvance,
        lsb: defaultLsb,
        rsb: defaultLsb,
        isFontNative: false,
        error: 'No vector <path> or <polygon> elements found in SVG.'
      };
    }

    // If it's already font-native (where coordinates are in font space with y-up baseline at 0):
    if (isFontNative) {
      const combinedD = dSegments.join(' ');
      const contours = parseSvgPathToContours(combinedD);
      if (contours.length > 0) {
        const bounds = computeContoursBounds(contours);
        const advanceWidth = Math.max(10, Math.round(vbWidth || bounds.maxX + defaultLsb));
        const lsb = bounds.minX;
        const rsb = Math.max(0, advanceWidth - bounds.maxX);
        return {
          success: true,
          svgPath: combinedD,
          advanceWidth,
          lsb,
          rsb,
          isFontNative: true
        };
      }
    }

    // For standard screen graphic SVGs (origin at top-left, y points down):
    // Parse all segments into contours
    let allContours: GlyphContour[] = [];
    for (const d of dSegments) {
      const cList = parseSvgPathStringToContours(d);
      allContours = allContours.concat(cList);
    }

    if (allContours.length === 0) {
      return {
        success: false,
        svgPath: '',
        advanceWidth: defaultAdvance,
        lsb: defaultLsb,
        rsb: defaultLsb,
        isFontNative: false,
        error: 'Could not extract contour vertices from SVG paths.'
      };
    }

    // Calculate source artwork bounding box
    const srcBounds = computeContoursBounds(allContours);
    if (srcBounds.width === 0 || srcBounds.height === 0) {
      return {
        success: false,
        svgPath: '',
        advanceWidth: defaultAdvance,
        lsb: defaultLsb,
        rsb: defaultLsb,
        isFontNative: false,
        error: 'SVG artwork has empty dimensions.'
      };
    }

    // Scale artwork to fit standard font capHeight (e.g. 700 font units)
    const targetHeight = Math.min(metrics.capHeight || 700, 720);
    const scale = targetHeight / srcBounds.height;
    const scaledWidth = Math.round(srcBounds.width * scale);

    // Flip Y and position baseline at y = 0
    // In SVG, srcBounds.maxY is the bottom of the shape.
    // In Font coordinates, we want the bottom of the shape on or slightly above baseline 0.
    const fontContours: GlyphContour[] = allContours.map(contour =>
      contour.map(pt => ({
        x: Math.round(defaultLsb + (pt.x - srcBounds.minX) * scale),
        y: Math.round((srcBounds.maxY - pt.y) * scale)
      }))
    );

    const fontSvgPath = contoursToSvgPath(fontContours);
    const advanceWidth = Math.round(defaultLsb + scaledWidth + defaultLsb);
    const lsb = defaultLsb;
    const rsb = defaultLsb;

    return {
      success: true,
      svgPath: fontSvgPath,
      advanceWidth,
      lsb,
      rsb,
      isFontNative: false
    };
  } catch (err: any) {
    return {
      success: false,
      svgPath: '',
      advanceWidth: metrics.defaultAdvance || 600,
      lsb: 40,
      rsb: 40,
      isFontNative: false,
      error: err?.message || String(err)
    };
  }
}
