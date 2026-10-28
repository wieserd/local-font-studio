import React from 'react';

interface PreviewControlsProps {
  fontSize: number;
  setFontSize: (val: number) => void;
  lineHeight: number;
  setLineHeight: (val: number) => void;
  letterSpacing: number;
  setLetterSpacing: (val: number) => void;
  enableKerning: boolean;
  setEnableKerning: (val: boolean) => void;
  showGuides: boolean;
  setShowGuides: (val: boolean) => void;
  highlightMissing: boolean;
  setHighlightMissing: (val: boolean) => void;
  compareWithSystem: boolean;
  setCompareWithSystem: (val: boolean) => void;
}

export const PreviewControls: React.FC<PreviewControlsProps> = ({
  fontSize,
  setFontSize,
  lineHeight,
  setLineHeight,
  letterSpacing,
  setLetterSpacing,
  enableKerning,
  setEnableKerning,
  showGuides,
  setShowGuides,
  highlightMissing,
  setHighlightMissing,
  compareWithSystem,
  setCompareWithSystem
}) => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      padding: '8px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      {/* Sliders */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {/* Size */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Size:</span>
          <input
            type="range"
            min="14"
            max="120"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            style={{ width: '85px' }}
          />
          <span style={{ fontSize: '11px', width: '36px', fontWeight: 600 }}>{fontSize}px</span>
        </div>

        {/* Leading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Leading:</span>
          <input
            type="range"
            min="0.9"
            max="2.4"
            step="0.1"
            value={lineHeight}
            onChange={(e) => setLineHeight(Number(e.target.value))}
            style={{ width: '70px' }}
          />
          <span style={{ fontSize: '11px', width: '28px', fontWeight: 600 }}>{lineHeight}</span>
        </div>

        {/* Tracking / Letter Spacing */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tracking:</span>
          <input
            type="range"
            min="-10"
            max="30"
            value={letterSpacing}
            onChange={(e) => setLetterSpacing(Number(e.target.value))}
            style={{ width: '70px' }}
          />
          <span style={{ fontSize: '11px', width: '32px', fontWeight: 600 }}>
            {letterSpacing > 0 ? `+${letterSpacing}` : letterSpacing}px
          </span>
          {letterSpacing !== 0 && (
            <button
              onClick={() => setLetterSpacing(0)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                fontSize: '10px',
                cursor: 'pointer',
                padding: 0
              }}
              title="Reset tracking"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Feature Toggles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={enableKerning}
            onChange={(e) => setEnableKerning(e.target.checked)}
          />
          <span>OpenType Kerning</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showGuides}
            onChange={(e) => setShowGuides(e.target.checked)}
          />
          <span>Metric Guides</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={highlightMissing}
            onChange={(e) => setHighlightMissing(e.target.checked)}
          />
          <span>Highlight Missing Glyphs</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={compareWithSystem}
            onChange={(e) => setCompareWithSystem(e.target.checked)}
          />
          <span>Compare Reference Font</span>
        </label>
      </div>
    </div>
  );
};
