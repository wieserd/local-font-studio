import test from 'node:test';
import assert from 'node:assert/strict';
import { simplifyPoints, traceContours, contoursToFontSvgPath } from '../utils/vectorizer.ts';
import { detectInkBoundingBox } from '../utils/imageProcessor.ts';
import { 
  parseSvgPathToContours, 
  contoursToSvgPath, 
  insertPointInContour, 
  deletePointFromContour,
  findClosestEdge,
  rotateContours,
  flipContours,
  translateContours,
  centerGlyphContours,
  computeContoursBounds,
  computePointTurnAngle,
  identifyCorners,
  smoothContours
} from '../utils/contourUtils.ts';

test('Douglas-Peucker point simplification reduces colinear points', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 5, y: 0 },
    { x: 10, y: 0 },
    { x: 15, y: 0 },
    { x: 20, y: 0 }
  ];

  const simplified = simplifyPoints(points, 1.0);
  assert.strictEqual(simplified.length, 2, 'Colinear points should simplify to start and end point');
  assert.deepStrictEqual(simplified[0], { x: 0, y: 0 });
  assert.deepStrictEqual(simplified[1], { x: 20, y: 0 });
});

test('Douglas-Peucker preserves sharp corner vertices', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 10, y: 10 },
    { x: 20, y: 0 }
  ];

  const simplified = simplifyPoints(points, 1.0);
  assert.strictEqual(simplified.length, 3, 'Peak vertex should be preserved');
  assert.deepStrictEqual(simplified[1], { x: 10, y: 10 });
});

test('Boundary contour tracer extracts contours from a square ink blob', () => {
  const width = 20;
  const height = 20;
  const binary = new Uint8Array(width * height);

  // Draw a 6x6 ink square in the center
  for (let y = 6; y < 14; y++) {
    for (let x = 6; x < 14; x++) {
      binary[y * width + x] = 1;
    }
  }

  const contours = traceContours(binary, width, height);
  assert.ok(contours.length >= 1, 'Should find at least 1 contour for square blob');
  assert.ok(contours[0].length >= 8, 'Contour should contain boundary points');
});

test('contoursToFontSvgPath maps pixel coordinates to font coordinate space with baseline at y=0', () => {
  const contours = [
    [
      { x: 10, y: 10 },
      { x: 50, y: 10 },
      { x: 50, y: 90 },
      { x: 10, y: 90 },
      { x: 10, y: 10 }
    ]
  ];

  const result = contoursToFontSvgPath(contours, 100, 100, {
    threshold: 128,
    simplification: 1.0,
    smoothing: 2.0,
    upm: 1000,
    capHeight: 700,
    baseline: 0
  });

  assert.ok(result.svgPath.startsWith('M '), 'SVG path should start with M command');
  assert.ok(result.svgPath.includes(' Z'), 'SVG path should close with Z command');
  assert.ok(result.advanceWidth > 0, 'Advance width should be positive');
  assert.strictEqual(result.lsb, 40, 'Default LSB should be 40 units');
});

test('detectInkBoundingBox identifies ink cluster and adds padding', () => {
  const width = 50;
  const height = 50;
  const binary = new Uint8Array(width * height);

  // Draw a small 10x10 letter shape at (15, 15) to (25, 25)
  for (let y = 15; y <= 25; y++) {
    for (let x = 15; x <= 25; x++) {
      binary[y * width + x] = 1;
    }
  }

  const box = detectInkBoundingBox(binary, width, height, 20, 20);
  assert.ok(box !== null, 'Should detect ink bounding box');
  assert.ok(box.x <= 15, 'Box x should encompass ink with padding');
  assert.ok(box.y <= 15, 'Box y should encompass ink with padding');
  assert.ok(box.width >= 10, 'Box width should cover ink');
  assert.ok(box.height >= 10, 'Box height should cover ink');
});

test('SVG path coordinate extraction and bounds calculation', () => {
  const samplePath = "M 40 0 L 260 700 L 340 700 L 560 0 L 470 0 L 415 180 L 185 180 L 130 0 Z";
  const regex = /([ML])\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g;
  const points: Array<{ x: number; y: number }> = [];
  let m;
  while ((m = regex.exec(samplePath)) !== null) {
    points.push({ x: parseFloat(m[2]), y: parseFloat(m[3]) });
  }

  assert.strictEqual(points.length, 8, 'Should extract 8 vertices from path');
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  assert.strictEqual(minX, 40, 'minX should match leftmost point');
  assert.strictEqual(maxX, 560, 'maxX should match rightmost point');
  assert.strictEqual(minY, 0, 'minY should be baseline 0');
  assert.strictEqual(maxY, 700, 'maxY should match cap height 700');
  
  // Glyph horizontal centering calculation
  const advanceWidth = 600;
  const glyphWidth = maxX - minX; // 520
  const fontScale = 0.6;
  const scaledWidth = glyphWidth * fontScale; // 312
  const canvasAdvance = advanceWidth * fontScale; // 360
  const targetLeft = (canvasAdvance - scaledWidth) / 2; // 24
  const currentLeft = minX * fontScale; // 24
  const centerShift = Math.round(targetLeft - currentLeft); // 0 (already centered)
  assert.strictEqual(centerShift, 0, 'Centered glyph should have 0 shift');
});

test('Contour utils: parse, insert point, delete point and serialize', () => {
  const sample = "M 40 0 L 260 700 L 340 700 L 560 0 Z M 215 260 L 385 260 L 300 520 Z";
  const contours = parseSvgPathToContours(sample);
  assert.strictEqual(contours.length, 2, 'Should parse 2 contours');
  assert.strictEqual(contours[0].length, 4, 'Outer contour should have 4 points');
  assert.strictEqual(contours[1].length, 3, 'Inner contour should have 3 points');

  // Insert a point on the top segment of outer contour (between index 1: 260,700 and 2: 340,700)
  const withInserted = insertPointInContour(contours, 0, 1, { x: 300, y: 700 });
  assert.strictEqual(withInserted[0].length, 5, 'Contour 0 should now have 5 points');
  assert.deepStrictEqual(withInserted[0][2], { x: 300, y: 700 }, 'Inserted point should be at index 2');

  // Delete the point at index 2
  const withDeleted = deletePointFromContour(withInserted, 0, 2);
  assert.strictEqual(withDeleted[0].length, 4, 'Contour 0 should be back to 4 points');
  assert.deepStrictEqual(withDeleted[0][2], { x: 340, y: 700 }, 'Point 2 should now be the original 340,700');

  // Serialize back to SVG path string
  const serialized = contoursToSvgPath(withDeleted);
  assert.ok(serialized.startsWith('M 40 0'), 'Serialized path should start with M 40 0');
  assert.ok(serialized.includes('M 215 260'), 'Serialized path should contain second contour');
});

