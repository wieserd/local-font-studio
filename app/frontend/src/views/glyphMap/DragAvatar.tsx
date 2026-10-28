import React from 'react';
import { Copy } from 'lucide-react';
import { Glyph } from '../../types/font';

interface DragAvatarProps {
  sourceChar: string;
  sourceGlyph: Glyph | undefined;
  cursorPos: { x: number; y: number };
  hoveredTargetChar: string | null;
  targetGlyph: Glyph | undefined;
}

export const DragAvatar: React.FC<DragAvatarProps> = ({
  sourceChar,
  sourceGlyph,
  cursorPos,
  hoveredTargetChar,
  targetGlyph,
}) => {
  return (
    <div style={{
      position: 'fixed',
      top: `${cursorPos.y + 14}px`,
      left: `${cursorPos.x + 14}px`,
      pointerEvents: 'none',
      zIndex: 99999,
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      border: '2px solid #f97316',
      borderRadius: '8px',
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
      backdropFilter: 'blur(6px)',
      animation: 'fadeIn 0.1s ease-out'
    }}>
      <div style={{
        width: '30px',
        height: '30px',
        backgroundColor: 'rgba(249, 115, 22, 0.15)',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {sourceGlyph && sourceGlyph.svgPath ? (
          <svg viewBox="0 0 650 750" style={{ width: '22px', height: '22px', transform: 'scaleY(-1)' }}>
            <path d={sourceGlyph.svgPath} fill="#f97316" />
          </svg>
        ) : (
          <span style={{ fontWeight: 800, color: '#f97316' }}>{sourceChar}</span>
        )}
      </div>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Copy size={12} style={{ color: '#f97316' }} />
          <span>Copying Glyph '{sourceChar}'</span>
        </div>
        <div style={{
          fontSize: '11px',
          color: hoveredTargetChar ? (targetGlyph?.svgPath ? '#f59e0b' : '#34d399') : 'var(--text-muted)'
        }}>
          {hoveredTargetChar ? (
            targetGlyph?.svgPath
              ? `Click or drop to overwrite '${hoveredTargetChar}'`
              : `Click or drop onto empty '${hoveredTargetChar}'`
          ) : 'Move cursor & click target glyph'}
        </div>
      </div>
    </div>
  );
};
