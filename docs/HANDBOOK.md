# Local Font Studio — Complete Typography & Engineering Handbook

> A comprehensive reference guide for creating, digitizing, spacing, kerning, and compiling production-ready OpenType and TrueType fonts with Local Font Studio.

---

## Table of Contents

- [Chapter 1: Quick Start & Studio Workflow](#chapter-1-quick-start--studio-workflow)
- [Chapter 2: Bitmap Tracing & Scanning](#chapter-2-bitmap-tracing--scanning)
- [Chapter 3: Glyph Vector & Bezier Editor](#chapter-3-glyph-vector--bezier-editor)
- [Chapter 4: Metrics & Optical Auto-Spacing](#chapter-4-metrics--optical-auto-spacing)
- [Chapter 5: Kerning Pairs & Visual Rhythm](#chapter-5-kerning-pairs--visual-rhythm)
- [Chapter 6: Font Family Cuts & Style Interpolation](#chapter-6-font-family-cuts--style-interpolation)
- [Chapter 7: Character Sets & Multilingual Glyphs](#chapter-7-character-sets--multilingual-glyphs)
- [Chapter 8: Compiling, Exporting & Licensing](#chapter-8-compiling-exporting--licensing)
- [Chapter 9: Keyboard Shortcuts & Gestures](#chapter-9-keyboard-shortcuts--gestures)

---

## Chapter 1: Quick Start & Studio Workflow

### The 5-Stage Typeface Pipeline
Local Font Studio is a local-first, in-browser font foundry application. You can design, trace, space, kern, and compile production-ready OpenType and TrueType fonts without installing desktop software or transmitting your intellectual property to the cloud.

1. **Family Definition**: Configure UPM (units per em), styles (Regular, Bold, Italic), and font metadata.
2. **Artwork Ingestion**: Import handwritten ink specimen sheets or create glyphs directly in the vector editor.
3. **Vector Refinement**: Edit bezier paths, align nodes, and smooth contour points.
4. **Spacing & Rhythm**: Calibrate vertical metrics (Ascender/Descender), horizontal sidebearings (LSB/RSB), and optical spacing.
5. **Binary Compilation**: Export standalone installable `.otf` (OpenType CFF), `.ttf` (TrueType), or SVG packages.

### Units Per Em (UPM)
By default, Local Font Studio uses standard **1000 UPM** coordinate space. Coordinates are stored in font units where baseline is `y=0`, cap height is `y=700`, and descender extends downward to `y=-200`.

---

## Chapter 2: Bitmap Tracing & Scanning

### Digitizing Physical Drawings
You can draw letterforms on paper with felt pens, brush pens, or markers, photograph or scan the sheet, and drop the image into the Import tab. The Auto-Cluster Detection engine scans high-contrast ink regions, isolates individual glyph bounding boxes, and prepares them for vector conversion.

- **Binarization Threshold**: Sliders allow separating subtle ink gradients from paper background noise.
- **Box Inspector**: Reassign detected boxes to specific characters (e.g. assigning an ink blob to "B" or "g").
- **Batch Vectorization**: Converts segmented pixel contours into clean vector paths using Douglas-Peucker point reduction.

> **Tip**: High-contrast black ink on clean white unlined paper produces the cleanest automated contours.

---

## Chapter 3: Glyph Vector & Bezier Editor

### Pen Tool & Point Manipulation
The Glyph Editor provides direct mathematical control over contour points in font coordinate space:
- **Insert Points**: Hover over any contour edge to see the projection indicator and click to insert a new node.
- **Move Points**: Click and drag any point or multi-selected points. Hold `Shift` for axis locking.
- **Delete Points**: Select a point and press `Delete` or `Backspace`. Adjacent points will reconnect smoothly.
- **Subdivide Curves**: Automatically doubles node resolution along curve paths for fine detail editing.
- **Corner vs Smooth**: Click on a contour point to toggle between sharp corner nodes and smooth relaxed bezier points.

---

## Chapter 4: Metrics & Optical Auto-Spacing

### Horizontal Sidebearings & Advance Width
A letterform's space is defined by three values: `Advance Width = Left Sidebearing (LSB) + Glyph Bounding Width + Right Sidebearing (RSB)`.

- **Split Mode**: Compare pairs side-by-side (e.g. `HH`, `OO`, `HOH`) to judge optical balance.
- **Table Mode**: Batch adjust all glyph sidebearings with arithmetic shifts (+5, -5).
- **Word Space (U+0020)**: Dedicated advance width calibration for natural reading flow.
- **Optical Auto-Spacing Engine**: Uses silhouette ink density analysis to compute balanced sidebearings across your entire character set.

---

## Chapter 5: Kerning Pairs & Visual Rhythm

### Eliminating Optical Gaps
While sidebearings space individual letters, kerning adjusts the relative distance between specific pairs of letters that naturally collide or create awkward gaps (such as `AV`, `To`, `Wa`).
- Negative kerning values (e.g. -40) draw characters closer together.
- Positive values spread characters apart.
- Real-time typesetter preview tests combinations across paragraph text.

---

## Chapter 6: Font Family Cuts & Style Interpolation

### Multi-Cut Families
A professional typeface is a coordinated family of styles.
- **Stem Weight Dilation/Erosion**: Derive a Bold cut from your Regular style by mathematically offsetting contour nodes outward.
- **Italic Slant (Shear)**: Apply optical italic angles (typically -10° to -14°) with automatic baseline compensation.
- **Isolated State**: Each style maintains its own independent vector paths, metrics, and kerning pairs while sharing character rosters.

---

## Chapter 7: Character Sets & Multilingual Glyphs

### Expanding Font Coverage
- **Language Preset Packs**: Add German (`Ä`, `Ö`, `Ü`, `ß`, `ẞ`), Serbian Cyrillic (complete 30-letter alphabet), French, Spanish, and Nordic glyphs in one click.
- **Automatic Case-Pairing**: Adding an uppercase character like "Ä" automatically stages its lowercase pair "ä".
- **Custom Codepoints**: Type or paste any Unicode character or hex code (e.g. `U+00C4`, `€`, `©`) to add custom glyphs.

---

## Chapter 8: Compiling, Exporting & Licensing

### Binary Formats
- **OpenType CFF (.otf)**: Best for design workflows, print publishing, macOS, Adobe Creative Cloud, and Figma.
- **TrueType (.ttf)**: Universal compatibility across Windows, mobile apps, and legacy software.
- **SVG Package (.zip)**: Exports individual vector glyphs and project manifest.

### Creator Ownership
All font files, glyphs, and typefaces created with Local Font Studio belong 100% to you. You are free to distribute, license, or sell your exported fonts for commercial and personal use with zero royalties or restrictions.

---

## Chapter 9: Keyboard Shortcuts & Gestures

### Editor Canvas Shortcuts
- **Select Mode**: `V`
- **Pen / Node Tool**: `P`
- **Delete Point**: `Delete` or `Backspace`
- **Nudge Selected Point**: `Arrow Keys` (Hold `Shift` for 10x nudge)
- **Undo / Redo**: `Ctrl+Z` / `Ctrl+Y` (or `Cmd+Z` / `Cmd+Shift+Z`)
- **Smooth Contours**: `Ctrl+S`
- **Pan Canvas**: `Middle Click Drag` or `Spacebar + Drag`
- **Zoom Canvas**: `Mouse Wheel` or Zoom Buttons

### Glyph Map Gestures
- **Hold & Drag (1s)**: Hold click on any glyph card for 1 second to duplicate its artwork onto another letter.
- **Cancel Drag**: Press `Escape` or click Cancel.
- **Fast Filter**: Click `All` to reset all category and status filters.
- **Open Handbook**: Press `F1` or click `Handbook` in the top header.
