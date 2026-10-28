import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';

interface ReplaceGlyphSvgModalProps {
  isOpen: boolean;
  onClose: () => void;
  glyphChar: string;
  candidate: { svgPath: string; advanceWidth: number; lsb: number; filename: string } | null;
  currentSvgPath: string;
  currentAdvanceWidth: number;
  upm: number;
  ascender: number;
  descender: number;
  onConfirm: () => void;
}

export const ReplaceGlyphSvgModal: React.FC<ReplaceGlyphSvgModalProps> = ({
  isOpen,
  onClose,
  glyphChar,
  candidate,
  currentSvgPath,
  currentAdvanceWidth,
  upm,
  ascender,
  descender,
  onConfirm
}) => {
  if (!isOpen || !candidate) return null;

  return (
    <div style={{
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
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-sidebar)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '480px',
        padding: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            flexShrink: 0
          }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#fff' }}>
              Replace Glyph '{glyphChar}' Artwork?
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Importing will replace the current vector contours of this glyph.
            </p>
          </div>
        </div>

        {/* Warning Callout */}
        <div style={{
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '12px',
          color: '#f59e0b',
          lineHeight: 1.4
        }}>
          <strong>Warning:</strong> The existing drawing for <strong>'{glyphChar}'</strong> will be replaced with the vector path from <strong>{candidate.filename}</strong>. (You can also undo with ⌘Z after importing).
        </div>

        {/* Before / After Preview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          backgroundColor: '#0a0d14',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '12px'
        }}>
          {/* Current Artwork */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Current Glyph</span>
            <div style={{
              width: '110px',
              height: '90px',
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {currentSvgPath ? (
                <svg width="70" height="70" viewBox={`0 ${descender} ${currentAdvanceWidth || 600} ${upm}`}>
                  <g transform={`scale(1, -1) translate(0, ${-upm + ascender})`}>
                    <path d={currentSvgPath} fill="#94a3b8" />
                  </g>
                </svg>
              ) : (
                <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Empty</span>
              )}
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>Advance: {currentAdvanceWidth}</span>
          </div>

          {/* Incoming SVG Artwork */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600 }}>Incoming SVG</span>
            <div style={{
              width: '110px',
              height: '90px',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid var(--accent)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <svg width="70" height="70" viewBox={`0 ${descender} ${candidate.advanceWidth} ${upm}`}>
                <g transform={`scale(1, -1) translate(0, ${-upm + ascender})`}>
                  <path d={candidate.svgPath} fill="#60a5fa" />
                </g>
              </svg>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--accent)' }}>Advance: {candidate.advanceWidth}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
          <button
            className="btn-secondary"
            onClick={onClose}
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={onConfirm}
            style={{ padding: '8px 18px', fontSize: '12px', backgroundColor: '#dc2626', borderColor: '#ef4444', gap: '6px' }}
          >
            <Check size={14} />
            <span>Replace Glyph</span>
          </button>
        </div>
      </div>
    </div>
  );
};
