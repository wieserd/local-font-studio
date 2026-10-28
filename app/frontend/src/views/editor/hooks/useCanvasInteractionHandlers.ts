import { useState, useRef } from 'react';
import { Point, GlyphContour, SelectedPointRef, findClosestEdge, computeContoursBounds } from '../../../utils/contourUtils';
import { EditorTool, ResizeHandle } from '../types';

type ContoursBounds = ReturnType<typeof computeContoursBounds>;

interface UseCanvasInteractionHandlersProps {
  svgRef: React.RefObject<SVGSVGElement>;
  bitmapContainerRef: React.RefObject<HTMLDivElement>;
  scale: number;
  fontScale: number;
  xOffset: number;
  yOffset: number;
  baselineY: number;
  activeTool: EditorTool;
  contours: GlyphContour[];
  glyphBounds: ContoursBounds | null;
  selectedPoint: SelectedPointRef | null;
  setSelectedPoint: (ref: SelectedPointRef | null) => void;
  hoverEdge: { contourIndex: number; segmentIndex: number; projectedPoint: Point } | null;
  setHoverEdge: (edge: { contourIndex: number; segmentIndex: number; projectedPoint: Point } | null) => void;
  setMouseFontPos: (pt: Point | null) => void;
  handleAddPointConnectedToSelected: (pt: Point) => void;
  handleInsertPointOnHoverEdge: (e: React.MouseEvent) => void;
  handleStartNewPoint: (pt: Point) => void;
  pushUndo: () => void;
  setIsRotating: (rotating: boolean) => void;
  setLiveRotationAngle: (deg: number) => void;
  rotationDragRef: React.MutableRefObject<{
    startAngleRad: number;
    center: Point;
    initialContours: GlyphContour[];
    accumulatedDeg: number;
  } | null>;
  setIsDraggingPoint: (dragging: boolean) => void;
  pointDragRef: React.MutableRefObject<{
    active: SelectedPointRef;
    initialX: number;
    initialY: number;
    startX: number;
    startY: number;
  } | null>;
  bitmapScale: number;
  currentBitmapWidth: number;
  bitmapXOffset: number;
  bitmapYOffset: number;
  lsb: number;
  advanceWidth: number;
}

