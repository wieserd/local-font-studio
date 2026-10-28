import React from 'react';
import { ChevronDown, ChevronRight, MousePointer, Trash2, Plus } from 'lucide-react';
import { Glyph } from '../../../types/font';
import { Point, GlyphContour, updatePointInContour, contoursToSvgPath } from '../../../utils/contourUtils';

interface NodesSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedPoint: { contourIndex: number; pointIndex: number } | null;
  setSelectedPoint: (pt: { contourIndex: number; pointIndex: number } | null) => void;
  activeSelectedPointData: { point: Point; contourIndex: number; pointIndex: number } | null;
  allPointsCount: number;
  contours: GlyphContour[];
  glyphChar: string;
  updateGlyph: (char: string, partial: Partial<Glyph>) => void;
  handleDeleteSelectedPoint: () => void;
  handleStartNewContour: () => void;
  handleTriggerScaffolding: (featureName: string) => void;
}

export const NodesSection: React.FC<NodesSectionProps> = ({
  isOpen,
  onToggle,
  selectedPoint,
  setSelectedPoint,
  activeSelectedPointData,
  allPointsCount,
  contours,
  glyphChar,
  updateGlyph,
  handleDeleteSelectedPoint,
  handleStartNewContour,
  handleTriggerScaffolding
}) => {
  return (
    <div style={{ borderRadius: '6px', overflow: 'hidden', border: selectedPoint ? '1.5px solid #f59e0b' : '1px solid var(--border)', flexShrink: 0 }}>
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          backgroundColor: selectedPoint ? 'rgba(245, 158, 11, 0.12)' : (isOpen ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-surface)'),
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isOpen ? <ChevronDown size={14} color="#f59e0b" /> : <ChevronRight size={14} color="var(--text-muted)" />}
          <MousePointer size={13} color="#f59e0b" />
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: selectedPoint ? '#f59e0b' : undefined }}>
            4. Vector Points & Nodes
          </span>
        </div>
        <span className="badge badge-gray" style={{ fontSize: '9px' }}>
          {selectedPoint ? `#${selectedPoint.pointIndex + 1}` : `${allPointsCount} pts`}
        </span>
      </div>

      {isOpen && (
        <div style={{ padding: '10px', backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {selectedPoint && activeSelectedPointData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                padding: '5px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                color: '#f59e0b',
                lineHeight: '1.4'
              }}>
                <strong>Move Point:</strong> Drag with cursor or use <strong>Arrow keys</strong> (Shift + Arrow for ±10).
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    Point X
                  </label>
                  <input
                    type="number"
                    value={activeSelectedPointData.point.x}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const updated = updatePointInContour(
                        contours,
                        selectedPoint.contourIndex,
                        selectedPoint.pointIndex,
                        { x: val, y: activeSelectedPointData.point.y }
                      );
                      updateGlyph(glyphChar, { svgPath: contoursToSvgPath(updated) });
                    }}
                    style={{ width: '100%', fontSize: '12px', padding: '4px 6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    Point Y
                  </label>
                  <input
                    type="number"
                    value={activeSelectedPointData.point.y}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const updated = updatePointInContour(
                        contours,
                        selectedPoint.contourIndex,
                        selectedPoint.pointIndex,
                        { x: activeSelectedPointData.point.x, y: val }
                      );
                      updateGlyph(glyphChar, { svgPath: contoursToSvgPath(updated) });
                    }}
                    style={{ width: '100%', fontSize: '12px', padding: '4px 6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={handleDeleteSelectedPoint}
                  style={{
                    flex: 1,
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '5px 10px',
                    fontSize: '10.5px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                  title="Delete this point (Backspace / Delete key)"
                >
                  <Trash2 size={12} />
                  <span>Delete Node</span>
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setSelectedPoint(null)}
                  style={{ fontSize: '10px', padding: '5px 8px' }}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>
                • <strong>Select Node</strong>: Click any point vertex to inspect coordinates.
                <br />
                • <strong>Move Node</strong>: Drag or use <strong>Arrow keys</strong>.
                <br />
                • <strong>Delete Node</strong>: Press <strong>Backspace</strong> or <strong>Delete</strong> key.
              </p>
              <button
                className="btn-secondary"
                onClick={handleStartNewContour}
                style={{ width: '100%', justifyContent: 'center', fontSize: '10.5px', padding: '5px 8px', gap: '5px' }}
                title="Start a new separate contour to draw strokes or shapes"
              >
                <Plus size={12} />
                <span>New Contour</span>
              </button>
            </div>
          )}

          {/* Scaffolding: Point Type Converter */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
              <span style={{ fontSize: '9.5px', fontWeight: 600, color: 'var(--text-muted)' }}>Node Type (Scaffolding)</span>
              <span className="badge badge-gray" style={{ fontSize: '8.5px' }}>Planned</span>
            </div>
            <div style={{ display: 'flex', gap: '3px' }}>
              {['Corner', 'Smooth', 'Tangent'].map(type => (
                <button
                  key={type}
                  className="btn-secondary"
                  onClick={() => handleTriggerScaffolding(`Node Type: ${type}`)}
                  style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center', opacity: 0.8 }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
