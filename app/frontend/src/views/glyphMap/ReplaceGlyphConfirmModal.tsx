import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Glyph } from '../../types/font';
import { OverwriteModalState } from './glyphMapTypes';

interface ReplaceGlyphConfirmModalProps {
  confirmModal: OverwriteModalState | null;
  glyphs: Record<string, Glyph>;
  onCancel: () => void;
  onConfirm: (sourceChar: string, targetChar: string) => void;
}

export const ReplaceGlyphConfirmModal: React.FC<ReplaceGlyphConfirmModalProps> = ({
  confirmModal,
  glyphs,
  onCancel,
  onConfirm,
}) => {
  if (!confirmModal) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      zIndex: 100000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '440px',
        padding: '24px',
        boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        animation: 'fadeIn 0.15s ease-out'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            padding: '8px',
            color: '#f59e0b',
            display: 'flex'
          }}>
            <AlertTriangle size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0' }}>
              Replace Glyph Artwork?
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
              Target glyph <strong>'{confirmModal.targetChar}'</strong> already contains artwork. Do you really want to replace it with <strong>'{confirmModal.sourceChar}'</strong>?
            </p>
          </div>
        </div>

        {/* Side-by-side Visual Comparison */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          backgroundColor: 'var(--bg-app)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '16px'
        }}>
          {/* Source (New) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px', color: '#f97316', textTransform: 'uppercase', fontWeight: 600 }}>Source</span>
            <div style={{
              width: '56px',
              height: '56px',
              backgroundColor: 'var(--bg-card)',
              border: '1.5px solid #f97316',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {glyphs[confirmModal.sourceChar]?.svgPath ? (
                <svg viewBox="0 0 650 750" style={{ width: '40px', height: '40px', transform: 'scaleY(-1)' }}>
                  <path d={glyphs[confirmModal.sourceChar].svgPath} fill="#f97316" />
                </svg>
              ) : (
                <span>{confirmModal.sourceChar}</span>
              )}
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700 }}>'{confirmModal.sourceChar}'</span>
          </div>

          <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />

          {/* Target (Will be overwritten) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 600 }}>Current Target</span>
            <div style={{
              width: '56px',
              height: '56px',
              backgroundColor: 'var(--bg-card)',
              border: '1.5px dashed rgba(245, 158, 11, 0.5)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {glyphs[confirmModal.targetChar]?.svgPath ? (
                <svg viewBox="0 0 650 750" style={{ width: '40px', height: '40px', transform: 'scaleY(-1)' }}>
                  <path d={glyphs[confirmModal.targetChar].svgPath} fill="#f59e0b" />
                </svg>
              ) : (
                <span>{confirmModal.targetChar}</span>
              )}
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b' }}>'{confirmModal.targetChar}'</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
          <button
            className="btn-secondary"
            onClick={onCancel}
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={() => onConfirm(confirmModal.sourceChar, confirmModal.targetChar)}
            style={{
              fontSize: '12px',
              padding: '6px 16px',
              backgroundColor: '#ea580c',
              borderColor: '#c2410c',
              color: '#ffffff',
              fontWeight: 600
            }}
          >
            Replace Glyph
          </button>
        </div>
      </div>
    </div>
  );
};
