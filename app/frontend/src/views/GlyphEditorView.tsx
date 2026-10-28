import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFont } from '../context/FontContext';
import {
  GlyphContour,
  parseSvgPathToContours,
  contoursToSvgPath,
  computeContoursBounds,
} from '../utils/contourUtils';
import { auditContourGeometry, autoFixContours, fixSpecificAuditIssue, AuditIssue } from '../utils/fontAudit';
import { FontAuditModal } from '../components/audit/FontAuditModal';
import { EditorToolbar } from './editor/EditorToolbar';
import { EditorSubheader } from './editor/EditorSubheader';
import { EditorCanvas } from './editor/canvas/EditorCanvas';
import { EditorSidebar } from './editor/EditorSidebar';
import { ReplaceGlyphSvgModal } from './editor/ReplaceGlyphSvgModal';
import { EditorTool, ResizeHandle, AccordionSectionId } from './editor/types';

// Modular Hooks
import { useCanvasGestures } from './editor/hooks/useCanvasGestures';
import { useGlyphMetrics } from './editor/hooks/useGlyphMetrics';
import { useVectorPointEditing } from './editor/hooks/useVectorPointEditing';
import { useContourStylization } from './editor/hooks/useContourStylization';
import { useGlyphBitmapOverlay } from './editor/hooks/useGlyphBitmapOverlay';
import { useGlyphSvgIO } from './editor/hooks/useGlyphSvgIO';
import { useCanvasInteractionHandlers } from './editor/hooks/useCanvasInteractionHandlers';

interface GlyphEditorViewProps {
  glyphChar: string;
  onReplaceGlyph?: (char: string) => void;
}

