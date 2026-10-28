import { computeContourSignedArea, isPointInContour } from './contourUtils.ts';
import type { Point, GlyphContour } from './contourUtils.ts';
import type { Glyph } from '../types/font.ts';

export type AuditSeverity = 'error' | 'warning' | 'info';

export type AuditIssueType =
  | 'wrong-direction'
  | 'self-intersection'
  | 'degenerate-contour'
  | 'micro-segment'
  | 'redundant-point'
  | 'missing-extrema'
  | 'sharp-spike';

export interface AuditIssue {
  id: string;
  type: AuditIssueType;
  severity: AuditSeverity;
  targetLevel: 'contour' | 'point';
  contourIndex: number;
  pointIndex?: number;
  x: number;
  y: number;
  title: string;
  message: string;
  recommendation: string;
  autoFixable: boolean;
}

export interface GlyphAuditReport {
  glyphChar: string;
  totalIssues: number;
  errorsCount: number;
  warningsCount: number;
  infosCount: number;
  autoFixableCount: number;
  issues: AuditIssue[];
  passed: boolean;
}

export interface FontAuditProjectReport {
  totalGlyphsScanned: number;
  cleanGlyphsCount: number;
  glyphsWithIssuesCount: number;
  totalIssues: number;
  totalErrors: number;
  totalWarnings: number;
  totalInfos: number;
  totalAutoFixable: number;
  glyphReports: Record<string, GlyphAuditReport>;
}

/**
 * Checks if two line segments (p1-p2) and (p3-p4) strictly intersect.
 */
function checkSegmentIntersection(
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point
): { intersect: boolean; pt?: Point } {
  const d1x = p2.x - p1.x;
  const d1y = p2.y - p1.y;
  const d2x = p4.x - p3.x;
  const d2y = p4.y - p3.y;

  const cross = d1x * d2y - d1y * d2x;
  if (Math.abs(cross) < 1e-6) return { intersect: false };

  const t1 = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / cross;
  const t2 = ((p3.x - p1.x) * d1y - (p3.y - p1.y) * d1x) / cross;

  // Strict interior intersection excluding endpoints
  const eps = 0.03;
  if (t1 > eps && t1 < 1 - eps && t2 > eps && t2 < 1 - eps) {
    return {
      intersect: true,
      pt: {
        x: Math.round(p1.x + t1 * d1x),
        y: Math.round(p1.y + t1 * d1y)
      }
    };
  }
  return { intersect: false };
}

/**
 * Computes turning angle at a point in degrees (0° = straight, 180° = complete reversal)
 */
function computeTurnAngle(prev: Point, cur: Point, next: Point): number {
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
}

/**
 * Determines whether a contour is an inner hole by counting enclosing parent contours.
 */
export function isContourAnInnerHole(cIdx: number, contours: GlyphContour[]): boolean {
  const c = contours[cIdx];
  if (!c || c.length < 3) return false;

  // Midpoint of first segment
  const testPt: Point = {
    x: (c[0].x + c[1].x) / 2,
    y: (c[0].y + c[1].y) / 2
  };

  let enclosureCount = 0;
  contours.forEach((other, oIdx) => {
    if (cIdx !== oIdx && other.length >= 3) {
      if (isPointInContour(testPt, other)) {
        enclosureCount++;
      }
    }
  });

  return enclosureCount % 2 === 1;
}

/**
 * Audits the geometric contours of a glyph and returns detected issues.
 */
