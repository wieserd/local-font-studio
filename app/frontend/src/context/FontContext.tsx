import React, { createContext, useContext, useState, useEffect } from 'react';
import { Glyph, FontMetrics, FontMetadata, KerningPair, ProjectState, FontStyleState } from '../types/font';
import { GlyphBox } from '../views/import/types';

const DEFAULT_METRICS: FontMetrics = {
  upm: 1000,
  ascender: 800,
  descender: -200,
  capHeight: 700,
  xHeight: 500,
  lineGap: 200,
  defaultAdvance: 600,
  defaultLsb: 40,
  defaultRsb: 40,
  spaceWidth: 280,
};

const DEFAULT_METADATA: FontMetadata = {
  family: 'Untitled Typeface',
  style: 'Regular',
  designer: 'Studio Author',
  manufacturer: 'Local Font Studio',
  version: '1.000',
  vendorId: 'LFS',
  copyright: '© 2026 Author. All rights reserved.',
  license: 'SIL Open Font License 1.1',
};

const DEFAULT_KERNING_PAIRS: KerningPair[] = [
  { left: 'A', right: 'V', value: -60 },
  { left: 'T', right: 'o', value: -45 },
  { left: 'W', right: 'a', value: -30 },
  { left: 'Y', right: 'o', value: -55 },
];

const ALL_STANDARD_CHARS = [
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ...'abcdefghijklmnopqrstuvwxyz',
  ...'0123456789',
  ...['.', ',', '!', '?', ':', ';', '-', '"', '\'', '(', ')', '/', ' ']
];

const createInitialGlyphs = (): Record<string, Glyph> => {
  const glyphs: Record<string, Glyph> = {};
  const sampleAPath = "M 40 0 L 260 700 L 340 700 L 560 0 L 470 0 L 415 180 L 185 180 L 130 0 Z M 215 260 L 385 260 L 300 520 Z";

  ALL_STANDARD_CHARS.forEach(char => {
    const isA = char === 'A';
    const isSpace = char === ' ';
    glyphs[char] = {
      char,
      name: isSpace ? 'space' : char,
      unicode: 'U+' + char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'),
      isAssigned: isA || isSpace,
      advanceWidth: isSpace ? 280 : (isA ? 600 : 550),
      lsb: isSpace ? 0 : 40,
      rsb: isSpace ? 0 : 40,
      xOffset: 0,
      yOffset: 0,
      bitmapXOffset: 0,
      bitmapYOffset: 0,
      bitmapScale: 100,
      scale: 100,
      svgPath: isA ? sampleAPath : '',
    };
  });

  return glyphs;
};

export const createBlankGlyphs = (defaultMetrics: FontMetrics = DEFAULT_METRICS): Record<string, Glyph> => {
  const glyphs: Record<string, Glyph> = {};
  ALL_STANDARD_CHARS.forEach(char => {
    const isSpace = char === ' ';
    glyphs[char] = {
      char,
      name: isSpace ? 'space' : char,
      unicode: 'U+' + char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'),
      isAssigned: isSpace,
      advanceWidth: isSpace ? (defaultMetrics.spaceWidth || 280) : defaultMetrics.defaultAdvance,
      lsb: isSpace ? 0 : defaultMetrics.defaultLsb,
      rsb: isSpace ? 0 : defaultMetrics.defaultRsb,
      xOffset: 0,
      yOffset: 0,
      bitmapXOffset: 0,
      bitmapYOffset: 0,
      bitmapScale: 100,
      scale: 100,
      svgPath: '',
    };
  });
  return glyphs;
};

const ensureSpaceGlyphInMap = (glyphs: Record<string, Glyph>, spaceWidth: number = 280): void => {
  if (!glyphs[' ']) {
    glyphs[' '] = {
      char: ' ',
      name: 'space',
      unicode: 'U+0020',
      isAssigned: true,
      advanceWidth: spaceWidth,
      lsb: 0,
      rsb: 0,
      xOffset: 0,
      yOffset: 0,
      bitmapXOffset: 0,
      bitmapYOffset: 0,
      bitmapScale: 100,
      scale: 100,
      svgPath: '',
    };
  }
};