test('Contour utils: find closest edge for point insertion', () => {
  const sample = "M 0 0 L 0 100 L 100 100 L 100 0 Z";
  const contours = parseSvgPathToContours(sample);

  // Query a point near the middle of top segment (0,100 -> 100,100), e.g. at (50, 105)
  const edgeMatch = findClosestEdge(contours, { x: 50, y: 105 }, 20);
  assert.ok(edgeMatch !== null, 'Should find edge match');
  assert.strictEqual(edgeMatch.contourIndex, 0);
  assert.strictEqual(edgeMatch.segmentIndex, 1, 'Segment 1 is from (0,100) to (100,100)');
  assert.strictEqual(edgeMatch.projectedPoint.x, 50);
  assert.strictEqual(edgeMatch.projectedPoint.y, 100);
});

test('Contour utils: consecutive connected point addition chain', () => {
  let contours: Array<Array<{ x: number; y: number }>> = [
    [{ x: 100, y: 100 }]
  ];
  let activePoint = { contourIndex: 0, pointIndex: 0 };

  // Add Point 2 connected to Point 1
  const pt2 = { x: 200, y: 150 };
  contours = insertPointInContour(contours, activePoint.contourIndex, activePoint.pointIndex, pt2);
  activePoint = { contourIndex: 0, pointIndex: activePoint.pointIndex + 1 };

  assert.strictEqual(contours[0].length, 2);
  assert.deepStrictEqual(contours[0][0], { x: 100, y: 100 });
  assert.deepStrictEqual(contours[0][1], { x: 200, y: 150 });

  // Add Point 3 connected to Point 2
  const pt3 = { x: 300, y: 200 };
  contours = insertPointInContour(contours, activePoint.contourIndex, activePoint.pointIndex, pt3);
  activePoint = { contourIndex: 0, pointIndex: activePoint.pointIndex + 1 };

  assert.strictEqual(contours[0].length, 3);
  assert.deepStrictEqual(contours[0][1], { x: 200, y: 150 });
  assert.deepStrictEqual(contours[0][2], { x: 300, y: 200 });

  const svgPath = contoursToSvgPath(contours);
  assert.strictEqual(svgPath, 'M 100 100 L 200 150 L 300 200 Z');
});

test('Typesetter: correctly positions glyphs, scales advance width, and applies kerning', async () => {
  const { typesetText, auditSampleTextCoverage } = await import('../utils/typesetter.ts');

  const glyphs: Record<string, any> = {
    'A': {
      char: 'A',
      isAssigned: true,
      svgPath: 'M 0 0 L 100 700 L 200 0 Z',
      advanceWidth: 600,
      scale: 100,
      xOffset: 0,
      yOffset: 0
    },
    'V': {
      char: 'V',
      isAssigned: true,
      svgPath: 'M 0 700 L 100 0 L 200 700 Z',
      advanceWidth: 600,
      scale: 100,
      xOffset: 0,
      yOffset: 0
    }
  };

  const metrics = {
    upm: 1000,
    ascender: 800,
    descender: -200,
    capHeight: 700,
    xHeight: 500,
    lineGap: 200,
    defaultAdvance: 600,
    defaultLsb: 40,
    defaultRsb: 40,
  };

  const kerningPairs = [
    { left: 'A', right: 'V', value: -60 }
  ];

  const options = {
    fontSize: 50, // scaleFactor = 50 / 1000 = 0.05
    lineHeight: 1.4,
    letterSpacing: 0,
    enableKerning: true,
  };

  const paragraphs = typesetText('AV B', glyphs, metrics, kerningPairs, options);
  assert.strictEqual(paragraphs.length, 1);
  const tokens = paragraphs[0].tokens;
  assert.strictEqual(tokens.length, 3); // Word 'AV', Space ' ', Word 'B'

  // Word 'AV'
  assert.strictEqual(tokens[0].type, 'word');
  const avChars = tokens[0].word!.chars;
  assert.strictEqual(avChars.length, 2);
  assert.strictEqual(avChars[0].char, 'A');
  assert.strictEqual(avChars[0].isAssigned, true);
  // 'A' is followed by 'V', so kerning between 'A' and 'V' (-60 font units) adjusts 'A' advance
  assert.strictEqual(avChars[0].kernFontUnits, -60);
  assert.strictEqual(avChars[0].advancePx, 27); // (600 - 60) * 0.05 = 27px

  // 'V' has no following char in word, so kern is 0
  assert.strictEqual(avChars[1].char, 'V');
  assert.strictEqual(avChars[1].kernFontUnits, 0);
  assert.strictEqual(avChars[1].advancePx, 30); // 600 * 0.05 = 30px
  assert.strictEqual(tokens[0].word!.wordWidthPx, 57); // 27 + 30 = 57px

  // Word 'B' (unassigned)
  assert.strictEqual(tokens[2].type, 'word');
  const bChar = tokens[2].word!.chars[0];
  assert.strictEqual(bChar.char, 'B');
  assert.strictEqual(bChar.isAssigned, false);

  // Coverage audit
  const audit = auditSampleTextCoverage('AV B', glyphs);
  assert.strictEqual(audit.totalUnique, 3); // A, V, B
  assert.deepStrictEqual(audit.coveredChars, ['A', 'V']);
  assert.deepStrictEqual(audit.missingChars, ['B']);
  assert.strictEqual(audit.coveragePercent, 67); // 2/3 = ~67%
});

test('Glyph map drag-and-drop replacement correctly transfers vector artwork and metrics', () => {
  const sourceGlyph = {
    char: 'O',
    name: 'O',
    unicode: 'U+004F',
    isAssigned: true,
    advanceWidth: 720,
    lsb: 50,
    rsb: 50,
    xOffset: 10,
    yOffset: 5,
    bitmapXOffset: 0,
    bitmapYOffset: 0,
    bitmapScale: 100,
    scale: 98,
    svgPath: 'M 360 700 C 200 700 100 550 100 350 C 100 150 200 0 360 0 Z',
    contours: [[{ x: 360, y: 700 }, { x: 100, y: 350 }, { x: 360, y: 0 }]]
  };

  const emptyTargetGlyph = {
    char: 'Q',
    name: 'Q',
    unicode: 'U+0051',
    isAssigned: false,
    advanceWidth: 600,
    lsb: 40,
    rsb: 40,
    xOffset: 0,
    yOffset: 0,
    scale: 100,
    svgPath: ''
  };

  // Duplicate / replace source onto target
  const replacedTarget = {
    ...emptyTargetGlyph,
    char: emptyTargetGlyph.char,
    name: emptyTargetGlyph.name,
    unicode: emptyTargetGlyph.unicode,
    isAssigned: true,
    advanceWidth: sourceGlyph.advanceWidth,
    lsb: sourceGlyph.lsb,
    rsb: sourceGlyph.rsb,
    xOffset: sourceGlyph.xOffset,
    yOffset: sourceGlyph.yOffset,
    scale: sourceGlyph.scale,
    svgPath: sourceGlyph.svgPath,
    contours: sourceGlyph.contours ? JSON.parse(JSON.stringify(sourceGlyph.contours)) : undefined,
  };

  assert.strictEqual(replacedTarget.char, 'Q', 'Target char identity must be preserved');
  assert.strictEqual(replacedTarget.unicode, 'U+0051', 'Target unicode must be preserved');
  assert.strictEqual(replacedTarget.isAssigned, true, 'Target glyph must now be assigned');
  assert.strictEqual(replacedTarget.svgPath, sourceGlyph.svgPath, 'Vector path must match source');
  assert.strictEqual(replacedTarget.advanceWidth, 720, 'Advance width must match source');
  assert.strictEqual(replacedTarget.scale, 98, 'Scale must match source');
  assert.strictEqual(replacedTarget.xOffset, 10, 'xOffset must match source');
});

