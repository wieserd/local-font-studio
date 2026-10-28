import React from 'react';
import { RefreshCw, Sliders } from 'lucide-react';
import { Glyph } from '../../types/font';
import { Point, GlyphContour } from '../../utils/contourUtils';
import { GlyphAuditReport, AuditIssue } from '../../utils/fontAudit';
import { EditorTool, AccordionSectionId } from './types';
import { StandardSidebar } from '../../components/sidebar';
import { MetricsSection } from './sections/MetricsSection';
import { TransformSection } from './sections/TransformSection';
import { CurvesSection } from './sections/CurvesSection';
import { NodesSection } from './sections/NodesSection';
import { BitmapSection } from './sections/BitmapSection';
import { AdvancedToolsSection } from './sections/AdvancedToolsSection';

export interface EditorSidebarProps {
  glyphChar: string;
  currentGlyph: Glyph;
  allPoints: Array<{ x: number; y: number; contourIndex: number; pointIndex: number }>;
  contours: GlyphContour[];
  openSections: Record<AccordionSectionId, boolean>;
  handleExpandAll: () => void;
  handleCollapseAll: () => void;
  toggleSection: (section: AccordionSectionId) => void;
  onReplaceGlyph?: (char: string) => void;

  // 1. Metrics
  advanceWidth: number;
  setAdvanceWidth: (val: number) => void;
  lsb: number;
  setLsb: (val: number) => void;
  rsb: number;
  setRsb: (val: number) => void;
  handleSaveMetrics: () => void;
  savedToast: boolean;
  handleOpenImportDialog: () => void;
  handleExportSvg: () => void;

  // 2. Transform & Stylize
  xOffset: number;
  setXOffset: (val: number) => void;
  yOffset: number;
  setYOffset: (val: number) => void;
  updateGlyph: (char: string, partial: Partial<Glyph>) => void;
  handleCenterGlyph: () => void;
  handleResetPosition: () => void;
  scale: number;
  setScale: (val: number) => void;
  activeTool: EditorTool;
  handleRotateGlyph: (angle: number) => void;
  handleFlipGlyph: (direction: 'horizontal' | 'vertical') => void;
  customRotationAngle: number;
  setCustomRotationAngle: (val: number) => void;
  stemWeight: number;
  handleStemWeightChange: (val: number) => void;
  italicSlant: number;
  handleItalicSlantChange: (val: number) => void;
  handleResetStylize: () => void;

  // 3. Curves & Outlines
  smoothStrength: number;
  setSmoothStrength: (val: number) => void;
  smoothIterations: number;
  setSmoothIterations: (val: number) => void;
  smoothToast: string | null;
  preserveSharpCorners: boolean;
  setPreserveSharpCorners: (val: boolean) => void;
  cornerThreshold: number;
  setCornerThreshold: (val: number) => void;
  handleSmoothContours: (subdivide: boolean, localOnly: boolean) => void;
  selectedPoint: { contourIndex: number; pointIndex: number } | null;
  setSelectedPoint: (pt: { contourIndex: number; pointIndex: number } | null) => void;
  handleTriggerScaffolding: (featureName: string) => void;

  // 4. Vector Points & Nodes
  activeSelectedPointData: { point: Point; contourIndex: number; pointIndex: number } | null;
  handleDeleteSelectedPoint: () => void;
  handleStartNewContour: () => void;

  // 5. Source Bitmap & Retrace
  bitmapScale: number;
  setBitmapScale: (val: number) => void;
  bitmapXOffset: number;
  setBitmapXOffset: (val: number) => void;
  bitmapYOffset: number;
  setBitmapYOffset: (val: number) => void;
  handleAlignBitmapToGlyph: () => void;
  handleResetBitmapPosition: () => void;
  threshold: number;
  setThreshold: (val: number) => void;
  simplification: number;
  setSimplification: (val: number) => void;
  handleRetrace: () => void;
  handleLoadBitmap: (dataUrl: string) => void;
  handleDeleteBitmap: () => void;

