import React from 'react';
import { 
  X, 
  Settings, 
  Clock, 
  Grid, 
  RefreshCw, 
  Check, 
  ShieldCheck,
  Moon,
  Sun,
  Terminal,
  Sparkles,
  Palette
} from 'lucide-react';
import { useAppSettings, AppTheme } from '../../context/AppSettingsContext';

interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ThemeOption {
  id: AppTheme;
  title: string;
  tagline: string;
  icon: React.ReactNode;
  accent: string;
  bgPreview: string;
  textColor: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'dark',
    title: 'Dark Mode',
    tagline: 'Standard Studio',
    icon: <Moon size={16} />,
    accent: '#6366f1',
    bgPreview: '#0e1117',
    textColor: '#f1f5f9',
  },
  {
    id: 'light',
    title: 'Light Mode',
    tagline: 'Daylight Paper',
    icon: <Sun size={16} />,
    accent: '#4f46e5',
    bgPreview: '#f8fafc',
    textColor: '#0f172a',
  },
  {
    id: 'hacker',
    title: 'Hacker Mode',
    tagline: 'Terminal CRT Green',
    icon: <Terminal size={16} />,
    accent: '#22c55e',
    bgPreview: '#020904',
    textColor: '#4ade80',
  },
  {
    id: 'candy',
    title: 'Candy Mode',
    tagline: 'Pink Bubblegum',
    icon: <Sparkles size={16} />,
    accent: '#ec4899',
    bgPreview: '#200619',
    textColor: '#fdf2f8',
  },
];

export const AppSettingsModal: React.FC<AppSettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetSettings } = useAppSettings();

  if (!isOpen) return null;

  const currentTheme = settings.theme || 'dark';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.72)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-app)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        width: '600px',
        maxWidth: '94vw',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border)'
            }}>
              <Settings size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  Application Preferences
                </h3>
                <span className="badge" style={{ fontSize: '10px', padding: '1px 6px', background: 'var(--accent-light)', color: 'var(--accent)' }}>
                  App Settings
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Studio environment, theme customization, and auto-save timers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ width: '28px', height: '28px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Body content */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* SECTION 1: THEME SELECTOR (NEW!) */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Palette size={16} color="var(--accent)" />
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                    Interface Theme & Styling
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Select your studio mood: standard dark, daylight, terminal hacker, or candy pink
                  </p>
                </div>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
                Active: <strong style={{ color: 'var(--accent)', textTransform: 'capitalize' }}>{currentTheme}</strong>
              </span>
            </div>

            {/* 4-way Theme Selector Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '4px' }}>
              {THEME_OPTIONS.map((t) => {
                const isSelected = currentTheme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => updateSettings({ theme: t.id })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: isSelected ? `2px solid ${t.accent}` : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'var(--bg-surface)' : 'var(--bg-input)',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? `0 0 12px ${t.accent}33` : 'none',
                    }}
                  >
                    {/* Theme Icon Badge */}
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: t.bgPreview,
                      border: `1px solid ${t.accent}`,
                      color: t.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {t.icon}
                    </div>

                    {/* Theme Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ 
                          fontSize: '12px', 
                          fontWeight: isSelected ? 700 : 600,
                          color: isSelected ? t.accent : 'var(--text-main)' 
                        }}>
                          {t.title}
                        </span>
                        {isSelected && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            backgroundColor: t.accent,
                            color: '#fff',
                            fontSize: '9px'
                          }}>
                            <Check size={10} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
                        {t.tagline}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: AUTO-SAVE SETTINGS */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="var(--accent)" />
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                    Automatic Background Saving
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Saves changes to browser storage automatically after you pause editing
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.autoSaveEnabled}
                  onChange={(e) => updateSettings({ autoSaveEnabled: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: settings.autoSaveEnabled ? 'var(--accent)' : 'var(--border)',
                  borderRadius: '22px',
                  transition: 'background-color 0.2s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '16px',
                    width: '16px',
                    left: settings.autoSaveEnabled ? '20px' : '3px',
                    bottom: '3px',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    transition: 'left 0.2s'
                  }} />
                </span>
              </label>
            </div>

            {settings.autoSaveEnabled && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  Auto-Save Delay (Idle Interval)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {[
                    { label: '3 seconds', val: 3 },
                    { label: '5s (Recommended)', val: 5 },
                    { label: '10 seconds', val: 10 },
                    { label: '30 seconds', val: 30 }
                  ].map((opt) => {
                    const isSelected = settings.autoSaveIntervalSeconds === opt.val;
                    return (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => updateSettings({ autoSaveIntervalSeconds: opt.val })}
                        style={{
                          padding: '6px 4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                          backgroundColor: isSelected ? 'var(--accent)' : 'var(--bg-input)',
                          color: isSelected ? '#fff' : 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: 'var(--success)', fontSize: '11px' }}>
                  <ShieldCheck size={13} />
                  <span>Shows "Autosaved" next to the top Save button upon successful commit</span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: VECTOR CANVAS & DRAFTING */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Grid size={16} color="var(--accent)" />
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  Canvas & Drafting Precision
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Grid snapping, metrics guidelines, and display resolution
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
              {/* Snap to grid */}
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  Snap to Grid
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => updateSettings({ snapToGrid: true })}
                    className={settings.snapToGrid ? 'btn-primary' : 'btn-secondary'}
                    style={{ flex: 1, padding: '5px', fontSize: '11px' }}
                  >
                    Enabled
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings({ snapToGrid: false })}
                    className={!settings.snapToGrid ? 'btn-primary' : 'btn-secondary'}
                    style={{ flex: 1, padding: '5px', fontSize: '11px' }}
                  >
                    Freeform
                  </button>
                </div>
              </div>

              {/* Grid resolution */}
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  Grid Resolution
                </label>
                <select
                  value={settings.gridResolution}
                  onChange={(e) => updateSettings({ gridResolution: Number(e.target.value) })}
                  style={{ width: '100%', fontSize: '12px', padding: '5px 8px' }}
                >
                  <option value={5}>5 units (Fine precision)</option>
                  <option value={10}>10 units (Standard default)</option>
                  <option value={25}>25 units (Coarse)</option>
                  <option value={50}>50 units (Blocky / Modular)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: STORAGE & PREFERENCES RESET */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>
                Reset Studio Preferences
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Restores theme, auto-save, and canvas defaults (font project data is never touched)
              </span>
            </div>
            <button
              type="button"
              onClick={resetSettings}
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '4px 10px', gap: '4px' }}
            >
              <RefreshCw size={12} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: 'var(--bg-card)'
        }}>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '6px 20px', fontSize: '12px', gap: '6px' }}
          >
            <Check size={14} />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
