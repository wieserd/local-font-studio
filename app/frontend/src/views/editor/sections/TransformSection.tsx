import React from 'react';
import { ChevronDown, ChevronRight, Move, AlignCenter, RotateCcw } from 'lucide-react';
import { Glyph } from '../../../types/font';
import { EditorTool } from '../types';

interface TransformSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  glyphChar: string;
  xOffset: number;
  setXOffset: (val: number) => void;
  yOffset: number;
  setYOffset: (val: number) => void;
  updateGlyph: (char: string, partial: Partial<Glyph>) => void;
  handleCenterGlyph: () => void;
  handleResetPosition: () => void;
  scale: number;
  setScale: (val: number) => void;
  activeTool: EditorTool;
  handleRotateGlyph: (angle: number) => void;
  handleFlipGlyph: (direction: 'horizontal' | 'vertical') => void;
  customRotationAngle: number;
  setCustomRotationAngle: (val: number) => void;
  stemWeight: number;
  handleStemWeightChange: (val: number) => void;
  italicSlant: number;
  handleItalicSlantChange: (val: number) => void;
  handleResetStylize: () => void;
}

export const TransformSection: React.FC<TransformSectionProps> = ({
  isOpen,
  onToggle,
  glyphChar,
  xOffset,
  setXOffset,
  yOffset,
  setYOffset,
  updateGlyph,
  handleCenterGlyph,
  handleResetPosition,
  scale,
  setScale,
  activeTool,
  handleRotateGlyph,
  handleFlipGlyph,
  customRotationAngle,
  setCustomRotationAngle,
  stemWeight,
  handleStemWeightChange,
  italicSlant,
  handleItalicSlantChange,
  handleResetStylize
}) => {
  return (
    <div style={{ borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-surface)',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isOpen ? <ChevronDown size={14} color="#38bdf8" /> : <ChevronRight size={14} color="var(--text-muted)" />}
          <Move size={13} color="#38bdf8" />
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            2. Transform & Position
          </span>
        </div>
        <span className="badge badge-gray" style={{ fontSize: '9px' }}>
          ({xOffset >= 0 ? `+${xOffset}` : xOffset}, {yOffset >= 0 ? `+${yOffset}` : yOffset})
        </span>
      </div>

      {isOpen && (
        <div style={{ padding: '10px', backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Position Shifts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Shift X</label>
                <span style={{ fontSize: '10px', color: 'var(--accent)', fontFamily: 'monospace' }}>{xOffset >= 0 ? `+${xOffset}` : xOffset}</span>
              </div>
              <input
                type="number"
                value={xOffset}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setXOffset(val);
                  updateGlyph(glyphChar, { xOffset: val });
                }}
                style={{ width: '100%', fontSize: '12px', padding: '4px 6px' }}
              />
              <div style={{ display: 'flex', gap: '2px', marginTop: '3px' }}>
                <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => { const v = xOffset - 10; setXOffset(v); updateGlyph(glyphChar, { xOffset: v }); }} title="-10px">-10</button>
                <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => { const v = xOffset - 1; setXOffset(v); updateGlyph(glyphChar, { xOffset: v }); }} title="-1px">-1</button>
                <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => { const v = xOffset + 1; setXOffset(v); updateGlyph(glyphChar, { xOffset: v }); }} title="+1px">+1</button>
                <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => { const v = xOffset + 10; setXOffset(v); updateGlyph(glyphChar, { xOffset: v }); }} title="+10px">+10</button>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Shift Y (Baseline)</label>
                <span style={{ fontSize: '10px', color: 'var(--accent)', fontFamily: 'monospace' }}>{yOffset >= 0 ? `+${yOffset}` : yOffset}</span>
              </div>
              <input
                type="number"
                value={yOffset}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setYOffset(val);
                  updateGlyph(glyphChar, { yOffset: val });
                }}
                style={{ width: '100%', fontSize: '12px', padding: '4px 6px' }}
              />
              <div style={{ display: 'flex', gap: '2px', marginTop: '3px' }}>
                <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => { const v = yOffset - 10; setYOffset(v); updateGlyph(glyphChar, { yOffset: v }); }} title="-10px">-10</button>
                <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => { const v = yOffset - 1; setYOffset(v); updateGlyph(glyphChar, { yOffset: v }); }} title="-1px">-1</button>
                <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => { const v = yOffset + 1; setYOffset(v); updateGlyph(glyphChar, { yOffset: v }); }} title="+1px">+1</button>
                <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => { const v = yOffset + 10; setYOffset(v); updateGlyph(glyphChar, { yOffset: v }); }} title="+10px">+10</button>
              </div>
            </div>
          </div>

          {/* Align & Reset */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="btn-secondary"
              style={{ flex: 1, fontSize: '10px', padding: '4px 6px', justifyContent: 'center' }}
              onClick={handleCenterGlyph}
              title="Center glyph horizontally in advance width"
            >
              <AlignCenter size={11} />
              <span>Center in Advance</span>
            </button>
            <button
              className="btn-secondary"
              style={{ flex: 1, fontSize: '10px', padding: '4px 6px', justifyContent: 'center' }}
              onClick={handleResetPosition}
              title="Reset X and Y offsets to (0, 0)"
            >
              <RotateCcw size={11} />
              <span>Reset (0, 0)</span>
            </button>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />

          {/* Vector Scale */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Vector Scale</label>
              <span style={{ fontSize: '10px', fontWeight: 600 }}>{scale}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="200"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />

          {/* Rotate & Flip */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)' }}>Rotate & Flip</span>
              {activeTool === 'rotate' && (
                <span className="badge badge-indigo" style={{ fontSize: '9px', padding: '1px 5px' }}>
                  Rotate Tool Active
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '6px' }}>
              <button className="btn-secondary" style={{ fontSize: '10px', padding: '4px 2px', justifyContent: 'center' }} onClick={() => handleRotateGlyph(-90)} title="Rotate -90°">↺ -90°</button>
              <button className="btn-secondary" style={{ fontSize: '10px', padding: '4px 2px', justifyContent: 'center' }} onClick={() => handleRotateGlyph(90)} title="Rotate +90°">↻ +90°</button>
              <button className="btn-secondary" style={{ fontSize: '10px', padding: '4px 2px', justifyContent: 'center' }} onClick={() => handleRotateGlyph(180)} title="Turn 180°">180°</button>
              <button className="btn-secondary" style={{ fontSize: '10px', padding: '4px 2px', justifyContent: 'center' }} onClick={() => handleRotateGlyph(15)} title="Nudge +15°">↻ +15°</button>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
              <button className="btn-secondary" style={{ flex: 1, fontSize: '10px', padding: '4px 6px', justifyContent: 'center' }} onClick={() => handleFlipGlyph('horizontal')} title="Mirror horizontally">Flip ⇄</button>
              <button className="btn-secondary" style={{ flex: 1, fontSize: '10px', padding: '4px 6px', justifyContent: 'center' }} onClick={() => handleFlipGlyph('vertical')} title="Mirror vertically">Flip ⇅</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Angle:</span>
              <input
                type="number"
                value={customRotationAngle}
                onChange={(e) => setCustomRotationAngle(Number(e.target.value))}
                style={{ width: '50px', fontSize: '11px', padding: '2px 4px' }}
                placeholder="deg"
              />
              <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>°</span>
              <button
                className="btn-primary"
                style={{ flex: 1, fontSize: '10px', padding: '3px 8px', justifyContent: 'center' }}
                onClick={() => handleRotateGlyph(customRotationAngle)}
              >
                Apply Rotate
              </button>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />

          {/* Typographic Stylization: Stem Weight & Italic Slant */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)' }}>Typographic Stylization</span>
              {(stemWeight !== 0 || italicSlant !== 0) && (
                <button
                  className="btn-secondary"
                  onClick={handleResetStylize}
                  style={{ fontSize: '9px', padding: '1px 5px', color: 'var(--accent)' }}
                  title="Reset Stem Weight and Italic Slant to 0"
                >
                  Reset Style
                </button>
              )}
            </div>

            {/* 1. Stem Weight (Bold / Light) */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Stem Weight (Bold / Light)</label>
                <span style={{ fontSize: '10px', fontWeight: 600, color: stemWeight !== 0 ? '#f59e0b' : 'var(--text-faint)', fontFamily: 'monospace' }}>
                  {stemWeight > 0 ? `+${stemWeight}` : stemWeight} u
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="range"
                  min="-30"
                  max="50"
                  step="1"
                  value={stemWeight}
                  onChange={(e) => handleStemWeightChange(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  min="-30"
                  max="50"
                  value={stemWeight}
                  onChange={(e) => handleStemWeightChange(Number(e.target.value))}
                  style={{ width: '46px', fontSize: '11px', padding: '2px 4px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '2px', marginTop: '3px' }}>
                <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => handleStemWeightChange(-10)} title="-10 units (Light)">-10 Light</button>
                <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => handleStemWeightChange(0)} title="0 (Reset)">0</button>
                <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => handleStemWeightChange(10)} title="+10 units (Medium)">+10 Med</button>
                <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => handleStemWeightChange(25)} title="+25 units (Bold)">+25 Bold</button>
              </div>
            </div>

            {/* 2. Italic Slant (Oblique / Cursive Shear) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Italic Slant (Cursive Shear)</label>
                <span style={{ fontSize: '10px', fontWeight: 600, color: italicSlant !== 0 ? '#38bdf8' : 'var(--text-faint)', fontFamily: 'monospace' }}>
                  {italicSlant > 0 ? `+${italicSlant}°` : `${italicSlant}°`}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="range"
                  min="-25"
                  max="25"
                  step="1"
                  value={italicSlant}
                  onChange={(e) => handleItalicSlantChange(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  min="-25"
                  max="25"
                  value={italicSlant}
                  onChange={(e) => handleItalicSlantChange(Number(e.target.value))}
                  style={{ width: '46px', fontSize: '11px', padding: '2px 4px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '2px', marginTop: '3px' }}>
                <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => handleItalicSlantChange(-10)} title="-10° (Backslant)">-10° Back</button>
                <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => handleItalicSlantChange(0)} title="0° (Upright)">0° Upright</button>
                <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => handleItalicSlantChange(8)} title="+8° (Gentle Italic)">+8°</button>
                <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => handleItalicSlantChange(12)} title="+12° (True Italic)">+12° Italic</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
