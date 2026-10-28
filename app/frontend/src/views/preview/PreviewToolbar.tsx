import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface PreviewToolbarProps {
  presets: Array<{ label: string; text: string }>;
  setSampleText: (text: string) => void;
  viewMode: 'custom' | 'waterfall' | 'roster';
  setViewMode: (mode: 'custom' | 'waterfall' | 'roster') => void;
  darkBg: boolean;
  setDarkBg: (dark: boolean) => void;
  globalTheme?: string;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  presets,
  setSampleText,
  viewMode,
  setViewMode,
  darkBg,
  setDarkBg,
  globalTheme = 'dark'
}) => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-sidebar)',
      borderBottom: '1px solid var(--border)',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      {/* Preset Selector Buttons */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: '4px' }}>
          Presets:
        </span>
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => setSampleText(p.text)}
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '4px 8px' }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* View Mode & Dark/Light Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-app)',
          borderRadius: '6px',
          border: '1px solid var(--border)',
          padding: '2px'
        }}>
          <button
            onClick={() => setViewMode('custom')}
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'custom' ? 'var(--accent)' : 'transparent',
              color: viewMode === 'custom' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            Paragraph
          </button>
          <button
            onClick={() => setViewMode('waterfall')}
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'waterfall' ? 'var(--accent)' : 'transparent',
              color: viewMode === 'waterfall' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            Waterfall
          </button>
          <button
            onClick={() => setViewMode('roster')}
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'roster' ? 'var(--accent)' : 'transparent',
              color: viewMode === 'roster' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            Roster
          </button>
        </div>

        <button
          onClick={() => setDarkBg(!darkBg)}
          className="btn-secondary"
          style={{ fontSize: '11px', padding: '5px 10px', gap: '5px' }}
          title={darkBg 
            ? `Preview: Dark Specimen (Global: ${globalTheme}). Click to switch Preview to Light paper & Global to Dark.` 
            : `Preview: Light Paper (Global: ${globalTheme}). Click to switch Preview to Dark specimen & Global to Light.`}
        >
          {darkBg ? <Sun size={13} style={{ color: '#f59e0b' }} /> : <Moon size={13} style={{ color: '#6366f1' }} />}
          <span>{darkBg ? 'Light Paper' : 'Dark Specimen'}</span>
        </button>
      </div>
    </div>
  );
};
