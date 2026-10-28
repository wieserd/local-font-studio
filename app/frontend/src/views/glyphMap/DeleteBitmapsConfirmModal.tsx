import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteBitmapsConfirmModalProps {
  isOpen: boolean;
  visibleBitmapsCount: number;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export const DeleteBitmapsConfirmModal: React.FC<DeleteBitmapsConfirmModalProps> = ({
  isOpen,
  visibleBitmapsCount,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 7, 12, 0.82)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#151a26',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '440px',
          padding: '22px',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.75)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          color: 'var(--text-main)',
          animation: 'fadeIn 0.15s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444'
          }}>
            <Trash2 size={18} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
              Delete All Bitmaps?
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {visibleBitmapsCount} glyph{visibleBitmapsCount > 1 ? 's' : ''} currently have source bitmaps
            </div>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Are you sure you want to remove source bitmaps from all <strong>{visibleBitmapsCount}</strong> glyphs? Vector contours, sidebearings, and metrics will remain completely intact.
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
          <button
            className="btn-secondary"
            onClick={onClose}
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirmDelete}
            style={{
              fontSize: '12px',
              padding: '6px 16px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Trash2 size={13} />
            <span>Delete All Bitmaps</span>
          </button>
        </div>
      </div>
    </div>
  );
};
