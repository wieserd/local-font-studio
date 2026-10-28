import React, { useState, useEffect } from 'react';
import { FontProvider, useFont } from './context/FontContext';
import { AppSettingsProvider } from './context/AppSettingsContext';
import { Header } from './components/Header';
import { StudioSidebar, TabId } from './components/StudioSidebar';
import { GlyphMapView } from './views/GlyphMapView';
import { GlyphEditorView } from './views/GlyphEditorView';
import { ImportView } from './views/ImportView';
import { MetricsView } from './views/MetricsView';
import { KerningView } from './views/KerningView';
import { PreviewView } from './views/PreviewView';
import { FontSettingsView } from './views/FontSettingsView';
import { ExportView } from './views/ExportView';
import { FamilyStylesView } from './views/FamilyStylesView';
import { AddonProvider, useAddons } from './addons/AddonContext';
import { AddonManagerModal } from './addons/AddonManagerModal';
import { AddonStudioView } from './addons/AddonStudioView';
import { ComicLetteringView } from './addons/comic/ComicLetteringView';
import { CustomAddonHostView } from './addons/CustomAddonHostView';
import { buildAndDownloadFont } from './utils/fontExporter';
import { exportGlyphsAsSvgZip } from './utils/svgExporter';

function FontStudioInner() {
  const [activeTab, setActiveTab] = useState<TabId>('family-styles');
  const { addons } = useAddons();
  const { 
    project, 
    stylesList,
    activeStyle,
    activeStyleId,
    switchStyle,
    setProjectName, 
    selectedGlyphChar, 
    setSelectedGlyphChar,
    assignedCount,
    totalCount,
    hasUnsavedChanges,
    saveProject,
    createNewProject
  } = useFont();

  const handleSelectGlyph = (char: string) => {
    setSelectedGlyphChar(char);
    setActiveTab('glyph-editor');
  };

  const handleReplaceGlyphFromEditor = (char: string) => {
    setSelectedGlyphChar(char);
    setActiveTab('import');
  };

  const handleQuickExportOtf = () => {
    const sFamily = (project.name || 'My-Typeface').replace(/[^a-zA-Z0-9_-]/g, '-');
    const sStyle = (activeStyle.name || 'Regular').replace(/[^a-zA-Z0-9_-]/g, '-');
    buildAndDownloadFont(project, {
      format: 'otf',
      includeKerning: true,
      includeLigatures: true,
      runValidation: true,
      filename: `${sFamily}-${sStyle}.otf`,
    });
  };

  const handleQuickExportSvg = async () => {
    const sFamily = (project.name || 'My-Typeface').replace(/[^a-zA-Z0-9_-]/g, '-');
    const sStyle = (activeStyle.name || 'Regular').replace(/[^a-zA-Z0-9_-]/g, '-');
    await exportGlyphsAsSvgZip(project, `${sFamily}-${sStyle}-svg.zip`);
  };

  // Keyboard navigation shortcuts (⌘1..⌘8, ⌘E, ⌘I)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      if (isInput) return;

      if (e.metaKey || e.ctrlKey) {
        if (e.key === '1') { e.preventDefault(); setActiveTab('family-styles'); }
        else if (e.key === '2') { e.preventDefault(); setActiveTab('import'); }
        else if (e.key === '3') { e.preventDefault(); setActiveTab('glyph-map'); }
        else if (e.key === '4') { e.preventDefault(); setActiveTab('glyph-editor'); }
        else if (e.key === '5') { e.preventDefault(); setActiveTab('metrics'); }
        else if (e.key === '6') { e.preventDefault(); setActiveTab('kerning'); }
        else if (e.key === '7') { e.preventDefault(); setActiveTab('preview'); }
        else if (e.key === '8') { e.preventDefault(); setActiveTab('settings'); }
        else if (e.key === '9') { e.preventDefault(); setActiveTab('comic-lettering'); }
        else if (e.key === '0') { e.preventDefault(); setActiveTab('addons'); }
        else if (e.key.toLowerCase() === 'e') { e.preventDefault(); setActiveTab('export'); }
        else if (e.key.toLowerCase() === 'i') { e.preventDefault(); setActiveTab('import'); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* 1. Unified Desktop Menu Bar & Studio Header */}
      <Header
        projectName={project.name}
        setProjectName={setProjectName}
        activeTab={activeTab}
        onNavigate={setActiveTab}
        onExportClick={() => setActiveTab('export')}
        onPreviewClick={() => setActiveTab('preview')}
        onFamilyStylesClick={() => setActiveTab('family-styles')}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={saveProject}
        onQuickExportOtf={handleQuickExportOtf}
        onQuickExportSvg={handleQuickExportSvg}
        onNewProject={(name, designer) => createNewProject(name, designer)}
        selectedGlyphChar={selectedGlyphChar}
      />

      {/* 2. Main Studio Workspace Layout (Left Navigation Toolbar + Viewport Area) */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Permanent Left Studio Toolbar (Icons Only) */}
        <StudioSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          assignedCount={assignedCount}
          totalCount={totalCount}
          activeGlyph={selectedGlyphChar}
          stylesCount={stylesList.length}
          activeStyleName={activeStyle.name}
        />

        {/* Dynamic Main Workspace Content Area */}
        <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {activeTab === 'family-styles' && (
            <FamilyStylesView onNavigateToGlyphs={() => setActiveTab('glyph-map')} />
          )}
          {activeTab === 'import' && (
            <ImportView 
              initialTargetChar={selectedGlyphChar}
              onImportComplete={() => setActiveTab('glyph-map')} 
            />
          )}
          {activeTab === 'glyph-map' && (
            <GlyphMapView onSelectGlyph={handleSelectGlyph} selectedGlyph={selectedGlyphChar} />
          )}
          {activeTab === 'glyph-editor' && (
            <GlyphEditorView 
              glyphChar={selectedGlyphChar} 
              onReplaceGlyph={handleReplaceGlyphFromEditor}
            />
          )}
          {activeTab === 'metrics' && <MetricsView />}
          {activeTab === 'kerning' && <KerningView />}
          {activeTab === 'comic-lettering' && <ComicLetteringView />}
          {activeTab === 'addons' && <AddonStudioView />}
          {(() => {
            const customAddon = addons.find(a => (a.tabId || a.id) === activeTab && a.id !== 'comic-lettering');
            return customAddon ? <CustomAddonHostView addon={customAddon} /> : null;
          })()}
          {activeTab === 'preview' && <PreviewView onSelectGlyph={handleSelectGlyph} />}
          {activeTab === 'settings' && <FontSettingsView />}
          {activeTab === 'export' && <ExportView />}
        </main>
      </div>

      {/* Global Extensions & Addons Modal */}
      <AddonManagerModal />
    </div>
  );
}

export function App() {
  return (
    <AppSettingsProvider>
      <AddonProvider>
        <FontProvider>
          <FontStudioInner />
        </FontProvider>
      </AddonProvider>
    </AppSettingsProvider>
  );
}

export default App;