export function auditContourGeometry(contours: GlyphContour[], glyphChar: string = ''): GlyphAuditReport {
  const issues: AuditIssue[] = [];

  if (!contours || contours.length === 0) {
    return {
      glyphChar,
      totalIssues: 0,
      errorsCount: 0,
      warningsCount: 0,
      infosCount: 0,
      autoFixableCount: 0,
      issues: [],
      passed: true
    };
  }

  // 1. Degenerate Contours
  contours.forEach((c, cIdx) => {
    if (c.length < 3) {
      issues.push({
        id: `deg-${cIdx}`,
        type: 'degenerate-contour',
        severity: 'error',
        targetLevel: 'contour',
        contourIndex: cIdx,
        x: c[0]?.x ?? 0,
        y: c[0]?.y ?? 0,
        title: 'Degenerate Contour',
        message: `Contour #${cIdx + 1} has only ${c.length} points (minimum 3 required for a closed polygon).`,
        recommendation: "Contour has too few points. Click [Auto-Fix] to safely remove this degenerate path.",
        autoFixable: true
      });
      return;
    }

    const area = computeContourSignedArea(c);
    if (Math.abs(area) < 4) {
      const cx = Math.round(c.reduce((sum, p) => sum + p.x, 0) / c.length);
      const cy = Math.round(c.reduce((sum, p) => sum + p.y, 0) / c.length);
      issues.push({
        id: `deg-area-${cIdx}`,
        type: 'degenerate-contour',
        severity: 'error',
        targetLevel: 'contour',
        contourIndex: cIdx,
        x: cx,
        y: cy,
        title: 'Zero-Area Degenerate Contour',
        message: `Contour #${cIdx + 1} encloses almost zero area (${Math.round(area)} sq units).`,
        recommendation: "Path has no interior area. Click [Auto-Fix] to delete this empty remnant.",
        autoFixable: true
      });
    }
  });

  // 2. Winding Order / Contour Direction
  // Standard typography rule: Outer boundaries have one sign (typically positive/CCW in Cartesian),
  // and counter-holes must have the opposite sign.
  contours.forEach((c, cIdx) => {
    if (c.length < 3) return;
    const isHole = isContourAnInnerHole(cIdx, contours);
    const area = computeContourSignedArea(c);
    const isPositive = area > 0;

    // Rule: Outers must be Positive (CCW), Holes must be Negative (CW)
    const shouldBePositive = !isHole;
    if (isPositive !== shouldBePositive) {
      const cx = Math.round(c.reduce((sum, p) => sum + p.x, 0) / c.length);
      const cy = Math.round(c.reduce((sum, p) => sum + p.y, 0) / c.length);
      issues.push({
        id: `wind-${cIdx}`,
        type: 'wrong-direction',
        severity: 'error',
        targetLevel: 'contour',
        contourIndex: cIdx,
        x: cx,
        y: cy,
        title: isHole ? 'Inverted Counter-Hole Winding' : 'Inverted Outer Contour Winding',
        message: isHole
          ? `Inner hole #${cIdx + 1} runs in the same winding direction as outer contours. Will fill solid black in OpenType engines.`
          : `Outer contour #${cIdx + 1} runs in reverse winding direction.`,
        recommendation: "Path direction needs to be reversed. Do NOT delete vertices! Click [Fix Winding] to reverse this contour.",
        autoFixable: true
      });
    }
  });

  // 3. Self-Intersections within contours
  contours.forEach((c, cIdx) => {
    const n = c.length;
    if (n < 4) return;

    for (let i = 0; i < n; i++) {
      const p1 = c[i];
      const p2 = c[(i + 1) % n];

      for (let j = i + 2; j < n; j++) {
        if (i === 0 && j === n - 1) continue; // Adjacent edge wrap-around

        const p3 = c[j];
        const p4 = c[(j + 1) % n];

        const test = checkSegmentIntersection(p1, p2, p3, p4);
        if (test.intersect && test.pt) {
          issues.push({
            id: `isect-${cIdx}-${i}-${j}`,
            type: 'self-intersection',
            severity: 'error',
            targetLevel: 'point',
            contourIndex: cIdx,
            pointIndex: i,
            x: test.pt.x,
            y: test.pt.y,
            title: 'Self-Intersecting Outline',
            message: `Contour #${cIdx + 1} crosses over itself between segment [${i}→${(i + 1) % n}] and [${j}→${(j + 1) % n}].`,
            recommendation: "Lines overlap each other like a figure-8. Drag intersecting vertices apart so edges don't cross.",
            autoFixable: false
          });
          break; // Stop after first collision on this contour to prevent spam
        }
      }
    }
  });

  // 4. Micro-Segments (< 2.5 font units)
  contours.forEach((c, cIdx) => {
    const n = c.length;
    if (n < 3) return;

    for (let i = 0; i < n; i++) {
      const p1 = c[i];
      const p2 = c[(i + 1) % n];
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

      if (dist < 2.5) {
        issues.push({
          id: `micro-${cIdx}-${i}`,
          type: 'micro-segment',
          severity: 'warning',
          targetLevel: 'point',
          contourIndex: cIdx,
          pointIndex: i,
          x: p1.x,
          y: p1.y,
          title: 'Micro-Segment (< 2.5 units)',
          message: `Vertices #${i} and #${(i + 1) % n} are only ${dist.toFixed(1)} units apart.`,
          recommendation: "Two vertices sit almost on top of each other. Click [Merge] to combine them into a single clean node.",
          autoFixable: true
        });
      }
    }
  });

  // 5. Redundant / Collinear Points
  contours.forEach((c, cIdx) => {
    const n = c.length;
    if (n <= 3) return;

    for (let i = 0; i < n; i++) {
      const prev = c[(i - 1 + n) % n];
      const cur = c[i];
      const next = c[(i + 1) % n];

      const lineLen = Math.hypot(next.x - prev.x, next.y - prev.y);
      if (lineLen > 4) {
        // Perpendicular distance of cur to line (prev, next)
        const perpDist = Math.abs(
          (next.y - prev.y) * cur.x -
          (next.x - prev.x) * cur.y +
          next.x * prev.y -
          next.y * prev.x
        ) / lineLen;

        if (perpDist <= 0.65) {
          issues.push({
            id: `collinear-${cIdx}-${i}`,
            type: 'redundant-point',
            severity: 'info',
            targetLevel: 'point',
            contourIndex: cIdx,
            pointIndex: i,
            x: cur.x,
            y: cur.y,
            title: 'Collinear Redundant Point',
            message: `Vertex #${i} lies almost perfectly flat on the line between #${(i - 1 + n) % n} and #${(i + 1) % n} (dist: ${perpDist.toFixed(2)}u).`,
            recommendation: "Node adds no curvature and inflates font size. Click [Clean] to remove it safely.",
            autoFixable: true
          });
        }
      }
    }
  });

  // 6. Missing Extrema at Bounding Peaks
  contours.forEach((c, cIdx) => {
    if (c.length < 4) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of c) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    const tol = 1.8;
    const hasMinX = c.some(p => Math.abs(p.x - minX) <= tol);
    const hasMaxX = c.some(p => Math.abs(p.x - maxX) <= tol);
    const hasMinY = c.some(p => Math.abs(p.y - minY) <= tol);
    const hasMaxY = c.some(p => Math.abs(p.y - maxY) <= tol);

    if (!hasMinX) {
      issues.push({
        id: `extrema-minX-${cIdx}`,
        type: 'missing-extrema',
        severity: 'warning',
        targetLevel: 'point',
        contourIndex: cIdx,
        x: minX,
        y: Math.round((minY + maxY) / 2),
        title: 'Missing Left Extrema Node',
        message: `Leftmost boundary (${minX}u) lacks an on-curve extreme vertex.`,
        recommendation: "OpenType recommends vertices at curve peaks for crisp rendering. Add an on-curve node here.",
        autoFixable: false
      });
    }
    if (!hasMaxX) {
      issues.push({
        id: `extrema-maxX-${cIdx}`,
        type: 'missing-extrema',
        severity: 'warning',
        targetLevel: 'point',
        contourIndex: cIdx,
        x: maxX,
        y: Math.round((minY + maxY) / 2),
        title: 'Missing Right Extrema Node',
        message: `Rightmost boundary (${maxX}u) lacks an on-curve extreme vertex.`,
        recommendation: "OpenType recommends vertices at curve peaks for crisp rendering. Add an on-curve node here.",
        autoFixable: false
      });
    }
    if (!hasMinY) {
      issues.push({
        id: `extrema-minY-${cIdx}`,
        type: 'missing-extrema',
        severity: 'warning',
        targetLevel: 'point',
        contourIndex: cIdx,
        x: Math.round((minX + maxX) / 2),
        y: minY,
        title: 'Missing Bottom Extrema Node',
        message: `Bottom boundary (${minY}u) lacks an on-curve extreme vertex.`,
        recommendation: "OpenType recommends vertices at curve peaks for crisp rendering. Add an on-curve node here.",
        autoFixable: false
      });
    }
    if (!hasMaxY) {
      issues.push({
        id: `extrema-maxY-${cIdx}`,
        type: 'missing-extrema',
        severity: 'warning',
        targetLevel: 'point',
        contourIndex: cIdx,
        x: Math.round((minX + maxX) / 2),
        y: maxY,
        title: 'Missing Top Extrema Node',
        message: `Top boundary (${maxY}u) lacks an on-curve extreme vertex.`,
        recommendation: "OpenType recommends vertices at curve peaks for crisp rendering. Add an on-curve node here.",
        autoFixable: false
      });
    }
  });

  // 7. Suspicious Sharp Spikes (< 18°)
  contours.forEach((c, cIdx) => {
    const n = c.length;
    if (n < 4) return;

    for (let i = 0; i < n; i++) {
      const prev = c[(i - 1 + n) % n];
      const cur = c[i];
      const next = c[(i + 1) % n];

      const d1 = Math.hypot(cur.x - prev.x, cur.y - prev.y);
      const d2 = Math.hypot(next.x - cur.x, next.y - cur.y);

      if (d1 >= 10 && d2 >= 10) {
        const turn = computeTurnAngle(prev, cur, next);
        if (turn >= 162) {
          issues.push({
            id: `spike-${cIdx}-${i}`,
            type: 'sharp-spike',
            severity: 'warning',
            targetLevel: 'point',
            contourIndex: cIdx,
            pointIndex: i,
            x: cur.x,
            y: cur.y,
            title: 'Acute Needle Cusp (< 18°)',
            message: `Vertex #${i} has an acute hairpin angle of ${(180 - turn).toFixed(1)}°.`,
            recommendation: "Very sharp hairpin cusp. Drag this vertex slightly outward or delete it if it was an accidental stylus spike.",
            autoFixable: false
          });
        }
      }
    }
  });

  const errorsCount = issues.filter(i => i.severity === 'error').length;
  const warningsCount = issues.filter(i => i.severity === 'warning').length;
  const infosCount = issues.filter(i => i.severity === 'info').length;
  const autoFixableCount = issues.filter(i => i.autoFixable).length;

  return {
    glyphChar,
    totalIssues: issues.length,
    errorsCount,
    warningsCount,
    infosCount,
    autoFixableCount,
    issues,
    passed: errorsCount === 0 && warningsCount === 0
  };
}

