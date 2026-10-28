/**
 * Vector Tracing Engine
 * Converts bitmap images to clean vector paths mapped to font coordinate space.
 */

export interface Point {
  x: number;
  y: number;
}

export interface TracingOptions {
  threshold: number;
  simplification: number; // Douglas-peucker epsilon (e.g. 1.0 to 3.0)
  smoothing: number;
  upm: number;
  capHeight: number;
  baseline: number;
}

/**
 * Douglas-Peucker Polygon Simplification
 */
export const simplifyPoints = (points: Point[], epsilon: number): Point[] => {
  if (points.length <= 2) return points;

  let dmax = 0;
  let index = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i], points[0], points[end]);
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }

  if (dmax > epsilon) {
    const rec1 = simplifyPoints(points.slice(0, index + 1), epsilon);
    const rec2 = simplifyPoints(points.slice(index), epsilon);
    return rec1.slice(0, rec1.length - 1).concat(rec2);
  } else {
    return [points[0], points[end]];
  }
};

const perpendicularDistance = (p: Point, lineA: Point, lineB: Point): number => {
  const dx = lineB.x - lineA.x;
  const dy = lineB.y - lineA.y;
  const mag = Math.sqrt(dx * dx + dy * dy);
  if (mag === 0) {
    return Math.sqrt((p.x - lineA.x) ** 2 + (p.y - lineA.y) ** 2);
  }
  const u = ((p.x - lineA.x) * dx + (p.y - lineA.y) * dy) / (mag * mag);
  const clampU = Math.max(0, Math.min(1, u));
  const ix = lineA.x + clampU * dx;
  const iy = lineA.y + clampU * dy;
  return Math.sqrt((p.x - ix) ** 2 + (p.y - iy) ** 2);
};

/**
 * Moore-Neighbor / Directional boundary tracing
 * Traces external boundaries and inner holes of binary ink mask
 */
export const traceContours = (binary: Uint8Array, width: number, height: number): Point[][] => {
  const visited = new Uint8Array(width * height);
  const contours: Point[][] = [];

  // 8-connected neighborhood clockwise
  const dx = [0, 1, 1, 1, 0, -1, -1, -1];
  const dy = [-1, -1, 0, 1, 1, 1, 0, -1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (binary[idx] === 1 && !visited[idx]) {
        // Check if this pixel is on a boundary (has at least one background neighbor)
        let isBoundary = false;
        for (let dir = 0; dir < 8; dir++) {
          const nx = x + dx[dir];
          const ny = y + dy[dir];
          if (binary[ny * width + nx] === 0) {
            isBoundary = true;
            break;
          }
        }

        if (isBoundary) {
          // Trace this contour
          const contour: Point[] = [];
          let cx = x;
          let cy = y;
          let startDir = 0;
          let maxSteps = width * height;

          while (maxSteps-- > 0) {
            contour.push({ x: cx, y: cy });
            visited[cy * width + cx] = 1;

            let foundNext = false;
            for (let i = 0; i < 8; i++) {
              const checkDir = (startDir + i) % 8;
              const nx = cx + dx[checkDir];
              const ny = cy + dy[checkDir];

              if (nx >= 0 && nx < width && ny >= 0 && ny < height && binary[ny * width + nx] === 1) {
                cx = nx;
                cy = ny;
                startDir = (checkDir + 5) % 8; // backtrack direction
                foundNext = true;
                break;
              }
            }

            if (!foundNext || (cx === x && cy === y && contour.length > 2)) {
              break;
            }
          }

          if (contour.length >= 8) {
            contours.push(contour);
          }
        }
      }
    }
  }

  return contours;
};

/**
 * Converts traced contours to an SVG Path string
 * Maps from bitmap pixel coordinates to font coordinate space:
 * Font Y axis goes upwards from baseline, whereas bitmap Y axis goes down.
 */
export const contoursToFontSvgPath = (
  contours: Point[][],
  imgWidth: number,
  imgHeight: number,
  options: TracingOptions
): { svgPath: string; advanceWidth: number; lsb: number; rsb: number } => {
  if (contours.length === 0) {
    return { svgPath: '', advanceWidth: 600, lsb: 40, rsb: 40 };
  }

  // Calculate bounding box of all contours
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  contours.forEach(c => {
    c.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
  });

  const rawWidth = Math.max(1, maxX - minX);
  const rawHeight = Math.max(1, maxY - minY);

  // Target font scale: scale glyph height to match capHeight (e.g. 700 units)
  const targetCapHeight = options.capHeight || 700;
  const scale = targetCapHeight / rawHeight;

  // LSB default
  const lsb = 40;
  const advanceWidth = Math.round(rawWidth * scale + lsb * 2);
  const rsb = lsb;

  const pathSegments: string[] = [];

  contours.forEach(rawPoints => {
    // Simplify contour
    const simplified = simplifyPoints(rawPoints, options.simplification || 1.5);
    if (simplified.length < 3) return;

    // Convert each point:
    // Font X = lsb + (p.x - minX) * scale
    // Font Y = (maxY - p.y) * scale  (flips Y so baseline is at y = 0)
    const fontPoints = simplified.map(p => ({
      x: Math.round(lsb + (p.x - minX) * scale),
      y: Math.round((maxY - p.y) * scale)
    }));

    // SVG path string: in browser SVG viewport, we render font coordinate space
    const first = fontPoints[0];
    let d = `M ${first.x} ${first.y}`;

    for (let i = 1; i < fontPoints.length; i++) {
      const pt = fontPoints[i];
      d += ` L ${pt.x} ${pt.y}`;
    }
    d += ' Z';
    pathSegments.push(d);
  });

  return {
    svgPath: pathSegments.join(' '),
    advanceWidth,
    lsb,
    rsb
  };
};

/**
 * Complete single image / dataURL tracing pipeline
 */
export const traceDataUrl = async (
  dataUrl: string,
  options: TracingOptions
): Promise<{ svgPath: string; advanceWidth: number; lsb: number; rsb: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, img.width, img.height);
      const binary = new Uint8Array(img.width * img.height);

      for (let i = 0; i < imgData.data.length; i += 4) {
        const r = imgData.data[i];
        const g = imgData.data[i + 1];
        const b = imgData.data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        binary[i / 4] = gray < options.threshold ? 1 : 0;
      }

      const contours = traceContours(binary, img.width, img.height);
      const result = contoursToFontSvgPath(contours, img.width, img.height, options);
      resolve(result);
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
};
