import { useState, useEffect } from 'react';
import { Glyph } from '../../../types/font';
import { computeContoursBounds } from '../../../utils/contourUtils';

type ContoursBounds = ReturnType<typeof computeContoursBounds>;

interface UseGlyphMetricsProps {
  glyphChar: string;
  currentGlyph: Glyph;
  glyphBounds: ContoursBounds | null;
  fontScale: number;
  updateGlyph: (char: string, partial: Partial<Glyph>) => void;
}

export const useGlyphMetrics = ({
  glyphChar,
  currentGlyph,
  glyphBounds,
  fontScale,
  updateGlyph,
}: UseGlyphMetricsProps) => {
  const [scale, setScale] = useState(currentGlyph.scale || 100);
  const [advanceWidth, setAdvanceWidth] = useState(currentGlyph.advanceWidth || 600);
  const [lsb, setLsb] = useState(currentGlyph.lsb || 40);
  const [rsb, setRsb] = useState(currentGlyph.rsb || 40);
  const [xOffset, setXOffset] = useState(currentGlyph.xOffset || 0);
  const [yOffset, setYOffset] = useState(currentGlyph.yOffset || 0);
  const [savedToast, setSavedToast] = useState(false);

  // Sync state when switching glyph
  useEffect(() => {
    setScale(currentGlyph.scale || 100);
    setAdvanceWidth(currentGlyph.advanceWidth || 600);
    setLsb(currentGlyph.lsb || 40);
    setRsb(currentGlyph.rsb || 40);
    setXOffset(currentGlyph.xOffset || 0);
    setYOffset(currentGlyph.yOffset || 0);
  }, [glyphChar]);

  // Center glyph contour horizontally within Advance Width
  const handleCenterGlyph = () => {
    if (!glyphBounds) return;
    const scaledWidth = glyphBounds.width * fontScale * (scale / 100);
    const canvasAdvance = advanceWidth * fontScale;
    const targetLeft = (canvasAdvance - scaledWidth) / 2;
    const currentLeft = glyphBounds.minX * fontScale * (scale / 100);
    const newX = Math.round(targetLeft - currentLeft);
    setXOffset(newX);
    updateGlyph(glyphChar, { xOffset: newX });
  };

  // Reset glyph position (0, 0)
  const handleResetPosition = () => {
    setXOffset(0);
    setYOffset(0);
    updateGlyph(glyphChar, { xOffset: 0, yOffset: 0 });
  };

  // Save changes to FontContext
  const handleSaveMetrics = () => {
    updateGlyph(glyphChar, {
      scale,
      advanceWidth,
      lsb,
      rsb,
      xOffset,
      yOffset,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return {
    scale,
    setScale,
    advanceWidth,
    setAdvanceWidth,
    lsb,
    setLsb,
    rsb,
    setRsb,
    xOffset,
    setXOffset,
    yOffset,
    setYOffset,
    savedToast,
    setSavedToast,
    handleCenterGlyph,
    handleResetPosition,
    handleSaveMetrics,
  };
};
