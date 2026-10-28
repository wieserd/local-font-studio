import { useState, useRef } from 'react';
import { Glyph, ProjectState } from '../../../types/font';
import { GlyphContour, contoursToSvgPath } from '../../../utils/contourUtils';
import { exportSingleGlyphAsSvg } from '../../../utils/svgExporter';
import { parseSvgToGlyphPath } from '../../../utils/svgImporter';

interface SvgCandidate {
  filename: string;
  svgPath: string;
  advanceWidth: number;
  lsb: number;
  rsb: number;
}

interface UseGlyphSvgIOProps {
  glyphChar: string;
  currentGlyph: Glyph;
  project: ProjectState;
  contours: GlyphContour[];
  advanceWidth: number;
  setAdvanceWidth: (val: number) => void;
  setLsb: (val: number) => void;
  setRsb: (val: number) => void;
  pushUndo: () => void;
  updateGlyph: (char: string, partial: Partial<Glyph>) => void;
}

export const useGlyphSvgIO = ({
  glyphChar,
  currentGlyph,
  project,
  contours,
  advanceWidth,
  setAdvanceWidth,
  setLsb,
  setRsb,
  pushUndo,
  updateGlyph,
}: UseGlyphSvgIOProps) => {
  const [exportToast, setExportToast] = useState<string | null>(null);
  const [importSvgCandidate, setImportSvgCandidate] = useState<SvgCandidate | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export current single glyph as a standalone .svg file
  const handleExportSvg = () => {
    if (glyphChar === ' ') return;
    const currentSvgPath = contoursToSvgPath(contours) || currentGlyph.svgPath || '';
    const result = exportSingleGlyphAsSvg({
      glyph: currentGlyph,
      metrics: project.metrics,
      familyName: project.name || project.metadata?.family,
      styleName: project.metadata?.style,
      customAdvanceWidth: advanceWidth,
      customSvgPath: currentSvgPath,
    });

    if (result.success) {
      setExportToast(`Exported '${glyphChar}' as ${result.filename}`);
      setTimeout(() => setExportToast(null), 3000);
    }
  };

  const handleOpenImportDialog = () => {
    if (glyphChar === ' ') return;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const svgText = event.target?.result as string;
      if (!svgText) return;

      const result = parseSvgToGlyphPath(svgText, project.metrics);
      if (!result.success) {
        alert(`Could not import SVG: ${result.error || 'Invalid vector format'}`);
        return;
      }

      setImportSvgCandidate({
        filename: file.name,
        svgPath: result.svgPath,
        advanceWidth: result.advanceWidth,
        lsb: result.lsb,
        rsb: result.rsb,
      });
    };
    reader.readAsText(file);
  };

  const handleConfirmImportSvg = () => {
    if (!importSvgCandidate) return;

    pushUndo();
    updateGlyph(glyphChar, {
      svgPath: importSvgCandidate.svgPath,
      advanceWidth: importSvgCandidate.advanceWidth,
      lsb: importSvgCandidate.lsb,
      rsb: importSvgCandidate.rsb,
      isAssigned: true
    });
    setAdvanceWidth(importSvgCandidate.advanceWidth);
    setLsb(importSvgCandidate.lsb);
    setRsb(importSvgCandidate.rsb);

    setExportToast(`Replaced glyph '${glyphChar}' with ${importSvgCandidate.filename}`);
    setTimeout(() => setExportToast(null), 3500);

    setImportSvgCandidate(null);
  };

  return {
    exportToast,
    importSvgCandidate,
    setImportSvgCandidate,
    fileInputRef,
    handleExportSvg,
    handleOpenImportDialog,
    handleFileSelected,
    handleConfirmImportSvg,
  };
};