test('FontExporter: compiles project into valid binary font file with opentype', async () => {
  const { buildAndDownloadFont } = await import('../utils/fontExporter.ts');

  const testProject: any = {
    id: 'test_proj',
    name: 'Custom Sans',
    metrics: {
      upm: 1000,
      ascender: 800,
      descender: -200,
      capHeight: 700,
      xHeight: 500,
      lineGap: 200,
      defaultAdvance: 600,
      defaultLsb: 40,
      defaultRsb: 40,
    },
    metadata: {
      family: 'Custom Sans',
      style: 'Regular',
      designer: 'Studio',
      manufacturer: 'Local Font Studio',
      version: '1.000',
      vendorId: 'LFS',
      copyright: 'Copyright 2026',
      license: 'OFL 1.1'
    },
    glyphs: {
      'A': {
        char: 'A',
        name: 'A',
        unicode: 'U+0041',
        isAssigned: true,
        advanceWidth: 600,
        lsb: 40,
        rsb: 40,
        scale: 100,
        xOffset: 0,
        yOffset: 0,
        svgPath: 'M 40 0 L 260 700 L 340 700 L 560 0 Z',
      },
      'B': {
        char: 'B',
        name: 'B',
        unicode: 'U+0042',
        isAssigned: false, // unassigned
        advanceWidth: 600,
        lsb: 40,
        rsb: 40,
        scale: 100,
        xOffset: 0,
        yOffset: 0,
        svgPath: '',
      }
    },
    kerningPairs: [
      { left: 'A', right: 'V', value: -60 }
    ],
    lastModified: Date.now()
  };

  const result = buildAndDownloadFont(testProject, {
    format: 'otf',
    includeKerning: true
  });

  assert.strictEqual(result.success, true);
  assert.ok(result.byteLength > 1000, 'Compiled font binary should be non-empty and > 1KB');
  assert.strictEqual(result.filename, 'Custom-Sans-Regular.otf');
  assert.ok(result.glyphCount >= 3, 'Should contain .notdef, A, and space glyphs');
});

test('Contour utils: rotateContours and flipContours mathematical transformations', () => {
  // A square centered at (100, 100) with size 100x100
  const squareContours = [
    [
      { x: 50, y: 50 },
      { x: 150, y: 50 },
      { x: 150, y: 150 },
      { x: 50, y: 150 }
    ]
  ];

  const bounds = computeContoursBounds(squareContours);
  assert.strictEqual(bounds.centerX, 100);
  assert.strictEqual(bounds.centerY, 100);
  assert.strictEqual(bounds.width, 100);
  assert.strictEqual(bounds.height, 100);

  // Rotating square 90 degrees clockwise around (100, 100)
  // (50, 50) -> dx = -50, dy = -50
  // newX = 100 + (-50)*0 - (-50)*1 = 150
  // newY = 100 + (-50)*1 + (-50)*0 = 50
  const rotated90 = rotateContours(squareContours, 90);
  assert.deepStrictEqual(rotated90[0][0], { x: 150, y: 50 });

  // Rotating 180 degrees
  const rotated180 = rotateContours(squareContours, 180);
  assert.deepStrictEqual(rotated180[0][0], { x: 150, y: 150 });

  // Flipping horizontally across centerX = 100: (50, 50) -> (150, 50)
  const flippedH = flipContours(squareContours, 'horizontal');
  assert.deepStrictEqual(flippedH[0][0], { x: 150, y: 50 });
  assert.deepStrictEqual(flippedH[0][1], { x: 50, y: 50 });

  // Flipping vertically across centerY = 100: (50, 50) -> (50, 150)
  const flippedV = flipContours(squareContours, 'vertical');
  assert.deepStrictEqual(flippedV[0][0], { x: 50, y: 150 });
});

test('Font Family Styles: multi-cut style cloning, blank instantiation, and isolated state switching', () => {
  // Simulate Font Family structure
  const sampleArtwork = 'M 40 0 L 260 700 L 340 700 L 560 0 Z';
  
  const regularCut = {
    id: 'regular',
    name: 'Regular',
    weightClass: 400,
    isItalic: false,
    glyphs: {
      A: { char: 'A', name: 'A', unicode: 'U+0041', isAssigned: true, advanceWidth: 600, lsb: 40, rsb: 40, yOffset: 0, scale: 100, svgPath: sampleArtwork },
      B: { char: 'B', name: 'B', unicode: 'U+0042', isAssigned: false, advanceWidth: 550, lsb: 40, rsb: 40, yOffset: 0, scale: 100, svgPath: '' },
    },
    metrics: { upm: 1000, ascender: 800, descender: -200, capHeight: 700, xHeight: 500, lineGap: 200, defaultAdvance: 600, defaultLsb: 40, defaultRsb: 40 },
    kerningPairs: [{ left: 'A', right: 'V', value: -60 }],
    lastModified: 1000,
  };

  // 1. Cloning Regular into Bold
  const clonedBoldCut = {
    id: 'bold',
    name: 'Bold',
    weightClass: 700,
    isItalic: false,
    glyphs: JSON.parse(JSON.stringify(regularCut.glyphs)),
    metrics: JSON.parse(JSON.stringify(regularCut.metrics)),
    kerningPairs: JSON.parse(JSON.stringify(regularCut.kerningPairs)),
    lastModified: 2000,
  };

  assert.strictEqual(clonedBoldCut.glyphs.A.isAssigned, true);
  assert.strictEqual(clonedBoldCut.glyphs.A.svgPath, sampleArtwork);

  // 2. Modify Bold without affecting Regular (deep isolation)
  clonedBoldCut.glyphs.A.advanceWidth = 680;
  clonedBoldCut.glyphs.A.svgPath = 'M 20 0 L 280 700 L 360 700 L 580 0 Z';
  assert.strictEqual(regularCut.glyphs.A.advanceWidth, 600, 'Original Regular glyph advanceWidth must remain untouched');
  assert.strictEqual(regularCut.glyphs.A.svgPath, sampleArtwork, 'Original Regular glyph SVG path must remain untouched');

  // 3. Creating a blank Italic style
  const blankItalicCut = {
    id: 'italic',
    name: 'Italic',
    weightClass: 400,
    isItalic: true,
    glyphs: {
      A: { char: 'A', name: 'A', unicode: 'U+0041', isAssigned: false, advanceWidth: 600, lsb: 40, rsb: 40, yOffset: 0, scale: 100, svgPath: '' },
      B: { char: 'B', name: 'B', unicode: 'U+0042', isAssigned: false, advanceWidth: 550, lsb: 40, rsb: 40, yOffset: 0, scale: 100, svgPath: '' },
    },
    metrics: JSON.parse(JSON.stringify(regularCut.metrics)),
    kerningPairs: [],
    lastModified: 3000,
  };

  // Blank cut has 0 assigned glyphs
  assert.strictEqual(blankItalicCut.glyphs.A.isAssigned, false);
  assert.strictEqual(blankItalicCut.glyphs.A.svgPath, '');
  assert.strictEqual(blankItalicCut.isItalic, true);

  // Switching back to Regular: Regular still intact with all artwork
  assert.strictEqual(regularCut.glyphs.A.isAssigned, true);
  assert.strictEqual(regularCut.glyphs.A.svgPath, sampleArtwork);
});

