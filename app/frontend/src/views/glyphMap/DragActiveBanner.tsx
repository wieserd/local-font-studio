import React from 'react';
import { X } from 'lucide-react';

interface DragActiveBannerProps {
  sourceChar: string;
  onCancel: () => void;
}

export const DragActiveBanner: React.FC<DragActiveBannerProps> = ({
  sourceChar,
  onCancel,
}) => {
  return (
    <div style={{
      backgroundColor: '#ea580c',
      color: '#ffffff',
      padding: '12px 18px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '14px',
      boxShadow: '0 6px 20px rgba(234, 88, 12, 0.45)',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          backgroundColor: '#ffffff',
          color: '#ea580c',
          borderRadius: '6px',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '17px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
        }}>
          {sourceChar}
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700 }}>
            Drag & Drop Activated!
          </div>
          <div style={{ fontSize: '12px', opacity: 0.95 }}>
            You can now drag glyph <strong>'{sourceChar}'</strong> over another glyph (or click on any target glyph) to duplicate its artwork. Please choose a target glyph.
          </div>
        </div>
      </div>

      <button
        onClick={onCancel}
        style={{
          backgroundColor: 'rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.4)',
          color: '#ffffff',
          borderRadius: '5px',
          padding: '6px 14px',
          fontSize: '11px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          whiteSpace: 'nowrap'
        }}
        title="Cancel drag mode (or press Esc)"
      >
        <X size={13} />
        <span>Cancel (Esc)</span>
      </button>
    </div>
  );
};
