import React, { useState, useEffect } from 'react';
import {
  Type,
  FolderPlus,
  Save,
  Copy,
  Upload,
  Download,
  FileCode,
  Archive,
  Settings,
  Undo,
  Redo,
  Grid3X3,
  Sliders,
  Layers,
  PenTool,
  Ruler,
  MoveHorizontal,
  Eye,
  Maximize2,
  Sparkles,
  RotateCcw,
  Plus,
  Wand2,
  Check,
  Keyboard,
  HelpCircle,
  Info,
  BookOpen,
  Terminal,
  Clock,
  AlertTriangle,
  HardDrive,
  Gauge,
  Moon,
  Sun,
  ShieldCheck,
  Puzzle,
  Zap,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Palette,
  FileSpreadsheet,
  Trash2
} from 'lucide-react';
import developerStatsData from '../../generated/developerStats.json';
import { TabId } from '../Tabs';
import { FontStyleState } from '../../types/font';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useAddons } from '../../addons/AddonContext';
import { useFont } from '../../context/FontContext';
import {
  ActiveMenuId,
  getMenuBtnStyle,
  dropdownStyle,
  submenuDropdownStyle,
  menuDividerStyle,
  shortcutStyle
} from './headerTypes';

type ActiveSubMenuId =
  // File
  | 'file-import'
  | 'file-export'
  // Edit
  | 'edit-transform'
  | 'edit-audit'
  // Font
  | 'font-family'
  | 'font-glyphs'
  | 'font-metrics'
  | 'font-kerning'
  // View
  | 'view-workspaces'
  | 'view-zoom'
  | 'view-theme'
  // Addons
  | 'addons-installed'
  | 'addons-dev'
  // Help
  | 'help-docs'
  | 'help-dev'
  | null;

interface AppMenuBarProps {
  menuContainerRef: React.RefObject<HTMLDivElement>;
  activeMenu: ActiveMenuId;
  setActiveMenu: (menu: ActiveMenuId) => void;
  handleMenuHover: (menuId: ActiveMenuId) => void;
  closeMenu: () => void;
  showScaffold: (title: string, description: string, phase?: string) => void;
  setAboutModalOpen: (open: boolean) => void;
  setNewProjectModalOpen: (open: boolean) => void;
  setShortcutsModalOpen: (open: boolean) => void;
  setHandbookModalOpen: (open: boolean) => void;
  setDeveloperModalOpen: (open: boolean) => void;
  setFontAuditModalOpen?: (open: boolean) => void;
  setAddonManagerModalOpen?: (open: boolean) => void;
  onSave?: () => void;
  onNavigate: (tab: TabId) => void;
  onQuickExportOtf?: () => void;
  onQuickExportSvg?: () => void;
  activeTab: TabId;
  selectedGlyphChar: string;
  stylesList: FontStyleState[];
  activeStyleId: string;
  switchStyle: (styleId: string) => void;
}

