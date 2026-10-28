import React from 'react';
import { Layers, ChevronDown, Check, Plus } from 'lucide-react';
import { FontStyleState } from '../../types/font';

interface StyleDropdownProps {
  styleDropdownRef: React.RefObject<HTMLDivElement>;
  styleDropdownOpen: boolean;
  setStyleDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeStyle: FontStyleState;
  activeStyleId: string;
  stylesList: FontStyleState[];
  switchStyle: (styleId: string) => void;
  onFamilyStylesClick?: () => void;
}

export const StyleDropdown: React.FC<StyleDropdownProps> = ({
  styleDropdownRef,
  styleDropdownOpen,
  setStyleDropdownOpen,
  activeStyle,
  activeStyleId,
  stylesList,
  switchStyle,
  onFamilyStylesClick,
}) => {
  return (
    <div style={{ position: 'relative' }} ref={styleDropdownRef}>
      <button
        onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
        className="btn-ghost"
        style={{
          height: '24px',
          padding: '1px 8px',
          fontSize: '11px',
          gap: '5px',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--bg-input)',
          borderRadius: '4px',
        }}
        title="Switch font style / cut"
      >
        <Layers size={12} color="var(--accent)" />
        <span style={{ color: 'var(--text-faint)' }}>Cut:</span>
        <span style={{ fontWeight: 600, fontStyle: activeStyle.isItalic ? 'italic' : 'normal' }}>
          {activeStyle.name}
        </span>
        <ChevronDown size={11} style={{ opacity: 0.7 }} />
      </button>

      {styleDropdownOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '4px',
          width: '210px',
          backgroundColor: '#131722',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '6px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          padding: '4px',
          zIndex: 100,
        }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 700,
            color: 'var(--text-faint)',
            textTransform: 'uppercase',
            padding: '4px 6px',
            letterSpacing: '0.05em'
          }}>
            Family Styles ({stylesList.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '180px', overflowY: 'auto' }}>
            {stylesList.map(s => {
              const isCurrent = s.id === activeStyleId;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    switchStyle(s.id);
                    setStyleDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 8px',
                    borderRadius: '4px',
                    backgroundColor: isCurrent ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    border: 'none',
                    color: isCurrent ? 'var(--accent)' : 'var(--text-main)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '11px',
                  }}
                >
                  <span style={{ fontWeight: isCurrent ? 700 : 400, fontStyle: s.isItalic ? 'italic' : 'normal' }}>
                    {s.name} <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>({s.weightClass})</span>
                  </span>
                  {isCurrent && <Check size={12} />}
                </button>
              );
            })}
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '4px 0' }} />

          <button
            onClick={() => {
              setStyleDropdownOpen(false);
              onFamilyStylesClick?.();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              width: '100%',
              padding: '5px 8px',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--accent)',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            <Plus size={12} />
            <span>Manage & Add Cuts...</span>
          </button>
        </div>
      )}
    </div>
  );
};