  // 6. FontAudit & Path Tools
  auditReport: GlyphAuditReport;
  showAuditOverlay: boolean;
  setShowAuditOverlay: (val: boolean) => void;
  onAutoFixAll: () => void;
  onAutoFixWinding: () => void;
  onAutoFixMicroSegments: () => void;
  onAutoFixRedundantPoints: () => void;
  onFixAuditIssue?: (issue: AuditIssue) => void;
  onOpenFontAuditModal?: () => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  glyphChar,
  currentGlyph,
  allPoints,
  contours,
  openSections,
  handleExpandAll,
  handleCollapseAll,
  toggleSection,
  onReplaceGlyph,

  advanceWidth,
  setAdvanceWidth,
  lsb,
  setLsb,
  rsb,
  setRsb,
  handleSaveMetrics,
  savedToast,
  handleOpenImportDialog,
  handleExportSvg,

  xOffset,
  setXOffset,
  yOffset,
  setYOffset,
  updateGlyph,
  handleCenterGlyph,
  handleResetPosition,
  scale,
  setScale,
  activeTool,
  handleRotateGlyph,
  handleFlipGlyph,
  customRotationAngle,
  setCustomRotationAngle,

  stemWeight,
  handleStemWeightChange,
  italicSlant,
  handleItalicSlantChange,
  handleResetStylize,

  smoothStrength,
  setSmoothStrength,
  smoothIterations,
  setSmoothIterations,
  smoothToast,
  preserveSharpCorners,
  setPreserveSharpCorners,
  cornerThreshold,
  setCornerThreshold,
  handleSmoothContours,
  selectedPoint,
  setSelectedPoint,
  handleTriggerScaffolding,

  activeSelectedPointData,
  handleDeleteSelectedPoint,
  handleStartNewContour,

  bitmapScale,
  setBitmapScale,
  bitmapXOffset,
  setBitmapXOffset,
  bitmapYOffset,
  setBitmapYOffset,
  handleAlignBitmapToGlyph,
  handleResetBitmapPosition,
  threshold,
  setThreshold,
  simplification,
  setSimplification,
  handleRetrace,
  handleLoadBitmap,
  handleDeleteBitmap,

