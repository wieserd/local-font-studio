import React, { useState } from 'react';
import { Plus, Trash2, Search, Layers, Sparkles, MoveHorizontal, ArrowLeftRight } from 'lucide-react';
import { KerningPair, Glyph, FontMetrics } from '../../types/font';
import { StandardSidebar, SidebarSection, useSidebarAccordion } from '../../components/sidebar';

interface KerningPairsSidebarProps {
  kerningPairs: KerningPair[];
  selectedPairKey: string; // "A:V"
  onSelectPair: (left: string, right: string) => void;
  onDeletePair: (left: string, right: string) => void;
  onOpenAddModal: () => void;
  onAddCommonPresets: () => void;
  onAddBatchPairs?: (pairs: Array<{ left: string; right: string; value: number }>) => void;
  onClearAllPairs?: () => void;
  onApplyClassKerning?: (baseLeft: string, classMembers: string[], value: number) => void;
  glyphs: Record<string, Glyph>;
  metrics: FontMetrics;
  onSwapPair?: () => void;
  activeKerningValue?: number;
}

const KERNING_CLASSES = [
  { id: 'round_caps', name: '@Round_Caps', members: ['O', 'C', 'G', 'Q'], desc: 'Curved bowl capitals' },
  { id: 'diagonal_caps', name: '@Diagonal_Caps', members: ['A', 'V', 'W', 'Y'], desc: 'Diagonal capitals' },
  { id: 'open_caps', name: '@Open_Caps', members: ['T', 'F', 'L', 'P'], desc: 'Overhanging arm capitals' },
  { id: 'round_lower', name: '@Round_Lower', members: ['o', 'c', 'd', 'e', 'q'], desc: 'Curved lowercase' },
  { id: 'diagonals_lower', name: '@Diagonals_Lower', members: ['v', 'w', 'y', 'x'], desc: 'Diagonal lowercase' },
  { id: 'punct', name: '@Punctuation', members: ['.', ',', ':', ';', '!', '?'], desc: 'Baseline punctuation' },
];

export const MAJOR_CAPS_PAIRS = [
  { left: 'A', right: 'V', value: -60 },
  { left: 'A', right: 'W', value: -45 },
  { left: 'A', right: 'Y', value: -55 },
  { left: 'A', right: 'T', value: -50 },
  { left: 'V', right: 'A', value: -60 },
  { left: 'W', right: 'A', value: -45 },
  { left: 'Y', right: 'A', value: -55 },
  { left: 'T', right: 'A', value: -50 },
  { left: 'T', right: 'O', value: -35 },
  { left: 'P', right: 'A', value: -40 },
  { left: 'F', right: 'A', value: -35 },
  { left: 'L', right: 'T', value: -50 },
  { left: 'L', right: 'V', value: -40 },
  { left: 'L', right: 'W', value: -35 },
  { left: 'L', right: 'Y', value: -45 },
];

export const CAP_LOWER_PAIRS = [
  { left: 'T', right: 'a', value: -40 },
  { left: 'T', right: 'e', value: -35 },
  { left: 'T', right: 'o', value: -45 },
  { left: 'T', right: 'r', value: -30 },
  { left: 'T', right: 'u', value: -35 },
  { left: 'T', right: 'y', value: -40 },
  { left: 'W', right: 'a', value: -30 },
  { left: 'W', right: 'e', value: -25 },
  { left: 'W', right: 'o', value: -30 },
  { left: 'Y', right: 'a', value: -45 },
  { left: 'Y', right: 'e', value: -45 },
  { left: 'Y', right: 'o', value: -55 },
  { left: 'F', right: 'a', value: -25 },
  { left: 'F', right: 'o', value: -30 },
  { left: 'P', right: 'a', value: -20 },
];

export const PUNCTUATION_PAIRS = [
  { left: 'A', right: '.', value: -50 },
  { left: 'A', right: ',', value: -50 },
  { left: 'T', right: '.', value: -60 },
  { left: 'T', right: ',', value: -60 },
  { left: 'P', right: '.', value: -70 },
  { left: 'P', right: ',', value: -70 },
  { left: 'Y', right: '.', value: -65 },
  { left: 'Y', right: ',', value: -65 },
  { left: 'V', right: '.', value: -65 },
  { left: 'V', right: ',', value: -65 },
  { left: 'W', right: '.', value: -55 },
  { left: 'W', right: ',', value: -55 },
  { left: 'F', right: '.', value: -60 },
  { left: 'L', right: '.', value: -30 },
];

type KerningSectionId = 'inspector' | 'directory' | 'classes' | 'presets';