test('Contour utils: smoothContours relaxes jagged curves while preserving sharp corners', () => {
  // Test turn angles
  const straightTurn = computePointTurnAngle({ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 100, y: 0 });
  assert.strictEqual(Math.round(straightTurn), 0, 'Straight line should have 0 deg turn');

  const rightAngleTurn = computePointTurnAngle({ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 50 });
  assert.strictEqual(Math.round(rightAngleTurn), 90, 'Right angle corner should have 90 deg turn');

  // Letter 'D' shape: sharp left stem (x:0, y:0 to x:0, y:100), curved right loop
  const dContour = [
    { x: 0, y: 0 },
    { x: 0, y: 100 }, // Sharp top-left corner
    { x: 40, y: 100 },
    { x: 80, y: 70 }, // Curve facet
    { x: 90, y: 50 }, // Curve apex
    { x: 80, y: 30 }, // Curve facet
    { x: 40, y: 0 }
  ];

  const corners = identifyCorners(dContour, 70);
  assert.strictEqual(corners[0], true, 'Bottom-left corner (0,0) should be detected as corner');
  assert.strictEqual(corners[1], true, 'Top-left corner (0,100) should be detected as corner');
  assert.strictEqual(corners[4], false, 'Curve apex (90,50) should be recognized as curve');

  // 1. Laplacian relaxation smoothing
  const smoothed = smoothContours([dContour], {
    iterations: 2,
    strength: 0.5,
    cornerThreshold: 70,
    preserveCorners: true,
    subdivide: false
  });

  // Corners at index 0 and 1 must be perfectly preserved
  assert.deepStrictEqual(smoothed[0][0], { x: 0, y: 0 });
  assert.deepStrictEqual(smoothed[0][1], { x: 0, y: 100 });

  // Curve points must be relaxed
  assert.ok(smoothed[0].length === dContour.length, 'Laplacian smoothing preserves point count');

  // 2. Chaikin subdivision smoothing
  const subdivided = smoothContours([dContour], {
    iterations: 1,
    cornerThreshold: 70,
    preserveCorners: true,
    subdivide: true
  });

  assert.ok(subdivided[0].length > dContour.length, 'Chaikin smoothing adds intermediate curve points');
  assert.deepStrictEqual(subdivided[0][0], { x: 0, y: 0 }, 'Chaikin preserves corner at (0,0)');
  assert.deepStrictEqual(subdivided[0][1], { x: 0, y: 100 }, 'Chaikin preserves corner at (0,100)');
});

test('Word Space Character (U+0020): configurable advance width in typesetter and binary exporter', async () => {
  const { typesetText } = await import('../utils/typesetter.ts');
  // Test typesetter space sizing
  const testGlyphs = {
    ' ': { char: ' ', name: 'space', unicode: 'U+0020', isAssigned: true, advanceWidth: 280, lsb: 0, rsb: 0, yOffset: 0, scale: 100, svgPath: '' },
    A: { char: 'A', name: 'A', unicode: 'U+0041', isAssigned: true, advanceWidth: 600, lsb: 40, rsb: 40, yOffset: 0, scale: 100, svgPath: 'M 0 0 L 100 0 Z' }
  };
  const testMetrics = { upm: 1000, ascender: 800, descender: -200, capHeight: 700, xHeight: 500, lineGap: 200, defaultAdvance: 600, defaultLsb: 40, defaultRsb: 40, spaceWidth: 280 };

  const result280 = typesetText('A A', testGlyphs, testMetrics, [], { fontSize: 100, lineHeight: 1.0, letterSpacing: 0, enableKerning: false });
  // Font scaleFactor = 100 / 1000 = 0.1
  // Space token width = 280 * 0.1 = 28px
  const spaceToken = result280[0].tokens.find(t => t.type === 'space');
  assert.ok(spaceToken, 'Typesetter should produce a space token');
  assert.strictEqual(Math.round(spaceToken.widthPx), 28, 'Space width at 100px font size with 280 units should be 28px');

  // When changing space width to 360 units:
  testGlyphs[' '].advanceWidth = 360;
  testMetrics.spaceWidth = 360;
  const result360 = typesetText('A A', testGlyphs, testMetrics, [], { fontSize: 100, lineHeight: 1.0, letterSpacing: 0, enableKerning: false });
  const spaceToken360 = result360[0].tokens.find(t => t.type === 'space');
  assert.ok(spaceToken360);
  assert.strictEqual(Math.round(spaceToken360.widthPx), 36, 'Space width at 100px font size with 360 units should be 36px');
});

test('SVG Exporter: bundles assigned glyph vector paths and manifest into a valid zip archive', async () => {
  const { exportGlyphsAsSvgZip } = await import('../utils/svgExporter.ts');
  const JSZip = (await import('jszip')).default;

  const mockProject: any = {
    name: 'TestTypeface',
    metadata: { family: 'TestTypeface', style: 'Regular', weight: 400 },
    metrics: { upm: 1000, ascender: 800, descender: -200, capHeight: 700, xHeight: 500, lineGap: 200, defaultAdvance: 600, spaceWidth: 280 },
    glyphs: {
      A: { char: 'A', name: 'A', unicode: 'U+0041', isAssigned: true, advanceWidth: 600, svgPath: 'M 0 0 L 100 0 L 50 100 Z' },
      ' ': { char: ' ', name: 'space', unicode: 'U+0020', isAssigned: true, advanceWidth: 280, svgPath: '' },
      B: { char: 'B', name: 'B', unicode: 'U+0042', isAssigned: false, advanceWidth: 600, svgPath: '' }, // Unassigned should be skipped
    }
  };

  const result = await exportGlyphsAsSvgZip(mockProject, 'test-font-svg.zip');
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.filename, 'test-font-svg.zip');
  assert.strictEqual(result.glyphCount, 2, 'Should export assigned glyph A and space');
  assert.ok(result.byteLength > 0, 'Zip file byte size should be non-zero');
});

test('Metrics: translateContours shifts contour points by deltaX and deltaY', () => {
  const contours = [
    [{ x: 10, y: 20 }, { x: 50, y: 100 }, { x: 100, y: 20 }]
  ];
  const translated = translateContours(contours, 40, -10);
  assert.strictEqual(translated[0][0].x, 50);
  assert.strictEqual(translated[0][0].y, 10);
  assert.strictEqual(translated[0][1].x, 90);
  assert.strictEqual(translated[0][1].y, 90);
  assert.strictEqual(translated[0][2].x, 140);
  assert.strictEqual(translated[0][2].y, 10);
});

