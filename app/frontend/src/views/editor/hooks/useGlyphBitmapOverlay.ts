import { useState, useEffect } from 'react';
import { Glyph, FontMetrics } from '../../../types/font';
import { traceDataUrl } from '../../../utils/vectorizer';

interface UseGlyphBitmapOverlayProps {
  glyphChar: string;
  currentGlyph: Glyph;
  metrics: FontMetrics;
  xOffset: number;
  yOffset: number;
  pushUndo: () => void;
  updateGlyph: (char: string, partial: Partial<Glyph>) => void;
  onClearSelectedPoint?: () => void;
}

export const useGlyphBitmapOverlay = ({
  glyphChar,
  currentGlyph,
  metrics,
  xOffset,
  yOffset,
  pushUndo,
  updateGlyph,
  onClearSelectedPoint,
}: UseGlyphBitmapOverlayProps) => {
  const [bitmapXOffset, setBitmapXOffset] = useState(currentGlyph.bitmapXOffset || 0);
  const [bitmapYOffset, setBitmapYOffset] = useState(currentGlyph.bitmapYOffset || 0);
  const [bitmapScale, setBitmapScale] = useState(currentGlyph.bitmapScale || 100);
  const [threshold, setThreshold] = useState(128);
  const [smoothing, setSmoothing] = useState(2);
  const [simplification, setSimplification] = useState(1.5);
  const [showOriginalImage, setShowOriginalImage] = useState(true);

  // Sync state on glyph change
  useEffect(() => {
    setBitmapXOffset(currentGlyph.bitmapXOffset || 0);
    setBitmapYOffset(currentGlyph.bitmapYOffset || 0);
    setBitmapScale(currentGlyph.bitmapScale || 100);
  }, [glyphChar]);

  // Re-trace from original bitmap if available
  const handleRetrace = async () => {
    if (!currentGlyph.originalImage) return;
    try {
      pushUndo();
      const result = await traceDataUrl(currentGlyph.originalImage, {
        threshold,
        simplification,
        smoothing,
        upm: metrics.upm,
        capHeight: metrics.capHeight,
        baseline: 0
      });
      updateGlyph(glyphChar, {
        svgPath: result.svgPath,
        advanceWidth: result.advanceWidth,
        lsb: result.lsb,
        rsb: result.rsb
      });
      onClearSelectedPoint?.();
    } catch (err) {
      console.error('Error retracing', err);
    }
  };

  // Load or replace bitmap image for the current glyph
  const handleLoadBitmap = (dataUrl: string) => {
    pushUndo();
    updateGlyph(glyphChar, {
      originalImage: dataUrl,
      bitmapScale: bitmapScale || 100,
      bitmapXOffset: bitmapXOffset || 0,
      bitmapYOffset: bitmapYOffset || 0
    });
    setShowOriginalImage(true);
  };

  // Delete/clear bitmap image for the current glyph
  const handleDeleteBitmap = () => {
    pushUndo();
    updateGlyph(glyphChar, {
      originalImage: undefined
    });
  };

  // Reset bitmap position and scale (0, 0, 100%)
  const handleResetBitmapPosition = () => {
    setBitmapXOffset(0);
    setBitmapYOffset(0);
    setBitmapScale(100);
    updateGlyph(glyphChar, { bitmapXOffset: 0, bitmapYOffset: 0, bitmapScale: 100 });
  };

  // Align bitmap position to glyph position
  const handleAlignBitmapToGlyph = () => {
    setBitmapXOffset(xOffset);
    setBitmapYOffset(yOffset);
    updateGlyph(glyphChar, { bitmapXOffset: xOffset, bitmapYOffset: yOffset });
  };

  return {
    bitmapXOffset,
    setBitmapXOffset,
    bitmapYOffset,
    setBitmapYOffset,
    bitmapScale,
    setBitmapScale,
    threshold,
    setThreshold,
    smoothing,
    setSmoothing,
    simplification,
    setSimplification,
    showOriginalImage,
    setShowOriginalImage,
    handleRetrace,
    handleLoadBitmap,
    handleDeleteBitmap,
    handleResetBitmapPosition,
    handleAlignBitmapToGlyph,
  };
};
