import { useState, useEffect } from 'react';
import { Glyph } from '../../../types/font';
import {
  Point,
  GlyphContour,
  SelectedPointRef,
  contoursToSvgPath,
  insertPointInContour,
  deletePointFromContour,
  computeContoursBounds
} from '../../../utils/contourUtils';
import { EditorTool } from '../types';

type ContoursBounds = ReturnType<typeof computeContoursBounds>;

interface UseVectorPointEditingProps {
  glyphChar: string;
  currentGlyph: Glyph;
  contours: GlyphContour[];
  glyphBounds: ContoursBounds | null;
  updateGlyph: (char: string, partial: Partial<Glyph>) => void;
  setActiveTool: (tool: EditorTool) => void;
  onResetStylizationBaseline: () => void;
}

export const useVectorPointEditing = ({
  glyphChar,
  currentGlyph,
  contours,
  glyphBounds,
  updateGlyph,
  setActiveTool,
  onResetStylizationBaseline,
}: UseVectorPointEditingProps) => {
  // Undo / Redo history for path edits
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  // Selected vector point state
  const [selectedPoint, setSelectedPoint] = useState<SelectedPointRef | null>(null);
  const [isDraggingPoint, setIsDraggingPoint] = useState(false);

  // Mouse font coordinates tracking for rubber band
  const [mouseFontPos, setMouseFontPos] = useState<Point | null>(null);

  // Edge hover preview for inserting points with Pen / Node tool
  const [hoverEdge, setHoverEdge] = useState<{
    contourIndex: number;
    segmentIndex: number;
    projectedPoint: Point;
  } | null>(null);

  // Reset on glyph change
  useEffect(() => {
    setSelectedPoint(null);
    setUndoStack([]);
    setRedoStack([]);
    setHoverEdge(null);
    setMouseFontPos(null);
  }, [glyphChar]);

  // Push current path to undo stack before an edit
  const pushUndo = () => {
    setUndoStack(prev => [...prev.slice(-25), currentGlyph.svgPath]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prevPath = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, prev.length - 1));
    setRedoStack(prev => [...prev, currentGlyph.svgPath]);
    updateGlyph(glyphChar, { svgPath: prevPath });
    setSelectedPoint(null);
    onResetStylizationBaseline();
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextPath = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, prev.length - 1));
    setUndoStack(prev => [...prev, currentGlyph.svgPath]);
    updateGlyph(glyphChar, { svgPath: nextPath });
    setSelectedPoint(null);
    onResetStylizationBaseline();
  };

  // Delete the currently selected point
  const handleDeleteSelectedPoint = () => {
    if (!selectedPoint) return;
    pushUndo();
    const newContours = deletePointFromContour(
      contours,
      selectedPoint.contourIndex,
      selectedPoint.pointIndex
    );
    const newPath = contoursToSvgPath(newContours);
    updateGlyph(glyphChar, { svgPath: newPath });
    setSelectedPoint(null);
  };

  // Add a point directly connected to the selected point
  const handleAddPointConnectedToSelected = (pt: Point) => {
    if (!selectedPoint) return;
    pushUndo();

    const targetContourIndex = selectedPoint.contourIndex;
    const insertAfterIndex = selectedPoint.pointIndex;

    const newContours = insertPointInContour(
      contours,
      targetContourIndex,
      insertAfterIndex,
      pt
    );

    const newPath = contoursToSvgPath(newContours);
    updateGlyph(glyphChar, { svgPath: newPath });

    // Select the newly added point so the NEXT point connects directly to it!
    setSelectedPoint({
      contourIndex: targetContourIndex,
      pointIndex: insertAfterIndex + 1
    });
  };

  // Start a new point or append to the last contour
  const handleStartNewPoint = (pt: Point) => {
    pushUndo();
    let newContours = [...contours];
    let targetIndex = 0;
    let pointIndex = 0;

    if (newContours.length === 0) {
      newContours = [[pt]];
      targetIndex = 0;
      pointIndex = 0;
    } else {
      targetIndex = newContours.length - 1;
      const lastContour = newContours[targetIndex];
      newContours = insertPointInContour(newContours, targetIndex, lastContour.length - 1, pt);
      pointIndex = newContours[targetIndex].length - 1;
    }

    const newPath = contoursToSvgPath(newContours);
    updateGlyph(glyphChar, { svgPath: newPath });
    setSelectedPoint({
      contourIndex: targetIndex,
      pointIndex
    });
  };

  // Start a brand new contour from scratch
  const handleStartNewContour = () => {
    pushUndo();
    let centerPt = { x: 300, y: 350 };
    if (glyphBounds) {
      centerPt = {
        x: Math.round(glyphBounds.minX + glyphBounds.width / 2),
        y: Math.round(glyphBounds.minY + glyphBounds.height / 2)
      };
    }
    const newContours = [...contours, [centerPt]];
    const newPath = contoursToSvgPath(newContours);
    updateGlyph(glyphChar, { svgPath: newPath });
    setSelectedPoint({
      contourIndex: newContours.length - 1,
      pointIndex: 0
    });
    setActiveTool('pen');
  };

  // Insert point on the hovered edge (when explicitly splitting an edge)
  const handleInsertPointOnHoverEdge = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hoverEdge) return;
    pushUndo();
    const newContours = insertPointInContour(
      contours,
      hoverEdge.contourIndex,
      hoverEdge.segmentIndex,
      hoverEdge.projectedPoint
    );
    const newPath = contoursToSvgPath(newContours);
    updateGlyph(glyphChar, { svgPath: newPath });
    setSelectedPoint({
      contourIndex: hoverEdge.contourIndex,
      pointIndex: hoverEdge.segmentIndex + 1
    });
    setHoverEdge(null);
  };

  return {
    undoStack,
    redoStack,
    pushUndo,
    handleUndo,
    handleRedo,
    selectedPoint,
    setSelectedPoint,
    isDraggingPoint,
    setIsDraggingPoint,
    mouseFontPos,
    setMouseFontPos,
    hoverEdge,
    setHoverEdge,
    handleDeleteSelectedPoint,
    handleAddPointConnectedToSelected,
    handleStartNewPoint,
    handleStartNewContour,
    handleInsertPointOnHoverEdge,
  };
};
