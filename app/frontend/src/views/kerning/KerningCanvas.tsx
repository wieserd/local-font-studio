import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeftRight, RotateCcw, Eye, EyeOff, Sliders, Check } from 'lucide-react';
import { Glyph, FontMetrics } from '../../types/font';

interface KerningCanvasProps {
  leftChar: string;
  rightChar: string;
  kerningValue: number;
  onUpdateKerning: (val: number) => void;
  onSwapPair: () => void;
  glyphs: Record<string, Glyph>;
  metrics: FontMetrics;
  showGuidelines?: boolean;
  setShowGuidelines?: (v: boolean) => void;
  zoom?: number;
  onStepPair?: (direction: -1 | 1) => void;
}

export const KerningCanvas: React.FC<KerningCanvasProps> = ({
  leftChar,
  rightChar,
  kerningValue,
  onUpdateKerning,
  onSwapPair,
  glyphs,
  metrics,
  showGuidelines = true,
  setShowGuidelines,
  zoom = 100,
  onStepPair,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; initialKern: number }>({ startX: 0, initialKern: 0 });
  const [liveKern, setLiveKern] = useState(kerningValue);

  // Sync internal live kerning value when prop changes
  useEffect(() => {
    if (!isDragging) {
      setLiveKern(kerningValue);
    }
  }, [kerningValue, isDragging]);

  const leftGlyph = glyphs[leftChar] || {
    char: leftChar,
    isAssigned: false,
    advanceWidth: metrics.defaultAdvance || 600,
    lsb: metrics.defaultLsb || 40,
    rsb: metrics.defaultRsb || 40,
    scale: 100,
    svgPath: ''
  };

  const rightGlyph = glyphs[rightChar] || {
    char: rightChar,
    isAssigned: false,
    advanceWidth: metrics.defaultAdvance || 600,
    lsb: metrics.defaultLsb || 40,
    rsb: metrics.defaultRsb || 40,
    scale: 100,
    svgPath: ''
  };

  const upm = metrics.upm || 1000;
  const ascender = metrics.ascender || 800;
  const descender = metrics.descender || -200;
  const capHeight = metrics.capHeight || 700;

  // Visual layout constants with zoom scaling
  const zoomFactor = Math.max(0.5, Math.min(2.5, zoom / 100));
  const canvasHeight = Math.round(260 * zoomFactor);
  const fontDisplaySize = 150 * zoomFactor;
  const scaleFactor = fontDisplaySize / upm;

  const baselineY = Math.round(180 * zoomFactor);
  const ascenderY = baselineY - (ascender * scaleFactor);
  const capHeightY = baselineY - (capHeight * scaleFactor);
  const descenderY = baselineY - (descender * scaleFactor);

  const leftAdvance = leftGlyph.advanceWidth || metrics.defaultAdvance || 600;
  const rightAdvance = rightGlyph.advanceWidth || metrics.defaultAdvance || 600;

  // Center the pair nicely in the canvas
  const totalPairWidthPx = (leftAdvance + liveKern + rightAdvance) * scaleFactor;
  const startX = Math.max(60, (600 - totalPairWidthPx) / 2);

  const leftGlyphX = startX;
  const leftAdvanceLineX = leftGlyphX + (leftAdvance * scaleFactor);
  const rightGlyphX = leftAdvanceLineX + (liveKern * scaleFactor);
  const rightAdvanceLineX = rightGlyphX + (rightAdvance * scaleFactor);

  // Drag interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      initialKern: liveKern
    };
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaPx = e.clientX - dragStartRef.current.startX;
      const deltaUnits = Math.round(deltaPx / scaleFactor);
      const nextVal = Math.max(-400, Math.min(250, dragStartRef.current.initialKern + deltaUnits));
      setLiveKern(nextVal);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onUpdateKerning(liveKern);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, liveKern, scaleFactor, onUpdateKerning]);

  const handleStep = (delta: number) => {
    const nextVal = liveKern + delta;
    setLiveKern(nextVal);
    onUpdateKerning(nextVal);
  };

  const handleResetZero = () => {
    setLiveKern(0);
    onUpdateKerning(0);
  };

  // Keyboard shortcuts: Arrow keys to nudge, 0 to reset, [/] to switch pair
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const step = e.shiftKey ? -10 : -1;
        handleStep(step);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        handleStep(step);
      } else if (e.key === '0') {
        e.preventDefault();
        handleResetZero();
      } else if (e.key === '[' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault();
        onStepPair?.(-1);
      } else if (e.key === ']' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        onStepPair?.(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [liveKern, onUpdateKerning, onStepPair]);

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Top Status & Pair Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', fontWeight: 600 }}>
            Visual Pair Kerning
          </span>
          <span className="badge badge-indigo" style={{ fontSize: '13px', fontWeight: 700, padding: '3px 8px' }}>
            {leftChar} + {rightChar}
          </span>
          <span style={{
            fontSize: '12px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: liveKern < 0 ? 'rgba(99, 102, 241, 0.15)' : (liveKern > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.08)'),
            color: liveKern < 0 ? '#818cf8' : (liveKern > 0 ? '#34d399' : 'var(--text-muted)')
          }}>
            {liveKern > 0 ? `+${liveKern}` : liveKern} units
          </span>
          <span className="badge badge-gray" style={{ fontSize: '10px' }} title="Scale Factor">
            {zoom}%
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-faint)' }} title="Keyboard shortcuts active">
            (←/→ nudge, 0 reset, [/] cycle)
          </span>
        </div>

        {/* Action Controls Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onSwapPair}
            className="btn-secondary"
            title="Swap pair order (AV ↔ VA)"
            style={{ fontSize: '11px', padding: '4px 10px', gap: '4px' }}
          >
            <ArrowLeftRight size={13} />
            <span>Swap ({rightChar}{leftChar})</span>
          </button>

          {setShowGuidelines && (
            <button
              onClick={() => setShowGuidelines(!showGuidelines)}
              className="btn-secondary"
              title="Toggle Metrics Guidelines"
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              {showGuidelines ? <Eye size={13} /> : <EyeOff size={13} />}
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Vector SVG Canvas */}
      <div
        ref={containerRef}
        style={{
          height: `${canvasHeight}px`,
          width: '100%',
          backgroundColor: 'var(--bg-app)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          position: 'relative',
          overflow: 'hidden',
          userSelect: 'none'
        }}
      >
        <svg
          width="100%"
          height={canvasHeight}
          style={{ width: '100%', height: `${canvasHeight}px`, overflow: 'visible' }}
        >
          {/* GUIDELINES */}
          {showGuidelines && (
            <g>
              {/* Ascender line */}
              <line x1="0" y1={ascenderY} x2="100%" y2={ascenderY} stroke="rgba(239, 68, 68, 0.35)" strokeDasharray="4,4" strokeWidth="1" />
              <text x="12" y={ascenderY - 4} fill="rgba(239, 68, 68, 0.6)" fontSize="9" fontFamily="monospace">Ascender ({ascender})</text>

              {/* Cap Height line */}
              <line x1="0" y1={capHeightY} x2="100%" y2={capHeightY} stroke="rgba(99, 102, 241, 0.35)" strokeDasharray="4,4" strokeWidth="1" />
              <text x="12" y={capHeightY - 4} fill="rgba(99, 102, 241, 0.6)" fontSize="9" fontFamily="monospace">Cap Height ({capHeight})</text>

              {/* Baseline */}
              <line x1="0" y1={baselineY} x2="100%" y2={baselineY} stroke="rgba(16, 185, 129, 0.6)" strokeWidth="1.5" />
              <text x="12" y={baselineY + 12} fill="rgba(16, 185, 129, 0.7)" fontSize="9" fontFamily="monospace">Baseline (0)</text>

              {/* Descender line */}
              <line x1="0" y1={descenderY} x2="100%" y2={descenderY} stroke="rgba(245, 158, 11, 0.35)" strokeDasharray="4,4" strokeWidth="1" />
              <text x="12" y={descenderY + 12} fill="rgba(245, 158, 11, 0.6)" fontSize="9" fontFamily="monospace">Descender ({descender})</text>
            </g>
          )}

          {/* LEFT GLYPH VECTOR */}
          {leftGlyph.isAssigned && leftGlyph.svgPath ? (
            <g transform={`translate(${leftGlyphX}, ${baselineY}) scale(${scaleFactor}, ${-scaleFactor})`}>
              <path d={leftGlyph.svgPath} fill="var(--text-main)" />
            </g>
          ) : (
            <g>
              {/* Fallback box */}
              <rect
                x={leftGlyphX}
                y={ascenderY}
                width={leftAdvance * scaleFactor}
                height={(ascender - descender) * scaleFactor}
                fill="rgba(255,255,255,0.02)"
                stroke="rgba(255,255,255,0.15)"
                strokeDasharray="4,4"
              />
              <text
                x={leftGlyphX + (leftAdvance * scaleFactor) / 2}
                y={baselineY - 15}
                textAnchor="middle"
                fill="rgba(255,255,255,0.4)"
                fontSize={fontDisplaySize * 0.7}
                fontFamily="sans-serif"
              >
                {leftChar}
              </text>
            </g>
          )}

          {/* Left Glyph Advance Boundary Line */}
          <line
            x1={leftAdvanceLineX}
            y1={ascenderY - 15}
            x2={leftAdvanceLineX}
            y2={descenderY + 15}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeDasharray="3,3"
            strokeWidth="1"
          />

          {/* RIGHT GLYPH VECTOR (Positioned after left advance + kerning value) */}
          {rightGlyph.isAssigned && rightGlyph.svgPath ? (
            <g transform={`translate(${rightGlyphX}, ${baselineY}) scale(${scaleFactor}, ${-scaleFactor})`}>
              <path d={rightGlyph.svgPath} fill="var(--text-main)" />
            </g>
          ) : (
            <g>
              {/* Fallback box */}
              <rect
                x={rightGlyphX}
                y={ascenderY}
                width={rightAdvance * scaleFactor}
                height={(ascender - descender) * scaleFactor}
                fill="rgba(255,255,255,0.02)"
                stroke="rgba(255,255,255,0.15)"
                strokeDasharray="4,4"
              />
              <text
                x={rightGlyphX + (rightAdvance * scaleFactor) / 2}
                y={baselineY - 15}
                textAnchor="middle"
                fill="rgba(255,255,255,0.4)"
                fontSize={fontDisplaySize * 0.7}
                fontFamily="sans-serif"
              >
                {rightChar}
              </text>
            </g>
          )}

          {/* Right Glyph Advance Boundary Line */}
          <line
            x1={rightAdvanceLineX}
            y1={ascenderY - 15}
            x2={rightAdvanceLineX}
            y2={descenderY + 15}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeDasharray="3,3"
            strokeWidth="1"
          />

          {/* KERNING GAP HIGHLIGHT / ACTIVE ZONE */}
          <g>
            {/* Visual kerning connector line */}
            <line
              x1={leftAdvanceLineX}
              y1={baselineY}
              x2={rightGlyphX}
              y2={baselineY}
              stroke={liveKern < 0 ? '#818cf8' : '#34d399'}
              strokeWidth="3"
            />

            {/* Draggable vertical separator guideline on Right Glyph origin */}
            <line
              x1={rightGlyphX}
              y1={ascenderY - 25}
              x2={rightGlyphX}
              y2={descenderY + 25}
              stroke={liveKern < 0 ? '#818cf8' : '#34d399'}
              strokeWidth="2"
            />

            {/* Draggable interactive handle pill */}
            <g
              transform={`translate(${rightGlyphX}, ${ascenderY - 20})`}
              onMouseDown={handleMouseDown}
              style={{ cursor: 'col-resize' }}
            >
              <rect
                x="-32"
                y="-10"
                width="64"
                height="20"
                rx="10"
                fill={liveKern < 0 ? '#4338ca' : (liveKern > 0 ? '#047857' : '#334155')}
                stroke={liveKern < 0 ? '#818cf8' : (liveKern > 0 ? '#34d399' : '#64748b')}
                strokeWidth="1.5"
              />
              <text
                x="0"
                y="3"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10"
                fontWeight="700"
                fontFamily="monospace"
              >
                {liveKern > 0 ? `+${liveKern}` : liveKern}
              </text>
            </g>
          </g>
        </svg>

        {/* Hover drag instruction badge */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          right: '12px',
          fontSize: '10px',
          color: 'var(--text-faint)',
          backgroundColor: 'rgba(0,0,0,0.4)',
          padding: '2px 8px',
          borderRadius: '4px'
        }}>
          Drag pill or use sliders below to adjust contextual spacing
        </div>
      </div>

      {/* SLIDER & CONTROLS TOOLBAR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          {/* Stepper nudge buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button className="btn-secondary" onClick={() => handleStep(-50)} style={{ fontSize: '11px', padding: '4px 8px' }}>-50</button>
            <button className="btn-secondary" onClick={() => handleStep(-10)} style={{ fontSize: '11px', padding: '4px 8px' }}>-10</button>
            <button className="btn-secondary" onClick={() => handleStep(-1)} style={{ fontSize: '11px', padding: '4px 8px' }}>-1</button>
            <button className="btn-secondary" onClick={handleResetZero} style={{ fontSize: '11px', padding: '4px 8px' }}>0</button>
            <button className="btn-secondary" onClick={() => handleStep(1)} style={{ fontSize: '11px', padding: '4px 8px' }}>+1</button>
            <button className="btn-secondary" onClick={() => handleStep(10)} style={{ fontSize: '11px', padding: '4px 8px' }}>+10</button>
            <button className="btn-secondary" onClick={() => handleStep(50)} style={{ fontSize: '11px', padding: '4px 8px' }}>+50</button>
          </div>

          {/* Exact unit numeric input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-faint)', fontWeight: 600 }}>GPOS Kerning:</span>
            <input
              type="number"
              value={liveKern}
              onChange={(e) => {
                const val = Number(e.target.value);
                setLiveKern(val);
                onUpdateKerning(val);
              }}
              style={{
                width: '80px',
                padding: '4px 8px',
                fontSize: '13px',
                fontWeight: 700,
                textAlign: 'center',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: liveKern < 0 ? '#818cf8' : (liveKern > 0 ? '#34d399' : 'var(--text-main)')
              }}
            />
            <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>units</span>
          </div>
        </div>

        {/* Range Slider */}
        <div>
          <input
            type="range"
            min="-300"
            max="150"
            value={liveKern}
            onChange={(e) => {
              const val = Number(e.target.value);
              setLiveKern(val);
              onUpdateKerning(val);
            }}
            style={{ width: '100%', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-faint)', marginTop: '2px' }}>
            <span>-300 u (Tighter)</span>
            <span>-150 u</span>
            <span>0 u (Neutral)</span>
            <span>+75 u</span>
            <span>+150 u (Looser)</span>
          </div>
        </div>

        {/* Metrics breakdown readout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          padding: '10px 12px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '6px',
          border: '1px solid var(--border)',
          fontSize: '11px'
        }}>
          <div>
            <span style={{ color: 'var(--text-faint)', display: 'block' }}>Left Advance ({leftChar})</span>
            <span style={{ fontWeight: 600 }}>{leftAdvance} u</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-faint)', display: 'block' }}>Kerning Shift</span>
            <span style={{ fontWeight: 600, color: liveKern < 0 ? '#818cf8' : (liveKern > 0 ? '#34d399' : 'var(--text-main)') }}>
              {liveKern > 0 ? `+${liveKern}` : liveKern} u
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-faint)', display: 'block' }}>Right Advance ({rightChar})</span>
            <span style={{ fontWeight: 600 }}>{rightAdvance} u</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-faint)', display: 'block' }}>Total Pair Width</span>
            <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
              {leftAdvance + liveKern + rightAdvance} u
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
