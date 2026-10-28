import React from 'react';
import { EditorTool, ResizeHandle } from '../types';
import { Glyph } from '../../../types/font';
import { GlyphContour, Point } from '../../../utils/contourUtils';
import { GlyphAuditReport, AuditIssue } from '../../../utils/fontAudit';
import { EditorGuidesOverlay } from './EditorGuidesOverlay';
import { EditorBitmapOverlay } from './EditorBitmapOverlay';
import { EditorVectorSvg } from './EditorVectorSvg';
import { EditorCanvasPills } from './EditorCanvasPills';

export interface EditorCanvasProps {
  zoom: number;

  // Pills / Alerts
  exportToast: string | null;
  scaffoldingToast: string | null;
  glyphChar: string;
  advanceWidth: number;
  isDraggingGlyph: boolean;
  isDraggingBitmap: boolean;
  resizingHandle: ResizeHandle | null;
  isDraggingPoint: boolean;
  selectedPoint: { contourIndex: number; pointIndex: number } | null;
  isRotating: boolean;
  activeTool: EditorTool;
  liveRotationAngle: number;
  activeSelectedPointData: { point: Point; contourIndex: number; pointIndex: number } | null;
  handleSmoothContours: (subdivide: boolean, localOnly: boolean) => void;
  handleDeleteSelectedPoint: () => void;
  setSelectedPoint: (pt: { contourIndex: number; pointIndex: number } | null) => void;
  bitmapScale: number;
  currentBitmapWidth: number;
  bitmapXOffset: number;
  bitmapYOffset: number;
  xOffset: number;
  yOffset: number;

  // Guides
  ascenderY: number;
  ascender: number;
  capHeightY: number;
  capHeight: number;
  xHeightY: number;
  xHeight: number;
  baselineY: number;
  descenderY: number;
  descender: number;
  lsbX: number;
  lsb: number;
  advanceX: number;
  rsb: number;
  draggingGuide: 'lsb' | 'advance' | null;
  handleGuideMouseDown: (guide: 'lsb' | 'advance', e: React.MouseEvent) => void;

  // Bitmap Overlay
  showOriginalImage: boolean;
  originalImage?: string;
  bitmapContainerRef: React.RefObject<HTMLDivElement>;
  setIsDraggingBitmap: (val: boolean) => void;
  setBitmapDragStart: (pos: { mouseX: number; mouseY: number; startX: number; startY: number }) => void;
  fontScale: number;
  handleResizeHandleMouseDown: (handle: ResizeHandle, e: React.MouseEvent) => void;

