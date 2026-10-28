import React from 'react';

interface EditorGuidesOverlayProps {
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
  advanceWidth: number;
  rsb: number;
  draggingGuide: 'lsb' | 'advance' | null;
  handleGuideMouseDown: (guide: 'lsb' | 'advance', e: React.MouseEvent) => void;
}

export const EditorGuidesOverlay: React.FC<EditorGuidesOverlayProps> = ({
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
  advanceWidth,
  rsb,
  draggingGuide,
  handleGuideMouseDown
}) => {
  return (
    <>
      {/* Guide lines and Labels */}
      {/* Ascender line */}
      <div style={{ position: 'absolute', top: `${ascenderY}px`, left: 0, right: 0, borderTop: '1px dashed #ef4444', pointerEvents: 'none' }}>
        <span style={{ position: 'absolute', right: '8px', top: '-16px', fontSize: '10px', color: '#ef4444' }}>
          Ascender: {ascender}
        </span>
      </div>

      {/* Cap Height line */}
      <div style={{ position: 'absolute', top: `${capHeightY}px`, left: 0, right: 0, borderTop: '1px dashed #6366f1', pointerEvents: 'none' }}>
        <span style={{ position: 'absolute', right: '8px', top: '-16px', fontSize: '10px', color: '#818cf8' }}>
          Cap Height: {capHeight}
        </span>
      </div>

      {/* X-Height line */}
      <div style={{ position: 'absolute', top: `${xHeightY}px`, left: 0, right: 0, borderTop: '1px dotted #3b82f6', pointerEvents: 'none' }}>
        <span style={{ position: 'absolute', right: '8px', top: '-16px', fontSize: '10px', color: '#60a5fa' }}>
          x-Height: {xHeight}
        </span>
      </div>

      {/* Baseline line */}
      <div style={{ position: 'absolute', top: `${baselineY}px`, left: 0, right: 0, borderTop: '2px solid #10b981', pointerEvents: 'none' }}>
        <span style={{ position: 'absolute', right: '8px', top: '-16px', fontSize: '10px', color: '#34d399', fontWeight: 600 }}>
          Baseline: 0
        </span>
      </div>

      {/* Descender line */}
      <div style={{ position: 'absolute', top: `${descenderY}px`, left: 0, right: 0, borderTop: '1px dashed #f59e0b', pointerEvents: 'none' }}>
        <span style={{ position: 'absolute', right: '8px', top: '-16px', fontSize: '10px', color: '#fbbf24' }}>
          Descender: {descender}
        </span>
      </div>

      {/* Left Origin Line (x = 0) */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '70px', borderLeft: '1px dashed rgba(255,255,255,0.15)', pointerEvents: 'none' }}>
        <span style={{ position: 'absolute', bottom: '8px', left: '4px', fontSize: '9px', color: 'var(--text-faint)' }}>
          Origin (0)
        </span>
      </div>

      {/* Left Side Bearing (LSB) Draggable Guide */}
      <div
        onMouseDown={(e) => handleGuideMouseDown('lsb', e)}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${lsbX - 6}px`,
          width: '13px',
          cursor: 'ew-resize',
          zIndex: 6,
          display: 'flex',
          justifyContent: 'center'
        }}
        title="Drag to adjust Left Side Bearing (LSB)"
      >
        <div style={{
          width: '1px',
          height: '100%',
          backgroundColor: draggingGuide === 'lsb' ? 'var(--accent)' : 'rgba(255,255,255,0.25)',
          boxShadow: draggingGuide === 'lsb' ? '0 0 8px var(--accent)' : 'none'
        }} />
        <span style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          fontSize: '10px',
          color: draggingGuide === 'lsb' ? 'var(--accent)' : 'var(--text-faint)',
          fontWeight: draggingGuide === 'lsb' ? 700 : 400,
          whiteSpace: 'nowrap',
          userSelect: 'none',
          pointerEvents: 'none'
        }}>
          LSB: {lsb}
        </span>
      </div>

      {/* Advance Width / RSB Draggable Guide */}
      <div
        onMouseDown={(e) => handleGuideMouseDown('advance', e)}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${advanceX - 6}px`,
          width: '13px',
          cursor: 'ew-resize',
          zIndex: 6,
          display: 'flex',
          justifyContent: 'center'
        }}
        title="Drag to adjust Advance Width"
      >
        <div style={{
          width: '1px',
          height: '100%',
          backgroundColor: draggingGuide === 'advance' ? 'var(--accent)' : 'rgba(255,255,255,0.25)',
          boxShadow: draggingGuide === 'advance' ? '0 0 8px var(--accent)' : 'none'
        }} />
        <span style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          fontSize: '10px',
          color: draggingGuide === 'advance' ? 'var(--accent)' : 'var(--text-faint)',
          fontWeight: draggingGuide === 'advance' ? 700 : 400,
          whiteSpace: 'nowrap',
          userSelect: 'none',
          pointerEvents: 'none'
        }}>
          Advance: {advanceWidth} (RSB: {rsb})
        </span>
      </div>
    </>
  );
};
