import React from 'react';
import { Glyph, FontMetrics, KerningPair } from '../../types/font';
import { typesetText, TypesetParagraph } from '../../utils/typesetter';

interface WaterfallPreviewProps {
  waterfallSizes: number[];
  sampleText: string;
  glyphs: Record<string, Glyph>;
  metrics: FontMetrics;
  kerningPairs: KerningPair[];
  letterSpacing: number;
  enableKerning: boolean;
  renderTypesetParagraphs: (paragraphs: TypesetParagraph[], size: number, lineHeight: number) => React.ReactNode;
}

export const WaterfallPreview: React.FC<WaterfallPreviewProps> = ({
  waterfallSizes,
  sampleText,
  glyphs,
  metrics,
  kerningPairs,
  letterSpacing,
  enableKerning,
  renderTypesetParagraphs
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {waterfallSizes.map((size) => {
        const waterParagraphs = typesetText(
          sampleText || 'Pack my box with five dozen liquor jugs.',
          glyphs,
          metrics,
          kerningPairs,
          {
            fontSize: size,
            lineHeight: 1.3,
            letterSpacing,
            enableKerning,
          }
        );

        return (
          <div key={size} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '14px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginBottom: '4px', fontWeight: 600 }}>
              {size}px
            </div>
            <div>
              {renderTypesetParagraphs(waterParagraphs, size, 1.3)}
            </div>
          </div>
        );
      })}
    </div>
  );
};
