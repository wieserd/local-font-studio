export interface Point {
  x: number;
  y: number;
}

export type GlyphContour = Point[];

export interface SelectedPointRef {
  contourIndex: number;
  pointIndex: number;
}

/**
 * Parses SVG path string commands (M, L, Z) into an array of contours
 */
export const parseSvgPathToContours = (svgPath: string): GlyphContour[] => {
  if (!svgPath || !svgPath.trim()) return [];
  const contours: GlyphContour[] = [];
  
  // Split path by 'M' or 'm' commands
  const subpaths = svgPath.trim().split(/(?=[Mm])/);
  for (const sp of subpaths) {
    if (!sp.trim()) continue;
    const pts: Point[] = [];
    const regex = /([MLml])\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g;
    let m;
    while ((m = regex.exec(sp)) !== null) {
      pts.push({ x: parseFloat(m[2]), y: parseFloat(m[3]) });
    }
    if (pts.length > 0) {
      contours.push(pts);
    }
  }
  return contours;
};

/**
 * Converts array of contours into SVG path string
 */
export const contoursToSvgPath = (contours: GlyphContour[]): string => {
  return contours
    .filter(c => c.length > 0)
    .map(c => {
      const first = c[0];
      const rest = c.slice(1).map(p => `L ${Math.round(p.x)} ${Math.round(p.y)}`).join(' ');
      return `M ${Math.round(first.x)} ${Math.round(first.y)} ${rest ? rest + ' ' : ''}Z`;
    })
    .join(' ');
};

/**
 * Inserts a point into a contour after insertAfterIndex
 */
export const insertPointInContour = (
  contours: GlyphContour[],
  contourIndex: number,
  insertAfterIndex: number,
  point: Point
): GlyphContour[] => {
  if (contourIndex < 0 || contourIndex >= contours.length) {
    return [...contours, [point]];
  }

  return contours.map((c, ci) => {
    if (ci !== contourIndex) return c;
    const updated = [...c];
    updated.splice(insertAfterIndex + 1, 0, {
      x: Math.round(point.x),
      y: Math.round(point.y)
    });
    return updated;
  });
};

/**
 * Deletes a point from a contour
 */
export const deletePointFromContour = (
  contours: GlyphContour[],
  contourIndex: number,
  pointIndex: number
): GlyphContour[] => {
  if (contourIndex < 0 || contourIndex >= contours.length) return contours;

  const targetContour = contours[contourIndex];
  if (!targetContour || pointIndex < 0 || pointIndex >= targetContour.length) return contours;

  if (targetContour.length <= 2) {
    return contours.filter((_, ci) => ci !== contourIndex);
  }

  return contours.map((c, ci) => {
    if (ci !== contourIndex) return c;
    return c.filter((_, pi) => pi !== pointIndex);
  });
};

/**
 * Updates a point's coordinates in a contour
 */
export const updatePointInContour = (
  contours: GlyphContour[],
  contourIndex: number,
  pointIndex: number,
  point: Point
): GlyphContour[] => {
  return contours.map((c, ci) => {
    if (ci !== contourIndex) return c;
    return c.map((p, pi) => {
      if (pi !== pointIndex) return p;
      return { x: Math.round(point.x), y: Math.round(point.y) };
    });
  });
};

/**
 * Projects a point onto a line segment and returns the closest point, distance and parameter t
 */
export const projectPointOnSegment = (
  p: Point,
  a: Point,
  b: Point
): { point: Point; dist: number; t: number } => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    const d = Math.hypot(p.x - a.x, p.y - a.y);
    return { point: { x: a.x, y: a.y }, dist: d, t: 0 };
  }
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  const dist = Math.hypot(p.x - projX, p.y - projY);
  return { point: { x: Math.round(projX), y: Math.round(projY) }, dist, t };
};

/**
 * Finds the closest edge across all contours to the given point
 */
export const findClosestEdge = (
  contours: GlyphContour[],
  p: Point,
  maxDistanceThreshold: number = 30
): { contourIndex: number; segmentIndex: number; projectedPoint: Point; dist: number } | null => {
  let closest: {
    contourIndex: number;
    segmentIndex: number;
    projectedPoint: Point;
    dist: number;
  } | null = null;

  contours.forEach((contour, ci) => {
    if (contour.length < 2) return;
    for (let i = 0; i < contour.length; i++) {
      const a = contour[i];
      const b = contour[(i + 1) % contour.length];
      const result = projectPointOnSegment(p, a, b);
      if (result.dist <= maxDistanceThreshold) {
        if (!closest || result.dist < closest.dist) {
          closest = {
            contourIndex: ci,
            segmentIndex: i,
            projectedPoint: result.point,
            dist: result.dist
          };
        }
      }
    }
  });

  return closest;
};

