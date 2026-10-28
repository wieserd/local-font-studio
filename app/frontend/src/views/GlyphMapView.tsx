import React, { useState, useMemo } from 'react';
import { Check } from 'lucide-react';
import { useFont } from '../context/FontContext';
import { GlyphFilterState, DEFAULT_FILTERS } from './glyphMap/glyphMapTypes';
import { useGlyphDragAndDrop } from './glyphMap/useGlyphDragAndDrop';
import { GlyphMapToolbar } from './glyphMap/GlyphMapToolbar';
import { DragActiveBanner } from './glyphMap/DragActiveBanner';
import { GlyphCard } from './glyphMap/GlyphCard';
import { AddGlyphTile } from './glyphMap/AddGlyphTile';
import { DragAvatar } from './glyphMap/DragAvatar';
import { ReplaceGlyphConfirmModal } from './glyphMap/ReplaceGlyphConfirmModal';
import { DeleteBitmapsConfirmModal } from './glyphMap/DeleteBitmapsConfirmModal';
import { AddGlyphsModal } from './glyphMap/AddGlyphsModal';

export type { GlyphFilterState } from './glyphMap/glyphMapTypes';

interface GlyphMapViewProps {
  onSelectGlyph: (glyphChar: string) => void;
  selectedGlyph: string;
}

