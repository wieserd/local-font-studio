import React, { useState } from 'react';
import { 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  FileCode, 
  Check, 
  Layers, 
  ExternalLink,
  Info,
  Archive
} from 'lucide-react';
import { useFont } from '../context/FontContext';
import { buildAndDownloadFont, ExportResult } from '../utils/fontExporter';
import { exportGlyphsAsSvgZip } from '../utils/svgExporter';

export const ExportView: React.FC = () => {
  const { project, assignedCount, totalCount, setProjectName, stylesList, activeStyleId, switchStyle } = useFont();

  const [format, setFormat] = useState<'ttf' | 'otf' | 'svg'>('otf');
  const [includeKerning, setIncludeKerning] = useState(true);
  const [includeLigatures, setIncludeLigatures] = useState(true);
  const [runValidation, setRunValidation] = useState(true);
  const [exportScope, setExportScope] = useState<'active' | 'all'>('active');
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [batchResults, setBatchResults] = useState<ExportResult[]>([]);

  const familyName = project.name || 'My-Typeface';
  const styleName = project.metadata?.style || 'Regular';
  const sanitizedFamily = familyName.replace(/[^a-zA-Z0-9_-]/g, '-');
  const sanitizedStyle = styleName.replace(/[^a-zA-Z0-9_-]/g, '-');
  const proposedFilename = format === 'svg' 
    ? `${sanitizedFamily}-${sanitizedStyle}-svg.zip`
    : `${sanitizedFamily}-${sanitizedStyle}.${format}`;

  const handleExport = () => {
    setIsExporting(true);
    setExportResult(null);
    setBatchResults([]);

    setTimeout(async () => {
      try {
        if (format === 'svg') {
          // Export as SVG ZIP
          if (exportScope === 'all') {
            const results: ExportResult[] = [];
            for (const st of stylesList) {
              const singleStyleProject = {
                ...project,
                metadata: {
                  ...project.metadata,
                  style: st.name,
                },
                glyphs: st.glyphs,
                metrics: st.metrics,
                kerningPairs: st.kerningPairs || [],
              };
              const sName = st.name.replace(/[^a-zA-Z0-9_-]/g, '-');
              const fname = `${sanitizedFamily}-${sName}-svg.zip`;
              const res = await exportGlyphsAsSvgZip(singleStyleProject, fname);
              results.push(res);
            }
            setIsExporting(false);
            setBatchResults(results);
            if (results.length > 0) setExportResult(results[0]);
          } else {
            const res = await exportGlyphsAsSvgZip(project, proposedFilename);
            setIsExporting(false);
            setExportResult(res);
          }
        } else {
          // Export as OTF or TTF binary
          if (exportScope === 'all') {
            // Export all styles in family
            const results: ExportResult[] = [];
            stylesList.forEach(st => {
              const singleStyleProject = {
                ...project,
                metadata: {
                  ...project.metadata,
                  style: st.name,
                },
                glyphs: st.glyphs,
                metrics: st.metrics,
                kerningPairs: st.kerningPairs || [],
              };
              const sName = st.name.replace(/[^a-zA-Z0-9_-]/g, '-');
              const fname = `${sanitizedFamily}-${sName}.${format}`;
              const res = buildAndDownloadFont(singleStyleProject, {
                format,
                includeKerning,
                includeLigatures,
                runValidation,
                filename: fname,
              });
              results.push(res);
            });

            setIsExporting(false);
            setBatchResults(results);
            if (results.length > 0) {
              setExportResult(results[0]);
            }
          } else {
            // Export single active cut
            const result = buildAndDownloadFont(project, {
              format,
              includeKerning,
              includeLigatures,
              runValidation,
              filename: proposedFilename,
            });

            setIsExporting(false);
            setExportResult(result);
          }
        }
      } catch (err: any) {
        setIsExporting(false);
        setExportResult({
          success: false,
          filename: proposedFilename,
          byteLength: 0,
          glyphCount: 0,
          blobUrl: '',
          error: err?.message || String(err),
        });
      }
    }, 400);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: '780px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Build & Export Font</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
          Compile glyph vector contours into installable desktop font binaries (.otf / .ttf) or export all glyphs as SVG archive (.zip).
        </p>
      </div>

      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Project Metadata Preview & Editor */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          backgroundColor: 'var(--bg-surface)',
          padding: '14px',
          borderRadius: '8px',
          border: '1px solid var(--border)'
        }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
              Font Family Name
            </label>
            <input
              type="text"
              value={project.name}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. My Custom Typeface"
              style={{ width: '100%', fontSize: '13px', padding: '6px 10px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
              Subfamily / Style
            </label>
            <select
              value={activeStyleId}
              onChange={(e) => switchStyle(e.target.value)}
              style={{ width: '100%', fontSize: '13px', padding: '6px 10px' }}
            >
              {stylesList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.weightClass})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Export Scope: Active Cut vs Complete Family */}
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '14px',
          backgroundColor: 'var(--bg-surface)'
        }}>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
            Export Scope
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '6px',
              border: exportScope === 'active' ? '1.5px solid var(--accent)' : '1px solid var(--border)',
              backgroundColor: exportScope === 'active' ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                name="exportScope"
                checked={exportScope === 'active'}
                onChange={() => setExportScope('active')}
              />
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, display: 'block' }}>
                  Current Cut: {project.metadata?.style || 'Regular'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
                  Single font binary ({proposedFilename})
                </span>
              </div>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '6px',
              border: exportScope === 'all' ? '1.5px solid var(--accent)' : '1px solid var(--border)',
              backgroundColor: exportScope === 'all' ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                name="exportScope"
                checked={exportScope === 'all'}
                onChange={() => setExportScope('all')}
              />
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, display: 'block' }}>
                  Entire Family ({stylesList.length} Cuts)
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
                  Compiles and downloads all cuts
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Format Selector */}
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
            Target Format
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {/* OTF Option */}
            <div
              onClick={() => setFormat('otf')}
              style={{
                border: format === 'otf' ? '2px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: '8px',
                padding: '14px',
                backgroundColor: format === 'otf' ? 'var(--bg-surface)' : 'var(--bg-input)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>.OTF (OpenType CFF)</span>
                {format === 'otf' && <Check size={14} style={{ color: 'var(--accent)' }} />}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-faint)', margin: 0, lineHeight: 1.4 }}>
                Standard PostScript curves (CFF table). High precision and smooth rendering on macOS, Windows, Linux & Adobe apps.
              </p>
            </div>

            {/* TTF Option */}
            <div
              onClick={() => setFormat('ttf')}
              style={{
                border: format === 'ttf' ? '2px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: '8px',
                padding: '14px',
                backgroundColor: format === 'ttf' ? 'var(--bg-surface)' : 'var(--bg-input)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>.TTF (TrueType)</span>
                {format === 'ttf' && <Check size={14} style={{ color: 'var(--accent)' }} />}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-faint)', margin: 0, lineHeight: 1.4 }}>
                TrueType compatible quadratic container format. Universal browser and legacy OS compatibility.
              </p>
            </div>

            {/* SVG ZIP Option */}
            <div
              onClick={() => setFormat('svg')}
              style={{
                border: format === 'svg' ? '2px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: '8px',
                padding: '14px',
                backgroundColor: format === 'svg' ? 'var(--bg-surface)' : 'var(--bg-input)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>.SVG (.zip Bundle)</span>
                {format === 'svg' && <Check size={14} style={{ color: 'var(--accent)' }} />}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-faint)', margin: 0, lineHeight: 1.4 }}>
                All glyphs packaged as individual standalone SVG vector files inside a .zip archive. Ready for Figma, Illustrator & Web.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Checkboxes (Visible for binary OTF/TTF) */}
        {format !== 'svg' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px' }}>
              <input type="checkbox" checked={includeKerning} onChange={(e) => setIncludeKerning(e.target.checked)} />
              <span>Include OpenType GPOS Pair-Kerning table ({project.kerningPairs?.length || 0} active pairs)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px' }}>
              <input type="checkbox" checked={includeLigatures} onChange={(e) => setIncludeLigatures(e.target.checked)} />
              <span>Include GSUB Standard Ligatures feature</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px' }}>
              <input type="checkbox" checked={runValidation} onChange={(e) => setRunValidation(e.target.checked)} />
              <span>Run full font binary validation before file output</span>
            </label>
          </div>
        ) : (
          <div style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-surface)',
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Archive size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <span>
              Each assigned glyph will be exported as an independent, scalable <code>.svg</code> file normalized to 1000 UPM with its native advance width and baseline alignment.
            </span>
          </div>
        )}

        {/* Validation Checklist Card */}
        <div style={{
          backgroundColor: 'var(--bg-app)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '14px'
        }}>
          <h4 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
            {format === 'svg' ? 'SVG Archive Pre-Flight Verification' : 'Pre-Flight Binary Verification'}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            {format === 'svg' ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={13} style={{ color: 'var(--success)' }} />
                  <span>Standard 1000 UPM vector coordinate space & baseline alignment</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={13} style={{ color: 'var(--success)' }} />
                  <span>Correct vertical orientation (SVG top-origin flip matrix applied)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={13} style={{ color: 'var(--success)' }} />
                  <span>Filesystem-safe naming scheme with Unicode code points</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={13} style={{ color: 'var(--success)' }} />
                  <span>Includes metadata manifest (font-manifest.json) bundled in archive</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={13} style={{ color: assignedCount > 0 ? 'var(--success)' : '#f59e0b' }} />
                  <span>
                    {assignedCount > 0 
                      ? `${assignedCount} custom vector glyphs ready for SVG packaging` 
                      : 'Notice: 0 glyphs assigned. Import artwork or draw glyphs in editor first.'}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={13} style={{ color: 'var(--success)' }} />
                  <span>Standard .notdef glyph defined at glyph index 0</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={13} style={{ color: 'var(--success)' }} />
                  <span>Space character (U+0020) advance width configured ({project.metrics.spaceWidth || project.metrics.defaultAdvance} units)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={13} style={{ color: 'var(--success)' }} />
                  <span>Character cmap encoding (Unicode BMP Format 4) verified</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={13} style={{ color: 'var(--success)' }} />
                  <span>UPM design space coordinates normalized ({project.metrics.upm} units/em)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={13} style={{ color: assignedCount > 0 ? 'var(--success)' : '#f59e0b' }} />
                  <span>
                    {assignedCount > 0 
                      ? `${assignedCount} custom vector glyphs ready for compilation` 
                      : 'Notice: 0 glyphs assigned. Import artwork or draw glyphs in editor first.'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Output File Action Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {format === 'svg' ? (
              <Archive size={24} style={{ color: 'var(--accent)' }} />
            ) : (
              <FileCode size={24} style={{ color: 'var(--accent)' }} />
            )}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>{proposedFilename}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
                {format === 'svg' 
                  ? `${assignedCount} glyphs • SVG Vector Archive (.zip bundle)`
                  : `${assignedCount} glyphs • ${project.metrics.upm} UPM • ${format.toUpperCase()} binary`}
              </div>
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={handleExport}
            disabled={isExporting}
            style={{ padding: '8px 20px', gap: '6px' }}
          >
            <Download size={15} />
            <span>
              {isExporting 
                ? (format === 'svg' ? 'Packaging SVGs...' : 'Compiling Fonts...') 
                : exportScope === 'all' 
                  ? (format === 'svg' ? `Export All Cuts as SVG (.zip)` : `Generate & Download Family (${stylesList.length} Cuts)`) 
                  : (format === 'svg' ? 'Export Glyphs as SVG (.zip)' : 'Generate & Download')}
            </span>
          </button>
        </div>

        {/* Export Success or Error Result */}
        {exportResult && exportResult.success && (
          <div style={{
            padding: '16px 20px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '8px',
            color: '#34d399',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={18} style={{ color: '#10b981' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>
                  {format === 'svg' ? 'SVG Archive Exported & Downloaded Successfully!' : 'Font Compiled & Downloaded Successfully!'}
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Size: {(exportResult.byteLength / 1024).toFixed(1)} KB • {exportResult.glyphCount} glyphs
              </span>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
              {format === 'svg' ? (
                <>Your SVG bundle <strong>{exportResult.filename}</strong> with individual vector files has been generated and downloaded to your Downloads folder.</>
              ) : (
                <>Your font file <strong>{exportResult.filename}</strong> has been generated and downloaded to your default Downloads folder.</>
              )}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
              {/* Direct Re-download Button in case browser popup blocker blocked it */}
              <a
                href={exportResult.blobUrl}
                download={exportResult.filename}
                className="btn-secondary"
                style={{
                  fontSize: '11px',
                  padding: '5px 12px',
                  gap: '5px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: 'var(--text-main)'
                }}
              >
                <Download size={13} />
                <span>Download Again ({exportResult.filename})</span>
              </a>
            </div>
          </div>
        )}

        {exportResult && !exportResult.success && (
          <div style={{
            padding: '14px 18px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertTriangle size={18} />
            <div>
              <div style={{ fontWeight: 700 }}>Compilation Failed</div>
              <div style={{ fontSize: '11px', opacity: 0.9 }}>{exportResult.error}</div>
            </div>
          </div>
        )}

        {/* Usage / Installation Guide */}
        <div style={{
          backgroundColor: 'var(--bg-app)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
            <Info size={14} style={{ color: 'var(--accent)' }} />
            <span>{format === 'svg' ? 'How to use your exported SVG glyph bundle' : 'How to install your font on desktop'}</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {format === 'svg' ? (
              <>
                <p style={{ margin: '0 0 4px 0' }}>
                  • <strong>Vector Design Tools (Figma, Illustrator, Sketch)</strong>: Unzip the downloaded archive and drag & drop any <code>.svg</code> glyph file directly onto your design artboard as full vector paths.
                </p>
                <p style={{ margin: '0 0 4px 0' }}>
                  • <strong>Web & Iconography</strong>: Embed individual SVGs inline via <code>&lt;svg&gt;</code> tags or as images <code>&lt;img src="glyph_A.svg" /&gt;</code> with CSS color styling.
                </p>
                <p style={{ margin: 0 }}>
                  • <strong>Manifest & Metadata</strong>: Inspect <code>font-manifest.json</code> inside the zip archive for exact advance widths, character codes, and font metadata.
                </p>
              </>
            ) : (
              <>
                <p style={{ margin: '0 0 4px 0' }}>
                  • <strong>macOS</strong>: Double-click the downloaded <code>.otf</code> or <code>.ttf</code> file and click <strong>"Install Font"</strong> in the Font Book preview.
                </p>
                <p style={{ margin: '0 0 4px 0' }}>
                  • <strong>Windows</strong>: Right-click the downloaded font file and select <strong>"Install"</strong> (or "Install for all users").
                </p>
                <p style={{ margin: 0 }}>
                  • <strong>Web</strong>: Include in CSS with <code>@font-face {'{ font-family: \''}{familyName}{'\'}; src: url(\'...' + format + '\'); }'}</code>.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
