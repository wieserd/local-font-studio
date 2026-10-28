import React from 'react';
import {
  MousePointer,
  Image as ImageIcon,
  PenTool,
  Scissors,
  RotateCw,
  Move,
  Undo2,
  Redo2,
  RotateCcw,
  AlignCenter,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { EditorTool } from './types';

interface EditorToolbarProps {
  activeTool: EditorTool;
  setActiveTool: (tool: EditorTool) => void;
  onClearSelectedPoint: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onResetPosition: () => void;
  onCenterGlyph: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  activeTool,
  setActiveTool,
  onClearSelectedPoint,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onResetPosition,
  onCenterGlyph,
  onZoomIn,
  onZoomOut
}) => {
  const tools: Array<{ id: EditorTool; icon: React.ReactNode; title: string }> = [
    { id: 'select', icon: <MousePointer size={16} />, title: 'Select & Move Glyph (V)' },
    { id: 'move-bitmap', icon: <ImageIcon size={16} />, title: 'Move & Resize Bitmap Overlay (B)' },
    { id: 'pen', icon: <PenTool size={16} />, title: 'Pen Tool: Click point to connect & add (P)' },
    { id: 'node', icon: <Move size={16} />, title: 'Edit & Move Nodes (A)' },
    { id: 'knife', icon: <Scissors size={16} />, title: 'Knife / Cut Contour (C)' },
    { id: 'rotate', icon: <RotateCw size={16} />, title: 'Rotate Glyph (R)' },
  ];

  return (
    <div style={{
      width: '48px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '10px 0',
      gap: '6px',
      flexShrink: 0
    }}>
      {tools.map((tool) => (
        <button
          key={tool.id}
          title={tool.title}
          onClick={() => {
            setActiveTool(tool.id);
            if (tool.id !== 'node' && tool.id !== 'pen') {
              onClearSelectedPoint();
            }
          }}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: activeTool === tool.id ? 'var(--accent)' : 'transparent',
            color: activeTool === tool.id ? '#fff' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.15s'
          }}
        >
          {tool.icon}
        </button>
      ))}

      <div style={{ width: '24px', height: '1px', backgroundColor: 'var(--border)', margin: '6px 0' }} />

      <button
        className="btn-ghost"
        title="Undo (Ctrl+Z)"
        onClick={onUndo}
        disabled={!canUndo}
        style={{ opacity: !canUndo ? 0.35 : 1 }}
      >
        <Undo2 size={16} />
      </button>
      <button
        className="btn-ghost"
        title="Redo (Ctrl+Shift+Z)"
        onClick={onRedo}
        disabled={!canRedo}
        style={{ opacity: !canRedo ? 0.35 : 1 }}
      >
        <Redo2 size={16} />
      </button>

      <div style={{ width: '24px', height: '1px', backgroundColor: 'var(--border)', margin: '4px 0' }} />

      <button className="btn-ghost" title="Reset Position (0, 0)" onClick={onResetPosition}>
        <RotateCcw size={16} />
      </button>
      <button className="btn-ghost" title="Center Horizontally" onClick={onCenterGlyph}>
        <AlignCenter size={16} />
      </button>
      <button className="btn-ghost" title="Zoom In" onClick={onZoomIn}>
        <ZoomIn size={16} />
      </button>
      <button className="btn-ghost" title="Zoom Out" onClick={onZoomOut}>
        <ZoomOut size={16} />
      </button>
    </div>
  );
};
