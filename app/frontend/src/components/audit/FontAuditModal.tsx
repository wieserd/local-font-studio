import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Wand2,
  Check,
  ArrowRight,
  RefreshCw,
  Search,
  X
} from 'lucide-react';
import { useFont } from '../../context/FontContext';
import { auditFontProject, autoFixContours } from '../../utils/fontAudit';
import { contoursToSvgPath } from '../../utils/contourUtils';
import { TabId } from '../Tabs';

interface FontAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToGlyph?: (char: string) => void;
}

type FilterTab = 'all' | 'issues' | 'errors' | 'clean';

export const FontAuditModal: React.FC<FontAuditModalProps> = ({
  isOpen,
  onClose,
  onNavigateToGlyph
}) => {
  const { project, updateGlyph } = useFont();
  const [filterTab, setFilterTab] = useState<FilterTab>('issues');
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFixToast, setBatchFixToast] = useState<string | null>(null);

  // Compute live project audit report
  const projectReport = useMemo(() => {
    return auditFontProject(project.glyphs);
  }, [project.glyphs]);

  if (!isOpen) return null;

  // Filter glyphs according to tab and search
  const filteredEntries = Object.entries(projectReport.glyphReports).filter(([char, report]) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!char.toLowerCase().includes(q) && !(project.glyphs[char]?.name || '').toLowerCase().includes(q)) {
        return false;
      }
    }

    if (filterTab === 'issues') return report.totalIssues > 0;
    if (filterTab === 'errors') return report.errorsCount > 0;
    if (filterTab === 'clean') return report.totalIssues === 0;
    return true; // 'all'
  });

  // Batch Auto-Fix All Project Glyphs
  const handleAutoFixAllProjectGlyphs = () => {
    let totalGlyphsRepaired = 0;
    let totalActionsCount = 0;

    Object.entries(project.glyphs).forEach(([char, glyph]) => {
      if (!glyph.isAssigned || !glyph.contours || glyph.contours.length === 0) return;

      const { contours: fixed, fixedCount } = autoFixContours(glyph.contours);
      if (fixedCount > 0) {
        totalGlyphsRepaired++;
        totalActionsCount += fixedCount;
        const newSvg = contoursToSvgPath(fixed);
        updateGlyph(char, {
          contours: fixed,
          svgPath: newSvg
        });
      }
    });

    if (totalGlyphsRepaired > 0) {
      setBatchFixToast(`✓ Successfully repaired ${totalActionsCount} geometric issues across ${totalGlyphsRepaired} glyph(s)!`);
    } else {
      setBatchFixToast('All glyph outlines are already geometrically clean or require manual inspection.');
    }

    setTimeout(() => setBatchFixToast(null), 4500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '900px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: projectReport.totalErrors > 0 ? '#ef444420' : '#10b98120',
                border: `1px solid ${projectReport.totalErrors > 0 ? '#ef4444' : '#10b981'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {projectReport.totalErrors > 0 ? (
                <ShieldAlert size={20} color="#ef4444" />
              ) : (
                <ShieldCheck size={20} color="#10b981" />
              )}
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                FontAudit · Pre-flight Geometric Validation
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-faint)', margin: '2px 0 0 0' }}>
                OpenType outline verification: checks winding directions, self-intersections, micro-segments & collinear nodes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '6px', borderRadius: '6px' }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scorecard Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '12px',
            padding: '14px 20px',
            backgroundColor: 'var(--bg-main)',
            borderBottom: '1px solid var(--border)'
          }}
        >
          <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Glyphs Scanned
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
              {projectReport.totalGlyphsScanned}
            </div>
          </div>

          <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Clean Outlines
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
              {projectReport.cleanGlyphsCount}
            </div>
          </div>

          <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Errors (Blocking)
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: projectReport.totalErrors > 0 ? '#ef4444' : 'var(--text-muted)', marginTop: '2px' }}>
              {projectReport.totalErrors}
            </div>
          </div>

          <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Warnings / Notes
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: projectReport.totalWarnings > 0 ? '#f59e0b' : 'var(--text-muted)', marginTop: '2px' }}>
              {projectReport.totalWarnings + projectReport.totalInfos}
            </div>
          </div>

          <div style={{ padding: '8px 12px', backgroundColor: 'rgba(99, 102, 241, 0.08)', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <button
              className="btn-primary"
              disabled={projectReport.totalAutoFixable === 0}
              onClick={handleAutoFixAllProjectGlyphs}
              style={{
                fontSize: '11px',
                padding: '6px 10px',
                gap: '6px',
                width: '100%',
                justifyContent: 'center',
                backgroundColor: projectReport.totalAutoFixable > 0 ? 'var(--accent)' : 'var(--bg-surface)'
              }}
              title="Automatically resolves all fixable issues across all glyphs"
            >
              <Wand2 size={13} />
              <span>Auto-Fix All ({projectReport.totalAutoFixable})</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {batchFixToast && (
          <div
            style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              borderBottom: '1px solid #10b981',
              color: '#10b981',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Check size={14} />
            <span>{batchFixToast}</span>
          </div>
        )}

        {/* Filter Tabs & Search Bar */}
        <div
          style={{
            padding: '10px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            backgroundColor: 'var(--bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              className={filterTab === 'issues' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setFilterTab('issues')}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              Needs Attention ({projectReport.glyphsWithIssuesCount})
            </button>
            <button
              className={filterTab === 'errors' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setFilterTab('errors')}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              Errors Only ({Object.values(projectReport.glyphReports).filter(r => r.errorsCount > 0).length})
            </button>
            <button
              className={filterTab === 'clean' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setFilterTab('clean')}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              Clean ({projectReport.cleanGlyphsCount})
            </button>
            <button
              className={filterTab === 'all' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setFilterTab('all')}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              All Glyphs ({projectReport.totalGlyphsScanned})
            </button>
          </div>

          <div style={{ position: 'relative', width: '220px' }}>
            <Search
              size={13}
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-faint)'
              }}
            />
            <input
              type="text"
              placeholder="Search glyph..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '4px 8px 4px 26px',
                fontSize: '11px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)'
              }}
            />
          </div>
        </div>

        {/* Glyphs Audit List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredEntries.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-faint)' }}>
              <ShieldCheck size={36} color="#10b981" style={{ margin: '0 auto 10px', opacity: 0.8 }} />
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                No Glyphs Found in Current View
              </div>
              <div style={{ fontSize: '11px', marginTop: '4px' }}>
                {filterTab === 'issues'
                  ? 'All assigned glyph outlines in the active font project passed geometric validation!'
                  : 'Try adjusting your search query or switching filter tabs.'}
              </div>
            </div>
          ) : (
            filteredEntries.map(([char, report]) => {
              const glyph = project.glyphs[char];
              return (
                <div
                  key={char}
                  style={{
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
                    {/* Glyph Character Preview Box */}
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        fontWeight: 700,
                        fontFamily: 'serif',
                        flexShrink: 0
                      }}
                    >
                      {char}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700 }}>
                          {glyph?.name || char}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
                          {glyph?.unicode}
                        </span>
                        {report.totalIssues === 0 ? (
                          <span className="badge badge-green" style={{ fontSize: '9px' }}>
                            ✓ 0 Issues (Clean)
                          </span>
                        ) : (
                          <>
                            {report.errorsCount > 0 && (
                              <span
                                style={{
                                  fontSize: '9px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: '#ef444420',
                                  color: '#ef4444',
                                  border: '1px solid #ef4444'
                                }}
                              >
                                {report.errorsCount} Error{report.errorsCount > 1 ? 's' : ''}
                              </span>
                            )}
                            {report.warningsCount > 0 && (
                              <span
                                style={{
                                  fontSize: '9px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: '#f59e0b20',
                                  color: '#f59e0b',
                                  border: '1px solid #f59e0b'
                                }}
                              >
                                {report.warningsCount} Warning{report.warningsCount > 1 ? 's' : ''}
                              </span>
                            )}
                            {report.infosCount > 0 && (
                              <span
                                style={{
                                  fontSize: '9px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: '#38bdf820',
                                  color: '#38bdf8',
                                  border: '1px solid #38bdf8'
                                }}
                              >
                                {report.infosCount} Info
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Issues list breakdown */}
                      {report.issues.length > 0 && (
                        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {report.issues.map((issue) => (
                            <div
                              key={issue.id}
                              style={{
                                fontSize: '10.5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: issue.severity === 'error'
                                  ? '#ef4444'
                                  : issue.severity === 'warning'
                                  ? '#f59e0b'
                                  : 'var(--text-muted)'
                              }}
                            >
                              {issue.severity === 'error' ? (
                                <ShieldAlert size={12} color="#ef4444" />
                              ) : issue.severity === 'warning' ? (
                                <AlertTriangle size={12} color="#f59e0b" />
                              ) : (
                                <Info size={12} color="#38bdf8" />
                              )}
                              <span><strong>{issue.title}:</strong> {issue.message}</span>
                              {issue.autoFixable && (
                                <span style={{ fontSize: '9px', color: '#10b981', marginLeft: '4px' }}>
                                  [Auto-fixable]
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions for this glyph */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {report.autoFixableCount > 0 && (
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          if (!glyph?.contours) return;
                          const { contours: fixed, fixedCount, fixedActions } = autoFixContours(glyph.contours);
                          if (fixedCount > 0) {
                            const newSvg = contoursToSvgPath(fixed);
                            updateGlyph(char, {
                              contours: fixed,
                              svgPath: newSvg
                            });
                            setBatchFixToast(`✓ Repaired '${char}': ${fixedActions.join(', ')}`);
                            setTimeout(() => setBatchFixToast(null), 3000);
                          }
                        }}
                        style={{ fontSize: '10.5px', padding: '4px 8px', gap: '4px' }}
                        title="Fix auto-fixable issues for this glyph"
                      >
                        <Wand2 size={12} color="var(--accent)" />
                        <span>Fix ({report.autoFixableCount})</span>
                      </button>
                    )}

                    {onNavigateToGlyph && (
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          onClose();
                          onNavigateToGlyph(char);
                        }}
                        style={{ fontSize: '10.5px', padding: '4px 8px', gap: '4px' }}
                        title="Open in Glyph Editor"
                      >
                        <span>Edit</span>
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface)',
            fontSize: '11px',
            color: 'var(--text-faint)'
          }}
        >
          <span>
            FontAudit geometric engine follows Adobe Type 1 and TrueType/OpenType Bézier topology specifications.
          </span>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '5px 14px' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