export const KerningPairsSidebar: React.FC<KerningPairsSidebarProps> = ({
  kerningPairs,
  selectedPairKey,
  onSelectPair,
  onDeletePair,
  onOpenAddModal,
  onAddCommonPresets,
  onAddBatchPairs,
  onClearAllPairs,
  onApplyClassKerning,
  glyphs,
  metrics,
  onSwapPair,
  activeKerningValue = 0
}) => {
  const [search, setSearch] = useState('');

  const { toggleSection, expandAll, collapseAll, isOpen } = useSidebarAccordion<KerningSectionId>({
    inspector: true,
    directory: true,
    classes: false,
    presets: false
  });

  const [leftChar, rightChar] = selectedPairKey.split(':');

  // Filter pairs
  const filteredPairs = kerningPairs.filter((p) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      p.left.toLowerCase().includes(q) ||
      p.right.toLowerCase().includes(q) ||
      `${p.left}${p.right}`.toLowerCase().includes(q)
    );
  });

  const upm = metrics.upm || 1000;
  const miniScale = 22 / upm;
  const miniBaseline = (metrics.ascender || 800) * miniScale;

  return (
    <StandardSidebar
      title="Kerning (GPOS)"
      subtitle={`${kerningPairs.length} pair${kerningPairs.length === 1 ? '' : 's'} compiled into font`}
      icon={<MoveHorizontal size={15} color="var(--accent)" />}
      onExpandAll={expandAll}
      onCollapseAll={collapseAll}
      headerAction={
        <button
          onClick={onOpenAddModal}
          className="btn-primary"
          style={{ padding: '3px 8px', fontSize: '10px', gap: '3px' }}
        >
          <Plus size={11} />
          <span>Add</span>
        </button>
      }
    >
      {/* 1. ACTIVE PAIR INSPECTOR */}
      {leftChar && rightChar && (
        <SidebarSection
          title="1. Active Pair Inspector"
          icon={<Sparkles size={13} color="var(--accent)" />}
          badge={`${leftChar}${rightChar} • ${activeKerningValue > 0 ? `+${activeKerningValue}` : activeKerningValue}u`}
          isOpen={isOpen('inspector')}
          onToggle={() => toggleSection('inspector')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Selected Pair</span>
              <span style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-main)' }}>
                {leftChar} + {rightChar}
              </span>
            </div>
            {onSwapPair && (
              <button
                className="btn-secondary"
                onClick={onSwapPair}
                style={{ fontSize: '10px', padding: '3px 8px', gap: '4px' }}
                title="Swap Pair Order"
              >
                <ArrowLeftRight size={11} />
                <span>Swap ({rightChar}{leftChar})</span>
              </button>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
            backgroundColor: 'var(--bg-surface)',
            padding: '8px',
            borderRadius: '6px',
            fontSize: '11px'
          }}>
            <div>
              <span style={{ color: 'var(--text-faint)', display: 'block', fontSize: '9px' }}>Left Advance</span>
              <span style={{ fontWeight: 600 }}>{glyphs[leftChar]?.advanceWidth || metrics.defaultAdvance} u</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-faint)', display: 'block', fontSize: '9px' }}>Right Advance</span>
              <span style={{ fontWeight: 600 }}>{glyphs[rightChar]?.advanceWidth || metrics.defaultAdvance} u</span>
            </div>
          </div>
        </SidebarSection>
      )}

      {/* 2. KERNING PAIRS DIRECTORY */}
      <SidebarSection
        title="2. Kerning Pairs Directory"
        icon={<MoveHorizontal size={13} color="var(--accent)" />}
        badge={`${kerningPairs.length} pairs`}
        isOpen={isOpen('directory')}
        onToggle={() => toggleSection('directory')}
      >
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pair (e.g. AV, To)..."
            style={{
              width: '100%',
              padding: '4px 6px 4px 24px',
              fontSize: '11px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text-main)'
            }}
          />
        </div>

        {/* Pairs List Container */}
        <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {filteredPairs.length === 0 ? (
            <div style={{ padding: '14px 8px', textAlign: 'center', color: 'var(--text-faint)', fontSize: '11px' }}>
              No pairs found.
            </div>
          ) : (
            filteredPairs.map((p) => {
              const key = `${p.left}:${p.right}`;
              const isSelected = selectedPairKey === key;
              const leftG = glyphs[p.left];
              const rightG = glyphs[p.right];

              return (
                <div
                  key={key}
                  onClick={() => onSelectPair(p.left, p.right)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: '5px',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface)',
                    border: isSelected ? '1px solid var(--accent)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.12s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Mini SVG vector preview */}
                    <div style={{
                      width: '32px',
                      height: '24px',
                      backgroundColor: 'var(--bg-app)',
                      borderRadius: '3px',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      <svg width="30" height="22" style={{ overflow: 'visible' }}>
                        {leftG?.svgPath ? (
                          <g transform={`translate(2, ${miniBaseline}) scale(${miniScale}, ${-miniScale})`}>
                            <path d={leftG.svgPath} fill={isSelected ? 'var(--accent)' : 'var(--text-main)'} />
                          </g>
                        ) : (
                          <text x="2" y="16" fill="var(--text-faint)" fontSize="11" fontFamily="monospace">{p.left}</text>
                        )}

                        {rightG?.svgPath ? (
                          <g transform={`translate(15, ${miniBaseline}) scale(${miniScale}, ${-miniScale})`}>
                            <path d={rightG.svgPath} fill={isSelected ? 'var(--accent)' : 'var(--text-main)'} />
                          </g>
                        ) : (
                          <text x="15" y="16" fill="var(--text-faint)" fontSize="11" fontFamily="monospace">{p.right}</text>
                        )}
                      </svg>
                    </div>

                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'monospace' }}>
                        {p.left}{p.right}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: '3px',
                      backgroundColor: p.value < 0 ? 'rgba(99, 102, 241, 0.2)' : (p.value > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)'),
                      color: p.value < 0 ? '#818cf8' : (p.value > 0 ? '#34d399' : 'var(--text-muted)')
                    }}>
                      {p.value > 0 ? `+${p.value}` : p.value} u
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePair(p.left, p.right);
                      }}
                      title="Delete Pair"
                      className="btn-ghost"
                      style={{ padding: '2px', color: 'var(--text-faint)' }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SidebarSection>

      {/* 3. KERNING CLASSES */}
      <SidebarSection
        title="3. Kerning Classes (GPOS)"
        icon={<Layers size={13} color="var(--accent)" />}
        badge="Class-to-Class"
        isOpen={isOpen('classes')}
        onToggle={() => toggleSection('classes')}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
            Apply consistent optical spacing to whole glyph classes sharing left/right silhouette curves.
          </p>

          {/* Active Class Action Banner */}
          {leftChar && rightChar && (
            <div style={{
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <span style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
                Class Propagator
              </span>

              {KERNING_CLASSES.map(cls => {
                const rightMatches = cls.members.includes(rightChar);
                if (!rightMatches) return null;
                return (
                  <div key={cls.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-main)' }}>
                      '{rightChar}' belongs to <strong>{cls.name}</strong> ({cls.members.join(', ')})
                    </span>
                    {onApplyClassKerning && (
                      <button
                        onClick={() => onApplyClassKerning(leftChar, cls.members, activeKerningValue)}
                        className="btn-primary"
                        style={{ fontSize: '11px', padding: '4px 8px', justifyContent: 'center' }}
                      >
                        Apply '{leftChar}' + {cls.name} ({activeKerningValue > 0 ? `+${activeKerningValue}` : activeKerningValue}u)
                      </button>
                    )}
                  </div>
                );
              })}

              {!KERNING_CLASSES.some(c => c.members.includes(rightChar)) && (
                <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
                  Right glyph '{rightChar}' is not currently in a standard class.
                </span>
              )}
            </div>
          )}

          {/* Class Definitions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
              Available Kerning Classes
            </span>
            {KERNING_CLASSES.map(c => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '5px 8px',
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}
              >
                <div>
                  <strong style={{ color: 'var(--accent)' }}>{c.name}</strong>
                  <span style={{ fontSize: '10px', color: 'var(--text-faint)', marginLeft: '6px' }}>{c.desc}</span>
                </div>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.members.join(' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </SidebarSection>

      {/* 4. PRESETS & TOOLS */}
      <SidebarSection
        title="4. Standard Presets & Batch"
        icon={<Plus size={13} color="var(--accent)" />}
        badge="Presets"
        isOpen={isOpen('presets')}
        onToggle={() => toggleSection('presets')}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => onAddBatchPairs?.(MAJOR_CAPS_PAIRS)}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '11px', padding: '6px' }}
          >
            Add Capital Pairs (15 Pairs: AV, AW, TA, LT...)
          </button>

          <button
            onClick={() => onAddBatchPairs?.(CAP_LOWER_PAIRS)}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '11px', padding: '6px' }}
          >
            Add Cap + Lowercase (15 Pairs: Ta, Te, To, Wa, Yo...)
          </button>

          <button
            onClick={() => onAddBatchPairs?.(PUNCTUATION_PAIRS)}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '11px', padding: '6px' }}
          >
            Add Punctuation Pairs (14 Pairs: A., T., P., Y....)
          </button>

          <button
            onClick={() => {
              const assignedChars = Object.values(glyphs)
                .filter(g => g.isAssigned && g.svgPath)
                .map(g => g.char);

              const allPresets = [...MAJOR_CAPS_PAIRS, ...CAP_LOWER_PAIRS, ...PUNCTUATION_PAIRS];
              const eligible = allPresets.filter(p => assignedChars.includes(p.left) && assignedChars.includes(p.right));

              if (eligible.length > 0) {
                onAddBatchPairs?.(eligible);
              }
            }}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '11px', padding: '6px', color: 'var(--accent)' }}
          >
            Generate Pairs from Assigned Glyphs
          </button>

          {onClearAllPairs && kerningPairs.length > 0 && (
            <button
              onClick={onClearAllPairs}
              style={{
                width: '100%',
                justifyContent: 'center',
                fontSize: '11px',
                padding: '6px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                borderRadius: '5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '4px'
              }}
            >
              <Trash2 size={12} />
              <span>Clear All Pairs ({kerningPairs.length})</span>
            </button>
          )}
        </div>
      </SidebarSection>
    </StandardSidebar>
  );
};
