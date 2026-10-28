import React, { useState, useMemo } from 'react';
import { Sparkles, ToggleLeft, ToggleRight, Type, Check } from 'lucide-react';
import { Glyph, FontMetrics, KerningPair } from '../../types/font';
import { typesetText, TypesetOptions } from '../../utils/typesetter';

interface KerningSentenceSpecimenProps {
  leftChar: string;
  rightChar: string;
  glyphs: Record<string, Glyph>;
  metrics: FontMetrics;
  kerningPairs: KerningPair[];
}

export const KerningSentenceSpecimen: React.FC<KerningSentenceSpecimenProps> = ({
  leftChar,
  rightChar,
  glyphs,
  metrics,
  kerningPairs
}) => {
  const pairStr = `${leftChar}${rightChar}`;

  // Pre-generate tailored specimen presets based on the active pair
  const presets = useMemo(() => {
    return [
      {
        label: `Pair Rhythm (${pairStr})`,
        text: `HH${pairStr}HH OO${pairStr}OO ${pairStr} ${pairStr} ${pairStr}`
      },
      {
        label: 'Avatar / Waltz',
        text: 'AVATAR WALTZ Towering Yellow Yacht over the Pacific horizon.'
      },
      {
        label: 'Typography Pangram',
        text: 'The quick brown fox jumps over the lazy dog. 1234567890!'
      },
      {
        label: 'Mixed Case Context',
        text: `To WATER Ta LT FA AV AW Ay ${pairStr} Wave Yacht Quartz.`
      }
    ];
  }, [pairStr]);

  const [sampleText, setSampleText] = useState(presets[0].text);
  const [fontSize, setFontSize] = useState(38);
  const [enableKerning, setEnableKerning] = useState(true);

  // Update sample text when the active pair changes if using pair rhythm
  const [lastPair, setLastPair] = useState(pairStr);
  if (lastPair !== pairStr) {
    setLastPair(pairStr);
    setSampleText(`HH${pairStr}HH OO${pairStr}OO ${pairStr} ${pairStr} ${pairStr}`);
  }

  const typesetParagraphs = useMemo(() => {
    const opts: TypesetOptions = {
      fontSize,
      lineHeight: 1.4,
      letterSpacing: 0,
      enableKerning
    };
    return typesetText(sampleText, glyphs, metrics, kerningPairs, opts);
  }, [sampleText, glyphs, metrics, kerningPairs, fontSize, enableKerning]);

  const upm = metrics.upm || 1000;
  const currentScale = fontSize / upm;
  const lineHeightPx = fontSize * 1.4;
  const baselineFromTop = ((1.4 - 1) * fontSize) / 2 + (metrics.ascender * fontSize) / upm;

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Type size={16} color="var(--accent)" />
          <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            In-Context Sentence Verification
          </h4>
        </div>

        {/* Kerning Toggle & Font Size */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Kerning Toggle */}
          <button
            onClick={() => setEnableKerning(!enableKerning)}
            className="btn-secondary"
            title="Toggle Kerning On / Off to compare spacing"
            style={{
              fontSize: '11px',
              padding: '4px 10px',
              gap: '6px',
              backgroundColor: enableKerning ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              borderColor: enableKerning ? 'var(--accent)' : 'var(--border)',
              color: enableKerning ? 'var(--accent)' : 'var(--text-muted)'
            }}
          >
            {enableKerning ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
            <span>GPOS Kerning: {enableKerning ? 'ON' : 'OFF'}</span>
          </button>

          {/* Size Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>{fontSize}px</span>
            <input
              type="range"
              min="20"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              style={{ width: '80px', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Preset Pill Bar */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {presets.map((p, idx) => (
          <button
            key={idx}
            className="btn-secondary"
            onClick={() => setSampleText(p.text)}
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              backgroundColor: sampleText === p.text ? 'var(--accent)' : 'var(--bg-surface)',
              color: sampleText === p.text ? '#fff' : 'var(--text-muted)',
              border: sampleText === p.text ? '1px solid var(--accent)' : '1px solid var(--border)'
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Editable Input */}
      <div>
        <input
          type="text"
          value={sampleText}
          onChange={(e) => setSampleText(e.target.value)}
          placeholder="Type any test words..."
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '13px',
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-main)'
          }}
        />
      </div>

      {/* Vector Typeset Specimen Render Area */}
      <div style={{
        backgroundColor: 'var(--bg-app)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '24px 20px',
        minHeight: '120px',
        overflowX: 'auto',
        position: 'relative'
      }}>
        {typesetParagraphs.map((para) => (
          <div key={para.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', minHeight: `${lineHeightPx}px` }}>
            {para.tokens.map((token, tIdx) => {
              if (token.type === 'space') {
                return (
                  <div
                    key={`space-${tIdx}`}
                    style={{
                      width: `${token.widthPx}px`,
                      height: `${lineHeightPx}px`,
                      display: 'inline-block',
                      flexShrink: 0
                    }}
                  />
                );
              }

              return (
                <div key={token.word?.id || `word-${tIdx}`} style={{ display: 'inline-flex', alignItems: 'baseline' }}>
                  {token.word?.chars.map((c, cIdx) => {
                    const isLeftOfPair = c.char === leftChar && token.word?.chars[cIdx + 1]?.char === rightChar;
                    const isRightOfPair = c.char === rightChar && token.word?.chars[cIdx - 1]?.char === leftChar;
                    const isHighlightedPairChar = isLeftOfPair || isRightOfPair;

                    if (c.isAssigned && c.svgPath) {
                      return (
                        <div
                          key={`char-${cIdx}`}
                          style={{
                            position: 'relative',
                            width: `${Math.max(1, c.advancePx)}px`,
                            height: `${lineHeightPx}px`,
                            flexShrink: 0,
                            display: 'inline-block',
                            backgroundColor: isHighlightedPairChar && enableKerning ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                            borderRadius: '2px'
                          }}
                          title={`'${c.char}' (Kern: ${c.kernFontUnits}u)`}
                        >
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
                                fill={isHighlightedPairChar ? 'var(--accent)' : 'var(--text-main)'}
                              />
                            </g>
                          </svg>
                        </div>
                      );
                    }

                    // Fallback character
                    const fallbackAdv = Math.max(12, (metrics.defaultAdvance || 600) * currentScale);
                    return (
                      <div
                        key={`char-${cIdx}`}
                        style={{
                          width: `${fallbackAdv}px`,
                          height: `${lineHeightPx}px`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px dashed rgba(255,255,255,0.2)',
                          borderRadius: '3px',
                          color: 'var(--text-faint)',
                          fontSize: `${fontSize * 0.7}px`,
                          marginRight: '2px'
                        }}
                      >
                        {c.char}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
