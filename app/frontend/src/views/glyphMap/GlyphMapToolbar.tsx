import React from 'react';
import { 
  Search, 
  Check, 
  Image, 
  Trash2, 
  Move, 
  Plus 
} from 'lucide-react';
import { GlyphFilterState, DEFAULT_FILTERS } from './glyphMapTypes';

interface GlyphMapToolbarProps {
  search: string;
  setSearch: (query: string) => void;
  filters: GlyphFilterState;
  setFilters: React.Dispatch<React.SetStateAction<GlyphFilterState>>;
  filteredCount: number;
  totalCount: number;
  assignedCount: number;
  bitmapCount: number;
  visibleBitmapsCount: number;
  showDeleteBitmaps: boolean;
  onOpenDeleteBitmaps: () => void;
  onOpenAddModal: () => void;
}

export const GlyphMapToolbar: React.FC<GlyphMapToolbarProps> = ({
  search,
  setSearch,
  filters,
  setFilters,
  filteredCount,
  totalCount,
  assignedCount,
  bitmapCount,
  visibleBitmapsCount,
  showDeleteBitmaps,
  onOpenDeleteBitmaps,
  onOpenAddModal,
}) => {
  const isAllSelected = filters.status === 'all' && filters.case === 'all' && filters.category === 'all';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      backgroundColor: 'var(--bg-card)',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid var(--border)'
    }}>
      {/* Search & Split Filter Groups */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-faint)' }} />
          <input
            type="text"
            placeholder="Search glyph or U+HEX..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '30px', width: '180px' }}
          />
        </div>

        {/* Reset / All Button */}
        <button
          onClick={() => setFilters(DEFAULT_FILTERS)}
          title="Reset all filters to show everything"
          style={{
            padding: '4px 10px',
            borderRadius: '5px',
            border: isAllSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
            fontSize: '11px',
            cursor: 'pointer',
            backgroundColor: isAllSelected ? 'var(--accent)' : 'var(--bg-input)',
            color: isAllSelected ? '#ffffff' : 'var(--text-muted)',
            fontWeight: isAllSelected ? 600 : 400,
            transition: 'all 0.15s ease'
          }}
        >
          All
        </button>

        <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border)', margin: '0 2px' }} />

        {/* Group 1: Assigned - Missing - Bitmap */}
        <div style={{ display: 'flex', gap: '3px', backgroundColor: 'var(--bg-input)', padding: '2px', borderRadius: '5px' }}>
          <button
            onClick={() => setFilters(f => ({ ...f, status: f.status === 'assigned' ? 'all' : 'assigned' }))}
            title="Filter: Assigned artwork"
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '11px',
              cursor: 'pointer',
              backgroundColor: filters.status === 'assigned' ? 'var(--accent)' : 'transparent',
              color: filters.status === 'assigned' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: filters.status === 'assigned' ? 600 : 400,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Check size={11} />
            <span>Assigned</span>
          </button>
          <button
            onClick={() => setFilters(f => ({ ...f, status: f.status === 'missing' ? 'all' : 'missing' }))}
            title="Filter: Missing artwork"
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '11px',
              cursor: 'pointer',
              backgroundColor: filters.status === 'missing' ? 'var(--accent)' : 'transparent',
              color: filters.status === 'missing' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: filters.status === 'missing' ? 600 : 400
            }}
          >
            <span>— Missing</span>
          </button>
          <button
            onClick={() => setFilters(f => ({ ...f, status: f.status === 'bitmap' ? 'all' : 'bitmap' }))}
            title="Filter: Glyphs with source bitmap"
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '11px',
              cursor: 'pointer',
              backgroundColor: filters.status === 'bitmap' ? 'var(--accent)' : 'transparent',
              color: filters.status === 'bitmap' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: filters.status === 'bitmap' ? 600 : 400,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Image size={11} style={{ opacity: filters.status === 'bitmap' ? 1 : 0.8 }} />
            <span>Bitmap</span>
            {bitmapCount > 0 && (
              <span style={{
                fontSize: '9px',
                padding: '0 4px',
                borderRadius: '9999px',
                backgroundColor: filters.status === 'bitmap' ? 'rgba(255,255,255,0.25)' : 'rgba(56, 189, 248, 0.2)',
                color: filters.status === 'bitmap' ? '#ffffff' : '#38bdf8',
                fontWeight: 700
              }}>
                {bitmapCount}
              </span>
            )}
          </button>

          {showDeleteBitmaps && (
            <button
              onClick={onOpenDeleteBitmaps}
              title={`Delete source bitmaps from all ${visibleBitmapsCount} visible glyphs`}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(239, 68, 68, 0.45)',
                fontSize: '11px',
                cursor: 'pointer',
                backgroundColor: 'rgba(239, 68, 68, 0.14)',
                color: '#f87171',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginLeft: '4px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.25)';
                e.currentTarget.style.borderColor = '#ef4444';
                e.currentTarget.style.boxShadow = '0 0 8px rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.14)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.45)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Trash2 size={11} />
              <span>Delete Bitmaps ({visibleBitmapsCount})</span>
            </button>
          )}
        </div>

        <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border)', margin: '0 2px' }} />

        {/* Group 2: Uppercase - Lowercase (A-Z - a-z) */}
        <div style={{ display: 'flex', gap: '3px', backgroundColor: 'var(--bg-input)', padding: '2px', borderRadius: '5px' }}>
          <button
            onClick={() => setFilters(f => ({ ...f, case: f.case === 'uppercase' ? 'all' : 'uppercase' }))}
            title="Filter: Uppercase letters (A-Z)"
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '11px',
              cursor: 'pointer',
              backgroundColor: filters.case === 'uppercase' ? 'var(--accent)' : 'transparent',
              color: filters.case === 'uppercase' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: filters.case === 'uppercase' ? 600 : 400
            }}
          >
            A-Z
          </button>
          <button
            onClick={() => setFilters(f => ({ ...f, case: f.case === 'lowercase' ? 'all' : 'lowercase' }))}
            title="Filter: Lowercase letters (a-z)"
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '11px',
              cursor: 'pointer',
              backgroundColor: filters.case === 'lowercase' ? 'var(--accent)' : 'transparent',
              color: filters.case === 'lowercase' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: filters.case === 'lowercase' ? 600 : 400
            }}
          >
            a-z
          </button>
        </div>

        <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border)', margin: '0 2px' }} />

        {/* Group 3: Letters - Numbers - Special */}
        <div style={{ display: 'flex', gap: '3px', backgroundColor: 'var(--bg-input)', padding: '2px', borderRadius: '5px' }}>
          <button
            onClick={() => setFilters(f => ({ ...f, category: f.category === 'letters' ? 'all' : 'letters' }))}
            title="Filter: Alphabetic letters"
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '11px',
              cursor: 'pointer',
              backgroundColor: filters.category === 'letters' ? 'var(--accent)' : 'transparent',
              color: filters.category === 'letters' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: filters.category === 'letters' ? 600 : 400
            }}
          >
            Letters
          </button>
          <button
            onClick={() => setFilters(f => ({ ...f, category: f.category === 'numbers' ? 'all' : 'numbers' }))}
            title="Filter: Numeric digits (0-9)"
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '11px',
              cursor: 'pointer',
              backgroundColor: filters.category === 'numbers' ? 'var(--accent)' : 'transparent',
              color: filters.category === 'numbers' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: filters.category === 'numbers' ? 600 : 400
            }}
          >
            0-9
          </button>
          <button
            onClick={() => setFilters(f => ({ ...f, category: f.category === 'special' ? 'all' : 'special' }))}
            title="Filter: Special characters & punctuation (#&?!)"
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '11px',
              cursor: 'pointer',
              backgroundColor: filters.category === 'special' ? 'var(--accent)' : 'transparent',
              color: filters.category === 'special' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: filters.category === 'special' ? 600 : 400
            }}
          >
            #&?! Special
          </button>
        </div>
      </div>

      {/* Drag Hint & Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Move size={12} style={{ color: '#f97316' }} />
          <span>Hold for 1s to drag & drop</span>
        </span>

        {filteredCount !== totalCount && (
          <span style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-input)',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid var(--border)'
          }}>
            Showing <strong style={{ color: 'var(--text-main)' }}>{filteredCount}</strong> of {totalCount}
          </span>
        )}

        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-main)' }}>{assignedCount}</strong> of {totalCount} assigned
        </span>
        <span className="badge badge-indigo">
          {Math.round((assignedCount / Math.max(1, totalCount)) * 100)}% Coverage
        </span>

        <button
          onClick={onOpenAddModal}
          className="btn-primary"
          style={{
            padding: '5px 12px',
            fontSize: '11px',
            gap: '5px',
            borderRadius: '5px',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)'
          }}
          title="Add new glyphs or language presets to this typeface"
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>Add Glyph</span>
        </button>
      </div>
    </div>
  );
};