export const AppMenuBar: React.FC<AppMenuBarProps> = ({
  menuContainerRef,
  activeMenu,
  setActiveMenu,
  handleMenuHover,
  closeMenu,
  showScaffold,
  setAboutModalOpen,
  setNewProjectModalOpen,
  setShortcutsModalOpen,
  setHandbookModalOpen,
  setDeveloperModalOpen,
  setFontAuditModalOpen,
  setAddonManagerModalOpen,
  onSave,
  onNavigate,
  onQuickExportOtf,
  onQuickExportSvg,
  activeTab,
  selectedGlyphChar,
  stylesList,
  activeStyleId,
  switchStyle
}) => {
  const { settings, updateSettings, setIsSettingsModalOpen } = useAppSettings();
  const { isAddonEnabled, setIsAddonManagerOpen } = useAddons();
  const { flushToPristineEmptyState } = useFont();
  const [activeSubMenu, setActiveSubMenu] = useState<ActiveSubMenuId>(null);

  // Close submenus whenever top-level menu changes or closes
  useEffect(() => {
    setActiveSubMenu(null);
  }, [activeMenu]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} ref={menuContainerRef}>
      {/* App Logo & Brand */}
      <div
        onClick={() => setAboutModalOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          paddingRight: '8px',
          marginRight: '4px',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          cursor: 'pointer'
        }}
        title="About Local Font Studio"
      >
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '5px',
          backgroundColor: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
        }}>
          <Type size={14} />
        </div>
        <span style={{ fontWeight: 700, fontSize: '12px', letterSpacing: '0.04em', color: 'var(--text-main)' }}>
          STUDIO
        </span>
      </div>

      {/* ========================================================= */}
      {/* 1. FILE MENU                                              */}
      {/* ========================================================= */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
          onMouseEnter={() => handleMenuHover('file')}
          style={getMenuBtnStyle(activeMenu === 'file')}
        >
          File
        </button>

        {activeMenu === 'file' && (
          <div style={dropdownStyle}>
            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu(null)}
              onClick={() => { closeMenu(); setNewProjectModalOpen(true); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderPlus size={13} style={{ color: 'var(--accent)' }} />
                <span>New Font Project...</span>
              </div>
              <span style={shortcutStyle}>⌘N</span>
            </div>

            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu(null)}
              onClick={() => { closeMenu(); onSave?.(); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Save size={13} style={{ color: '#10b981' }} />
                <span>Save Project</span>
              </div>
              <span style={shortcutStyle}>⌘S</span>
            </div>

            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu(null)}
              onClick={() => showScaffold('Duplicate Project', 'Create an independent clone of this font family under a new name.')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Copy size={13} />
                <span>Save As / Duplicate...</span>
              </div>
              <span style={shortcutStyle}>⇧⌘S</span>
            </div>

            <div style={menuDividerStyle} />

            {/* Submenu: Import */}
            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu('file-import')}
              style={{
                position: 'relative',
                backgroundColor: activeSubMenu === 'file-import' ? 'var(--accent)' : undefined,
                color: activeSubMenu === 'file-import' ? '#ffffff' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={13} style={{ color: activeSubMenu === 'file-import' ? '#ffffff' : '#38bdf8' }} />
                <span>Import Artwork & Data</span>
              </div>
              <ChevronRight size={12} style={{ color: activeSubMenu === 'file-import' ? '#ffffff' : 'var(--text-faint)' }} />

              {activeSubMenu === 'file-import' && (
                <div style={submenuDropdownStyle} onClick={(e) => e.stopPropagation()}>
                  <div className="menu-item" onClick={() => { closeMenu(); onNavigate('import'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Upload size={13} style={{ color: '#38bdf8' }} />
                      <span>Import Artwork & Scans Sheet...</span>
                    </div>
                    <span style={shortcutStyle}>⌘I</span>
                  </div>

                  <div className="menu-item" onClick={() => { closeMenu(); onNavigate('glyph-editor'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileSpreadsheet size={13} />
                      <span>Import Vector Outlines / SVG...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submenu: Export */}
            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu('file-export')}
              style={{
                position: 'relative',
                backgroundColor: activeSubMenu === 'file-export' ? 'var(--accent)' : undefined,
                color: activeSubMenu === 'file-export' ? '#ffffff' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={13} style={{ color: activeSubMenu === 'file-export' ? '#ffffff' : '#f59e0b' }} />
                <span>Export Fonts & Assets</span>
              </div>
              <ChevronRight size={12} style={{ color: activeSubMenu === 'file-export' ? '#ffffff' : 'var(--text-faint)' }} />

              {activeSubMenu === 'file-export' && (
                <div style={submenuDropdownStyle} onClick={(e) => e.stopPropagation()}>
                  <div className="menu-item" onClick={() => { closeMenu(); onNavigate('export'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Download size={13} style={{ color: '#f59e0b' }} />
                      <span>Export Center...</span>
                    </div>
                    <span style={shortcutStyle}>⌘E</span>
                  </div>

                  <div style={menuDividerStyle} />

                  <div className="menu-item" onClick={() => { closeMenu(); onQuickExportOtf?.(); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileCode size={13} />
                      <span>Quick Export Active Cut (.otf)</span>
                    </div>
                  </div>

                  <div className="menu-item" onClick={() => { closeMenu(); onQuickExportSvg?.(); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Archive size={13} />
                      <span>Export Glyphs as SVG Archive (.zip)</span>
                    </div>
                  </div>

                  <div className="menu-item" onClick={() => { closeMenu(); onNavigate('export'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Archive size={13} style={{ color: 'var(--accent)' }} />
                      <span>Batch Export Entire Family ({stylesList.length} Cuts)...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={menuDividerStyle} />

            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu(null)}
              onClick={() => { closeMenu(); onNavigate('settings'); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={13} />
                <span>Font Metadata & OpenType...</span>
              </div>
            </div>

            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu(null)}
              onClick={() => { closeMenu(); setIsSettingsModalOpen(true); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={13} style={{ color: '#38bdf8' }} />
                <span>App Preferences & Autosave...</span>
              </div>
              <span style={shortcutStyle}>⌘,</span>
            </div>

            <div style={menuDividerStyle} />

            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu(null)}
              onClick={() => {
                closeMenu();
                if (window.confirm(
                  "Reset Workspace?\n\n" +
                  "This will permanently erase all custom glyphs, vector contours, and imported scans from your browser storage.\n\n" +
                  "Are you sure you want to proceed?"
                )) {
                  flushToPristineEmptyState();
                  window.location.reload();
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trash2 size={13} style={{ color: '#ef4444' }} />
                <span style={{ color: '#ef4444', fontWeight: 500 }}>Reset Workspace...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2. EDIT MENU                                              */}
      {/* ========================================================= */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
          onMouseEnter={() => handleMenuHover('edit')}
          style={getMenuBtnStyle(activeMenu === 'edit')}
        >
          Edit
        </button>

        {activeMenu === 'edit' && (
          <div style={dropdownStyle}>
            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu(null)}
              onClick={() => showScaffold('Undo', 'Full multi-step vector undo is enabled within the Glyph Editor canvas.')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Undo size={13} />
                <span>Undo</span>
              </div>
              <span style={shortcutStyle}>⌘Z</span>
            </div>

            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu(null)}
              onClick={() => showScaffold('Redo', 'Redo previously reverted canvas actions.')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Redo size={13} />
                <span>Redo</span>
              </div>
              <span style={shortcutStyle}>⇧⌘Z</span>
            </div>

            <div style={menuDividerStyle} />

            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu(null)}
              onClick={() => { closeMenu(); onNavigate('glyph-map'); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Grid3X3 size={13} />
                <span>Select All Glyphs</span>
              </div>
              <span style={shortcutStyle}>⌘A</span>
            </div>

            {/* Submenu: Batch Transforms & Case */}
            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu('edit-transform')}
              style={{
                position: 'relative',
                backgroundColor: activeSubMenu === 'edit-transform' ? 'var(--accent)' : undefined,
                color: activeSubMenu === 'edit-transform' ? '#ffffff' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Copy size={13} style={{ color: activeSubMenu === 'edit-transform' ? '#ffffff' : 'var(--accent)' }} />
                <span>Batch Transforms & Case</span>
              </div>
              <ChevronRight size={12} style={{ color: activeSubMenu === 'edit-transform' ? '#ffffff' : 'var(--text-faint)' }} />

              {activeSubMenu === 'edit-transform' && (
                <div style={submenuDropdownStyle} onClick={(e) => e.stopPropagation()}>
                  <div className="menu-item" onClick={() => { closeMenu(); onNavigate('import'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Copy size={13} />
                      <span>Copy Uppercase → Lowercase...</span>
                    </div>
                  </div>

                  <div className="menu-item" onClick={() => { closeMenu(); onNavigate('import'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Copy size={13} />
                      <span>Copy Lowercase → Uppercase...</span>
                    </div>
                  </div>

                  <div style={menuDividerStyle} />

                  <div className="menu-item" onClick={() => showScaffold('Batch Slant Contours', 'Apply italic shear matrix angle across all glyph contours.')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Wand2 size={13} />
                      <span>Batch Slant Contours (Italic)...</span>
                    </div>
                  </div>

                  <div className="menu-item" onClick={() => showScaffold('Batch Stem Weight', 'Apply contour dilation / erosion weight scaling across all glyphs.')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sliders size={13} />
                      <span>Batch Stem Weight (Bold/Light)...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submenu: Contour Auditing & Repair */}
            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu('edit-audit')}
              style={{
                position: 'relative',
                backgroundColor: activeSubMenu === 'edit-audit' ? 'var(--accent)' : undefined,
                color: activeSubMenu === 'edit-audit' ? '#ffffff' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={13} style={{ color: activeSubMenu === 'edit-audit' ? '#ffffff' : '#10b981' }} />
                <span>Contour Auditing & Repair</span>
              </div>
              <ChevronRight size={12} style={{ color: activeSubMenu === 'edit-audit' ? '#ffffff' : 'var(--text-faint)' }} />

              {activeSubMenu === 'edit-audit' && (
                <div style={submenuDropdownStyle} onClick={(e) => e.stopPropagation()}>
                  <div className="menu-item" onClick={() => { closeMenu(); setFontAuditModalOpen?.(true); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={13} style={{ color: '#10b981' }} />
                      <span>Pre-flight Outlines (FontAudit)...</span>
                    </div>
                  </div>

                  <div className="menu-item" onClick={() => { closeMenu(); onNavigate('glyph-editor'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={13} style={{ color: '#a855f7' }} />
                      <span>Laplacian / Chaikin Smoothing...</span>
                    </div>
                  </div>

                  <div className="menu-item" onClick={() => { closeMenu(); onNavigate('glyph-editor'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RotateCcw size={13} />
                      <span>Rotate Glyph Contours...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={menuDividerStyle} />

            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu(null)}
              onClick={() => { closeMenu(); setIsSettingsModalOpen(true); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={13} style={{ color: 'var(--accent)' }} />
                <span>Studio Preferences...</span>
              </div>
              <span style={shortcutStyle}>⌘,</span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. FONT MASTER MENU                                       */}
      {/* ========================================================= */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setActiveMenu(activeMenu === 'font' ? null : 'font')}
          onMouseEnter={() => handleMenuHover('font')}
          style={getMenuBtnStyle(activeMenu === 'font')}
        >
          Font
        </button>

        {activeMenu === 'font' && (
          <div style={dropdownStyle}>
            {/* Submenu: Family & Styles */}
            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu('font-family')}
              style={{
                position: 'relative',
                backgroundColor: activeSubMenu === 'font-family' ? 'var(--accent)' : undefined,
                color: activeSubMenu === 'font-family' ? '#ffffff' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={13} style={{ color: activeSubMenu === 'font-family' ? '#ffffff' : 'var(--accent)' }} />
                <span>Family & Styles</span>
              </div>
              <ChevronRight size={12} style={{ color: activeSubMenu === 'font-family' ? '#ffffff' : 'var(--text-faint)' }} />

              {activeSubMenu === 'font-family' && (
                <div style={submenuDropdownStyle} onClick={(e) => e.stopPropagation()}>
                  <div className="menu-item" onClick={() => { closeMenu(); onNavigate('family-styles'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={13} style={{ color: 'var(--accent)' }} />
                      <span>Manage Styles & Cuts Deck...</span>
                    </div>
                    <span style={shortcutStyle}>⌘1</span>
                  </div>

                  <div className="menu-item" onClick={() => { closeMenu(); onNavigate('family-styles'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Plus size={13} style={{ color: '#10b981' }} />
                      <span>Add New Style Cut...</span>
                    </div>
                  </div>

                  <div style={menuDividerStyle} />

                  <div style={{ padding: '4px 10px', fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Active Cuts ({stylesList.length}):
                  </div>

                  {stylesList.map((s) => {
                    const isCurrent = s.id === activeStyleId;
                    return (
                      <div
                        key={s.id}
                        className="menu-item"
                        style={{
                          fontWeight: isCurrent ? 700 : 400,
                          color: isCurrent ? 'var(--accent)' : 'var(--text-main)',
                          paddingLeft: '16px'
                        }}
                        onClick={() => {
                          closeMenu();
                          switchStyle(s.id);
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isCurrent ? <Check size={12} /> : <span style={{ width: '12px' }} />}
                          <span>{s.name} ({s.weightClass})</span>
                        </div>
                        {s.isItalic && <span style={{ fontSize: '10px', color: '#f59e0b' }}>Italic</span>}
                      </div>
                    );
                  })}

                  <div style={menuDividerStyle} />

                  <div className="menu-item" onClick={() => showScaffold('Interpolate Weight Cut', 'Interpolate between two cuts (e.g. Regular 400 and Bold 700) to mathematically generate intermediate weights (Medium 500, SemiBold 600).')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Wand2 size={13} />
                      <span>Interpolate Weight Cut...</span>
                    </div>
                  </div>

                  <div className="menu-item" onClick={() => { closeMenu(); onNavigate('export'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Archive size={13} />
                      <span>Batch Export Entire Family ({stylesList.length} Cuts)...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submenu: Glyphs & Outlines */}
            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu('font-glyphs')}
              style={{
                position: 'relative',
                backgroundColor: activeSubMenu === 'font-glyphs' ? 'var(--accent)' : undefined,
                color: activeSubMenu === 'font-glyphs' ? '#ffffff' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PenTool size={13} style={{ color: activeSubMenu === 'font-glyphs' ? '#ffffff' : 'var(--accent)' }} />
                <span>Glyphs & Outlines</span>
              </div>
              <ChevronRight size={12} style={{ color: activeSubMenu === 'font-glyphs' ? '#ffffff' : 'var(--text-faint)' }} />

              {activeSubMenu === 'font-glyphs' && (
                <div style={submenuDropdownStyle} onClick={(e) => e.stopPropagation()}>
                  <div className="menu-item" onClick={() => { closeMenu(); onNavigate('glyph-editor'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PenTool size={13} style={{ color: 'var(--accent)' }} />
                      <span>Edit '{selectedGlyphChar === ' ' ? '␣ Space' : selectedGlyphChar}' in Canvas</span>
                    </div>
                    <span style={shortcutStyle}>⌘4</span>
                  </div>

                  <div className="menu-item" onClick={() => { closeMenu(); onNavigate('glyph-editor'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={13} style={{ color: '#a855f7' }} />
                      <span>Make Smoother (Laplacian / Chaikin)...</span>
                    </div>
                  </div>

                  <div className="menu-item" onClick={() => { closeMenu(); onNavigate('glyph-editor'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RotateCcw size={13} />
                      <span>Rotate Glyph Contours...</span>
                    </div>
                  </div>

                  <div className="menu-item" onClick={() => { closeMenu(); setFontAuditModalOpen?.(true); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={13} style={{ color: '#10b981' }} />
                      <span>Audit Contour Geometry & Fix Winding...</span>
                    </div>
                  </div>

                  <div style={menuDividerStyle} />

                  <div className="menu-item" onClick={() => showScaffold('Add Custom Unicode Glyph', 'Create any arbitrary Unicode code point (e.g. arrows, dingbats, math symbols, Cyrillic, Greek).')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Plus size={13} />
                      <span>Add Custom Unicode Glyph...</span>
                    </div>
                  </div>

                  <div className="menu-item" onClick={() => showScaffold('Generate Accents & Diacritics', 'Automatically compose diacritics (ä, ö, ü, é, ñ, etc.) by combining base letter glyphs with floating accent marks.')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Wand2 size={13} />
                      <span>Auto-Compose Diacritics (Ä, Ö, É...)...</span>
                    </div>
                  </div>

                  <div className="menu-item" onClick={() => { closeMenu(); onNavigate('import'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Upload size={13} />
                      <span>Replace Artwork from Image Scan...</span>
                    </div>
                    <span style={shortcutStyle}>⌘2</span>
                  </div>
                </div>
              )}
            </div>

            {/* Submenu: Metrics & Spacing */}
            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu('font-metrics')}
              style={{
                position: 'relative',
                backgroundColor: activeSubMenu === 'font-metrics' ? 'var(--accent)' : undefined,
                color: activeSubMenu === 'font-metrics' ? '#ffffff' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ruler size={13} style={{ color: activeSubMenu === 'font-metrics' ? '#ffffff' : 'var(--accent)' }} />
                <span>Metrics & Spacing</span>
              </div>
              <ChevronRight size={12} style={{ color: activeSubMenu === 'font-metrics' ? '#ffffff' : 'var(--text-faint)' }} />

              {activeSubMenu === 'font-metrics' && (
                <div style={submenuDropdownStyle} onClick={(e) => e.stopPropagation()}>
                  <div className="menu-item" onClick={() => { closeMenu(); onNavigate('metrics'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Ruler size={13} style={{ color: 'var(--accent)' }} />
                      <span>Word Space Width (U+0020)...</span>
                    </div>
                    <span style={shortcutStyle}>⌘5</span>
                  </div>

                  <div className="menu-item" onClick={() => { closeMenu(); onNavigate('metrics'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sliders size={13} />
                      <span>Ascender, Descender & UPM Table...</span>
                    </div>
                  </div>

                  <div style={menuDividerStyle} />

                  <div className="menu-item" onClick={() => showScaffold('Optical Auto-Spacing Engine', 'Evaluates white space balance between letter contours and automatically suggests harmonious left/right sidebearings.')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Wand2 size={13} />
                      <span>Optical Auto-Spacing Wizard...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submenu: Kerning Pairs */}
            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu('font-kerning')}
              style={{
                position: 'relative',
                backgroundColor: activeSubMenu === 'font-kerning' ? 'var(--accent)' : undefined,
                color: activeSubMenu === 'font-kerning' ? '#ffffff' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MoveHorizontal size={13} style={{ color: activeSubMenu === 'font-kerning' ? '#ffffff' : 'var(--accent)' }} />
                <span>Kerning Pairs</span>
              </div>
              <ChevronRight size={12} style={{ color: activeSubMenu === 'font-kerning' ? '#ffffff' : 'var(--text-faint)' }} />

              {activeSubMenu === 'font-kerning' && (
                <div style={submenuDropdownStyle} onClick={(e) => e.stopPropagation()}>
                  <div className="menu-item" onClick={() => { closeMenu(); onNavigate('kerning'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MoveHorizontal size={13} style={{ color: 'var(--accent)' }} />
                      <span>Pair Kerning Matrix...</span>
                    </div>
                    <span style={shortcutStyle}>⌘6</span>
                  </div>

                  <div className="menu-item" onClick={() => showScaffold('Auto-Kerning Assistant', 'Scans all uppercase/lowercase pairs for negative visual collisions (e.g. AV, To, WA) and proposes balanced GPOS pair adjustments.')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={13} />
                      <span>Auto-Kerning Assistant...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={menuDividerStyle} />

            {/* Direct Font Tools */}
            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu(null)}
              onClick={() => { closeMenu(); onNavigate('settings'); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={13} />
                <span>Font Metadata & OpenType...</span>
              </div>
            </div>

            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu(null)}
              onClick={() => { closeMenu(); setFontAuditModalOpen?.(true); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={13} style={{ color: '#10b981' }} />
                <span>Pre-flight Outlines (FontAudit)...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. VIEW MENU                                              */}
      {/* ========================================================= */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
          onMouseEnter={() => handleMenuHover('view')}
          style={getMenuBtnStyle(activeMenu === 'view')}
        >
          View
        </button>

        {activeMenu === 'view' && (
          <div style={dropdownStyle}>
            {/* Submenu: Studio Workspaces */}
            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu('view-workspaces')}
              style={{
                position: 'relative',
                backgroundColor: activeSubMenu === 'view-workspaces' ? 'var(--accent)' : undefined,
                color: activeSubMenu === 'view-workspaces' ? '#ffffff' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={13} style={{ color: activeSubMenu === 'view-workspaces' ? '#ffffff' : 'var(--accent)' }} />
                <span>Studio Workspaces</span>
              </div>
              <ChevronRight size={12} style={{ color: activeSubMenu === 'view-workspaces' ? '#ffffff' : 'var(--text-faint)' }} />

              {activeSubMenu === 'view-workspaces' && (
                <div style={submenuDropdownStyle} onClick={(e) => e.stopPropagation()}>
                  <div className="menu-item" style={{ fontWeight: activeTab === 'family-styles' ? 600 : 400 }} onClick={() => { closeMenu(); onNavigate('family-styles'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={13} style={{ color: 'var(--accent)' }} />
                      <span>Family & Styles Deck</span>
                    </div>
                    <span style={shortcutStyle}>⌘1</span>
                  </div>

                  <div className="menu-item" style={{ fontWeight: activeTab === 'import' ? 600 : 400 }} onClick={() => { closeMenu(); onNavigate('import'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Upload size={13} />
                      <span>Import Artwork Sheet</span>
                    </div>
                    <span style={shortcutStyle}>⌘2</span>
                  </div>

                  <div className="menu-item" style={{ fontWeight: activeTab === 'glyph-map' ? 600 : 400 }} onClick={() => { closeMenu(); onNavigate('glyph-map'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Grid3X3 size={13} />
                      <span>Glyph Map Grid</span>
                    </div>
                    <span style={shortcutStyle}>⌘3</span>
                  </div>

                  <div className="menu-item" style={{ fontWeight: activeTab === 'glyph-editor' ? 600 : 400 }} onClick={() => { closeMenu(); onNavigate('glyph-editor'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PenTool size={13} />
                      <span>Glyph Vector Editor</span>
                    </div>
                    <span style={shortcutStyle}>⌘4</span>
                  </div>

                  <div className="menu-item" style={{ fontWeight: activeTab === 'metrics' ? 600 : 400 }} onClick={() => { closeMenu(); onNavigate('metrics'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Ruler size={13} />
                      <span>Metrics & Word Spacing</span>
                    </div>
                    <span style={shortcutStyle}>⌘5</span>
                  </div>

                  <div className="menu-item" style={{ fontWeight: activeTab === 'kerning' ? 600 : 400 }} onClick={() => { closeMenu(); onNavigate('kerning'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MoveHorizontal size={13} />
                      <span>Kerning Pairs</span>
                    </div>
                    <span style={shortcutStyle}>⌘6</span>
                  </div>

                  <div className="menu-item" style={{ fontWeight: activeTab === 'preview' ? 600 : 400 }} onClick={() => { closeMenu(); onNavigate('preview'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Eye size={13} />
                      <span>Live Specimen & Waterfall</span>
                    </div>
                    <span style={shortcutStyle}>⌘7</span>
                  </div>
                </div>
              )}
            </div>

            {/* Submenu: Zoom & Viewport */}
            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu('view-zoom')}
              style={{
                position: 'relative',
                backgroundColor: activeSubMenu === 'view-zoom' ? 'var(--accent)' : undefined,
                color: activeSubMenu === 'view-zoom' ? '#ffffff' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Maximize2 size={13} style={{ color: activeSubMenu === 'view-zoom' ? '#ffffff' : '#38bdf8' }} />
                <span>Zoom & Viewport</span>
              </div>
              <ChevronRight size={12} style={{ color: activeSubMenu === 'view-zoom' ? '#ffffff' : 'var(--text-faint)' }} />

              {activeSubMenu === 'view-zoom' && (
                <div style={submenuDropdownStyle} onClick={(e) => e.stopPropagation()}>
                  <div className="menu-item" onClick={() => showScaffold('Zoom Controls', 'Use the canvas zoom slider (+/-) or mouse scroll-wheel inside any view.')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Maximize2 size={13} />
                      <span>Fit Design Space in Window</span>
                    </div>
                    <span style={shortcutStyle}>⌘0</span>
                  </div>

                  <div className="menu-item" onClick={() => showScaffold('Zoom In', 'Zoom in +20% on the active vector canvas.')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ZoomIn size={13} />
                      <span>Zoom In</span>
                    </div>
                    <span style={shortcutStyle}>⌘+</span>
                  </div>

                  <div className="menu-item" onClick={() => showScaffold('Zoom Out', 'Zoom out -20% on the active vector canvas.')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ZoomOut size={13} />
                      <span>Zoom Out</span>
                    </div>
                    <span style={shortcutStyle}>⌘-</span>
                  </div>
                </div>
              )}
            </div>

            {/* Submenu: Theme & Appearance */}
            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu('view-theme')}
              style={{
                position: 'relative',
                backgroundColor: activeSubMenu === 'view-theme' ? 'var(--accent)' : undefined,
                color: activeSubMenu === 'view-theme' ? '#ffffff' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Palette size={13} style={{ color: activeSubMenu === 'view-theme' ? '#ffffff' : '#ec4899' }} />
                <span>Theme & Appearance</span>
              </div>
              <ChevronRight size={12} style={{ color: activeSubMenu === 'view-theme' ? '#ffffff' : 'var(--text-faint)' }} />

              {activeSubMenu === 'view-theme' && (
                <div style={submenuDropdownStyle} onClick={(e) => e.stopPropagation()}>
                  <div className="menu-item" onClick={() => { closeMenu(); updateSettings({ theme: 'dark' }); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Moon size={13} style={{ color: '#6366f1' }} />
                      <span>Dark Mode (Standard)</span>
                    </div>
                    {settings.theme === 'dark' && <Check size={12} color="#6366f1" />}
                  </div>

                  <div className="menu-item" onClick={() => { closeMenu(); updateSettings({ theme: 'light' }); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sun size={13} style={{ color: '#4f46e5' }} />
                      <span>Light Mode</span>
                    </div>
                    {settings.theme === 'light' && <Check size={12} color="#4f46e5" />}
                  </div>

                  <div className="menu-item" onClick={() => { closeMenu(); updateSettings({ theme: 'hacker' }); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Terminal size={13} style={{ color: '#22c55e' }} />
                      <span>Hacker Mode (Green CRT)</span>
                    </div>
                    {settings.theme === 'hacker' && <Check size={12} color="#22c55e" />}
                  </div>

                  <div className="menu-item" onClick={() => { closeMenu(); updateSettings({ theme: 'candy' }); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={13} style={{ color: '#ec4899' }} />
                      <span>Candy Mode (Pink)</span>
                    </div>
                    {settings.theme === 'candy' && <Check size={12} color="#ec4899" />}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. ADDONS MENU                                            */}
      {/* ========================================================= */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setActiveMenu(activeMenu === 'addons' ? null : 'addons')}
          onMouseEnter={() => handleMenuHover('addons')}
          style={getMenuBtnStyle(activeMenu === 'addons')}
        >
          Addons
        </button>

        {activeMenu === 'addons' && (
          <div style={dropdownStyle}>
            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu(null)}
              onClick={() => { closeMenu(); setAddonManagerModalOpen?.(true); setIsAddonManagerOpen(true); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Puzzle size={13} style={{ color: 'var(--accent)' }} />
                <span>Extensions & Addons Manager...</span>
              </div>
              <span style={shortcutStyle}>⌘⇧X</span>
            </div>

            <div style={menuDividerStyle} />

            {/* Submenu: Installed Addons */}
            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu('addons-installed')}
              style={{
                position: 'relative',
                backgroundColor: activeSubMenu === 'addons-installed' ? 'var(--accent)' : undefined,
                color: activeSubMenu === 'addons-installed' ? '#ffffff' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={13} style={{ color: activeSubMenu === 'addons-installed' ? '#ffffff' : '#f59e0b' }} />
                <span>Active & Installed Studios</span>
              </div>
              <ChevronRight size={12} style={{ color: activeSubMenu === 'addons-installed' ? '#ffffff' : 'var(--text-faint)' }} />

              {activeSubMenu === 'addons-installed' && (
                <div style={submenuDropdownStyle} onClick={(e) => e.stopPropagation()}>
                  <div
                    className="menu-item"
                    onClick={() => {
                      closeMenu();
                      if (isAddonEnabled('comic-lettering')) {
                        onNavigate('comic-lettering');
                      } else {
                        setAddonManagerModalOpen?.(true);
                        setIsAddonManagerOpen(true);
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Zap size={13} style={{ color: '#f59e0b' }} />
                      <span>Comic Lettering & SFX Studio</span>
                    </div>
                    {isAddonEnabled('comic-lettering') ? (
                      <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 600 }}>Active</span>
                    ) : (
                      <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>Off</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Submenu: Addon Developer Tools */}
            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu('addons-dev')}
              style={{
                position: 'relative',
                backgroundColor: activeSubMenu === 'addons-dev' ? 'var(--accent)' : undefined,
                color: activeSubMenu === 'addons-dev' ? '#ffffff' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={13} style={{ color: activeSubMenu === 'addons-dev' ? '#ffffff' : 'var(--accent)' }} />
                <span>Developer & Extensibility</span>
              </div>
              <ChevronRight size={12} style={{ color: activeSubMenu === 'addons-dev' ? '#ffffff' : 'var(--text-faint)' }} />

              {activeSubMenu === 'addons-dev' && (
                <div style={submenuDropdownStyle} onClick={(e) => e.stopPropagation()}>
                  <div className="menu-item" onClick={() => showScaffold('Addon Developer Docs', 'Open the Extensibility Guide and API Documentation for writing custom addons in Local Font Studio.')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOpen size={13} style={{ color: 'var(--accent)' }} />
                      <span>Addon Architecture Guide...</span>
                    </div>
                  </div>

                  <div className="menu-item" onClick={() => showScaffold('Starter Manifest Generator', 'Download a validated starter addon-manifest.json schema to create a custom studio view or tool.')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileCode size={13} style={{ color: '#10b981' }} />
                      <span>Generate Starter Manifest...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 6. HELP MENU                                              */}
      {/* ========================================================= */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
          onMouseEnter={() => handleMenuHover('help')}
          style={getMenuBtnStyle(activeMenu === 'help')}
        >
          Help
        </button>

        {activeMenu === 'help' && (
          <div style={dropdownStyle}>
            {/* Submenu: Documentation & Guides */}
            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu('help-docs')}
              style={{
                position: 'relative',
                backgroundColor: activeSubMenu === 'help-docs' ? 'var(--accent)' : undefined,
                color: activeSubMenu === 'help-docs' ? '#ffffff' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={13} style={{ color: activeSubMenu === 'help-docs' ? '#ffffff' : 'var(--accent)' }} />
                <span>Documentation & Guides</span>
              </div>
              <ChevronRight size={12} style={{ color: activeSubMenu === 'help-docs' ? '#ffffff' : 'var(--text-faint)' }} />

              {activeSubMenu === 'help-docs' && (
                <div style={submenuDropdownStyle} onClick={(e) => e.stopPropagation()}>
                  <div className="menu-item" onClick={() => { closeMenu(); setHandbookModalOpen(true); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOpen size={13} style={{ color: 'var(--accent)' }} />
                      <span>Studio Handbook...</span>
                    </div>
                    <span style={shortcutStyle}>F1</span>
                  </div>

                  <div className="menu-item" onClick={() => { closeMenu(); setShortcutsModalOpen(true); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Keyboard size={13} style={{ color: 'var(--accent)' }} />
                      <span>Keyboard Shortcuts Guide</span>
                    </div>
                    <span style={shortcutStyle}>?</span>
                  </div>

                  <div className="menu-item" onClick={() => showScaffold('OpenType 1.9 Specifications', 'Local Font Studio compiles standard OpenType CFF (.otf) and TrueType (.ttf) files compliant with ISO/IEC 14496-22.')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <HelpCircle size={13} />
                      <span>Typography Reference</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submenu: Developer Studio & Diagnostics */}
            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu('help-dev')}
              style={{
                position: 'relative',
                backgroundColor: activeSubMenu === 'help-dev' ? 'var(--accent)' : undefined,
                color: activeSubMenu === 'help-dev' ? '#ffffff' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={13} style={{ color: activeSubMenu === 'help-dev' ? '#ffffff' : 'var(--accent)' }} />
                <span>Developer Studio & Diagnostics</span>
              </div>
              <ChevronRight size={12} style={{ color: activeSubMenu === 'help-dev' ? '#ffffff' : 'var(--text-faint)' }} />

              {activeSubMenu === 'help-dev' && (
                <div style={submenuDropdownStyle} onClick={(e) => e.stopPropagation()}>
                  <div className="menu-item" onClick={() => { closeMenu(); setDeveloperModalOpen(true); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Terminal size={13} style={{ color: 'var(--accent)' }} />
                      <span>Developer Dashboard...</span>
                    </div>
                    <span style={shortcutStyle}>⌘⌥D</span>
                  </div>

                  <div style={menuDividerStyle} />

                  <div className="menu-item" onClick={() => { closeMenu(); setDeveloperModalOpen(true); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={13} style={{ color: '#4ade80' }} />
                      <span>Recent Build: <strong style={{ color: '#4ade80', marginLeft: '4px' }}>{developerStatsData.buildDurationSeconds}s</strong></span>
                    </div>
                  </div>

                  <div className="menu-item" onClick={() => { closeMenu(); setDeveloperModalOpen(true); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={13} style={{ color: '#f87171' }} />
                      <span>TSX: <strong style={{ color: '#f87171', marginLeft: '4px' }}>{developerStatsData.redCount} &gt;1k LOC</strong></span>
                    </div>
                  </div>

                  <div style={menuDividerStyle} />

                  <div className="menu-item" onClick={() => { closeMenu(); setDeveloperModalOpen(true); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <HardDrive size={13} style={{ color: '#38bdf8' }} />
                      <span>Storage Diagnostics...</span>
                    </div>
                  </div>

                  <div className="menu-item" onClick={() => { closeMenu(); setDeveloperModalOpen(true); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Gauge size={13} style={{ color: '#a78bfa' }} />
                      <span>In-Browser Benchmarks...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={menuDividerStyle} />

            <div
              className="menu-item"
              onMouseEnter={() => setActiveSubMenu(null)}
              onClick={() => { closeMenu(); setAboutModalOpen(true); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={13} />
                <span>About Local Font Studio...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