/**
 * Auto-Fixes all fixable issues in a set of contours:
 * 1. Prunes degenerate contours (< 3 points or zero area)
 * 2. Corrects winding direction for outers vs holes
 * 3. Collapses micro-segments
 * 4. Removes redundant collinear points
 */
export function autoFixContours(contours: GlyphContour[]): {
  contours: GlyphContour[];
  fixedCount: number;
  fixedActions: string[];
} {
  if (!contours || contours.length === 0) {
    return { contours: [], fixedCount: 0, fixedActions: [] };
  }

  let cur = contours.map(c => c.map(p => ({ ...p })));
  let fixedCount = 0;
  const fixedActions: string[] = [];

  // 1. Remove degenerate contours
  const initialCount = cur.length;
  cur = cur.filter(c => {
    if (c.length < 3) return false;
    const area = Math.abs(computeContourSignedArea(c));
    return area >= 4;
  });
  if (cur.length < initialCount) {
    const diff = initialCount - cur.length;
    fixedCount += diff;
    fixedActions.push(`Removed ${diff} degenerate/empty contour(s)`);
  }

  // 2. Correct Winding Directions
  let reversedCount = 0;
  cur = cur.map((c, cIdx) => {
    if (c.length < 3) return c;
    const isHole = isContourAnInnerHole(cIdx, cur);
    const area = computeContourSignedArea(c);
    const isPositive = area > 0;
    const shouldBePositive = !isHole;

    if (isPositive !== shouldBePositive) {
      reversedCount++;
      return [...c].reverse();
    }
    return c;
  });
  if (reversedCount > 0) {
    fixedCount += reversedCount;
    fixedActions.push(`Corrected winding direction on ${reversedCount} contour(s)`);
  }

  // 3. Collapse Micro-segments (< 2.5u)
  let microCollapsed = 0;
  cur = cur.map(c => {
    if (c.length <= 3) return c;
    const filtered: Point[] = [];
    for (let i = 0; i < c.length; i++) {
      const nextPt = c[(i + 1) % c.length];
      const dist = Math.hypot(nextPt.x - c[i].x, nextPt.y - c[i].y);
      if (dist < 2.5 && c.length - filtered.length > 3) {
        microCollapsed++;
        // Skip adding c[i], collapsing it into nextPt
        continue;
      }
      filtered.push(c[i]);
    }
    return filtered.length >= 3 ? filtered : c;
  });
  if (microCollapsed > 0) {
    fixedCount += microCollapsed;
    fixedActions.push(`Collapsed ${microCollapsed} micro-segment(s)`);
  }

  // 4. Remove Collinear Redundant Points
  let redundantRemoved = 0;
  cur = cur.map(c => {
    if (c.length <= 3) return c;
    let pts = [...c];
    let changed = true;
    let guard = 0;

    while (changed && pts.length > 3 && guard < 10) {
      guard++;
      changed = false;
      const n = pts.length;
      for (let i = 0; i < n; i++) {
        if (pts.length <= 3) break;
        const prev = pts[(i - 1 + pts.length) % pts.length];
        const point = pts[i];
        const next = pts[(i + 1) % pts.length];

        const lineLen = Math.hypot(next.x - prev.x, next.y - prev.y);
        if (lineLen > 4) {
          const perpDist = Math.abs(
            (next.y - prev.y) * point.x -
            (next.x - prev.x) * point.y +
            next.x * prev.y -
            next.y * prev.x
          ) / lineLen;

          if (perpDist <= 0.65) {
            pts.splice(i, 1);
            redundantRemoved++;
            changed = true;
            break;
          }
        }
      }
    }
    return pts;
  });
  if (redundantRemoved > 0) {
    fixedCount += redundantRemoved;
    fixedActions.push(`Removed ${redundantRemoved} redundant collinear point(s)`);
  }

  return { contours: cur, fixedCount, fixedActions };
}