function initializeProjectState(savedRaw: string | null): ProjectState {
  if (savedRaw) {
    try {
      const parsed = JSON.parse(savedRaw);
      // Migration: if already has styles and activeStyleId, validate and return
      if (parsed.styles && Object.keys(parsed.styles).length > 0 && parsed.activeStyleId && parsed.styles[parsed.activeStyleId]) {
        Object.values(parsed.styles).forEach((st: any) => {
          if (!st.metrics.spaceWidth) st.metrics.spaceWidth = 280;
          ensureSpaceGlyphInMap(st.glyphs, st.metrics.spaceWidth);
        });
        const active = parsed.styles[parsed.activeStyleId];
        return {
          ...parsed,
          glyphs: active.glyphs,
          metrics: active.metrics,
          kerningPairs: active.kerningPairs || [],
        };
      }
      
      // Migration from legacy flat single-style project:
      const initialStyleId = 'regular';
      const initialStyleName = parsed.metadata?.style || 'Regular';
      const initialMetrics = parsed.metrics || DEFAULT_METRICS;
      if (!initialMetrics.spaceWidth) initialMetrics.spaceWidth = 280;
      const initialGlyphs = parsed.glyphs || createInitialGlyphs();
      ensureSpaceGlyphInMap(initialGlyphs, initialMetrics.spaceWidth);

      const initialStyle: FontStyleState = {
        id: initialStyleId,
        name: initialStyleName,
        weightClass: 400,
        isItalic: false,
        metrics: initialMetrics,
        glyphs: initialGlyphs,
        kerningPairs: parsed.kerningPairs || DEFAULT_KERNING_PAIRS,
        lastModified: parsed.lastModified || Date.now(),
      };

      return {
        id: parsed.id || 'proj_1',
        name: parsed.name || 'Untitled Typeface',
        metadata: parsed.metadata || DEFAULT_METADATA,
        activeStyleId: initialStyleId,
        styles: {
          [initialStyleId]: initialStyle
        },
        metrics: initialStyle.metrics,
        glyphs: initialStyle.glyphs,
        kerningPairs: initialStyle.kerningPairs,
        lastModified: parsed.lastModified || Date.now(),
      };
    } catch (e) {
      console.error('Failed to parse saved project', e);
    }
  }

  // Brand new project default:
  const initialStyleId = 'regular';
  const initialStyle: FontStyleState = {
    id: initialStyleId,
    name: 'Regular',
    weightClass: 400,
    isItalic: false,
    metrics: DEFAULT_METRICS,
    glyphs: createInitialGlyphs(),
    kerningPairs: DEFAULT_KERNING_PAIRS,
    lastModified: Date.now(),
  };

  return {
    id: 'proj_1',
    name: 'Untitled Typeface',
    metadata: DEFAULT_METADATA,
    activeStyleId: initialStyleId,
    styles: {
      [initialStyleId]: initialStyle
    },
    metrics: DEFAULT_METRICS,
    glyphs: initialStyle.glyphs,
    kerningPairs: DEFAULT_KERNING_PAIRS,
    lastModified: Date.now(),
  };
}

export interface AddStyleOptions {
  name: string;
  weightClass?: number;
  isItalic?: boolean;
  copyFromStyleId?: string; // If omitted or 'blank', starts empty
}

interface FontContextType {
  project: ProjectState;
  stylesList: FontStyleState[];
  activeStyle: FontStyleState;
  activeStyleId: string;
  switchStyle: (styleId: string) => void;
  addStyle: (options: AddStyleOptions) => string;
  duplicateStyle: (sourceStyleId: string, newName?: string) => string;
  deleteStyle: (styleId: string) => boolean;
  updateStyleMetadata: (styleId: string, partial: Partial<{ name: string; weightClass: number; isItalic: boolean }>) => void;
  setProjectName: (name: string) => void;
  updateGlyph: (char: string, partial: Partial<Glyph>) => void;
  updateGlyphsBatch: (updates: Array<{ char: string; partial: Partial<Glyph> }>) => void;
  addGlyphs: (chars: string[]) => number;
  removeCustomGlyph: (char: string) => boolean;
  deleteAllBitmaps: (targetChars?: string[]) => number;
  deleteProjectGlyph: (char: string) => void;
  commitImportedGlyphs: (glyphsToCommit: Glyph[]) => void;
  copyCaseGlyphs: (direction: 'upper-to-lower' | 'lower-to-upper') => { sourceCount: number; overwriteCount: number };
  copyGlyph: (sourceChar: string, targetChar: string) => void;
  updateMetrics: (partial: Partial<FontMetrics>) => void;
  updateMetadata: (partial: Partial<FontMetadata>) => void;
  updateKerningPair: (left: string, right: string, value: number) => void;
  deleteKerningPair: (left: string, right: string) => void;
  addKerningPair: (left: string, right: string, value?: number) => boolean;
  selectedGlyphChar: string;
  setSelectedGlyphChar: (char: string) => void;
  assignedCount: number;
  totalCount: number;
  importBoxes: GlyphBox[];
  setImportBoxes: React.Dispatch<React.SetStateAction<GlyphBox[]>>;
  importImageSrc: string;
  setImportImageSrc: (src: string) => void;
  hasUnsavedChanges: boolean;
  saveProject: () => void;
  lastSavedTime: number;
  createNewProject: (name: string, designer?: string) => void;
  flushToPristineEmptyState: (preserveSettings?: boolean) => void;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export const FontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<ProjectState>(() => {
    return initializeProjectState(localStorage.getItem('local_font_studio_active_project'));
  });