export const GlyphEditorView: React.FC<GlyphEditorViewProps> = ({ glyphChar, onReplaceGlyph }) => {
  const { project, updateGlyph } = useFont();
  const currentGlyph = project.glyphs[glyphChar] || {
    char: glyphChar,
    name: glyphChar,
    unicode: 'U+' + glyphChar.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'),
    isAssigned: false,
    advanceWidth: project.metrics.defaultAdvance,
    lsb: project.metrics.defaultLsb,
    rsb: project.metrics.defaultRsb,
    xOffset: 0,
    yOffset: 0,
    bitmapXOffset: 0,
    bitmapYOffset: 0,
    bitmapScale: 100,
    scale: 100,
    svgPath: '',
  };

  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [showNodes, setShowNodes] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [scaffoldingToast, setScaffoldingToast] = useState<string | null>(null);

  // Accordion Sections State
  const [openSections, setOpenSections] = useState<Record<AccordionSectionId, boolean>>({
    metrics: true,
    transform: true,
    curves: false,
    nodes: false,
    bitmap: false,
    advanced: false,
  });

  const toggleSection = (id: AccordionSectionId) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExpandAll = () => {
    setOpenSections({
      metrics: true,
      transform: true,
      curves: true,
      nodes: true,
      bitmap: true,
      advanced: true,
    });
  };

  const handleCollapseAll = () => {
    setOpenSections({
      metrics: false,
      transform: false,
      curves: false,
      nodes: false,
      bitmap: false,
      advanced: false,
    });
  };

  const handleTriggerScaffolding = (featureName: string) => {
    setScaffoldingToast(`[Scaffolding] ${featureName} is coming in the advanced vector update.`);
    setTimeout(() => setScaffoldingToast(null), 3500);
  };

  const svgRef = useRef<SVGSVGElement | null>(null);
  const bitmapContainerRef = useRef<HTMLDivElement | null>(null);

  // Parse SVG path to structured contours
  const contours: GlyphContour[] = useMemo(() => {
    return parseSvgPathToContours(currentGlyph.svgPath);
  }, [currentGlyph.svgPath]);

  // Overall glyph bounding box
  const glyphBounds = useMemo(() => {
    return computeContoursBounds(contours);
  }, [contours]);

  // FontAudit State & Computed Report
  const [showAuditOverlay, setShowAuditOverlay] = useState<boolean>(true);
  const [fontAuditModalOpen, setFontAuditModalOpen] = useState<boolean>(false);

  const auditReport = useMemo(() => {
    return auditContourGeometry(contours, glyphChar);
  }, [contours, glyphChar]);

  const handleAutoFixAll = () => {
    if (contours.length === 0) return;
    const { contours: fixed, fixedCount, fixedActions } = autoFixContours(contours);
    if (fixedCount > 0) {
      const newSvg = contoursToSvgPath(fixed);
      updateGlyph(glyphChar, { contours: fixed, svgPath: newSvg });
      setScaffoldingToast(`✓ FontAudit: ${fixedActions.join(' • ')}`);
      setTimeout(() => setScaffoldingToast(null), 4000);
    }
  };

  const handleAutoFixWinding = () => {
    if (contours.length === 0) return;
    const { contours: fixed, fixedActions } = autoFixContours(contours);
    const windingAction = fixedActions.find(a => a.toLowerCase().includes('winding'));
    if (windingAction) {
      const newSvg = contoursToSvgPath(fixed);
      updateGlyph(glyphChar, { contours: fixed, svgPath: newSvg });
      setScaffoldingToast(`✓ FontAudit: ${windingAction}`);
      setTimeout(() => setScaffoldingToast(null), 3500);
    } else {
      setScaffoldingToast('Contour winding directions are already correct.');
      setTimeout(() => setScaffoldingToast(null), 2500);
    }
  };

  const handleAutoFixMicroSegments = () => {
    if (contours.length === 0) return;
    const { contours: fixed, fixedActions } = autoFixContours(contours);
    const microAction = fixedActions.find(a => a.toLowerCase().includes('micro'));
    if (microAction) {
      const newSvg = contoursToSvgPath(fixed);
      updateGlyph(glyphChar, { contours: fixed, svgPath: newSvg });
      setScaffoldingToast(`✓ FontAudit: ${microAction}`);
      setTimeout(() => setScaffoldingToast(null), 3500);
    } else {
      setScaffoldingToast('No micro-segments detected.');
      setTimeout(() => setScaffoldingToast(null), 2500);
    }
  };

  const handleAutoFixRedundantPoints = () => {
    if (contours.length === 0) return;
    const { contours: fixed, fixedActions } = autoFixContours(contours);
    const redundantAction = fixedActions.find(a => a.toLowerCase().includes('redundant'));
    if (redundantAction) {
      const newSvg = contoursToSvgPath(fixed);
      updateGlyph(glyphChar, { contours: fixed, svgPath: newSvg });
      setScaffoldingToast(`✓ FontAudit: ${redundantAction}`);
      setTimeout(() => setScaffoldingToast(null), 3500);
    } else {
      setScaffoldingToast('No collinear redundant points detected.');
      setTimeout(() => setScaffoldingToast(null), 2500);
    }
  };

  const handleFixSpecificIssue = (issue: AuditIssue) => {
    if (contours.length === 0) return;
    const { contours: fixed, actionDescription } = fixSpecificAuditIssue(contours, issue);
    const newSvg = contoursToSvgPath(fixed);
    updateGlyph(glyphChar, { contours: fixed, svgPath: newSvg });
    setScaffoldingToast(`✓ FontAudit: ${actionDescription}`);
    setTimeout(() => setScaffoldingToast(null), 3500);
  };

  // Layout parameters
  const { ascender, capHeight, xHeight, descender } = project.metrics;
  const baselineY = 560;
  const fontScale = 0.6;

  // 1. Hook: Metrics & Positioning
  const metricsHook = useGlyphMetrics({
    glyphChar,
    currentGlyph,
    glyphBounds,
    fontScale,
    updateGlyph,
  });

  const lsbX = 70 + (metricsHook.lsb * fontScale);
  const advanceX = 70 + (metricsHook.advanceWidth * fontScale);
  const ascenderY = baselineY - (ascender * fontScale);
  const capHeightY = baselineY - (capHeight * fontScale);
  const xHeightY = baselineY - (xHeight * fontScale);
  const descenderY = baselineY - (descender * fontScale);

  // Base bitmap dimensions
  const baseBitmapWidth = Math.max(40, (metricsHook.advanceWidth - metricsHook.lsb * 2) * fontScale);

  // 2. Hook: Stylization & Contour Transforms (Rotation, Flip, Weight, Slant, Smooth)
  const stylizeHook = useContourStylization({
    glyphChar,
    contours,
    selectedPoint: null, // Will connect dynamically
    pushUndo: () => pointEditHook.pushUndo(),
    updateGlyph,
    setSavedToast: metricsHook.setSavedToast,
  });

  // 3. Hook: Vector Point & Path Editing (Undo/Redo, Point selection, Insertion, Deletion)
  const pointEditHook = useVectorPointEditing({
    glyphChar,
    currentGlyph,
    contours,
    glyphBounds,
    updateGlyph,
    setActiveTool,
    onResetStylizationBaseline: stylizeHook.resetStylizationBaseline,
  });

  // Auto-expand nodes section when a point is selected
  useEffect(() => {
    if (pointEditHook.selectedPoint) {
      setOpenSections(prev => ({ ...prev, nodes: true }));
    }
  }, [pointEditHook.selectedPoint]);

  // 4. Hook: Bitmap Overlay & Retrace
  const bitmapHook = useGlyphBitmapOverlay({
    glyphChar,
    currentGlyph,
    metrics: project.metrics,
    xOffset: metricsHook.xOffset,
    yOffset: metricsHook.yOffset,
    pushUndo: pointEditHook.pushUndo,
    updateGlyph,
    onClearSelectedPoint: () => pointEditHook.setSelectedPoint(null),
  });

  const currentBitmapWidth = Math.max(20, Math.round(baseBitmapWidth * (bitmapHook.bitmapScale / 100)));

  // 5. Hook: SVG Import & Export
  const svgIOHook = useGlyphSvgIO({
    glyphChar,
    currentGlyph,
    project,
    contours,
    advanceWidth: metricsHook.advanceWidth,
    setAdvanceWidth: metricsHook.setAdvanceWidth,
    setLsb: metricsHook.setLsb,
    setRsb: metricsHook.setRsb,
    pushUndo: pointEditHook.pushUndo,
    updateGlyph,
  });

  // Keep live refs for uninterrupted, lag-free dragging
  const selectedPointRef = useRef(pointEditHook.selectedPoint);
  selectedPointRef.current = pointEditHook.selectedPoint;

  const contoursRef = useRef(contours);
  contoursRef.current = contours;

  const pointDragRef = useRef<{
    active: { contourIndex: number; pointIndex: number };
    initialX: number;
    initialY: number;
    startX: number;
    startY: number;
  } | null>(null);

  const offsetRef = useRef({ x: metricsHook.xOffset, y: metricsHook.yOffset });
  offsetRef.current = { x: metricsHook.xOffset, y: metricsHook.yOffset };

  const bitmapOffsetRef = useRef({ x: bitmapHook.bitmapXOffset, y: bitmapHook.bitmapYOffset });
  bitmapOffsetRef.current = { x: bitmapHook.bitmapXOffset, y: bitmapHook.bitmapYOffset };

  const bitmapScaleRef = useRef(bitmapHook.bitmapScale);
  bitmapScaleRef.current = bitmapHook.bitmapScale;

  const guideValRef = useRef({ lsb: metricsHook.lsb, advanceWidth: metricsHook.advanceWidth });
  guideValRef.current = { lsb: metricsHook.lsb, advanceWidth: metricsHook.advanceWidth };

  // 6. Hook: Canvas Interaction Handlers (Mouse down, mouse move, edge detection)
  const canvasInteractionHook = useCanvasInteractionHandlers({
    svgRef: svgRef as React.RefObject<SVGSVGElement>,
    bitmapContainerRef: bitmapContainerRef as React.RefObject<HTMLDivElement>,
    scale: metricsHook.scale,
    fontScale,
    xOffset: metricsHook.xOffset,
    yOffset: metricsHook.yOffset,
    baselineY,
    activeTool,
    contours,
    glyphBounds,
    selectedPoint: pointEditHook.selectedPoint,
    setSelectedPoint: pointEditHook.setSelectedPoint,
    hoverEdge: pointEditHook.hoverEdge,
    setHoverEdge: pointEditHook.setHoverEdge,
    setMouseFontPos: pointEditHook.setMouseFontPos,
    handleAddPointConnectedToSelected: pointEditHook.handleAddPointConnectedToSelected,
    handleInsertPointOnHoverEdge: pointEditHook.handleInsertPointOnHoverEdge,
    handleStartNewPoint: pointEditHook.handleStartNewPoint,
    pushUndo: pointEditHook.pushUndo,
    setIsRotating: stylizeHook.setIsRotating,
    setLiveRotationAngle: stylizeHook.setLiveRotationAngle,
    rotationDragRef: stylizeHook.rotationDragRef,
    setIsDraggingPoint: pointEditHook.setIsDraggingPoint,
    pointDragRef,
    bitmapScale: bitmapHook.bitmapScale,
    currentBitmapWidth,
    bitmapXOffset: bitmapHook.bitmapXOffset,
    bitmapYOffset: bitmapHook.bitmapYOffset,
    lsb: metricsHook.lsb,
    advanceWidth: metricsHook.advanceWidth,
  });

  // 7. Hook: Encapsulated window drag gesture listeners & keyboard shortcuts
  useCanvasGestures({
    glyphChar,
    updateGlyph,
    scale: metricsHook.scale,
    fontScale,
    contoursRef,
    baseBitmapWidth,
    isDraggingPoint: pointEditHook.isDraggingPoint,
    setIsDraggingPoint: pointEditHook.setIsDraggingPoint,
    pointDragRef,
    isDraggingGlyph: canvasInteractionHook.isDraggingGlyph,
    setIsDraggingGlyph: canvasInteractionHook.setIsDraggingGlyph,
    dragStartPos: canvasInteractionHook.dragStartPos,
    setDragStartPos: canvasInteractionHook.setDragStartPos,
    setXOffset: metricsHook.setXOffset,
    setYOffset: metricsHook.setYOffset,
    offsetRef,
    isRotating: stylizeHook.isRotating,
    setIsRotating: stylizeHook.setIsRotating,
    getFontCoordinates: canvasInteractionHook.getFontCoordinates,
    rotationDragRef: stylizeHook.rotationDragRef,
    setLiveRotationAngle: stylizeHook.setLiveRotationAngle,
    setSavedToast: metricsHook.setSavedToast,
    isDraggingBitmap: canvasInteractionHook.isDraggingBitmap,
    setIsDraggingBitmap: canvasInteractionHook.setIsDraggingBitmap,
    bitmapDragStart: canvasInteractionHook.bitmapDragStart,
    setBitmapDragStart: canvasInteractionHook.setBitmapDragStart,
    setBitmapXOffset: bitmapHook.setBitmapXOffset,
    setBitmapYOffset: bitmapHook.setBitmapYOffset,
    bitmapOffsetRef,
    resizingHandle: canvasInteractionHook.resizingHandle,
    setResizingHandle: canvasInteractionHook.setResizingHandle,
    resizeStart: canvasInteractionHook.resizeStart,
    setResizeStart: canvasInteractionHook.setResizeStart,
    setBitmapScale: bitmapHook.setBitmapScale,
    bitmapScaleRef,
    draggingGuide: canvasInteractionHook.draggingGuide,
    setDraggingGuide: canvasInteractionHook.setDraggingGuide,
    guideStart: canvasInteractionHook.guideStart,
    setGuideStart: canvasInteractionHook.setGuideStart,
    setLsb: metricsHook.setLsb,
    setAdvanceWidth: metricsHook.setAdvanceWidth,
    guideValRef,
    selectedPointRef,
    setSelectedPoint: pointEditHook.setSelectedPoint,
    handleDeleteSelectedPoint: pointEditHook.handleDeleteSelectedPoint,
    handleUndo: pointEditHook.handleUndo,
    handleRedo: pointEditHook.handleRedo,
    activeTool,
    setActiveTool,
  });

  // Flattened list of all points with identifiers
  const allPoints = useMemo(() => {
    const list: Array<{ x: number; y: number; contourIndex: number; pointIndex: number }> = [];
    contours.forEach((contour, ci) => {
      contour.forEach((p, pi) => {
        list.push({ x: p.x, y: p.y, contourIndex: ci, pointIndex: pi });
      });
    });
    return list;
  }, [contours]);

  // Active selected point data
  const activeSelectedPointData = useMemo(() => {
    if (!pointEditHook.selectedPoint) return null;
    const { contourIndex, pointIndex } = pointEditHook.selectedPoint;
    const contour = contours[contourIndex];
    if (!contour || !contour[pointIndex]) return null;
    return {
      ...pointEditHook.selectedPoint,
      point: contour[pointIndex]
    };
  }, [pointEditHook.selectedPoint, contours]);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* 1. Left Vertical Tool Palette */}
      <EditorToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        onClearSelectedPoint={() => pointEditHook.setSelectedPoint(null)}
        onUndo={pointEditHook.handleUndo}
        onRedo={pointEditHook.handleRedo}
        canUndo={pointEditHook.undoStack.length > 0}
        canRedo={pointEditHook.redoStack.length > 0}
        onResetPosition={metricsHook.handleResetPosition}
        onCenterGlyph={metricsHook.handleCenterGlyph}
        onZoomIn={() => setZoom(prev => Math.min(200, prev + 20))}
        onZoomOut={() => setZoom(prev => Math.max(60, prev - 20))}
      />

      {/* 2. Main Central Vector Canvas */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0a0d14',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Editor Sub-header / Guides Status */}
        <EditorSubheader
          glyphChar={glyphChar}
          unicode={currentGlyph.unicode}
          pointCount={allPoints.length}
          capHeight={capHeight}
          advanceWidth={metricsHook.advanceWidth}
          hasOriginalImage={Boolean(currentGlyph.originalImage)}
          zoom={zoom}
          setZoom={setZoom}
          showOriginalImage={bitmapHook.showOriginalImage}
          setShowOriginalImage={bitmapHook.setShowOriginalImage}
          showNodes={showNodes}
          setShowNodes={setShowNodes}
          auditReport={auditReport}
          showAuditOverlay={showAuditOverlay}
          setShowAuditOverlay={setShowAuditOverlay}
          onToggleAuditSection={() => setOpenSections(prev => ({ ...prev, advanced: true }))}
          onAutoFixAll={handleAutoFixAll}
          onFixAuditIssue={handleFixSpecificIssue}
          onOpenFontAuditModal={() => setFontAuditModalOpen(true)}
          onReplaceGlyph={onReplaceGlyph}
          onOpenImportDialog={svgIOHook.handleOpenImportDialog}
          onExportSvg={svgIOHook.handleExportSvg}
        />

        {/* Interactive SVG Canvas Area */}
        <EditorCanvas
          zoom={zoom}
          exportToast={svgIOHook.exportToast}
          scaffoldingToast={scaffoldingToast}
          glyphChar={glyphChar}
          advanceWidth={metricsHook.advanceWidth}
          isDraggingGlyph={canvasInteractionHook.isDraggingGlyph}
          isDraggingBitmap={canvasInteractionHook.isDraggingBitmap}
          resizingHandle={canvasInteractionHook.resizingHandle}
          isDraggingPoint={pointEditHook.isDraggingPoint}
          selectedPoint={pointEditHook.selectedPoint}
          isRotating={stylizeHook.isRotating}
          activeTool={activeTool}
          liveRotationAngle={stylizeHook.liveRotationAngle}
          activeSelectedPointData={activeSelectedPointData}
          handleSmoothContours={stylizeHook.handleSmoothContours}
          handleDeleteSelectedPoint={pointEditHook.handleDeleteSelectedPoint}
          setSelectedPoint={pointEditHook.setSelectedPoint}
          bitmapScale={bitmapHook.bitmapScale}
          currentBitmapWidth={currentBitmapWidth}
          bitmapXOffset={bitmapHook.bitmapXOffset}
          bitmapYOffset={bitmapHook.bitmapYOffset}
          xOffset={metricsHook.xOffset}
          yOffset={metricsHook.yOffset}
          ascenderY={ascenderY}
          ascender={ascender}
          capHeightY={capHeightY}
          capHeight={capHeight}
          xHeightY={xHeightY}
          xHeight={xHeight}
          baselineY={baselineY}
          descenderY={descenderY}
          descender={descender}
          lsbX={lsbX}
          lsb={metricsHook.lsb}
          advanceX={advanceX}
          rsb={metricsHook.rsb}
          draggingGuide={canvasInteractionHook.draggingGuide}
          handleGuideMouseDown={canvasInteractionHook.handleGuideMouseDown}
          showOriginalImage={bitmapHook.showOriginalImage}
          originalImage={currentGlyph.originalImage}
          bitmapContainerRef={bitmapContainerRef as React.RefObject<HTMLDivElement>}
          setIsDraggingBitmap={canvasInteractionHook.setIsDraggingBitmap}
          setBitmapDragStart={canvasInteractionHook.setBitmapDragStart}
          fontScale={fontScale}
          handleResizeHandleMouseDown={canvasInteractionHook.handleResizeHandleMouseDown}
          svgRef={svgRef as React.RefObject<SVGSVGElement>}
          handleCanvasMouseMove={canvasInteractionHook.handleCanvasMouseMove}
          handleCanvasMouseDown={canvasInteractionHook.handleCanvasMouseDown}
          scale={metricsHook.scale}
          currentGlyph={currentGlyph}
          contours={contours}
          glyphBounds={glyphBounds}
          mouseFontPos={pointEditHook.mouseFontPos}
          hoverEdge={pointEditHook.hoverEdge}
          showNodes={showNodes}
          allPoints={allPoints}
          handlePointMouseDown={canvasInteractionHook.handlePointMouseDown}
          showAuditOverlay={showAuditOverlay}
          auditReport={auditReport}
          onSelectPoint={pointEditHook.setSelectedPoint}
          onFixAuditIssue={handleFixSpecificIssue}
        />
      </div>

      {/* 3. Right Settings Sidebar (Categorized & Expandable) */}
      <EditorSidebar
        glyphChar={glyphChar}
        currentGlyph={currentGlyph}
        allPoints={allPoints}
        contours={contours}
        openSections={openSections}
        handleExpandAll={handleExpandAll}
        handleCollapseAll={handleCollapseAll}
        toggleSection={toggleSection}
        onReplaceGlyph={onReplaceGlyph}

        advanceWidth={metricsHook.advanceWidth}
        setAdvanceWidth={metricsHook.setAdvanceWidth}
        lsb={metricsHook.lsb}
        setLsb={metricsHook.setLsb}
        rsb={metricsHook.rsb}
        setRsb={metricsHook.setRsb}
        handleSaveMetrics={metricsHook.handleSaveMetrics}
        savedToast={metricsHook.savedToast}
        handleOpenImportDialog={svgIOHook.handleOpenImportDialog}
        handleExportSvg={svgIOHook.handleExportSvg}

        xOffset={metricsHook.xOffset}
        setXOffset={metricsHook.setXOffset}
        yOffset={metricsHook.yOffset}
        setYOffset={metricsHook.setYOffset}
        updateGlyph={updateGlyph}
        handleCenterGlyph={metricsHook.handleCenterGlyph}
        handleResetPosition={metricsHook.handleResetPosition}
        scale={metricsHook.scale}
        setScale={metricsHook.setScale}
        activeTool={activeTool}
        handleRotateGlyph={stylizeHook.handleRotateGlyph}
        handleFlipGlyph={stylizeHook.handleFlipGlyph}
        customRotationAngle={stylizeHook.customRotationAngle}
        setCustomRotationAngle={stylizeHook.setCustomRotationAngle}

        stemWeight={stylizeHook.stemWeight}
        handleStemWeightChange={stylizeHook.handleStemWeightChange}
        italicSlant={stylizeHook.italicSlant}
        handleItalicSlantChange={stylizeHook.handleItalicSlantChange}
        handleResetStylize={stylizeHook.handleResetStylize}

        smoothStrength={stylizeHook.smoothStrength}
        setSmoothStrength={stylizeHook.setSmoothStrength}
        smoothIterations={stylizeHook.smoothIterations}
        setSmoothIterations={stylizeHook.setSmoothIterations}
        smoothToast={stylizeHook.smoothToast}
        preserveSharpCorners={stylizeHook.preserveSharpCorners}
        setPreserveSharpCorners={stylizeHook.setPreserveSharpCorners}
        cornerThreshold={stylizeHook.cornerThreshold}
        setCornerThreshold={stylizeHook.setCornerThreshold}
        handleSmoothContours={stylizeHook.handleSmoothContours}
        selectedPoint={pointEditHook.selectedPoint}
        setSelectedPoint={pointEditHook.setSelectedPoint}
        handleTriggerScaffolding={handleTriggerScaffolding}

        activeSelectedPointData={activeSelectedPointData}
        handleDeleteSelectedPoint={pointEditHook.handleDeleteSelectedPoint}
        handleStartNewContour={pointEditHook.handleStartNewContour}

        bitmapScale={bitmapHook.bitmapScale}
        setBitmapScale={bitmapHook.setBitmapScale}
        bitmapXOffset={bitmapHook.bitmapXOffset}
        setBitmapXOffset={bitmapHook.setBitmapXOffset}
        bitmapYOffset={bitmapHook.bitmapYOffset}
        setBitmapYOffset={bitmapHook.setBitmapYOffset}
        handleAlignBitmapToGlyph={bitmapHook.handleAlignBitmapToGlyph}
        handleResetBitmapPosition={bitmapHook.handleResetBitmapPosition}
        threshold={bitmapHook.threshold}
        setThreshold={bitmapHook.setThreshold}
        simplification={bitmapHook.simplification}
        setSimplification={bitmapHook.setSimplification}
        handleRetrace={bitmapHook.handleRetrace}
        handleLoadBitmap={bitmapHook.handleLoadBitmap}
        handleDeleteBitmap={bitmapHook.handleDeleteBitmap}

        // 6. FontAudit & Path Tools
        auditReport={auditReport}
        showAuditOverlay={showAuditOverlay}
        setShowAuditOverlay={setShowAuditOverlay}
        onAutoFixAll={handleAutoFixAll}
        onAutoFixWinding={handleAutoFixWinding}
        onAutoFixMicroSegments={handleAutoFixMicroSegments}
        onAutoFixRedundantPoints={handleAutoFixRedundantPoints}
        onFixAuditIssue={handleFixSpecificIssue}
        onOpenFontAuditModal={() => setFontAuditModalOpen(true)}
      />

      {/* Hidden file input for SVG import */}
      <input
        type="file"
        ref={svgIOHook.fileInputRef}
        onChange={svgIOHook.handleFileSelected}
        accept=".svg,image/svg+xml"
        style={{ display: 'none' }}
      />

      {/* Prompt Modal: Replace Glyph with Imported SVG */}
      <ReplaceGlyphSvgModal
        isOpen={Boolean(svgIOHook.importSvgCandidate)}
        onClose={() => svgIOHook.setImportSvgCandidate(null)}
        glyphChar={glyphChar}
        candidate={svgIOHook.importSvgCandidate}
        currentSvgPath={currentGlyph.svgPath || ''}
        currentAdvanceWidth={metricsHook.advanceWidth}
        upm={project.metrics.upm || 1000}
        ascender={project.metrics.ascender || 800}
        descender={project.metrics.descender || -200}
        onConfirm={svgIOHook.handleConfirmImportSvg}
      />

      {/* Font-Wide FontAudit Pre-Flight Inspector Modal */}
      <FontAuditModal
        isOpen={fontAuditModalOpen}
        onClose={() => setFontAuditModalOpen(false)}
        onNavigateToGlyph={onReplaceGlyph}
      />
    </div>
  );
};
