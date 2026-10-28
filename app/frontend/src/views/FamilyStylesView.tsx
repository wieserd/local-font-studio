import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Copy, 
  Trash2, 
  Check, 
  Download, 
  Edit3, 
  AlertTriangle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useFont } from '../context/FontContext';
import { FontStyleState } from '../types/font';
import { buildAndDownloadFont } from '../utils/fontExporter';

interface StyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; weightClass: number; isItalic: boolean; copyFromStyleId?: string }) => void;
  existingStyles: FontStyleState[];
  initialSourceStyleId?: string;
}

const PRESET_STYLES = [
  { name: 'Thin', weight: 100, italic: false },
  { name: 'Light', weight: 300, italic: false },
  { name: 'Regular', weight: 400, italic: false },
  { name: 'Medium', weight: 500, italic: false },
  { name: 'SemiBold', weight: 600, italic: false },
  { name: 'Bold', weight: 700, italic: false },
  { name: 'Black', weight: 900, italic: false },
  { name: 'Italic', weight: 400, italic: true },
  { name: 'Bold Italic', weight: 700, italic: true },
];

const AddStyleModal: React.FC<StyleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingStyles,
  initialSourceStyleId,
}) => {
  const [name, setName] = useState('Bold');
  const [weightClass, setWeightClass] = useState(700);
  const [isItalic, setIsItalic] = useState(false);
  const [copyMode, setCopyMode] = useState<'blank' | 'copy'>('copy');
  const [sourceStyleId, setSourceStyleId] = useState(initialSourceStyleId || existingStyles[0]?.id || 'regular');

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESET_STYLES[0]) => {
    setName(preset.name);
    setWeightClass(preset.weight);
    setIsItalic(preset.italic);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      weightClass,
      isItalic,
      copyFromStyleId: copyMode === 'copy' ? sourceStyleId : undefined,
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      backdropFilter: 'blur(3px)',
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        width: '520px',
        maxWidth: '92vw',
        padding: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Plus size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Add Family Style / Cut</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-faint)', margin: 0 }}>
              Create a new style for your typeface family
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick Presets */}
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Quick Presets
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {PRESET_STYLES.map(p => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => handleSelectPreset(p)}
                  className="btn-secondary"
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    backgroundColor: name === p.name ? 'rgba(99, 102, 241, 0.25)' : undefined,
                    borderColor: name === p.name ? 'var(--accent)' : undefined,
                    color: name === p.name ? '#fff' : undefined,
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Style Name & Weight */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Style Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bold, Italic, Light..."
                required
                style={{ width: '100%', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                OS/2 Weight (100–900)
              </label>
              <input
                type="number"
                min="100"
                max="900"
                step="50"
                value={weightClass}
                onChange={(e) => setWeightClass(Number(e.target.value))}
                style={{ width: '100%', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Italic checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={isItalic}
              onChange={(e) => setIsItalic(e.target.checked)}
            />
            <span>Italic / Slanted Style (sets OpenType italic bit)</span>
          </label>

          {/* Initial Content Choice */}
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '12px',
            backgroundColor: 'var(--bg-main)'
          }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Starting Artwork & Glyphs
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px' }}>
                <input
                  type="radio"
                  name="copyMode"
                  checked={copyMode === 'copy'}
                  onChange={() => setCopyMode('copy')}
                />
                <span>Copy artwork & metrics from existing style:</span>
              </label>

              {copyMode === 'copy' && (
                <div style={{ marginLeft: '24px' }}>
                  <select
                    value={sourceStyleId}
                    onChange={(e) => setSourceStyleId(e.target.value)}
                    style={{ fontSize: '12px', width: '100%' }}
                  >
                    {existingStyles.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({Object.values(s.glyphs).filter(g => g.isAssigned && g.svgPath).length} glyphs)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px' }}>
                <input
                  type="radio"
                  name="copyMode"
                  checked={copyMode === 'blank'}
                  onChange={() => setCopyMode('blank')}
                />
                <span>Start empty (blank canvas for drawing or importing)</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Plus size={14} />
              <span>Create Style</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const FamilyStylesView: React.FC<{ onNavigateToGlyphs?: () => void }> = ({ onNavigateToGlyphs }) => {
  const { 
    project, 
    stylesList, 
    activeStyleId, 
    switchStyle, 
    addStyle, 
    duplicateStyle, 
    deleteStyle, 
    updateStyleMetadata 
  } = useFont();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cloneSourceId, setCloneSourceId] = useState<string | undefined>(undefined);
  const [deleteCandidate, setDeleteCandidate] = useState<FontStyleState | null>(null);

  const handleOpenAddModal = (sourceStyleId?: string) => {
    setCloneSourceId(sourceStyleId);
    setIsModalOpen(true);
  };

  const handleAddStyleSubmit = (data: { name: string; weightClass: number; isItalic: boolean; copyFromStyleId?: string }) => {
    const newId = addStyle(data);
    switchStyle(newId);
  };

  const handleQuickExport = async (style: FontStyleState) => {
    // Construct single style project for fontExporter
    const singleStyleProject = {
      ...project,
      metadata: {
        ...project.metadata,
        style: style.name,
      },
      glyphs: style.glyphs,
      metrics: style.metrics,
      kerningPairs: style.kerningPairs || [],
    };
    await buildAndDownloadFont(singleStyleProject, {
      format: 'otf',
      includeKerning: true,
      includeLigatures: true,
      runValidation: true,
    });
  };

  return (
    <div style={{ flex: 1, height: '100%', overflowY: 'auto', padding: '24px 32px' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '28px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Layers size={18} />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                Font Family: {project.name}
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Manage cuts & styles in this font family. Click any card to switch the active working style, or clone a style as a starting point.
              </p>
            </div>
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={() => handleOpenAddModal()}
          style={{ padding: '8px 16px', fontSize: '13px', gap: '8px' }}
        >
          <Plus size={16} />
          <span>Add New Style</span>
        </button>
      </div>

      {/* Cards Deck Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px',
      }}>
        {stylesList.map((style) => {
          const isActive = style.id === activeStyleId;
          const assignedGlyphs = Object.values(style.glyphs).filter(g => g.isAssigned && g.svgPath);
          const assignedCount = assignedGlyphs.length;
          const totalCount = Object.keys(style.glyphs).length;
          const percent = Math.round((assignedCount / Math.max(1, totalCount)) * 100);

          // Find sample glyphs to preview
          const previewChars = ['A', 'a', 'R', 'g', 'S', 'k', 'e'];
          const sampleGlyphs = previewChars
            .map(c => style.glyphs[c])
            .filter((g): g is NonNullable<typeof g> => Boolean(g && g.isAssigned && g.svgPath));

          return (
            <div
              key={style.id}
              onClick={() => {
                if (!isActive) switchStyle(style.id);
              }}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: isActive ? '2px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: isActive ? 'default' : 'pointer',
                position: 'relative',
                transition: 'all 0.15s ease-in-out',
                boxShadow: isActive ? '0 0 16px rgba(99, 102, 241, 0.25)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget.style.borderColor = 'var(--accent)');
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget.style.borderColor = 'var(--border)');
              }}
            >
              {/* Top Row: Name, Weight badge & Active indicator */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        margin: 0,
                        fontStyle: style.isItalic ? 'italic' : 'normal',
                        color: isActive ? '#fff' : 'var(--text-main)',
                      }}>
                        {style.name}
                      </h3>
                      {isActive && (
                        <span style={{
                          backgroundColor: 'var(--accent)',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          letterSpacing: '0.05em',
                        }}>
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '11px',
                        color: 'var(--text-faint)',
                        border: '1px solid var(--border)',
                        padding: '1px 5px',
                        borderRadius: '3px',
                      }}>
                        Weight {style.weightClass}
                      </span>
                      {style.isItalic && (
                        <span style={{
                          fontSize: '11px',
                          color: '#f59e0b',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          padding: '1px 5px',
                          borderRadius: '3px',
                        }}>
                          Italic
                        </span>
                      )}
                    </div>
                  </div>

                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: assignedCount > 0 ? '#10b981' : 'var(--text-faint)'
                  }}>
                    {assignedCount} / {totalCount} glyphs
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: 'var(--bg-main)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: `${percent}%`,
                    height: '100%',
                    backgroundColor: isActive ? 'var(--accent)' : '#10b981',
                    borderRadius: '2px',
                    transition: 'width 0.3s ease',
                  }} />
                </div>

                {/* Live Specimen Preview Box */}
                <div style={{
                  height: '100px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  marginBottom: '16px',
                  position: 'relative',
                  padding: '8px',
                }}>
                  {sampleGlyphs.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', height: '100%' }}>
                      {sampleGlyphs.slice(0, 5).map((glyph, idx) => (
                        <svg
                          key={idx}
                          viewBox="0 -200 1000 1000"
                          style={{
                            height: '70px',
                            width: '45px',
                            fill: 'var(--text-main)',
                            transform: 'scaleY(-1)', // Flip font coordinates for SVG rendering
                            transformOrigin: 'center',
                          }}
                        >
                          <path d={glyph.svgPath} />
                        </svg>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'var(--text-faint)',
                      fontSize: '11px',
                    }}>
                      <Sparkles size={16} />
                      <span>Blank style — Ready for artwork</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border)',
              }}
              onClick={(e) => e.stopPropagation()} // Prevent card click when clicking action buttons
              >
                {isActive ? (
                  <button
                    className="btn-secondary"
                    onClick={() => onNavigateToGlyphs?.()}
                    style={{ fontSize: '12px', flex: 1, gap: '6px', color: 'var(--accent)' }}
                  >
                    <span>Edit Artwork</span>
                    <ArrowRight size={13} />
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    onClick={() => switchStyle(style.id)}
                    style={{ fontSize: '12px', flex: 1, gap: '6px' }}
                  >
                    <span>Switch to this Style</span>
                  </button>
                )}

                {/* Duplicate Button */}
                <button
                  className="btn-secondary"
                  title="Clone/duplicate this style into a new cut"
                  onClick={() => duplicateStyle(style.id, `${style.name} Copy`)}
                  style={{ padding: '6px 10px' }}
                >
                  <Copy size={13} />
                </button>

                {/* Quick Export Button */}
                <button
                  className="btn-secondary"
                  title={`Export ${style.name} OTF binary`}
                  onClick={() => handleQuickExport(style)}
                  style={{ padding: '6px 10px' }}
                >
                  <Download size={13} />
                </button>

                {/* Delete Button (disabled if only 1 style exists) */}
                {stylesList.length > 1 && (
                  <button
                    className="btn-secondary"
                    title="Delete this style"
                    onClick={() => setDeleteCandidate(style)}
                    style={{ padding: '6px 10px', color: '#ef4444' }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Dashed "+ Add Style" Card */}
        <div
          onClick={() => handleOpenAddModal()}
          style={{
            backgroundColor: 'transparent',
            border: '2px dashed var(--border)',
            borderRadius: '12px',
            minHeight: '260px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: 'pointer',
            padding: '24px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Plus size={22} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, display: 'block' }}>Add New Style / Cut</span>
            <span style={{ fontSize: '12px', color: 'var(--text-faint)', display: 'block', marginTop: '4px' }}>
              Create Bold, Italic, Light or clone existing styles
            </span>
          </div>
        </div>
      </div>

      {/* Add Style Modal */}
      <AddStyleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddStyleSubmit}
        existingStyles={stylesList}
        initialSourceStyleId={cloneSourceId || activeStyleId}
      />

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(3px)',
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '420px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', marginBottom: '12px' }}>
              <AlertTriangle size={20} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Delete Style '{deleteCandidate.name}'?</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Are you sure you want to delete this cut? All glyphs and metrics specific to <strong>{deleteCandidate.name}</strong> will be permanently removed.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn-secondary" onClick={() => setDeleteCandidate(null)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                onClick={() => {
                  deleteStyle(deleteCandidate.id);
                  setDeleteCandidate(null);
                }}
              >
                Delete Style
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
