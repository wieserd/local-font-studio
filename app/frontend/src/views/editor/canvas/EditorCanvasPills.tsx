import React from 'react';
import { Check, Info, RotateCw, Sparkles, Trash2 } from 'lucide-react';
import { EditorTool, ResizeHandle } from '../types';
import { Point } from '../../../utils/contourUtils';

interface EditorCanvasPillsProps {
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
}

export const EditorCanvasPills: React.FC<EditorCanvasPillsProps> = ({
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
  yOffset
}) => {
  return (
    <>
      {/* Toast Notification for Single SVG Export */}
      {exportToast && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          backgroundColor: '#1e293b',
          border: '1px solid var(--accent)',
          borderRadius: '8px',
          padding: '8px 14px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 99
        }}>
          <Check size={14} color="#10b981" />
          <span>{exportToast}</span>
        </div>
      )}

      {scaffoldingToast && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          backgroundColor: '#1e293b',
          border: '1px solid #38bdf8',
          borderRadius: '8px',
          padding: '8px 14px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 99
        }}>
          <Info size={14} color="#38bdf8" />
          <span>{scaffoldingToast}</span>
        </div>
      )}

      {/* Info pill for Word Space Character */}
      {glyphChar === ' ' && (
        <div style={{
          position: 'absolute',
          top: '16px',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid var(--accent)',
          borderRadius: '8px',
          padding: '8px 16px',
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 30,
          boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
        }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--accent)' }}>␣</span> Word Space Character (U+0020)
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
            Drag the right dashed Advance guideline or change Advance Width in the sidebar ({advanceWidth} units).
          </span>
        </div>
      )}

      {/* Active drag / resize / point connection / rotation floating notification pill */}
      {(isDraggingGlyph || isDraggingBitmap || resizingHandle || isDraggingPoint || selectedPoint || isRotating || activeTool === 'rotate') && (
        <div style={{
          position: 'absolute',
          top: '16px',
          backgroundColor: isRotating || activeTool === 'rotate'
            ? 'rgba(99, 102, 241, 0.95)'
            : (isDraggingBitmap || resizingHandle)
            ? 'rgba(2, 132, 199, 0.95)'
            : selectedPoint
            ? 'rgba(245, 158, 11, 0.95)'
            : 'rgba(99, 102, 241, 0.95)',
          color: '#fff',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 600,
          boxShadow: '0 6px 16px rgba(0,0,0,0.5)',
          pointerEvents: selectedPoint ? 'auto' : 'none',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {isRotating ? (
            <>
              <RotateCw size={13} style={{ animation: 'spin 2s linear infinite' }} />
              <span>Rotating Glyph '{glyphChar}':</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#facc15' }}>
                {liveRotationAngle > 0 ? `+${liveRotationAngle}` : liveRotationAngle}°
              </span>
              <span style={{ opacity: 0.8, fontSize: '10px' }}>(Hold Shift to snap 15°)</span>
            </>
          ) : activeTool === 'rotate' ? (
            <>
              <RotateCw size={13} />
              <span>Rotate Tool Active: Click and drag anywhere on canvas to rotate glyph</span>
            </>
          ) : selectedPoint && activeSelectedPointData ? (
            <>
              <span>
                {isDraggingPoint
                  ? `Moving Point #${selectedPoint.pointIndex + 1}:`
                  : activeTool === 'pen'
                  ? `Connected to Point #${selectedPoint.pointIndex + 1} (Drag or use Arrow keys to move):`
                  : `Point #${selectedPoint.pointIndex + 1} Selected (Drag with mouse or Arrow keys to move):`}
              </span>
              <span style={{ fontFamily: 'monospace' }}>
                ({activeSelectedPointData.point.x}, {activeSelectedPointData.point.y})
              </span>
              <button
                onClick={() => handleSmoothContours(false, true)}
                style={{
                  backgroundColor: '#7c3aed',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginLeft: '2px'
                }}
                title="Smooth curve around this point"
              >
                <Sparkles size={11} />
                <span>Smooth Curve</span>
              </button>
              <button
                onClick={handleDeleteSelectedPoint}
                style={{
                  backgroundColor: '#ef4444',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginLeft: '2px'
                }}
                title="Delete Point (Backspace / Delete key)"
              >
                <Trash2 size={11} />
                <span>Delete</span>
              </button>
              <button
                onClick={() => setSelectedPoint(null)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
                title="Deselect (Escape key)"
              >
                Deselect
              </button>
            </>
          ) : resizingHandle ? (
            <>
              <span>Resizing Bitmap Overlay:</span>
              <span style={{ fontFamily: 'monospace' }}>{bitmapScale}%</span>
              <span style={{ opacity: 0.8, fontSize: '10px', marginLeft: '4px' }}>
                (Width: {currentBitmapWidth}px)
              </span>
            </>
          ) : isDraggingBitmap ? (
            <>
              <span>Moving Bitmap Overlay:</span>
              <span style={{ fontFamily: 'monospace' }}>
                X: {bitmapXOffset >= 0 ? `+${bitmapXOffset}` : bitmapXOffset} px
              </span>
              <span>•</span>
              <span style={{ fontFamily: 'monospace' }}>
                Y: {bitmapYOffset >= 0 ? `+${bitmapYOffset}` : bitmapYOffset} px
              </span>
            </>
          ) : (
            <>
              <span>Moving Vector Glyph '{glyphChar}':</span>
              <span style={{ fontFamily: 'monospace' }}>
                X: {xOffset >= 0 ? `+${xOffset}` : xOffset} px
              </span>
              <span>•</span>
              <span style={{ fontFamily: 'monospace' }}>
                Y: {yOffset >= 0 ? `+${yOffset}` : yOffset} px
              </span>
            </>
          )}
        </div>
      )}
    </>
  );
};
