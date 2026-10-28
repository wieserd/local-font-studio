import React from 'react';
import { FontMetrics } from '../../types/font';
import { TypesetParagraph, TypesetChar } from '../../utils/typesetter';

interface TypesetCanvasProps {
  paragraphs: TypesetParagraph[];
  fontSize: number;
  lineHeight: number;
  metrics: FontMetrics;
  showGuides: boolean;
  highlightMissing: boolean;
  letterSpacing: number;
  darkBg: boolean;
  onNavigateToChar: (char: string) => void;
}

export const TypesetCanvas: React.FC<TypesetCanvasProps> = ({
  paragraphs,
  fontSize,
  lineHeight,
  metrics,
  showGuides,
  highlightMissing,
  letterSpacing,
  darkBg,
  onNavigateToChar
}) => {
  const lineHeightPx = fontSize * lineHeight;
  const upm = metrics.upm || 1000;
  const currentScale = fontSize / upm;
  const halfLeading = ((lineHeight - 1) * fontSize) / 2;
  const baselineFromTop = halfLeading + (metrics.ascender * fontSize) / upm;
  const ascenderPx = (metrics.ascender * fontSize) / upm;
  const capHeightPx = (metrics.capHeight * fontSize) / upm;
  const descenderPx = (metrics.descender * fontSize) / upm;

  const renderSingleChar = (
    c: TypesetChar,
    idxKey: string,
    isFirstInWord: boolean
  ) => {
    if (c.isAssigned && c.svgPath) {
      return (
        <div
          key={idxKey}
          onClick={() => onNavigateToChar(c.char)}
          style={{
            position: 'relative',
            width: `${Math.max(1, c.advancePx)}px`,
            height: `${lineHeightPx}px`,
            flexShrink: 0,
            cursor: 'pointer',
            display: 'inline-block'
          }}
          title={`'${c.char}' (Advance: ${c.glyph?.advanceWidth || metrics.defaultAdvance}${c.kernFontUnits ? `, Kern: ${c.kernFontUnits}` : ''}) • Click to edit in Glyph Editor`}
        >
          {/* Guide lines if active */}
          {showGuides && (
            <>
              {/* Ascender line */}
              <div style={{
                position: 'absolute',
                top: `${baselineFromTop - ascenderPx}px`,
                left: 0,
                right: 0,
                borderTop: '1px dashed rgba(239, 68, 68, 0.4)',
                pointerEvents: 'none'
              }} />
              {/* Cap Height line */}
              <div style={{
                position: 'absolute',
                top: `${baselineFromTop - capHeightPx}px`,
                left: 0,
                right: 0,
                borderTop: '1px dashed rgba(99, 102, 241, 0.35)',
                pointerEvents: 'none'
              }} />
              {/* Baseline */}
              <div style={{
                position: 'absolute',
                top: `${baselineFromTop}px`,
                left: 0,
                right: 0,
                borderTop: '1.5px solid rgba(16, 185, 129, 0.55)',
                pointerEvents: 'none'
              }} />
              {/* Descender line */}
              <div style={{
                position: 'absolute',
                top: `${baselineFromTop - descenderPx}px`,
                left: 0,
                right: 0,
                borderTop: '1px dashed rgba(245, 158, 11, 0.4)',
                pointerEvents: 'none'
              }} />
              {/* Left Side Bearing vertical boundary */}
              {isFirstInWord && (
                <div style={{
                  position: 'absolute',
                  top: `${baselineFromTop - ascenderPx}px`,
                  bottom: `${lineHeightPx - (baselineFromTop - descenderPx)}px`,
                  left: 0,
                  borderLeft: '1px dotted rgba(255, 255, 255, 0.15)',
                  pointerEvents: 'none'
                }} />
              )}
            </>
          )}

          {/* Real SVG vector contour rendered with exact font metric transforms */}
          <svg
            width={Math.max(1, c.advancePx)}
            height={lineHeightPx}
            style={{ overflow: 'visible', position: 'absolute', top: 0, left: 0 }}
          >
            <g
              transform={`translate(${c.xOffsetPx}, ${baselineFromTop - c.yOffsetPx}) scale(${c.glyphScale * c.scaleFactor}, ${-c.glyphScale * c.scaleFactor})`}
            >
              <path
                d={c.svgPath}
                fill={darkBg ? '#f8fafc' : '#0f172a'}
              />
            </g>
          </svg>
        </div>
      );
    }

    // Unassigned / Missing Glyph Fallback box
    const fallbackAdv = Math.max(12, ((metrics.defaultAdvance || 600) * currentScale) + letterSpacing);
    return (
      <div
        key={idxKey}
        onClick={() => onNavigateToChar(c.char)}
        style={{
          position: 'relative',
          width: `${fallbackAdv}px`,
          height: `${lineHeightPx}px`,
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        title={`Unassigned glyph '${c.char}' • Click to draw in Glyph Editor`}
      >
        {/* Guides if active */}
        {showGuides && (
          <>
            <div style={{ position: 'absolute', top: `${baselineFromTop - ascenderPx}px`, left: 0, right: 0, borderTop: '1px dashed rgba(239, 68, 68, 0.3)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: `${baselineFromTop - capHeightPx}px`, left: 0, right: 0, borderTop: '1px dashed rgba(99, 102, 241, 0.25)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: `${baselineFromTop}px`, left: 0, right: 0, borderTop: '1.5px solid rgba(16, 185, 129, 0.4)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: `${baselineFromTop - descenderPx}px`, left: 0, right: 0, borderTop: '1px dashed rgba(245, 158, 11, 0.3)', pointerEvents: 'none' }} />
          </>
        )}

        {/* Fallback frame */}
        <div style={{
          position: 'absolute',
          top: `${baselineFromTop - capHeightPx}px`,
          bottom: `${lineHeightPx - baselineFromTop}px`,
          left: '1px',
          right: '1px',
          border: highlightMissing ? '1.5px dashed rgba(239, 68, 68, 0.65)' : '1px dashed rgba(148, 163, 184, 0.25)',
          backgroundColor: highlightMissing ? (darkBg ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)') : 'transparent',
          borderRadius: '3px',
          pointerEvents: 'none'
        }} />

        <span style={{
          fontSize: `${fontSize * 0.72}px`,
          lineHeight: 1,
          fontFamily: 'serif',
          color: highlightMissing ? '#ef4444' : (darkBg ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'),
          userSelect: 'none'
        }}>
          {c.char}
        </span>
      </div>
    );
  };

  return (
    <>
      {paragraphs.map((p) => (
        <div
          key={p.id}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            columnGap: '0px',
            rowGap: `${Math.max(6, (lineHeight - 1) * fontSize)}px`,
            width: '100%',
            position: 'relative',
            marginBottom: `${Math.max(12, fontSize * 0.4)}px`
          }}
        >
          {p.tokens.map((token, tIdx) => {
            if (token.type === 'space') {
              return (
                <span
                  key={`space-${tIdx}`}
                  style={{
                    display: 'inline-block',
                    width: `${token.widthPx}px`,
                    height: `${lineHeightPx}px`,
                    position: 'relative',
                    flexShrink: 0
                  }}
                >
                  {showGuides && (
                    <>
                      <div style={{ position: 'absolute', top: `${baselineFromTop - ascenderPx}px`, left: 0, right: 0, borderTop: '1px dashed rgba(239, 68, 68, 0.4)', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', top: `${baselineFromTop - capHeightPx}px`, left: 0, right: 0, borderTop: '1px dashed rgba(99, 102, 241, 0.35)', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', top: `${baselineFromTop}px`, left: 0, right: 0, borderTop: '1.5px solid rgba(16, 185, 129, 0.55)', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', top: `${baselineFromTop - descenderPx}px`, left: 0, right: 0, borderTop: '1px dashed rgba(245, 158, 11, 0.4)', pointerEvents: 'none' }} />
                    </>
                  )}
                </span>
              );
            }

            if (token.type === 'word' && token.word) {
              return (
                <span
                  key={token.word.id}
                  style={{
                    display: 'inline-flex',
                    flexWrap: 'nowrap',
                    alignItems: 'baseline',
                    position: 'relative'
                  }}
                >
                  {token.word.chars.map((c, cIdx) => 
                    renderSingleChar(c, `${token.word!.id}-${cIdx}`, cIdx === 0)
                  )}
                </span>
              );
            }

            return null;
          })}
        </div>
      ))}
    </>
  );
};
