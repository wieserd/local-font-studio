import React, { useState } from 'react';
import { X, Plus, Sparkles, Layers, ArrowRight } from 'lucide-react';
import { Glyph, FontMetrics } from '../../types/font';

interface AddKerningPairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPair: (left: string, right: string, value: number) => void;
  glyphs: Record<string, Glyph>;
  metrics: FontMetrics;
  existingPairs: Array<{ left: string; right: string; value: number }>;
}

const COMMON_PRESETS = [
  { left: 'A', right: 'V', value: -60 },
  { left: 'A', right: 'W', value: -45 },
  { left: 'A', right: 'Y', value: -55 },
  { left: 'T', right: 'a', value: -40 },
  { left: 'T', right: 'o', value: -45 },
  { left: 'T', right: 'e', value: -35 },
  { left: 'W', right: 'a', value: -30 },
  { left: 'W', right: 'e', value: -25 },
  { left: 'Y', right: 'o', value: -55 },
  { left: 'F', right: 'A', value: -35 },
  { left: 'L', right: 'T', value: -50 },
  { left: 'P', right: 'A', value: -40 },
  { left: 'V', right: 'A', value: -60 },
  { left: 'V', right: 'o', value: -40 },
  { left: 'A', right: '.', value: -50 },
  { left: 'T', right: '.', value: -60 },
];

export const AddKerningPairModal: React.FC<AddKerningPairModalProps> = ({
  isOpen,
  onClose,
  onAddPair,
  glyphs,
  metrics,
  existingPairs
}) => {
  const [leftChar, setLeftChar] = useState('A');
  const [rightChar, setRightChar] = useState('V');
  const [value, setValue] = useState(-50);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const leftGlyph = glyphs[leftChar];
  const rightGlyph = glyphs[rightChar];

  const upm = metrics.upm || 1000;
  const ascender = metrics.ascender || 800;
  const descender = metrics.descender || -200;
  const totalHeight = ascender - descender;

  // Mini preview scale
  const previewHeight = 90;
  const scale = previewHeight / totalHeight;
  const baselineY = ascender * scale;

  const leftAdv = (leftGlyph?.advanceWidth || metrics.defaultAdvance || 600) * scale;
  const rightAdv = (rightGlyph?.advanceWidth || metrics.defaultAdvance || 600) * scale;
  const kernOffset = value * scale;

  const handlePresetClick = (preset: typeof COMMON_PRESETS[0]) => {
    setLeftChar(preset.left);
    setRightChar(preset.right);
    setValue(preset.value);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leftChar || !rightChar) {
      setErrorMsg('Please specify both left and right characters.');
      return;
    }

    const alreadyExists = existingPairs.some(p => p.left === leftChar && p.right === rightChar);
    if (alreadyExists) {
      setErrorMsg(`Pair "${leftChar}${rightChar}" already exists. Submitting will update its value.`);
    }

    onAddPair(leftChar, rightChar, value);
    onClose();
  };

  // Assigned glyphs available for selection
  const assignedList = Object.values(glyphs).filter(g => g.isAssigned);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        width: '560px',
        maxWidth: '94vw',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Plus size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Add Kerning Pair</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-faint)', margin: '2px 0 0 0' }}>
                Create contextual spacing between two glyphs (GPOS)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ width: '28px', height: '28px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick presets */}
          <div>
            <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-faint)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Quick Presets
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {COMMON_PRESETS.map((p) => {
                const isSelected = leftChar === p.left && rightChar === p.right;
                return (
                  <button
                    key={`${p.left}:${p.right}`}
                    type="button"
                    onClick={() => handlePresetClick(p)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '5px',
                      border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'var(--accent)' : 'var(--bg-surface)',
                      color: isSelected ? '#fff' : 'var(--text-main)',
                      cursor: 'pointer'
                    }}
                  >
                    {p.left}{p.right} ({p.value})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Glyph Pair inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {/* Left Glyph */}
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Left Glyph
              </label>
              <input
                type="text"
                maxLength={2}
                value={leftChar}
                onChange={(e) => {
                  setLeftChar(e.target.value.slice(0, 1));
                  setErrorMsg(null);
                }}
                placeholder="e.g. A"
                style={{
                  width: '100%',
                  fontSize: '18px',
                  fontWeight: 700,
                  textAlign: 'center',
                  padding: '8px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--text-main)'
                }}
              />
            </div>

            {/* Right Glyph */}
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Right Glyph
              </label>
              <input
                type="text"
                maxLength={2}
                value={rightChar}
                onChange={(e) => {
                  setRightChar(e.target.value.slice(0, 1));
                  setErrorMsg(null);
                }}
                placeholder="e.g. V"
                style={{
                  width: '100%',
                  fontSize: '18px',
                  fontWeight: 700,
                  textAlign: 'center',
                  padding: '8px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--text-main)'
                }}
              />
            </div>

            {/* Kerning Value */}
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Kerning Value
              </label>
              <input
                type="number"
                step={5}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                style={{
                  width: '100%',
                  fontSize: '16px',
                  fontWeight: 700,
                  textAlign: 'center',
                  padding: '9px 8px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: value < 0 ? '#818cf8' : '#34d399'
                }}
              />
            </div>
          </div>

          {/* Real Live Vector Preview Card */}
          <div style={{
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '130px'
          }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', marginBottom: '8px' }}>
              Live Vector Preview • {leftChar || '?'}{rightChar || '?'} ({value} units)
            </div>

            {/* SVG canvas */}
            <svg
              width="240"
              height={previewHeight}
              style={{ overflow: 'visible', margin: '0 auto' }}
            >
              {/* Baseline guideline */}
              <line
                x1="-30"
                y1={baselineY}
                x2="270"
                y2={baselineY}
                stroke="rgba(16, 185, 129, 0.4)"
                strokeWidth="1"
              />

              {/* Left glyph vector */}
              {leftGlyph?.svgPath ? (
                <g transform={`translate(40, ${baselineY}) scale(${scale}, ${-scale})`}>
                  <path d={leftGlyph.svgPath} fill="#f8fafc" />
                </g>
              ) : (
                <text x="50" y={baselineY - 10} fill="rgba(255,255,255,0.4)" fontSize="48" fontFamily="monospace">
                  {leftChar || '?'}
                </text>
              )}

              {/* Right glyph vector with kerning offset */}
              {rightGlyph?.svgPath ? (
                <g transform={`translate(${40 + leftAdv + kernOffset}, ${baselineY}) scale(${scale}, ${-scale})`}>
                  <path d={rightGlyph.svgPath} fill="#f8fafc" />
                </g>
              ) : (
                <text x={40 + leftAdv + kernOffset + 10} y={baselineY - 10} fill="rgba(255,255,255,0.4)" fontSize="48" fontFamily="monospace">
                  {rightChar || '?'}
                </text>
              )}

              {/* Kerning gap indicator line */}
              <line
                x1={40 + leftAdv}
                y1={baselineY - 30}
                x2={40 + leftAdv + kernOffset}
                y2={baselineY - 30}
                stroke={value < 0 ? '#818cf8' : '#34d399'}
                strokeWidth="2"
              />
            </svg>
          </div>

          {errorMsg && (
            <div style={{ fontSize: '12px', color: '#f87171', padding: '6px 10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
              {errorMsg}
            </div>
          )}

          {/* Footer buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '8px 16px' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '8px 18px', gap: '6px' }}>
              <Plus size={14} />
              <span>Add Pair</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