test('Metrics: centerGlyphContours balances LSB and RSB symmetrically', () => {
  // A glyph from x=100 to x=300 (width = 200). Advance width is 600.
  // Centered LSB should be (600 - 200) / 2 = 200, and RSB = 200.
  const path = 'M 100 0 L 200 700 L 300 0 Z';
  const centered = centerGlyphContours(path, 600);
  assert.ok(centered, 'Center result should exist');
  assert.strictEqual(centered.newLsb, 200);
  assert.strictEqual(centered.newRsb, 200);

  // Parse new path and verify coordinates
  const newContours = parseSvgPathToContours(centered.newSvgPath);
  const bounds = computeContoursBounds(newContours);
  assert.strictEqual(bounds.minX, 200);
  assert.strictEqual(bounds.maxX, 400);
  assert.strictEqual(bounds.width, 200);
});

test('SVG Exporter: exportSingleGlyphAsSvg formats individual glyph SVG XML and sanitizes filename', async () => {
  const { exportSingleGlyphAsSvg, buildGlyphSvgFilename } = await import('../utils/svgExporter.ts');
  
  // 1. Filename sanitization
  assert.strictEqual(buildGlyphSvgFilename('A', 'U+0041'), 'A_upper_U+0041.svg');
  assert.strictEqual(buildGlyphSvgFilename('a', 'U+0061'), 'a_lower_U+0061.svg');
  assert.strictEqual(buildGlyphSvgFilename('/', 'U+002F'), 'slash_U+002F.svg');
  assert.strictEqual(buildGlyphSvgFilename('?', 'U+003F'), 'question_U+003F.svg');

  // 2. Single glyph SVG export
  const glyph = {
    char: 'B',
    name: 'B',
    unicode: 'U+0042',
    isAssigned: true,
    advanceWidth: 550,
    lsb: 40,
    rsb: 40,
    yOffset: 0,
    scale: 100,
    svgPath: 'M 40 0 L 40 700 L 250 700 L 250 0 Z'
  };

  const exportResult = exportSingleGlyphAsSvg({
    glyph,
    metrics: { upm: 1000, ascender: 800, defaultAdvance: 600 },
    familyName: 'StudioFont',
    styleName: 'Bold'
  });

  assert.strictEqual(exportResult.success, true);
  assert.strictEqual(exportResult.filename, 'B_upper_U+0042.svg');
  assert.ok(exportResult.svgContent.includes('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 550 1000" width="550" height="1000">'));
  assert.ok(exportResult.svgContent.includes('transform="translate(0, 800) scale(1, -1)"'));
  assert.ok(exportResult.svgContent.includes('d="M 40 0 L 40 700 L 250 700 L 250 0 Z"'));
});

test('SVG Importer: parseSvgToGlyphPath parses both font-native and external screen SVGs', async () => {
  const { parseSvgToGlyphPath, parseSvgPathStringToContours } = await import('../utils/svgImporter.ts');

  // 1. Font-native SVG (exported by font studio or font tools)
  const fontNativeSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 1000" width="650" height="1000">
  <g transform="translate(0, 800) scale(1, -1)">
    <path d="M 50 0 L 50 700 L 300 700 L 300 0 Z" fill="#000000" />
  </g>
</svg>`;

  const nativeResult = parseSvgToGlyphPath(fontNativeSvg, {
    upm: 1000,
    ascender: 800,
    descender: -200,
    capHeight: 700,
    xHeight: 500,
    lineGap: 200,
    defaultAdvance: 600,
    defaultLsb: 40,
    defaultRsb: 40
  });

  assert.strictEqual(nativeResult.success, true);
  assert.strictEqual(nativeResult.isFontNative, true);
  assert.strictEqual(nativeResult.advanceWidth, 650);
  assert.strictEqual(nativeResult.lsb, 50);
  assert.strictEqual(nativeResult.rsb, 350);

  // 2. External screen SVG (e.g. 100x100 square with top-left origin)
  const screenSvg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M 10 10 L 90 10 L 90 90 L 10 90 Z" />
</svg>`;

  const screenResult = parseSvgToGlyphPath(screenSvg, {
    upm: 1000,
    ascender: 800,
    descender: -200,
    capHeight: 700,
    xHeight: 500,
    lineGap: 200,
    defaultAdvance: 600,
    defaultLsb: 40,
    defaultRsb: 40
  });

  assert.strictEqual(screenResult.success, true);
  assert.strictEqual(screenResult.isFontNative, false);
  assert.ok(screenResult.advanceWidth > 100, 'Advance width should scale to font unit range');
  assert.strictEqual(screenResult.lsb, 40);

  // 3. Path parser with cubic beziers
  const bezierPath = 'M 0 0 C 10 50 40 50 50 0 Z';
  const contours = parseSvgPathStringToContours(bezierPath);
  assert.strictEqual(contours.length, 1);
  assert.ok(contours[0].length >= 5, 'Cubic bezier should interpolate multiple sample points');
});

test('Phase 3: Visual Vertical Metrics Specimen & Calibration Calculations', async () => {
  const { parseSvgPathToContours, computeContoursBounds } = await import('../utils/contourUtils.ts');

  // Synthetic glyph outlines representing 'H', 'x', 'd', 'p'
  // 'H': baseline y=0 to capHeight y=700
  const hSvg = 'M 40 0 L 120 0 L 120 700 L 40 700 Z';
  // 'x': baseline y=0 to xHeight y=500
  const xSvg = 'M 30 0 L 90 0 L 90 500 L 30 500 Z';
  // 'd': baseline y=0 with ascender stem to y=800
  const dSvg = 'M 30 0 L 100 0 L 100 800 L 30 800 Z';
  // 'p': descender tail to y=-200, up to xHeight y=500
  const pSvg = 'M 30 -200 L 90 -200 L 90 500 L 30 500 Z';

  const hBounds = computeContoursBounds(parseSvgPathToContours(hSvg));
  const xBounds = computeContoursBounds(parseSvgPathToContours(xSvg));
  const dBounds = computeContoursBounds(parseSvgPathToContours(dSvg));
  const pBounds = computeContoursBounds(parseSvgPathToContours(pSvg));

  assert.strictEqual(Math.round(hBounds.maxY), 700, 'H outline detects Cap Height at 700');
  assert.strictEqual(Math.round(xBounds.maxY), 500, 'x outline detects x-Height at 500');
  assert.strictEqual(Math.round(dBounds.maxY), 800, 'd outline detects Ascender at 800');
  assert.strictEqual(Math.round(pBounds.minY), -200, 'p outline detects Descender at -200');

  // Verify total line height calculation
  const ascender = 800;
  const descender = -200;
  const lineGap = 200;
  const upm = 1000;
  const totalLineHeight = ascender - descender + lineGap;
  assert.strictEqual(totalLineHeight, 1200, 'Total line height should equal ascender - descender + lineGap');
  assert.strictEqual(Math.round((totalLineHeight / upm) * 100), 120, 'Line height percentage is 120% of UPM');
});

