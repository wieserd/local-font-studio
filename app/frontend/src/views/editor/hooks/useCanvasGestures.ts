import React, { useEffect } from 'react';
import { Glyph } from '../../../types/font';
import {
  Point,
  GlyphContour,
  SelectedPointRef,
  updatePointInContour,
  contoursToSvgPath,
  rotateContours
} from '../../../utils/contourUtils';
import { EditorTool, ResizeHandle } from '../types';

export interface UseCanvasGesturesProps {
  glyphChar: string;
  updateGlyph: (char: string, partial: Partial<Glyph>) => void;
  scale: number;
  fontScale: number;
  contoursRef: React.MutableRefObject<GlyphContour[]>;
  baseBitmapWidth: number;

  // 1. Point Dragging
  isDraggingPoint: boolean;
  setIsDraggingPoint: (val: boolean) => void;
  pointDragRef: React.MutableRefObject<{
    active: SelectedPointRef;
    initialX: number;
    initialY: number;
    startX: number;
    startY: number;
  } | null>;

  // 2. Glyph Moving
  isDraggingGlyph: boolean;
  setIsDraggingGlyph: (val: boolean) => void;
  dragStartPos: { mouseX: number; mouseY: number; startX: number; startY: number } | null;
  setDragStartPos: (val: { mouseX: number; mouseY: number; startX: number; startY: number } | null) => void;
  setXOffset: React.Dispatch<React.SetStateAction<number>>;
  setYOffset: React.Dispatch<React.SetStateAction<number>>;
  offsetRef: React.MutableRefObject<{ x: number; y: number }>;

  // 3. Rotation
  isRotating: boolean;
  setIsRotating: (val: boolean) => void;
  getFontCoordinates: (clientX: number, clientY: number) => Point | null;
  rotationDragRef: React.MutableRefObject<{
    startAngleRad: number;
    center: Point;
    initialContours: GlyphContour[];
    accumulatedDeg: number;
  } | null>;
  setLiveRotationAngle: (deg: number) => void;
  setSavedToast: (val: boolean) => void;

  // 4. Bitmap Moving
  isDraggingBitmap: boolean;
  setIsDraggingBitmap: (val: boolean) => void;
  bitmapDragStart: { mouseX: number; mouseY: number; startX: number; startY: number } | null;
  setBitmapDragStart: (val: { mouseX: number; mouseY: number; startX: number; startY: number } | null) => void;
  setBitmapXOffset: React.Dispatch<React.SetStateAction<number>>;
  setBitmapYOffset: React.Dispatch<React.SetStateAction<number>>;
  bitmapOffsetRef: React.MutableRefObject<{ x: number; y: number }>;

  // 5. Bitmap Resizing
  resizingHandle: ResizeHandle | null;
  setResizingHandle: (handle: ResizeHandle | null) => void;
  resizeStart: {
    mouseX: number;
    mouseY: number;
    startScale: number;
    startWidth: number;
    startHeight: number;
    startX: number;
    startY: number;
  } | null;
  setResizeStart: (val: {
    mouseX: number;
    mouseY: number;
    startScale: number;
    startWidth: number;
    startHeight: number;
    startX: number;
    startY: number;
  } | null) => void;
  setBitmapScale: React.Dispatch<React.SetStateAction<number>>;
  bitmapScaleRef: React.MutableRefObject<number>;

  // 6. Guide Dragging
  draggingGuide: 'lsb' | 'advance' | null;
  setDraggingGuide: (val: 'lsb' | 'advance' | null) => void;
  guideStart: { mouseX: number; initialVal: number } | null;
  setGuideStart: (val: { mouseX: number; initialVal: number } | null) => void;
  setLsb: React.Dispatch<React.SetStateAction<number>>;
  setAdvanceWidth: React.Dispatch<React.SetStateAction<number>>;
  guideValRef: React.MutableRefObject<{ lsb: number; advanceWidth: number }>;

  // 7. Keyboard Shortcuts
  selectedPointRef: React.MutableRefObject<SelectedPointRef | null>;
  setSelectedPoint: (val: SelectedPointRef | null) => void;
  handleDeleteSelectedPoint: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
  activeTool: EditorTool;
  setActiveTool: (tool: EditorTool) => void;
}

