import React, { useState } from 'react';
import { Trash2, AlertTriangle, Check, Minus, Plus, RefreshCw } from 'lucide-react';
import { GlyphBox, ConflictInfo } from './types';

interface BoxInspectorProps {
  selectedBox: GlyphBox;
  selectedBoxCrop: string | null;
  onUpdateBoxChar: (newChar: string) => void;
  onAdjustDimensions: (dx: number, dy: number, dw: number, dh: number) => void;
  onDeleteBox: (id: string) => void;
  conflictInfo: ConflictInfo | null;
  onResolveConflict: (char: string) => void;
}

export const BoxInspector: React.FC<BoxInspectorProps> = ({
  selectedBox,
  selectedBoxCrop,
  onUpdateBoxChar,
  onAdjustDimensions,
  onDeleteBox,
  conflictInfo,
  onResolveConflict,
}) => {
  const [typedChar, setTypedChar] = useState(selectedBox.char);

  // Sync internal input when selectedBox changes
  React.useEffect(() => {
    setTypedChar(selectedBox.char);
  }, [selectedBox.id, selectedBox.char]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTypedChar(val);
    if (val.trim()) {
      onUpdateBoxChar(val.trim());
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600 }}>Selected Box Inspector</h4>
        <button
          className="btn-ghost"
          onClick={() => onDeleteBox(selectedBox.id)}
          title="Delete this box (Shortcut: Backspace / Delete / Return)"
          style={{ color: 'var(--danger)', padding: '2px 6px', fontSize: '11px' }}
        >
          <Trash2 size={12} />
          <span>Delete (Backspace / Return)</span>
        </button>
      </div>

      {/* Conflict Error / Warning Alert */}
      {conflictInfo && conflictInfo.hasConflict && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '6px',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          color: '#fca5a5',
          fontSize: '11px',
          lineHeight: 1.4
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <AlertTriangle size={15} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Reassignment Conflict:</strong> Letter '<strong>{conflictInfo.char}</strong>' already has an assigned glyph{' '}
              {conflictInfo.location === 'current_image' ? 'on this image' : 'in the font project'}.
              <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                You need to delete the existing '{conflictInfo.char}' glyph first before assigning this box to it.
              </div>
            </div>
          </div>

          <button
            className="btn-secondary"
            onClick={() => onResolveConflict(conflictInfo.char)}
            style={{
              fontSize: '10px',
              padding: '4px 8px',
              backgroundColor: 'rgba(239, 68, 68, 0.25)',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: '#ffffff',
              alignSelf: 'flex-start'
            }}
          >
            <RefreshCw size={11} />
            <span>Delete existing '{conflictInfo.char}' & reassign here</span>
          </button>
        </div>
      )}

      {/* Character Assignment Field & Preview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Assigned Letter
          </label>
          <input
            type="text"
            maxLength={2}
            value={typedChar}
            onChange={handleInputChange}
            style={{
              width: '60px',
              textAlign: 'center',
              fontSize: '18px',
              fontWeight: 700,
              color: conflictInfo?.hasConflict ? 'var(--danger)' : 'var(--accent)',
              borderColor: conflictInfo?.hasConflict ? 'var(--danger)' : undefined
            }}
          />
        </div>

        {/* Cropped Preview */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-faint)', marginBottom: '3px' }}>Cropped Ink Preview</span>
          <div style={{
            width: '75px',
            height: '65px',
            backgroundColor: '#ffffff',
            borderRadius: '4px',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            {selectedBoxCrop && (
              <img src={selectedBoxCrop} alt={selectedBox.char} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
            )}
          </div>
        </div>
      </div>

      {/* Direct Width & Height Resizing Controls */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '6px',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Box Dimensions & Nudge (or drag handles on canvas):
        </span>

        {/* Width */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
          <span style={{ color: 'var(--text-faint)' }}>Width: {selectedBox.width} px</span>
          <div style={{ display: 'flex', gap: '3px' }}>
            <button className="btn-secondary" onClick={() => onAdjustDimensions(0, 0, -2, 0)} style={{ padding: '2px 6px', fontSize: '10px' }} title="Shrink width -2px">
              <Minus size={10} />
            </button>
            <button className="btn-secondary" onClick={() => onAdjustDimensions(0, 0, 2, 0)} style={{ padding: '2px 6px', fontSize: '10px' }} title="Expand width +2px">
              <Plus size={10} />
            </button>
          </div>
        </div>

        {/* Height */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
          <span style={{ color: 'var(--text-faint)' }}>Height: {selectedBox.height} px</span>
          <div style={{ display: 'flex', gap: '3px' }}>
            <button className="btn-secondary" onClick={() => onAdjustDimensions(0, 0, 0, -2)} style={{ padding: '2px 6px', fontSize: '10px' }} title="Shrink height -2px">
              <Minus size={10} />
            </button>
            <button className="btn-secondary" onClick={() => onAdjustDimensions(0, 0, 0, 2)} style={{ padding: '2px 6px', fontSize: '10px' }} title="Expand height +2px">
              <Plus size={10} />
            </button>
          </div>
        </div>

        {/* Position Nudge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
          <span style={{ color: 'var(--text-faint)' }}>Position: {selectedBox.x}, {selectedBox.y}</span>
          <div style={{ display: 'flex', gap: '2px' }}>
            <button className="btn-secondary" onClick={() => onAdjustDimensions(-2, 0, 0, 0)} style={{ padding: '2px 5px', fontSize: '10px' }}>←</button>
            <button className="btn-secondary" onClick={() => onAdjustDimensions(2, 0, 0, 0)} style={{ padding: '2px 5px', fontSize: '10px' }}>→</button>
            <button className="btn-secondary" onClick={() => onAdjustDimensions(0, -2, 0, 0)} style={{ padding: '2px 5px', fontSize: '10px' }}>↑</button>
            <button className="btn-secondary" onClick={() => onAdjustDimensions(0, 2, 0, 0)} style={{ padding: '2px 5px', fontSize: '10px' }}>↓</button>
          </div>
        </div>
      </div>
    </div>
  );
};
