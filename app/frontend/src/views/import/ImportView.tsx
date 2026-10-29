import React, { useState, useEffect } from 'react';
import { CheckCircle2, Check, AlertTriangle, Trash2, FileImage, UploadCloud } from 'lucide-react';
import { useFont } from '../../context/FontContext';
import { Glyph } from '../../types/font';
import { 
  fileToDataURL, 
  loadImage, 
  getBinaryMask, 
  cropRegionToDataUrl 
} from '../../utils/imageProcessor';
import { traceDataUrl, TracingOptions } from '../../utils/vectorizer';
import { GlyphBox, ToolMode, ConflictInfo } from './types';
import { ImportToolbar } from './ImportToolbar';
import { ImportSubheader } from './ImportSubheader';
import { ImageWorkspace } from './ImageWorkspace';
import { BoxInspector } from './BoxInspector';
import { MissingGlyphsTracker } from './MissingGlyphsTracker';

export const ImportView: React.FC<{ 
  onImportComplete?: () => void;
  initialTargetChar?: string;
}> = ({ onImportComplete, initialTargetChar }) => {
  const { 
    project, 
    commitImportedGlyphs, 
    copyCaseGlyphs, 
    deleteProjectGlyph,
    importBoxes: boxes,
    setImportBoxes: setBoxes,
    importImageSrc: imageSrc,
    setImportImageSrc: setImageSrc
  } = useFont();

  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);
  const [binaryMask, setBinaryMask] = useState<{ binary: Uint8Array; width: number; height: number } | null>(null);

  // Zoom & Tool
  const [zoom, setZoom] = useState(1.0);
  const [activeTool, setActiveTool] = useState<ToolMode>('snap');
  const [nextTargetChar, setNextTargetChar] = useState<string>(initialTargetChar || 'A');
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

  // Conflict state for reassignment
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);

  // Preprocessing filters
  const [threshold, setThreshold] = useState(135);
  const [invert, setInvert] = useState(false);
  const [removeBg, setRemoveBg] = useState(true);
  const [denoise, setDenoise] = useState(1);
  const [simplification, setSimplification] = useState(1.5);

  // Copy Case Modal
  const [copyModal, setCopyModal] = useState<{
    isOpen: boolean;
    direction: 'upper-to-lower' | 'lower-to-upper';
    sourceCount: number;
    overwriteCount: number;
  }>({
    isOpen: false,
    direction: 'upper-to-lower',
    sourceCount: 0,
    overwriteCount: 0
  });

  // Processing & Success notification
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Delete Artwork confirmation state
  const [deleteArtworkModalOpen, setDeleteArtworkModalOpen] = useState(false);

  const handlePromptDeleteArtwork = () => {
    if (boxes.length > 0) {
      setDeleteArtworkModalOpen(true);
    } else {
      handleConfirmDeleteArtwork();
    }
  };

  const handleConfirmDeleteArtwork = () => {
    setImageSrc('');
    setLoadedImg(null);
    setBinaryMask(null);
    setBoxes([]);
    setSelectedBoxId(null);
    setConflictInfo(null);
    setDeleteArtworkModalOpen(false);
    setSuccessMsg('Artwork deleted successfully. You can drag and drop or upload a new image.');
  };

  const handleLoadImageFile = async (file: File) => {
    try {
      const url = await fileToDataURL(file);
      setImageSrc(url);
      setBoxes([]);
      setSelectedBoxId(null);
      setConflictInfo(null);
      setSuccessMsg(`Loaded artwork "${file.name}".`);
    } catch (err) {
      console.error('Failed to read image file', err);
    }
  };

  // Alphabet arrays
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const specialChars = [
    ...'0123456789'.split(''),
    ...['.', ',', '!', '?', ':', ';', '-', '"', '\'', '(', ')', '/']
  ];

  // Assigned sets
  const assignedInProjectChars = new Set(
    Object.values(project.glyphs).filter(g => g.isAssigned && g.svgPath).map(g => g.char)
  );
  const definedInCurrentBoxes = new Set(boxes.map(b => b.char));

  // Load image
  useEffect(() => {
    if (!imageSrc) {
      setLoadedImg(null);
      setBinaryMask(null);
      return;
    }
    loadImage(imageSrc).then(img => {
      setLoadedImg(img);
      const mask = getBinaryMask(img, { threshold, invert, removeBg, denoise });
      setBinaryMask(mask);
    }).catch(err => {
      console.error('Failed to load image', err);
      setLoadedImg(null);
      setBinaryMask(null);
    });
  }, [imageSrc]);

  useEffect(() => {
    if (loadedImg) {
      const mask = getBinaryMask(loadedImg, { threshold, invert, removeBg, denoise });
      setBinaryMask(mask);
    }
  }, [threshold, invert, removeBg, denoise, loadedImg]);

  // Check if character has a conflict before reassignment
  const checkConflict = (targetChar: string, currentBoxId: string): ConflictInfo => {
    // 1. Check if assigned in another box on this current image
    const conflictingBox = boxes.find(b => b.id !== currentBoxId && b.char === targetChar);
    if (conflictingBox) {
      return {
        hasConflict: true,
        char: targetChar,
        location: 'current_image',
        conflictingBoxId: conflictingBox.id
      };
    }

    // 2. Check if already saved in font project
    const projectGlyph = project.glyphs[targetChar];
    if (projectGlyph && projectGlyph.isAssigned && projectGlyph.svgPath) {
      return {
        hasConflict: true,
        char: targetChar,
        location: 'font_project'
      };
    }

    return { hasConflict: false, char: targetChar, location: null };
  };

  // Re-assign selected box to a different letter with conflict check & auto-swap
  const handleUpdateBoxChar = (newChar: string) => {
    if (!selectedBoxId || !newChar) return;
    const currentBox = boxes.find(b => b.id === selectedBoxId);
    if (!currentBox || currentBox.char === newChar) return;

    const conflict = checkConflict(newChar, selectedBoxId);
    if (conflict.hasConflict) {
      if (conflict.location === 'current_image' && conflict.conflictingBoxId) {
        // Auto-swap characters between this box and conflicting box on the artwork
        setBoxes(prev => prev.map(b => {
          if (b.id === selectedBoxId) return { ...b, char: newChar };
          if (b.id === conflict.conflictingBoxId) return { ...b, char: currentBox.char };
          return b;
        }));
        setConflictInfo(null);
        setSuccessMsg(`Swapped '${newChar}' and '${currentBox.char}'.`);
      } else {
        setConflictInfo(conflict);
      }
    } else {
      setConflictInfo(null);
      setBoxes(prev => prev.map(b => b.id === selectedBoxId ? { ...b, char: newChar } : b));
    }
  };

  // Sync initialTargetChar when navigating from Glyph Editor "Replace Glyph"
  useEffect(() => {
    if (initialTargetChar) {
      setNextTargetChar(initialTargetChar);
      if (selectedBoxId) {
        handleUpdateBoxChar(initialTargetChar);
      }
    }
  }, [initialTargetChar]);

  // Resolve conflict: deletes old glyph and re-assigns this box
  const handleResolveConflict = (charToReassign: string) => {
    if (!selectedBoxId || !conflictInfo) return;

    if (conflictInfo.location === 'current_image' && conflictInfo.conflictingBoxId) {
      // Remove or unassign the other box
      setBoxes(prev => prev.filter(b => b.id !== conflictInfo.conflictingBoxId));
    } else if (conflictInfo.location === 'font_project') {
      // Delete from project
      deleteProjectGlyph(charToReassign);
    }

    setBoxes(prev => prev.map(b => b.id === selectedBoxId ? { ...b, char: charToReassign } : b));
    setConflictInfo(null);
  };

  // Click on a character chip
  const handlePickChar = (char: string) => {
    if (selectedBoxId) {
      handleUpdateBoxChar(char);
    } else {
      setNextTargetChar(char);
    }
  };

  // Delete box (also triggered by Return key!)
  const handleDeleteBox = (id: string) => {
    setBoxes(prev => prev.filter(b => b.id !== id));
    if (selectedBoxId === id) {
      setSelectedBoxId(null);
      setConflictInfo(null);
    }
  };

  // Adjust dimensions
  const handleAdjustDimensions = (dx: number, dy: number, dw: number, dh: number) => {
    if (!selectedBoxId) return;
    setBoxes(prev => prev.map(b => {
      if (b.id !== selectedBoxId) return b;
      return {
        ...b,
        x: Math.max(0, b.x + dx),
        y: Math.max(0, b.y + dy),
        width: Math.max(8, b.width + dw),
        height: Math.max(8, b.height + dh),
      };
    }));
  };

  // Copy Case prompt
  const handlePromptCopyCase = (direction: 'upper-to-lower' | 'lower-to-upper') => {
    let sourceCount = 0;
    let overwriteCount = 0;

    uppercaseChars.forEach(upperChar => {
      const lowerChar = upperChar.toLowerCase();
      const srcChar = direction === 'upper-to-lower' ? upperChar : lowerChar;
      const targetChar = direction === 'upper-to-lower' ? lowerChar : upperChar;

      const srcGlyph = project.glyphs[srcChar];
      if (srcGlyph && srcGlyph.isAssigned && srcGlyph.svgPath) {
        sourceCount++;
        const targetGlyph = project.glyphs[targetChar];
        if (targetGlyph && targetGlyph.isAssigned && targetGlyph.svgPath) {
          overwriteCount++;
        }
      }
    });

    setCopyModal({
      isOpen: true,
      direction,
      sourceCount,
      overwriteCount
    });
  };

  const handleExecuteCopyCase = () => {
    const { sourceCount, overwriteCount } = copyCaseGlyphs(copyModal.direction);
    setCopyModal({ isOpen: false, direction: 'upper-to-lower', sourceCount: 0, overwriteCount: 0 });
    setSuccessMsg(
      copyModal.direction === 'upper-to-lower'
        ? `Copied ${sourceCount} uppercase glyphs to lowercase (${overwriteCount} existing glyphs overwritten).`
        : `Copied ${sourceCount} lowercase glyphs to uppercase (${overwriteCount} existing glyphs overwritten).`
    );
  };

  // Commit all boxes into Font Project
  const handleCommitBoxes = async () => {
    if (!loadedImg || boxes.length === 0) return;
    setIsProcessing(true);

    const tracingOptions: TracingOptions = {
      threshold,
      simplification,
      smoothing: 2.0,
      upm: project.metrics.upm,
      capHeight: project.metrics.capHeight,
      baseline: 0
    };

    const newGlyphs: Glyph[] = [];

    for (const b of boxes) {
      if (!b.char) continue;
      const cropUrl = cropRegionToDataUrl(
        loadedImg,
        b.x,
        b.y,
        b.width,
        b.height,
        { threshold, invert, removeBg, denoise }
      );

      try {
        const traced = await traceDataUrl(cropUrl, tracingOptions);
        newGlyphs.push({
          char: b.char,
          name: b.char,
          unicode: 'U+' + b.char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'),
          isAssigned: true,
          advanceWidth: traced.advanceWidth,
          lsb: traced.lsb,
          rsb: traced.rsb,
          xOffset: 0,
          yOffset: 0,
          scale: 100,
          svgPath: traced.svgPath,
          originalImage: cropUrl
        });
      } catch (err) {
        console.error(`Failed to trace glyph ${b.char}`, err);
      }
    }

    commitImportedGlyphs(newGlyphs);
    setIsProcessing(false);
    setBoxes([]);
    setSelectedBoxId(null);
    setConflictInfo(null);
    setSuccessMsg(`Successfully extracted and saved ${newGlyphs.length} glyphs into your font project! All boxes cleared.`);
  };

  const handleClearBoxes = () => {
    setBoxes([]);
    setSelectedBoxId(null);
    setConflictInfo(null);
  };

  const selectedBox = boxes.find(b => b.id === selectedBoxId);
  const selectedBoxCrop = (selectedBox && loadedImg) ? cropRegionToDataUrl(
    loadedImg,
    selectedBox.x,
    selectedBox.y,
    selectedBox.width,
    selectedBox.height,
    { threshold, invert, removeBg, denoise }
  ) : null;

  // Unassigned characters for quick-selection chips in inline editor
  const availableSuggestions = React.useMemo(() => {
    const assigned = new Set(boxes.map(b => b.char));
    const list: string[] = [];
    for (const c of uppercaseChars) {
      if (!assigned.has(c)) {
        list.push(c);
        if (list.length >= 4) break;
      }
    }
    return list;
  }, [boxes, uppercaseChars]);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* 1. Left Vertical Section Toolbar (44px, Icons Only) */}
      <ImportToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        zoom={zoom}
        setZoom={setZoom}
        onUploadImage={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            await handleLoadImageFile(file);
          }
        }}
        boxCount={boxes.length}
        onClearBoxes={handleClearBoxes}
        hasArtwork={Boolean(imageSrc && loadedImg)}
        onDeleteArtwork={handlePromptDeleteArtwork}
      />

      {/* 2. Main Work Area: Standard 40px Subheader + Image Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#090c12', overflow: 'hidden' }}>
        <ImportSubheader
          loadedImg={loadedImg}
          boxCount={boxes.length}
          nextTargetChar={nextTargetChar}
          zoom={zoom}
          onImportComplete={onImportComplete}
          successMsg={successMsg}
        />

        <ImageWorkspace
          imageSrc={imageSrc}
          loadedImg={loadedImg}
          binaryMask={binaryMask}
          invert={invert}
          zoom={zoom}
          activeTool={activeTool}
          boxes={boxes}
          setBoxes={setBoxes}
          selectedBoxId={selectedBoxId}
          setSelectedBoxId={(id) => {
            setSelectedBoxId(id);
            setConflictInfo(null);
          }}
          nextTargetChar={nextTargetChar}
          getNextAvailableChar={() => {
            for (const c of uppercaseChars) {
              if (!definedInCurrentBoxes.has(c) && !assignedInProjectChars.has(c)) return c;
            }
            return 'A';
          }}
          onDeleteBox={handleDeleteBox}
          onUploadImage={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              await handleLoadImageFile(file);
            }
          }}
          onDropImageFile={handleLoadImageFile}
          onUpdateBoxChar={handleUpdateBoxChar}
          availableSuggestions={availableSuggestions}
        />
      </div>

      {/* 3. Right Side: Missing Glyphs Tracker & Selected Box Inspector (Standardized 300px) */}
      <div style={{
        width: '300px',
        minWidth: '300px',
        maxWidth: '300px',
        flexShrink: 0,
        backgroundColor: 'var(--bg-sidebar)',
        borderLeft: '1px solid var(--border)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '14px',
        boxSizing: 'border-box'
      }}>
        {/* Active Artwork Status Banner */}
        {loadedImg ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '11px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileImage size={16} style={{ color: 'var(--accent)' }} />
              <div>
                <span style={{ fontWeight: 600, display: 'block', color: 'var(--text-main)' }}>Current Artwork</span>
                <span style={{ color: 'var(--text-faint)' }}>{loadedImg.width} × {loadedImg.height} px • {boxes.length} box{boxes.length === 1 ? '' : 'es'}</span>
              </div>
            </div>
            <button
              className="btn-ghost"
              onClick={handlePromptDeleteArtwork}
              style={{ color: '#ef4444', fontSize: '11px', padding: '3px 8px', gap: '4px', display: 'flex', alignItems: 'center' }}
              title="Delete loaded artwork image"
            >
              <Trash2 size={12} />
              <span>Delete Artwork</span>
            </button>
          </div>
        ) : (
          <div style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px dashed rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            fontSize: '11px',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
            <span>No artwork loaded. Upload or drag an image into the canvas to start.</span>
          </div>
        )}

        {/* Section A: Categorized Missing Glyphs Tracker */}
        <MissingGlyphsTracker
          uppercaseChars={uppercaseChars}
          lowercaseChars={lowercaseChars}
          specialChars={specialChars}
          assignedInProjectChars={assignedInProjectChars}
          definedInCurrentBoxes={definedInCurrentBoxes}
          nextTargetChar={nextTargetChar}
          onPickChar={handlePickChar}
          onCopyCase={handlePromptCopyCase}
          selectedBox={selectedBox}
        />

        {/* Section B: Selected Box Inspector */}
        {selectedBox ? (
          <BoxInspector
            selectedBox={selectedBox}
            selectedBoxCrop={selectedBoxCrop}
            onUpdateBoxChar={handleUpdateBoxChar}
            onAdjustDimensions={handleAdjustDimensions}
            onDeleteBox={handleDeleteBox}
            conflictInfo={conflictInfo}
            onResolveConflict={handleResolveConflict}
          />
        ) : (
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--bg-card)',
            border: '1px dashed var(--border)',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '11px',
            color: 'var(--text-muted)'
          }}>
            Click any letter on the image to select it. Press <strong>Return</strong> to delete.
          </div>
        )}

        {/* Section C: Ink Preprocessing Filters */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <h4 style={{ fontSize: '12px', fontWeight: 600 }}>Ink Thresholding</h4>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '11px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Threshold Cutoff</span>
              <span>{threshold}</span>
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

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', cursor: 'pointer' }}>
            <span>Invert Ink (White on Black)</span>
            <input type="checkbox" checked={invert} onChange={(e) => setInvert(e.target.checked)} />
          </label>
        </div>

        {/* Section D: Commit & Clear Buttons */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn-primary"
              onClick={handleCommitBoxes}
              disabled={isProcessing || boxes.length === 0}
              style={{ flex: 1, justifyContent: 'center', padding: '10px 14px', fontSize: '13px' }}
            >
              <Check size={16} />
              <span>
                {isProcessing 
                  ? 'Vectorizing Outlines...' 
                  : `Commit ${boxes.length} Glyphs into Font`
                }
              </span>
            </button>

            {boxes.length > 0 && (
              <button
                className="btn-secondary"
                onClick={handleClearBoxes}
                title="Clear all boxes from current view without committing"
                style={{ padding: '0 12px', fontSize: '12px', color: 'var(--text-muted)' }}
              >
                Clear
              </button>
            )}
          </div>

          <p style={{ fontSize: '10px', color: 'var(--text-faint)', textAlign: 'center' }}>
            Extracts vectors for these {boxes.length} letters, clears them from view, and preserves all previously imported glyphs.
          </p>
        </div>
      </div>

      {/* Confirmation Modal for "Copy Uppercase <-> Lowercase" */}
      {copyModal.isOpen && (
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
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
                  {copyModal.direction === 'upper-to-lower' ? 'Copy Uppercase to Lowercase?' : 'Copy Lowercase to Uppercase?'}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Confirmation required</span>
              </div>
            </div>

            <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-main)' }}>
              Are you sure? This will copy <strong>{copyModal.sourceCount}</strong> {copyModal.direction === 'upper-to-lower' ? 'uppercase' : 'lowercase'} glyphs.
              {copyModal.overwriteCount > 0 ? (
                <span style={{ color: '#f59e0b', display: 'block', marginTop: '6px' }}>
                  ⚠️ This will overwrite <strong>{copyModal.overwriteCount}</strong> existing {copyModal.direction === 'upper-to-lower' ? 'lowercase' : 'uppercase'} glyphs.
                </span>
              ) : (
                <span style={{ color: '#6ee7b7', display: 'block', marginTop: '6px' }}>
                  No existing glyphs will be overwritten.
                </span>
              )}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                className="btn-secondary"
                onClick={() => setCopyModal(prev => ({ ...prev, isOpen: false }))}
                style={{ padding: '7px 14px' }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleExecuteCopyCase}
                style={{ padding: '7px 16px' }}
              >
                <Check size={14} />
                <span>Yes, Copy Glyphs</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for "Delete Artwork" */}
      {deleteArtworkModalOpen && (
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
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Trash2 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Delete Artwork Image?</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Remove current sheet</span>
              </div>
            </div>

            <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-main)', margin: 0 }}>
              Are you sure you want to delete the loaded artwork image?
              {boxes.length > 0 && (
                <span style={{ color: '#ef4444', display: 'block', marginTop: '6px' }}>
                  ⚠️ This will also clear all <strong>{boxes.length}</strong> uncommitted bounding box{boxes.length === 1 ? '' : 'es'} currently placed on this image. (Saved glyphs in your font project will not be affected.)
                </span>
              )}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                className="btn-secondary"
                onClick={() => setDeleteArtworkModalOpen(false)}
                style={{ padding: '7px 14px' }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleConfirmDeleteArtwork}
                style={{ padding: '7px 16px', backgroundColor: '#ef4444', borderColor: '#dc2626' }}
              >
                <Trash2 size={14} />
                <span>Yes, Delete Artwork</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
