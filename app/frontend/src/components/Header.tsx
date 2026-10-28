import React, { useState, useRef, useEffect } from 'react';
import { Download, Save, BookOpen, Terminal, Settings, Moon, Sun, Sparkles, Puzzle } from 'lucide-react';
import { useFont } from '../context/FontContext';
import { useAppSettings, AppTheme } from '../context/AppSettingsContext';
import { useAddons } from '../addons/AddonContext';
import { TabId } from './Tabs';
import { ActiveMenuId, ScaffoldModalState } from './header/headerTypes';
import { AppMenuBar } from './header/AppMenuBar';
import { StyleDropdown } from './header/StyleDropdown';
import { HeaderModals } from './header/HeaderModals';
import { StudioHandbookModal } from './handbook/StudioHandbookModal';
import { DeveloperModal } from './developer/DeveloperModal';
import { AppSettingsModal } from './settings/AppSettingsModal';
import { FontAuditModal } from './audit/FontAuditModal';
import { AddonManagerModal } from '../addons/AddonManagerModal';

interface HeaderProps {
  projectName: string;
  setProjectName: (name: string) => void;
  activeTab: TabId;
  onNavigate: (tab: TabId) => void;
  onExportClick: () => void;
  onPreviewClick: () => void;
  onFamilyStylesClick?: () => void;
  hasUnsavedChanges?: boolean;
  onSave?: () => void;
  onQuickExportOtf?: () => void;
  onQuickExportSvg?: () => void;
  onNewProject?: (name: string, designer: string) => void;
  selectedGlyphChar?: string;
}

