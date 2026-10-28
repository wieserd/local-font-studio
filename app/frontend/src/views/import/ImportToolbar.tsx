import React from 'react';
import { 
  Sparkles, 
  Maximize2, 
  MousePointer, 
  Scaling, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  UploadCloud, 
  Trash2 
} from 'lucide-react';
import { ToolMode } from './types';

interface ImportToolbarProps {
  activeTool: ToolMode;
  setActiveTool: (tool: ToolMode) => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  onUploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  boxCount?: number;
  onClearBoxes?: () => void;
  hasArtwork?: boolean;
  onDeleteArtwork?: () => void;
}

export const ImportToolbar: React.FC<ImportToolbarProps> = ({
  activeTool,
  setActiveTool,
  zoom,
  setZoom,
  onUploadImage,
  boxCount = 0,
  onClearBoxes,
  hasArtwork = false,
  onDeleteArtwork,
}) => {
  const renderToolBtn = (tool: ToolMode, icon: React.ReactNode, title: string) => {
    const isActive = activeTool === tool;
    return (
      <button
        onClick={() => setActiveTool(tool)}
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isActive ? 'var(--accent)' : 'transparent',
          color: isActive ? '#ffffff' : 'var(--text-muted)',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          outline: 'none',
          boxShadow: isActive ? '0 2px 6px rgba(99, 102, 241, 0.4)' : 'none',
          padding: 0
        }}
        title={title}
        aria-label={title}
      >
        {icon}
      </button>
    );
  };

  const renderActionBtn = (icon: React.ReactNode, title: string, onClick: () => void, isDestructive = false) => {
    return (
      <button
        onClick={onClick}
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          color: isDestructive ? '#ef4444' : 'var(--text-muted)',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          outline: 'none',
          padding: 0
        }}
        title={title}
        aria-label={title}
      >
        {icon}
      </button>
    );
  };

  const renderDivider = () => (
    <div style={{ width: '24px', height: '1px', backgroundColor: 'var(--border)', margin: '4px 0' }} />
  );

  return (
    <div
      style={{
        width: '48px',
        height: '100%',
        backgroundColor: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 0',
        gap: '4px',
        flexShrink: 0,
        zIndex: 10
      }}
    >
      {/* Tool Group */}
      {renderToolBtn('snap', <Sparkles size={16} />, 'Smart Snap: Click any letter to auto-snap bounds')}
      {renderToolBtn('draw', <Maximize2 size={16} />, 'Draw Box: Drag to draw a custom bounding box')}
      {renderToolBtn('move', <MousePointer size={16} />, 'Move Box: Click and drag box position')}
      {renderToolBtn('resize', <Scaling size={16} />, 'Resize Box: Drag edges or corners to adjust')}

      {renderDivider()}

      {/* Zoom Group */}
      {renderActionBtn(<ZoomIn size={16} />, 'Zoom In', () => setZoom(z => Math.min(3.0, z + 0.2)))}
      {renderActionBtn(<ZoomOut size={16} />, 'Zoom Out', () => setZoom(z => Math.max(0.4, z - 0.2)))}
      {renderActionBtn(<RotateCcw size={15} />, 'Reset Zoom (100%)', () => setZoom(1.0))}

      {renderDivider()}

      {/* Image Upload Button */}
      <label
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          padding: 0
        }}
        title="Upload Image File"
      >
        <UploadCloud size={16} />
        <input type="file" accept="image/*" onChange={onUploadImage} style={{ display: 'none' }} />
      </label>

      {/* Clear Boxes or Delete Artwork */}
      {hasArtwork && onDeleteArtwork && (
        renderActionBtn(<Trash2 size={16} />, 'Delete Loaded Artwork Image', onDeleteArtwork, true)
      )}

      {boxCount > 0 && onClearBoxes && !hasArtwork && (
        renderActionBtn(<Trash2 size={16} />, `Clear all ${boxCount} boxes`, onClearBoxes, true)
      )}
    </div>
  );
};