  const [selectedGlyphChar, setSelectedGlyphChar] = useState('A');
  const [importBoxes, setImportBoxes] = useState<GlyphBox[]>([]);
  const [importImageSrc, setImportImageSrcState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('local_font_studio_import_image');
      if (saved !== null) {
        return saved;
      }
    } catch {
      // ignore
    }
    return '';
  });

  const setImportImageSrc = (src: string) => {
    setImportImageSrcState(src);
    try {
      localStorage.setItem('local_font_studio_import_image', src);
    } catch (e) {
      console.warn('Could not persist import image to localStorage', e);
    }
  };

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<number>(Date.now());

  const saveProject = () => {
    try {
      localStorage.setItem('local_font_studio_active_project', JSON.stringify(project));
      localStorage.setItem('local_font_studio_import_image', importImageSrc);
      setHasUnsavedChanges(false);
      setLastSavedTime(Date.now());
    } catch (e) {
      console.warn('Storage limit reached for local project', e);
    }
  };

  const createNewProject = (name: string, designer: string = 'Anonymous') => {
    const newStyleId = 'regular';
    const initialGlyphs = createInitialGlyphs();
    const initialMetrics: FontMetrics = { ...DEFAULT_METRICS };
    const initialMetadata: FontMetadata = {
      ...DEFAULT_METADATA,
      family: name,
      designer,
      style: 'Regular',
    };
    const initialStyle: FontStyleState = {
      id: newStyleId,
      name: 'Regular',
      weightClass: 400,
      isItalic: false,
      metrics: initialMetrics,
      glyphs: initialGlyphs,
      kerningPairs: [...DEFAULT_KERNING_PAIRS],
      lastModified: Date.now(),
    };

    const newProject: ProjectState = {
      id: 'proj_' + Date.now(),
      name,
      metadata: initialMetadata,
      activeStyleId: newStyleId,
      styles: {
        [newStyleId]: initialStyle,
      },
      glyphs: initialGlyphs,
      metrics: initialMetrics,
      kerningPairs: [...DEFAULT_KERNING_PAIRS],
      lastModified: Date.now(),
    };

    setProject(newProject);
    setImportImageSrcState('');
    setImportBoxes([]);
    setHasUnsavedChanges(true);
    try {
      localStorage.setItem('local_font_studio_active_project', JSON.stringify(newProject));
      localStorage.setItem('local_font_studio_import_image', '');
    } catch (e) {
      console.warn('Storage limit', e);
    }
  };

  const flushToPristineEmptyState = (preserveSettings: boolean = true) => {
    try {
      localStorage.removeItem('local_font_studio_active_project');
      localStorage.removeItem('local_font_studio_import_image');
      if (!preserveSettings) {
        localStorage.removeItem('local_font_studio_app_settings');
        localStorage.removeItem('local_font_studio_enabled_addons');
        localStorage.removeItem('local_font_studio_custom_addons');
      }
    } catch (e) {
      console.warn('Could not clear storage', e);
    }

    const newStyleId = 'regular';
    const cleanBlankGlyphs = createBlankGlyphs();
    const cleanMetrics: FontMetrics = { ...DEFAULT_METRICS };
    const cleanMetadata: FontMetadata = {
      ...DEFAULT_METADATA,
      family: 'Untitled Typeface',
      designer: 'Type Designer',
      style: 'Regular',
    };
    const cleanStyle: FontStyleState = {
      id: newStyleId,
      name: 'Regular',
      weightClass: 400,
      isItalic: false,
      metrics: cleanMetrics,
      glyphs: cleanBlankGlyphs,
      kerningPairs: [],
      lastModified: Date.now(),
    };

    const cleanProject: ProjectState = {
      id: 'proj_' + Date.now(),
      name: 'Untitled Typeface',
      metadata: cleanMetadata,
      activeStyleId: newStyleId,
      styles: {
        [newStyleId]: cleanStyle,
      },
      glyphs: cleanBlankGlyphs,
      metrics: cleanMetrics,
      kerningPairs: [],
      lastModified: Date.now(),
    };

    setProject(cleanProject);
    setImportImageSrcState('');
    setImportBoxes([]);
    setSelectedGlyphChar('A');
    setHasUnsavedChanges(false);
    setLastSavedTime(Date.now());

    try {
      localStorage.setItem('local_font_studio_active_project', JSON.stringify(cleanProject));
      localStorage.setItem('local_font_studio_import_image', '');
    } catch (e) {
      console.warn('Storage limit', e);
    }
  };

  const switchStyle = (targetStyleId: string) => {
    if (targetStyleId === project.activeStyleId) return;
    const targetStyle = project.styles[targetStyleId];
    if (!targetStyle) return;

    setHasUnsavedChanges(true);
    setProject(prev => {
      // 1. Sync current active style before switching
      const currentStyle = prev.styles[prev.activeStyleId];
      const syncedCurrentStyle = currentStyle ? {
        ...currentStyle,
        glyphs: prev.glyphs,
        metrics: prev.metrics,
        kerningPairs: prev.kerningPairs,
        lastModified: Date.now()
      } : null;

      const updatedStyles = {
        ...prev.styles,
        ...(syncedCurrentStyle ? { [prev.activeStyleId]: syncedCurrentStyle } : {})
      };

      const nextStyle = updatedStyles[targetStyleId];

      return {
        ...prev,
        activeStyleId: targetStyleId,
        styles: updatedStyles,
        glyphs: nextStyle.glyphs,
        metrics: nextStyle.metrics,
        kerningPairs: nextStyle.kerningPairs || [],
        metadata: {
          ...prev.metadata,
          style: nextStyle.name
        },
        lastModified: Date.now()
      };
    });
  };


  const addStyle = (options: AddStyleOptions): string => {
    const safeSlug = options.name.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'style';
    const newId = `${safeSlug}_${Date.now().toString(36)}`;
    
    setHasUnsavedChanges(true);
    setProject(prev => {
      // Current active style snapshot
      const currentStyle = prev.styles[prev.activeStyleId];
      const syncedCurrentStyle = currentStyle ? {
        ...currentStyle,
        glyphs: prev.glyphs,
        metrics: prev.metrics,
        kerningPairs: prev.kerningPairs,
        lastModified: Date.now()
      } : null;

      let initialGlyphs: Record<string, Glyph>;
      let initialMetrics: FontMetrics;
      let initialKerning: KerningPair[];

      if (options.copyFromStyleId && prev.styles[options.copyFromStyleId]) {
        const source = options.copyFromStyleId === prev.activeStyleId
          ? { glyphs: prev.glyphs, metrics: prev.metrics, kerningPairs: prev.kerningPairs }
          : prev.styles[options.copyFromStyleId];
        initialGlyphs = JSON.parse(JSON.stringify(source.glyphs));
        initialMetrics = JSON.parse(JSON.stringify(source.metrics));
        initialKerning = JSON.parse(JSON.stringify(source.kerningPairs || []));
      } else {
        initialMetrics = { ...DEFAULT_METRICS };
        initialGlyphs = createBlankGlyphs(initialMetrics);
        initialKerning = [];
      }

      const newStyle: FontStyleState = {
        id: newId,
        name: options.name,
        weightClass: options.weightClass || 400,
        isItalic: !!options.isItalic,
        metrics: initialMetrics,
        glyphs: initialGlyphs,
        kerningPairs: initialKerning,
        lastModified: Date.now(),
      };

      const updatedStyles = {
        ...prev.styles,
        ...(syncedCurrentStyle ? { [prev.activeStyleId]: syncedCurrentStyle } : {}),
        [newId]: newStyle,
      };

      // Automatically switch to the newly created style
      return {
        ...prev,
        activeStyleId: newId,
        styles: updatedStyles,
        glyphs: newStyle.glyphs,
        metrics: newStyle.metrics,
        kerningPairs: newStyle.kerningPairs,
        metadata: {
          ...prev.metadata,
          style: newStyle.name,
        },
        lastModified: Date.now(),
      };
    });

    return newId;
  };

  const duplicateStyle = (sourceStyleId: string, newName?: string): string => {
    const source = project.styles[sourceStyleId];
    const name = newName || `${source ? source.name : 'Style'} Copy`;
    return addStyle({
      name,
      weightClass: source ? source.weightClass : 400,
      isItalic: source ? source.isItalic : false,
      copyFromStyleId: sourceStyleId,
    });
  };

  const deleteStyle = (styleId: string): boolean => {
    const styleKeys = Object.keys(project.styles);
    if (styleKeys.length <= 1) {
      return false; // Cannot delete the sole style
    }

    setHasUnsavedChanges(true);
    setProject(prev => {
      const updatedStyles = { ...prev.styles };
      delete updatedStyles[styleId];

      let nextActiveId = prev.activeStyleId;
      let nextActiveStyle = updatedStyles[nextActiveId];

      if (styleId === prev.activeStyleId || !nextActiveStyle) {
        const remainingIds = Object.keys(updatedStyles);
        nextActiveId = remainingIds[0];
        nextActiveStyle = updatedStyles[nextActiveId];
      }

      return {
        ...prev,
        activeStyleId: nextActiveId,
        styles: updatedStyles,
        glyphs: nextActiveStyle.glyphs,
        metrics: nextActiveStyle.metrics,
        kerningPairs: nextActiveStyle.kerningPairs || [],
        metadata: {
          ...prev.metadata,
          style: nextActiveStyle.name,
        },
        lastModified: Date.now(),
      };
    });

    return true;
  };

  const updateStyleMetadata = (styleId: string, partial: Partial<{ name: string; weightClass: number; isItalic: boolean }>) => {
    setHasUnsavedChanges(true);
    setProject(prev => {
      const target = prev.styles[styleId];
      if (!target) return prev;
      const updatedTarget: FontStyleState = {
        ...target,
        ...(partial.name !== undefined ? { name: partial.name } : {}),
        ...(partial.weightClass !== undefined ? { weightClass: partial.weightClass } : {}),
        ...(partial.isItalic !== undefined ? { isItalic: partial.isItalic } : {}),
        lastModified: Date.now(),
      };

      const isCurrentActive = styleId === prev.activeStyleId;

      return {
        ...prev,
        styles: {
          ...prev.styles,
          [styleId]: updatedTarget,
        },
        metadata: isCurrentActive && partial.name ? { ...prev.metadata, style: partial.name } : prev.metadata,
        lastModified: Date.now(),
      };
    });
  };

  const setProjectName = (name: string) => {
    setHasUnsavedChanges(true);
    setProject(prev => ({
      ...prev,
      name,
      metadata: { ...prev.metadata, family: name },
      lastModified: Date.now()
    }));
  };

  const updateGlyph = (char: string, partial: Partial<Glyph>) => {
    setHasUnsavedChanges(true);
    setProject(prev => {
      const existing = prev.glyphs[char] || {
        char,
        name: char,
        unicode: 'U+' + char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'),
        isAssigned: true,
        advanceWidth: prev.metrics.defaultAdvance,
        lsb: prev.metrics.defaultLsb,
        rsb: prev.metrics.defaultRsb,
        xOffset: 0,
        yOffset: 0,
        bitmapXOffset: 0,
        bitmapYOffset: 0,
        bitmapScale: 100,
        scale: 100,
        svgPath: '',
      };

      const updatedGlyph = { ...existing, ...partial, isAssigned: true };
      const updatedGlyphs = {
        ...prev.glyphs,
        [char]: updatedGlyph
      };

      const updatedMetrics = (char === ' ' && partial.advanceWidth !== undefined)
        ? { ...prev.metrics, spaceWidth: partial.advanceWidth }
        : prev.metrics;

      const currentStyle = prev.styles[prev.activeStyleId];
      const updatedStyle = currentStyle ? {
        ...currentStyle,
        glyphs: updatedGlyphs,
        metrics: updatedMetrics,
        lastModified: Date.now()
      } : undefined;

      return {
        ...prev,
        glyphs: updatedGlyphs,
        metrics: updatedMetrics,
        styles: updatedStyle ? { ...prev.styles, [prev.activeStyleId]: updatedStyle } : prev.styles,
        lastModified: Date.now()
      };
    });
  };


  const updateGlyphsBatch = (updates: Array<{ char: string; partial: Partial<Glyph> }>) => {
    if (updates.length === 0) return;
    setHasUnsavedChanges(true);
    setProject(prev => {
      const updatedGlyphs = { ...prev.glyphs };
      let newSpaceWidth: number | undefined;

      updates.forEach(({ char, partial }) => {
        const existing = updatedGlyphs[char] || {
          char,
          name: char,
          unicode: 'U+' + char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'),
          isAssigned: true,
          advanceWidth: prev.metrics.defaultAdvance,
          lsb: prev.metrics.defaultLsb,
          rsb: prev.metrics.defaultRsb,
          xOffset: 0,
          yOffset: 0,
          bitmapXOffset: 0,
          bitmapYOffset: 0,
          bitmapScale: 100,
          scale: 100,
          svgPath: '',
        };

        updatedGlyphs[char] = { ...existing, ...partial, isAssigned: true };

        if (char === ' ' && partial.advanceWidth !== undefined) {
          newSpaceWidth = partial.advanceWidth;
        }
      });

      const updatedMetrics = (newSpaceWidth !== undefined)
        ? { ...prev.metrics, spaceWidth: newSpaceWidth }
        : prev.metrics;

      const currentStyle = prev.styles[prev.activeStyleId];
      const updatedStyle = currentStyle ? {
        ...currentStyle,
        glyphs: updatedGlyphs,
        metrics: updatedMetrics,
        lastModified: Date.now()
      } : undefined;

      return {
        ...prev,
        glyphs: updatedGlyphs,
        metrics: updatedMetrics,
        styles: updatedStyle ? { ...prev.styles, [prev.activeStyleId]: updatedStyle } : prev.styles,
        lastModified: Date.now()
      };
    });
  };

  const deleteProjectGlyph = (char: string) => {
    setHasUnsavedChanges(true);
    setProject(prev => {
      if (!prev.glyphs[char]) return prev;
      const updatedGlyphs = {
        ...prev.glyphs,
        [char]: {
          ...prev.glyphs[char],
          isAssigned: false,
          svgPath: '',
          originalImage: undefined,
          contours: undefined,
        }
      };

      const currentStyle = prev.styles[prev.activeStyleId];
      const updatedStyle = currentStyle ? {
        ...currentStyle,
        glyphs: updatedGlyphs,
        lastModified: Date.now()
      } : undefined;

      return {
        ...prev,
        glyphs: updatedGlyphs,
        styles: updatedStyle ? { ...prev.styles, [prev.activeStyleId]: updatedStyle } : prev.styles,
        lastModified: Date.now()
      };
    });
  };

  const addGlyphs = (chars: string[]): number => {
    if (!chars || chars.length === 0) return 0;

    const uniqueNewChars = Array.from(new Set(chars)).filter(
      c => c.length > 0 && !project.glyphs[c]
    );

    if (uniqueNewChars.length === 0) return 0;

    setHasUnsavedChanges(true);
    setProject(prev => {
      const updatedActiveGlyphs = { ...prev.glyphs };
      const updatedStyles = { ...prev.styles };

      uniqueNewChars.forEach(char => {
        const isSpace = char === ' ';
        const codePoint = char.codePointAt(0) || 0;
        const unicode = 'U+' + codePoint.toString(16).toUpperCase().padStart(4, '0');

        const newGlyph: Glyph = {
          char,
          name: isSpace ? 'space' : char,
          unicode,
          isAssigned: false,
          advanceWidth: isSpace ? (prev.metrics.spaceWidth || 280) : (prev.metrics.defaultAdvance || 600),
          lsb: isSpace ? 0 : (prev.metrics.defaultLsb ?? 40),
          rsb: isSpace ? 0 : (prev.metrics.defaultRsb ?? 40),
          xOffset: 0,
          yOffset: 0,
          bitmapXOffset: 0,
          bitmapYOffset: 0,
          bitmapScale: 100,
          scale: 100,
          svgPath: '',
        };

        updatedActiveGlyphs[char] = newGlyph;

        Object.keys(updatedStyles).forEach(styleId => {
          const style = updatedStyles[styleId];
          if (style && style.glyphs) {
            updatedStyles[styleId] = {
              ...style,
              glyphs: {
                ...style.glyphs,
                [char]: {
                  ...newGlyph,
                  advanceWidth: isSpace ? (style.metrics.spaceWidth || 280) : (style.metrics.defaultAdvance || 600),
                  lsb: isSpace ? 0 : (style.metrics.defaultLsb ?? 40),
                  rsb: isSpace ? 0 : (style.metrics.defaultRsb ?? 40),
                }
              },
              lastModified: Date.now()
            };
          }
        });
      });

      return {
        ...prev,
        glyphs: updatedActiveGlyphs,
        styles: updatedStyles,
        lastModified: Date.now()
      };
    });

    return uniqueNewChars.length;
  };

  const removeCustomGlyph = (char: string): boolean => {
    if (!project.glyphs[char]) return false;

    setHasUnsavedChanges(true);
    setProject(prev => {
      const updatedActiveGlyphs = { ...prev.glyphs };
      delete updatedActiveGlyphs[char];

      const updatedStyles = { ...prev.styles };
      Object.keys(updatedStyles).forEach(styleId => {
        const style = updatedStyles[styleId];
        if (style && style.glyphs) {
          const styleGlyphs = { ...style.glyphs };
          delete styleGlyphs[char];
          updatedStyles[styleId] = {
            ...style,
            glyphs: styleGlyphs,
            lastModified: Date.now()
          };
        }
      });

      return {
        ...prev,
        glyphs: updatedActiveGlyphs,
        styles: updatedStyles,
        lastModified: Date.now()
      };
    });

    return true;
  };

  const deleteAllBitmaps = (targetChars?: string[]): number => {
    const charsWithBitmap = (targetChars 
      ? targetChars 
      : Object.keys(project.glyphs)
    ).filter(c => Boolean(project.glyphs[c]?.originalImage));

    if (charsWithBitmap.length === 0) return 0;

    setHasUnsavedChanges(true);
    setProject(prev => {
      const updatedActiveGlyphs = { ...prev.glyphs };
      const updatedStyles = { ...prev.styles };

      charsWithBitmap.forEach(char => {
        if (updatedActiveGlyphs[char]) {
          updatedActiveGlyphs[char] = {
            ...updatedActiveGlyphs[char],
            originalImage: undefined,
            bitmapXOffset: 0,
            bitmapYOffset: 0,
            bitmapScale: 100
          };
        }

        Object.keys(updatedStyles).forEach(styleId => {
          const style = updatedStyles[styleId];
          if (style && style.glyphs && style.glyphs[char]) {
            updatedStyles[styleId] = {
              ...style,
              glyphs: {
                ...style.glyphs,
                [char]: {
                  ...style.glyphs[char],
                  originalImage: undefined,
                  bitmapXOffset: 0,
                  bitmapYOffset: 0,
                  bitmapScale: 100
                }
              },
              lastModified: Date.now()
            };
          }
        });
      });

      return {
        ...prev,
        glyphs: updatedActiveGlyphs,
        styles: updatedStyles,
        lastModified: Date.now()
      };
    });

    return charsWithBitmap.length;
  };


  const commitImportedGlyphs = (newGlyphs: Glyph[]) => {
    setHasUnsavedChanges(true);
    setProject(prev => {
      const updatedGlyphs = { ...prev.glyphs };
      newGlyphs.forEach(g => {
        updatedGlyphs[g.char] = {
          ...(updatedGlyphs[g.char] || {}),
          ...g,
          isAssigned: true
        };
      });

      const currentStyle = prev.styles[prev.activeStyleId];
      const updatedStyle = currentStyle ? {
        ...currentStyle,
        glyphs: updatedGlyphs,
        lastModified: Date.now()
      } : undefined;

      return {
        ...prev,
        glyphs: updatedGlyphs,
        styles: updatedStyle ? { ...prev.styles, [prev.activeStyleId]: updatedStyle } : prev.styles,
        lastModified: Date.now()
      };
    });
  };


  const copyCaseGlyphs = (direction: 'upper-to-lower' | 'lower-to-upper') => {
    setHasUnsavedChanges(true);
    const updated = { ...project.glyphs };
    let sourceCount = 0;
    let overwriteCount = 0;

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    alphabet.forEach(upperChar => {
      const lowerChar = upperChar.toLowerCase();
      const srcChar = direction === 'upper-to-lower' ? upperChar : lowerChar;
      const targetChar = direction === 'upper-to-lower' ? lowerChar : upperChar;

      const srcGlyph = project.glyphs[srcChar];
      if (srcGlyph && srcGlyph.isAssigned && srcGlyph.svgPath) {
        sourceCount++;
        const targetGlyph = project.glyphs[targetChar];
        if (targetGlyph && targetGlyph.isAssigned && targetGlyph.svgPath) {
          overwriteCount++;
        }

        updated[targetChar] = {
          ...(targetGlyph || {}),
          char: targetChar,
          name: targetChar,
          unicode: 'U+' + targetChar.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'),
          isAssigned: true,
          advanceWidth: srcGlyph.advanceWidth,
          lsb: srcGlyph.lsb,
          rsb: srcGlyph.rsb,
          xOffset: srcGlyph.xOffset || 0,
          yOffset: srcGlyph.yOffset,
          bitmapXOffset: srcGlyph.bitmapXOffset || 0,
          bitmapYOffset: srcGlyph.bitmapYOffset || 0,
          bitmapScale: srcGlyph.bitmapScale || 100,
          scale: srcGlyph.scale,
          svgPath: srcGlyph.svgPath,
          originalImage: srcGlyph.originalImage,
          contours: srcGlyph.contours ? JSON.parse(JSON.stringify(srcGlyph.contours)) : undefined,
        };
      }
    });

    setProject(prev => {
      const currentStyle = prev.styles[prev.activeStyleId];
      const updatedStyle = currentStyle ? {
        ...currentStyle,
        glyphs: updated,
        lastModified: Date.now()
      } : undefined;

      return {
        ...prev,
        glyphs: updated,
        styles: updatedStyle ? { ...prev.styles, [prev.activeStyleId]: updatedStyle } : prev.styles,
        lastModified: Date.now()
      };
    });

    return { sourceCount, overwriteCount };
  };

  const copyGlyph = (sourceChar: string, targetChar: string) => {
    if (sourceChar === targetChar) return;
    const srcGlyph = project.glyphs[sourceChar];
    if (!srcGlyph || !srcGlyph.svgPath) return;

    setHasUnsavedChanges(true);
    setProject(prev => {
      const targetGlyph = prev.glyphs[targetChar];
      const updatedGlyphs = {
        ...prev.glyphs,
        [targetChar]: {
          ...(targetGlyph || {}),
          char: targetChar,
          name: targetChar,
          unicode: 'U+' + targetChar.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'),
          isAssigned: true,
          advanceWidth: srcGlyph.advanceWidth,
          lsb: srcGlyph.lsb,
          rsb: srcGlyph.rsb,
          xOffset: srcGlyph.xOffset || 0,
          yOffset: srcGlyph.yOffset || 0,
          bitmapXOffset: srcGlyph.bitmapXOffset || 0,
          bitmapYOffset: srcGlyph.bitmapYOffset || 0,
          bitmapScale: srcGlyph.bitmapScale || 100,
          scale: srcGlyph.scale || 100,
          svgPath: srcGlyph.svgPath,
          originalImage: srcGlyph.originalImage,
          contours: srcGlyph.contours ? JSON.parse(JSON.stringify(srcGlyph.contours)) : undefined,
        }
      };

      const currentStyle = prev.styles[prev.activeStyleId];
      const updatedStyle = currentStyle ? {
        ...currentStyle,
        glyphs: updatedGlyphs,
        lastModified: Date.now()
      } : undefined;

      return {
        ...prev,
        glyphs: updatedGlyphs,
        styles: updatedStyle ? { ...prev.styles, [prev.activeStyleId]: updatedStyle } : prev.styles,
        lastModified: Date.now()
      };
    });
  };


  const updateMetrics = (partial: Partial<FontMetrics>) => {
    setHasUnsavedChanges(true);
    setProject(prev => {
      const updatedMetrics = { ...prev.metrics, ...partial };
      const updatedGlyphs = { ...prev.glyphs };

      if (partial.spaceWidth !== undefined && updatedGlyphs[' ']) {
        updatedGlyphs[' '] = {
          ...updatedGlyphs[' '],
          advanceWidth: partial.spaceWidth,
          isAssigned: true
        };
      }

      const currentStyle = prev.styles[prev.activeStyleId];
      const updatedStyle = currentStyle ? {
        ...currentStyle,
        metrics: updatedMetrics,
        glyphs: updatedGlyphs,
        lastModified: Date.now()
      } : undefined;

      return {
        ...prev,
        metrics: updatedMetrics,
        glyphs: updatedGlyphs,
        styles: updatedStyle ? { ...prev.styles, [prev.activeStyleId]: updatedStyle } : prev.styles,
        lastModified: Date.now()
      };
    });
  };


  const updateMetadata = (partial: Partial<FontMetadata>) => {
    setHasUnsavedChanges(true);
    setProject(prev => ({
      ...prev,
      metadata: { ...prev.metadata, ...partial },
      lastModified: Date.now()
    }));
  };

  const updateKerningPair = (left: string, right: string, value: number) => {
    setHasUnsavedChanges(true);
    setProject(prev => {
      const currentPairs = prev.kerningPairs || [];
      const idx = currentPairs.findIndex(p => p.left === left && p.right === right);
      let nextPairs: KerningPair[];
      if (idx >= 0) {
        nextPairs = currentPairs.map((p, i) => (i === idx ? { left, right, value } : p));
      } else {
        nextPairs = [...currentPairs, { left, right, value }];
      }

      const currentStyle = prev.styles[prev.activeStyleId];
      const updatedStyle = currentStyle ? {
        ...currentStyle,
        kerningPairs: nextPairs,
        lastModified: Date.now()
      } : undefined;

      return {
        ...prev,
        kerningPairs: nextPairs,
        styles: updatedStyle ? { ...prev.styles, [prev.activeStyleId]: updatedStyle } : prev.styles,
        lastModified: Date.now()
      };
    });
  };

  const deleteKerningPair = (left: string, right: string) => {
    setHasUnsavedChanges(true);
    setProject(prev => {
      const nextPairs = (prev.kerningPairs || []).filter(p => !(p.left === left && p.right === right));
      const currentStyle = prev.styles[prev.activeStyleId];
      const updatedStyle = currentStyle ? {
        ...currentStyle,
        kerningPairs: nextPairs,
        lastModified: Date.now()
      } : undefined;

      return {
        ...prev,
        kerningPairs: nextPairs,
        styles: updatedStyle ? { ...prev.styles, [prev.activeStyleId]: updatedStyle } : prev.styles,
        lastModified: Date.now()
      };
    });
  };

  const addKerningPair = (left: string, right: string, value: number = 0): boolean => {
    if (!left || !right) return false;
    setHasUnsavedChanges(true);
    setProject(prev => {
      const currentPairs = prev.kerningPairs || [];
      const exists = currentPairs.some(p => p.left === left && p.right === right);
      const nextPairs = exists
        ? currentPairs.map(p => (p.left === left && p.right === right ? { left, right, value } : p))
        : [...currentPairs, { left, right, value }];

      const currentStyle = prev.styles[prev.activeStyleId];
      const updatedStyle = currentStyle ? {
        ...currentStyle,
        kerningPairs: nextPairs,
        lastModified: Date.now()
      } : undefined;

      return {
        ...prev,
        kerningPairs: nextPairs,
        styles: updatedStyle ? { ...prev.styles, [prev.activeStyleId]: updatedStyle } : prev.styles,
        lastModified: Date.now()
      };
    });
    return true;
  };

  const activeStyle = project.styles[project.activeStyleId] || {
    id: project.activeStyleId,
    name: project.metadata.style || 'Regular',
    weightClass: 400,
    isItalic: false,
    metrics: project.metrics,
    glyphs: project.glyphs,
    kerningPairs: project.kerningPairs,
    lastModified: project.lastModified,
  };

  const stylesList = Object.values(project.styles);
  const glyphList = Object.values(project.glyphs);
  const assignedCount = glyphList.filter(g => g.isAssigned && g.svgPath).length;
  const totalCount = glyphList.length;

  return (
    <FontContext.Provider
      value={{
        project,
        stylesList,
        activeStyle,
        activeStyleId: project.activeStyleId,
        switchStyle,
        addStyle,
        duplicateStyle,
        deleteStyle,
        updateStyleMetadata,
        setProjectName,
        updateGlyph,
        updateGlyphsBatch,
        addGlyphs,
        removeCustomGlyph,
        deleteAllBitmaps,
        deleteProjectGlyph,
        commitImportedGlyphs,
        copyCaseGlyphs,
        copyGlyph,
        updateMetrics,
        updateMetadata,
        updateKerningPair,
        deleteKerningPair,
        addKerningPair,
        selectedGlyphChar,
        setSelectedGlyphChar,
        assignedCount,
        totalCount,
        importBoxes,
        setImportBoxes,
        importImageSrc,
        setImportImageSrc,
        hasUnsavedChanges,
        saveProject,
        lastSavedTime,
        createNewProject,
        flushToPristineEmptyState
      }}
    >
      {children}
    </FontContext.Provider>
  );
};

export const useFont = () => {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFont must be used within a FontProvider');
  }
  return context;
};
