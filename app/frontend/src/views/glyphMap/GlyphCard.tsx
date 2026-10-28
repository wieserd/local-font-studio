import React from 'react';
import { CheckCircle2, Image, Move } from 'lucide-react';
import { Glyph } from '../../types/font';

interface GlyphCardProps {
  glyph: Glyph;
  isSelected: boolean;
  isHolding: boolean;
  holdProgress: number;
  isCurrentSource: boolean;
  isCurrentHoverTarget: boolean;
  dragModeSource: string | null;
  onPointerDown: (e: React.PointerEvent, glyph: Glyph) => void;
}

export const GlyphCard: React.FC<GlyphCardProps> = ({
  glyph: g,
  isSelected,
  isHolding,
  holdProgress,
  isCurrentSource,
  isCurrentHoverTarget,
  dragModeSource,
  onPointerDown,
}) => {
  const hasPath = Boolean(g.isAssigned && g.svgPath);

  // Compute border, background, and shadow styles
  let borderStyle = isSelected 
    ? '2px solid var(--accent)' 
    : hasPath 
      ? '1px solid rgba(99, 102, 241, 0.4)' 
      : '1px solid var(--border)';
  let bgStyle = isSelected ? 'var(--bg-surface)' : 'var(--bg-card)';
  let shadowStyle = 'none';

  if (isCurrentSource) {
    // Activated Drag Source: Bold Vibrant Orange Border and Glow
    borderStyle = '2.5px solid #f97316';
    bgStyle = 'rgba(249, 115, 22, 0.18)';
    shadowStyle = '0 0 20px rgba(249, 115, 22, 0.6)';
  } else if (isCurrentHoverTarget) {
    if (hasPath) {
      // Non-empty target: amber dashed warning border
      borderStyle = '2px dashed #f59e0b';
      bgStyle = 'rgba(245, 158, 11, 0.2)';
      shadowStyle = '0 0 16px rgba(245, 158, 11, 0.45)';
    } else {
      // Empty target: green dashed drop zone border
      borderStyle = '2px dashed #10b981';
      bgStyle = 'rgba(16, 185, 129, 0.2)';
      shadowStyle = '0 0 16px rgba(16, 185, 129, 0.45)';
    }
  } else if (isHolding) {
    borderStyle = '2px solid #f97316';
    bgStyle = 'rgba(249, 115, 22, 0.1)';
  }

  return (
    <div
      data-glyph-char={g.char}
      onPointerDown={(e) => onPointerDown(e, g)}
      style={{
        height: '115px',
        backgroundColor: bgStyle,
        border: borderStyle,
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 6px',
        cursor: isCurrentSource 
          ? 'grab' 
          : dragModeSource 
            ? 'pointer' 
            : 'pointer',
        position: 'relative',
        boxShadow: shadowStyle,
        transform: isCurrentSource ? 'scale(1.04)' : isCurrentHoverTarget ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease',
        userSelect: 'none',
        overflow: 'hidden',
        touchAction: 'none'
      }}
      title={
        isCurrentSource
          ? `Glyph '${g.char}' is active for dragging. Click or drop onto any target glyph.`
          : dragModeSource
            ? `Click to duplicate '${dragModeSource}' onto '${g.char}'`
            : hasPath
              ? `Click to open in editor, or hold 1s to drag and duplicate '${g.char}'`
              : `Empty glyph '${g.char}'`
      }
    >
      {/* 1-Second Hold Progress Bar */}
      {isHolding && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: 'rgba(255,255,255,0.1)'
        }}>
          <div style={{
            height: '100%',
            width: `${holdProgress}%`,
            backgroundColor: '#f97316',
            transition: 'width 0.02s linear'
          }} />
        </div>
      )}

      {/* Status Indicator / Active Pill Badge */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '10px',
        color: 'var(--text-faint)'
      }}>
        <span>{g.unicode}</span>
        {isCurrentSource ? (
          <span style={{
            fontSize: '9px',
            fontWeight: 800,
            color: '#ffffff',
            backgroundColor: '#ea580c',
            padding: '1px 5px',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            letterSpacing: '0.04em'
          }}>
            <Move size={9} />
            ACTIVE
          </span>
        ) : isCurrentHoverTarget ? (
          <span style={{
            fontSize: '9px',
            fontWeight: 700,
            color: hasPath ? '#fbbf24' : '#34d399',
            backgroundColor: hasPath ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.25)',
            padding: '1px 4px',
            borderRadius: '3px'
          }}>
            {hasPath ? 'Overwrite?' : 'Drop here'}
          </span>
        ) : isHolding ? (
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#f97316' }}>
            {holdProgress}%
          </span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            {Boolean(g.originalImage) && (
              <span 
                title="Source bitmap attached" 
                style={{ 
                  color: '#38bdf8', 
                  display: 'flex', 
                  alignItems: 'center',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  padding: '1px 3px',
                  borderRadius: '3px'
                }}
              >
                <Image size={10} />
              </span>
            )}
            {hasPath ? (
              <span 
                title="Vector artwork assigned"
                style={{ color: 'var(--success)', display: 'flex', alignItems: 'center' }}
              >
                <CheckCircle2 size={11} />
              </span>
            ) : !g.originalImage ? (
              <span style={{ color: 'var(--text-faint)' }}>—</span>
            ) : null}
          </div>
        )}
      </div>

      {/* Glyph Visual Display: SVG path preview or character */}
      <div style={{
        width: '100%',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        pointerEvents: 'none'
      }}>
        {g.char === ' ' ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: isSelected ? 'var(--accent)' : 'var(--text-muted)'
          }}>
            <span style={{ fontSize: '22px', fontWeight: 700, lineHeight: 1 }}>␣</span>
            <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.04em' }}>SPACE</span>
          </div>
        ) : hasPath ? (
          <svg
            viewBox="0 0 650 750"
            style={{ width: '38px', height: '38px', transform: 'scaleY(-1)' }}
          >
            <path 
              d={g.svgPath} 
              fill={isCurrentSource ? '#f97316' : isCurrentHoverTarget ? (hasPath ? '#f59e0b' : '#10b981') : 'var(--text-main)'} 
            />
          </svg>
        ) : (
          <span style={{
            fontSize: '34px',
            fontWeight: 600,
            fontFamily: 'serif',
            color: isCurrentHoverTarget ? '#10b981' : 'rgba(255,255,255,0.18)'
          }}>
            {g.char}
          </span>
        )}
      </div>

      {/* Metrics Footer */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '9px',
        color: isCurrentSource ? '#f97316' : 'var(--text-muted)',
        borderTop: isCurrentSource ? '1px solid rgba(249, 115, 22, 0.3)' : '1px solid rgba(255,255,255,0.06)',
        paddingTop: '4px',
        fontWeight: isCurrentSource ? 600 : 400
      }}>
        <span>W: {g.advanceWidth}</span>
        <span>SB: {g.lsb}</span>
      </div>
    </div>
  );
};