export const GlyphMapView: React.FC<GlyphMapViewProps> = ({
  onSelectGlyph,
  selectedGlyph,
}) => {
  const { project, assignedCount, totalCount, copyGlyph, deleteAllBitmaps } = useFont();

  const [filters, setFilters] = useState<GlyphFilterState>(DEFAULT_FILTERS);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmDeleteBitmapsOpen, setConfirmDeleteBitmapsOpen] = useState(false);

  // Hook for hold-to-drag and drop duplicate interactions
  const {
    holdingChar,
    holdProgress,
    dragModeSource,
    cursorPos,
    hoveredTargetChar,
    confirmModal,
    setConfirmModal,
    toastMessage,
    setToastMessage,
    handleCardPointerDown,
    cancelDragMode,
  } = useGlyphDragAndDrop({
    projectGlyphs: project.glyphs,
    copyGlyph,
    onSelectGlyph,
  });

  const glyphList = useMemo(() => Object.values(project.glyphs), [project.glyphs]);
  const bitmapCount = useMemo(() => glyphList.filter(g => Boolean(g.originalImage)).length, [glyphList]);

  const filteredGlyphs = useMemo(() => {
    return glyphList.filter((g) => {
      if (search) {
        const q = search.toLowerCase();
        const matchesChar = g.char.toLowerCase().includes(q);
        const matchesUnicode = g.unicode.toLowerCase().includes(q);
        const isSpaceQuery =
          (q === 'space' || q === '␣' || q === ' ' || q === 'u+0020' || q === 'leerzeichen') &&
          g.char === ' ';
        if (!matchesChar && !matchesUnicode && !isSpaceQuery) {
          return false;
        }
      }

      // 1. Status Filter (Assigned - Missing - Bitmap)
      const hasPath = Boolean(g.isAssigned && (g.svgPath || g.char === ' '));
      if (filters.status === 'assigned' && !hasPath) return false;
      if (filters.status === 'missing' && hasPath) return false;
      if (filters.status === 'bitmap' && !g.originalImage) return false;

      // 2. Case Filter (Uppercase - Lowercase)
      if (filters.case === 'uppercase' && !/[A-Z]/.test(g.char)) return false;
      if (filters.case === 'lowercase' && !/[a-z]/.test(g.char)) return false;

      // 3. Category Filter (Letters - Numbers - Special)
      if (filters.category === 'letters' && !/[a-zA-Z]/.test(g.char)) return false;
      if (filters.category === 'numbers' && !/[0-9]/.test(g.char)) return false;
      if (filters.category === 'special' && /[a-zA-Z0-9]/.test(g.char)) return false;

      return true;
    });
  }, [glyphList, search, filters]);

  const visibleBitmapsCount = useMemo(
    () => filteredGlyphs.filter((g) => Boolean(g.originalImage)).length,
    [filteredGlyphs]
  );
  const showDeleteBitmaps = filters.status === 'bitmap' && visibleBitmapsCount > 0;

  const sourceGlyphObj = dragModeSource ? project.glyphs[dragModeSource] : undefined;
  const hoveredTargetGlyphObj = hoveredTargetChar ? project.glyphs[hoveredTargetChar] : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px', gap: '14px', position: 'relative' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'absolute',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          backgroundColor: '#10b981',
          color: '#ffffff',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <Check size={14} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Toolbar / Filter Header */}
      <GlyphMapToolbar
        search={search}
        setSearch={setSearch}
        filters={filters}
        setFilters={setFilters}
        filteredCount={filteredGlyphs.length}
        totalCount={totalCount}
        assignedCount={assignedCount}
        bitmapCount={bitmapCount}
        visibleBitmapsCount={visibleBitmapsCount}
        showDeleteBitmaps={showDeleteBitmaps}
        onOpenDeleteBitmaps={() => setConfirmDeleteBitmapsOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Active Drag Banner Prompt */}
      {dragModeSource && (
        <DragActiveBanner
          sourceChar={dragModeSource}
          onCancel={cancelDragMode}
        />
      )}

      {/* Glyph Grid Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        backgroundColor: 'var(--bg-sidebar)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px',
        position: 'relative'
      }}>
        {filteredGlyphs.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '240px',
            color: 'var(--text-muted)',
            gap: '12px'
          }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              No glyphs match the selected filter combination
            </div>
            <button
              onClick={() => {
                setFilters(DEFAULT_FILTERS);
                setSearch('');
              }}
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '5px 12px' }}
            >
              Reset Filters to All
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
            gap: '10px'
          }}>
            {filteredGlyphs.map((g) => (
              <GlyphCard
                key={g.char}
                glyph={g}
                isSelected={selectedGlyph === g.char}
                isHolding={holdingChar === g.char}
                holdProgress={holdProgress}
                isCurrentSource={dragModeSource === g.char}
                isCurrentHoverTarget={hoveredTargetChar === g.char}
                dragModeSource={dragModeSource}
                onPointerDown={handleCardPointerDown}
              />
            ))}

            {/* Interactive "Add Glyph" Tile */}
            <AddGlyphTile onClick={() => setIsAddModalOpen(true)} />
          </div>
        )}
      </div>

      {/* Floating Drag Avatar Following Cursor */}
      {dragModeSource && (
        <DragAvatar
          sourceChar={dragModeSource}
          sourceGlyph={sourceGlyphObj}
          cursorPos={cursorPos}
          hoveredTargetChar={hoveredTargetChar}
          targetGlyph={hoveredTargetGlyphObj}
        />
      )}

      {/* Overwrite Confirmation Dialog Modal */}
      <ReplaceGlyphConfirmModal
        confirmModal={confirmModal}
        glyphs={project.glyphs}
        onCancel={() => setConfirmModal(null)}
        onConfirm={(sourceChar, targetChar) => {
          copyGlyph(sourceChar, targetChar);
          setToastMessage(`Replaced glyph '${targetChar}' with artwork from '${sourceChar}'`);
          setConfirmModal(null);
        }}
      />

      {/* Add Glyphs & Presets Modal */}
      <AddGlyphsModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onGlyphsAdded={(_count, summary) => setToastMessage(summary)}
      />

      {/* Confirm Delete All Bitmaps Modal */}
      <DeleteBitmapsConfirmModal
        isOpen={confirmDeleteBitmapsOpen}
        visibleBitmapsCount={visibleBitmapsCount}
        onClose={() => setConfirmDeleteBitmapsOpen(false)}
        onConfirmDelete={() => {
          const targetChars = filteredGlyphs
            .filter((g) => Boolean(g.originalImage))
            .map((g) => g.char);
          const deleted = deleteAllBitmaps(targetChars);
          setToastMessage(`Deleted bitmaps from ${deleted} glyph${deleted > 1 ? 's' : ''}`);
          setConfirmDeleteBitmapsOpen(false);
        }}
      />
    </div>
  );
};
