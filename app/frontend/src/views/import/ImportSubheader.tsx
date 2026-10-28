import React from 'react';
import { FileImage, CheckCircle2, ArrowRight, Layers } from 'lucide-react';

interface ImportSubheaderProps {
  loadedImg: HTMLImageElement | null;
  boxCount: number;
  nextTargetChar: string;
  zoom: number;
  onImportComplete?: () => void;
  successMsg?: string | null;
}

export const ImportSubheader: React.FC<ImportSubheaderProps> = ({
  loadedImg,
  boxCount,
  nextTargetChar,
  zoom,
  onImportComplete,
  successMsg
}) => {
  return (
    <div
      style={{
        height: '40px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        zIndex: 10,
        flexShrink: 0,
        gap: '12px'
      }}
    >
      {/* Left: Artwork Info & Next Target */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: loadedImg ? 'var(--text-main)' : 'var(--text-muted)' }}>
          <FileImage size={14} style={{ color: loadedImg ? 'var(--accent)' : 'var(--text-faint)' }} />
          <span style={{ fontWeight: 600 }}>
            {loadedImg ? `${loadedImg.width} × ${loadedImg.height} px` : 'No artwork loaded'}
          </span>
        </div>

        {loadedImg && (
          <span
            style={{
              fontSize: '10.5px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              padding: '2px 7px',
              borderRadius: '4px',
              color: 'var(--text-muted)'
            }}
          >
            {boxCount} {boxCount === 1 ? 'box' : 'boxes'} placed
          </span>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: 'var(--text-faint)' }}>Next Character:</span>
          <span
            style={{
              fontWeight: 700,
              fontSize: '12px',
              color: 'var(--accent)',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid var(--accent)',
              padding: '1px 6px',
              borderRadius: '4px'
            }}
          >
            {nextTargetChar}
          </span>
        </div>
      </div>

      {/* Right: Success Toast / Completion Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {successMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontWeight: 500 }}>
            <CheckCircle2 size={13} />
            <span>{successMsg}</span>
          </div>
        )}

        <span style={{ color: 'var(--text-faint)', fontSize: '10px', backgroundColor: 'var(--bg-main)', padding: '2px 6px', borderRadius: '4px' }}>
          Zoom: {Math.round(zoom * 100)}%
        </span>

        {onImportComplete && boxCount > 0 && (
          <button
            className="btn-primary"
            onClick={onImportComplete}
            style={{ fontSize: '11px', padding: '3px 10px', height: '26px', gap: '5px' }}
          >
            <span>Finish & Open Glyph Map</span>
            <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
};
