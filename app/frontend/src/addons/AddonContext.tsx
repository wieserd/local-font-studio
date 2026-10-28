import React, { createContext, useContext, useState, useEffect } from 'react';
import type { StudioAddon } from './types';
import { validateAddonManifest } from './types';
import { AVAILABLE_ADDONS } from './registry';

interface InstallResult {
  success: boolean;
  error?: string;
  addon?: StudioAddon;
}

export interface AddonContextType {
  addons: StudioAddon[];
  customAddons: StudioAddon[];
  enabledAddonIds: Record<string, boolean>;
  isAddonEnabled: (id: string) => boolean;
  toggleAddon: (id: string) => void;
  setAddonEnabled: (id: string, enabled: boolean) => void;
  installCustomAddon: (manifestInput: unknown) => InstallResult;
  uninstallCustomAddon: (id: string) => void;
  isAddonManagerOpen: boolean;
  setIsAddonManagerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const STORAGE_KEY = 'local-font-studio-addons';
const STORAGE_CUSTOM_KEY = 'local-font-studio-custom-addons';

export const AddonContext = createContext<AddonContextType | undefined>(undefined);

export const AddonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Custom installed addons state
  const [customAddons, setCustomAddons] = useState<StudioAddon[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOM_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback
    }
    return [];
  });

  // 2. Enabled addon IDs state
  const [enabledAddonIds, setEnabledAddonIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }

    // Default states from official registry
    const defaults: Record<string, boolean> = {};
    AVAILABLE_ADDONS.forEach(a => {
      defaults[a.id] = a.defaultEnabled;
    });
    return defaults;
  });

  const [isAddonManagerOpen, setIsAddonManagerOpen] = useState(false);

  // Sync enabled IDs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enabledAddonIds));
    } catch {
      // Ignore
    }
  }, [enabledAddonIds]);

  // Sync custom addons to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(customAddons));
    } catch {
      // Ignore
    }
  }, [customAddons]);

  // Combined addons list: Official addons + user-installed custom addons
  const allAddons: StudioAddon[] = [
    ...AVAILABLE_ADDONS,
    ...customAddons
  ];

  const isAddonEnabled = (id: string): boolean => {
    return Boolean(enabledAddonIds[id]);
  };

  const toggleAddon = (id: string) => {
    setEnabledAddonIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const setAddonEnabled = (id: string, enabled: boolean) => {
    setEnabledAddonIds(prev => ({
      ...prev,
      [id]: enabled
    }));
  };

  const installCustomAddon = (manifestInput: unknown): InstallResult => {
    let manifestObj = manifestInput;
    if (typeof manifestInput === 'string') {
      try {
        manifestObj = JSON.parse(manifestInput);
      } catch (err) {
        return {
          success: false,
          error: `Invalid JSON syntax: ${(err as Error).message}`
        };
      }
    }

    const validation = validateAddonManifest(manifestObj);
    if (!validation.valid || !validation.addon) {
      return {
        success: false,
        error: validation.errors.join(' ')
      };
    }

    const newAddon = validation.addon;

    // Check collision with official or existing custom addon
    const existingOfficial = AVAILABLE_ADDONS.find(a => a.id === newAddon.id);
    if (existingOfficial) {
      return {
        success: false,
        error: `Cannot overwrite official studio addon with ID "${newAddon.id}". Please use a different ID.`
      };
    }

    setCustomAddons(prev => {
      // If updating existing custom addon with same id, replace it
      const filtered = prev.filter(a => a.id !== newAddon.id);
      return [...filtered, newAddon];
    });

    // Automatically enable newly installed addon
    setEnabledAddonIds(prev => ({
      ...prev,
      [newAddon.id]: true
    }));

    return {
      success: true,
      addon: newAddon
    };
  };

  const uninstallCustomAddon = (id: string) => {
    setCustomAddons(prev => prev.filter(a => a.id !== id));
    setEnabledAddonIds(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  return (
    <AddonContext.Provider
      value={{
        addons: allAddons,
        customAddons,
        enabledAddonIds,
        isAddonEnabled,
        toggleAddon,
        setAddonEnabled,
        installCustomAddon,
        uninstallCustomAddon,
        isAddonManagerOpen,
        setIsAddonManagerOpen
      }}
    >
      {children}
    </AddonContext.Provider>
  );
};

export const useAddons = (): AddonContextType => {
  const ctx = useContext(AddonContext);
  if (!ctx) {
    throw new Error('useAddons must be used within an AddonProvider');
  }
  return ctx;
};
