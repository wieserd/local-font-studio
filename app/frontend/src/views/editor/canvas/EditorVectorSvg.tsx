import React from 'react';
import { EditorTool } from '../types';
import { Glyph } from '../../../types/font';
import { GlyphContour, Point } from '../../../utils/contourUtils';
import { GlyphAuditReport, AuditIssue } from '../../../utils/fontAudit';

interface EditorVectorSvgProps {
  svgRef: React.RefObject<SVGSVGElement>;
  activeTool: EditorTool;
  isDraggingGlyph: boolean;
  isDraggingBitmap: boolean;
  isRotating: boolean;
  isDraggingPoint: boolean;
  handleCanvasMouseMove: (e: React.MouseEvent) => void;
  handleCanvasMouseDown: (e: React.MouseEvent) => void;
  xOffset: number;
  yOffset: number;
  baselineY: number;
  scale: number;
  fontScale: number;
  currentGlyph: Glyph;
  glyphChar: string;
  contours: GlyphContour[];
  selectedPoint: { contourIndex: number; pointIndex: number } | null;
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
  activeSelectedPointData: { point: Point; contourIndex: number; pointIndex: number } | null;
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

export const EditorVectorSvg: React.FC<EditorVectorSvgProps> = ({
  svgRef,
  activeTool,
  isDraggingGlyph,
  isDraggingBitmap,
  isRotating,
  isDraggingPoint,
  handleCanvasMouseMove,
  handleCanvasMouseDown,
  xOffset,
  yOffset,
  baselineY,
  scale,
  fontScale,
  currentGlyph,
  glyphChar,
  contours,
  selectedPoint,
  glyphBounds,
  activeSelectedPointData,
  mouseFontPos,
  hoverEdge,
  showNodes,
  allPoints,
  handlePointMouseDown,
  showAuditOverlay = true,
  auditReport,
  onSelectPoint,
  onFixAuditIssue
}) => {
  const effectiveScale = (scale / 100) * fontScale;

  return (
    <svg
      ref={svgRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        cursor: activeTool === 'select'
          ? (isDraggingGlyph ? 'grabbing' : 'default')
          : activeTool === 'move-bitmap'
          ? (isDraggingBitmap ? 'grabbing' : 'grab')
          : activeTool === 'rotate'
          ? (isRotating ? 'grabbing' : 'crosshair')
          : activeTool === 'pen'
          ? 'crosshair'
          : activeTool === 'node'
          ? (isDraggingPoint ? 'grabbing' : 'crosshair')
          : activeTool === 'knife'
          ? 'cell'
          : 'default'
      }}
      viewBox="0 0 640 760"
      onMouseMove={handleCanvasMouseMove}
      onMouseDown={handleCanvasMouseDown}
    >
      <defs>
        <filter id="editor-glow">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#6366f1" floodOpacity="0.4"/>
        </filter>
      </defs>

      {/* Vector Contour transformed to viewport */}
      <g
        transform={`translate(${70 + xOffset}, ${baselineY - yOffset}) scale(${effectiveScale}, ${-effectiveScale})`}
        style={{
          cursor: activeTool === 'select' ? (isDraggingGlyph ? 'grabbing' : 'default') : 'default'
        }}
      >
        {/* 1. Base Filled SVG Outline */}
        {currentGlyph.svgPath ? (
          <path
            d={currentGlyph.svgPath}
            fill={isDraggingGlyph ? "rgba(99, 102, 241, 0.45)" : "rgba(99, 102, 241, 0.28)"}
            stroke={isDraggingGlyph ? "#a5b4fc" : "#818cf8"}
            strokeWidth={2 / effectiveScale}
            filter="url(#editor-glow)"
          />
        ) : (
          <text x="150" y="0" fill="rgba(255,255,255,0.15)" fontSize="200" fontFamily="serif">
            {glyphChar}
          </text>
        )}

        {/* 2. Distinct Segment Outlines for every contour */}
        {contours.map((contour, ci) => {
          if (contour.length < 2) return null;
          return contour.map((pt, pi) => {
            const nextPt = contour[(pi + 1) % contour.length];
            const isEdgeAdjacentToSelected = selectedPoint && selectedPoint.contourIndex === ci && (selectedPoint.pointIndex === pi || selectedPoint.pointIndex === (pi + 1) % contour.length);
            return (
              <line
                key={`edge-${ci}-${pi}`}
                x1={pt.x}
                y1={pt.y}
                x2={nextPt.x}
                y2={nextPt.y}
                stroke={isEdgeAdjacentToSelected ? '#f59e0b' : '#6366f1'}
                strokeWidth={(isEdgeAdjacentToSelected ? 2.5 : 1.5) / effectiveScale}
                opacity={0.8}
                pointerEvents="none"
              />
            );
          });
        })}

        {/* 3. Selection Bounding Box & Corner Handles when activeTool === 'select' and NO point is selected */}
        {activeTool === 'select' && glyphBounds && !selectedPoint && (
          <g pointerEvents="none">
            <rect
              x={glyphBounds.minX - 6}
              y={glyphBounds.minY - 6}
              width={glyphBounds.width + 12}
              height={glyphBounds.height + 12}
              fill="transparent"
              stroke={isDraggingGlyph ? "#818cf8" : "rgba(129, 140, 248, 0.5)"}
              strokeDasharray="5 3"
              strokeWidth={1.5 / effectiveScale}
            />
            {[
              { x: glyphBounds.minX - 6, y: glyphBounds.minY - 6 },
              { x: glyphBounds.maxX + 6, y: glyphBounds.minY - 6 },
              { x: glyphBounds.minX - 6, y: glyphBounds.maxY + 6 },
              { x: glyphBounds.maxX + 6, y: glyphBounds.maxY + 6 },
            ].map((pos, i) => (
              <rect
                key={i}
                x={pos.x - 3 / effectiveScale}
                y={pos.y - 3 / effectiveScale}
                width={6 / effectiveScale}
                height={6 / effectiveScale}
                fill="#818cf8"
                stroke="#0f172a"
                strokeWidth={1 / effectiveScale}
              />
            ))}
          </g>
        )}

        {/* 4. LIVE RUBBER-BAND LINE: from selected point to mouse cursor in Pen tool */}
        {activeTool === 'pen' && selectedPoint && activeSelectedPointData && mouseFontPos && (
          <g pointerEvents="none">
            <line
              x1={activeSelectedPointData.point.x}
              y1={activeSelectedPointData.point.y}
              x2={mouseFontPos.x}
              y2={mouseFontPos.y}
              stroke="#38bdf8"
              strokeWidth={2 / effectiveScale}
              strokeDasharray={`${6 / effectiveScale} ${4 / effectiveScale}`}
            />
            <circle
              cx={mouseFontPos.x}
              cy={mouseFontPos.y}
              r={6 / effectiveScale}
              fill="rgba(56, 189, 248, 0.4)"
              stroke="#38bdf8"
              strokeWidth={1.5 / effectiveScale}
            />
            <circle
              cx={mouseFontPos.x}
              cy={mouseFontPos.y}
              r={2.5 / effectiveScale}
              fill="#38bdf8"
            />
          </g>
        )}

        {/* 5. Edge hover preview when explicitly splitting an edge */}
        {hoverEdge && (activeTool === 'node' || (activeTool === 'pen' && !selectedPoint)) && (
          <g pointerEvents="none">
            <circle
              cx={hoverEdge.projectedPoint.x}
              cy={hoverEdge.projectedPoint.y}
              r={7 / effectiveScale}
              fill="rgba(56, 189, 248, 0.4)"
              stroke="#38bdf8"
              strokeWidth={2 / effectiveScale}
            />
            <circle
              cx={hoverEdge.projectedPoint.x}
              cy={hoverEdge.projectedPoint.y}
              r={3.5 / effectiveScale}
              fill="#38bdf8"
            />
          </g>
        )}

        {/* 6. Interactive rotation pivot and orbit indicator when Rotate tool is active */}
        {activeTool === 'rotate' && glyphBounds && (
          <g pointerEvents="none">
            {/* Bounding orbit ring */}
            <circle
              cx={glyphBounds.centerX}
              cy={glyphBounds.centerY}
              r={Math.max(glyphBounds.width, glyphBounds.height) * 0.65}
              fill="none"
              stroke="#818cf8"
              strokeWidth={1.5 / effectiveScale}
              strokeDasharray={`${6 / effectiveScale} ${4 / effectiveScale}`}
              opacity={0.65}
            />
            {/* Pivot center dot */}
            <circle
              cx={glyphBounds.centerX}
              cy={glyphBounds.centerY}
              r={6 / effectiveScale}
              fill="#6366f1"
              stroke="#ffffff"
              strokeWidth={1.5 / effectiveScale}
            />
            <circle
              cx={glyphBounds.centerX}
              cy={glyphBounds.centerY}
              r={2 / effectiveScale}
              fill="#ffffff"
            />
          </g>
        )}

        {/* 7. Bézier / Vertex Nodes when enabled */}
        {(showNodes || activeTool === 'node' || activeTool === 'pen' || activeTool === 'select') && currentGlyph.svgPath && (
          <g>
            {allPoints.map((pt) => {
              const isSelected = selectedPoint?.contourIndex === pt.contourIndex && selectedPoint?.pointIndex === pt.pointIndex;
              const pointRadius = isSelected
                ? 6 / effectiveScale
                : 3.5 / effectiveScale;

              return (
                <g key={`${pt.contourIndex}-${pt.pointIndex}`}>
                  {/* Outer pulse ring for selected point */}
                  {isSelected && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={12 / effectiveScale}
                      fill="rgba(245, 158, 11, 0.35)"
                      stroke="#f59e0b"
                      strokeWidth={2 / effectiveScale}
                      pointerEvents="none"
                    />
                  )}

                  {/* Node vertex circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={pointRadius}
                    fill={isSelected ? '#f59e0b' : '#38bdf8'}
                    stroke={isSelected ? '#ffffff' : '#0f172a'}
                    strokeWidth={(isSelected ? 2 : 1) / effectiveScale}
                    style={{
                      cursor: isSelected ? 'grabbing' : 'grab',
                      transition: isDraggingPoint ? 'none' : 'r 0.1s ease'
                    }}
                    pointerEvents="none"
                  />

                  {/* Invisible wide hit-area for effortless clicking and dragging */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={14 / effectiveScale}
                    fill="transparent"
                    style={{
                      cursor: isSelected ? 'grabbing' : 'grab'
                    }}
                    onMouseDown={(e) => handlePointMouseDown(pt.contourIndex, pt.pointIndex, pt, e)}
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* 8. FontAudit Geometric Issue Markers & Direction Indicators */}
        {showAuditOverlay && auditReport && auditReport.issues.length > 0 && (
          <g className="font-audit-markers">
            {auditReport.issues.map((issue) => {
              const isError = issue.severity === 'error';
              const isWarning = issue.severity === 'warning';
              const radius = 7 / effectiveScale;

              // Contour-wide Winding Direction Issue: Show flow arrows and interactive "Reverse Winding" pill
              if (issue.type === 'wrong-direction') {
                const targetContour = contours[issue.contourIndex];
                return (
                  <g key={issue.id} className="audit-winding-indicator">
                    {/* Direction flow arrows along the contour */}
                    {targetContour && targetContour.map((pt, pIdx, cArr) => {
                      if (cArr.length > 6 && pIdx % Math.max(2, Math.floor(cArr.length / 8)) !== 0) return null;
                      const nextPt = cArr[(pIdx + 1) % cArr.length];
                      const midX = (pt.x + nextPt.x) / 2;
                      const midY = (pt.y + nextPt.y) / 2;
                      const angle = Math.atan2(nextPt.y - pt.y, nextPt.x - pt.x) * (180 / Math.PI);
                      return (
                        <g
                          key={`flow-${pIdx}`}
                          transform={`translate(${midX}, ${midY}) rotate(${angle})`}
                          pointerEvents="none"
                        >
                          <polygon
                            points={`-${4 / effectiveScale},-${3 / effectiveScale} ${3 / effectiveScale},0 -${4 / effectiveScale},${3 / effectiveScale}`}
                            fill="#ef4444"
                            stroke="#ffffff"
                            strokeWidth={0.8 / effectiveScale}
                          />
                        </g>
                      );
                    })}

                    {/* Interactive Click-to-Fix Reverse Pill at contour center */}
                    <g
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onFixAuditIssue?.(issue);
                      }}
                    >
                      <rect
                        x={issue.x - 68 / effectiveScale}
                        y={issue.y - 12 / effectiveScale}
                        width={136 / effectiveScale}
                        height={24 / effectiveScale}
                        rx={6 / effectiveScale}
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth={1.5 / effectiveScale}
                      />
                      <text
                        x={issue.x}
                        y={issue.y + 4 / effectiveScale}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={10.5 / effectiveScale}
                        fontWeight="700"
                        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
                        pointerEvents="none"
                      >
                        ⟲ Reverse Winding
                      </text>
                      <title>{`[FontAudit ERROR] ${issue.title}: ${issue.message}\n💡 ${issue.recommendation}`}</title>
                    </g>
                  </g>
                );
              }

              return (
                <g
                  key={issue.id}
                  style={{ cursor: issue.pointIndex !== undefined ? 'pointer' : 'default' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (issue.pointIndex !== undefined && onSelectPoint) {
                      onSelectPoint({
                        contourIndex: issue.contourIndex,
                        pointIndex: issue.pointIndex
                      });
                    }
                  }}
                >
                  {/* Outer pulse indicator for errors */}
                  {isError && (
                    <circle
                      cx={issue.x}
                      cy={issue.y}
                      r={radius * 1.8}
                      fill="rgba(239, 68, 68, 0.25)"
                      stroke="#ef4444"
                      strokeWidth={1 / effectiveScale}
                    />
                  )}

                  {/* Marker Shape: Diamond for error, Triangle for warning, Circle for info */}
                  {isError ? (
                    <polygon
                      points={`
                        ${issue.x},${issue.y - radius * 1.3}
                        ${issue.x + radius * 1.3},${issue.y}
                        ${issue.x},${issue.y + radius * 1.3}
                        ${issue.x - radius * 1.3},${issue.y}
                      `}
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth={1.5 / effectiveScale}
                    />
                  ) : isWarning ? (
                    <polygon
                      points={`
                        ${issue.x},${issue.y - radius * 1.4}
                        ${issue.x + radius * 1.3},${issue.y + radius * 0.9}
                        ${issue.x - radius * 1.3},${issue.y + radius * 0.9}
                      `}
                      fill="#f59e0b"
                      stroke="#ffffff"
                      strokeWidth={1.5 / effectiveScale}
                    />
                  ) : (
                    <circle
                      cx={issue.x}
                      cy={issue.y}
                      r={radius * 0.8}
                      fill="#38bdf8"
                      stroke="#ffffff"
                      strokeWidth={1 / effectiveScale}
                    />
                  )}

                  {/* Tooltip */}
                  <title>{`[FontAudit ${issue.severity.toUpperCase()}] ${issue.title}: ${issue.message}\n💡 What to do: ${issue.recommendation}`}</title>
                </g>
              );
            })}
          </g>
        )}
      </g>
    </svg>
  );
};
