import React, { useState, useRef, useEffect } from 'react';
import {
  RefreshCw,
  Upload,
  Download,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Wand2,
  X,
  Eye,
  EyeOff,
  Maximize2
} from 'lucide-react';
import { GlyphAuditReport, AuditIssue } from '../../utils/fontAudit';

interface EditorSubheaderProps {
  glyphChar: string;
  unicode: string;
  pointCount: number;
  capHeight: number;
  advanceWidth: number;
  hasOriginalImage: boolean;
  zoom: number;
  setZoom: (v: number) => void;
  showOriginalImage: boolean;
  setShowOriginalImage: (v: boolean) => void;
  showNodes: boolean;
  setShowNodes: (v: boolean) => void;
  auditReport?: GlyphAuditReport;
  showAuditOverlay?: boolean;
  setShowAuditOverlay?: (v: boolean) => void;
  onToggleAuditSection?: () => void;
  onAutoFixAll?: () => void;
  onFixAuditIssue?: (issue: AuditIssue) => void;
  onOpenFontAuditModal?: () => void;
  onReplaceGlyph?: (char: string) => void;
  onOpenImportDialog: () => void;
  onExportSvg: () => void;
}

export const EditorSubheader: React.FC<EditorSubheaderProps> = ({
  glyphChar,
  unicode,
  pointCount,
  capHeight,
  advanceWidth,
  hasOriginalImage,
  zoom,
  setZoom,
  showOriginalImage,
  setShowOriginalImage,
  showNodes,
  setShowNodes,
  auditReport,
  showAuditOverlay,
  setShowAuditOverlay,
  onToggleAuditSection,
  onAutoFixAll,
  onFixAuditIssue,
  onOpenFontAuditModal,
  onReplaceGlyph,
  onOpenImportDialog,
  onExportSvg
}) => {
  const [isAuditPopoverOpen, setIsAuditPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Close popover when clicking outside
  useEffect(() => {
    if (!isAuditPopoverOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsAuditPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAuditPopoverOpen]);
  return (
    <div style={{
      height: '40px',
      backgroundColor: 'rgba(19, 23, 34, 0.85)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      zIndex: 10,
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--accent)' }}>
          GLYPH EDITOR · {glyphChar === ' ' ? '␣ SPACE' : glyphChar}
        </span>
        <span style={{ color: 'var(--text-faint)', fontSize: '11px' }}>
          {glyphChar === ' ' 
            ? `Unicode: U+0020 • Word Space Width: ${advanceWidth} units (No vector contours)` 
            : `Unicode: ${unicode} • Points: ${pointCount} • Cap: ${capHeight} • Width: ${advanceWidth}`}
        </span>
        {onReplaceGlyph && glyphChar !== ' ' && (
          <button
            className="btn-secondary"
            onClick={() => onReplaceGlyph(glyphChar)}
            style={{ fontSize: '11px', padding: '3px 8px', gap: '5px', marginLeft: '6px' }}
            title="Navigate to Import Artwork to frame a new image crop for this glyph"
          >
            <RefreshCw size={12} />
            <span>Replace Glyph</span>
          </button>
        )}
        {glyphChar !== ' ' && (
          <>
            <button
              className="btn-secondary"
              onClick={onOpenImportDialog}
              style={{ fontSize: '11px', padding: '3px 8px', gap: '5px', marginLeft: '6px' }}
              title={`Import an .svg file to replace glyph '${glyphChar}'`}
            >
              <Upload size={12} color="var(--accent)" />
              <span>Import .SVG</span>
            </button>
            <button
              className="btn-secondary"
              onClick={onExportSvg}
              style={{ fontSize: '11px', padding: '3px 8px', gap: '5px' }}
              title={`Export '${glyphChar}' as a standalone .svg vector file`}
            >
              <Download size={12} color="var(--accent)" />
              <span>Export .SVG</span>
            </button>

            {auditReport && (
              <div style={{ position: 'relative' }} ref={popoverRef}>
                <button
                  className="btn-secondary"
                  onClick={() => setIsAuditPopoverOpen(!isAuditPopoverOpen)}
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    gap: '5px',
                    marginLeft: '4px',
                    backgroundColor: auditReport.errorsCount > 0
                      ? 'rgba(239, 68, 68, 0.15)'
                      : auditReport.warningsCount > 0
                      ? 'rgba(245, 158, 11, 0.15)'
                      : 'rgba(16, 185, 129, 0.12)',
                    color: auditReport.errorsCount > 0
                      ? '#ef4444'
                      : auditReport.warningsCount > 0
                      ? '#f59e0b'
                      : '#10b981',
                    borderColor: auditReport.errorsCount > 0
                      ? '#ef4444'
                      : auditReport.warningsCount > 0
                      ? '#f59e0b'
                      : '#10b98150'
                  }}
                  title="Click for diagnostic directions & 1-click repairs"
                >
                  {auditReport.errorsCount > 0 ? (
                    <ShieldAlert size={12} color="#ef4444" />
                  ) : auditReport.warningsCount > 0 ? (
                    <AlertTriangle size={12} color="#f59e0b" />
                  ) : (
                    <ShieldCheck size={12} color="#10b981" />
                  )}
                  <span>
                    {auditReport.errorsCount > 0
                      ? `FontAudit: ${auditReport.errorsCount} Err`
                      : auditReport.warningsCount > 0
                      ? `FontAudit: ${auditReport.warningsCount} Warn`
                      : 'FontAudit: Clean'}
                  </span>
                </button>

                {/* Interactive Diagnostic Popover */}
                {isAuditPopoverOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      left: 0,
                      width: '380px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7)',
                      zIndex: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Popover Header */}
                    <div
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'var(--bg-surface)',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {auditReport.errorsCount > 0 ? (
                          <ShieldAlert size={14} color="#ef4444" />
                        ) : auditReport.warningsCount > 0 ? (
                          <AlertTriangle size={14} color="#f59e0b" />
                        ) : (
                          <ShieldCheck size={14} color="#10b981" />
                        )}
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                          FontAudit Diagnostics
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          className={auditReport.errorsCount > 0 ? 'badge' : 'badge badge-green'}
                          style={{
                            fontSize: '9px',
                            backgroundColor: auditReport.errorsCount > 0 ? '#ef444420' : undefined,
                            color: auditReport.errorsCount > 0 ? '#ef4444' : undefined,
                            borderColor: auditReport.errorsCount > 0 ? '#ef4444' : undefined
                          }}
                        >
                          {auditReport.totalIssues === 0
                            ? 'All Outlines Valid'
                            : `${auditReport.totalIssues} Issue${auditReport.totalIssues > 1 ? 's' : ''}`}
                        </span>
                        <button
                          onClick={() => setIsAuditPopoverOpen(false)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Quick 1-Click Auto-Fix Action */}
                    {auditReport.autoFixableCount > 0 && onAutoFixAll && (
                      <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                        <button
                          className="btn-primary"
                          onClick={() => {
                            onAutoFixAll();
                            setIsAuditPopoverOpen(false);
                          }}
                          style={{
                            width: '100%',
                            fontSize: '11px',
                            padding: '6px 10px',
                            gap: '6px',
                            justifyContent: 'center',
                            backgroundColor: 'var(--accent)'
                          }}
                        >
                          <Wand2 size={13} />
                          <span>1-Click Auto-Fix All ({auditReport.autoFixableCount} Fixable)</span>
                        </button>
                      </div>
                    )}

                    {/* Issues List with Human Directions */}
                    <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                      {auditReport.issues.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '12px 0', color: '#10b981', fontSize: '11px' }}>
                          ✓ This glyph's Bézier outlines are geometrically clean!
                        </div>
                      ) : (
                        auditReport.issues.map((issue) => (
                          <div
                            key={issue.id}
                            style={{
                              backgroundColor: 'var(--bg-main)',
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                              padding: '8px 10px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {issue.severity === 'error' ? (
                                  <ShieldAlert size={12} color="#ef4444" style={{ flexShrink: 0 }} />
                                ) : issue.severity === 'warning' ? (
                                  <AlertTriangle size={12} color="#f59e0b" style={{ flexShrink: 0 }} />
                                ) : (
                                  <Info size={12} color="#38bdf8" style={{ flexShrink: 0 }} />
                                )}
                                <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                                  {issue.title}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{
                                  fontSize: '8.5px',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  backgroundColor: issue.targetLevel === 'contour' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                                  color: issue.targetLevel === 'contour' ? 'var(--accent)' : 'var(--text-faint)',
                                  border: '1px solid var(--border)'
                                }}>
                                  {issue.targetLevel === 'contour'
                                    ? `Path #${issue.contourIndex + 1}`
                                    : `Point #${issue.pointIndex}`}
                                </span>

                                {issue.autoFixable && onFixAuditIssue && (
                                  <button
                                    className="btn-secondary"
                                    onClick={() => {
                                      onFixAuditIssue(issue);
                                    }}
                                    style={{
                                      fontSize: '9px',
                                      padding: '1px 6px',
                                      color: '#10b981',
                                      borderColor: 'rgba(16, 185, 129, 0.4)',
                                      backgroundColor: 'rgba(16, 185, 129, 0.1)'
                                    }}
                                    title="Repair this specific issue automatically"
                                  >
                                    Fix
                                  </button>
                                )}
                              </div>
                            </div>

                            <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                              {issue.message}
                            </div>

                            {/* Human Directions / Recommendation */}
                            <div style={{
                              fontSize: '9px',
                              color: issue.targetLevel === 'contour' ? '#f59e0b' : 'var(--text-faint)',
                              backgroundColor: 'rgba(255, 255, 255, 0.03)',
                              padding: '4px 6px',
                              borderRadius: '4px',
                              borderLeft: `2px solid ${issue.targetLevel === 'contour' ? '#f59e0b' : 'var(--accent)'}`,
                              marginTop: '2px'
                            }}>
                              💡 <strong>What to do:</strong> {issue.recommendation}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Popover Footer */}
                    <div
                      style={{
                        padding: '8px 12px',
                        backgroundColor: 'var(--bg-surface)',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '10px'
                      }}
                    >
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          if (setShowAuditOverlay) setShowAuditOverlay(!showAuditOverlay);
                        }}
                        style={{ fontSize: '9.5px', padding: '3px 8px', gap: '4px' }}
                      >
                        {showAuditOverlay ? <Eye size={11} color="var(--accent)" /> : <EyeOff size={11} />}
                        <span>Markers: {showAuditOverlay ? 'ON' : 'OFF'}</span>
                      </button>

                      {onOpenFontAuditModal && (
                        <button
                          className="btn-secondary"
                          onClick={() => {
                            setIsAuditPopoverOpen(false);
                            onOpenFontAuditModal();
                          }}
                          style={{ fontSize: '9.5px', padding: '3px 8px', gap: '4px' }}
                        >
                          <Maximize2 size={10} />
                          <span>Font-Wide Scan</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
        {zoom !== 100 && (
          <button
            onClick={() => setZoom(100)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '10px',
              cursor: 'pointer'
            }}
            title="Reset zoom to 100%"
          >
            {zoom}%
          </button>
        )}
        {hasOriginalImage && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showOriginalImage}
              onChange={(e) => setShowOriginalImage(e.target.checked)}
            />
            <span>Original Bitmap Overlay</span>
          </label>
        )}
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showNodes}
            onChange={(e) => setShowNodes(e.target.checked)}
          />
          <span>Vector Nodes</span>
        </label>
      </div>
    </div>
  );
};
