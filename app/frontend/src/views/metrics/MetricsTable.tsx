import React from 'react';
import { Search, Plus, Minus, AlignCenter, RotateCcw, Sparkles } from 'lucide-react';
import { GlyphMetricData, CategoryFilter } from './types';

interface MetricsTableProps {
  filteredGlyphs: GlyphMetricData[];
  counts: { all: number; uppercase: number; lowercase: number; numbers: number; symbols: number; assigned: number };
  categoryFilter: CategoryFilter;
  setCategoryFilter: (v: CategoryFilter) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  spaceWidth: number;
  testString: string;
  setTestString: (v: string | ((prev: string) => string)) => void;
  showToast: (msg: string) => void;
  upm: number;
  ascender: number;
  descender: number;
  handleUpdateAdvance: (char: string, val: number) => void;
  handleUpdateLsb: (char: string, val: number) => void;
  handleUpdateRsb: (char: string, val: number) => void;
  handleAutoCenterGlyph: (char: string) => void;
  handleBatchAdjustAdvance: (delta: number) => void;
  handleBatchAutoCenter: () => void;
  handleBatchResetToDefaults: () => void;
  onOpenAutoSpaceModal: () => void;
}

export const MetricsTable: React.FC<MetricsTableProps> = ({
  filteredGlyphs,
  counts,
  categoryFilter,
  setCategoryFilter,
  searchQuery,
  setSearchQuery,
  spaceWidth,
  testString,
  setTestString,
  showToast,
  upm,
  ascender,
  descender,
  handleUpdateAdvance,
  handleUpdateLsb,
  handleUpdateRsb,
  handleAutoCenterGlyph,
  handleBatchAdjustAdvance,
  handleBatchAutoCenter,
  handleBatchResetToDefaults,
  onOpenAutoSpaceModal
}) => {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-main)'
    }}>
      {/* Filter & Batch Toolbar */}
      <div style={{
        padding: '10px 16px',
        backgroundColor: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          {/* Category Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {[
              { id: 'all', label: 'All', count: counts.all },
              { id: 'uppercase', label: 'Uppercase', count: counts.uppercase },
              { id: 'lowercase', label: 'Lowercase', count: counts.lowercase },
              { id: 'numbers', label: 'Numbers', count: counts.numbers },
              { id: 'symbols', label: 'Symbols', count: counts.symbols },
              { id: 'assigned', label: 'Assigned', count: counts.assigned },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id as CategoryFilter)}
                style={{
                  padding: '4px 9px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: categoryFilter === tab.id ? 'var(--accent)' : 'var(--border)',
                  backgroundColor: categoryFilter === tab.id ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                  color: categoryFilter === tab.id ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {tab.label} <span style={{ opacity: 0.65, fontSize: '10px' }}>({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input
              type="text"
              placeholder="Search glyph or U+..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '4px 8px 4px 26px',
                fontSize: '11px',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>

        {/* Batch Action Toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '6px',
          borderTop: '1px solid var(--border)',
          fontSize: '11px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-faint)', fontWeight: 600 }}>Batch Actions ({filteredGlyphs.length} glyphs):</span>
            <button
              className="btn-secondary"
              onClick={() => handleBatchAdjustAdvance(10)}
              style={{ padding: '3px 8px', fontSize: '11px', gap: '3px' }}
              title="Add 10 units of advance width to all filtered glyphs"
            >
              <Plus size={11} /> 10 Adv
            </button>
            <button
              className="btn-secondary"
              onClick={() => handleBatchAdjustAdvance(-10)}
              style={{ padding: '3px 8px', fontSize: '11px', gap: '3px' }}
              title="Subtract 10 units of advance width from all filtered glyphs"
            >
              <Minus size={11} /> 10 Adv
            </button>
            <button
              className="btn-secondary"
              onClick={handleBatchAutoCenter}
              style={{ padding: '3px 8px', fontSize: '11px', gap: '4px' }}
              title="Balance sidebearings (LSB = RSB) for all filtered glyphs"
            >
              <AlignCenter size={11} color="var(--accent)" /> Auto-Center All
            </button>
            <button
              className="btn-secondary"
              onClick={onOpenAutoSpaceModal}
              style={{
                padding: '3px 10px',
                fontSize: '11px',
                gap: '5px',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                borderColor: 'var(--accent)',
                color: 'var(--accent)',
                fontWeight: 600
              }}
              title="Calculate optically balanced sidebearings based on stem, curve, and diagonal silhouettes"
            >
              <Sparkles size={12} color="var(--accent)" /> Optical Auto-Space...
            </button>
            <button
              className="btn-secondary"
              onClick={handleBatchResetToDefaults}
              style={{ padding: '3px 8px', fontSize: '11px', gap: '4px' }}
              title="Reset all filtered glyphs to default sidebearings"
            >
              <RotateCcw size={11} /> Reset Defaults
            </button>
          </div>

          <span style={{ color: 'var(--text-faint)' }}>
            Showing {filteredGlyphs.length} glyphs
          </span>
        </div>
      </div>

      {/* Table Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px 12px', width: '50px' }}>Glyph</th>
                <th style={{ padding: '8px 12px' }}>Name / Unicode</th>
                <th style={{ padding: '8px 12px', width: '150px' }}>Advance Width</th>
                <th style={{ padding: '8px 12px', width: '130px' }}>LSB</th>
                <th style={{ padding: '8px 12px', width: '90px' }}>Artwork</th>
                <th style={{ padding: '8px 12px', width: '130px' }}>RSB</th>
                <th style={{ padding: '8px 12px', width: '100px' }}>Action</th>
                <th style={{ padding: '8px 12px', width: '100px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Prominent Sticky Word Space Row */}
              <tr style={{
                borderBottom: '2px solid var(--accent)',
                backgroundColor: 'rgba(99, 102, 241, 0.08)'
              }}>
                <td style={{ padding: '8px 12px', fontWeight: 700, fontSize: '18px', color: 'var(--accent)' }}>
                  ␣
                </td>
                <td style={{ padding: '8px 12px', fontWeight: 600 }}>
                  Word Space <span style={{ color: 'var(--text-faint)', fontSize: '11px' }}>(U+0020)</span>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => handleUpdateAdvance(' ', spaceWidth - 10)}
                      style={{ padding: '2px 5px', borderRadius: '4px 0 0 4px', height: '24px' }}
                    >
                      <Minus size={11} />
                    </button>
                    <input
                      type="number"
                      value={spaceWidth}
                      onChange={(e) => handleUpdateAdvance(' ', Number(e.target.value))}
                      style={{
                        width: '56px',
                        height: '24px',
                        borderRadius: 0,
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: 0
                      }}
                    />
                    <button
                      className="btn-secondary"
                      onClick={() => handleUpdateAdvance(' ', spaceWidth + 10)}
                      style={{ padding: '2px 5px', borderRadius: '0 4px 4px 0', height: '24px' }}
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                </td>
                <td style={{ padding: '8px 12px', color: 'var(--text-faint)' }}>0</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-faint)' }}>—</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-faint)' }}>0</td>
                <td style={{ padding: '8px 12px' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setTestString(prev => prev + ' ');
                      showToast('Appended space to rhythm string');
                    }}
                    style={{ padding: '2px 8px', fontSize: '10px' }}
                  >
                    + Test String
                  </button>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <span className="badge badge-indigo">Word Spacer</span>
                </td>
              </tr>

              {/* Glyphs Rows */}
              {filteredGlyphs.map((item) => {
                return (
                  <tr
                    key={item.char}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      backgroundColor: testString.includes(item.char) ? 'rgba(255, 255, 255, 0.015)' : undefined
                    }}
                  >
                    {/* Miniature Glyph SVG or Text preview */}
                    <td style={{ padding: '6px 12px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: '4px',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        {item.hasArtwork ? (
                          <svg width="22" height="22" viewBox={`0 ${descender} ${item.advanceWidth} ${upm}`}>
                            <g transform={`scale(1, -1) translate(0, ${-upm + ascender})`}>
                              <path d={item.glyph.svgPath} fill="#f8fafc" />
                            </g>
                          </svg>
                        ) : (
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-faint)' }}>
                            {item.char}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Name & Unicode */}
                    <td style={{ padding: '6px 12px' }}>
                      <div style={{ fontWeight: 600, fontSize: '12px' }}>{item.glyph.name}</div>
                      <div style={{ color: 'var(--text-faint)', fontSize: '10px' }}>{item.glyph.unicode}</div>
                    </td>

                    {/* Editable Advance Width with +/- */}
                    <td style={{ padding: '6px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button
                          className="btn-secondary"
                          onClick={() => handleUpdateAdvance(item.char, item.advanceWidth - 10)}
                          style={{ padding: '2px 5px', borderRadius: '4px 0 0 4px', height: '24px' }}
                        >
                          <Minus size={11} />
                        </button>
                        <input
                          type="number"
                          value={item.advanceWidth}
                          onChange={(e) => handleUpdateAdvance(item.char, Number(e.target.value))}
                          style={{
                            width: '56px',
                            height: '24px',
                            borderRadius: 0,
                            textAlign: 'center',
                            fontSize: '12px',
                            fontWeight: 700,
                            padding: 0
                          }}
                        />
                        <button
                          className="btn-secondary"
                          onClick={() => handleUpdateAdvance(item.char, item.advanceWidth + 10)}
                          style={{ padding: '2px 5px', borderRadius: '0 4px 4px 0', height: '24px' }}
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </td>

                    {/* Editable LSB */}
                    <td style={{ padding: '6px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button
                          className="btn-secondary"
                          onClick={() => handleUpdateLsb(item.char, item.lsb - 5)}
                          style={{ padding: '2px 5px', borderRadius: '4px 0 0 4px', height: '24px' }}
                        >
                          <Minus size={11} />
                        </button>
                        <input
                          type="number"
                          value={item.lsb}
                          onChange={(e) => handleUpdateLsb(item.char, Number(e.target.value))}
                          style={{
                            width: '46px',
                            height: '24px',
                            borderRadius: 0,
                            textAlign: 'center',
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: 0
                          }}
                        />
                        <button
                          className="btn-secondary"
                          onClick={() => handleUpdateLsb(item.char, item.lsb + 5)}
                          style={{ padding: '2px 5px', borderRadius: '0 4px 4px 0', height: '24px' }}
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </td>

                    {/* Artwork Width */}
                    <td style={{ padding: '6px 12px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {item.hasArtwork ? `${item.artworkWidth}` : '—'}
                    </td>

                    {/* Editable RSB */}
                    <td style={{ padding: '6px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button
                          className="btn-secondary"
                          onClick={() => handleUpdateRsb(item.char, item.rsb - 5)}
                          style={{ padding: '2px 5px', borderRadius: '4px 0 0 4px', height: '24px' }}
                        >
                          <Minus size={11} />
                        </button>
                        <input
                          type="number"
                          value={item.rsb}
                          onChange={(e) => handleUpdateRsb(item.char, Number(e.target.value))}
                          style={{
                            width: '46px',
                            height: '24px',
                            borderRadius: 0,
                            textAlign: 'center',
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: 0
                          }}
                        />
                        <button
                          className="btn-secondary"
                          onClick={() => handleUpdateRsb(item.char, item.rsb + 5)}
                          style={{ padding: '2px 5px', borderRadius: '0 4px 4px 0', height: '24px' }}
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </td>

                    {/* Row Action: Auto-Center */}
                    <td style={{ padding: '6px 12px' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => handleAutoCenterGlyph(item.char)}
                        style={{ padding: '3px 8px', fontSize: '10px', gap: '4px' }}
                        title="Center vector artwork inside advance width"
                      >
                        <AlignCenter size={11} color="var(--accent)" />
                        <span>Center</span>
                      </button>
                    </td>

                    {/* Status badge */}
                    <td style={{ padding: '6px 12px' }}>
                      {item.hasArtwork ? (
                        <span className="badge badge-green" style={{ fontSize: '10px' }}>Vector</span>
                      ) : (
                        <span className="badge badge-gray" style={{ fontSize: '10px' }}>Blank</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