  auditReport,
  showAuditOverlay,
  setShowAuditOverlay,
  onAutoFixAll,
  onAutoFixWinding,
  onAutoFixMicroSegments,
  onAutoFixRedundantPoints,
  onFixAuditIssue,
  onOpenFontAuditModal
}) => {
  return (
    <StandardSidebar
      title="Glyph Settings"
      subtitle={`'${glyphChar}' · ${currentGlyph.unicode} · ${allPoints.length} Pts · ${contours.length} Loops`}
      icon={<Sliders size={15} color="var(--accent)" />}
      onExpandAll={handleExpandAll}
      onCollapseAll={handleCollapseAll}
      extraHeaderContent={
        onReplaceGlyph && glyphChar !== ' ' ? (
          <button
            className="btn-secondary"
            onClick={() => onReplaceGlyph(glyphChar)}
            style={{ width: '100%', justifyContent: 'center', fontSize: '11px', padding: '5px 10px', marginTop: '2px', gap: '5px' }}
            title="Navigate to Import Artwork to frame and replace this glyph from scan"
          >
            <RefreshCw size={12} />
            <span>Replace Glyph from Artwork</span>
          </button>
        ) : undefined
      }
    >
      {/* 1. METRICS & SPACING */}
      <MetricsSection
        isOpen={openSections.metrics}
        onToggle={() => toggleSection('metrics')}
        glyphChar={glyphChar}
        advanceWidth={advanceWidth}
        setAdvanceWidth={setAdvanceWidth}
        lsb={lsb}
        setLsb={setLsb}
        rsb={rsb}
        setRsb={setRsb}
        handleSaveMetrics={handleSaveMetrics}
        savedToast={savedToast}
        handleOpenImportDialog={handleOpenImportDialog}
        handleExportSvg={handleExportSvg}
      />

      {/* 2. TRANSFORM & STYLIZE */}
      <TransformSection
        isOpen={openSections.transform}
        onToggle={() => toggleSection('transform')}
        glyphChar={glyphChar}
        xOffset={xOffset}
        setXOffset={setXOffset}
        yOffset={yOffset}
        setYOffset={setYOffset}
        updateGlyph={updateGlyph}
        handleCenterGlyph={handleCenterGlyph}
        handleResetPosition={handleResetPosition}
        scale={scale}
        setScale={setScale}
        activeTool={activeTool}
        handleRotateGlyph={handleRotateGlyph}
        handleFlipGlyph={handleFlipGlyph}
        customRotationAngle={customRotationAngle}
        setCustomRotationAngle={setCustomRotationAngle}
        stemWeight={stemWeight}
        handleStemWeightChange={handleStemWeightChange}
        italicSlant={italicSlant}
        handleItalicSlantChange={handleItalicSlantChange}
        handleResetStylize={handleResetStylize}
      />

      {/* 3. CURVES & OUTLINES */}
      <CurvesSection
        isOpen={openSections.curves}
        onToggle={() => toggleSection('curves')}
        smoothStrength={smoothStrength}
        setSmoothStrength={setSmoothStrength}
        smoothIterations={smoothIterations}
        setSmoothIterations={setSmoothIterations}
        preserveSharpCorners={preserveSharpCorners}
        setPreserveSharpCorners={setPreserveSharpCorners}
        cornerThreshold={cornerThreshold}
        setCornerThreshold={setCornerThreshold}
        smoothToast={smoothToast}
        handleSmoothContours={handleSmoothContours}
        selectedPoint={selectedPoint}
        handleTriggerScaffolding={handleTriggerScaffolding}
      />

      {/* 4. VECTOR POINTS & NODES */}
      <NodesSection
        isOpen={openSections.nodes}
        onToggle={() => toggleSection('nodes')}
        selectedPoint={selectedPoint}
        setSelectedPoint={setSelectedPoint}
        activeSelectedPointData={activeSelectedPointData}
        allPointsCount={allPoints.length}
        contours={contours}
        glyphChar={glyphChar}
        updateGlyph={updateGlyph}
        handleDeleteSelectedPoint={handleDeleteSelectedPoint}
        handleStartNewContour={handleStartNewContour}
        handleTriggerScaffolding={handleTriggerScaffolding}
      />

      {/* 5. SOURCE BITMAP & RETRACE */}
      <BitmapSection
        isOpen={openSections.bitmap}
        onToggle={() => toggleSection('bitmap')}
        currentGlyph={currentGlyph}
        glyphChar={glyphChar}
        bitmapScale={bitmapScale}
        setBitmapScale={setBitmapScale}
        bitmapXOffset={bitmapXOffset}
        setBitmapXOffset={setBitmapXOffset}
        bitmapYOffset={bitmapYOffset}
        setBitmapYOffset={setBitmapYOffset}
        updateGlyph={updateGlyph}
        handleAlignBitmapToGlyph={handleAlignBitmapToGlyph}
        handleResetBitmapPosition={handleResetBitmapPosition}
        threshold={threshold}
        setThreshold={setThreshold}
        simplification={simplification}
        setSimplification={setSimplification}
        handleRetrace={handleRetrace}
        handleLoadBitmap={handleLoadBitmap}
        handleDeleteBitmap={handleDeleteBitmap}
      />

      {/* 6. ADVANCED PATH TOOLS & FONTAUDIT */}
      <AdvancedToolsSection
        isOpen={openSections.advanced}
        onToggle={() => toggleSection('advanced')}
        auditReport={auditReport}
        showAuditOverlay={showAuditOverlay}
        setShowAuditOverlay={setShowAuditOverlay}
        onAutoFixAll={onAutoFixAll}
        onAutoFixWinding={onAutoFixWinding}
        onAutoFixMicroSegments={onAutoFixMicroSegments}
        onAutoFixRedundantPoints={onAutoFixRedundantPoints}
        onFixAuditIssue={onFixAuditIssue}
        selectedPoint={selectedPoint}
        onSelectPoint={setSelectedPoint}
        onOpenFontAuditModal={onOpenFontAuditModal}
        handleTriggerScaffolding={handleTriggerScaffolding}
      />
    </StandardSidebar>
  );
};
