import React, { useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Image as ImageIcon, AlignCenter, RotateCcw, RefreshCw, Upload, Trash2 } from 'lucide-react';
import { Glyph } from '../../../types/font';

interface BitmapSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  currentGlyph: Glyph;
  glyphChar: string;
  bitmapScale: number;
  setBitmapScale: (val: number) => void;
  bitmapXOffset: number;
  setBitmapXOffset: (val: number) => void;
  bitmapYOffset: number;
  setBitmapYOffset: (val: number) => void;
  updateGlyph: (char: string, partial: Partial<Glyph>) => void;
  handleAlignBitmapToGlyph: () => void;
  handleResetBitmapPosition: () => void;
  threshold: number;
  setThreshold: (val: number) => void;
  simplification: number;
  setSimplification: (val: number) => void;
  handleRetrace: () => void;
  handleLoadBitmap: (dataUrl: string) => void;
  handleDeleteBitmap: () => void;
}

export const BitmapSection: React.FC<BitmapSectionProps> = ({
  isOpen,
  onToggle,
  currentGlyph,
  glyphChar,
  bitmapScale,
  setBitmapScale,
  bitmapXOffset,
  setBitmapXOffset,
  bitmapYOffset,
  setBitmapYOffset,
  updateGlyph,
  handleAlignBitmapToGlyph,
  handleResetBitmapPosition,
  threshold,
  setThreshold,
  simplification,
  setSimplification,
  handleRetrace,
  handleLoadBitmap,
  handleDeleteBitmap
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        handleLoadBitmap(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        handleLoadBitmap(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const hasImage = Boolean(currentGlyph.originalImage);

  return (
    <div style={{ borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/svg+xml, image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Accordion Header */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-surface)',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isOpen ? <ChevronDown size={14} color="#38bdf8" /> : <ChevronRight size={14} color="var(--text-muted)" />}
          <ImageIcon size={13} color="#38bdf8" />
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            5. Source Bitmap & Retrace
          </span>
        </div>
        <span className="badge badge-gray" style={{ fontSize: '9px' }}>
          {hasImage ? `${bitmapScale}%` : 'No Image'}
        </span>
      </div>

      {isOpen && (
        <div style={{ padding: '10px', backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Empty State: No Bitmap Artwork */}
          {!hasImage ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '8px',
                padding: '16px 10px',
                backgroundColor: isDragOver ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-main)',
                border: isDragOver ? '1.5px dashed #38bdf8' : '1px dashed var(--border)',
                borderRadius: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}>
                <ImageIcon size={18} />
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 600 }}>No Bitmap Artwork</div>
                <div style={{ fontSize: '9.5px', color: 'var(--text-faint)', marginTop: '2px', lineHeight: '1.4' }}>
                  Load a reference image or scan to overlay behind glyph '{glyphChar}' and auto-trace outlines.
                </div>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={handleTriggerFileInput}
                style={{
                  fontSize: '10.5px',
                  padding: '5px 12px',
                  gap: '5px',
                  marginTop: '4px',
                  backgroundColor: '#0284c7',
                  borderColor: '#0284c7'
                }}
              >
                <Upload size={12} />
                <span>Load Bitmap Image</span>
              </button>
            </div>
          ) : (
            /* Active State: Bitmap Loaded */
            <>
              {/* Load / Replace & Delete Action Row */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleTriggerFileInput}
                  style={{
                    flex: 1,
                    fontSize: '10px',
                    padding: '4px 8px',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                  title="Select a new image file to replace the current bitmap"
                >
                  <Upload size={11} />
                  <span>Replace Bitmap</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteBitmap}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '5px',
                    padding: '4px 8px',
                    fontSize: '10px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    cursor: 'pointer'
                  }}
                  title="Remove background bitmap from this glyph"
                >
                  <Trash2 size={11} />
                  <span>Delete</span>
                </button>
              </div>

              {/* Bitmap Scale */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Bitmap Resize / Scale</label>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#38bdf8' }}>{bitmapScale}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="range"
                    min="20"
                    max="300"
                    value={bitmapScale}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setBitmapScale(val);
                      updateGlyph(glyphChar, { bitmapScale: val });
                    }}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="number"
                    value={bitmapScale}
                    onChange={(e) => {
                      const val = Math.max(10, Math.min(500, Number(e.target.value)));
                      setBitmapScale(val);
                      updateGlyph(glyphChar, { bitmapScale: val });
                    }}
                    style={{ width: '46px', fontSize: '11px', padding: '2px 4px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                  {[50, 75, 100, 125, 150, 200].map(pct => (
                    <button
                      key={pct}
                      className="btn-secondary"
                      style={{
                        flex: 1,
                        padding: '2px 0',
                        fontSize: '9px',
                        justifyContent: 'center',
                        backgroundColor: bitmapScale === pct ? 'rgba(2, 132, 199, 0.25)' : undefined,
                        borderColor: bitmapScale === pct ? '#0284c7' : undefined
                      }}
                      onClick={() => {
                        setBitmapScale(pct);
                        updateGlyph(glyphChar, { bitmapScale: pct });
                      }}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Bitmap X & Y */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Bitmap X</label>
                    <span style={{ fontSize: '10px', color: '#38bdf8', fontFamily: 'monospace' }}>{bitmapXOffset}</span>
                  </div>
                  <input
                    type="number"
                    value={bitmapXOffset}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setBitmapXOffset(val);
                      updateGlyph(glyphChar, { bitmapXOffset: val });
                    }}
                    style={{ width: '100%', fontSize: '12px', padding: '4px 6px' }}
                  />
                  <div style={{ display: 'flex', gap: '2px', marginTop: '3px' }}>
                    <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => { const v = bitmapXOffset - 10; setBitmapXOffset(v); updateGlyph(glyphChar, { bitmapXOffset: v }); }} title="-10px">-10</button>
                    <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => { const v = bitmapXOffset - 1; setBitmapXOffset(v); updateGlyph(glyphChar, { bitmapXOffset: v }); }} title="-1px">-1</button>
                    <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => { const v = bitmapXOffset + 1; setBitmapXOffset(v); updateGlyph(glyphChar, { bitmapXOffset: v }); }} title="+1px">+1</button>
                    <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => { const v = bitmapXOffset + 10; setBitmapXOffset(v); updateGlyph(glyphChar, { bitmapXOffset: v }); }} title="+10px">+10</button>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Bitmap Y</label>
                    <span style={{ fontSize: '10px', color: '#38bdf8', fontFamily: 'monospace' }}>{bitmapYOffset}</span>
                  </div>
                  <input
                    type="number"
                    value={bitmapYOffset}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setBitmapYOffset(val);
                      updateGlyph(glyphChar, { bitmapYOffset: val });
                    }}
                    style={{ width: '100%', fontSize: '12px', padding: '4px 6px' }}
                  />
                  <div style={{ display: 'flex', gap: '2px', marginTop: '3px' }}>
                    <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => { const v = bitmapYOffset - 10; setBitmapYOffset(v); updateGlyph(glyphChar, { bitmapYOffset: v }); }} title="-10px">-10</button>
                    <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => { const v = bitmapYOffset - 1; setBitmapYOffset(v); updateGlyph(glyphChar, { bitmapYOffset: v }); }} title="-1px">-1</button>
                    <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => { const v = bitmapYOffset + 1; setBitmapYOffset(v); updateGlyph(glyphChar, { bitmapYOffset: v }); }} title="+1px">+1</button>
                    <button className="btn-secondary" style={{ flex: 1, padding: '2px 0', fontSize: '9px', justifyContent: 'center' }} onClick={() => { const v = bitmapYOffset + 10; setBitmapYOffset(v); updateGlyph(glyphChar, { bitmapYOffset: v }); }} title="+10px">+10</button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className="btn-secondary"
                  style={{ flex: 1, fontSize: '10px', padding: '4px 6px', justifyContent: 'center' }}
                  onClick={handleAlignBitmapToGlyph}
                  title="Snap bitmap position to match current vector glyph position"
                >
                  <AlignCenter size={11} />
                  <span>Align to Glyph</span>
                </button>
                <button
                  className="btn-secondary"
                  style={{ flex: 1, fontSize: '10px', padding: '4px 6px', justifyContent: 'center' }}
                  onClick={handleResetBitmapPosition}
                  title="Reset bitmap overlay position and scale to (0, 0, 100%)"
                >
                  <RotateCcw size={11} />
                  <span>Reset (0, 0, 100%)</span>
                </button>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />

              {/* Retrace Controls */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h4 style={{ fontSize: '10.5px', fontWeight: 600, margin: 0 }}>Retrace Source Artwork</h4>
                  <span className="badge badge-indigo" style={{ fontSize: '9px' }}>Local Tracer</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Threshold Cutoff</span>
                      <span style={{ fontSize: '10px', fontWeight: 600 }}>{threshold}</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="240"
                      value={threshold}
                      onChange={(e) => setThreshold(Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Simplification</span>
                      <span style={{ fontSize: '10px', fontWeight: 600 }}>{simplification} px</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="4"
                      step="0.5"
                      value={simplification}
                      onChange={(e) => setSimplification(Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <button className="btn-secondary" onClick={handleRetrace} style={{ width: '100%', justifyContent: 'center', fontSize: '10.5px', padding: '5px 8px' }}>
                    <RefreshCw size={12} />
                    <span>Retrace Glyph '{glyphChar}'</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
