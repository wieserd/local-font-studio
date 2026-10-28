import { useMemo } from 'react';
import { Glyph } from '../../../types/font';
import {
  parseSvgPathToContours,
  computeContoursBounds,
  translateContours,
  contoursToSvgPath,
  centerGlyphContours
} from '../../../utils/contourUtils';
import { calculateOpticalSpacing } from '../../../utils/opticalSpacing';
import { GlyphMetricData } from '../types';

interface UseMetricsBatchActionsProps {
  glyphsMetricData: Record<string, GlyphMetricData>;
  filteredGlyphs: GlyphMetricData[];
  defaultAdvance: number;
  defaultLsb: number;
  defaultRsb: number;
  updateGlyph: (char: string, partial: Partial<Glyph>) => void;
  updateGlyphsBatch: (updates: Array<{ char: string; partial: Partial<Glyph> }>) => void;
  showToast: (msg: string) => void;
  showAutoSpaceModal: boolean;
  setShowAutoSpaceModal: (val: boolean) => void;
  autoSpaceBasePadding: number;
  autoSpaceScope: 'all' | 'uppercase' | 'lowercase' | 'numbers' | 'selection';
}

export function useMetricsBatchActions({
  glyphsMetricData,
  filteredGlyphs,
  defaultAdvance,
  defaultLsb,
  defaultRsb,
  updateGlyph,
  updateGlyphsBatch,
  showToast,
  showAutoSpaceModal,
  setShowAutoSpaceModal,
  autoSpaceBasePadding,
  autoSpaceScope
}: UseMetricsBatchActionsProps) {

  const handleUpdateLsb = (char: string, newLsb: number) => {
    const targetLsb = Math.max(0, Math.round(newLsb));
    const data = glyphsMetricData[char];
    if (!data || char === ' ') return;

    if (data.hasArtwork) {
      const contours = parseSvgPathToContours(data.glyph.svgPath);
      if (contours.length > 0) {
        const bounds = computeContoursBounds(contours);
        const shiftX = targetLsb - bounds.minX;
        const translated = translateContours(contours, shiftX, 0);
        const newSvgPath = contoursToSvgPath(translated);
        const newRsb = Math.max(0, data.advanceWidth - (targetLsb + bounds.width));

        updateGlyph(char, {
          svgPath: newSvgPath,
          lsb: targetLsb,
          rsb: newRsb
        });
        return;
      }
    }

    const newRsb = Math.max(0, data.advanceWidth - targetLsb);
    updateGlyph(char, {
      lsb: targetLsb,
      rsb: newRsb
    });
  };

  const handleUpdateRsb = (char: string, newRsb: number) => {
    const targetRsb = Math.max(0, Math.round(newRsb));
    const data = glyphsMetricData[char];
    if (!data || char === ' ') return;

    const newAdvance = data.hasArtwork
      ? data.lsb + data.artworkWidth + targetRsb
      : data.lsb + targetRsb;

    updateGlyph(char, {
      advanceWidth: Math.max(10, Math.round(newAdvance)),
      rsb: targetRsb
    });
  };

  const handleAutoCenterGlyph = (char: string) => {
    const data = glyphsMetricData[char];
    if (!data || char === ' ') return;

    if (data.hasArtwork) {
      const centered = centerGlyphContours(data.glyph.svgPath, data.advanceWidth);
      if (centered) {
        updateGlyph(char, {
          svgPath: centered.newSvgPath,
          lsb: centered.newLsb,
          rsb: centered.newRsb
        });
        showToast(`Auto-centered glyph "${char}" (LSB: ${centered.newLsb}, RSB: ${centered.newRsb})`);
        return;
      }
    }

    const half = Math.round(data.advanceWidth / 2);
    updateGlyph(char, {
      lsb: half,
      rsb: half
    });
    showToast(`Balanced sidebearings for "${char}" to ${half}`);
  };

  const handleBatchAdjustAdvance = (delta: number) => {
    const updates: Array<{ char: string; partial: Partial<Glyph> }> = [];

    filteredGlyphs.forEach(item => {
      const nextAdvance = Math.max(10, item.advanceWidth + delta);
      const nextRsb = Math.max(0, item.rsb + delta);
      updates.push({
        char: item.char,
        partial: {
          advanceWidth: nextAdvance,
          rsb: nextRsb
        }
      });
    });

    updateGlyphsBatch(updates);
    showToast(`Adjusted advance width by ${delta > 0 ? `+${delta}` : delta} for ${updates.length} glyphs`);
  };

  const handleBatchAutoCenter = () => {
    const updates: Array<{ char: string; partial: Partial<Glyph> }> = [];
    let centeredArtworkCount = 0;

    filteredGlyphs.forEach(item => {
      if (item.hasArtwork) {
        const centered = centerGlyphContours(item.glyph.svgPath, item.advanceWidth);
        if (centered) {
          updates.push({
            char: item.char,
            partial: {
              svgPath: centered.newSvgPath,
              lsb: centered.newLsb,
              rsb: centered.newRsb
            }
          });
          centeredArtworkCount++;
          return;
        }
      }

      const half = Math.round(item.advanceWidth / 2);
      updates.push({
        char: item.char,
        partial: { lsb: half, rsb: half }
      });
    });

    updateGlyphsBatch(updates);
    showToast(`Auto-centered ${centeredArtworkCount} vector glyphs (${updates.length} total)`);
  };

  const handleBatchResetToDefaults = () => {
    const updates: Array<{ char: string; partial: Partial<Glyph> }> = [];
    filteredGlyphs.forEach(item => {
      if (item.hasArtwork) {
        const contours = parseSvgPathToContours(item.glyph.svgPath);
        if (contours.length > 0) {
          const bounds = computeContoursBounds(contours);
          const shiftX = defaultLsb - bounds.minX;
          const translated = translateContours(contours, shiftX, 0);
          const newSvgPath = contoursToSvgPath(translated);
          const newAdvance = defaultLsb + bounds.width + defaultRsb;
          updates.push({
            char: item.char,
            partial: {
              svgPath: newSvgPath,
              advanceWidth: newAdvance,
              lsb: defaultLsb,
              rsb: defaultRsb
            }
          });
          return;
        }
      }

      updates.push({
        char: item.char,
        partial: {
          advanceWidth: defaultAdvance,
          lsb: defaultLsb,
          rsb: defaultRsb
        }
      });
    });

    updateGlyphsBatch(updates);
    showToast(`Reset ${updates.length} glyphs to default sidebearings (${defaultLsb} / ${defaultRsb})`);
  };

  const opticalCandidates = useMemo(() => {
    if (!showAutoSpaceModal) return [];

    const candidates = Object.values(glyphsMetricData).filter(item => {
      if (item.char === ' ') return false;
      if (!item.hasArtwork) return false;
      if (autoSpaceScope === 'uppercase') return item.category === 'uppercase';
      if (autoSpaceScope === 'lowercase') return item.category === 'lowercase';
      if (autoSpaceScope === 'numbers') return item.category === 'numbers';
      if (autoSpaceScope === 'selection') {
        return filteredGlyphs.some(fg => fg.char === item.char);
      }
      return true;
    });

    return candidates.map(item => {
      let contours: any[] = [];
      try {
        contours = parseSvgPathToContours(item.glyph.svgPath);
      } catch {}

      const result = calculateOpticalSpacing({
        char: item.char,
        glyph: item.glyph,
        basePadding: autoSpaceBasePadding,
        contours
      });

      return {
        item,
        contours,
        ...result
      };
    });
  }, [showAutoSpaceModal, autoSpaceBasePadding, autoSpaceScope, glyphsMetricData, filteredGlyphs]);

  const handleApplyOpticalSpacing = () => {
    const updates: Array<{ char: string; partial: Partial<Glyph> }> = [];

    opticalCandidates.forEach(entry => {
      if (entry.contours.length > 0) {
        const translated = translateContours(entry.contours, entry.shiftX, 0);
        const newSvgPath = contoursToSvgPath(translated);

        updates.push({
          char: entry.item.char,
          partial: {
            svgPath: newSvgPath,
            advanceWidth: entry.proposedAdvance,
            lsb: entry.proposedLsb,
            rsb: entry.proposedRsb
          }
        });
      } else {
        updates.push({
          char: entry.item.char,
          partial: {
            advanceWidth: entry.proposedAdvance,
            lsb: entry.proposedLsb,
            rsb: entry.proposedRsb
          }
        });
      }
    });

    if (updates.length === 0) {
      showToast('No glyphs were affected by optical spacing.');
      setShowAutoSpaceModal(false);
      return;
    }

    updateGlyphsBatch(updates);
    setShowAutoSpaceModal(false);
    showToast(`Applied optical spacing to ${updates.length} glyphs! (Base: ${autoSpaceBasePadding} U)`);
  };

  return {
    handleUpdateLsb,
    handleUpdateRsb,
    handleAutoCenterGlyph,
    handleBatchAdjustAdvance,
    handleBatchAutoCenter,
    handleBatchResetToDefaults,
    opticalCandidates,
    handleApplyOpticalSpacing
  };
}
