import { TabId } from '../../components/Tabs';

export interface HandbookSection {
  heading?: string;
  paragraphs?: string[];
  bulletPoints?: string[];
  tip?: string;
  codeBlock?: string;
}

export interface HandbookChapter {
  id: string;
  number: string;
  title: string;
  category: 'Fundamentals' | 'Artwork & Curves' | 'Metrics & Spacing' | 'Typography Engineering';
  summary: string;
  tabTarget?: TabId;
  tabLabel?: string;
  sections: HandbookSection[];
}

export const HANDBOOK_CHAPTERS: HandbookChapter[] = [
  {
    id: 'quick-start',
    number: '01',
    title: 'Quick Start & Studio Workflow',
    category: 'Fundamentals',
    summary: 'A complete end-to-end overview of creating your first typeface in Local Font Studio.',
    tabTarget: 'family-styles',
    tabLabel: 'Open Family & Styles',
    sections: [
      {
        heading: 'The 5-Stage Typeface Pipeline',
        paragraphs: [
          'Local Font Studio is a local-first, in-browser font foundry application. You can design, trace, space, kern, and compile production-ready OpenType and TrueType fonts without installing desktop software or transmitting your intellectual property to the cloud.',
          'A typical typeface design lifecycle follows five key phases:'
        ],
        bulletPoints: [
          '1. Family Definition: Configure UPM (units per em), styles (Regular, Bold, Italic), and font metadata.',
          '2. Artwork Ingestion: Import handwritten ink specimen sheets or create glyphs directly in the vector editor.',
          '3. Vector Refinement: Edit bezier paths, align nodes, and smooth contour points.',
          '4. Spacing & Rhythm: Calibrate vertical metrics (Ascender/Descender), horizontal sidebearings (LSB/RSB), and optical spacing.',
          '5. Binary Compilation: Export standalone installable .otf (OpenType CFF), .ttf (TrueType), or SVG packages.'
        ],
        tip: 'All project data is stored locally in your browser with automatic persistence. Always keep periodic backups via Export.'
      },
      {
        heading: 'Units Per Em (UPM)',
        paragraphs: [
          'By default, Local Font Studio uses standard 1000 UPM coordinate space. Coordinates are stored in font units where baseline is y=0, cap height is y=700, and descender extends downward to y=-200.'
        ]
      }
    ]
  },
  {
    id: 'bitmap-tracing',
    number: '02',
    title: 'Bitmap Tracing & Scanning',
    category: 'Artwork & Curves',
    summary: 'Ingest scanned ink drawings, crop glyph clusters, and auto-vectorize bitmap artwork.',
    tabTarget: 'import',
    tabLabel: 'Open Import Studio',
    sections: [
      {
        heading: 'Digitizing Physical Drawings',
        paragraphs: [
          'You can draw letterforms on paper with felt pens, brush pens, or markers, photograph or scan the sheet, and drop the image into the Import tab.',
          'The Auto-Cluster Detection engine scans high-contrast ink regions, isolates individual glyph bounding boxes, and prepares them for vector conversion.'
        ],
        bulletPoints: [
          'Binarization Threshold: Sliders allow separating subtle ink gradients from paper background noise.',
          'Box Inspector: Reassign detected boxes to specific characters (e.g. assigning an ink blob to "B" or "g").',
          'Batch Vectorization: Converts segmented pixel contours into clean vector paths using Douglas-Peucker point reduction.'
        ],
        tip: 'High-contrast black ink on clean white unlined paper produces the cleanest automated contours.'
      },
      {
        heading: 'Per-Glyph Bitmap Overlay',
        paragraphs: [
          'In the Glyph Editor, you can attach, replace, scale, and reposition a reference bitmap directly behind your vector curves using the Bitmap section in the sidebar.'
        ]
      }
    ]
  },
  {
    id: 'vector-editor',
    number: '03',
    title: 'Glyph Vector & Bezier Editor',
    category: 'Artwork & Curves',
    summary: 'Master pen tool interactions, point inserting, curve smoothing, and contour transforms.',
    tabTarget: 'glyph-editor',
    tabLabel: 'Open Glyph Editor',
    sections: [
      {
        heading: 'Pen Tool & Point Manipulation',
        paragraphs: [
          'The Glyph Editor provides direct mathematical control over contour points in font coordinate space.'
        ],
        bulletPoints: [
          'Insert Points: Hover over any contour edge to see the projection indicator and click to insert a new node.',
          'Move Points: Click and drag any point or multi-selected points. Hold Shift for axis locking.',
          'Delete Points: Select a point and press Delete or Backspace. Adjacent points will reconnect smoothly.',
          'Subdivide Curves: Automatically doubles node resolution along curve paths for fine detail editing.'
        ],
        tip: 'Click on a contour point to toggle between sharp corner nodes and smooth relaxed bezier points.'
      },
      {
        heading: 'Contour Transformations',
        paragraphs: [
          'Use the Transform section in the editor sidebar to Flip Horizontally, Flip Vertically, Rotate, or Center artwork symmetrically between left and right sidebearings.'
        ]
      }
    ]
  },
  {
    id: 'metrics-and-spacing',
    number: '04',
    title: 'Metrics & Optical Auto-Spacing',
    category: 'Metrics & Spacing',
    summary: 'Calibrate horizontal rhythm, sidebearings (LSB/RSB), and automated optical spacing.',
    tabTarget: 'metrics',
    tabLabel: 'Open Metrics Studio',
    sections: [
      {
        heading: 'Horizontal Sidebearings & Advance Width',
        paragraphs: [
          'A letterform\'s space is defined by three values: Advance Width = Left Sidebearing (LSB) + Glyph Bounding Width + Right Sidebearing (RSB).',
          'Consistent rhythm is what makes a font legible. Round letters (like O) need tighter sidebearings than straight letters (like H).'
        ],
        bulletPoints: [
          'Split Mode: Compare pairs side-by-side (e.g. HH, OO, HOH) to judge optical balance.',
          'Table Mode: Batch adjust all glyph sidebearings with arithmetic shifts (+5, -5).',
          'Word Space (U+0020): Dedicated advance width calibration for natural reading flow.'
        ],
        tip: 'Use the Optical Auto-Spacing Engine (Sparkles icon) to automatically calculate balanced sidebearings based on ink silhouette density.'
      },
      {
        heading: 'Vertical Metrics Calibration',
        paragraphs: [
          'Calibrate Ascender, Cap Height, X-Height, Baseline (y=0), and Descender with live text specimens.'
        ]
      }
    ]
  },
  {
    id: 'kerning',
    number: '05',
    title: 'Kerning Pairs & Visual Rhythm',
    category: 'Metrics & Spacing',
    summary: 'Eliminate optical gaps between awkward character combinations like AV, To, and Wa.',
    tabTarget: 'kerning',
    tabLabel: 'Open Kerning Studio',
    sections: [
      {
        heading: 'Pair-Specific Adjustments',
        paragraphs: [
          'While sidebearings space individual letters, kerning adjusts the relative distance between specific pairs of letters that naturally collide or create awkward gaps.',
          'Negative kerning values (e.g. -40) draw characters closer together; positive values spread them apart.'
        ],
        bulletPoints: [
          'Classic Pairs: AV, AW, LT, Ta, Te, To, Tr, Tu, Tw, Ya, Yo, We.',
          'Live Preview: Type any testing string in real time to inspect pair adjustments at various text sizes.',
          'Binary OpenType Table: Kerning values are automatically compiled into the standard GPOS / kern table during export.'
        ]
      }
    ]
  },
  {
    id: 'family-styles',
    number: '06',
    title: 'Font Family Cuts & Style Interpolation',
    category: 'Typography Engineering',
    summary: 'Build multi-cut font families (Regular, Bold, Italic) with mathematical weight offsets.',
    tabTarget: 'family-styles',
    tabLabel: 'Open Family Styles',
    sections: [
      {
        heading: 'Multi-Cut Families',
        paragraphs: [
          'A professional typeface is rarely a single font; it is a family of coordinated styles. Local Font Studio supports creating unlimited cuts within a single project.'
        ],
        bulletPoints: [
          'Stem Weight Dilation/Erosion: Derive a Bold cut from your Regular style by mathematically offsetting contour nodes outward.',
          'Italic Slant (Shear): Apply optical italic angles (typically -10° to -14°) with automatic baseline compensation.',
          'Isolated State: Each style maintains its own independent vector paths, metrics, and kerning pairs while sharing character rosters.'
        ],
        tip: 'When cloning a style, you can duplicate from an existing cut or instantiate a blank style.'
      }
    ]
  },
  {
    id: 'multilingual-glyphs',
    number: '07',
    title: 'Character Sets & Multilingual Glyphs',
    category: 'Typography Engineering',
    summary: 'Expand font coverage across German, Serbian Cyrillic, Nordic, French, and custom Unicode.',
    tabTarget: 'glyph-map',
    tabLabel: 'Open Glyph Map',
    sections: [
      {
        heading: 'Expanding Character Coverage',
        paragraphs: [
          'Local Font Studio includes curated language preset packs and automatic case-pairing to expand your font into international markets.'
        ],
        bulletPoints: [
          'Language Preset Packs: Add German (Ä, Ö, Ü, ß, ẞ), Serbian Cyrillic (complete 30-letter alphabet), French, Spanish, and Nordic glyphs in one click.',
          'Automatic Case-Pairing: Adding an uppercase character like "Ä" automatically stages its lowercase pair "ä".',
          'Custom Codepoints: Type or paste any Unicode character or hex code (e.g. U+00C4, €, ©) to add custom glyphs to your font.'
        ]
      }
    ]
  },
  {
    id: 'compiling-export',
    number: '08',
    title: 'Compiling, Exporting & Licensing',
    category: 'Typography Engineering',
    summary: 'Generate production-ready binary font files (.otf, .ttf) and web font packages.',
    tabTarget: 'export',
    tabLabel: 'Open Export Studio',
    sections: [
      {
        heading: 'Binary Formats Explained',
        paragraphs: [
          'Local Font Studio compiles industry-standard binary font files using OpenType.js:'
        ],
        bulletPoints: [
          'OpenType CFF (.otf): Best for design workflows, print publishing, macOS, Adobe Creative Cloud, and Figma.',
          'TrueType (.ttf): Universal compatibility across Windows, mobile apps, and legacy software.',
          'SVG Package (.zip): Exports individual vector glyphs and project manifest for web icon systems or vector archives.'
        ]
      },
      {
        heading: 'Full Creator Ownership & Licensing',
        paragraphs: [
          'All font files, glyphs, and typefaces created with Local Font Studio belong 100% to you. You are free to distribute, license, or sell your exported fonts for commercial and personal use with zero royalties or restrictions.'
        ]
      }
    ]
  },
  {
    id: 'keyboard-shortcuts',
    number: '09',
    title: 'Keyboard Shortcuts & Gestures',
    category: 'Fundamentals',
    summary: 'Speed up your type design workflow with complete canvas physics and keyboard shortcuts.',
    sections: [
      {
        heading: 'Editor Shortcuts',
        bulletPoints: [
          'Select Mode: [V]',
          'Pen / Node Tool: [P]',
          'Delete Point: [Delete] or [Backspace]',
          'Nudge Selected Point: [Arrow Keys] (Hold Shift for 10x nudge)',
          'Undo / Redo: [Ctrl+Z] / [Ctrl+Y] (or [Cmd+Z] / [Cmd+Shift+Z])',
          'Smooth Contours: [Ctrl+S]',
          'Pan Canvas: [Middle Click Drag] or [Spacebar + Drag]',
          'Zoom Canvas: [Mouse Wheel] or Zoom Buttons'
        ]
      },
      {
        heading: 'Glyph Map Gestures',
        bulletPoints: [
          'Hold & Drag (1s): Hold click on any glyph card for 1 second to duplicate its artwork onto another letter.',
          'Cancel Drag: Press [Escape] or click Cancel.',
          'Fast Filter: Click [All] to reset all category and status filters.'
        ]
      }
    ]
  }
];
