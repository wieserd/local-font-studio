import React from 'react';
import { Columns, Type, Table, MoveVertical } from 'lucide-react';
import { ViewMode } from './types';

interface MetricsTopBarProps {
  viewMode: ViewMode;
  setViewMode?: (mode: ViewMode) => void;
  assignedCount: number;
  allCount: number;
  canvasFontSize?: number;
}

export const MetricsTopBar: React.FC<MetricsTopBarProps> = ({
  viewMode,
  assignedCount,
  allCount,
  canvasFontSize
}) => {
  const getModeInfo = () => {
    switch (viewMode) {
      case 'split':
        return {
          icon: <Columns size={14} color="var(--accent)" />,
          title: 'METRICS · SPLIT WORKSPACE',
          desc: 'Rhythm string editor with simultaneous glyph metrics table'
        };
      case 'string':
        return {
          icon: <Type size={14} color="var(--accent)" />,
          title: 'METRICS · RHYTHM CANVAS',
          desc: 'Full-width text string testing with on-canvas margin dragging'
        };
      case 'table':
        return {
          icon: <Table size={14} color="var(--accent)" />,
          title: 'METRICS · GLYPH TABLE',
          desc: 'Numeric advance width, LSB & RSB batch calibration table'
        };
      case 'vertical':
        return {
          icon: <MoveVertical size={14} color="var(--accent)" />,
          title: 'METRICS · VERTICAL HEIGHTS',
          desc: 'Ascender, Cap Height, X-Height, Baseline & Descender alignment'
        };
    }
  };

  const modeInfo = getModeInfo();

  return (
    <div style={{
      height: '40px',
      backgroundColor: 'rgba(19, 23, 34, 0.85)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
      zIndex: 4
    }}>
      {/* Active Mode Heading */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {modeInfo.icon}
        <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--accent)', letterSpacing: '0.04em' }}>
          {modeInfo.title}
        </span>
        <span style={{ color: 'var(--text-faint)', fontSize: '11px', marginLeft: '4px' }}>
          • {modeInfo.desc}
        </span>
      </div>

      {/* Right Stats & Specimen Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {canvasFontSize && (viewMode === 'split' || viewMode === 'string') && (
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-main)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
            Specimen: <strong style={{ color: 'var(--accent)' }}>{canvasFontSize}px</strong>
          </span>
        )}

        <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
          {assignedCount} of {allCount} glyphs assigned
        </span>
      </div>
    </div>
  );
};
