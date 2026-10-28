import React from 'react';
import { ChevronDown, ChevronRight, Ruler, Check, Upload, Download } from 'lucide-react';

interface MetricsSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  glyphChar: string;
  advanceWidth: number;
  setAdvanceWidth: (val: number) => void;
  lsb: number;
  setLsb: (val: number) => void;
  rsb: number;
  setRsb: (val: number) => void;
  handleSaveMetrics?: () => void;
  savedToast?: boolean;
  handleOpenImportDialog: () => void;
  handleExportSvg: () => void;
}

export const MetricsSection: React.FC<MetricsSectionProps> = ({
  isOpen,
  onToggle,
  glyphChar,
  advanceWidth,
  setAdvanceWidth,
  lsb,
  setLsb,
  rsb,
  setRsb,
  handleSaveMetrics,
  savedToast,
  handleOpenImportDialog,
  handleExportSvg
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
          {isOpen ? <ChevronDown size={14} color="var(--accent)" /> : <ChevronRight size={14} color="var(--text-muted)" />}
          <Ruler size={13} color="var(--accent)" />
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            1. Metrics & Spacing
          </span>
        </div>
        <span className="badge badge-gray" style={{ fontSize: '9px' }}>
          {advanceWidth} units
        </span>
      </div>

      {isOpen && (
        <div style={{ padding: '10px', backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                Advance Width
              </label>
              <input
                type="number"
                value={advanceWidth}
                onChange={(e) => setAdvanceWidth(Number(e.target.value))}
                style={{ width: '100%', fontSize: '12px', padding: '4px 6px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                Left Side Bearing (LSB)
              </label>
              <input
                type="number"
                value={lsb}
                onChange={(e) => setLsb(Number(e.target.value))}
                style={{ width: '100%', fontSize: '12px', padding: '4px 6px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
              Right Side Bearing (RSB)
            </label>
            <input
              type="number"
              value={rsb}
              onChange={(e) => setRsb(Number(e.target.value))}
              style={{ width: '100%', fontSize: '12px', padding: '4px 6px' }}
            />
          </div>

          {glyphChar !== ' ' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                className="btn-secondary"
                onClick={handleOpenImportDialog}
                style={{ justifyContent: 'center', gap: '5px', fontSize: '10.5px', padding: '5px 8px' }}
                title={`Import an .svg file to replace glyph '${glyphChar}'`}
              >
                <Upload size={12} color="var(--accent)" />
                <span>Import .SVG</span>
              </button>
              <button
                className="btn-secondary"
                onClick={handleExportSvg}
                style={{ justifyContent: 'center', gap: '5px', fontSize: '10.5px', padding: '5px 8px' }}
                title={`Download '${glyphChar}' as an individual .svg vector file`}
              >
                <Download size={12} color="var(--accent)" />
                <span>Export .SVG</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
