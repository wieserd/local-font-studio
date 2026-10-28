import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Check } from 'lucide-react';
import { useFont } from '../context/FontContext';
import { Glyph } from '../types/font';
import {
  parseSvgPathToContours,
  computeContoursBounds,
  translateContours,
  contoursToSvgPath
} from '../utils/contourUtils';
import {
  ViewMode,
  CategoryFilter,
  GlyphMetricData,
  getCategory
} from './metrics/types';
import { MetricsToolbar } from './metrics/MetricsToolbar';
import { MetricsSidebar } from './metrics/MetricsSidebar';
import { MetricsTopBar } from './metrics/MetricsTopBar';
import { SpacingRhythmCanvas } from './metrics/SpacingRhythmCanvas';
import { MetricsTable } from './metrics/MetricsTable';
import { VerticalMetricsCanvas } from './metrics/VerticalMetricsCanvas';
import { OpticalAutoSpaceModal } from './metrics/OpticalAutoSpaceModal';
import { useMetricsBatchActions } from './metrics/hooks/useMetricsBatchActions';

export const MetricsView: React.FC = () => {
  const {
    project,
    activeStyle,
    updateMetrics,
    updateGlyph,
    updateGlyphsBatch,
    saveProject,
    setSelectedGlyphChar
  } = useFont();

  // Global metrics state
  const [upm, setUpm] = useState(project.metrics.upm || 1000);
  const [ascender, setAscender] = useState(project.metrics.ascender || 800);
  const [descender, setDescender] = useState(project.metrics.descender || -200);
  const [capHeight, setCapHeight] = useState(project.metrics.capHeight || 700);
  const [xHeight, setXHeight] = useState(project.metrics.xHeight || 500);
  const [lineGap, setLineGap] = useState(project.metrics.lineGap || 200);
  const [defaultAdvance, setDefaultAdvance] = useState(project.metrics.defaultAdvance || 600);
  const [defaultLsb, setDefaultLsb] = useState(project.metrics.defaultLsb || 40);
  const [defaultRsb, setDefaultRsb] = useState(project.metrics.defaultRsb || 40);
  const [spaceWidth, setSpaceWidth] = useState(project.metrics.spaceWidth || 280);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [batchToast, setBatchToast] = useState<string | null>(null);

  // View mode: 'split' | 'string' | 'table' | 'vertical'
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  // Spacing String / Rhythm Editor state
  const [testString, setTestString] = useState('HHOHHOO');
  const [canvasFontSize, setCanvasFontSize] = useState(96);
  const [selectedStringCharIndex, setSelectedStringCharIndex] = useState<number>(0);
  const [showGuidelines, setShowGuidelines] = useState(true);

  // Dragging guideline state in Canvas
  const [draggingGuide, setDraggingGuide] = useState<'lsb' | 'advance' | null>(null);
  const [dragStart, setDragStart] = useState<{ mouseX: number; initialVal: number; char: string } | null>(null);

  // Table filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  // Optical Auto-Spacing Modal state
  const [showAutoSpaceModal, setShowAutoSpaceModal] = useState(false);
  const [autoSpaceBasePadding, setAutoSpaceBasePadding] = useState(45);
  const [autoSpaceScope, setAutoSpaceScope] = useState<'all' | 'uppercase' | 'lowercase' | 'numbers' | 'selection'>('all');

  // Sync state when active project changes
  useEffect(() => {
    setUpm(project.metrics.upm || 1000);
    setAscender(project.metrics.ascender || 800);
    setDescender(project.metrics.descender || -200);
    setCapHeight(project.metrics.capHeight || 700);
    setXHeight(project.metrics.xHeight || 500);
    setLineGap(project.metrics.lineGap || 200);
    setDefaultAdvance(project.metrics.defaultAdvance || 600);
    setDefaultLsb(project.metrics.defaultLsb || 40);
    setDefaultRsb(project.metrics.defaultRsb || 40);
    setSpaceWidth(project.metrics.spaceWidth || 280);
  }, [project.metrics]);

  const showToast = (msg: string) => {
    setBatchToast(msg);
    setTimeout(() => setBatchToast(null), 3000);
  };

  const handleSaveMetrics = () => {
    updateMetrics({
      upm,
      ascender,
      descender,
      capHeight,
      xHeight,
      lineGap,
      defaultAdvance,
      defaultLsb,
      defaultRsb,
      spaceWidth
    });
    saveProject();
    setSavedSuccess(true);
    showToast('Font metrics saved successfully');
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Derive metric data for all glyphs
  const glyphsMetricData = useMemo(() => {
    const map: Record<string, GlyphMetricData> = {};
    for (const [char, g] of Object.entries(project.glyphs)) {
      const hasArtwork = Boolean(g.isAssigned && g.svgPath);
      let lsb = g.lsb !== undefined ? g.lsb : defaultLsb;
      let rsb = g.rsb !== undefined ? g.rsb : defaultRsb;
      let advanceWidth = char === ' ' ? spaceWidth : (g.advanceWidth || defaultAdvance);
      let artworkWidth = 0;

      if (hasArtwork) {
        try {
          const contours = parseSvgPathToContours(g.svgPath);
          if (contours.length > 0) {
            const bounds = computeContoursBounds(contours);
            artworkWidth = bounds.width;
            lsb = bounds.minX;
            rsb = Math.max(0, advanceWidth - bounds.maxX);
          }
        } catch {
          // Fallback
        }
      } else if (char === ' ') {
        lsb = 0;
        rsb = 0;
        artworkWidth = 0;
      }

      map[char] = {
        char,
        glyph: g,
        hasArtwork,
        artworkWidth,
        lsb,
        rsb,
        advanceWidth,
        category: getCategory(char)
      };
    }
    return map;
  }, [project.glyphs, defaultLsb, defaultRsb, defaultAdvance, spaceWidth]);

  // Filtered list of glyphs for the table
  const filteredGlyphs = useMemo(() => {
    const list = Object.values(glyphsMetricData);
    const q = searchQuery.trim().toLowerCase();

    return list.filter(item => {
      if (item.char === ' ') return false;
      if (categoryFilter === 'assigned') {
        if (!item.hasArtwork) return false;
      } else if (categoryFilter !== 'all') {
        if (item.category !== categoryFilter) return false;
      }
      if (q) {
        const matchesChar = item.char.toLowerCase().includes(q);
        const matchesName = item.glyph.name.toLowerCase().includes(q);
        const matchesUnicode = item.glyph.unicode.toLowerCase().includes(q);
        if (!matchesChar && !matchesName && !matchesUnicode) return false;
      }
      return true;
    });
  }, [glyphsMetricData, searchQuery, categoryFilter]);

  // Counts for filter pills
  const counts = useMemo(() => {
    const all = Object.values(glyphsMetricData).filter(g => g.char !== ' ');
    return {
      all: all.length,
      uppercase: all.filter(g => g.category === 'uppercase').length,
      lowercase: all.filter(g => g.category === 'lowercase').length,
      numbers: all.filter(g => g.category === 'numbers').length,
      symbols: all.filter(g => g.category === 'symbols').length,
      assigned: all.filter(g => g.hasArtwork).length,
    };
  }, [glyphsMetricData]);

  // -------------------------------------------------------------
  // Glyph Metric Mutations
  // -------------------------------------------------------------
  const handleUpdateAdvance = (char: string, newAdvance: number) => {
    const validAdvance = Math.max(10, Math.round(newAdvance));
    const data = glyphsMetricData[char];
    if (!data) return;

    if (char === ' ') {
      setSpaceWidth(validAdvance);
      updateMetrics({ spaceWidth: validAdvance });
      return;
    }

    const newRsb = data.hasArtwork
      ? Math.max(0, validAdvance - (data.lsb + data.artworkWidth))
      : Math.max(0, validAdvance - data.lsb);

    updateGlyph(char, {
      advanceWidth: validAdvance,
      rsb: newRsb
    });
  };

  const {
    handleUpdateLsb,
    handleUpdateRsb,
    handleAutoCenterGlyph,
    handleBatchAdjustAdvance,
    handleBatchAutoCenter,
    handleBatchResetToDefaults,
    opticalCandidates,
    handleApplyOpticalSpacing
  } = useMetricsBatchActions({
    glyphsMetricData,
    filteredGlyphs,
    defaultAdvance,
    defaultLsb,
    defaultRsb,
    updateGlyph,
    updateGlyphsBatch,
    showToast,
    showAutoSpaceModal,
    setShowAutoSpaceModal,
    autoSpaceBasePadding,
    autoSpaceScope
  });


  // -------------------------------------------------------------
  // Phase 2: Spacing String Rhythm Canvas Setup
  // -------------------------------------------------------------
  const scaleFactor = canvasFontSize / upm;
  const canvasHeight = Math.max(260, canvasFontSize * 2.2);
  const baselineY = Math.round(40 + (ascender * scaleFactor));

  const testChars = testString.split('');
  const stringLayout = useMemo(() => {
    let currentX = 40;
    return testChars.map((char, index) => {
      const data = glyphsMetricData[char] || {
        char,
        glyph: project.glyphs[char] || { char, name: char, unicode: '', isAssigned: false, advanceWidth: defaultAdvance, lsb: defaultLsb, rsb: defaultRsb, scale: 100, yOffset: 0, svgPath: '' },
        hasArtwork: false,
        artworkWidth: 0,
        lsb: defaultLsb,
        rsb: defaultRsb,
        advanceWidth: char === ' ' ? spaceWidth : defaultAdvance,
        category: getCategory(char)
      };

      const charAdvancePx = Math.max(10, data.advanceWidth * scaleFactor);
      const startX = currentX;
      currentX += charAdvancePx;

      return {
        index,
        char,
        data,
        startX,
        advancePx: charAdvancePx,
      };
    });
  }, [testString, glyphsMetricData, scaleFactor, defaultAdvance, defaultLsb, defaultRsb, spaceWidth]);

  const activeCharLayout = stringLayout[selectedStringCharIndex] || stringLayout[0];

  const handleCanvasGuideMouseDown = (guide: 'lsb' | 'advance', e: React.MouseEvent, char: string, initialVal: number) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingGuide(guide);
    setDragStart({
      mouseX: e.clientX,
      initialVal,
      char
    });
  };

  useEffect(() => {
    if (!draggingGuide || !dragStart) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaXFont = (e.clientX - dragStart.mouseX) / scaleFactor;
      if (draggingGuide === 'lsb') {
        const nextLsb = Math.max(0, Math.round(dragStart.initialVal + deltaXFont));
        handleUpdateLsb(dragStart.char, nextLsb);
      } else if (draggingGuide === 'advance') {
        const nextAdvance = Math.max(60, Math.round(dragStart.initialVal + deltaXFont));
        handleUpdateAdvance(dragStart.char, nextAdvance);
      }
    };

    const handleMouseUp = () => {
      setDraggingGuide(null);
      setDragStart(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingGuide, dragStart, scaleFactor]);

  const totalCanvasWidth = stringLayout.length > 0
    ? Math.max(800, stringLayout[stringLayout.length - 1].startX + stringLayout[stringLayout.length - 1].advancePx + 100)
    : 800;

  // -------------------------------------------------------------
  // Phase 3: Vertical Metrics Specimen Calibration Handlers
  // -------------------------------------------------------------
  const handleAutoDetectVerticalMetrics = () => {
    let detectedCap = capHeight;
    let detectedX = xHeight;
    let detectedAsc = ascender;
    let detectedDesc = descender;
    let detectedCount = 0;

    const getBoundsForChar = (c: string) => {
      const g = project.glyphs[c];
      if (!g || !g.svgPath) return null;
      try {
        const contours = parseSvgPathToContours(g.svgPath);
        if (contours.length === 0) return null;
        return computeContoursBounds(contours);
      } catch {
        return null;
      }
    };

    for (const testChar of ['H', 'I', 'E', 'T', 'M', 'A']) {
      const b = getBoundsForChar(testChar);
      if (b && b.maxY > 200) {
        detectedCap = Math.round(b.maxY);
        detectedCount++;
        break;
      }
    }

    for (const testChar of ['x', 'v', 'w', 'z', 'n', 'o']) {
      const b = getBoundsForChar(testChar);
      if (b && b.maxY > 100) {
        detectedX = Math.round(b.maxY);
        detectedCount++;
        break;
      }
    }

    for (const testChar of ['d', 'l', 'b', 'h', 'k']) {
      const b = getBoundsForChar(testChar);
      if (b && b.maxY > detectedCap) {
        detectedAsc = Math.round(b.maxY);
        detectedCount++;
        break;
      }
    }
    for (const testChar of ['Å', 'Ä', 'Ö', 'É']) {
      const b = getBoundsForChar(testChar);
      if (b && b.maxY > detectedAsc) {
        detectedAsc = Math.round(b.maxY + 15);
        break;
      }
    }

    for (const testChar of ['p', 'g', 'q', 'y', 'j']) {
      const b = getBoundsForChar(testChar);
      if (b && b.minY < -20) {
        detectedDesc = Math.round(b.minY);
        detectedCount++;
        break;
      }
    }

    if (detectedCount === 0) {
      showToast('No relevant vector glyphs found to calibrate vertical metrics.');
      return;
    }

    setCapHeight(detectedCap);
    setXHeight(detectedX);
    setAscender(detectedAsc);
    setDescender(detectedDesc);

    updateMetrics({
      capHeight: detectedCap,
      xHeight: detectedX,
      ascender: detectedAsc,
      descender: detectedDesc
    });

    showToast(`Auto-calibrated: Cap (${detectedCap}), x-Height (${detectedX}), Ascender (${detectedAsc}), Descender (${detectedDesc})`);
  };

  const handleResetVerticalDefaults = () => {
    const stdAsc = Math.round(upm * 0.8);
    const stdCap = Math.round(upm * 0.7);
    const stdX = Math.round(upm * 0.5);
    const stdDesc = -Math.round(upm * 0.2);
    const stdGap = Math.round(upm * 0.2);

    setAscender(stdAsc);
    setCapHeight(stdCap);
    setXHeight(stdX);
    setDescender(stdDesc);
    setLineGap(stdGap);

    updateMetrics({
      ascender: stdAsc,
      capHeight: stdCap,
      xHeight: stdX,
      descender: stdDesc,
      lineGap: stdGap
    });

    showToast(`Reset vertical metrics to standard UPM ${upm} defaults.`);
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', backgroundColor: 'var(--bg-main)' }}>
      {/* Toast Notification */}
      {batchToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#1e293b',
          border: '1px solid var(--accent)',
          borderRadius: '8px',
          padding: '10px 16px',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={14} color="#10b981" />
          <span>{batchToast}</span>
        </div>
      )}

      {/* LEFT TOOLBAR */}
      <MetricsToolbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        showGuidelines={showGuidelines}
        setShowGuidelines={setShowGuidelines}
        onOpenAutoSpaceModal={() => setShowAutoSpaceModal(true)}
        onAutoCenterActiveChar={() => {
          const char = testString[selectedStringCharIndex] || 'H';
          handleAutoCenterGlyph(char);
        }}
        activeChar={testString[selectedStringCharIndex] || 'H'}
        canvasFontSize={canvasFontSize}
        setCanvasFontSize={setCanvasFontSize}
      />

      {/* MAIN WORKSPACE AREA: Top Bar + Content Workspaces */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Top Header Bar */}
        <MetricsTopBar
          viewMode={viewMode}
          assignedCount={counts.assigned}
          allCount={counts.all}
          canvasFontSize={canvasFontSize}
        />

        {/* WORKSPACE CONTENT AREA */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* PHASE 2: SPACING STRING RHYTHM CANVAS */}
          {(viewMode === 'split' || viewMode === 'string') && (
            <SpacingRhythmCanvas
              testString={testString}
              setTestString={setTestString}
              canvasFontSize={canvasFontSize}
              setCanvasFontSize={setCanvasFontSize}
              selectedStringCharIndex={selectedStringCharIndex}
              setSelectedStringCharIndex={setSelectedStringCharIndex}
              showGuidelines={showGuidelines}
              setShowGuidelines={setShowGuidelines}
              stringLayout={stringLayout}
              totalCanvasWidth={totalCanvasWidth}
              canvasHeight={canvasHeight}
              baselineY={baselineY}
              scaleFactor={scaleFactor}
              ascender={ascender}
              capHeight={capHeight}
              xHeight={xHeight}
              descender={descender}
              activeCharLayout={activeCharLayout}
              handleCanvasGuideMouseDown={handleCanvasGuideMouseDown}
              handleUpdateAdvance={handleUpdateAdvance}
              handleUpdateLsb={handleUpdateLsb}
              handleUpdateRsb={handleUpdateRsb}
              handleAutoCenterGlyph={handleAutoCenterGlyph}
              viewMode={viewMode}
            />
          )}

          {/* PHASE 1: METRICS GRID TABLE & FILTERS */}
          {(viewMode === 'split' || viewMode === 'table') && (
            <MetricsTable
              filteredGlyphs={filteredGlyphs}
              counts={counts}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              spaceWidth={spaceWidth}
              testString={testString}
              setTestString={setTestString}
              showToast={showToast}
              upm={upm}
              ascender={ascender}
              descender={descender}
              handleUpdateAdvance={handleUpdateAdvance}
              handleUpdateLsb={handleUpdateLsb}
              handleUpdateRsb={handleUpdateRsb}
              handleAutoCenterGlyph={handleAutoCenterGlyph}
              handleBatchAdjustAdvance={handleBatchAdjustAdvance}
              handleBatchAutoCenter={handleBatchAutoCenter}
              handleBatchResetToDefaults={handleBatchResetToDefaults}
              onOpenAutoSpaceModal={() => setShowAutoSpaceModal(true)}
            />
          )}

          {/* PHASE 3: VISUAL VERTICAL METRICS SPECIMEN CANVAS */}
          {viewMode === 'vertical' && (
            <VerticalMetricsCanvas
              upm={upm}
              ascender={ascender}
              setAscender={setAscender}
              capHeight={capHeight}
              setCapHeight={setCapHeight}
              xHeight={xHeight}
              setXHeight={setXHeight}
              descender={descender}
              setDescender={setDescender}
              lineGap={lineGap}
              setLineGap={setLineGap}
              updateMetrics={updateMetrics}
              glyphsMetricData={glyphsMetricData}
              defaultAdvance={defaultAdvance}
              defaultLsb={defaultLsb}
              defaultRsb={defaultRsb}
              spaceWidth={spaceWidth}
              onAutoCalibrate={handleAutoDetectVerticalMetrics}
              onResetDefaults={handleResetVerticalDefaults}
            />
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR: Global Font Metrics Settings */}
      <MetricsSidebar
        upm={upm}
        setUpm={setUpm}
        ascender={ascender}
        setAscender={setAscender}
        descender={descender}
        setDescender={setDescender}
        capHeight={capHeight}
        setCapHeight={setCapHeight}
        xHeight={xHeight}
        setXHeight={setXHeight}
        lineGap={lineGap}
        setLineGap={setLineGap}
        defaultAdvance={defaultAdvance}
        setDefaultAdvance={setDefaultAdvance}
        defaultLsb={defaultLsb}
        setDefaultLsb={setDefaultLsb}
        defaultRsb={defaultRsb}
        setDefaultRsb={setDefaultRsb}
        spaceWidth={spaceWidth}
        setSpaceWidth={setSpaceWidth}
        activeStyleName={activeStyle?.name}
        updateMetrics={updateMetrics}
      />

      {/* PHASE 4: OPTICAL AUTO-SPACING WIZARD MODAL */}
      <OpticalAutoSpaceModal
        isOpen={showAutoSpaceModal}
        onClose={() => setShowAutoSpaceModal(false)}
        basePadding={autoSpaceBasePadding}
        setBasePadding={setAutoSpaceBasePadding}
        scope={autoSpaceScope}
        setScope={setAutoSpaceScope}
        totalAssigned={counts.assigned}
        filteredCount={filteredGlyphs.length}
        candidates={opticalCandidates}
        onApply={handleApplyOpticalSpacing}
      />
    </div>
  );
};