/**
 * Reverses the winding direction of a specific contour
 */
export function reverseContourDirection(contours: GlyphContour[], contourIndex: number): GlyphContour[] {
  if (contourIndex < 0 || contourIndex >= contours.length) return contours;
  return contours.map((c, i) => {
    if (i === contourIndex) {
      return [...c].reverse();
    }
    return c;
  });
}

/**
 * Applies an automated repair for a single specific audit issue
 */
export function fixSpecificAuditIssue(
  contours: GlyphContour[],
  issue: AuditIssue
): { contours: GlyphContour[]; actionDescription: string } {
  if (!contours || contours.length === 0) {
    return { contours, actionDescription: 'No contours to modify' };
  }

  if (issue.type === 'wrong-direction') {
    const reversed = reverseContourDirection(contours, issue.contourIndex);
    return {
      contours: reversed,
      actionDescription: `Reversed winding direction of contour #${issue.contourIndex + 1}`
    };
  }

  if (issue.type === 'degenerate-contour') {
    const filtered = contours.filter((_, idx) => idx !== issue.contourIndex);
    return {
      contours: filtered,
      actionDescription: `Removed degenerate contour #${issue.contourIndex + 1}`
    };
  }

  if (issue.type === 'micro-segment' && issue.pointIndex !== undefined) {
    const targetContour = contours[issue.contourIndex];
    if (targetContour && targetContour.length > 3) {
      const updated = contours.map((c, cIdx) => {
        if (cIdx !== issue.contourIndex) return c;
        return c.filter((_, pIdx) => pIdx !== issue.pointIndex);
      });
      return {
        contours: updated,
        actionDescription: `Collapsed micro-segment node #${issue.pointIndex}`
      };
    }
  }

  if (issue.type === 'redundant-point' && issue.pointIndex !== undefined) {
    const targetContour = contours[issue.contourIndex];
    if (targetContour && targetContour.length > 3) {
      const updated = contours.map((c, cIdx) => {
        if (cIdx !== issue.contourIndex) return c;
        return c.filter((_, pIdx) => pIdx !== issue.pointIndex);
      });
      return {
        contours: updated,
        actionDescription: `Cleaned redundant collinear node #${issue.pointIndex}`
      };
    }
  }

  // Fallback to full auto-fix
  const { contours: autoFixed, fixedActions } = autoFixContours(contours);
  return {
    contours: autoFixed,
    actionDescription: fixedActions.join(', ') || 'Repaired contour geometry'
  };
}