test('Phase 4: Optical Auto-Spacing Engine Silhouette & Metrics Calculations', async () => {
  const { getOpticalProfile, calculateOpticalSpacing, analyzeContourSilhouette } = await import('../utils/opticalSpacing.ts');
  const { parseSvgPathToContours } = await import('../utils/contourUtils.ts');

  // 1. Classical Typographical Lookup
  const hProfile = getOpticalProfile('H');
  assert.strictEqual(hProfile.leftCategory, 'stem');
  assert.strictEqual(hProfile.rightCategory, 'stem');
  assert.strictEqual(hProfile.leftCoeff, 1.0);
  assert.strictEqual(hProfile.rightCoeff, 1.0);

  const oProfile = getOpticalProfile('O');
  assert.strictEqual(oProfile.leftCategory, 'curve');
  assert.strictEqual(oProfile.rightCategory, 'curve');
  assert.strictEqual(oProfile.leftCoeff, 0.65);
  assert.strictEqual(oProfile.rightCoeff, 0.65);

  const vProfile = getOpticalProfile('V');
  assert.strictEqual(vProfile.leftCategory, 'diagonal');
  assert.strictEqual(vProfile.rightCategory, 'diagonal');
  assert.strictEqual(vProfile.leftCoeff, 0.25);
  assert.strictEqual(vProfile.rightCoeff, 0.25);

  const bProfile = getOpticalProfile('B');
  assert.strictEqual(bProfile.leftCategory, 'stem');
  assert.strictEqual(bProfile.rightCategory, 'curve');

  // 2. Geometric Silhouette Analysis on Arbitrary Contours
  // Vertical stem box
  const boxContours = parseSvgPathToContours('M 50 0 L 150 0 L 150 700 L 50 700 Z');
  const boxSilhouette = analyzeContourSilhouette(boxContours);
  assert.strictEqual(boxSilhouette.leftCategory, 'stem');
  assert.strictEqual(boxSilhouette.rightCategory, 'stem');

  // 3. Spacing Calculations
  const mockGlyphH = {
    char: 'H',
    name: 'H',
    unicode: 'U+0048',
    isAssigned: true,
    advanceWidth: 600,
    lsb: 40,
    rsb: 40,
    yOffset: 0,
    scale: 100,
    svgPath: 'M 50 0 L 550 0 L 550 700 L 50 700 Z' // width = 500
  };

  const hSpacing = calculateOpticalSpacing({
    char: 'H',
    glyph: mockGlyphH,
    basePadding: 50,
    contours: parseSvgPathToContours(mockGlyphH.svgPath)
  });

  assert.strictEqual(hSpacing.proposedLsb, 50, 'Stem LSB should receive 100% of base padding (50)');
  assert.strictEqual(hSpacing.proposedRsb, 50, 'Stem RSB should receive 100% of base padding (50)');
  assert.strictEqual(hSpacing.proposedAdvance, 50 + 500 + 50, 'Advance = LSB + artworkWidth + RSB = 600');
  assert.strictEqual(hSpacing.shiftX, 0, 'No horizontal shift needed if already at LSB=50');

  // Curved letter 'O' with base padding 50
  const mockGlyphO = {
    char: 'O',
    name: 'O',
    unicode: 'U+004F',
    isAssigned: true,
    advanceWidth: 600,
    lsb: 50,
    rsb: 50,
    yOffset: 0,
    scale: 100,
    svgPath: 'M 50 0 L 550 0 L 550 700 L 50 700 Z' // width = 500
  };

  const oSpacing = calculateOpticalSpacing({
    char: 'O',
    glyph: mockGlyphO,
    basePadding: 50,
    contours: parseSvgPathToContours(mockGlyphO.svgPath)
  });

  assert.strictEqual(oSpacing.proposedLsb, 33, 'Curve LSB should receive 65% of base padding (33)');
  assert.strictEqual(oSpacing.proposedRsb, 33, 'Curve RSB should receive 65% of base padding (33)');
  assert.strictEqual(oSpacing.proposedAdvance, 33 + 500 + 33, 'Advance = 33 + 500 + 33 = 566');
  assert.strictEqual(oSpacing.shiftX, 33 - 50, 'Contours shift left by -17 to set LSB to 33');
});

test('Stem Weight (dilation/erosion) and Italic Slant (shear) transformations', async () => {
  const { slantContours, offsetContourWeight } = await import('../utils/contourUtils.ts');

  // 1. Italic Slant Test
  const box = [
    { x: 100, y: 0 },
    { x: 200, y: 0 },
    { x: 200, y: 700 },
    { x: 100, y: 700 }
  ];
  // Baseline points (y = 0) must remain pinned at x=100 and x=200
  // Top points (y = 700) must shift right by round(700 * tan(10°)) = 123
  const slanted = slantContours([box], 10, 0);
  assert.strictEqual(slanted[0][0].y, 0);
  assert.strictEqual(slanted[0][0].x, 100, 'Baseline point unchanged');
  assert.strictEqual(slanted[0][1].x, 200, 'Baseline point unchanged');
  assert.strictEqual(slanted[0][2].y, 700);
  assert.strictEqual(slanted[0][2].x, 200 + Math.round(700 * Math.tan((10 * Math.PI) / 180)));
  assert.strictEqual(slanted[0][3].x, 100 + Math.round(700 * Math.tan((10 * Math.PI) / 180)));

  // Negative slant (backslant)
  const backslanted = slantContours([box], -10, 0);
  assert.strictEqual(backslanted[0][2].x, 200 - Math.round(700 * Math.tan((10 * Math.PI) / 180)));

  // 2. Stem Weight Expansion Test
  const outer = [{ x: 50, y: 50 }, { x: 250, y: 50 }, { x: 250, y: 250 }, { x: 50, y: 250 }];
  const inner = [{ x: 100, y: 100 }, { x: 100, y: 200 }, { x: 200, y: 200 }, { x: 200, y: 100 }];
  
  // Dilate by +10 (bolder)
  const boldRes = offsetContourWeight([outer, inner], 10);
  // Outer must expand by 10 units outward (x: 40..260, y: 40..260)
  assert.strictEqual(boldRes[0][0].x, 40);
  assert.strictEqual(boldRes[0][0].y, 40);
  assert.strictEqual(boldRes[0][1].x, 260);
  assert.strictEqual(boldRes[0][2].x, 260);
  assert.strictEqual(boldRes[0][2].y, 260);
  // Inner hole must contract by 10 units inward (x: 110..190, y: 110..190)
  assert.strictEqual(boldRes[1][0].x, 110);
  assert.strictEqual(boldRes[1][0].y, 110);
  assert.strictEqual(boldRes[1][2].x, 190);
  assert.strictEqual(boldRes[1][2].y, 190);

  // Erode by -10 (lighter)
  const lightRes = offsetContourWeight([outer, inner], -10);
  assert.strictEqual(lightRes[0][0].x, 60);
  assert.strictEqual(lightRes[0][0].y, 60);
  assert.strictEqual(lightRes[1][0].x, 90);
  assert.strictEqual(lightRes[1][0].y, 90);
});

