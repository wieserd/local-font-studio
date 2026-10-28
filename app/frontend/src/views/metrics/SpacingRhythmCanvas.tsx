import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus, AlignCenter } from 'lucide-react';
import { ViewMode } from './types';

interface SpacingRhythmCanvasProps {
  testString: string;
  setTestString: (v: string) => void;
  canvasFontSize: number;
  setCanvasFontSize: (v: number) => void;
  selectedStringCharIndex: number;
  setSelectedStringCharIndex: React.Dispatch<React.SetStateAction<number>>;
  showGuidelines: boolean;
  setShowGuidelines: (v: boolean) => void;
  stringLayout: any[];
  totalCanvasWidth: number;
  canvasHeight: number;
  baselineY: number;
  scaleFactor: number;
  ascender: number;
  capHeight: number;
  xHeight: number;
  descender: number;
  activeCharLayout: any;
  handleCanvasGuideMouseDown: (guide: 'lsb' | 'advance', e: React.MouseEvent, char: string, initialVal: number) => void;
  handleUpdateAdvance: (char: string, val: number) => void;
  handleUpdateLsb: (char: string, val: number) => void;
  handleUpdateRsb: (char: string, val: number) => void;
  handleAutoCenterGlyph: (char: string) => void;
  viewMode: ViewMode;
}

