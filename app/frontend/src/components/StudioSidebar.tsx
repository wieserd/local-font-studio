import React, { useState } from 'react';
import { 
  Grid3X3, 
  Upload, 
  PenTool, 
  Ruler, 
  MoveHorizontal, 
  Eye, 
  SlidersHorizontal, 
  Download, 
  Layers,
  Zap,
  Puzzle
} from 'lucide-react';
import { useAddons } from '../addons/useAddons';

export type TabId = 
  | 'family-styles'
  | 'import' 
  | 'glyph-map' 
  | 'glyph-editor' 
  | 'metrics' 
  | 'kerning' 
  | 'comic-lettering'
  | 'addons'
  | 'preview' 
  | 'settings' 
  | 'export'
  | (string & {});

interface StudioSidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  assignedCount: number;
  totalCount: number;
  activeGlyph: string;
  stylesCount?: number;
  activeStyleName?: string;
}

interface SidebarItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  badge?: string;
  hasDotIndicator?: boolean;
  dotColor?: string;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  activeTab,
  onTabChange,
  assignedCount,
  totalCount,
  activeGlyph,
  stylesCount = 1,
  activeStyleName = 'Regular',
}) => {
  const { addons, isAddonEnabled } = useAddons();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Group 1: Creation & Vector Geometry
  const creationGroup: SidebarItem[] = [
    { 
      id: 'family-styles', 
      label: 'Family & Styles', 
      icon: <Layers size={17} />,
      shortcut: '⌘1',
      badge: `${stylesCount} style${stylesCount > 1 ? 's' : ''}`
    },
    { 
      id: 'import', 
      label: 'Import Artwork', 
      icon: <Upload size={17} />,
      shortcut: '⌘2'
    },
    { 
      id: 'glyph-map', 
      label: 'Glyph Map Grid', 
      icon: <Grid3X3 size={17} />,
      shortcut: '⌘3',
      badge: `${assignedCount}/${totalCount}`,
      hasDotIndicator: assignedCount > 0,
      dotColor: '#10b981'
    },
    { 
      id: 'glyph-editor', 
      label: `Glyph Editor (${activeGlyph === ' ' ? '␣ Space' : activeGlyph})`, 
      icon: <PenTool size={17} />,
      shortcut: '⌘4'
    },
  ];

  // Group 2: Typography, Spacing & Kerning
  const spacingGroup: SidebarItem[] = [
    { 
      id: 'metrics', 
      label: 'Font Metrics & Sidebearings', 
      icon: <Ruler size={17} />,
      shortcut: '⌘5'
    },
    { 
      id: 'kerning', 
      label: 'GPOS Pair Kerning Matrix', 
      icon: <MoveHorizontal size={17} />,
      shortcut: '⌘6'
    },
  ];

  // Group 3: Active Workspace Extensions (only shown when an extension is active)
  const addonsGroup: SidebarItem[] = [];

  if (isAddonEnabled('comic-lettering')) {
    addonsGroup.push({
      id: 'comic-lettering',
      label: 'Comic Lettering & SFX Studio',
      icon: <Zap size={17} style={{ color: '#f59e0b' }} />,
      shortcut: '⌘9',
      badge: 'COMIC',
      hasDotIndicator: true,
      dotColor: '#f59e0b'
    });
  }

  // Inject any enabled custom addons with tabs
  const customTabAddons = addons.filter(a => a.hasTab && a.id !== 'comic-lettering' && isAddonEnabled(a.id));
  customTabAddons.forEach(addon => {
    addonsGroup.push({
      id: addon.tabId || addon.id,
      label: addon.tabLabel || addon.name,
      icon: <Puzzle size={17} style={{ color: 'var(--accent)' }} />,
      badge: addon.tabBadge || 'CUSTOM',
      hasDotIndicator: true,
      dotColor: '#38bdf8'
    });
  });

  // Group 4: Distribution & Output (bottom)
  const outputGroup: SidebarItem[] = [
    { 
      id: 'preview', 
      label: 'Live Typeset Preview', 
      icon: <Eye size={17} />,
      shortcut: '⌘7'
    },
    { 
      id: 'settings', 
      label: 'Font Metadata & OS/2', 
      icon: <SlidersHorizontal size={17} />,
      shortcut: '⌘8'
    },
    { 
      id: 'export', 
      label: 'Compile & Export Font', 
      icon: <Download size={17} />,
      shortcut: '⌘E',
      hasDotIndicator: true,
      dotColor: '#6366f1'
    },
  ];

  const renderItem = (item: SidebarItem) => {
    const isActive = activeTab === item.id;
    const isHovered = hoveredId === item.id;

    const tooltipText = `${item.label}${item.shortcut ? ` (${item.shortcut})` : ''}${item.badge ? ` • ${item.badge}` : ''}`;

    return (
      <div
        key={item.id}
        style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
      >
        <button
          onClick={() => onTabChange(item.id)}
          onMouseEnter={() => setHoveredId(item.id)}
          onMouseLeave={() => setHoveredId(null)}
          title={tooltipText}
          aria-label={item.label}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isActive 
              ? 'var(--accent)' 
              : isHovered 
                ? 'var(--bg-surface)' 
                : 'transparent',
            color: isActive 
              ? '#ffffff' 
              : isHovered 
                ? 'var(--text-main)' 
                : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.15s ease',
            boxShadow: isActive ? '0 2px 8px rgba(99, 102, 241, 0.35)' : 'none',
            outline: 'none',
            padding: 0
          }}
        >
          {item.icon}

          {/* Active Accent Left Bar */}
          {isActive && (
            <div
              style={{
                position: 'absolute',
                left: '-6px',
                top: '6px',
                bottom: '6px',
                width: '3px',
                borderRadius: '0 2px 2px 0',
                backgroundColor: '#ffffff'
              }}
            />
          )}

          {/* Micro status dot indicator */}
          {item.hasDotIndicator && !isActive && (
            <span
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: item.dotColor || 'var(--accent)'
              }}
            />
          )}
        </button>

        {/* Custom Rich Floating Tooltip on Hover */}
        {isHovered && (
          <div
            style={{
              position: 'absolute',
              left: '46px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: '#131722',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'var(--text-main)',
              fontSize: '11px',
              fontWeight: 500,
              padding: '5px 10px',
              borderRadius: '6px',
              whiteSpace: 'nowrap',
              zIndex: 9999,
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.6)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>{item.label}</span>
            {item.badge && (
              <span
                style={{
                  fontSize: '9.5px',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--accent)',
                  fontWeight: 600
                }}
              >
                {item.badge}
              </span>
            )}
            {item.shortcut && (
              <kbd
                style={{
                  fontSize: '9px',
                  fontFamily: 'monospace',
                  padding: '1px 4px',
                  borderRadius: '3px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-faint)',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}
              >
                {item.shortcut}
              </kbd>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderDivider = (key: string) => (
    <div
      key={key}
      style={{
        width: '24px',
        height: '1px',
        backgroundColor: 'var(--border)',
        margin: '6px 0',
        opacity: 0.7
      }}
    />
  );

  return (
    <aside
      aria-label="Studio Workspace Toolbar"
      style={{
        width: '48px',
        height: '100%',
        backgroundColor: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        flexShrink: 0,
        zIndex: 20,
        userSelect: 'none'
      }}
    >
      {/* Top and Middle Toolbars Container */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
        {/* Group 1: Creation & Geometry */}
        {creationGroup.map(renderItem)}

        {renderDivider('div-1')}

        {/* Group 2: Typography & Spacing */}
        {spacingGroup.map(renderItem)}

        {/* Group 3: Active Workspace Extensions (only shown if extension tabs are active) */}
        {addonsGroup.length > 0 && (
          <>
            {renderDivider('div-2')}
            {addonsGroup.map(renderItem)}
          </>
        )}
      </div>

      {/* Bottom Toolbar: Distribution & Preview */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
        {renderDivider('div-3')}
        {outputGroup.map(renderItem)}
      </div>
    </aside>
  );
};

// Backwards compatibility re-export
export { StudioSidebar as Tabs };