  // SVG Vector
  svgRef: React.RefObject<SVGSVGElement>;
  handleCanvasMouseMove: (e: React.MouseEvent) => void;
  handleCanvasMouseDown: (e: React.MouseEvent) => void;
  scale: number;
  currentGlyph: Glyph;
  contours: GlyphContour[];
  glyphBounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
  } | null;
  mouseFontPos: Point | null;
  hoverEdge: { contourIndex: number; segmentIndex: number; projectedPoint: Point } | null;
  showNodes: boolean;
  allPoints: Array<{ x: number; y: number; contourIndex: number; pointIndex: number }>;
  handlePointMouseDown: (contourIndex: number, pointIndex: number, pt: Point, e: React.MouseEvent) => void;
  showAuditOverlay?: boolean;
  auditReport?: GlyphAuditReport;
  onSelectPoint?: (pt: { contourIndex: number; pointIndex: number } | null) => void;
  onFixAuditIssue?: (issue: AuditIssue) => void;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  zoom,

  // Pills
  exportToast,
  scaffoldingToast,
  glyphChar,
  advanceWidth,
  isDraggingGlyph,
  isDraggingBitmap,
  resizingHandle,
  isDraggingPoint,
  selectedPoint,
  isRotating,
  activeTool,
  liveRotationAngle,
  activeSelectedPointData,
  handleSmoothContours,
  handleDeleteSelectedPoint,
  setSelectedPoint,
  bitmapScale,
  currentBitmapWidth,
  bitmapXOffset,
  bitmapYOffset,
  xOffset,
  yOffset,

  // Guides
  ascenderY,
  ascender,
  capHeightY,
  capHeight,
  xHeightY,
  xHeight,
  baselineY,
  descenderY,
  descender,
  lsbX,
  lsb,
  advanceX,
  rsb,
  draggingGuide,
  handleGuideMouseDown,

  // Bitmap Overlay
  showOriginalImage,
  originalImage,
  bitmapContainerRef,
  setIsDraggingBitmap,
  setBitmapDragStart,
  fontScale,
  handleResizeHandleMouseDown,

  // SVG Vector
  svgRef,
  handleCanvasMouseMove,
  handleCanvasMouseDown,
  scale,
  currentGlyph,
  contours,
  glyphBounds,
  mouseFontPos,
  hoverEdge,
  showNodes,
  allPoints,
  handlePointMouseDown,
  showAuditOverlay,
  auditReport,
  onSelectPoint,
  onFixAuditIssue
}) => {
  return (
    <div 
      className="editor-canvas-bg"
      style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        overflow: 'auto',
      }}
    >
      {/* Floating Status Notification Pills & Toasts */}
      <EditorCanvasPills
        exportToast={exportToast}
        scaffoldingToast={scaffoldingToast}
        glyphChar={glyphChar}
        advanceWidth={advanceWidth}
        isDraggingGlyph={isDraggingGlyph}
        isDraggingBitmap={isDraggingBitmap}
        resizingHandle={resizingHandle}
        isDraggingPoint={isDraggingPoint}
        selectedPoint={selectedPoint}
        isRotating={isRotating}
        activeTool={activeTool}
        liveRotationAngle={liveRotationAngle}
        activeSelectedPointData={activeSelectedPointData}
        handleSmoothContours={handleSmoothContours}
        handleDeleteSelectedPoint={handleDeleteSelectedPoint}
        setSelectedPoint={setSelectedPoint}
        bitmapScale={bitmapScale}
        currentBitmapWidth={currentBitmapWidth}
        bitmapXOffset={bitmapXOffset}
        bitmapYOffset={bitmapYOffset}
        xOffset={xOffset}
        yOffset={yOffset}
      />

      {/* SVG Coordinate Space: 640 x 760 Font Design Space */}
      <div style={{
        position: 'relative',
        width: '640px',
        height: '760px',
        border: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
        transformOrigin: 'center center',
        transition: 'transform 0.15s ease-out'
      }}>
        {/* Metric Guide Lines & Draggable Bearing Indicators */}
        <EditorGuidesOverlay
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
          lsb={lsb}
          advanceX={advanceX}
          advanceWidth={advanceWidth}
          rsb={rsb}
          draggingGuide={draggingGuide}
          handleGuideMouseDown={handleGuideMouseDown}
        />

        {/* Source Bitmap Overlay with 8 Resize Handles */}
        <EditorBitmapOverlay
          showOriginalImage={showOriginalImage}
          originalImage={originalImage}
          bitmapContainerRef={bitmapContainerRef}
          activeTool={activeTool}
          isDraggingBitmap={isDraggingBitmap}
          setIsDraggingBitmap={setIsDraggingBitmap}
          setBitmapDragStart={setBitmapDragStart}
          capHeightY={capHeightY}
          bitmapYOffset={bitmapYOffset}
          lsb={lsb}
          fontScale={fontScale}
          bitmapXOffset={bitmapXOffset}
          currentBitmapWidth={currentBitmapWidth}
          bitmapScale={bitmapScale}
          resizingHandle={resizingHandle}
          handleResizeHandleMouseDown={handleResizeHandleMouseDown}
        />

        {/* Primary Interactive SVG Canvas */}
        <EditorVectorSvg
          svgRef={svgRef}
          activeTool={activeTool}
          isDraggingGlyph={isDraggingGlyph}
          isDraggingBitmap={isDraggingBitmap}
          isRotating={isRotating}
          isDraggingPoint={isDraggingPoint}
          handleCanvasMouseMove={handleCanvasMouseMove}
          handleCanvasMouseDown={handleCanvasMouseDown}
          xOffset={xOffset}
          yOffset={yOffset}
          baselineY={baselineY}
          scale={scale}
          fontScale={fontScale}
          currentGlyph={currentGlyph}
          glyphChar={glyphChar}
          contours={contours}
          selectedPoint={selectedPoint}
          glyphBounds={glyphBounds}
          activeSelectedPointData={activeSelectedPointData}
          mouseFontPos={mouseFontPos}
          hoverEdge={hoverEdge}
          showNodes={showNodes}
          allPoints={allPoints}
          handlePointMouseDown={handlePointMouseDown}
          showAuditOverlay={showAuditOverlay}
          auditReport={auditReport}
          onSelectPoint={onSelectPoint}
          onFixAuditIssue={onFixAuditIssue}
        />
      </div>
    </div>
  );
};
