import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Minus, Plus, Wand2, RotateCcw, MoveVertical } from 'lucide-react';
import { GlyphMetricData, getCategory } from './types';
import { Glyph } from '../../types/font';

interface VerticalMetricsCanvasProps {
  upm: number;
  ascender: number;
  setAscender: (v: number) => void;
  capHeight: number;
  setCapHeight: (v: number) => void;
  xHeight: number;
  setXHeight: (v: number) => void;
  descender: number;
  setDescender: (v: number) => void;
  lineGap: number;
  setLineGap: (v: number) => void;
  updateMetrics: (partial: any) => void;
  glyphsMetricData: Record<string, GlyphMetricData>;
  defaultAdvance: number;
  defaultLsb: number;
  defaultRsb: number;
  spaceWidth: number;
  onAutoCalibrate: () => void;
  onResetDefaults: () => void;
}

export const VerticalMetricsCanvas: React.FC<VerticalMetricsCanvasProps> = ({
  upm,
  ascender,
  setAscender,
  capHeight,
  setCapHeight,
  xHeight,
  setXHeight,
  descender,
  setDescender,
  lineGap,
  setLineGap,
  updateMetrics,
  glyphsMetricData,
  defaultAdvance,
  defaultLsb,
  defaultRsb,
  spaceWidth,
  onAutoCalibrate,
  onResetDefaults
}) => {
  const [verticalSpecimen, setVerticalSpecimen] = useState('ÅHdxpg');
  const [verticalFontSize, setVerticalFontSize] = useState(140);
  const [showVerticalGuides, setShowVerticalGuides] = useState(true);
  const [showLineGapBand, setShowLineGapBand] = useState(true);
  const [draggingVerticalGuide, setDraggingVerticalGuide] = useState<'ascender' | 'capHeight' | 'xHeight' | 'descender' | 'lineGap' | null>(null);
  const [dragVerticalStart, setDragVerticalStart] = useState<{ mouseY: number; initialVal: number } | null>(null);
  const [hoveredVerticalGuide, setHoveredVerticalGuide] = useState<'ascender' | 'capHeight' | 'xHeight' | 'descender' | 'lineGap' | null>(null);
  const verticalCanvasRef = useRef<HTMLDivElement>(null);

  const verticalScaleFactor = verticalFontSize / upm;
  const verticalBaselineY = Math.round(70 + (ascender + (lineGap || 0)) * verticalScaleFactor);

  const handleVerticalGuideMouseDown = (
    guide: 'ascender' | 'capHeight' | 'xHeight' | 'descender' | 'lineGap',
    e: React.MouseEvent,
    initialVal: number
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingVerticalGuide(guide);
    setDragVerticalStart({
      mouseY: e.clientY,
      initialVal
    });
  };

  useEffect(() => {
    if (!draggingVerticalGuide || !dragVerticalStart) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaYScreen = e.clientY - dragVerticalStart.mouseY;
      const deltaFontUnits = Math.round(-deltaYScreen / verticalScaleFactor);

      if (draggingVerticalGuide === 'ascender') {
        const nextVal = Math.round(dragVerticalStart.initialVal + deltaFontUnits);
        const clamped = Math.max(capHeight + 10, Math.min(Math.round(upm * 1.6), nextVal));
        setAscender(clamped);
        updateMetrics({ ascender: clamped });
      } else if (draggingVerticalGuide === 'capHeight') {
        const nextVal = Math.round(dragVerticalStart.initialVal + deltaFontUnits);
        const clamped = Math.max(xHeight + 10, Math.min(ascender - 5, nextVal));
        setCapHeight(clamped);
        updateMetrics({ capHeight: clamped });
      } else if (draggingVerticalGuide === 'xHeight') {
        const nextVal = Math.round(dragVerticalStart.initialVal + deltaFontUnits);
        const clamped = Math.max(50, Math.min(capHeight - 5, nextVal));
        setXHeight(clamped);
        updateMetrics({ xHeight: clamped });
      } else if (draggingVerticalGuide === 'descender') {
        const nextVal = Math.round(dragVerticalStart.initialVal + deltaFontUnits);
        const clamped = Math.min(-10, Math.max(-Math.round(upm * 0.9), nextVal));
        setDescender(clamped);
        updateMetrics({ descender: clamped });
      } else if (draggingVerticalGuide === 'lineGap') {
        const nextVal = Math.round(dragVerticalStart.initialVal + deltaFontUnits);
        const clamped = Math.max(0, Math.min(1000, nextVal));
        setLineGap(clamped);
        updateMetrics({ lineGap: clamped });
      }
    };

    const handleMouseUp = () => {
      setDraggingVerticalGuide(null);
      setDragVerticalStart(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingVerticalGuide, dragVerticalStart, verticalScaleFactor, ascender, capHeight, xHeight, descender, upm, lineGap, setAscender, setCapHeight, setXHeight, setDescender, setLineGap, updateMetrics]);

  const verticalChars = verticalSpecimen.split('');
  const verticalStringLayout = useMemo(() => {
    let currentX = 60;
    return verticalChars.map((char, index) => {
      const data = glyphsMetricData[char] || {
        char,
        glyph: {
          char,
          name: char,
          unicode: '',
          isAssigned: false,
          advanceWidth: defaultAdvance,
          lsb: defaultLsb,
          rsb: defaultRsb,
          scale: 100,
          yOffset: 0,
          svgPath: ''
        } as Glyph,
        hasArtwork: false,
        artworkWidth: 0,
        lsb: defaultLsb,
        rsb: defaultRsb,
        advanceWidth: char === ' ' ? spaceWidth : defaultAdvance,
        category: getCategory(char)
      };

      const charAdvancePx = Math.max(10, data.advanceWidth * verticalScaleFactor);
      const startX = currentX;
      currentX += charAdvancePx;

      return {
        index,
        char,
        data,
        startX,
        advancePx: charAdvancePx
      };
    });
  }, [verticalSpecimen, glyphsMetricData, verticalScaleFactor, defaultAdvance, defaultLsb, defaultRsb, spaceWidth]);

  const totalVerticalCanvasWidth = verticalStringLayout.length > 0
    ? Math.max(900, verticalStringLayout[verticalStringLayout.length - 1].startX + verticalStringLayout[verticalStringLayout.length - 1].advancePx + 160)
    : 900;

  const verticalCanvasHeight = Math.max(
    480,
    Math.round((ascender + (lineGap || 0) + Math.abs(descender)) * verticalScaleFactor + 140)
  );

  const verticalPresets = [
    { label: 'Standard (ÅHdxpg)', value: 'ÅHdxpg' },
    { label: 'Caps & Accents (ÅÉÎÑHM)', value: 'ÅÉÎÑHM' },
    { label: 'Lowercase (bdfgjpqy)', value: 'bdfgjpqy' },
    { label: 'Minimal (Hxpg)', value: 'Hxpg' }
  ];

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-main)',
      overflow: 'hidden'
    }}>
      {/* Vertical Metrics Specimen Toolbar */}
      <div style={{
        padding: '10px 16px',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
        flexShrink: 0
      }}>
        {/* Left: Specimen Input & Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
            Specimen:
          </span>
          <input
            type="text"
            value={verticalSpecimen}
            onChange={(e) => setVerticalSpecimen(e.target.value)}
            style={{
              width: '140px',
              fontFamily: 'serif',
              fontSize: '14px',
              padding: '4px 8px',
              fontWeight: 600
            }}
            placeholder="Specimen letters..."
          />

          {/* Quick Preset Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {verticalPresets.map(preset => (
              <button
                key={preset.label}
                className="btn-secondary"
                onClick={() => setVerticalSpecimen(preset.value)}
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  backgroundColor: verticalSpecimen === preset.value ? 'var(--bg-surface)' : undefined,
                  borderColor: verticalSpecimen === preset.value ? 'var(--accent)' : undefined,
                  color: verticalSpecimen === preset.value ? 'var(--accent)' : undefined
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Actions, Calibrate & Zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Auto-Calibrate */}
          <button
            className="btn-secondary"
            onClick={onAutoCalibrate}
            style={{ fontSize: '11px', padding: '4px 10px', gap: '5px' }}
            title="Calibrate Cap, x-Height, Ascender, and Descender from drawn glyph vectors"
          >
            <Wand2 size={13} color="var(--accent)" />
            <span>Auto-Calibrate Outlines</span>
          </button>

          {/* Reset Defaults */}
          <button
            className="btn-secondary"
            onClick={onResetDefaults}
            style={{ fontSize: '11px', padding: '4px 8px', gap: '4px' }}
            title="Reset to standard UPM vertical proportions"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>

          <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border)' }} />

          {/* Zoom controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              className="btn-secondary"
              onClick={() => setVerticalFontSize(prev => Math.max(80, prev - 15))}
              style={{ padding: '3px 6px', height: '24px' }}
              title="Zoom Out"
            >
              <Minus size={11} />
            </button>
            <input
              type="range"
              min="80"
              max="220"
              value={verticalFontSize}
              onChange={(e) => setVerticalFontSize(Number(e.target.value))}
              style={{ width: '70px', cursor: 'pointer' }}
            />
            <button
              className="btn-secondary"
              onClick={() => setVerticalFontSize(prev => Math.min(220, prev + 15))}
              style={{ padding: '3px 6px', height: '24px' }}
              title="Zoom In"
            >
              <Plus size={11} />
            </button>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-main)', width: '38px' }}>
              {verticalFontSize}px
            </span>
          </div>

          {/* Guideline Toggles */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showVerticalGuides}
              onChange={(e) => setShowVerticalGuides(e.target.checked)}
            />
            <span>Guides</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showLineGapBand}
              onChange={(e) => setShowLineGapBand(e.target.checked)}
            />
            <span>Line Gap</span>
          </label>
        </div>
      </div>

      {/* Status & Calibration Value Bar */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        padding: '6px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        fontSize: '11px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
            <span style={{ color: 'var(--text-muted)' }}>Ascender:</span>
            <strong style={{ color: '#38bdf8' }}>{ascender} U</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#818cf8' }} />
            <span style={{ color: 'var(--text-muted)' }}>Cap Height:</span>
            <strong style={{ color: '#818cf8' }}>{capHeight} U</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span style={{ color: 'var(--text-muted)' }}>x-Height:</span>
            <strong style={{ color: '#10b981' }}>{xHeight} U</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <span style={{ color: 'var(--text-muted)' }}>Baseline:</span>
            <strong style={{ color: '#f59e0b' }}>0 U (Locked)</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <span style={{ color: 'var(--text-muted)' }}>Descender:</span>
            <strong style={{ color: '#ef4444' }}>{descender} U</strong>
          </div>
          {showLineGapBand && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a855f7' }} />
              <span style={{ color: 'var(--text-muted)' }}>Line Gap:</span>
              <strong style={{ color: '#a855f7' }}>+{lineGap} U</strong>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-faint)' }}>
          <span>Total Line Height:</span>
          <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>
            {ascender - descender + (lineGap || 0)} units
          </strong>
          <span>({Math.round(((ascender - descender + (lineGap || 0)) / upm) * 100)}% UPM)</span>
        </div>
      </div>

      {/* Interactive Vector Alignment Canvas */}
      <div
        ref={verticalCanvasRef}
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'auto',
          backgroundColor: '#070a10',
          position: 'relative',
          userSelect: 'none'
        }}
      >
        {/* Floating drag feedback banner */}
        {draggingVerticalGuide && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1e293b',
            border: '1px solid var(--accent)',
            color: '#fff',
            borderRadius: '6px',
            padding: '6px 14px',
            fontSize: '11px',
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <MoveVertical size={13} color="var(--accent)" />
            <span>
              Dragging {draggingVerticalGuide.toUpperCase()}:{' '}
              {draggingVerticalGuide === 'ascender' && `${ascender} U`}
              {draggingVerticalGuide === 'capHeight' && `${capHeight} U`}
              {draggingVerticalGuide === 'xHeight' && `${xHeight} U`}
              {draggingVerticalGuide === 'descender' && `${descender} U`}
              {draggingVerticalGuide === 'lineGap' && `+${lineGap} U`}
            </span>
          </div>
        )}

        <svg
          width={totalVerticalCanvasWidth}
          height={verticalCanvasHeight}
          style={{ display: 'block', overflow: 'visible' }}
        >
          <defs>
            <pattern id="vertical-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            </pattern>
          </defs>

          <rect width={totalVerticalCanvasWidth} height={verticalCanvasHeight} fill="url(#vertical-grid)" />

          {/* Shaded Metric Region Bands */}
          {showVerticalGuides && (
            <g>
              {/* Line Gap Envelope Shading */}
              {showLineGapBand && lineGap > 0 && (
                <rect
                  x="0"
                  y={verticalBaselineY - (ascender + lineGap) * verticalScaleFactor}
                  width={totalVerticalCanvasWidth}
                  height={lineGap * verticalScaleFactor}
                  fill="rgba(168, 85, 247, 0.07)"
                  stroke="rgba(168, 85, 247, 0.25)"
                  strokeDasharray="4,4"
                />
              )}

              {/* Ascender to Cap Height Band */}
              {ascender > capHeight && (
                <rect
                  x="0"
                  y={verticalBaselineY - ascender * verticalScaleFactor}
                  width={totalVerticalCanvasWidth}
                  height={(ascender - capHeight) * verticalScaleFactor}
                  fill="rgba(56, 189, 248, 0.03)"
                />
              )}

              {/* Cap Height to x-Height Band */}
              {capHeight > xHeight && (
                <rect
                  x="0"
                  y={verticalBaselineY - capHeight * verticalScaleFactor}
                  width={totalVerticalCanvasWidth}
                  height={(capHeight - xHeight) * verticalScaleFactor}
                  fill="rgba(129, 140, 248, 0.04)"
                />
              )}

              {/* x-Height to Baseline (Body) Band */}
              {xHeight > 0 && (
                <rect
                  x="0"
                  y={verticalBaselineY - xHeight * verticalScaleFactor}
                  width={totalVerticalCanvasWidth}
                  height={xHeight * verticalScaleFactor}
                  fill="rgba(16, 185, 129, 0.05)"
                />
              )}

              {/* Baseline to Descender Band */}
              {descender < 0 && (
                <rect
                  x="0"
                  y={verticalBaselineY}
                  width={totalVerticalCanvasWidth}
                  height={Math.abs(descender) * verticalScaleFactor}
                  fill="rgba(239, 68, 68, 0.05)"
                />
              )}
            </g>
          )}

          {/* Render Specimen Glyphs on Canvas */}
          {verticalStringLayout.map((item) => {
            const charX = item.startX;
            const advPx = item.advancePx;
            const hasPath = item.data.hasArtwork;

            return (
              <g key={`vertical-glyph-${item.index}`}>
                {/* Sidebearing vertical boundary lines */}
                <line
                  x1={charX}
                  y1={verticalBaselineY - (ascender + (lineGap || 0)) * verticalScaleFactor - 15}
                  x2={charX}
                  y2={verticalBaselineY - descender * verticalScaleFactor + 25}
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeDasharray="2,3"
                />
                <line
                  x1={charX + advPx}
                  y1={verticalBaselineY - (ascender + (lineGap || 0)) * verticalScaleFactor - 15}
                  x2={charX + advPx}
                  y2={verticalBaselineY - descender * verticalScaleFactor + 25}
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeDasharray="2,3"
                />

                {/* Vector Artwork */}
                {hasPath ? (
                  <g
                    transform={`translate(${charX}, ${verticalBaselineY}) scale(${verticalScaleFactor}, ${-verticalScaleFactor})`}
                  >
                    <path
                      d={item.data.glyph.svgPath}
                      fill="#f8fafc"
                      opacity="0.94"
                    />
                  </g>
                ) : item.char === ' ' ? (
                  <rect
                    x={charX + 4}
                    y={verticalBaselineY - 24}
                    width={Math.max(6, advPx - 8)}
                    height={24}
                    fill="rgba(255, 255, 255, 0.04)"
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeDasharray="3,3"
                    rx="3"
                  />
                ) : (
                  <g transform={`translate(${charX}, ${verticalBaselineY})`}>
                    <rect
                      x="2"
                      y={-(capHeight * verticalScaleFactor)}
                      width={Math.max(10, advPx - 4)}
                      height={(capHeight - descender) * verticalScaleFactor}
                      fill="rgba(255,255,255,0.02)"
                      stroke="rgba(255,255,255,0.08)"
                      strokeDasharray="3,3"
                      rx="4"
                    />
                    <text
                      x={advPx / 2}
                      y={-(capHeight * verticalScaleFactor) / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="rgba(255,255,255,0.2)"
                      fontSize={verticalFontSize * 0.45}
                      fontFamily="serif"
                    >
                      {item.char}
                    </text>
                  </g>
                )}

                {/* Character caption tag at bottom */}
                <text
                  x={charX + advPx / 2}
                  y={verticalBaselineY - descender * verticalScaleFactor + 22}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="11"
                  fontFamily="monospace"
                >
                  {item.char}
                </text>
              </g>
            );
          })}

          {/* Horizontal Metric Guidelines & Draggable Handles */}
          {showVerticalGuides && (
            <g>
              {/* 1. Line Gap Top Line */}
              {showLineGapBand && (
                <g>
                  <line
                    x1="0"
                    y1={verticalBaselineY - (ascender + (lineGap || 0)) * verticalScaleFactor}
                    x2={totalVerticalCanvasWidth}
                    y2={verticalBaselineY - (ascender + (lineGap || 0)) * verticalScaleFactor}
                    stroke="#a855f7"
                    strokeWidth={draggingVerticalGuide === 'lineGap' ? 2 : 1.5}
                    strokeDasharray="4,4"
                    opacity={hoveredVerticalGuide === 'lineGap' || draggingVerticalGuide === 'lineGap' ? 1 : 0.65}
                  />
                  {/* Invisible wide hit-area for line */}
                  <rect
                    x="0"
                    y={verticalBaselineY - (ascender + (lineGap || 0)) * verticalScaleFactor - 12}
                    width={totalVerticalCanvasWidth}
                    height="24"
                    fill="transparent"
                    style={{ cursor: 'ns-resize' }}
                    onMouseDown={(e) => handleVerticalGuideMouseDown('lineGap', e, lineGap)}
                    onMouseEnter={() => setHoveredVerticalGuide('lineGap')}
                    onMouseLeave={() => setHoveredVerticalGuide(null)}
                  />
                  {/* Handle Pill Tag */}
                  <g
                    transform={`translate(16, ${verticalBaselineY - (ascender + (lineGap || 0)) * verticalScaleFactor - 11})`}
                    style={{ cursor: 'ns-resize' }}
                    onMouseDown={(e) => handleVerticalGuideMouseDown('lineGap', e, lineGap)}
                    onMouseEnter={() => setHoveredVerticalGuide('lineGap')}
                    onMouseLeave={() => setHoveredVerticalGuide(null)}
                  >
                    <rect
                      width="128"
                      height="22"
                      rx="4"
                      fill={draggingVerticalGuide === 'lineGap' ? '#a855f7' : '#1e1b4b'}
                      stroke="#a855f7"
                      strokeWidth="1"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
                    />
                    <text x="8" y="15" fill="#fff" fontSize="10" fontWeight="600">
                      ↕ Line Gap (+{lineGap} U)
                    </text>
                  </g>
                </g>
              )}

              {/* 2. Ascender Line */}
              <g>
                <line
                  x1="0"
                  y1={verticalBaselineY - ascender * verticalScaleFactor}
                  x2={totalVerticalCanvasWidth}
                  y2={verticalBaselineY - ascender * verticalScaleFactor}
                  stroke="#38bdf8"
                  strokeWidth={draggingVerticalGuide === 'ascender' ? 2.5 : 1.5}
                  strokeDasharray="6,4"
                  opacity={hoveredVerticalGuide === 'ascender' || draggingVerticalGuide === 'ascender' ? 1 : 0.75}
                />
                {/* Hit-area */}
                <rect
                  x="0"
                  y={verticalBaselineY - ascender * verticalScaleFactor - 12}
                  width={totalVerticalCanvasWidth}
                  height="24"
                  fill="transparent"
                  style={{ cursor: 'ns-resize' }}
                  onMouseDown={(e) => handleVerticalGuideMouseDown('ascender', e, ascender)}
                  onMouseEnter={() => setHoveredVerticalGuide('ascender')}
                  onMouseLeave={() => setHoveredVerticalGuide(null)}
                />
                {/* Handle Pill Tag */}
                <g
                  transform={`translate(16, ${verticalBaselineY - ascender * verticalScaleFactor - 11})`}
                  style={{ cursor: 'ns-resize' }}
                  onMouseDown={(e) => handleVerticalGuideMouseDown('ascender', e, ascender)}
                  onMouseEnter={() => setHoveredVerticalGuide('ascender')}
                  onMouseLeave={() => setHoveredVerticalGuide(null)}
                >
                  <rect
                    width="124"
                    height="22"
                    rx="4"
                    fill={draggingVerticalGuide === 'ascender' ? '#38bdf8' : '#082f49'}
                    stroke="#38bdf8"
                    strokeWidth="1"
                  />
                  <text x="8" y="15" fill={draggingVerticalGuide === 'ascender' ? '#0f172a' : '#38bdf8'} fontSize="10" fontWeight="700">
                    ↕ Ascender ({ascender} U)
                  </text>
                </g>
              </g>

              {/* 3. Cap Height Line */}
              <g>
                <line
                  x1="0"
                  y1={verticalBaselineY - capHeight * verticalScaleFactor}
                  x2={totalVerticalCanvasWidth}
                  y2={verticalBaselineY - capHeight * verticalScaleFactor}
                  stroke="#818cf8"
                  strokeWidth={draggingVerticalGuide === 'capHeight' ? 2.5 : 1.5}
                  strokeDasharray="6,4"
                  opacity={hoveredVerticalGuide === 'capHeight' || draggingVerticalGuide === 'capHeight' ? 1 : 0.75}
                />
                {/* Hit-area */}
                <rect
                  x="0"
                  y={verticalBaselineY - capHeight * verticalScaleFactor - 12}
                  width={totalVerticalCanvasWidth}
                  height="24"
                  fill="transparent"
                  style={{ cursor: 'ns-resize' }}
                  onMouseDown={(e) => handleVerticalGuideMouseDown('capHeight', e, capHeight)}
                  onMouseEnter={() => setHoveredVerticalGuide('capHeight')}
                  onMouseLeave={() => setHoveredVerticalGuide(null)}
                />
                {/* Handle Pill Tag */}
                <g
                  transform={`translate(16, ${verticalBaselineY - capHeight * verticalScaleFactor - 11})`}
                  style={{ cursor: 'ns-resize' }}
                  onMouseDown={(e) => handleVerticalGuideMouseDown('capHeight', e, capHeight)}
                  onMouseEnter={() => setHoveredVerticalGuide('capHeight')}
                  onMouseLeave={() => setHoveredVerticalGuide(null)}
                >
                  <rect
                    width="132"
                    height="22"
                    rx="4"
                    fill={draggingVerticalGuide === 'capHeight' ? '#818cf8' : '#1e1b4b'}
                    stroke="#818cf8"
                    strokeWidth="1"
                  />
                  <text x="8" y="15" fill={draggingVerticalGuide === 'capHeight' ? '#0f172a' : '#a5b4fc'} fontSize="10" fontWeight="700">
                    ↕ Cap Height ({capHeight} U)
                  </text>
                </g>
              </g>

              {/* 4. x-Height Line */}
              <g>
                <line
                  x1="0"
                  y1={verticalBaselineY - xHeight * verticalScaleFactor}
                  x2={totalVerticalCanvasWidth}
                  y2={verticalBaselineY - xHeight * verticalScaleFactor}
                  stroke="#10b981"
                  strokeWidth={draggingVerticalGuide === 'xHeight' ? 2.5 : 1.5}
                  strokeDasharray="6,4"
                  opacity={hoveredVerticalGuide === 'xHeight' || draggingVerticalGuide === 'xHeight' ? 1 : 0.75}
                />
                {/* Hit-area */}
                <rect
                  x="0"
                  y={verticalBaselineY - xHeight * verticalScaleFactor - 12}
                  width={totalVerticalCanvasWidth}
                  height="24"
                  fill="transparent"
                  style={{ cursor: 'ns-resize' }}
                  onMouseDown={(e) => handleVerticalGuideMouseDown('xHeight', e, xHeight)}
                  onMouseEnter={() => setHoveredVerticalGuide('xHeight')}
                  onMouseLeave={() => setHoveredVerticalGuide(null)}
                />
                {/* Handle Pill Tag */}
                <g
                  transform={`translate(16, ${verticalBaselineY - xHeight * verticalScaleFactor - 11})`}
                  style={{ cursor: 'ns-resize' }}
                  onMouseDown={(e) => handleVerticalGuideMouseDown('xHeight', e, xHeight)}
                  onMouseEnter={() => setHoveredVerticalGuide('xHeight')}
                  onMouseLeave={() => setHoveredVerticalGuide(null)}
                >
                  <rect
                    width="118"
                    height="22"
                    rx="4"
                    fill={draggingVerticalGuide === 'xHeight' ? '#10b981' : '#064e3b'}
                    stroke="#10b981"
                    strokeWidth="1"
                  />
                  <text x="8" y="15" fill={draggingVerticalGuide === 'xHeight' ? '#0f172a' : '#6ee7b7'} fontSize="10" fontWeight="700">
                    ↕ x-Height ({xHeight} U)
                  </text>
                </g>
              </g>

              {/* 5. Baseline (Solid Reference 0 U - Locked) */}
              <g>
                <line
                  x1="0"
                  y1={verticalBaselineY}
                  x2={totalVerticalCanvasWidth}
                  y2={verticalBaselineY}
                  stroke="#f59e0b"
                  strokeWidth="2"
                  opacity="0.9"
                />
                {/* Tag */}
                <g transform={`translate(16, ${verticalBaselineY - 11})`}>
                  <rect
                    width="128"
                    height="22"
                    rx="4"
                    fill="#451a03"
                    stroke="#f59e0b"
                    strokeWidth="1"
                  />
                  <text x="8" y="15" fill="#fde68a" fontSize="10" fontWeight="700">
                    🔒 Baseline (0 U Anchor)
                  </text>
                </g>
              </g>

              {/* 6. Descender Line */}
              <g>
                <line
                  x1="0"
                  y1={verticalBaselineY - descender * verticalScaleFactor}
                  x2={totalVerticalCanvasWidth}
                  y2={verticalBaselineY - descender * verticalScaleFactor}
                  stroke="#ef4444"
                  strokeWidth={draggingVerticalGuide === 'descender' ? 2.5 : 1.5}
                  strokeDasharray="6,4"
                  opacity={hoveredVerticalGuide === 'descender' || draggingVerticalGuide === 'descender' ? 1 : 0.75}
                />
                {/* Hit-area */}
                <rect
                  x="0"
                  y={verticalBaselineY - descender * verticalScaleFactor - 12}
                  width={totalVerticalCanvasWidth}
                  height="24"
                  fill="transparent"
                  style={{ cursor: 'ns-resize' }}
                  onMouseDown={(e) => handleVerticalGuideMouseDown('descender', e, descender)}
                  onMouseEnter={() => setHoveredVerticalGuide('descender')}
                  onMouseLeave={() => setHoveredVerticalGuide(null)}
                />
                {/* Handle Pill Tag */}
                <g
                  transform={`translate(16, ${verticalBaselineY - descender * verticalScaleFactor - 11})`}
                  style={{ cursor: 'ns-resize' }}
                  onMouseDown={(e) => handleVerticalGuideMouseDown('descender', e, descender)}
                  onMouseEnter={() => setHoveredVerticalGuide('descender')}
                  onMouseLeave={() => setHoveredVerticalGuide(null)}
                >
                  <rect
                    width="132"
                    height="22"
                    rx="4"
                    fill={draggingVerticalGuide === 'descender' ? '#ef4444' : '#450a0a'}
                    stroke="#ef4444"
                    strokeWidth="1"
                  />
                  <text x="8" y="15" fill={draggingVerticalGuide === 'descender' ? '#fff' : '#fca5a5'} fontSize="10" fontWeight="700">
                    ↕ Descender ({descender} U)
                  </text>
                </g>
              </g>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
