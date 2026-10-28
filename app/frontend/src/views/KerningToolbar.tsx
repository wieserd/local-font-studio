import React, { useState } from 'react';
import {
  MousePointer,
  MoveHorizontal,
  Layers,
  Sparkles,
  ArrowLeftRight,
  AlignJustify,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface KerningToolbarProps {
  activeTool?: string;
  setActiveTool?: (tool: string) => void;
  onSwapPair?: () => void;
  onResetZero?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onAutoKernPair?: () => void;
  onOpenClasses?: () => void;
  onFocusSpecimen?: () => void;
}

export const KerningToolbar: React.FC<KerningToolbarProps> = ({
  activeTool: propActiveTool,
  setActiveTool: propSetActiveTool,
  onSwapPair,
  onResetZero,
  onZoomIn,
  onZoomOut,
  onAutoKernPair,
  onOpenClasses,
  onFocusSpecimen
}) => {
  const [internalActiveTool, setInternalActiveTool] = useState<string>('select');
  const activeTool = propActiveTool || internalActiveTool;
  const setActiveTool = propSetActiveTool || setInternalActiveTool;

  const tools = [
    { id: 'select', name: 'Select Pair', icon: <MousePointer size={16} /> },
    { id: 'adjust', name: 'Contextual Spacing (Canvas)', icon: <MoveHorizontal size={16} /> },
    { id: 'classes', name: 'Kerning Classes (GPOS)', icon: <Layers size={16} />, action: onOpenClasses },
    { id: 'optical', name: 'Auto-Kerning Assistant', icon: <Sparkles size={16} />, action: onAutoKernPair },
    { id: 'swap', name: 'Swap Pair Order', icon: <ArrowLeftRight size={16} />, action: onSwapPair },
    { id: 'stream', name: 'Sentence Verification Specimen', icon: <AlignJustify size={16} />, action: onFocusSpecimen },
  ];

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
        flexShrink: 0
      }}
    >
      {tools.map((tool) => {
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            title={tool.action ? tool.name : "not yet implemented"}
            aria-label={tool.name}
            onClick={() => {
              setActiveTool(tool.id);
              if (tool.action) tool.action();
            }}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: isActive ? 'var(--accent)' : 'transparent',
              color: isActive ? '#fff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s'
            }}
          >
            {tool.icon}
          </button>
        );
      })}

      <div style={{ width: '24px', height: '1px', backgroundColor: 'var(--border)', margin: '6px 0' }} />

      <button
        className="btn-ghost"
        title={onResetZero ? "Reset Kerning to 0" : "not yet implemented"}
        aria-label="Reset Kerning"
        onClick={onResetZero}
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
          cursor: 'pointer'
        }}
      >
        <RotateCcw size={16} />
      </button>

      <button
        className="btn-ghost"
        title={onZoomIn ? "Zoom In (+20%)" : "Zoom In (not yet implemented)"}
        aria-label="Zoom In"
        onClick={onZoomIn}
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
          cursor: 'pointer'
        }}
      >
        <ZoomIn size={16} />
      </button>

      <button
        className="btn-ghost"
        title={onZoomOut ? "Zoom Out (-20%)" : "Zoom Out (not yet implemented)"}
        aria-label="Zoom Out"
        onClick={onZoomOut}
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
          cursor: 'pointer'
        }}
      >
        <ZoomOut size={16} />
      </button>
    </div>
  );
};
