import React from 'react';
import { EditorTool, ResizeHandle } from '../types';

interface EditorBitmapOverlayProps {
  showOriginalImage: boolean;
  originalImage?: string;
  bitmapContainerRef: React.RefObject<HTMLDivElement>;
  activeTool: EditorTool;
  isDraggingBitmap: boolean;
  setIsDraggingBitmap: (val: boolean) => void;
  setBitmapDragStart: (pos: { mouseX: number; mouseY: number; startX: number; startY: number }) => void;
  capHeightY: number;
  bitmapYOffset: number;
  lsb: number;
  fontScale: number;
  bitmapXOffset: number;
  currentBitmapWidth: number;
  bitmapScale: number;
  resizingHandle: ResizeHandle | null;
  handleResizeHandleMouseDown: (handle: ResizeHandle, e: React.MouseEvent) => void;
}

export const EditorBitmapOverlay: React.FC<EditorBitmapOverlayProps> = ({
  showOriginalImage,
  originalImage,
  bitmapContainerRef,
  activeTool,
  isDraggingBitmap,
  setIsDraggingBitmap,
  setBitmapDragStart,
  capHeightY,
  bitmapYOffset,
  lsb,
  fontScale,
  bitmapXOffset,
  currentBitmapWidth,
  bitmapScale,
  resizingHandle,
  handleResizeHandleMouseDown
}) => {
  if (!showOriginalImage || !originalImage) {
    return null;
  }

  return (
    <div
      ref={bitmapContainerRef}
      onMouseDown={(e) => {
        if (activeTool === 'move-bitmap') {
          e.stopPropagation();
          e.preventDefault();
          setIsDraggingBitmap(true);
          setBitmapDragStart({
            mouseX: e.clientX,
            mouseY: e.clientY,
            startX: bitmapXOffset,
            startY: bitmapYOffset
          });
        }
      }}
      style={{
        position: 'absolute',
        top: `${capHeightY - bitmapYOffset}px`,
        left: `${70 + (lsb * fontScale) + bitmapXOffset}px`,
        width: `${currentBitmapWidth}px`,
        opacity: activeTool === 'move-bitmap' ? 0.72 : 0.22,
        pointerEvents: activeTool === 'move-bitmap' ? 'auto' : 'none',
        filter: 'invert(1)',
        cursor: activeTool === 'move-bitmap' ? (isDraggingBitmap ? 'grabbing' : 'grab') : 'default',
        border: activeTool === 'move-bitmap' ? '1.5px dashed #38bdf8' : 'none',
        boxShadow: activeTool === 'move-bitmap' ? '0 0 16px rgba(56, 189, 248, 0.45)' : 'none',
        zIndex: activeTool === 'move-bitmap' ? 8 : 2,
        transition: (isDraggingBitmap || resizingHandle) ? 'none' : 'border 0.15s, opacity 0.15s',
        userSelect: 'none'
      }}
      title={activeTool === 'move-bitmap' ? 'Click and drag to move, drag handles to resize' : undefined}
    >
      <img
        src={originalImage}
        alt="Source"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          pointerEvents: 'none',
          userSelect: 'none'
        }}
        draggable={false}
      />

      {/* 8 Resize Handles when activeTool === 'move-bitmap' */}
      {activeTool === 'move-bitmap' && (
        <>
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: '0',
            backgroundColor: '#0284c7',
            color: '#fff',
            fontSize: '9px',
            fontWeight: 600,
            padding: '1px 6px',
            borderRadius: '3px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
          }}>
            Bitmap Overlay · X: {bitmapXOffset} · Y: {bitmapYOffset} · {bitmapScale}%
          </div>

          {[
            { handle: 'nw', style: { top: '-5px', left: '-5px', cursor: 'nwse-resize' } },
            { handle: 'ne', style: { top: '-5px', right: '-5px', cursor: 'nesw-resize' } },
            { handle: 'se', style: { bottom: '-5px', right: '-5px', cursor: 'nwse-resize' } },
            { handle: 'sw', style: { bottom: '-5px', left: '-5px', cursor: 'nesw-resize' } },
            { handle: 'n',  style: { top: '-5px', left: 'calc(50% - 4px)', cursor: 'ns-resize' } },
            { handle: 's',  style: { bottom: '-5px', left: 'calc(50% - 4px)', cursor: 'ns-resize' } },
            { handle: 'e',  style: { top: 'calc(50% - 4px)', right: '-5px', cursor: 'ew-resize' } },
            { handle: 'w',  style: { top: 'calc(50% - 4px)', left: '-5px', cursor: 'ew-resize' } },
          ].map(({ handle, style }) => (
            <div
              key={handle}
              onMouseDown={(e) => handleResizeHandleMouseDown(handle as ResizeHandle, e)}
              style={{
                position: 'absolute',
                width: '9px',
                height: '9px',
                backgroundColor: '#38bdf8',
                border: '1.5px solid #0f172a',
                borderRadius: '2px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.6)',
                zIndex: 12,
                ...style
              }}
              title={`Drag to resize bitmap (${handle.toUpperCase()})`}
            />
          ))}
        </>
      )}
    </div>
  );
};