/**
 * Scans all assigned glyphs in a project and generates an executive font-wide audit report.
 */
export function auditFontProject(glyphs: Record<string, Glyph>): FontAuditProjectReport {
  const glyphEntries = Object.entries(glyphs).filter(([, g]) => g.isAssigned && g.char !== ' ' && g.svgPath);
  const glyphReports: Record<string, GlyphAuditReport> = {};

  let totalIssues = 0;
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalInfos = 0;
  let totalAutoFixable = 0;
  let cleanGlyphsCount = 0;
  let glyphsWithIssuesCount = 0;

  for (const [char, glyph] of glyphEntries) {
    const contours: GlyphContour[] = glyph.contours && glyph.contours.length > 0
      ? glyph.contours
      : [];

    const report = auditContourGeometry(contours, char);
    glyphReports[char] = report;

    if (report.totalIssues === 0) {
      cleanGlyphsCount++;
    } else {
      glyphsWithIssuesCount++;
      totalIssues += report.totalIssues;
      totalErrors += report.errorsCount;
      totalWarnings += report.warningsCount;
      totalInfos += report.infosCount;
      totalAutoFixable += report.autoFixableCount;
    }
  }

  return {
    totalGlyphsScanned: glyphEntries.length,
    cleanGlyphsCount,
    glyphsWithIssuesCount,
    totalIssues,
    totalErrors,
    totalWarnings,
    totalInfos,
    totalAutoFixable,
    glyphReports
  };
}