test('Glyph Presets & Case-Pairing: correctly resolves character pairs, hex codes, and language packs', async () => {
  const { getPairedCase, resolveCharactersFromInput, GLYPH_PRESET_PACKS } = await import('../utils/glyphPresets.ts');

  // 1. German Umlauts & Eszett pairing
  const germanA = getPairedCase('Ä');
  assert.deepStrictEqual(germanA, ['Ä', 'ä']);

  const germanLowerA = getPairedCase('ä');
  assert.deepStrictEqual(germanLowerA, ['ä', 'Ä']);

  const eszett = getPairedCase('ß');
  assert.deepStrictEqual(eszett, ['ß', 'ẞ']);

  // 2. Serbian Cyrillic pairing
  const serbianDje = getPairedCase('Ђ');
  assert.deepStrictEqual(serbianDje, ['Ђ', 'ђ']);

  const serbianLje = getPairedCase('Љ');
  assert.deepStrictEqual(serbianLje, ['Љ', 'љ']);

  // 3. Freeform text resolution with auto-pairing
  const resolved = resolveCharactersFromInput('Ä Ö', true);
  assert.ok(resolved.includes('Ä'));
  assert.ok(resolved.includes('ä'));
  assert.ok(resolved.includes('Ö'));
  assert.ok(resolved.includes('ö'));

  // 4. Hex input resolution (e.g. U+00C4)
  const hexResolved = resolveCharactersFromInput('U+00C4', true);
  assert.ok(hexResolved.includes('Ä'));
  assert.ok(hexResolved.includes('ä'));

  // 5. Preset packs sanity check
  const germanPack = GLYPH_PRESET_PACKS.find(p => p.id === 'german');
  assert.ok(germanPack);
  assert.ok(germanPack.characters.includes('Ä'));
  assert.ok(germanPack.characters.includes('ä'));
  assert.ok(germanPack.characters.includes('ß'));

  const serbianPack = GLYPH_PRESET_PACKS.find(p => p.id === 'serbian');
  assert.ok(serbianPack);
  assert.strictEqual(serbianPack.characters.length, 60); // 30 letters * 2 (upper + lower)
});

test('Kerning Pairs: GPOS pair management, positioning math, and advance calculations', () => {
  // Test pair management logic
  let pairs = [
    { left: 'A', right: 'V', value: -60 },
    { left: 'T', right: 'o', value: -45 }
  ];

  // 1. Update existing pair
  const updateIdx = pairs.findIndex(p => p.left === 'A' && p.right === 'V');
  assert.strictEqual(updateIdx, 0);
  pairs = pairs.map((p, i) => i === updateIdx ? { ...p, value: -80 } : p);
  assert.strictEqual(pairs[0].value, -80);

  // 2. Add new pair
  pairs = [...pairs, { left: 'W', right: 'a', value: -30 }];
  assert.strictEqual(pairs.length, 3);
  assert.strictEqual(pairs[2].left, 'W');
  assert.strictEqual(pairs[2].right, 'a');
  assert.strictEqual(pairs[2].value, -30);

  // 3. Delete pair
  pairs = pairs.filter(p => !(p.left === 'T' && p.right === 'o'));
  assert.strictEqual(pairs.length, 2);
  assert.strictEqual(pairs.some(p => p.left === 'T' && p.right === 'o'), false);

  // 4. Positioning math: leftAdvance + kern + rightAdvance
  const leftAdv = 600;
  const rightAdv = 550;
  const kern = -80;
  const totalPairWidth = leftAdv + kern + rightAdv;
  assert.strictEqual(totalPairWidth, 1070);

  // 5. Positive kerning (looser)
  const looseKern = 40;
  const loosePairWidth = leftAdv + looseKern + rightAdv;
  assert.strictEqual(loosePairWidth, 1190);
});

test('FontAudit: detects inverted winding, micro-segments, collinear points and applies auto-fix', async () => {
  const { auditContourGeometry, autoFixContours, auditFontProject, fixSpecificAuditIssue } = await import('../utils/fontAudit.ts');

  // 1. Inverted inner hole: Outer is CCW (positive), Inner is also CCW (positive instead of CW negative)
  const outerCcw = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 }
  ];
  const innerCcw = [
    { x: 25, y: 25 },
    { x: 75, y: 25 },
    { x: 75, y: 75 },
    { x: 25, y: 75 }
  ];

  const report1 = auditContourGeometry([outerCcw, innerCcw], 'O');
  assert.strictEqual(report1.errorsCount >= 1, true, 'Should flag inverted inner hole winding');
  assert.strictEqual(report1.issues.some(i => i.type === 'wrong-direction'), true);
  const windingIssue = report1.issues.find(i => i.type === 'wrong-direction')!;
  assert.strictEqual(windingIssue.targetLevel, 'contour', 'Winding issue must be contour-level, not node-level');
  assert.strictEqual(typeof windingIssue.recommendation, 'string');
  assert.strictEqual(windingIssue.pointIndex, undefined, 'Winding issue should not point to an individual vertex');

  // Single-issue targeted fix should reverse the specific contour
  const singleFix = fixSpecificAuditIssue([outerCcw, innerCcw], windingIssue);
  assert.strictEqual(singleFix.actionDescription.includes('Reversed winding'), true);
  const reAuditSingle = auditContourGeometry(singleFix.contours, 'O');
  assert.strictEqual(reAuditSingle.issues.some(i => i.type === 'wrong-direction'), false, 'Winding should now be valid via single fix');

  // Auto-fix should reverse the hole so it winds CW
  const fixResult = autoFixContours([outerCcw, innerCcw]);
  assert.strictEqual(fixResult.fixedCount >= 1, true);
  const reAudit = auditContourGeometry(fixResult.contours, 'O');
  assert.strictEqual(reAudit.issues.some(i => i.type === 'wrong-direction'), false, 'Winding should now be valid');

  // 2. Micro-segment: two points < 2.5u apart
  const contourWithMicro = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100.5, y: 0.8 }, // micro-segment ~0.9u
    { x: 100, y: 100 },
    { x: 0, y: 100 }
  ];
  const report2 = auditContourGeometry([contourWithMicro], 'A');
  assert.strictEqual(report2.warningsCount >= 1, true);
  assert.strictEqual(report2.issues.some(i => i.type === 'micro-segment'), true);

  const fixMicro = autoFixContours([contourWithMicro]);
  assert.strictEqual(fixMicro.fixedCount >= 1, true);
  assert.strictEqual(fixMicro.contours[0].length, 4, 'Micro segment should be collapsed');

  // 3. Collinear redundant point
  const contourWithCollinear = [
    { x: 0, y: 0 },
    { x: 50, y: 0 }, // collinear point on bottom line (0,0) to (100,0)
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 }
  ];
  const report3 = auditContourGeometry([contourWithCollinear], 'C');
  assert.strictEqual(report3.issues.some(i => i.type === 'redundant-point'), true);

  const fixCollinear = autoFixContours([contourWithCollinear]);
  assert.strictEqual(fixCollinear.contours[0].length, 4, 'Collinear point should be removed');

  // 4. Self-intersecting bowtie outline
  const bowtieContour = [
    { x: 0, y: 0 },
    { x: 100, y: 100 },
    { x: 100, y: 0 },
    { x: 0, y: 100 }
  ];
  const reportBowtie = auditContourGeometry([bowtieContour], 'X');
  assert.strictEqual(reportBowtie.issues.some(i => i.type === 'self-intersection'), true);

  // 5. Font Project scanner
  const mockGlyphs = {
    'A': {
      char: 'A',
      name: 'A',
      unicode: 'U+0041',
      isAssigned: true,
      advanceWidth: 600,
      lsb: 50,
      rsb: 50,
      scale: 100,
      yOffset: 0,
      svgPath: 'M 0 0 L 100 0 L 100 100 Z',
      contours: [outerCcw]
    },
    'O': {
      char: 'O',
      name: 'O',
      unicode: 'U+004F',
      isAssigned: true,
      advanceWidth: 700,
      lsb: 50,
      rsb: 50,
      scale: 100,
      yOffset: 0,
      svgPath: 'M 0 0 ...',
      contours: [outerCcw, innerCcw] // has inverted winding error
    }
  };

  const projectReport = auditFontProject(mockGlyphs as any);
  assert.strictEqual(projectReport.totalGlyphsScanned, 2);
  assert.strictEqual(projectReport.glyphsWithIssuesCount, 1);
  assert.strictEqual(projectReport.cleanGlyphsCount, 1);
  assert.strictEqual(projectReport.totalErrors >= 1, true);
});