export function useCanvasGestures({
  glyphChar,
  updateGlyph,
  scale,
  fontScale,
  contoursRef,
  baseBitmapWidth,

  isDraggingPoint,
  setIsDraggingPoint,
  pointDragRef,

  isDraggingGlyph,
  setIsDraggingGlyph,
  dragStartPos,
  setDragStartPos,
  setXOffset,
  setYOffset,
  offsetRef,

  isRotating,
  setIsRotating,
  getFontCoordinates,
  rotationDragRef,
  setLiveRotationAngle,
  setSavedToast,

  isDraggingBitmap,
  setIsDraggingBitmap,
  bitmapDragStart,
  setBitmapDragStart,
  setBitmapXOffset,
  setBitmapYOffset,
  bitmapOffsetRef,

  resizingHandle,
  setResizingHandle,
  resizeStart,
  setResizeStart,
  setBitmapScale,
  bitmapScaleRef,

  draggingGuide,
  setDraggingGuide,
  guideStart,
  setGuideStart,
  setLsb,
  setAdvanceWidth,
  guideValRef,

  selectedPointRef,
  setSelectedPoint,
  handleDeleteSelectedPoint,
  handleUndo,
  handleRedo,
  activeTool,
  setActiveTool
}: UseCanvasGesturesProps) {

  // 1. Point Dragging Listener
  useEffect(() => {
    if (!isDraggingPoint) return;

    const currentScaleFactor = (scale / 100) * fontScale;

    const handleMouseMove = (e: MouseEvent) => {
      const drag = pointDragRef.current;
      if (!drag) return;

      let dx = (e.clientX - drag.startX) / currentScaleFactor;
      let dy = (drag.startY - e.clientY) / currentScaleFactor; // Font Y points up

      if (e.shiftKey) {
        if (Math.abs(dx) > Math.abs(dy)) dy = 0;
        else dx = 0;
      }

      const nextX = Math.round(drag.initialX + dx);
      const nextY = Math.round(drag.initialY + dy);

      const updated = updatePointInContour(
        contoursRef.current,
        drag.active.contourIndex,
        drag.active.pointIndex,
        { x: nextX, y: nextY }
      );
      const newPath = contoursToSvgPath(updated);
      updateGlyph(glyphChar, { svgPath: newPath });
    };

    const handleMouseUp = () => {
      setIsDraggingPoint(false);
      pointDragRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPoint, scale, fontScale, glyphChar, updateGlyph, contoursRef, pointDragRef, setIsDraggingPoint]);

  // 2. Vector Glyph Moving Listener
  useEffect(() => {
    if (!isDraggingGlyph || !dragStartPos) return;

    const handleMouseMove = (e: MouseEvent) => {
      let dx = e.clientX - dragStartPos.mouseX;
      let dy = dragStartPos.mouseY - e.clientY;

      if (e.shiftKey) {
        if (Math.abs(dx) > Math.abs(dy)) dy = 0;
        else dx = 0;
      }

      const nextX = Math.round(dragStartPos.startX + dx);
      const nextY = Math.round(dragStartPos.startY + dy);

      setXOffset(nextX);
      setYOffset(nextY);
      offsetRef.current = { x: nextX, y: nextY };
    };

    const handleMouseUp = () => {
      setIsDraggingGlyph(false);
      setDragStartPos(null);
      updateGlyph(glyphChar, { xOffset: offsetRef.current.x, yOffset: offsetRef.current.y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingGlyph, dragStartPos, glyphChar, updateGlyph, offsetRef, setDragStartPos, setIsDraggingGlyph, setXOffset, setYOffset]);

  // 3. Interactive Rotation Dragging Listener
  useEffect(() => {
    if (!isRotating) return;

    const handleMouseMove = (e: MouseEvent) => {
      const coords = getFontCoordinates(e.clientX, e.clientY);
      if (!coords || !rotationDragRef.current) return;

      const { startAngleRad, center, initialContours } = rotationDragRef.current;
      const currentAngleRad = Math.atan2(coords.y - center.y, coords.x - center.x);
      let deltaRad = currentAngleRad - startAngleRad;
      let deltaDeg = (deltaRad * 180) / Math.PI;

      // Shift key snaps to 15-degree increments
      if (e.shiftKey) {
        deltaDeg = Math.round(deltaDeg / 15) * 15;
      } else {
        deltaDeg = Math.round(deltaDeg * 10) / 10;
      }

      setLiveRotationAngle(deltaDeg);
      rotationDragRef.current.accumulatedDeg = deltaDeg;

      const rotated = rotateContours(initialContours, deltaDeg, center);
      updateGlyph(glyphChar, { svgPath: contoursToSvgPath(rotated) });
    };

    const handleMouseUp = () => {
      setIsRotating(false);
      if (rotationDragRef.current && rotationDragRef.current.accumulatedDeg !== 0) {
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2000);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isRotating, glyphChar, updateGlyph, getFontCoordinates, rotationDragRef, setIsRotating, setLiveRotationAngle, setSavedToast]);

  // 4. Moving Bitmap Overlay Listener
  useEffect(() => {
    if (!isDraggingBitmap || !bitmapDragStart) return;

    const handleMouseMove = (e: MouseEvent) => {
      let dx = e.clientX - bitmapDragStart.mouseX;
      let dy = bitmapDragStart.mouseY - e.clientY;

      if (e.shiftKey) {
        if (Math.abs(dx) > Math.abs(dy)) dy = 0;
        else dx = 0;
      }

      const nextX = Math.round(bitmapDragStart.startX + dx);
      const nextY = Math.round(bitmapDragStart.startY + dy);

      setBitmapXOffset(nextX);
      setBitmapYOffset(nextY);
      bitmapOffsetRef.current = { x: nextX, y: nextY };
    };

    const handleMouseUp = () => {
      setIsDraggingBitmap(false);
      setBitmapDragStart(null);
      updateGlyph(glyphChar, {
        bitmapXOffset: bitmapOffsetRef.current.x,
        bitmapYOffset: bitmapOffsetRef.current.y
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingBitmap, bitmapDragStart, glyphChar, updateGlyph, bitmapOffsetRef, setBitmapDragStart, setIsDraggingBitmap, setBitmapXOffset, setBitmapYOffset]);

  // 5. Resizing Bitmap Overlay Listener
  useEffect(() => {
    if (!resizingHandle || !resizeStart) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.mouseX;

      let newWidth = resizeStart.startWidth;
      let newX = resizeStart.startX;
      let newY = resizeStart.startY;

      if (resizingHandle === 'se' || resizingHandle === 'e') {
        newWidth = Math.max(30, resizeStart.startWidth + deltaX);
      } else if (resizingHandle === 'sw' || resizingHandle === 'w') {
        newWidth = Math.max(30, resizeStart.startWidth - deltaX);
        const widthDiff = newWidth - resizeStart.startWidth;
        newX = Math.round(resizeStart.startX - widthDiff);
      } else if (resizingHandle === 'ne') {
        newWidth = Math.max(30, resizeStart.startWidth + deltaX);
        const heightDiff = (newWidth / resizeStart.startWidth - 1) * resizeStart.startHeight;
        newY = Math.round(resizeStart.startY + heightDiff);
      } else if (resizingHandle === 'nw') {
        newWidth = Math.max(30, resizeStart.startWidth - deltaX);
        const widthDiff = newWidth - resizeStart.startWidth;
        const heightDiff = (newWidth / resizeStart.startWidth - 1) * resizeStart.startHeight;
        newX = Math.round(resizeStart.startX - widthDiff);
        newY = Math.round(resizeStart.startY + heightDiff);
      } else if (resizingHandle === 's') {
        const heightChange = e.clientY - resizeStart.mouseY;
        const ratio = 1 + (heightChange / resizeStart.startHeight);
        newWidth = Math.max(30, resizeStart.startWidth * ratio);
      } else if (resizingHandle === 'n') {
        const heightChange = resizeStart.mouseY - e.clientY;
        const ratio = 1 + (heightChange / resizeStart.startHeight);
        newWidth = Math.max(30, resizeStart.startWidth * ratio);
        const heightDiff = (ratio - 1) * resizeStart.startHeight;
        newY = Math.round(resizeStart.startY + heightDiff);
      }

      const calculatedScale = Math.round((newWidth / baseBitmapWidth) * 100);
      const clampedScale = Math.max(10, Math.min(500, calculatedScale));

      setBitmapScale(clampedScale);
      bitmapScaleRef.current = clampedScale;

      setBitmapXOffset(newX);
      bitmapOffsetRef.current.x = newX;

      setBitmapYOffset(newY);
      bitmapOffsetRef.current.y = newY;
    };

    const handleMouseUp = () => {
      setResizingHandle(null);
      setResizeStart(null);
      updateGlyph(glyphChar, {
        bitmapScale: bitmapScaleRef.current,
        bitmapXOffset: bitmapOffsetRef.current.x,
        bitmapYOffset: bitmapOffsetRef.current.y
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingHandle, resizeStart, baseBitmapWidth, glyphChar, updateGlyph, bitmapOffsetRef, bitmapScaleRef, setBitmapScale, setBitmapXOffset, setBitmapYOffset, setResizeStart, setResizingHandle]);

  // 6. Dragging Guideline Listener (LSB and Advance Width)
  useEffect(() => {
    if (!draggingGuide || !guideStart) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - guideStart.mouseX) / fontScale;
      if (draggingGuide === 'lsb') {
        const nextLsb = Math.max(0, Math.round(guideStart.initialVal + deltaX));
        setLsb(nextLsb);
        guideValRef.current.lsb = nextLsb;
      } else if (draggingGuide === 'advance') {
        const nextAdvance = Math.max(100, Math.round(guideStart.initialVal + deltaX));
        setAdvanceWidth(nextAdvance);
        guideValRef.current.advanceWidth = nextAdvance;
      }
    };

    const handleMouseUp = () => {
      setDraggingGuide(null);
      setGuideStart(null);
      updateGlyph(glyphChar, {
        lsb: guideValRef.current.lsb,
        advanceWidth: guideValRef.current.advanceWidth
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingGuide, guideStart, fontScale, glyphChar, updateGlyph, guideValRef, setAdvanceWidth, setDraggingGuide, setGuideStart, setLsb]);

  // 7. Keyboard Navigation: Backspace to delete point, Escape to deselect, Arrow keys to move
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Escape to cancel point connection / deselect
      if (e.key === 'Escape') {
        setSelectedPoint(null);
        return;
      }

      // Delete selected point with Backspace or Delete
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedPointRef.current) {
          e.preventDefault();
          handleDeleteSelectedPoint();
          return;
        }
      }

      // Undo / Redo shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
        return;
      }

      // Tool shortcuts
      if (e.key === 'v' || e.key === 'V') { setActiveTool('select'); return; }
      if (e.key === 'b' || e.key === 'B') { setActiveTool('move-bitmap'); return; }
      if (e.key === 'p' || e.key === 'P') { setActiveTool('pen'); return; }
      if (e.key === 'a' || e.key === 'A') { setActiveTool('node'); return; }
      if (e.key === 'c' || e.key === 'C') { setActiveTool('knife'); return; }
      if (e.key === 'r' || e.key === 'R' || e.key === 't' || e.key === 'T') { setActiveTool('rotate'); return; }

      // Arrow keys position nudging
      const step = e.shiftKey ? 10 : 1;

      // RULE: If a point is selected, arrow keys move ONLY the selected point!
      const active = selectedPointRef.current;
      if (active) {
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowLeft') dx = -step;
        else if (e.key === 'ArrowRight') dx = step;
        else if (e.key === 'ArrowUp') dy = step;
        else if (e.key === 'ArrowDown') dy = -step;

        if (dx !== 0 || dy !== 0) {
          e.preventDefault();
          const targetContour = contoursRef.current[active.contourIndex];
          if (!targetContour || !targetContour[active.pointIndex]) return;
          const curPt = targetContour[active.pointIndex];
          const next = {
            x: curPt.x + dx,
            y: curPt.y + dy
          };
          const updated = updatePointInContour(
            contoursRef.current,
            active.contourIndex,
            active.pointIndex,
            next
          );
          const newPath = contoursToSvgPath(updated);
          updateGlyph(glyphChar, { svgPath: newPath });
          return;
        }
      }

      // ONLY IF NO POINT IS SELECTED: Arrow keys move the glyph or bitmap
      if (!active) {
        if (activeTool === 'move-bitmap') {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setBitmapXOffset(prev => {
              const next = prev - step;
              updateGlyph(glyphChar, { bitmapXOffset: next });
              return next;
            });
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            setBitmapXOffset(prev => {
              const next = prev + step;
              updateGlyph(glyphChar, { bitmapXOffset: next });
              return next;
            });
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setBitmapYOffset(prev => {
              const next = prev + step;
              updateGlyph(glyphChar, { bitmapYOffset: next });
              return next;
            });
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setBitmapYOffset(prev => {
              const next = prev - step;
              updateGlyph(glyphChar, { bitmapYOffset: next });
              return next;
            });
          }
        } else {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setXOffset(prev => {
              const next = prev - step;
              updateGlyph(glyphChar, { xOffset: next });
              return next;
            });
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            setXOffset(prev => {
              const next = prev + step;
              updateGlyph(glyphChar, { xOffset: next });
              return next;
            });
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setYOffset(prev => {
              const next = prev + step;
              updateGlyph(glyphChar, { yOffset: next });
              return next;
            });
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setYOffset(prev => {
              const next = prev - step;
              updateGlyph(glyphChar, { yOffset: next });
              return next;
            });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeTool,
    glyphChar,
    updateGlyph,
    contoursRef,
    selectedPointRef,
    handleDeleteSelectedPoint,
    handleRedo,
    handleUndo,
    setActiveTool,
    setBitmapXOffset,
    setBitmapYOffset,
    setSelectedPoint,
    setXOffset,
    setYOffset
  ]);
}
