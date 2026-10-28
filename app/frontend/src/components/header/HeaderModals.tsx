import React from 'react';
import { FolderPlus, Plus, Keyboard, Type, Wand2, Github, ExternalLink, Sparkles } from 'lucide-react';
import {
  ScaffoldModalState,
  modalBackdropStyle,
  modalBoxStyle,
  shortcutRowStyle,
  kbdStyle
} from './headerTypes';

interface HeaderModalsProps {
  newProjectModalOpen: boolean;
  setNewProjectModalOpen: (open: boolean) => void;
  newProjectName: string;
  setNewProjectName: (name: string) => void;
  newProjectDesigner: string;
  setNewProjectDesigner: (designer: string) => void;
  handleCreateNewProject: (e: React.FormEvent) => void;

  shortcutsModalOpen: boolean;
  setShortcutsModalOpen: (open: boolean) => void;

  aboutModalOpen: boolean;
  setAboutModalOpen: (open: boolean) => void;

  scaffoldModal: ScaffoldModalState | null;
  setScaffoldModal: (state: ScaffoldModalState | null) => void;
}

export const HeaderModals: React.FC<HeaderModalsProps> = ({
  newProjectModalOpen,
  setNewProjectModalOpen,
  newProjectName,
  setNewProjectName,
  newProjectDesigner,
  setNewProjectDesigner,
  handleCreateNewProject,

  shortcutsModalOpen,
  setShortcutsModalOpen,

  aboutModalOpen,
  setAboutModalOpen,

  scaffoldModal,
  setScaffoldModal
}) => {
  return (
    <>
      {/* MODAL 1: New Font Project */}
      {newProjectModalOpen && (
        <div style={modalBackdropStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <FolderPlus size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Start New Font Family Project</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Initializes a clean typeface workspace</span>
              </div>
            </div>

            <form onSubmit={handleCreateNewProject} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Typeface Family Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Modern Gothic"
                  required
                  style={{ width: '100%', fontSize: '13px', padding: '6px 10px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Designer / Foundry Credit
                </label>
                <input
                  type="text"
                  value={newProjectDesigner}
                  onChange={(e) => setNewProjectDesigner(e.target.value)}
                  placeholder="Your Name or Studio"
                  style={{ width: '100%', fontSize: '13px', padding: '6px 10px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setNewProjectModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  <Plus size={14} />
                  <span>Create Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Keyboard Shortcuts Guide */}
      {shortcutsModalOpen && (
        <div style={modalBackdropStyle}>
          <div style={{ ...modalBoxStyle, maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Keyboard size={18} style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Keyboard Shortcuts</h3>
              </div>
              <button className="btn-ghost" onClick={() => setShortcutsModalOpen(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Navigation Shortcuts
              </div>
              <div style={shortcutRowStyle}><span>Save Project</span><kbd style={kbdStyle}>⌘S / Ctrl+S</kbd></div>
              <div style={shortcutRowStyle}><span>Export Center (OTF / TTF / SVG)</span><kbd style={kbdStyle}>⌘E</kbd></div>
              <div style={shortcutRowStyle}><span>Import Artwork</span><kbd style={kbdStyle}>⌘I</kbd></div>
              <div style={shortcutRowStyle}><span>Jump to Family & Styles</span><kbd style={kbdStyle}>⌘1</kbd></div>
              <div style={shortcutRowStyle}><span>Jump to Import Artwork</span><kbd style={kbdStyle}>⌘2</kbd></div>
              <div style={shortcutRowStyle}><span>Jump to Glyph Map</span><kbd style={kbdStyle}>⌘3</kbd></div>
              <div style={shortcutRowStyle}><span>Jump to Glyph Vector Editor</span><kbd style={kbdStyle}>⌘4</kbd></div>
              <div style={shortcutRowStyle}><span>Jump to Metrics & Word Space</span><kbd style={kbdStyle}>⌘5</kbd></div>
              <div style={shortcutRowStyle}><span>Jump to Kerning Pairs</span><kbd style={kbdStyle}>⌘6</kbd></div>
              <div style={shortcutRowStyle}><span>Jump to Live Specimen</span><kbd style={kbdStyle}>⌘7</kbd></div>
              <div style={shortcutRowStyle}><span>Close Menus / Dismiss Dialogs</span><kbd style={kbdStyle}>Escape</kbd></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn-primary" onClick={() => setShortcutsModalOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: About Studio */}
      {aboutModalOpen && (
        <div style={modalBackdropStyle}>
          <div style={{ ...modalBoxStyle, maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Type size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>LOCAL FONT STUDIO</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Version 0.1.0 • Independent Open-Source Project</span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '8px',
              fontSize: '12px'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>
                Created by <strong style={{ color: '#ffffff' }}>wieserd</strong>
              </span>
              <a
                href="https://github.com/wieserd"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#818cf8',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(99, 102, 241, 0.12)',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.12)'}
              >
                <Github size={13} />
                <span>github.com/wieserd</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <p style={{ fontSize: '12px', lineHeight: 1.5, color: 'var(--text-muted)', margin: 0 }}>
              Independent in-browser typography editor and font compiler. Build multi-cut font families, trace custom artwork, edit vector bezier curves, adjust word spacing (U+0020), and export installable OpenType CFF (.otf), TrueType (.ttf), and SVG (.zip) bundles.
            </p>

            {/* The S.O.U.L. License Neon Glowing Card */}
            <div
              className="soul-neon-card"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                border: '1.5px solid rgba(236, 72, 153, 0.5)',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Top Row: Neon Title + Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={14} style={{ color: '#ec4899' }} />
                  <span
                    className="soul-neon-title"
                    style={{
                      fontWeight: 800,
                      fontSize: '12.5px',
                      letterSpacing: '0.06em',
                      color: '#ffffff'
                    }}
                  >
                    THIS SOFTWARE HAS S.O.U.L.
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '9px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(236, 72, 153, 0.18)',
                    color: '#f472b6',
                    border: '1px solid rgba(236, 72, 153, 0.4)',
                    letterSpacing: '0.05em'
                  }}
                >
                  S.O.U.L. v1.0
                </span>
              </div>

              {/* The S.O.U.L. Breakdown Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '6px',
                fontSize: '10.5px'
              }}>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '6px 8px', borderRadius: '5px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <span style={{ color: '#ec4899', fontWeight: 800, marginRight: '4px' }}>[S]</span>
                  <strong style={{ color: 'var(--text-main)' }}>Share-Alike:</strong>{' '}
                  <span style={{ color: 'var(--text-muted)' }}>Forks must keep this license & credit <em>wieserd</em>.</span>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '6px 8px', borderRadius: '5px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <span style={{ color: '#38bdf8', fontWeight: 800, marginRight: '4px' }}>[O]</span>
                  <strong style={{ color: 'var(--text-main)' }}>Output-Free:</strong>{' '}
                  <span style={{ color: 'var(--text-muted)' }}>Your created fonts are 100% yours to sell freely.</span>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '6px 8px', borderRadius: '5px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 800, marginRight: '4px' }}>[U]</span>
                  <strong style={{ color: 'var(--text-main)' }}>Uncommercial:</strong>{' '}
                  <span style={{ color: 'var(--text-muted)' }}>Big corps cannot sell this tool or host it as SaaS.</span>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '6px 8px', borderRadius: '5px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <span style={{ color: '#10b981', fontWeight: 800, marginRight: '4px' }}>[L]</span>
                  <strong style={{ color: 'var(--text-main)' }}>Leave-Me-Alone:</strong>{' '}
                  <span style={{ color: 'var(--text-muted)' }}>As-is, zero liability, author disclaims all forks.</span>
                </div>
              </div>

              {/* Creator credit & Motto */}
              <div style={{
                fontSize: '10px',
                color: 'var(--text-faint)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>Created by <strong>wieserd</strong> (<a href="https://github.com/wieserd" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>github.com/wieserd</a>)</span>
                <span style={{ color: '#a78bfa', fontWeight: 600 }}>Add some S.O.U.L. ✨</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '10px 12px', borderRadius: '6px', fontSize: '11px', border: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Open Source Licenses:</span>
              <div style={{ color: 'var(--text-faint)', lineHeight: 1.4 }}>
                • <code>opentype.js</code> (MIT) — OpenType table compilation<br />
                • <code>jszip</code> (MIT) — SVG package archive generation<br />
                • <code>lucide-react</code> (ISC) — Iconography system<br />
                • <code>react</code> / <code>vite</code> (MIT) — Reactive UI runtime
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button className="btn-primary" onClick={() => setAboutModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Feature Scaffold Dialog */}
      {scaffoldModal && scaffoldModal.isOpen && (
        <div style={modalBackdropStyle}>
          <div style={{ ...modalBoxStyle, maxWidth: '440px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                <Wand2 size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{scaffoldModal.title}</h3>
                <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {scaffoldModal.phase}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '12px', lineHeight: 1.5, color: 'var(--text-main)', margin: 0 }}>
              {scaffoldModal.description}
            </p>

            <div style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '11px',
              color: 'var(--text-faint)',
              border: '1px dashed var(--border)'
            }}>
              Scaffolded menu action ready for integration into the typography engine pipeline.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button className="btn-primary" onClick={() => setScaffoldModal(null)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
