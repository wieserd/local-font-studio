import React, { useState, useMemo, useEffect } from 'react';
import { X, Plus, Sparkles, Check, Globe, Type } from 'lucide-react';
import { useFont } from '../../context/FontContext';
import { GLYPH_PRESET_PACKS, GlyphPresetPack, resolveCharactersFromInput } from '../../utils/glyphPresets';

interface AddGlyphsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGlyphsAdded: (count: number, summary: string) => void;
}

export const AddGlyphsModal: React.FC<AddGlyphsModalProps> = ({
  isOpen,
  onClose,
  onGlyphsAdded,
}) => {
  const { project, addGlyphs } = useFont();
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [customInput, setCustomInput] = useState('');
  const [autoPairCase, setAutoPairCase] = useState(true);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Compute staged custom characters
  const stagedCustomChars = useMemo(() => {
    return resolveCharactersFromInput(customInput, autoPairCase);
  }, [customInput, autoPairCase]);

  // Split staged custom characters into new vs existing
  const { newChars, existingChars } = useMemo(() => {
    const newOnes: string[] = [];
    const existingOnes: string[] = [];

    stagedCustomChars.forEach(c => {
      if (project.glyphs[c]) {
        existingOnes.push(c);
      } else {
        newOnes.push(c);
      }
    });

    return { newChars: newOnes, existingChars: existingOnes };
  }, [stagedCustomChars, project.glyphs]);

  if (!isOpen) return null;

  const handleAddCustom = () => {
    if (newChars.length === 0) return;
    const added = addGlyphs(newChars);
    onGlyphsAdded(added, `Added ${added} new glyph${added > 1 ? 's' : ''}`);
    setCustomInput('');
    onClose();
  };

  const handleAddPresetPack = (pack: GlyphPresetPack) => {
    const missing = pack.characters.filter(c => !project.glyphs[c]);
    if (missing.length === 0) return;
    const added = addGlyphs(missing);
    onGlyphsAdded(added, `Added ${added} glyph${added > 1 ? 's' : ''} from ${pack.name}`);
    onClose();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 7, 12, 0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '88vh',
          backgroundColor: '#111520',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '14px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 1px rgba(99, 102, 241, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: 'var(--text-main)',
          animation: 'fadeIn 0.15s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 22px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#151a26'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              backgroundColor: 'rgba(99, 102, 241, 0.18)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8'
            }}>
              <Plus size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.01em' }}>
                Add Glyphs to Typeface
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Expand character set with language presets or custom Unicode glyphs
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 22px 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#111520'
        }}>
          <button
            onClick={() => setActiveTab('presets')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'presets' ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === 'presets' ? '#ffffff' : 'var(--text-muted)',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: activeTab === 'presets' ? 600 : 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <Globe size={14} style={{ color: activeTab === 'presets' ? 'var(--accent)' : 'inherit' }} />
            <span>Language & Script Packs</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'custom' ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === 'custom' ? '#ffffff' : 'var(--text-muted)',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: activeTab === 'custom' ? 600 : 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <Type size={14} style={{ color: activeTab === 'custom' ? 'var(--accent)' : 'inherit' }} />
            <span>Custom Characters & Hex</span>
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
          {activeTab === 'presets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Select language presets to automatically populate all missing characters across all family styles.
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                gap: '12px'
              }}>
                {GLYPH_PRESET_PACKS.map(pack => {
                  const missingCount = pack.characters.filter(c => !project.glyphs[c]).length;
                  const isAllAdded = missingCount === 0;

                  return (
                    <div
                      key={pack.id}
                      style={{
                        backgroundColor: '#161c28',
                        border: isAllAdded ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '10px',
                        opacity: isAllAdded ? 0.65 : 1,
                        transition: 'border-color 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{pack.name}</span>
                          <span style={{
                            fontSize: '10px',
                            fontFamily: 'monospace',
                            backgroundColor: 'rgba(255, 255, 255, 0.07)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            color: 'var(--text-faint)'
                          }}>
                            {pack.region}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '8px' }}>
                          {pack.description}
                        </div>

                        {/* Character preview chips */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {pack.characters.slice(0, 16).map(char => {
                            const isPresent = Boolean(project.glyphs[char]);
                            return (
                              <span
                                key={char}
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  backgroundColor: isPresent ? 'rgba(255, 255, 255, 0.04)' : 'rgba(99, 102, 241, 0.15)',
                                  border: isPresent ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(99, 102, 241, 0.35)',
                                  color: isPresent ? 'var(--text-faint)' : '#a5b4fc'
                                }}
                                title={`'${char}' ${isPresent ? '(already added)' : '(will be added)'}`}
                              >
                                {char}
                              </span>
                            );
                          })}
                          {pack.characters.length > 16 && (
                            <span style={{ fontSize: '10px', color: 'var(--text-faint)', alignSelf: 'center', paddingLeft: '4px', fontFamily: 'monospace' }}>
                              +{pack.characters.length - 16} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '8px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                      }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {isAllAdded ? (
                            <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                              <Check size={12} /> All added
                            </span>
                          ) : (
                            <span>{missingCount} missing</span>
                          )}
                        </span>

                        <button
                          onClick={() => handleAddPresetPack(pack)}
                          disabled={isAllAdded}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '5px',
                            fontSize: '11px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: isAllAdded ? 'default' : 'pointer',
                            backgroundColor: isAllAdded ? 'rgba(255, 255, 255, 0.05)' : 'var(--accent)',
                            color: isAllAdded ? 'var(--text-faint)' : '#ffffff',
                            border: 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {!isAllAdded && <Plus size={12} strokeWidth={2.5} />}
                          <span>{isAllAdded ? 'Already Added' : `Add ${missingCount} Glyphs`}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'custom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Type or Paste Characters or Unicode Hex (e.g. Ä, Ђ, €, or U+00C4)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Type or paste characters (e.g. Ä, ö, Љ, ß, €)..."
                    autoFocus
                    style={{
                      width: '100%',
                      backgroundColor: '#0c0f17',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      paddingRight: '36px',
                      fontSize: '14px',
                      color: '#ffffff',
                      fontFamily: 'monospace',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                  />
                  {customInput && (
                    <button
                      onClick={() => setCustomInput('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Auto Case Pairing Checkbox Card */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  cursor: 'pointer'
                }}
                onClick={() => setAutoPairCase(!autoPairCase)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={autoPairCase}
                    onChange={(e) => setAutoPairCase(e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>
                      Automatically pair uppercase & lowercase
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Typing Ä automatically includes ä, typing Ђ includes ђ
                    </div>
                  </div>
                </div>
                <Sparkles size={16} style={{ color: 'var(--accent)' }} />
              </div>

              {/* Quick Preset Suggestions */}
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Quick Suggestions:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['Ä', 'Ö', 'Ü', 'ß', 'Ђ', 'Љ', 'Њ', 'Ћ', 'Џ', 'É', 'Ç', 'Ñ', 'Å', 'Ø', '€', '£', '¥', '—', '«', '»'].map(c => (
                    <button
                      key={c}
                      onClick={() => {
                        const added = customInput ? `${customInput}${c}` : c;
                        setCustomInput(added);
                      }}
                      style={{
                        backgroundColor: '#161c28',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '4px 10px',
                        borderRadius: '5px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.backgroundColor = '#161c28';
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Staged Characters Live Preview */}
              {stagedCustomChars.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>Staged Characters ({stagedCustomChars.length}):</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                      {newChars.length} will be added ({existingChars.length} already exist)
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    maxHeight: '160px',
                    overflowY: 'auto',
                    padding: '10px',
                    backgroundColor: '#0c0f17',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}>
                    {stagedCustomChars.map(char => {
                      const isExisting = Boolean(project.glyphs[char]);
                      const codePoint = char.codePointAt(0) || 0;
                      const hex = 'U+' + codePoint.toString(16).toUpperCase().padStart(4, '0');

                      return (
                        <div
                          key={char}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: isExisting ? 'rgba(255, 255, 255, 0.03)' : 'rgba(99, 102, 241, 0.12)',
                            border: isExisting ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(99, 102, 241, 0.35)',
                            color: isExisting ? 'var(--text-faint)' : '#ffffff'
                          }}
                        >
                          <span style={{ fontSize: '16px', fontWeight: 700 }}>{char}</span>
                          <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-faint)' }}>{hex}</span>
                          {isExisting ? (
                            <span style={{ fontSize: '9px', color: 'var(--text-faint)', fontWeight: 500 }}>exists</span>
                          ) : (
                            <span style={{ fontSize: '9px', color: '#34d399', fontWeight: 700, backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '1px 4px', borderRadius: '3px' }}>NEW</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 22px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#151a26'
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {activeTab === 'custom' && newChars.length > 0 && (
              <span>Ready to add <strong style={{ color: '#ffffff' }}>{newChars.length}</strong> new glyph{newChars.length > 1 ? 's' : ''}</span>
            )}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onClose}
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              Cancel
            </button>
            {activeTab === 'custom' && (
              <button
                onClick={handleAddCustom}
                disabled={newChars.length === 0}
                className="btn-primary"
                style={{
                  fontSize: '12px',
                  padding: '6px 16px',
                  opacity: newChars.length === 0 ? 0.5 : 1,
                  cursor: newChars.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>Add {newChars.length > 0 ? `${newChars.length} Glyphs` : 'Glyphs'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
