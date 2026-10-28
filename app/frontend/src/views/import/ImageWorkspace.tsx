import React, { useRef, useEffect, useState, MouseEvent } from 'react';
import { Trash2, UploadCloud } from 'lucide-react';
import { GlyphBox, ResizeHandle, ToolMode } from './types';
import { detectInkBoundingBox } from '../../utils/imageProcessor';

interface ImageWorkspaceProps {
  imageSrc: string;
  loadedImg: HTMLImageElement | null;
  binaryMask: { binary: Uint8Array; width: number; height: number } | null;
  invert: boolean;
  zoom: number;
  activeTool: ToolMode;
  boxes: GlyphBox[];
  setBoxes: React.Dispatch<React.SetStateAction<GlyphBox[]>>;
  selectedBoxId: string | null;
  setSelectedBoxId: (id: string | null) => void;
  nextTargetChar: string;
  getNextAvailableChar: () => string;
  onDeleteBox: (id: string) => void;
  onUploadImage?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDropImageFile?: (file: File) => void;
}

export const ImageWorkspace: React.FC<ImageWorkspaceProps> = ({
  imageSrc,
  loadedImg,
  binaryMask,
  invert,
  zoom,
  activeTool,
  boxes,
  setBoxes,
  selectedBoxId,
  setSelectedBoxId,
  nextTargetChar,
  getNextAvailableChar,
  onDeleteBox,
  onUploadImage,
  onDropImageFile,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);

  // Drag and drop image files onto canvas
  const [isDragOver, setIsDragOver] = useState(false);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);

  // Moving state
  const [draggingBoxId, setDraggingBoxId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number } | null>(null);

  // Resizing state
  const [resizingBoxId, setResizingBoxId] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [resizeStart, setResizeStart] = useState<{
    mouseX: number;
    mouseY: number;
    origBox: GlyphBox;
  } | null>(null);

  // Convert client viewport coordinates to exact image pixel coordinates
  const getImageCoords = (clientX: number, clientY: number) => {
    if (!imageWrapperRef.current || !loadedImg) return { x: 0, y: 0 };
    const rect = imageWrapperRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / zoom,
      y: (clientY - rect.top) / zoom,
    };
  };

  // Keyboard shortcut listener: Backspace, Delete, or Return deletes the selected box!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedBoxId) return;

      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      if (isInput) {
        const inputElem = target as HTMLInputElement;
        if ((e.key === 'Backspace' || e.code === 'Backspace') && inputElem.value === '') {
          e.preventDefault();
          onDeleteBox(selectedBoxId);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          inputElem.blur();
          onDeleteBox(selectedBoxId);
        }
        return;
      }

      if (
        e.key === 'Backspace' ||
        e.code === 'Backspace' ||
        e.key === 'Delete' ||
        e.code === 'Delete' ||
        e.key === 'Enter' ||
        e.code === 'Enter'
      ) {
        e.preventDefault();
        onDeleteBox(selectedBoxId);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [selectedBoxId, onDeleteBox]);

  // Window-level mouse move & mouse up to ensure smooth dragging and resizing even outside canvas bounds
  useEffect(() => {
    const handleWindowMouseMove = (e: globalThis.MouseEvent) => {
      if (!loadedImg) return;
      const { x, y } = getImageCoords(e.clientX, e.clientY);

      // Handle Moving Box
      if (draggingBoxId && dragOffset) {
        setBoxes(prev => prev.map(b => {
          if (b.id !== draggingBoxId) return b;
          const targetX = Math.round(x - dragOffset.dx);
          const targetY = Math.round(y - dragOffset.dy);
          return {
            ...b,
            x: Math.max(0, Math.min(loadedImg.width - b.width, targetX)),
            y: Math.max(0, Math.min(loadedImg.height - b.height, targetY))
          };
        }));
        return;
      }

      // Handle Resizing Box
      if (resizingBoxId && resizeHandle && resizeStart) {
        const dx = Math.round(x - resizeStart.mouseX);
        const dy = Math.round(y - resizeStart.mouseY);
        const orig = resizeStart.origBox;

        setBoxes(prev => prev.map(b => {
          if (b.id !== resizingBoxId) return b;

          let newX = orig.x;
          let newY = orig.y;
          let newW = orig.width;
          let newH = orig.height;

          if (resizeHandle.includes('e')) newW = Math.max(8, orig.width + dx);
          if (resizeHandle.includes('s')) newH = Math.max(8, orig.height + dy);
          if (resizeHandle.includes('w')) {
            const constrainedDx = Math.min(dx, orig.width - 8);
            newX = orig.x + constrainedDx;
            newW = orig.width - constrainedDx;
          }
          if (resizeHandle.includes('n')) {
            const constrainedDy = Math.min(dy, orig.height - 8);
            newY = orig.y + constrainedDy;
            newH = orig.height - constrainedDy;
          }

          return {
            ...b,
            x: Math.max(0, Math.min(loadedImg.width - 8, newX)),
            y: Math.max(0, Math.min(loadedImg.height - 8, newY)),
            width: Math.min(loadedImg.width - newX, newW),
            height: Math.min(loadedImg.height - newY, newH)
          };
        }));
        return;
      }

      // Handle Drawing Box
      if (isDrawing && drawStart) {
        setDrawCurrent({
          x: Math.max(0, Math.min(loadedImg.width, x)),
          y: Math.max(0, Math.min(loadedImg.height, y))
        });
      }
    };

    const handleWindowMouseUp = () => {
      if (isDrawing && drawStart && drawCurrent) {
        const x = Math.min(drawStart.x, drawCurrent.x);
        const y = Math.min(drawStart.y, drawCurrent.y);
        const width = Math.abs(drawCurrent.x - drawStart.x);
        const height = Math.abs(drawCurrent.y - drawStart.y);

        if (width > 8 && height > 8) {
          const charToAssign = nextTargetChar || getNextAvailableChar();
          const newBox: GlyphBox = {
            id: 'box_' + Date.now(),
            char: charToAssign,
            x: Math.round(x),
            y: Math.round(y),
            width: Math.round(width),
            height: Math.round(height)
          };
          setBoxes(prev => [...prev, newBox]);
          setSelectedBoxId(newBox.id);
        }
      }

      setIsDrawing(false);
      setDrawStart(null);
      setDrawCurrent(null);
      setDraggingBoxId(null);
      setDragOffset(null);
      setResizingBoxId(null);
      setResizeHandle(null);
      setResizeStart(null);
    };

    if (draggingBoxId || resizingBoxId || isDrawing) {
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [draggingBoxId, dragOffset, resizingBoxId, resizeHandle, resizeStart, isDrawing, drawStart, drawCurrent, loadedImg, zoom, nextTargetChar, getNextAvailableChar, setBoxes, setSelectedBoxId]);

  // Click on a Box directly -> selects and immediately enables drag/move
  const handleBoxMouseDown = (e: MouseEvent, box: GlyphBox) => {
    e.stopPropagation();
    if (document.activeElement instanceof HTMLElement && document.activeElement.tagName === 'INPUT') {
      document.activeElement.blur();
    }
    setSelectedBoxId(box.id);

    // Any mode except pure draw enables instant moving of the clicked box!
    if (activeTool !== 'draw') {
      const { x, y } = getImageCoords(e.clientX, e.clientY);
      setDraggingBoxId(box.id);
      setDragOffset({ dx: x - box.x, dy: y - box.y });
    }
  };

  // Start Resizing from a Handle
  const handleResizeHandleDown = (e: MouseEvent, box: GlyphBox, handle: ResizeHandle) => {
    e.stopPropagation();
    setSelectedBoxId(box.id);
    const { x, y } = getImageCoords(e.clientX, e.clientY);
    setResizingBoxId(box.id);
    setResizeHandle(handle);
    setResizeStart({
      mouseX: x,
      mouseY: y,
      origBox: { ...box }
    });
  };

  // Canvas Mouse Down
  const handleCanvasMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!loadedImg) return;
    const { x, y } = getImageCoords(e.clientX, e.clientY);

    // Ignore if clicked outside image bounds
    if (x < 0 || x > loadedImg.width || y < 0 || y > loadedImg.height) {
      return;
    }

    // 1. Check if clicked an existing box
    const clickedBox = [...boxes].reverse().find(b => 
      x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height
    );

    if (clickedBox) {
      handleBoxMouseDown(e, clickedBox);
      return;
    }

    // 2. Clicked empty space: deselect current box
    setSelectedBoxId(null);

    // 3. Smart Snap on ink letter
    if (activeTool === 'snap' && binaryMask) {
      const detected = detectInkBoundingBox(binaryMask.binary, binaryMask.width, binaryMask.height, x, y);
      if (detected) {
        const charToAssign = nextTargetChar || getNextAvailableChar();
        const newBox: GlyphBox = {
          id: 'box_' + Date.now(),
          char: charToAssign,
          ...detected
        };
        setBoxes(prev => [...prev, newBox]);
        setSelectedBoxId(newBox.id);
      }
      return;
    }

    // 4. Draw Box mode or drag on canvas
    if (activeTool === 'draw' || activeTool === 'move') {
      setIsDrawing(true);
      setDrawStart({ x, y });
      setDrawCurrent({ x, y });
    }
  };

  return (
    <div
      ref={containerRef}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
          onDropImageFile?.(file);
        }
      }}
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'auto',
        padding: '40px',
        display: 'flex',
        alignItems: loadedImg ? 'flex-start' : 'center',
        justifyContent: 'center',
        userSelect: 'none',
        backgroundColor: '#090c12'
      }}
    >
      {loadedImg ? (
        <div
          ref={imageWrapperRef}
          onMouseDown={handleCanvasMouseDown}
          style={{
            position: 'relative',
            width: `${loadedImg.width * zoom}px`,
            height: `${loadedImg.height * zoom}px`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            border: '1px solid var(--border)',
            backgroundColor: '#ffffff',
            cursor: activeTool === 'snap' ? 'crosshair' : activeTool === 'draw' ? 'crosshair' : 'default',
            flexShrink: 0
          }}
        >
          {/* Base Image */}
          <img
            src={imageSrc}
            alt="Source Page"
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              filter: invert ? 'invert(1)' : 'none',
              pointerEvents: 'none'
            }}
          />

          {/* Glyph Bounding Boxes */}
          {boxes.map((b) => {
            const isSelected = selectedBoxId === b.id;
            const isDragging = draggingBoxId === b.id;
            const bx = b.x * zoom;
            const by = b.y * zoom;
            const bw = b.width * zoom;
            const bh = b.height * zoom;

            return (
              <div
                key={b.id}
                onMouseDown={(e) => handleBoxMouseDown(e, b)}
                style={{
                  position: 'absolute',
                  left: `${bx}px`,
                  top: `${by}px`,
                  width: `${bw}px`,
                  height: `${bh}px`,
                  border: isSelected ? '2px solid #6366f1' : '1.5px solid rgba(99, 102, 241, 0.7)',
                  backgroundColor: isSelected 
                    ? (isDragging ? 'rgba(99, 102, 241, 0.35)' : 'rgba(99, 102, 241, 0.22)') 
                    : 'rgba(99, 102, 241, 0.08)',
                  boxShadow: isSelected ? '0 0 0 1px #818cf8, 0 0 14px rgba(99, 102, 241, 0.5)' : 'none',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  zIndex: isSelected ? 20 : 10,
                  transition: isDragging ? 'none' : 'border-color 0.1s'
                }}
              >
                {/* Character Label Tag Badge */}
                <div style={{
                  position: 'absolute',
                  top: '-18px',
                  left: '-1px',
                  backgroundColor: isSelected ? 'var(--accent)' : '#1e2433',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                  pointerEvents: 'auto',
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}>
                  <span>{b.char}</span>
                  {isSelected && (
                    <span
                      title="Delete box (Shortcut: Backspace / Return)"
                      style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onDeleteBox(b.id);
                      }}
                    >
                      <Trash2 size={10} style={{ opacity: 0.8 }} />
                    </span>
                  )}
                </div>

                {/* 8 Resize Handles on Selected Box */}
                {isSelected && (
                  <>
                    <div
                      onMouseDown={(e) => handleResizeHandleDown(e, b, 'nw')}
                      style={{ position: 'absolute', top: -5, left: -5, width: 10, height: 10, backgroundColor: '#ffffff', border: '1.5px solid #4f46e5', cursor: 'nwse-resize', zIndex: 30 }}
                      title="Resize Top-Left"
                    />
                    <div
                      onMouseDown={(e) => handleResizeHandleDown(e, b, 'ne')}
                      style={{ position: 'absolute', top: -5, right: -5, width: 10, height: 10, backgroundColor: '#ffffff', border: '1.5px solid #4f46e5', cursor: 'nesw-resize', zIndex: 30 }}
                      title="Resize Top-Right"
                    />
                    <div
                      onMouseDown={(e) => handleResizeHandleDown(e, b, 'sw')}
                      style={{ position: 'absolute', bottom: -5, left: -5, width: 10, height: 10, backgroundColor: '#ffffff', border: '1.5px solid #4f46e5', cursor: 'nesw-resize', zIndex: 30 }}
                      title="Resize Bottom-Left"
                    />
                    <div
                      onMouseDown={(e) => handleResizeHandleDown(e, b, 'se')}
                      style={{ position: 'absolute', bottom: -5, right: -5, width: 10, height: 10, backgroundColor: '#ffffff', border: '1.5px solid #4f46e5', cursor: 'nwse-resize', zIndex: 30 }}
                      title="Resize Bottom-Right"
                    />
                    <div
                      onMouseDown={(e) => handleResizeHandleDown(e, b, 'n')}
                      style={{ position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)', width: 12, height: 8, backgroundColor: '#ffffff', border: '1.5px solid #4f46e5', cursor: 'ns-resize', zIndex: 30 }}
                      title="Resize Top"
                    />
                    <div
                      onMouseDown={(e) => handleResizeHandleDown(e, b, 's')}
                      style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 12, height: 8, backgroundColor: '#ffffff', border: '1.5px solid #4f46e5', cursor: 'ns-resize', zIndex: 30 }}
                      title="Resize Bottom"
                    />
                    <div
                      onMouseDown={(e) => handleResizeHandleDown(e, b, 'w')}
                      style={{ position: 'absolute', left: -4, top: '50%', transform: 'translateY(-50%)', width: 8, height: 12, backgroundColor: '#ffffff', border: '1.5px solid #4f46e5', cursor: 'ew-resize', zIndex: 30 }}
                      title="Resize Left"
                    />
                    <div
                      onMouseDown={(e) => handleResizeHandleDown(e, b, 'e')}
                      style={{ position: 'absolute', right: -4, top: '50%', transform: 'translateY(-50%)', width: 8, height: 12, backgroundColor: '#ffffff', border: '1.5px solid #4f46e5', cursor: 'ew-resize', zIndex: 30 }}
                      title="Resize Right"
                    />
                  </>
                )}
              </div>
            );
          })}

          {/* Dragging New Box Preview */}
          {isDrawing && drawStart && drawCurrent && (
            <div style={{
              position: 'absolute',
              left: `${Math.min(drawStart.x, drawCurrent.x) * zoom}px`,
              top: `${Math.min(drawStart.y, drawCurrent.y) * zoom}px`,
              width: `${Math.abs(drawCurrent.x - drawStart.x) * zoom}px`,
              height: `${Math.abs(drawCurrent.y - drawStart.y) * zoom}px`,
              border: '2px dashed #6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.25)',
              pointerEvents: 'none'
            }}>
              <span style={{
                position: 'absolute',
                top: '-18px',
                left: 0,
                backgroundColor: 'var(--accent)',
                color: '#fff',
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: '2px',
                fontWeight: 700
              }}>
                {nextTargetChar}
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Empty State / Dropzone when no artwork is loaded */
        <div style={{
          maxWidth: '540px',
          width: '100%',
          backgroundColor: isDragOver ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)',
          border: isDragOver ? '2px dashed var(--accent)' : '1px dashed var(--border)',
          borderRadius: '12px',
          padding: '48px 32px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          boxShadow: isDragOver ? '0 0 24px rgba(99, 102, 241, 0.3)' : '0 10px 30px rgba(0,0,0,0.4)',
          transition: 'all 0.2s ease'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDragOver ? 'var(--accent)' : 'var(--text-muted)'
          }}>
            <UploadCloud size={32} />
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
              {isDragOver ? 'Drop Image to Load Artwork' : 'No Artwork Loaded'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-faint)', maxWidth: '420px', lineHeight: 1.5, margin: 0 }}>
              Drag and drop any scanned alphabet sheet, handwriting photo, or artwork image here to begin extracting letterforms into your font.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {onUploadImage && (
              <label className="btn-primary" style={{ cursor: 'pointer', padding: '8px 16px', fontSize: '12px' }}>
                <UploadCloud size={14} />
                <span>Upload Image File</span>
                <input type="file" accept="image/*" onChange={onUploadImage} style={{ display: 'none' }} />
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
