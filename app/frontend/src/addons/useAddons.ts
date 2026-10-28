import { useContext } from 'react';
import { AddonContext, AddonContextType } from './AddonContext';

export const useAddons = (): AddonContextType => {
  const ctx = useContext(AddonContext);
  if (!ctx) {
    throw new Error('useAddons must be used within an AddonProvider');
  }
  return ctx;
};