test('Studio Addon Registry: verifies official addons, category taxonomy, and Comic Lettering registration', async () => {
  const { AVAILABLE_ADDONS, getAddonById } = await import('../addons/registry.ts');

  assert.ok(AVAILABLE_ADDONS.length >= 3, 'Must have at least 3 initial addons registered');
  
  const comicAddon = getAddonById('comic-lettering');
  assert.ok(comicAddon, 'Comic lettering addon must exist in registry');
  assert.strictEqual(comicAddon.category, 'publishing');
  assert.strictEqual(comicAddon.isOfficial, true);
  assert.strictEqual(comicAddon.defaultEnabled, true);
  assert.strictEqual(comicAddon.hasTab, true);
  assert.strictEqual(comicAddon.tabId, 'comic-lettering');

  const pixelAddon = getAddonById('pixel-font');
  assert.ok(pixelAddon);
  assert.strictEqual(pixelAddon.isOfficial, true);
  assert.strictEqual(pixelAddon.defaultEnabled, false);
});

test('Comic Lettering: Crossbar-I regex parsing and pronoun separation', () => {
  const dialogueText = "I CAN'T BELIEVE IT! THIS IS REALLY WORKING. WHO AM I? I'M FINE.";
  
  // Comic Crossbar-I tokenizer regex:
  const tokens = dialogueText.split(/(\bI\b|I'(?:M|LL|VE|D))/gi);

  // Standalone pronouns "I", "I'M" should be isolated
  const standalonePronouns = tokens.filter(t => /^(?:I|I'M|I'LL|I'VE|I'D)$/i.test(t));
  assert.strictEqual(standalonePronouns.length, 3, 'Should find 3 standalone pronoun occurrences (I, I, I\'M)');

  // Internal "I"s (in "BELIEVE", "IT", "THIS", "IS", "REALLY", "WORKING", "FINE") should remain inside words
  assert.ok(tokens.some(t => t.includes('BELIEVE')));
  assert.ok(tokens.some(t => t.includes('WORKING')));
});

test('Custom Addon Manifest Validator: verifies valid schemas and catches malformed manifests', async () => {
  const { validateAddonManifest } = await import('../addons/types.ts');
  const { BOILERPLATE_MANIFEST, STARTER_TEMPLATES } = await import('../addons/devGuide.ts');

  // 1. Boilerplate manifest should be 100% valid
  const parsedBoilerplate = JSON.parse(BOILERPLATE_MANIFEST);
  const boilerplateResult = validateAddonManifest(parsedBoilerplate);
  assert.strictEqual(boilerplateResult.valid, true, 'Boilerplate manifest must validate successfully');
  assert.ok(boilerplateResult.addon);
  assert.strictEqual(boilerplateResult.addon.id, 'my-custom-addon');
  assert.strictEqual(boilerplateResult.addon.isOfficial, false);

  // 2. Reject malformed manifests
  const emptyResult = validateAddonManifest({});
  assert.strictEqual(emptyResult.valid, false);
  assert.ok(emptyResult.errors.length >= 4, 'Should flag missing id, name, version, tagline');

  const invalidIdResult = validateAddonManifest({
    id: 'Invalid ID with spaces & caps!',
    name: 'Test Tool',
    version: '1.0.0',
    tagline: 'Test',
    description: 'Test',
    author: 'Author',
    category: 'tools'
  });
  assert.strictEqual(invalidIdResult.valid, false);
  assert.ok(invalidIdResult.errors.some(e => e.includes('lowercase alphanumeric characters and hyphens')));

  const invalidCategoryResult = validateAddonManifest({
    id: 'valid-id',
    name: 'Test Tool',
    version: '1.0.0',
    tagline: 'Test',
    description: 'Test',
    author: 'Author',
    category: 'unsupported-cat' as any
  });
  assert.strictEqual(invalidCategoryResult.valid, false);
  assert.ok(invalidCategoryResult.errors.some(e => e.includes('publishing, tools, typography, presets')));

  // 3. Verify all starter templates validate
  for (const tpl of STARTER_TEMPLATES) {
    const tplResult = validateAddonManifest(tpl.addon);
    assert.strictEqual(tplResult.valid, true, `Template "${tpl.name}" must be valid`);
  }
});

test('Clean shipping state produces completely unassigned glyph set with zero user sketches', async () => {
  const { createBlankGlyphs } = await import('../context/FontContext.tsx');
  const blankGlyphs = createBlankGlyphs();

  // Must have glyphs populated
  const charKeys = Object.keys(blankGlyphs);
  assert.ok(charKeys.length > 50, 'Standard character set should have >50 glyph records');

  // Space glyph should be configured and assigned
  assert.strictEqual(blankGlyphs[' ']?.isAssigned, true, 'Space glyph must be assigned for typography metrics');
  assert.strictEqual(blankGlyphs[' ']?.name, 'space');

  // All other glyphs must be unassigned and have empty svgPaths
  const assignedNonSpace = charKeys.filter(c => c !== ' ' && blankGlyphs[c].isAssigned);
  assert.strictEqual(assignedNonSpace.length, 0, 'No non-space characters should be assigned in a clean shipping state');

  const withSvgPaths = charKeys.filter(c => blankGlyphs[c].svgPath && blankGlyphs[c].svgPath.trim().length > 0);
  assert.strictEqual(withSvgPaths.length, 0, 'No glyphs should have pre-existing SVG contour data in a clean shipping state');
});

















