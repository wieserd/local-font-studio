import React, { useState, useMemo } from 'react';
import { CheckCircle, AlertCircle, Check } from 'lucide-react';
import { useFont } from '../context/FontContext';
import { useAppSettings } from '../context/AppSettingsContext';
import { typesetText, auditSampleTextCoverage } from '../utils/typesetter';
import { PreviewToolbar } from './preview/PreviewToolbar';
import { PreviewControls } from './preview/PreviewControls';
import { TypesetCanvas } from './preview/TypesetCanvas';
import { WaterfallPreview } from './preview/WaterfallPreview';
import { GlyphRosterPreview } from './preview/GlyphRosterPreview';

interface PreviewViewProps {
  onSelectGlyph?: (char: string) => void;
}

export const PreviewView: React.FC<PreviewViewProps> = ({ onSelectGlyph }) => {
  const { project, setSelectedGlyphChar } = useFont();
  const { settings, updateSettings } = useAppSettings();

  const [sampleText, setSampleText] = useState(
    'The quick brown fox jumps over the lazy dog. 1234567890! AVATAR Typography.'
  );
  const [fontSize, setFontSize] = useState(38);
  const [lineHeight, setLineHeight] = useState(1.4);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [enableKerning, setEnableKerning] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [highlightMissing, setHighlightMissing] = useState(true);
  const [compareWithSystem, setCompareWithSystem] = useState(false);
  const [viewMode, setViewMode] = useState<'custom' | 'waterfall' | 'roster'>('custom');

  // Inverse synchronization:
  // When global theme is dark (dark, hacker, candy), live preview is light paper (darkBg = false);
  // When global theme is light, live preview is dark specimen (darkBg = true).
  const isGlobalDark = (settings.theme || 'dark') !== 'light';
  const darkBg = !isGlobalDark;

  const handleSetDarkBg = (newDarkBg: boolean) => {
    // Vice-versa: user toggling preview background switches global theme inversely
    if (newDarkBg) {
      updateSettings({ theme: 'light' });
    } else {
      updateSettings({ theme: 'dark' });
    }
  };

  // List of all assigned glyphs for roster
  const assignedGlyphsList = useMemo(() => {
    return Object.values(project.glyphs).filter((g) => g.isAssigned && g.svgPath);
  }, [project.glyphs]);

  const assignedCharsStr = useMemo(() => {
    return assignedGlyphsList.map((g) => g.char).join(' ');
  }, [assignedGlyphsList]);

  const presets = [
    { label: 'Pangram 1', text: 'The quick brown fox jumps over the lazy dog.' },
    { label: 'Pangram 2', text: 'Pack my box with five dozen liquor jugs.' },
    { label: 'Pangram 3', text: 'Sphinx of black quartz, judge my vow.' },
    { label: 'Uppercase', text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
    { label: 'Lowercase', text: 'abcdefghijklmnopqrstuvwxyz' },
    { label: 'Numbers & Symbols', text: '0123456789 ! ? @ # $ % & * ( ) _ + - = : ;' },
    { label: 'Assigned Glyphs', text: assignedCharsStr || 'No glyphs drawn yet.' }
  ];

  // Typeset main test paragraph
  const typesetParagraphs = useMemo(() => {
    return typesetText(
      sampleText,
      project.glyphs,
      project.metrics,
      project.kerningPairs,
      {
        fontSize,
        lineHeight,
        letterSpacing,
        enableKerning,
      }
    );
  }, [sampleText, project.glyphs, project.metrics, project.kerningPairs, fontSize, lineHeight, letterSpacing, enableKerning]);

  const waterfallSizes = [72, 48, 36, 24, 18, 14];

  // Coverage audit
  const coverageAudit = useMemo(() => {
    return auditSampleTextCoverage(sampleText, project.glyphs);
  }, [sampleText, project.glyphs]);

  const handleNavigateToChar = (char: string) => {
    setSelectedGlyphChar(char);
    if (onSelectGlyph) {
      onSelectGlyph(char);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* 1. Top Specimen Controls Header */}
      <PreviewToolbar
        presets={presets}
        setSampleText={setSampleText}
        viewMode={viewMode}
        setViewMode={setViewMode}
        darkBg={darkBg}
        setDarkBg={handleSetDarkBg}
        globalTheme={settings.theme || 'dark'}
      />

      {/* 2. Secondary Sliders & Layout Controls Bar */}
      <PreviewControls
        fontSize={fontSize}
        setFontSize={setFontSize}
        lineHeight={lineHeight}
        setLineHeight={setLineHeight}
        letterSpacing={letterSpacing}
        setLetterSpacing={setLetterSpacing}
        enableKerning={enableKerning}
        setEnableKerning={setEnableKerning}
        showGuides={showGuides}
        setShowGuides={setShowGuides}
        highlightMissing={highlightMissing}
        setHighlightMissing={setHighlightMissing}
        compareWithSystem={compareWithSystem}
        setCompareWithSystem={setCompareWithSystem}
      />

      {/* 3. Main Specimen Display Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 30px',
        backgroundColor: darkBg ? 'var(--bg-app)' : '#f8fafc',
        color: darkBg ? 'var(--text-main)' : '#0f172a',
        transition: 'background-color 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Editable Input Field */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Live Specimen Typesetting Input
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
              {sampleText.length} characters ({coverageAudit.coveredChars.length} covered in active font)
            </span>
          </div>
          <textarea
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            rows={2}
            placeholder="Type anything to test your custom font..."
            style={{
              width: '100%',
              backgroundColor: darkBg ? 'var(--bg-card)' : '#ffffff',
              color: darkBg ? 'var(--text-main)' : '#0f172a',
              border: '1px solid var(--border)',
              padding: '10px 14px',
              fontSize: '14px',
              borderRadius: '6px',
              resize: 'vertical',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          />
        </div>

        {/* Live Vector Font Typesetting Card */}
        <div style={{
          backgroundColor: darkBg ? 'var(--bg-card)' : '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          {/* Card Header Information & Guides Legend */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-indigo">Font: {project.name}</span>
              <span className="badge badge-gray">{project.metadata.style || 'Regular'}</span>
              <span className="badge badge-gray">UPM: {project.metrics.upm}</span>
              <span className="badge badge-green">{assignedGlyphsList.length} Glyphs Ready</span>
            </div>

            {/* Metric Guides Legend */}
            {showGuides && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '10px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}>
                  <span style={{ width: '12px', height: '0', borderTop: '1px dashed #ef4444' }} />
                  Ascender (+{project.metrics.ascender})
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#818cf8' }}>
                  <span style={{ width: '12px', height: '0', borderTop: '1px dashed #818cf8' }} />
                  Cap-Height (+{project.metrics.capHeight})
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#34d399', fontWeight: 600 }}>
                  <span style={{ width: '12px', height: '0', borderTop: '2px solid #10b981' }} />
                  Baseline (0)
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
                  <span style={{ width: '12px', height: '0', borderTop: '1px dashed #fbbf24' }} />
                  Descender ({project.metrics.descender})
                </span>
              </div>
            )}
          </div>

          {/* Mode 1: Custom Specimen Paragraph */}
          {viewMode === 'custom' && (
            <div style={{ minHeight: '120px' }}>
              {typesetParagraphs.length === 0 || sampleText.trim() === '' ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-faint)', fontSize: '13px' }}>
                  Type sample text above to preview your custom typeface.
                </div>
              ) : (
                <TypesetCanvas
                  paragraphs={typesetParagraphs}
                  fontSize={fontSize}
                  lineHeight={lineHeight}
                  metrics={project.metrics}
                  showGuides={showGuides}
                  highlightMissing={highlightMissing}
                  letterSpacing={letterSpacing}
                  darkBg={darkBg}
                  onNavigateToChar={handleNavigateToChar}
                />
              )}
            </div>
          )}

          {/* Mode 2: Waterfall Specimen View */}
          {viewMode === 'waterfall' && (
            <WaterfallPreview
              waterfallSizes={waterfallSizes}
              sampleText={sampleText}
              glyphs={project.glyphs}
              metrics={project.metrics}
              kerningPairs={project.kerningPairs}
              letterSpacing={letterSpacing}
              enableKerning={enableKerning}
              renderTypesetParagraphs={(paragraphs, size, lh) => (
                <TypesetCanvas
                  paragraphs={paragraphs}
                  fontSize={size}
                  lineHeight={lh}
                  metrics={project.metrics}
                  showGuides={showGuides}
                  highlightMissing={highlightMissing}
                  letterSpacing={letterSpacing}
                  darkBg={darkBg}
                  onNavigateToChar={handleNavigateToChar}
                />
              )}
            />
          )}

          {/* Mode 3: Roster of All Assigned Glyphs */}
          {viewMode === 'roster' && (
            <GlyphRosterPreview
              assignedGlyphsList={assignedGlyphsList}
              darkBg={darkBg}
              handleNavigateToChar={handleNavigateToChar}
            />
          )}
        </div>

        {/* Reference Font Comparison (Stacked) */}
        {compareWithSystem && (
          <div style={{
            backgroundColor: darkBg ? 'var(--bg-card)' : '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span className="badge badge-gray">Reference System Font (Georgia / Times)</span>
              <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Proportion comparison</span>
            </div>
            <div
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
                letterSpacing: `${letterSpacing}px`,
                fontFamily: 'Georgia, serif',
                color: 'var(--text-muted)',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap'
              }}
            >
              {sampleText}
            </div>
          </div>
        )}

        {/* 4. Coverage Audit & Glyph Navigation Bar */}
        <div style={{
          backgroundColor: 'var(--bg-sidebar)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {coverageAudit.missingChars.length === 0 ? (
                <CheckCircle size={18} style={{ color: 'var(--success)' }} />
              ) : (
                <AlertCircle size={18} style={{ color: '#f59e0b' }} />
              )}
              <div>
                <h5 style={{ fontSize: '12px', fontWeight: 600 }}>
                  Specimen Character Coverage: {coverageAudit.coveragePercent}%
                </h5>
                <p style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
                  {coverageAudit.coveredChars.length} covered, {coverageAudit.missingChars.length} unassigned characters in active specimen string.
                </p>
              </div>
            </div>

            <span className={`badge ${coverageAudit.coveragePercent === 100 ? 'badge-green' : 'badge-amber'}`}>
              {coverageAudit.coveragePercent === 100 ? 'Full Coverage' : `${coverageAudit.coveragePercent}% Covered`}
            </span>
          </div>

          {/* Interactive Glyph Status Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            {coverageAudit.coveredChars.map(c => (
              <button
                key={c}
                onClick={() => handleNavigateToChar(c)}
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#34d399',
                  borderRadius: '4px',
                  padding: '2px 7px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
                title={`'${c}' is vectorized and ready. Click to edit in Glyph Editor.`}
              >
                <span>{c}</span>
                <Check size={10} />
              </button>
            ))}

            {coverageAudit.missingChars.map(c => (
              <button
                key={c}
                onClick={() => handleNavigateToChar(c)}
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px dashed rgba(239, 68, 68, 0.45)',
                  color: '#ef4444',
                  borderRadius: '4px',
                  padding: '2px 7px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
                title={`'${c}' is unassigned. Click to design in Glyph Editor.`}
              >
                <span>{c}</span>
                <span style={{ fontSize: '10px', opacity: 0.8 }}>+ draw</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
