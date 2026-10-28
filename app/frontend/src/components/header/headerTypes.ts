import React from 'react';

export type ActiveMenuId = 'file' | 'edit' | 'font' | 'view' | 'addons' | 'help' | null;

export interface ScaffoldModalState {
  isOpen: boolean;
  title: string;
  description: string;
  phase: string;
}

export const getMenuBtnStyle = (isActive: boolean): React.CSSProperties => ({
  background: isActive ? 'var(--accent)' : 'transparent',
  color: isActive ? '#fff' : 'var(--text-main)',
  border: 'none',
  padding: '3px 8px',
  borderRadius: '3px',
  cursor: 'pointer',
  fontSize: '11px',
  fontWeight: 500,
});

export const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  minWidth: '230px',
  backgroundColor: '#131722',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '6px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
  padding: '4px',
  zIndex: 100,
  marginTop: '3px',
};

export const submenuDropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-4px',
  left: 'calc(100% - 2px)',
  minWidth: '240px',
  backgroundColor: '#131722',
  border: '1px solid rgba(255, 255, 255, 0.14)',
  borderRadius: '6px',
  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.8)',
  padding: '4px',
  zIndex: 120,
};

export const menuDividerStyle: React.CSSProperties = {
  height: '1px',
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  margin: '4px 0',
};

export const shortcutStyle: React.CSSProperties = {
  fontSize: '10px',
  color: 'var(--text-faint)',
  letterSpacing: '0.05em',
  marginLeft: '14px',
};

export const modalBackdropStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 200,
  padding: '20px',
};

export const modalBoxStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  width: '100%',
  maxWidth: '460px',
  padding: '22px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

export const shortcutRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '4px 0',
  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
};

export const kbdStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: '4px',
  padding: '2px 6px',
  fontSize: '10px',
  fontFamily: 'monospace',
  color: 'var(--text-main)',
};
