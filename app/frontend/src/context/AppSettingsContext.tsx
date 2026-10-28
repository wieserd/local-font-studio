import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'dark' | 'light' | 'hacker' | 'candy';

export interface AppSettings {
  autoSaveEnabled: boolean;
  autoSaveIntervalSeconds: number; // 3, 5, 10, 30
  snapToGrid: boolean;
  gridResolution: number; // 10, 20, 50
  canvasContrast: 'default' | 'pitch-black';
  showGuidelinesByDefault: boolean;
  theme: AppTheme;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  autoSaveEnabled: true,
  autoSaveIntervalSeconds: 5,
  snapToGrid: true,
  gridResolution: 10,
  canvasContrast: 'default',
  showGuidelinesByDefault: true,
  theme: 'dark',
};

const STORAGE_KEY = 'local_font_studio_app_preferences';

interface AppSettingsContextType {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetSettings: () => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not load app settings from localStorage', e);
    }
    return DEFAULT_APP_SETTINGS;
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Sync active theme with document element
  useEffect(() => {
    const theme = settings.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, [settings.theme]);

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save app settings to localStorage', e);
      }
      return next;
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_APP_SETTINGS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_APP_SETTINGS));
    } catch (e) {
      console.warn('Could not reset app settings', e);
    }
  };

  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return ctx;
};