export const useCanvasInteractionHandlers = ({
  svgRef,
  bitmapContainerRef,
  scale,
  fontScale,
  xOffset,
  yOffset,
  baselineY,
  activeTool,
  contours,
  glyphBounds,
  selectedPoint,
  setSelectedPoint,
  hoverEdge,
  setHoverEdge,
  setMouseFontPos,
  handleAddPointConnectedToSelected,
  handleInsertPointOnHoverEdge,
  handleStartNewPoint,
  pushUndo,
  setIsRotating,
  setLiveRotationAngle,
  rotationDragRef,
  setIsDraggingPoint,
  pointDragRef,
  bitmapScale,
  currentBitmapWidth,
  bitmapXOffset,
  bitmapYOffset,
  lsb,
  advanceWidth,
}: UseCanvasInteractionHandlersProps) => {
  // Dragging states for vector glyph
  const [isDraggingGlyph, setIsDraggingGlyph] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);

  // Dragging & Resizing states for bitmap overlay
  const [isDraggingBitmap, setIsDraggingBitmap] = useState(false);
  const [bitmapDragStart, setBitmapDragStart] = useState<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);

  const [resizingHandle, setResizingHandle] = useState<ResizeHandle | null>(null);
  const [resizeStart, setResizeStart] = useState<{
    mouseX: number;
    mouseY: number;
    startScale: number;
    startWidth: number;
    startHeight: number;
    startX: number;
    startY: number;
  } | null>(null);

  const [draggingGuide, setDraggingGuide] = useState<'lsb' | 'advance' | null>(null);
  const [guideStart, setGuideStart] = useState<{ mouseX: number; initialVal: number } | null>(null);

  // Map viewport client coordinate to font design units
  const getFontCoordinates = (clientX: number, clientY: number): Point | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = (clientX - rect.left) * (640 / rect.width);
    const svgY = (clientY - rect.top) * (760 / rect.height);

    const currentScaleFactor = (scale / 100) * fontScale;
    const xInG = svgX - (70 + xOffset);
    const yInG = svgY - (baselineY - yOffset);

    const fontX = Math.round(xInG / currentScaleFactor);
    const fontY = Math.round(yInG / (-currentScaleFactor));

    return { x: fontX, y: fontY };
  };

  // Canvas Mouse Move (track coordinates for live rubberband & edge hover)
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    const coords = getFontCoordinates(e.clientX, e.clientY);
    if (coords) {
      setMouseFontPos(coords);
    }

    if (isDraggingGlyph || isDraggingBitmap || resizingHandle) {
      setHoverEdge(null);
      return;
    }

    // Only detect edge hovering if NO point is actively rubber-banding in Pen tool,
    // OR if we are in Node tool.
    if ((activeTool === 'node' || (activeTool === 'pen' && !selectedPoint)) && coords) {
      const currentScaleFactor = (scale / 100) * fontScale;
      const match = findClosestEdge(contours, coords, 25 / currentScaleFactor);
      if (match) {
        setHoverEdge({
          contourIndex: match.contourIndex,
          segmentIndex: match.segmentIndex,
          projectedPoint: match.projectedPoint
        });
      } else {
        setHoverEdge(null);
      }
    } else {
      setHoverEdge(null);
    }
  };

  // Canvas Mouse Down
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left mouse button only

    // 1. If Pen tool is active:
    if (activeTool === 'pen') {
      const coords = getFontCoordinates(e.clientX, e.clientY);
      if (!coords) return;

      // If a point is selected, ALWAYS connect the new point directly to it!
      if (selectedPoint) {
        handleAddPointConnectedToSelected(coords);
        return;
      }

      // If no point was selected, but user clicked an edge to split:
      if (hoverEdge) {
        handleInsertPointOnHoverEdge(e);
        return;
      }

      // Otherwise start a new point / append
      handleStartNewPoint(coords);
      return;
    }

    // 2. If Node tool is active:
    if (activeTool === 'node') {
      if (hoverEdge) {
        handleInsertPointOnHoverEdge(e);
        return;
      }
      // Clicked on empty space with node tool -> deselect point
      setSelectedPoint(null);
      return;
    }

    // 3. If Move Bitmap tool is active:
    if (activeTool === 'move-bitmap') {
      e.preventDefault();
      setIsDraggingBitmap(true);
      setBitmapDragStart({
        mouseX: e.clientX,
        mouseY: e.clientY,
        startX: bitmapXOffset,
        startY: bitmapYOffset
      });
      return;
    }

    // 4. If Rotate tool is active:
    if (activeTool === 'rotate') {
      const coords = getFontCoordinates(e.clientX, e.clientY);
      if (!coords || contours.length === 0 || !glyphBounds) return;
      e.preventDefault();

      pushUndo();
      setIsRotating(true);
      const center = { x: glyphBounds.centerX, y: glyphBounds.centerY };
      const startAngleRad = Math.atan2(coords.y - center.y, coords.x - center.x);
      rotationDragRef.current = {
        startAngleRad,
        center,
        initialContours: JSON.parse(JSON.stringify(contours)),
        accumulatedDeg: 0,
      };
      setLiveRotationAngle(0);
      return;
    }

    // 5. If Select / Move Glyph tool is active:
    if (activeTool === 'select' || activeTool === 'transform') {
      // If a point was selected, clicking empty space deselects it
      if (selectedPoint) {
        setSelectedPoint(null);
        return;
      }

      e.preventDefault();
      setIsDraggingGlyph(true);
      setDragStartPos({
        mouseX: e.clientX,
        mouseY: e.clientY,
        startX: xOffset,
        startY: yOffset
      });
      return;
    }
  };

  // Mouse down on a point node (Starts dragging the point!)
  const handlePointMouseDown = (contourIndex: number, pointIndex: number, pt: Point, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // In Pen tool, clicking the first point of the contour closes the loop!
    if (activeTool === 'pen' && selectedPoint) {
      if (selectedPoint.contourIndex === contourIndex && pointIndex === 0 && selectedPoint.pointIndex > 1) {
        setSelectedPoint(null);
        return;
      }
    }

    setSelectedPoint({ contourIndex, pointIndex });
    setIsDraggingPoint(true);
    pointDragRef.current = {
      active: { contourIndex, pointIndex },
      initialX: pt.x,
      initialY: pt.y,
      startX: e.clientX,
      startY: e.clientY
    };
  };

  // Mouse down on bitmap resize handle
  const handleResizeHandleMouseDown = (handle: ResizeHandle, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const currentHeight = bitmapContainerRef.current?.offsetHeight || currentBitmapWidth;
    setResizingHandle(handle);
    setResizeStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      startScale: bitmapScale,
      startWidth: currentBitmapWidth,
      startHeight: currentHeight,
      startX: bitmapXOffset,
      startY: bitmapYOffset
    });
  };

  // Dragging guideline handlers (LSB and Advance Width)
  const handleGuideMouseDown = (guide: 'lsb' | 'advance', e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingGuide(guide);
    setGuideStart({
      mouseX: e.clientX,
      initialVal: guide === 'lsb' ? lsb : advanceWidth
    });
  };

  return {
    isDraggingGlyph,
    setIsDraggingGlyph,
    dragStartPos,
    setDragStartPos,
    isDraggingBitmap,
    setIsDraggingBitmap,
    bitmapDragStart,
    setBitmapDragStart,
    resizingHandle,
    setResizingHandle,
    resizeStart,
    setResizeStart,
    draggingGuide,
    setDraggingGuide,
    guideStart,
    setGuideStart,
    getFontCoordinates,
    handleCanvasMouseMove,
    handleCanvasMouseDown,
    handlePointMouseDown,
    handleResizeHandleMouseDown,
    handleGuideMouseDown,
  };
};