export const SpacingRhythmCanvas: React.FC<SpacingRhythmCanvasProps> = ({
  testString,
  setTestString,
  canvasFontSize,
  setCanvasFontSize,
  selectedStringCharIndex,
  setSelectedStringCharIndex,
  showGuidelines,
  setShowGuidelines,
  stringLayout,
  totalCanvasWidth,
  canvasHeight,
  baselineY,
  scaleFactor,
  ascender,
  capHeight,
  xHeight,
  descender,
  activeCharLayout,
  handleCanvasGuideMouseDown,
  handleUpdateAdvance,
  handleUpdateLsb,
  handleUpdateRsb,
  handleAutoCenterGlyph,
  viewMode
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{
      flex: viewMode === 'split' ? '0 0 350px' : '1',
      borderBottom: viewMode === 'split' ? '1px solid var(--border)' : 'none',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-main)',
      overflow: 'hidden'
    }}>
      {/* String Controls Toolbar */}
      <div style={{
        padding: '8px 16px',
        backgroundColor: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        flexShrink: 0
      }}>
        {/* String Input & Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '320px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Rhythm String:</span>
          <input
            type="text"
            value={testString}
            onChange={(e) => {
              setTestString(e.target.value || ' ');
              setSelectedStringCharIndex(0);
            }}
            style={{
              flex: 1,
              maxWidth: '240px',
              padding: '4px 8px',
              fontSize: '13px',
              fontFamily: 'monospace',
              fontWeight: 700
            }}
            placeholder="Type string..."
          />

          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: '3px' }}>
            {[
              { label: 'HHOHHOO', val: 'HHOHHOO' },
              { label: 'nnoonn', val: 'nnoonn' },
              { label: 'nanbnc', val: 'nanbnc' },
              { label: 'AVAVA', val: 'AVAVA' },
              { label: '0123456789', val: '0123456789' },
              { label: 'Handgloves', val: 'Handgloves' },
            ].map(p => (
              <button
                key={p.label}
                className="btn-secondary"
                style={{
                  padding: '2px 6px',
                  fontSize: '10px',
                  backgroundColor: testString === p.val ? 'rgba(99, 102, 241, 0.2)' : undefined,
                  borderColor: testString === p.val ? 'var(--accent)' : undefined,
                  color: testString === p.val ? '#fff' : undefined,
                }}
                onClick={() => {
                  setTestString(p.val);
                  setSelectedStringCharIndex(0);
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Options: Zoom Slider & Guidelines toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Size:</span>
            <input
              type="range"
              min="48"
              max="180"
              value={canvasFontSize}
              onChange={(e) => setCanvasFontSize(Number(e.target.value))}
              style={{ width: '90px' }}
            />
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-main)', width: '36px' }}>
              {canvasFontSize}px
            </span>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showGuidelines}
              onChange={(e) => setShowGuidelines(e.target.checked)}
            />
            <span>Guides</span>
          </label>
        </div>
      </div>

      {/* Vector Spacing Canvas */}
      <div 
        ref={canvasRef}
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          backgroundColor: '#0a0d14',
          position: 'relative',
          userSelect: 'none'
        }}
      >
        <svg
          width={totalCanvasWidth}
          height={canvasHeight}
          style={{ display: 'block', overflow: 'visible' }}
        >
          <defs>
            <pattern id="rhythm-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            </pattern>
          </defs>

          <rect width={totalCanvasWidth} height={canvasHeight} fill="url(#rhythm-grid)" />

          {/* Horizontal Metric Guidelines */}
          {showGuidelines && (
            <g>
              {/* Ascender line */}
              <line
                x1="0"
                y1={baselineY - (ascender * scaleFactor)}
                x2={totalCanvasWidth}
                y2={baselineY - (ascender * scaleFactor)}
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="4,4"
                opacity="0.45"
              />
              <text x="10" y={baselineY - (ascender * scaleFactor) - 4} fill="#10b981" fontSize="9" opacity="0.7">
                Ascender ({ascender})
              </text>

              {/* Cap Height line */}
              <line
                x1="0"
                y1={baselineY - (capHeight * scaleFactor)}
                x2={totalCanvasWidth}
                y2={baselineY - (capHeight * scaleFactor)}
                stroke="#f59e0b"
                strokeWidth="1"
                strokeDasharray="4,4"
                opacity="0.4"
              />
              <text x="10" y={baselineY - (capHeight * scaleFactor) - 4} fill="#f59e0b" fontSize="9" opacity="0.6">
                Cap Height ({capHeight})
              </text>

              {/* x-Height line */}
              <line
                x1="0"
                y1={baselineY - (xHeight * scaleFactor)}
                x2={totalCanvasWidth}
                y2={baselineY - (xHeight * scaleFactor)}
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="4,4"
                opacity="0.35"
              />
              <text x="10" y={baselineY - (xHeight * scaleFactor) - 4} fill="#38bdf8" fontSize="9" opacity="0.6">
                x-Height ({xHeight})
              </text>

              {/* Baseline */}
              <line
                x1="0"
                y1={baselineY}
                x2={totalCanvasWidth}
                y2={baselineY}
                stroke="#818cf8"
                strokeWidth="1.5"
                opacity="0.8"
              />
              <text x="10" y={baselineY - 4} fill="#818cf8" fontSize="9" fontWeight="bold">
                Baseline (0)
              </text>

              {/* Descender line */}
              <line
                x1="0"
                y1={baselineY - (descender * scaleFactor)}
                x2={totalCanvasWidth}
                y2={baselineY - (descender * scaleFactor)}
                stroke="#ef4444"
                strokeWidth="1"
                strokeDasharray="4,4"
                opacity="0.4"
              />
              <text x="10" y={baselineY - (descender * scaleFactor) - 4} fill="#ef4444" fontSize="9" opacity="0.6">
                Descender ({descender})
              </text>
            </g>
          )}

          {/* Render Glyphs in Rhythm String */}
          {stringLayout.map((item) => {
            const isSelected = item.index === selectedStringCharIndex;
            const charX = item.startX;
            const advPx = item.advancePx;
            const lsbPx = item.data.lsb * scaleFactor;
            const hasPath = item.data.hasArtwork;

            return (
              <g
                key={`glyph-${item.index}`}
                onClick={() => setSelectedStringCharIndex(item.index)}
                style={{ cursor: 'pointer' }}
              >
                {/* Cell Background Highlight on selection */}
                {isSelected && (
                  <rect
                    x={charX}
                    y={Math.max(10, baselineY - (ascender * scaleFactor) - 15)}
                    width={advPx}
                    height={Math.max(120, (ascender - descender) * scaleFactor + 30)}
                    fill="rgba(99, 102, 241, 0.08)"
                    stroke="rgba(99, 102, 241, 0.3)"
                    strokeDasharray="2,2"
                    rx="4"
                  />
                )}

                {/* Glyph Vector Artwork */}
                {hasPath ? (
                  <g
                    transform={`translate(${charX}, ${baselineY}) scale(${scaleFactor}, ${-scaleFactor})`}
                  >
                    <path
                      d={item.data.glyph.svgPath}
                      fill={isSelected ? '#60a5fa' : '#f8fafc'}
                    />
                  </g>
                ) : item.char === ' ' ? (
                  /* Space visualization */
                  <rect
                    x={charX + 2}
                    y={baselineY - 20}
                    width={Math.max(4, advPx - 4)}
                    height={20}
                    fill="rgba(255, 255, 255, 0.05)"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeDasharray="2,2"
                    rx="2"
                  />
                ) : (
                  /* Fallback character letter if unassigned */
                  <text
                    x={charX + advPx / 2}
                    y={baselineY - 10}
                    fill="rgba(255,255,255,0.25)"
                    fontSize={canvasFontSize * 0.7}
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {item.char}
                  </text>
                )}

                {/* Advance boundary vertical marker */}
                <line
                  x1={charX + advPx}
                  y1={baselineY - (ascender * scaleFactor)}
                  x2={charX + advPx}
                  y2={baselineY - (descender * scaleFactor)}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />

                {/* Interactive Drag Handles for SELECTED glyph */}
                {isSelected && (
                  <g>
                    {/* LSB Guideline & Handle (Cyan) */}
                    {item.data.hasArtwork && (
                      <g>
                        <line
                          x1={charX + lsbPx}
                          y1={baselineY - (ascender * scaleFactor) - 10}
                          x2={charX + lsbPx}
                          y2={baselineY - (descender * scaleFactor) + 10}
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          strokeDasharray="3,3"
                        />
                        {/* Draggable handle pill */}
                        <g
                          transform={`translate(${charX + lsbPx}, ${baselineY - (ascender * scaleFactor) - 16})`}
                          style={{ cursor: 'col-resize' }}
                          onMouseDown={(e) => handleCanvasGuideMouseDown('lsb', e, item.char, item.data.lsb)}
                        >
                          <rect
                            x="-22"
                            y="-9"
                            width="44"
                            height="18"
                            rx="9"
                            fill="#0284c7"
                            stroke="#38bdf8"
                            strokeWidth="1"
                          />
                          <text
                            x="0"
                            y="3"
                            fill="#ffffff"
                            fontSize="9"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            L:{item.data.lsb}
                          </text>
                        </g>
                      </g>
                    )}

                    {/* Advance Width Guideline & Handle (Indigo) */}
                    <g>
                      <line
                        x1={charX + advPx}
                        y1={baselineY - (ascender * scaleFactor) - 10}
                        x2={charX + advPx}
                        y2={baselineY - (descender * scaleFactor) + 10}
                        stroke="#818cf8"
                        strokeWidth="2"
                        strokeDasharray="3,3"
                      />
                      {/* Draggable handle pill */}
                      <g
                        transform={`translate(${charX + advPx}, ${baselineY - (ascender * scaleFactor) - 16})`}
                        style={{ cursor: 'col-resize' }}
                        onMouseDown={(e) => handleCanvasGuideMouseDown('advance', e, item.char, item.data.advanceWidth)}
                      >
                        <rect
                          x="-26"
                          y="-9"
                          width="52"
                          height="18"
                          rx="9"
                          fill="#4f46e5"
                          stroke="#818cf8"
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="3"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          W:{item.data.advanceWidth}
                        </text>
                      </g>
                    </g>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Glyph Inspector Card (Bottom HUD of Canvas) */}
      {activeCharLayout && (
        <div style={{
          padding: '8px 16px',
          backgroundColor: 'var(--bg-card)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          flexShrink: 0
        }}>
          {/* Glyph Identity & Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <button
                className="btn-secondary"
                disabled={selectedStringCharIndex <= 0}
                onClick={() => setSelectedStringCharIndex(prev => Math.max(0, prev - 1))}
                style={{ padding: '4px', height: '26px' }}
                title="Previous glyph in string"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                className="btn-secondary"
                disabled={selectedStringCharIndex >= stringLayout.length - 1}
                onClick={() => setSelectedStringCharIndex(prev => Math.min(stringLayout.length - 1, prev + 1))}
                style={{ padding: '4px', height: '26px' }}
                title="Next glyph in string"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 700,
              fontFamily: 'serif',
              color: 'var(--accent)'
            }}>
              {activeCharLayout.char === ' ' ? '␣' : activeCharLayout.char}
            </div>

            <div>
              <div style={{ fontSize: '12px', fontWeight: 700 }}>
                {activeCharLayout.data.glyph.name}
                <span style={{ color: 'var(--text-faint)', fontSize: '11px', marginLeft: '6px' }}>
                  ({activeCharLayout.data.glyph.unicode})
                </span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {activeCharLayout.data.hasArtwork ? 'Artwork Vector' : activeCharLayout.char === ' ' ? 'Word Spacer' : 'Empty Glyph'}
              </div>
            </div>
          </div>

          {/* Direct Numeric Fine-Tuning Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Advance Width Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Advance:</span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  className="btn-secondary"
                  onClick={() => handleUpdateAdvance(activeCharLayout.char, activeCharLayout.data.advanceWidth - 10)}
                  style={{ padding: '3px 6px', borderRadius: '4px 0 0 4px', height: '24px' }}
                >
                  <Minus size={11} />
                </button>
                <input
                  type="number"
                  value={activeCharLayout.data.advanceWidth}
                  onChange={(e) => handleUpdateAdvance(activeCharLayout.char, Number(e.target.value))}
                  style={{
                    width: '58px',
                    height: '24px',
                    borderRadius: 0,
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: 0
                  }}
                />
                <button
                  className="btn-secondary"
                  onClick={() => handleUpdateAdvance(activeCharLayout.char, activeCharLayout.data.advanceWidth + 10)}
                  style={{ padding: '3px 6px', borderRadius: '0 4px 4px 0', height: '24px' }}
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>

            {/* LSB Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#38bdf8' }}>LSB:</span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  className="btn-secondary"
                  disabled={activeCharLayout.char === ' '}
                  onClick={() => handleUpdateLsb(activeCharLayout.char, activeCharLayout.data.lsb - 5)}
                  style={{ padding: '3px 6px', borderRadius: '4px 0 0 4px', height: '24px' }}
                >
                  <Minus size={11} />
                </button>
                <input
                  type="number"
                  disabled={activeCharLayout.char === ' '}
                  value={activeCharLayout.data.lsb}
                  onChange={(e) => handleUpdateLsb(activeCharLayout.char, Number(e.target.value))}
                  style={{
                    width: '50px',
                    height: '24px',
                    borderRadius: 0,
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: 0
                  }}
                />
                <button
                  className="btn-secondary"
                  disabled={activeCharLayout.char === ' '}
                  onClick={() => handleUpdateLsb(activeCharLayout.char, activeCharLayout.data.lsb + 5)}
                  style={{ padding: '3px 6px', borderRadius: '0 4px 4px 0', height: '24px' }}
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>

            {/* RSB Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#a78bfa' }}>RSB:</span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  className="btn-secondary"
                  disabled={activeCharLayout.char === ' '}
                  onClick={() => handleUpdateRsb(activeCharLayout.char, activeCharLayout.data.rsb - 5)}
                  style={{ padding: '3px 6px', borderRadius: '4px 0 0 4px', height: '24px' }}
                >
                  <Minus size={11} />
                </button>
                <input
                  type="number"
                  disabled={activeCharLayout.char === ' '}
                  value={activeCharLayout.data.rsb}
                  onChange={(e) => handleUpdateRsb(activeCharLayout.char, Number(e.target.value))}
                  style={{
                    width: '50px',
                    height: '24px',
                    borderRadius: 0,
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: 0
                  }}
                />
                <button
                  className="btn-secondary"
                  disabled={activeCharLayout.char === ' '}
                  onClick={() => handleUpdateRsb(activeCharLayout.char, activeCharLayout.data.rsb + 5)}
                  style={{ padding: '3px 6px', borderRadius: '0 4px 4px 0', height: '24px' }}
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>

            {/* Auto-Center Quick Button */}
            <button
              className="btn-secondary"
              disabled={activeCharLayout.char === ' '}
              onClick={() => handleAutoCenterGlyph(activeCharLayout.char)}
              style={{ padding: '4px 10px', fontSize: '11px', gap: '5px' }}
              title="Balance Left & Right sidebearings (LSB = RSB)"
            >
              <AlignCenter size={13} color="var(--accent)" />
              <span>Auto-Center</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
