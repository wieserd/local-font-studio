import { useState, useRef, useEffect } from 'react';
import { Glyph } from '../../../types/font';
import {
  Point,
  GlyphContour,
  SelectedPointRef,
  contoursToSvgPath,
  rotateContours,
  flipContours,
  smoothContours,
  slantContours,
  offsetContourWeight
} from '../../../utils/contourUtils';

interface UseContourStylizationProps {
  glyphChar: string;
  contours: GlyphContour[];
  selectedPoint: SelectedPointRef | null;
  pushUndo: () => void;
  updateGlyph: (char: string, partial: Partial<Glyph>) => void;
  setSavedToast: (val: boolean) => void;
}

export const useContourStylization = ({
  glyphChar,
  contours,
  selectedPoint,
  pushUndo,
  updateGlyph,
  setSavedToast,
}: UseContourStylizationProps) => {
  // Rotation states
  const [isRotating, setIsRotating] = useState(false);
  const [liveRotationAngle, setLiveRotationAngle] = useState(0);
  const [customRotationAngle, setCustomRotationAngle] = useState(45);
  const rotationDragRef = useRef<{
    startAngleRad: number;
    center: Point;
    initialContours: GlyphContour[];
    accumulatedDeg: number;
  } | null>(null);

  // Typographic Stylization: Stem Weight and Italic Slant states
  const [stemWeight, setStemWeight] = useState(0);
  const [italicSlant, setItalicSlant] = useState(0);
  const baseContoursRef = useRef<GlyphContour[] | null>(null);

  // Smoothing states
  const [smoothStrength, setSmoothStrength] = useState<number>(0.5);
  const [smoothIterations, setSmoothIterations] = useState<number>(1);
  const [preserveSharpCorners, setPreserveSharpCorners] = useState<boolean>(true);
  const [cornerThreshold, setCornerThreshold] = useState<number>(70);
  const [smoothToast, setSmoothToast] = useState<string | null>(null);

  // Reset when glyphChar changes
  useEffect(() => {
    setStemWeight(0);
    setItalicSlant(0);
    baseContoursRef.current = null;
    setIsRotating(false);
    setLiveRotationAngle(0);
  }, [glyphChar]);

  // Rotate glyph contours by angleDegrees around center
  const handleRotateGlyph = (angleDegrees: number) => {
    if (contours.length === 0 || angleDegrees === 0) return;
    pushUndo();
    baseContoursRef.current = null;
    setStemWeight(0);
    setItalicSlant(0);
    const updated = rotateContours(contours, angleDegrees);
    updateGlyph(glyphChar, { svgPath: contoursToSvgPath(updated) });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1500);
  };

  // Flip glyph contours horizontally or vertically
  const handleFlipGlyph = (direction: 'horizontal' | 'vertical') => {
    if (contours.length === 0) return;
    pushUndo();
    baseContoursRef.current = null;
    setStemWeight(0);
    setItalicSlant(0);
    const updated = flipContours(contours, direction);
    updateGlyph(glyphChar, { svgPath: contoursToSvgPath(updated) });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1500);
  };

  // Stylization: Stem Weight and Italic Slant handlers
  const applyStylizations = (weight: number, slant: number) => {
    if (!baseContoursRef.current) {
      baseContoursRef.current = contours;
      pushUndo();
    }
    let res = baseContoursRef.current;
    if (weight !== 0) {
      res = offsetContourWeight(res, weight);
    }
    if (slant !== 0) {
      res = slantContours(res, slant, 0);
    }
    updateGlyph(glyphChar, { svgPath: contoursToSvgPath(res) });
  };

  const handleStemWeightChange = (newWeight: number) => {
    setStemWeight(newWeight);
    applyStylizations(newWeight, italicSlant);
  };

  const handleItalicSlantChange = (newSlant: number) => {
    setItalicSlant(newSlant);
    applyStylizations(stemWeight, newSlant);
  };

  const handleResetStylize = () => {
    if (baseContoursRef.current) {
      pushUndo();
      updateGlyph(glyphChar, { svgPath: contoursToSvgPath(baseContoursRef.current) });
      baseContoursRef.current = null;
    }
    setStemWeight(0);
    setItalicSlant(0);
  };

  // Smooth glyph contours using Laplacian relaxation or Chaikin corner-cutting
  const handleSmoothContours = (subdivide: boolean, localOnly: boolean = false) => {
    if (contours.length === 0) return;
    pushUndo();

    const smoothed = smoothContours(contours, {
      iterations: smoothIterations,
      strength: smoothStrength,
      cornerThreshold,
      preserveCorners: preserveSharpCorners,
      subdivide,
      selectedRef: localOnly ? selectedPoint : null,
    });

    const newPath = contoursToSvgPath(smoothed);
    updateGlyph(glyphChar, {
      svgPath: newPath,
      contours: smoothed,
    });

    const msg = localOnly
      ? 'Smoothed curve around point!'
      : subdivide
        ? 'Subdivided & rounded curves!'
        : `Smoothed glyph (${Math.round(smoothStrength * 100)}%)!`;
    setSmoothToast(msg);
    setTimeout(() => setSmoothToast(null), 2500);
  };

  const resetStylizationBaseline = () => {
    setStemWeight(0);
    setItalicSlant(0);
    baseContoursRef.current = null;
  };

  return {
    isRotating,
    setIsRotating,
    liveRotationAngle,
    setLiveRotationAngle,
    customRotationAngle,
    setCustomRotationAngle,
    rotationDragRef,
    stemWeight,
    setStemWeight,
    italicSlant,
    setItalicSlant,
    baseContoursRef,
    smoothStrength,
    setSmoothStrength,
    smoothIterations,
    setSmoothIterations,
    preserveSharpCorners,
    setPreserveSharpCorners,
    cornerThreshold,
    setCornerThreshold,
    smoothToast,
    handleRotateGlyph,
    handleFlipGlyph,
    handleStemWeightChange,
    handleItalicSlantChange,
    handleResetStylize,
    handleSmoothContours,
    resetStylizationBaseline,
  };
};
