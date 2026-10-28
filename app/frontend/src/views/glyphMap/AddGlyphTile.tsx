import React from 'react';
import { Plus } from 'lucide-react';

interface AddGlyphTileProps {
  onClick: () => void;
}

export const AddGlyphTile: React.FC<AddGlyphTileProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        height: '115px',
        backgroundColor: 'rgba(99, 102, 241, 0.04)',
        border: '2px dashed rgba(99, 102, 241, 0.35)',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '8px 6px',
        cursor: 'pointer',
        color: 'var(--accent)',
        userSelect: 'none',
        transition: 'all 0.15s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.12)';
        e.currentTarget.style.transform = 'scale(1.03)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.35)';
        e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.04)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      title="Add more glyphs or language presets to this typeface"
    >
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: 'var(--accent)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)'
      }}>
        <Plus size={18} strokeWidth={2.5} />
      </div>
      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-main)' }}>
        Add Glyph
      </div>
      <div style={{ fontSize: '9px', color: 'var(--text-faint)' }}>
        + More characters
      </div>
    </div>
  );
};