export const Header: React.FC<HeaderProps> = ({
  projectName,
  setProjectName,
  activeTab,
  onNavigate,
  onExportClick,
  onFamilyStylesClick,
  hasUnsavedChanges = false,
  onSave,
  onQuickExportOtf,
  onQuickExportSvg,
  onNewProject,
  selectedGlyphChar = 'A',
}) => {
  const { stylesList, activeStyle, activeStyleId, switchStyle } = useFont();
  const { settings, updateSettings, isSettingsModalOpen, setIsSettingsModalOpen } = useAppSettings();
  const { setIsAddonManagerOpen } = useAddons();

  const getThemeIcon = (theme: AppTheme) => {
    switch (theme) {
      case 'light': return <Sun size={12} style={{ color: '#4f46e5' }} />;
      case 'hacker': return <Terminal size={12} style={{ color: '#22c55e' }} />;
      case 'candy': return <Sparkles size={12} style={{ color: '#ec4899' }} />;
      case 'dark':
      default:
        return <Moon size={12} style={{ color: '#6366f1' }} />;
    }
  };

  const [activeMenu, setActiveMenu] = useState<ActiveMenuId>(null);
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);

  // Auto-Save Effect: saves after idle interval if changes exist
  useEffect(() => {
    if (!hasUnsavedChanges || !settings.autoSaveEnabled || !onSave) {
      return;
    }

    const timer = setTimeout(() => {
      onSave();
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 3000);
    }, settings.autoSaveIntervalSeconds * 1000);

    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, settings.autoSaveEnabled, settings.autoSaveIntervalSeconds, onSave]);

  // Modals state
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [handbookModalOpen, setHandbookModalOpen] = useState(false);
  const [developerModalOpen, setDeveloperModalOpen] = useState(false);
  const [fontAuditModalOpen, setFontAuditModalOpen] = useState(false);
  const [addonManagerModalOpen, setAddonManagerModalOpen] = useState(false);
  const [scaffoldModal, setScaffoldModal] = useState<ScaffoldModalState | null>(null);

  // New Project form fields
  const [newProjectName, setNewProjectName] = useState('New Custom Sans');
  const [newProjectDesigner, setNewProjectDesigner] = useState('Type Designer');

  const menuContainerRef = useRef<HTMLDivElement>(null);
  const styleDropdownRef = useRef<HTMLDivElement>(null);

  // Global Cmd+S / Ctrl+S shortcut to save and F1 for handbook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave?.();
        setAutoSaved(false);
      } else if (e.key === 'F1') {
        e.preventDefault();
        setHandbookModalOpen(open => !open);
      } else if ((e.metaKey || e.ctrlKey) && (e.key === ',' || ((e.altKey || e.shiftKey) && e.key.toLowerCase() === 'p'))) {
        e.preventDefault();
        setIsSettingsModalOpen(open => !open);
      } else if ((e.metaKey || e.ctrlKey) && (e.altKey || e.shiftKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setDeveloperModalOpen(open => !open);
      } else if ((e.metaKey || e.ctrlKey) && (e.altKey || e.shiftKey) && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        setAddonManagerModalOpen(open => !open);
      } else if (e.key === 'Escape') {
        setActiveMenu(null);
        setStyleDropdownOpen(false);
        setNewProjectModalOpen(false);
        setShortcutsModalOpen(false);
        setAboutModalOpen(false);
        setHandbookModalOpen(false);
        setDeveloperModalOpen(false);
        setIsSettingsModalOpen(false);
        setAddonManagerModalOpen(false);
        setIsAddonManagerOpen(false);
        setScaffoldModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
      if (styleDropdownRef.current && !styleDropdownRef.current.contains(e.target as Node)) {
        setStyleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMenu = () => setActiveMenu(null);

  const handleMenuHover = (menuId: ActiveMenuId) => {
    if (activeMenu !== null && activeMenu !== menuId) {
      setActiveMenu(menuId);
    }
  };

  const showScaffold = (title: string, description: string, phase: string = 'Phase 2 / Phase 3 Planned') => {
    closeMenu();
    setScaffoldModal({
      isOpen: true,
      title,
      description,
      phase,
    });
  };

  const handleCreateNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (onNewProject) {
      onNewProject(newProjectName.trim() || 'Untitled Typeface', newProjectDesigner.trim() || 'Anonymous');
    }
    setNewProjectModalOpen(false);
    onNavigate('family-styles');
  };

  return (
    <>
      <header
        style={{
          height: '42px',
          backgroundColor: '#0c0f17',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          zIndex: 50,
          userSelect: 'none',
        }}
      >
        {/* LEFT SECTION: Desktop Application Menu Bar */}
        <AppMenuBar
          menuContainerRef={menuContainerRef}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          handleMenuHover={handleMenuHover}
          closeMenu={closeMenu}
          showScaffold={showScaffold}
          setAboutModalOpen={setAboutModalOpen}
          setNewProjectModalOpen={setNewProjectModalOpen}
          setShortcutsModalOpen={setShortcutsModalOpen}
          setHandbookModalOpen={setHandbookModalOpen}
          setDeveloperModalOpen={setDeveloperModalOpen}
          setFontAuditModalOpen={setFontAuditModalOpen}
          setAddonManagerModalOpen={setAddonManagerModalOpen}
          onSave={onSave}
          onNavigate={onNavigate}
          onQuickExportOtf={onQuickExportOtf}
          onQuickExportSvg={onQuickExportSvg}
          activeTab={activeTab}
          selectedGlyphChar={selectedGlyphChar}
          stylesList={stylesList}
          activeStyleId={activeStyleId}
          switchStyle={switchStyle}
        />

        {/* CENTER SECTION: Family Name & Active Style Quick Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: 'var(--text-faint)', fontSize: '11px' }}>Family:</span>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={{
                fontWeight: 600,
                fontSize: '12px',
                width: '135px',
                padding: '2px 6px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-main)',
              }}
            />
          </div>

          {/* Quick Style Switcher Dropdown */}
          <StyleDropdown
            styleDropdownRef={styleDropdownRef}
            styleDropdownOpen={styleDropdownOpen}
            setStyleDropdownOpen={setStyleDropdownOpen}
            activeStyle={activeStyle}
            activeStyleId={activeStyleId}
            stylesList={stylesList}
            switchStyle={switchStyle}
            onFamilyStylesClick={onFamilyStylesClick}
          />
        </div>

        {/* RIGHT SECTION: Save Status & Theme Switcher (Ultra Clean & Minimal) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: hasUnsavedChanges ? '#f59e0b' : '#10b981',
              display: 'inline-block',
              boxShadow: hasUnsavedChanges ? '0 0 6px rgba(245, 158, 11, 0.6)' : '0 0 6px rgba(16, 185, 129, 0.6)'
            }} />
            <span style={{
              fontSize: '11px',
              fontWeight: 500,
              color: hasUnsavedChanges ? '#fbbf24' : '#6ee7b7'
            }}>
              {hasUnsavedChanges
                ? (settings.autoSaveEnabled ? `Unsaved (${settings.autoSaveIntervalSeconds}s)` : 'Unsaved')
                : (autoSaved ? 'Autosaved' : 'Saved')}
            </span>

            {onSave && hasUnsavedChanges && (
              <button
                className="btn-primary"
                onClick={() => {
                  onSave();
                  setAutoSaved(false);
                }}
                title="Save Font Project (Cmd+S / Ctrl+S)"
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  height: '24px',
                  gap: '4px',
                }}
              >
                <Save size={11} />
                <span>Save</span>
              </button>
            )}
          </div>

          {/* Theme Quick Toggle (Icon Only) */}
          <button
            className="btn-ghost"
            onClick={() => {
              const order: AppTheme[] = ['dark', 'light', 'hacker', 'candy'];
              const current = settings.theme || 'dark';
              const nextTheme = order[(order.indexOf(current) + 1) % order.length];
              updateSettings({ theme: nextTheme });
            }}
            style={{ fontSize: '11px', padding: '3px 8px', height: '24px', gap: '5px' }}
            title={`Active Theme: ${settings.theme || 'dark'} (Click to cycle themes)`}
          >
            {getThemeIcon(settings.theme || 'dark')}
            <span style={{ textTransform: 'capitalize' }}>{settings.theme || 'dark'}</span>
          </button>
        </div>
      </header>

      {/* MODALS */}
      <HeaderModals
        newProjectModalOpen={newProjectModalOpen}
        setNewProjectModalOpen={setNewProjectModalOpen}
        newProjectName={newProjectName}
        setNewProjectName={setNewProjectName}
        newProjectDesigner={newProjectDesigner}
        setNewProjectDesigner={setNewProjectDesigner}
        handleCreateNewProject={handleCreateNewProject}
        shortcutsModalOpen={shortcutsModalOpen}
        setShortcutsModalOpen={setShortcutsModalOpen}
        aboutModalOpen={aboutModalOpen}
        setAboutModalOpen={setAboutModalOpen}
        scaffoldModal={scaffoldModal}
        setScaffoldModal={setScaffoldModal}
      />

      {/* Studio Handbook Interactive Modal */}
      <StudioHandbookModal
        isOpen={handbookModalOpen}
        onClose={() => setHandbookModalOpen(false)}
        onNavigateToTab={onNavigate}
      />

      {/* Developer Studio Telemetry & Code Health Modal */}
      <DeveloperModal
        isOpen={developerModalOpen}
        onClose={() => setDeveloperModalOpen(false)}
      />

      {/* Application Preferences Modal (Auto-save, Canvas, Theme) */}
      <AppSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* FontAudit Pre-Flight Geometric Validation Modal */}
      <FontAuditModal
        isOpen={fontAuditModalOpen}
        onClose={() => setFontAuditModalOpen(false)}
        onNavigateToGlyph={() => onNavigate('glyph-editor')}
      />

      {/* Extensions & Addons Studio Modal */}
      <AddonManagerModal
        isOpen={addonManagerModalOpen}
        onClose={() => setAddonManagerModalOpen(false)}
      />
    </>
  );
};
