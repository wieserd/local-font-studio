import React from 'react';
import {
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Wand2,
  Check,
  Eye,
  EyeOff,
  Maximize2
} from 'lucide-react';
import { GlyphContour } from '../../../utils/contourUtils';
import { AuditIssue, GlyphAuditReport } from '../../../utils/fontAudit';

interface AdvancedToolsSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  auditReport: GlyphAuditReport;
  showAuditOverlay: boolean;
  setShowAuditOverlay: (show: boolean) => void;
  onAutoFixAll: () => void;
  onAutoFixWinding: () => void;
  onAutoFixMicroSegments: () => void;
  onAutoFixRedundantPoints: () => void;
  onFixAuditIssue?: (issue: AuditIssue) => void;
  selectedPoint: { contourIndex: number; pointIndex: number } | null;
  onSelectPoint: (pt: { contourIndex: number; pointIndex: number } | null) => void;
  onOpenFontAuditModal?: () => void;
  handleTriggerScaffolding: (featureName: string) => void;
}

export const AdvancedToolsSection: React.FC<AdvancedToolsSectionProps> = ({
  isOpen,
  onToggle,
  auditReport,
  showAuditOverlay,
  setShowAuditOverlay,
  onAutoFixAll,
  onAutoFixWinding,
  onAutoFixMicroSegments,
  onAutoFixRedundantPoints,
  onFixAuditIssue,
  selectedPoint,
  onSelectPoint,
  onOpenFontAuditModal,
  handleTriggerScaffolding
}) => {
  const hasErrors = auditReport.errorsCount > 0;
  const hasWarnings = auditReport.warningsCount > 0;

  return (
    <div style={{ borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
      {/* Section Header */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-surface)',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isOpen ? <ChevronDown size={14} color="#10b981" /> : <ChevronRight size={14} color="var(--text-muted)" />}
          {hasErrors ? (
            <ShieldAlert size={13} color="#ef4444" />
          ) : hasWarnings ? (
            <AlertTriangle size={13} color="#f59e0b" />
          ) : (
            <ShieldCheck size={13} color="#10b981" />
          )}
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            6. FontAudit & Path Tools
          </span>
        </div>

        {hasErrors ? (
          <span
            style={{
              fontSize: '9px',
              padding: '1px 5px',
              borderRadius: '4px',
              backgroundColor: '#ef444420',
              color: '#ef4444',
              fontWeight: 700,
              border: '1px solid #ef4444'
            }}
          >
            {auditReport.errorsCount} Error{auditReport.errorsCount > 1 ? 's' : ''}
          </span>
        ) : hasWarnings ? (
          <span
            style={{
              fontSize: '9px',
              padding: '1px 5px',
              borderRadius: '4px',
              backgroundColor: '#f59e0b20',
              color: '#f59e0b',
              fontWeight: 700,
              border: '1px solid #f59e0b'
            }}
          >
            {auditReport.warningsCount} Warn
          </span>
        ) : (
          <span className="badge badge-green" style={{ fontSize: '9px' }}>
            ✓ Clean
          </span>
        )}
      </div>

      {isOpen && (
        <div style={{ padding: '10px', backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Top Controls: Canvas Overlay Toggle & Font-Wide Scan Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
            <button
              className="btn-secondary"
              onClick={() => setShowAuditOverlay(!showAuditOverlay)}
              style={{
                fontSize: '10px',
                padding: '4px 8px',
                gap: '5px',
                flex: 1,
                color: showAuditOverlay ? 'var(--accent)' : 'var(--text-muted)',
                borderColor: showAuditOverlay ? 'var(--accent)' : 'var(--border)'
              }}
              title="Show or hide interactive issue markers on the glyph editor canvas"
            >
              {showAuditOverlay ? <Eye size={12} /> : <EyeOff size={12} />}
              <span>{showAuditOverlay ? 'Audit Markers: ON' : 'Audit Markers: OFF'}</span>
            </button>

            {onOpenFontAuditModal && (
              <button
                className="btn-secondary"
                onClick={onOpenFontAuditModal}
                style={{ fontSize: '10px', padding: '4px 8px', gap: '4px' }}
                title="Scan all glyphs across the entire font project"
              >
                <Maximize2 size={11} />
                <span>Font Scan</span>
              </button>
            )}
          </div>

          {/* Quick 1-Click Auto-Fix Action */}
          <button
            className="btn-primary"
            disabled={auditReport.autoFixableCount === 0}
            onClick={onAutoFixAll}
            style={{
              fontSize: '11px',
              padding: '7px 10px',
              gap: '6px',
              justifyContent: 'center',
              backgroundColor: auditReport.autoFixableCount > 0 ? 'var(--accent)' : 'var(--bg-surface)'
            }}
          >
            <Wand2 size={13} />
            <span>
              {auditReport.autoFixableCount > 0
                ? `1-Click Auto-Fix (${auditReport.autoFixableCount} Issues)`
                : 'All Fixable Issues Resolved'}
            </span>
          </button>

          {/* Individual Path Repair Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* Correct Winding */}
            <div style={{
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '10.5px', fontWeight: 600 }}>Correct Winding</div>
                <div style={{ fontSize: '9px', color: 'var(--text-faint)' }}>Outers clockwise/CCW, holes opposite</div>
              </div>
              <button
                className="btn-secondary"
                onClick={onAutoFixWinding}
                style={{ fontSize: '9.5px', padding: '3px 8px' }}
              >
                Fix Winding
              </button>
            </div>

            {/* Collapse Micro-segments */}
            <div style={{
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '10.5px', fontWeight: 600 }}>Collapse Micro-Segments</div>
                <div style={{ fontSize: '9px', color: 'var(--text-faint)' }}>Merges close nodes &lt; 2.5 font units</div>
              </div>
              <button
                className="btn-secondary"
                onClick={onAutoFixMicroSegments}
                style={{ fontSize: '9.5px', padding: '3px 8px' }}
              >
                Merge
              </button>
            </div>

            {/* Clean Collinear Points */}
            <div style={{
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '10.5px', fontWeight: 600 }}>Clean Collinear Nodes</div>
                <div style={{ fontSize: '9px', color: 'var(--text-faint)' }}>Removes flat redundant line points</div>
              </div>
              <button
                className="btn-secondary"
                onClick={onAutoFixRedundantPoints}
                style={{ fontSize: '9.5px', padding: '3px 8px' }}
              >
                Clean
              </button>
            </div>

            {/* Boolean Overlaps Union */}
            <div style={{
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '10.5px', fontWeight: 600 }}>Remove Overlaps</div>
                <div style={{ fontSize: '9px', color: 'var(--text-faint)' }}>Boolean union across intersecting paths</div>
              </div>
              <button
                className="btn-secondary"
                onClick={() => handleTriggerScaffolding('Boolean Path Union (Remove Overlaps)')}
                style={{ fontSize: '9.5px', padding: '3px 8px' }}
              >
                Union
              </button>
            </div>
          </div>

          {/* Detected Issues Breakdown List */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
              Detected Contour Issues ({auditReport.totalIssues})
            </div>

            {auditReport.issues.length === 0 ? (
              <div style={{ padding: '8px', textAlign: 'center', fontSize: '10px', color: '#10b981', backgroundColor: '#10b98115', borderRadius: '4px', border: '1px solid #10b98130' }}>
                ✓ No contour defects found. All Bézier rules passed!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                {auditReport.issues.map((issue) => {
                  const isSelected = selectedPoint && selectedPoint.contourIndex === issue.contourIndex && selectedPoint.pointIndex === issue.pointIndex;
                  return (
                    <div
                      key={issue.id}
                      onClick={() => {
                        if (issue.pointIndex !== undefined) {
                          onSelectPoint({
                            contourIndex: issue.contourIndex,
                            pointIndex: issue.pointIndex
                          });
                        }
                      }}
                      style={{
                        padding: '6px 8px',
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-main)',
                        border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: '5px',
                        cursor: issue.pointIndex !== undefined ? 'pointer' : 'default',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                      title={issue.pointIndex !== undefined ? 'Click to select this vertex in canvas' : undefined}
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
                          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-main)' }}>
                            {issue.title}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{
                            fontSize: '8px',
                            padding: '1px 4px',
                            borderRadius: '3px',
                            backgroundColor: issue.targetLevel === 'contour' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                            color: issue.targetLevel === 'contour' ? 'var(--accent)' : 'var(--text-faint)',
                            border: '1px solid var(--border)'
                          }}>
                            {issue.targetLevel === 'contour'
                              ? `Path #${issue.contourIndex + 1}`
                              : `Pt #${issue.pointIndex}`}
                          </span>

                          {issue.autoFixable && onFixAuditIssue && (
                            <button
                              className="btn-secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                onFixAuditIssue(issue);
                              }}
                              style={{
                                fontSize: '8.5px',
                                padding: '1px 6px',
                                color: '#10b981',
                                borderColor: 'rgba(16, 185, 129, 0.4)',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)'
                              }}
                              title="Resolve this issue automatically"
                            >
                              Fix
                            </button>
                          )}
                        </div>
                      </div>

                      <div style={{ fontSize: '9px', color: 'var(--text-muted)', lineHeight: '1.25' }}>
                        {issue.message}
                      </div>

                      <div style={{
                        fontSize: '8.5px',
                        color: issue.targetLevel === 'contour' ? '#f59e0b' : 'var(--text-faint)',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        padding: '3px 5px',
                        borderRadius: '3px',
                        borderLeft: `2px solid ${issue.targetLevel === 'contour' ? '#f59e0b' : 'var(--accent)'}`
                      }}>
                        💡 {issue.recommendation}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