/**
 * Computes bounding box and center for glyph contours
 */
export const computeContoursBounds = (contours: GlyphContour[]): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
} => {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let hasPoints = false;
  for (const c of contours) {
    for (const p of c) {
      hasPoints = true;
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
  }
  if (!hasPoints) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, centerX: 0, centerY: 0, width: 0, height: 0 };
  }
  return {
    minX,
    maxX,
    minY,
    maxY,
    centerX: Math.round((minX + maxX) / 2),
    centerY: Math.round((minY + maxY) / 2),
    width: Math.round(maxX - minX),
    height: Math.round(maxY - minY),
  };
};

/**
 * Rotates glyph contours around their geometric center (or custom center) by angleDegrees.
 */
export const rotateContours = (
  contours: GlyphContour[],
  angleDegrees: number,
  customCenter?: Point
): GlyphContour[] => {
  if (contours.length === 0 || angleDegrees === 0) return contours;

  const bounds = computeContoursBounds(contours);
  const cx = customCenter ? customCenter.x : bounds.centerX;
  const cy = customCenter ? customCenter.y : bounds.centerY;

  const rad = (angleDegrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  return contours.map(contour =>
    contour.map(pt => {
      const dx = pt.x - cx;
      const dy = pt.y - cy;
      return {
        x: Math.round(cx + dx * cos - dy * sin),
        y: Math.round(cy + dx * sin + dy * cos),
      };
    })
  );
};

/**
 * Translates glyph contours by dx, dy
 */
export const translateContours = (
  contours: GlyphContour[],
  dx: number,
  dy: number = 0
): GlyphContour[] => {
  if (contours.length === 0 || (dx === 0 && dy === 0)) return contours;
  return contours.map(contour =>
    contour.map(pt => ({
      x: Math.round(pt.x + dx),
      y: Math.round(pt.y + dy),
    }))
  );
};

/**
 * Centers glyph artwork contours horizontally inside an advance width
 */
export const centerGlyphContours = (
  svgPath: string,
  advanceWidth: number
): { newSvgPath: string; newLsb: number; newRsb: number } | null => {
  if (!svgPath || !svgPath.trim()) return null;
  const contours = parseSvgPathToContours(svgPath);
  if (contours.length === 0) return null;
  const bounds = computeContoursBounds(contours);
  const glyphWidth = bounds.width;
  const targetLsb = Math.max(0, Math.round((advanceWidth - glyphWidth) / 2));
  const shiftX = targetLsb - bounds.minX;
  const translated = translateContours(contours, shiftX, 0);
  const newSvgPath = contoursToSvgPath(translated);
  const newRsb = Math.max(0, advanceWidth - (targetLsb + glyphWidth));
  return {
    newSvgPath,
    newLsb: targetLsb,
    newRsb,
  };
};

/**
 * Flips glyph contours horizontally or vertically across their center.
 */
export const flipContours = (
  contours: GlyphContour[],
  direction: 'horizontal' | 'vertical'
): GlyphContour[] => {
  if (contours.length === 0) return contours;
  const bounds = computeContoursBounds(contours);

  return contours.map(contour =>
    contour.map(pt => ({
      x: direction === 'horizontal' ? Math.round(2 * bounds.centerX - pt.x) : pt.x,
      y: direction === 'vertical' ? Math.round(2 * bounds.centerY - pt.y) : pt.y,
    }))
  );
};

/**
 * Computes the turning angle (direction change in degrees) at a point.
 * A straight line turn is 0°, right angle corner is 90°, sharp hairpin turn is >90°.
 */
export const computePointTurnAngle = (prev: Point, cur: Point, next: Point): number => {
  const v1x = cur.x - prev.x;
  const v1y = cur.y - prev.y;
  const v2x = next.x - cur.x;
  const v2y = next.y - cur.y;
  const l1 = Math.hypot(v1x, v1y);
  const l2 = Math.hypot(v2x, v2y);
  if (l1 === 0 || l2 === 0) return 0;
  const dot = (v1x * v2x + v1y * v2y) / (l1 * l2);
  const clamped = Math.max(-1, Math.min(1, dot));
  return (Math.acos(clamped) * 180) / Math.PI;
};

/**
 * Identifies which vertices in a closed contour are sharp corners.
 */
export const identifyCorners = (
  contour: GlyphContour,
  cornerThresholdDeg: number = 70
): boolean[] => {
  const n = contour.length;
  if (n < 3) return contour.map(() => false);
  return contour.map((pt, i) => {
    const prev = contour[(i - 1 + n) % n];
    const next = contour[(i + 1) % n];
    const turn = computePointTurnAngle(prev, pt, next);
    return turn >= cornerThresholdDeg;
  });
};

export interface SmoothContoursOptions {
  iterations?: number; // 1 to 5 (default 1)
  strength?: number; // 0.1 to 1.0 (default 0.5)
  cornerThreshold?: number; // e.g. 70 degrees
  preserveCorners?: boolean; // default true
  subdivide?: boolean; // if true, runs Chaikin corner cutting to double curve resolution
  selectedRef?: SelectedPointRef | null; // if provided, smooths locally around selected point
}

/**
 * Smooths contours using Laplacian relaxation with intelligent corner preservation.
 * Smooths out jagged polygon facets into round, flowing curves without shrinking glyph bounds.
 */
export const smoothContours = (
  contours: GlyphContour[],
  options: SmoothContoursOptions = {}
): GlyphContour[] => {
  const {
    iterations = 1,
    strength = 0.5,
    cornerThreshold = 70,
    preserveCorners = true,
    subdivide = false,
    selectedRef = null
  } = options;

  if (contours.length === 0) return contours;

  return contours.map((contour, cIdx) => {
    const n = contour.length;
    if (n < 3) return contour;

    let pts = contour.map(p => ({ ...p }));
    const itCount = Math.max(1, Math.min(10, iterations));

    for (let it = 0; it < itCount; it++) {
      const curN = pts.length;
      if (curN < 3) break;

      const isCorner = preserveCorners
        ? identifyCorners(pts, cornerThreshold)
        : pts.map(() => false);

      if (subdivide) {
        // Chaikin corner-cutting subdivision: adds smooth intermediate curve points
        const newPts: Point[] = [];
        for (let i = 0; i < curN; i++) {
          const p1 = pts[i];
          const p2 = pts[(i + 1) % curN];
          const p1Corner = isCorner[i];
          const p2Corner = isCorner[(i + 1) % curN];

          // If local smoothing around selected point
          if (selectedRef && selectedRef.contourIndex === cIdx) {
            const dist = Math.min(
              Math.abs(i - selectedRef.pointIndex),
              curN - Math.abs(i - selectedRef.pointIndex)
            );
            if (dist > 3) {
              // Outside region of interest
              newPts.push(p1);
              continue;
            }
          }

          if (p1Corner && p2Corner) {
            newPts.push(p1);
          } else if (p1Corner && !p2Corner) {
            newPts.push(p1);
            newPts.push({
              x: Math.round(0.25 * p1.x + 0.75 * p2.x),
              y: Math.round(0.25 * p1.y + 0.75 * p2.y),
            });
          } else if (!p1Corner && p2Corner) {
            newPts.push({
              x: Math.round(0.75 * p1.x + 0.25 * p2.x),
              y: Math.round(0.75 * p1.y + 0.25 * p2.y),
            });
          } else {
            newPts.push({
              x: Math.round(0.75 * p1.x + 0.25 * p2.x),
              y: Math.round(0.75 * p1.y + 0.25 * p2.y),
            });
            newPts.push({
              x: Math.round(0.25 * p1.x + 0.75 * p2.x),
              y: Math.round(0.25 * p1.y + 0.75 * p2.y),
            });
          }
        }
        pts = newPts;
      } else {
        // Weighted Laplacian relaxation (keeps vertex count constant, smooths positions)
        pts = pts.map((pt, i) => {
          if (isCorner[i]) return pt; // Keep sharp corners pinned

          if (selectedRef && selectedRef.contourIndex === cIdx) {
            const dist = Math.min(
              Math.abs(i - selectedRef.pointIndex),
              curN - Math.abs(i - selectedRef.pointIndex)
            );
            if (dist > 3) return pt; // Only smooth near selected point
          }

          const prev = pts[(i - 1 + curN) % curN];
          const next = pts[(i + 1) % curN];
          const midX = (prev.x + next.x) / 2;
          const midY = (prev.y + next.y) / 2;

          return {
            x: Math.round(pt.x + strength * (midX - pt.x)),
            y: Math.round(pt.y + strength * (midY - pt.y)),
          };
        });
      }
    }

    return pts;
  });
};

/**
 * Computes signed polygon area of a closed contour using the Shoelace formula.
 * Positive = counter-clockwise in Cartesian coordinates, Negative = clockwise.
 */
export const computeContourSignedArea = (contour: GlyphContour): number => {
  let area = 0;
  const n = contour.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += contour[i].x * contour[j].y - contour[j].x * contour[i].y;
  }
  return area / 2;
};

