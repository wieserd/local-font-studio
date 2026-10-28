import React from 'react';
import { useAddons } from './useAddons';
import { AddonManagerContent } from './AddonManagerContent';

interface AddonManagerModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AddonManagerModal: React.FC<AddonManagerModalProps> = ({
  isOpen: propsIsOpen,
  onClose: propsOnClose
}) => {
  const { isAddonManagerOpen: contextIsOpen, setIsAddonManagerOpen } = useAddons();

  const isOpen = propsIsOpen !== undefined ? propsIsOpen : contextIsOpen;

  const handleClose = () => {
    propsOnClose?.();
    setIsAddonManagerOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        style={{
          width: '840px',
          maxWidth: '96vw',
          maxHeight: '92vh',
          height: '680px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <AddonManagerContent isModal={true} onClose={handleClose} />
      </div>
    </div>
  );
};
