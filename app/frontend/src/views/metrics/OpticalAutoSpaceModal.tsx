import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { GlyphContour } from '../../utils/contourUtils';
import { GlyphOpticalProfile } from '../../utils/opticalSpacing';
import { GlyphMetricData } from './types';

export interface OpticalAutoSpaceCandidate {
  item: GlyphMetricData;
  contours: GlyphContour[];
  proposedLsb: number;
  proposedRsb: number;
  proposedAdvance: number;
  shiftX: number;
  profile: GlyphOpticalProfile;
}

interface OpticalAutoSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  basePadding: number;
  setBasePadding: (v: number) => void;
  scope: 'all' | 'uppercase' | 'lowercase' | 'numbers' | 'selection';
  setScope: (v: 'all' | 'uppercase' | 'lowercase' | 'numbers' | 'selection') => void;
  totalAssigned: number;
  filteredCount: number;
  candidates: OpticalAutoSpaceCandidate[];
  onApply: () => void;
}

export const OpticalAutoSpaceModal: React.FC<OpticalAutoSpaceModalProps> = ({
  isOpen,
  onClose,
  basePadding,
  setBasePadding,
  scope,
  setScope,
  totalAssigned,
  filteredCount,
  candidates,
  onApply
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-sidebar)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '780px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={18} color="var(--accent)" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
                Optical Auto-Spacing Assistant
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-faint)', margin: '2px 0 0 0' }}>
                Calculates optically balanced sidebearings based on stem, curve, and diagonal silhouettes.
              </p>
            </div>
          </div>
          <button
            className="btn-secondary"
            onClick={onClose}
            style={{ padding: '6px', borderRadius: '6px' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Controls Row */}
        <div style={{
          padding: '14px 20px',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Base Padding Slider & Numeric */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
              Standard Base Sidebearing:
            </span>
            <input
              type="range"
              min="15"
              max="100"
              value={basePadding}
              onChange={(e) => setBasePadding(Number(e.target.value))}
              style={{ width: '120px', cursor: 'pointer' }}
            />
            <input
              type="number"
              min="5"
              max="200"
              value={basePadding}
              onChange={(e) => setBasePadding(Math.max(5, Number(e.target.value)))}
              style={{ width: '60px', padding: '3px 6px', fontSize: '12px', fontWeight: 700, textAlign: 'center' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>units</span>
          </div>

          {/* Scope Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Scope:</span>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as any)}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                border: '1px solid var(--border)'
              }}
            >
              <option value="all">All Glyphs with Artwork ({totalAssigned})</option>
              <option value="uppercase">Uppercase Only (A-Z)</option>
              <option value="lowercase">Lowercase Only (a-z)</option>
              <option value="numbers">Numbers Only (0-9)</option>
              <option value="selection">Current Table Filter ({filteredCount})</option>
            </select>
          </div>
        </div>

        {/* Preview Diff Table */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', maxHeight: '380px' }}>
          <div style={{ margin: '14px 0 8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Proposed Optical Adjustments ({candidates.length} Glyphs)
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Stem = 100% ({basePadding}U) • Curve ≈ 65% ({Math.round(basePadding * 0.65)}U) • Diagonal ≈ 30% ({Math.round(basePadding * 0.30)}U)
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '11px' }}>
                <th style={{ padding: '8px 12px' }}>Glyph</th>
                <th style={{ padding: '8px 12px' }}>Silhouette Classification</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>Left Bearing (LSB)</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>Right Bearing (RSB)</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Advance Width</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((entry) => {
                const lsbDelta = entry.proposedLsb - entry.item.lsb;
                const rsbDelta = entry.proposedRsb - entry.item.rsb;

                return (
                  <tr key={entry.item.char} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 700, fontFamily: 'serif', fontSize: '16px' }}>
                      {entry.item.char}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="badge badge-indigo" style={{ fontSize: '10px' }}>
                          L: {entry.profile.leftCategory} ({Math.round(entry.profile.leftCoeff * 100)}%)
                        </span>
                        <span style={{ color: 'var(--text-faint)' }}>•</span>
                        <span className="badge badge-indigo" style={{ fontSize: '10px' }}>
                          R: {entry.profile.rightCategory} ({Math.round(entry.profile.rightCoeff * 100)}%)
                        </span>
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '2px' }}>
                        {entry.profile.description}
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', marginRight: '6px' }}>
                        {entry.item.lsb}
                      </span>
                      <strong style={{ color: '#10b981' }}>{entry.proposedLsb}</strong>
                      <span style={{ fontSize: '10px', marginLeft: '4px', color: lsbDelta >= 0 ? '#10b981' : '#f59e0b' }}>
                        ({lsbDelta >= 0 ? `+${lsbDelta}` : lsbDelta})
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', marginRight: '6px' }}>
                        {entry.item.rsb}
                      </span>
                      <strong style={{ color: '#10b981' }}>{entry.proposedRsb}</strong>
                      <span style={{ fontSize: '10px', marginLeft: '4px', color: rsbDelta >= 0 ? '#10b981' : '#f59e0b' }}>
                        ({rsbDelta >= 0 ? `+${rsbDelta}` : rsbDelta})
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                      <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>
                        {entry.item.advanceWidth} →
                      </span>
                      <strong style={{ color: 'var(--accent)' }}>{entry.proposedAdvance} U</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-card)'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
            Vector outlines will be translated to exact optical positions.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={onApply}
              style={{ gap: '6px' }}
            >
              <Sparkles size={13} />
              <span>Apply Optical Spacing ({candidates.length} Glyphs)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
