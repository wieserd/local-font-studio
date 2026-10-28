import React from 'react';
import { Glyph } from '../../types/font';

interface GlyphRosterPreviewProps {
  assignedGlyphsList: Glyph[];
  darkBg: boolean;
  handleNavigateToChar: (char: string) => void;
}

export const GlyphRosterPreview: React.FC<GlyphRosterPreviewProps> = ({
  assignedGlyphsList,
  darkBg,
  handleNavigateToChar
}) => {
  if (assignedGlyphsList.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-faint)', fontSize: '13px' }}>
        No glyphs have been assigned yet. Import artwork or draw glyphs in the editor first!
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
      gap: '12px'
    }}>
      {assignedGlyphsList.map((g) => (
        <div
          key={g.char}
          onClick={() => handleNavigateToChar(g.char)}
          style={{
            backgroundColor: darkBg ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '10px 6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'transform 0.1s, border-color 0.1s'
          }}
          title={`Edit glyph '${g.char}' in editor`}
        >
          <div style={{ width: '48px', height: '48px', position: 'relative', overflow: 'hidden' }}>
            <svg width="48" height="48" viewBox="0 0 1000 1000">
              <g transform="translate(0, 800) scale(1, -1)">
                <path d={g.svgPath} fill={darkBg ? '#f8fafc' : '#0f172a'} />
              </g>
            </svg>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700 }}>{g.char}</span>
          <span style={{ fontSize: '9px', color: 'var(--text-faint)' }}>Adv: {g.advanceWidth}</span>
        </div>
      ))}
    </div>
  );
};
