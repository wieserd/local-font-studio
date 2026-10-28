import React from 'react';
import { ChevronDown, ChevronRight, Sparkles, Wand2, Info } from 'lucide-react';

interface CurvesSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  smoothStrength: number;
  setSmoothStrength: (val: number) => void;
  smoothIterations: number;
  setSmoothIterations: (val: number) => void;
  preserveSharpCorners: boolean;
  setPreserveSharpCorners: (val: boolean) => void;
  cornerThreshold: number;
  setCornerThreshold: (val: number) => void;
  smoothToast: string | null;
  handleSmoothContours: (subdivide: boolean, selectedPointOnly: boolean) => void;
  selectedPoint: { contourIndex: number; pointIndex: number } | null;
  handleTriggerScaffolding: (feature: string) => void;
}

export const CurvesSection: React.FC<CurvesSectionProps> = ({
  isOpen,
  onToggle,
  smoothStrength,
  setSmoothStrength,
  smoothIterations,
  setSmoothIterations,
  preserveSharpCorners,
  setPreserveSharpCorners,
  cornerThreshold,
  setCornerThreshold,
  smoothToast,
  handleSmoothContours,
  selectedPoint,
  handleTriggerScaffolding
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
          {isOpen ? <ChevronDown size={14} color="#a78bfa" /> : <ChevronRight size={14} color="var(--text-muted)" />}
          <Sparkles size={13} color="#a78bfa" />
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            3. Curves & Outlines
          </span>
        </div>
        {smoothToast ? (
          <span style={{ fontSize: '9px', color: '#34d399', fontWeight: 600 }}>{smoothToast}</span>
        ) : (
          <span className="badge badge-gray" style={{ fontSize: '9px' }}>{Math.round(smoothStrength * 100)}%</span>
        )}
      </div>

      {isOpen && (
        <div style={{ padding: '10px', backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Smoothing Strength</label>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#a78bfa' }}>{Math.round(smoothStrength * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={smoothStrength}
              onChange={(e) => setSmoothStrength(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Iterations:</span>
            <div style={{ display: 'flex', gap: '3px' }}>
              {[1, 2, 3, 5].map(it => (
                <button
                  key={it}
                  type="button"
                  className="btn-secondary"
                  style={{
                    padding: '2px 6px',
                    fontSize: '9px',
                    backgroundColor: smoothIterations === it ? 'rgba(167, 139, 250, 0.25)' : undefined,
                    borderColor: smoothIterations === it ? '#a78bfa' : undefined,
                    color: smoothIterations === it ? '#fff' : undefined,
                  }}
                  onClick={() => setSmoothIterations(it)}
                >
                  {it}x
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '6px 8px', backgroundColor: 'var(--bg-main)', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '10.5px' }}>
              <input
                type="checkbox"
                checked={preserveSharpCorners}
                onChange={(e) => setPreserveSharpCorners(e.target.checked)}
              />
              <span style={{ fontWeight: 500 }}>Preserve Sharp Corners</span>
            </label>

            {preserveSharpCorners && (
              <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-faint)' }}>Corner Cutoff Angle:</span>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)' }}>{cornerThreshold}°</span>
                </div>
                <input
                  type="range"
                  min="45"
                  max="110"
                  step="5"
                  value={cornerThreshold}
                  onChange={(e) => setCornerThreshold(Number(e.target.value))}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              className="btn-primary"
              onClick={() => handleSmoothContours(false, false)}
              style={{ width: '100%', fontSize: '10.5px', padding: '5px 10px', justifyContent: 'center', gap: '6px', backgroundColor: '#7c3aed', borderColor: '#7c3aed' }}
            >
              <Sparkles size={12} />
              <span>Smooth Whole Glyph ✨</span>
            </button>

            <button
              className="btn-secondary"
              onClick={() => handleSmoothContours(true, false)}
              style={{ width: '100%', fontSize: '10px', padding: '4px 8px', justifyContent: 'center', gap: '5px' }}
            >
              <span>Subdivide & Round (Chaikin)</span>
            </button>

            {selectedPoint && (
              <button
                className="btn-secondary"
                onClick={() => handleSmoothContours(false, true)}
                style={{ width: '100%', fontSize: '10px', padding: '4px 8px', justifyContent: 'center', gap: '5px', color: 'var(--accent)' }}
              >
                <Wand2 size={12} />
                <span>Smooth Around Selected Point</span>
              </button>
            )}
          </div>

          {/* Scaffolding: Simplify & Stroke Expander */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '9.5px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Info size={11} color="var(--accent)" />
              <span>Outline Tools (Scaffolding)</span>
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              <button
                className="btn-secondary"
                onClick={() => handleTriggerScaffolding('Simplify Path (Point Reduction)')}
                style={{ fontSize: '9.5px', padding: '3px 4px', justifyContent: 'center', opacity: 0.85 }}
                title="Reduce redundant point density while preserving contour shape"
              >
                <span>Simplify Nodes</span>
              </button>
              <button
                className="btn-secondary"
                onClick={() => handleTriggerScaffolding('Expand Stroke / Outline Weight')}
                style={{ fontSize: '9.5px', padding: '3px 4px', justifyContent: 'center', opacity: 0.85 }}
                title="Offset contour to add uniform weight/thickness"
              >
                <span>Expand Weight</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
