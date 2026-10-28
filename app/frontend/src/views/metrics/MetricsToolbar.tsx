import React from 'react';
import {
  Columns,
  Type,
  Table,
  MoveVertical,
  Crosshair,
  Sparkles,
  AlignCenter,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { ViewMode } from './types';

export interface MetricsToolbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  showGuidelines: boolean;
  setShowGuidelines: (v: boolean) => void;
  onOpenAutoSpaceModal: () => void;
  onAutoCenterActiveChar?: () => void;
  activeChar?: string;
  canvasFontSize: number;
  setCanvasFontSize: React.Dispatch<React.SetStateAction<number>>;
}

export const MetricsToolbar: React.FC<MetricsToolbarProps> = ({
  viewMode,
  setViewMode,
  showGuidelines,
  setShowGuidelines,
  onOpenAutoSpaceModal,
  onAutoCenterActiveChar,
  activeChar,
  canvasFontSize,
  setCanvasFontSize
}) => {
  const handleZoomIn = () => {
    setCanvasFontSize(prev => Math.min(144, prev + 12));
  };

  const handleZoomOut = () => {
    setCanvasFontSize(prev => Math.max(36, prev - 12));
  };

  const handleZoomReset = () => {
    setCanvasFontSize(72);
  };

  return (
    <div
      style={{
        width: '48px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 0',
        gap: '6px',
        flexShrink: 0,
        zIndex: 5
      }}
    >
      {/* 1. VIEW MODES GROUP */}
      <button
        onClick={() => setViewMode('split')}
        aria-label="Split View (Rhythm Canvas + Table)"
        title="Split View (Rhythm Canvas + Table)"
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: viewMode === 'split' ? 'var(--accent)' : 'transparent',
          color: viewMode === 'split' ? '#fff' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.15s, color 0.15s'
        }}
      >
        <Columns size={16} />
      </button>

      <button
        onClick={() => setViewMode('string')}
        aria-label="Rhythm String Canvas"
        title="Rhythm String Canvas"
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: viewMode === 'string' ? 'var(--accent)' : 'transparent',
          color: viewMode === 'string' ? '#fff' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.15s, color 0.15s'
        }}
      >
        <Type size={16} />
      </button>

      <button
        onClick={() => setViewMode('table')}
        aria-label="Metrics Grid Table"
        title="Metrics Grid Table"
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: viewMode === 'table' ? 'var(--accent)' : 'transparent',
          color: viewMode === 'table' ? '#fff' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.15s, color 0.15s'
        }}
      >
        <Table size={16} />
      </button>

      <button
        onClick={() => setViewMode('vertical')}
        aria-label="Vertical Heights & Metrics"
        title="Vertical Heights & Metrics Specimen"
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: viewMode === 'vertical' ? 'var(--accent)' : 'transparent',
          color: viewMode === 'vertical' ? '#fff' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.15s, color 0.15s'
        }}
      >
        <MoveVertical size={16} />
      </button>

      <div style={{ width: '26px', height: '1px', backgroundColor: 'var(--border)', margin: '4px 0' }} />

      {/* 2. SPECIMEN & SPACING ASSISTANTS */}
      <button
        onClick={() => setShowGuidelines(!showGuidelines)}
        aria-label="Toggle Metric Guidelines"
        title={showGuidelines ? 'Guidelines: Visible (Click to Hide)' : 'Guidelines: Hidden (Click to Show)'}
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: showGuidelines ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
          color: showGuidelines ? 'var(--accent)' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.15s, color 0.15s'
        }}
      >
        <Crosshair size={16} />
      </button>

      <button
        onClick={onOpenAutoSpaceModal}
        aria-label="Optical Auto-Spacing Wizard"
        title="Optical Auto-Spacing Wizard (Calculate Silhouette Spacing)"
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: 'transparent',
          color: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.15s, transform 0.15s'
        }}
      >
        <Sparkles size={16} />
      </button>

      {onAutoCenterActiveChar && (
        <button
          onClick={onAutoCenterActiveChar}
          aria-label="Symmetrically Balance Margins (LSB = RSB)"
          title={activeChar ? `Auto-Center '${activeChar}' (Balance LSB & RSB)` : 'Auto-Center Selected Glyph'}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s'
          }}
        >
          <AlignCenter size={16} />
        </button>
      )}

      <div style={{ width: '26px', height: '1px', backgroundColor: 'var(--border)', margin: '4px 0' }} />

      {/* 3. SPECIMEN SIZING & ZOOM */}
      <button
        onClick={handleZoomIn}
        disabled={canvasFontSize >= 144}
        aria-label="Increase Specimen Font Size"
        title={`Zoom In Specimen (${canvasFontSize}px → ${Math.min(144, canvasFontSize + 12)}px)`}
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: 'transparent',
          color: canvasFontSize >= 144 ? 'var(--text-faint)' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: canvasFontSize >= 144 ? 'not-allowed' : 'pointer'
        }}
      >
        <ZoomIn size={16} />
      </button>

      <button
        onClick={handleZoomOut}
        disabled={canvasFontSize <= 36}
        aria-label="Decrease Specimen Font Size"
        title={`Zoom Out Specimen (${canvasFontSize}px → ${Math.max(36, canvasFontSize - 12)}px)`}
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: 'transparent',
          color: canvasFontSize <= 36 ? 'var(--text-faint)' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: canvasFontSize <= 36 ? 'not-allowed' : 'pointer'
        }}
      >
        <ZoomOut size={16} />
      </button>

      {canvasFontSize !== 72 && (
        <button
          onClick={handleZoomReset}
          aria-label="Reset Specimen Size to 72px"
          title={`Reset Specimen Size to 72px (Currently ${canvasFontSize}px)`}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <RotateCcw size={14} />
        </button>
      )}
    </div>
  );
};
