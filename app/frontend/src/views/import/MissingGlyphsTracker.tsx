import React, { useState } from 'react';
import { Copy, AlertTriangle, Check } from 'lucide-react';
import { GlyphBox } from './types';

interface MissingGlyphsTrackerProps {
  uppercaseChars: string[];
  lowercaseChars: string[];
  specialChars: string[];
  assignedInProjectChars: Set<string>;
  definedInCurrentBoxes: Set<string>;
  nextTargetChar: string;
  onPickChar: (char: string) => void;
  onCopyCase: (direction: 'upper-to-lower' | 'lower-to-upper') => void;
  selectedBox: GlyphBox | undefined;
}

export const MissingGlyphsTracker: React.FC<MissingGlyphsTrackerProps> = ({
  uppercaseChars,
  lowercaseChars,
  specialChars,
  assignedInProjectChars,
  definedInCurrentBoxes,
  nextTargetChar,
  onPickChar,
  onCopyCase,
  selectedBox,
}) => {
  const [activeCategoryTab, setActiveCategoryTab] = useState<'uppercase' | 'lowercase' | 'special'>('uppercase');

  const allChars = [...uppercaseChars, ...lowercaseChars, ...specialChars];
  const upperMissing = uppercaseChars.filter(c => !assignedInProjectChars.has(c));
  const lowerMissing = lowercaseChars.filter(c => !assignedInProjectChars.has(c));
  const specialMissing = specialChars.filter(c => !assignedInProjectChars.has(c));
  const totalMissing = allChars.filter(c => !assignedInProjectChars.has(c)).length;
  const totalAssigned = allChars.length - totalMissing;

  const activeCategoryChars = activeCategoryTab === 'uppercase'
    ? uppercaseChars
    : activeCategoryTab === 'lowercase'
      ? lowercaseChars
      : specialChars;

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Missing Glyphs Tracker
        </h3>
        <span className="badge badge-indigo">
          {totalAssigned} / {allChars.length} Saved
        </span>
      </div>

      <p style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
        {totalMissing === 0 
          ? 'All standard characters are present in this font project!' 
          : `Out of ${allChars.length} standard glyphs, ${totalMissing} are still missing.`
        }
      </p>

      {/* Overall Progress Bar */}
      <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--bg-surface)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          width: `${Math.round((totalAssigned / allChars.length) * 100)}%`,
          height: '100%',
          backgroundColor: 'var(--accent)'
        }} />
      </div>

      {/* Category Tabs: Uppercase | Lowercase | Special */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '4px',
        backgroundColor: 'var(--bg-input)',
        padding: '3px',
        borderRadius: '6px'
      }}>
        <button
          onClick={() => setActiveCategoryTab('uppercase')}
          style={{
            border: 'none',
            borderRadius: '4px',
            padding: '5px 4px',
            fontSize: '11px',
            cursor: 'pointer',
            backgroundColor: activeCategoryTab === 'uppercase' ? 'var(--accent)' : 'transparent',
            color: activeCategoryTab === 'uppercase' ? '#fff' : 'var(--text-muted)',
            fontWeight: activeCategoryTab === 'uppercase' ? 600 : 400,
            textAlign: 'center'
          }}
        >
          Uppercase ({uppercaseChars.length - upperMissing.length}/{uppercaseChars.length})
        </button>

        <button
          onClick={() => setActiveCategoryTab('lowercase')}
          style={{
            border: 'none',
            borderRadius: '4px',
            padding: '5px 4px',
            fontSize: '11px',
            cursor: 'pointer',
            backgroundColor: activeCategoryTab === 'lowercase' ? 'var(--accent)' : 'transparent',
            color: activeCategoryTab === 'lowercase' ? '#fff' : 'var(--text-muted)',
            fontWeight: activeCategoryTab === 'lowercase' ? 600 : 400,
            textAlign: 'center'
          }}
        >
          Lowercase ({lowercaseChars.length - lowerMissing.length}/{lowercaseChars.length})
        </button>

        <button
          onClick={() => setActiveCategoryTab('special')}
          style={{
            border: 'none',
            borderRadius: '4px',
            padding: '5px 4px',
            fontSize: '11px',
            cursor: 'pointer',
            backgroundColor: activeCategoryTab === 'special' ? 'var(--accent)' : 'transparent',
            color: activeCategoryTab === 'special' ? '#fff' : 'var(--text-muted)',
            fontWeight: activeCategoryTab === 'special' ? 600 : 400,
            textAlign: 'center'
          }}
        >
          Special ({specialChars.length - specialMissing.length}/{specialChars.length})
        </button>
      </div>

      {/* Copy Uppercase <-> Lowercase Buttons */}
      <div style={{
        display: 'flex',
        gap: '6px',
        backgroundColor: 'var(--bg-surface)',
        padding: '8px',
        borderRadius: '6px'
      }}>
        <button
          className="btn-secondary"
          onClick={() => onCopyCase('upper-to-lower')}
          style={{ flex: 1, fontSize: '10px', padding: '5px 8px', justifyContent: 'center' }}
          title="Copy all assigned uppercase characters into lowercase"
        >
          <Copy size={11} />
          <span>Copy Upper → Lower</span>
        </button>

        <button
          className="btn-secondary"
          onClick={() => onCopyCase('lower-to-upper')}
          style={{ flex: 1, fontSize: '10px', padding: '5px 8px', justifyContent: 'center' }}
          title="Copy all assigned lowercase characters into uppercase"
        >
          <Copy size={11} />
          <span>Copy Lower → Upper</span>
        </button>
      </div>

      {/* Clickable Character Pills */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
          {selectedBox 
            ? `Click character to re-assign selected box #${selectedBox.char}:` 
            : 'Select target character for next box:'}
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          maxHeight: '125px',
          overflowY: 'auto',
          padding: '2px'
        }}>
          {activeCategoryChars.map(char => {
            const isAssignedInProject = assignedInProjectChars.has(char);
            const isDefinedInCurrent = definedInCurrentBoxes.has(char);
            const isNextTarget = nextTargetChar === char;
            const isSelectedBoxChar = selectedBox?.char === char;

            let bg = 'rgba(255, 255, 255, 0.05)';
            let color = 'var(--text-faint)';
            let border = '1px solid var(--border)';

            if (isSelectedBoxChar) {
              bg = 'var(--accent)';
              color = '#ffffff';
              border = '2px solid #818cf8';
            } else if (isAssignedInProject) {
              bg = 'rgba(16, 185, 129, 0.15)';
              color = '#6ee7b7';
              border = '1px solid rgba(16, 185, 129, 0.3)';
            } else if (isDefinedInCurrent) {
              bg = 'rgba(99, 102, 241, 0.2)';
              color = '#a5b4fc';
              border = '1px solid rgba(99, 102, 241, 0.4)';
            } else if (isNextTarget) {
              bg = 'rgba(99, 102, 241, 0.35)';
              color = '#ffffff';
              border = '1px dashed #a5b4fc';
            }

            return (
              <button
                key={char}
                onClick={() => onPickChar(char)}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: bg,
                  color: color,
                  border: border,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.1s'
                }}
                title={
                  isAssignedInProject 
                    ? `Glyph '${char}' is saved in font project` 
                    : isDefinedInCurrent 
                      ? `Glyph '${char}' is framed on this image` 
                      : `Assign to '${char}'`
                }
              >
                {char}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
