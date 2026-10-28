import React from 'react';
import { MoveHorizontal, ArrowLeftRight, Eye, EyeOff } from 'lucide-react';

interface KerningSubheaderProps {
  leftChar: string;
  rightChar: string;
  kerningValue: number;
  zoom: number;
  showGuidelines: boolean;
  setShowGuidelines: (v: boolean) => void;
  onSwapPair?: () => void;
  pairsCount: number;
}

export const KerningSubheader: React.FC<KerningSubheaderProps> = ({
  leftChar,
  rightChar,
  kerningValue,
  zoom,
  showGuidelines,
  setShowGuidelines,
  onSwapPair,
  pairsCount
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
        flexShrink: 0,
        zIndex: 10,
        gap: '12px'
      }}
    >
      {/* Left: Section Title & Pair Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MoveHorizontal size={14} style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Kerning Matrix
          </span>
        </div>

        <span style={{ color: 'var(--text-faint)', fontSize: '11px' }}>
          Active Pair: <strong style={{ color: 'var(--text-main)' }}>{leftChar}{rightChar}</strong> ({leftChar} / {rightChar}) • Offset: <strong style={{ color: kerningValue !== 0 ? (kerningValue < 0 ? '#38bdf8' : '#f59e0b') : 'var(--text-muted)' }}>{kerningValue > 0 ? `+${kerningValue}` : kerningValue} units</strong>
        </span>

        <span
          style={{
            fontSize: '10px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            padding: '1px 6px',
            borderRadius: '4px',
            color: 'var(--text-muted)'
          }}
        >
          {pairsCount} configured {pairsCount === 1 ? 'pair' : 'pairs'}
        </span>
      </div>

      {/* Right: Controls (Guidelines, Swap, Zoom) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onSwapPair && (
          <button
            className="btn-secondary"
            onClick={onSwapPair}
            style={{ fontSize: '11px', padding: '3px 8px', gap: '4px', height: '24px' }}
            title="Swap pair characters (e.g. AV -> VA)"
          >
            <ArrowLeftRight size={11} />
            <span>Swap Pair</span>
          </button>
        )}

        <button
          className="btn-secondary"
          onClick={() => setShowGuidelines(!showGuidelines)}
          style={{
            fontSize: '11px',
            padding: '3px 8px',
            gap: '4px',
            height: '24px',
            backgroundColor: showGuidelines ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            borderColor: showGuidelines ? 'var(--accent)' : 'var(--border)'
          }}
          title="Toggle font baseline, x-height and sidebearing guidelines"
        >
          {showGuidelines ? <Eye size={11} /> : <EyeOff size={11} />}
          <span>Guides</span>
        </button>

        <span style={{ color: 'var(--text-faint)', fontSize: '10px', backgroundColor: 'var(--bg-main)', padding: '2px 6px', borderRadius: '4px' }}>
          Zoom: {zoom}%
        </span>
      </div>
    </div>
  );
};