/**
 * Tests whether a point lies inside a closed contour polygon (ray-casting).
 */
export const isPointInContour = (pt: Point, contour: GlyphContour): boolean => {
  let inside = false;
  const n = contour.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = contour[i].x, yi = contour[i].y;
    const xj = contour[j].x, yj = contour[j].y;
    const intersect = ((yi > pt.y) !== (yj > pt.y)) &&
      (pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

/**
 * Applies italic / oblique horizontal shear mapping relative to a baseline:
 * x' = x + (y - baselineY) * tan(angleDegrees)
 * y' = y
 */
export const slantContours = (
  contours: GlyphContour[],
  angleDegrees: number,
  baselineY: number = 0
): GlyphContour[] => {
  if (contours.length === 0 || angleDegrees === 0) return contours;
  const tanAngle = Math.tan((angleDegrees * Math.PI) / 180);
  return contours.map(contour =>
    contour.map(pt => ({
      x: Math.round(pt.x + (pt.y - baselineY) * tanAngle),
      y: pt.y,
    }))
  );
};

/**
 * Expands or contracts stem stroke weight along contour normals (dilation / erosion).
 * Positive deltaWeight thickens outer boundaries and contracts inner hole counters.
 * Negative deltaWeight thins outer boundaries and expands inner hole counters.
 */
export const offsetContourWeight = (
  contours: GlyphContour[],
  deltaWeight: number
): GlyphContour[] => {
  if (contours.length === 0 || deltaWeight === 0) return contours;

  // Determine which contours are inner holes vs outer boundaries
  const isHoleList = contours.map((c, cIdx) => {
    if (c.length < 3) return false;
    const testPt = {
      x: (c[0].x + c[1].x) / 2,
      y: (c[0].y + c[1].y) / 2
    };

    let enclosingCount = 0;
    contours.forEach((other, oIdx) => {
      if (cIdx !== oIdx && isPointInContour(testPt, other)) {
        enclosingCount++;
      }
    });
    return enclosingCount % 2 === 1;
  });

  return contours.map((contour, cIdx) => {
    const n = contour.length;
    if (n < 3) return contour;

    const isHole = isHoleList[cIdx];
    const signedArea = computeContourSignedArea(contour);
    const isCCW = signedArea > 0;

    // Normal direction sign based on winding and hole status
    const dirSign = (isCCW ? 1 : -1) * (isHole ? -1 : 1);

    // Compute edge unit outward normals
    const edgeNormals: Point[] = [];
    for (let i = 0; i < n; i++) {
      const p1 = contour[i];
      const p2 = contour[(i + 1) % n];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy);
      if (len === 0) {
        edgeNormals.push({ x: 0, y: 0 });
      } else {
        edgeNormals.push({
          x: dirSign * (dy / len),
          y: dirSign * (-dx / len)
        });
      }
    }

    // Compute vertex offset
    return contour.map((pt, i) => {
      const prevNorm = edgeNormals[(i - 1 + n) % n];
      const nextNorm = edgeNormals[i];

      const nx = prevNorm.x + nextNorm.x;
      const ny = prevNorm.y + nextNorm.y;
      const len = Math.hypot(nx, ny);

      if (len < 1e-4) {
        return {
          x: Math.round(pt.x + deltaWeight * prevNorm.x),
          y: Math.round(pt.y + deltaWeight * prevNorm.y)
        };
      }

      // Unit bisector
      const bx = nx / len;
      const by = ny / len;

      // Miter length factor clamped to prevent acute corner spikes
      const miterFactor = Math.min(2.0, 2 / len);

      return {
        x: Math.round(pt.x + deltaWeight * miterFactor * bx),
        y: Math.round(pt.y + deltaWeight * miterFactor * by)
      };
    });
  });
};



