import React, { useState, useMemo, useRef } from 'react';
import { useFont } from '../context/FontContext';
import { KerningToolbar } from './KerningToolbar';
import { KerningSubheader } from './kerning/KerningSubheader';
import { KerningCanvas } from './kerning/KerningCanvas';
import { KerningSentenceSpecimen } from './kerning/KerningSentenceSpecimen';
import { KerningPairsSidebar } from './kerning/KerningPairsSidebar';
import { AddKerningPairModal } from './kerning/AddKerningPairModal';

const DEFAULT_STANDARD_PRESETS = [
  { left: 'A', right: 'V', value: -60 },
  { left: 'A', right: 'W', value: -45 },
  { left: 'A', right: 'Y', value: -55 },
  { left: 'T', right: 'o', value: -45 },
  { left: 'T', right: 'a', value: -40 },
  { left: 'W', right: 'a', value: -30 },
  { left: 'Y', right: 'o', value: -55 },
  { left: 'L', right: 'T', value: -50 },
  { left: 'F', right: 'A', value: -35 },
];

export const KerningView: React.FC = () => {
  const {
    project,
    updateKerningPair,
    deleteKerningPair,
    addKerningPair
  } = useFont();

  const kerningPairs = project.kerningPairs || [];

  // Active selected pair
  const [selectedLeft, setSelectedLeft] = useState<string>(() => {
    return kerningPairs[0]?.left || 'A';
  });
  const [selectedRight, setSelectedRight] = useState<string>(() => {
    return kerningPairs[0]?.right || 'V';
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [activeTool, setActiveTool] = useState('select');

  const specimenRef = useRef<HTMLDivElement>(null);

  // Find active pair in project
  const activePair = useMemo(() => {
    return kerningPairs.find(p => p.left === selectedLeft && p.right === selectedRight);
  }, [kerningPairs, selectedLeft, selectedRight]);

  const activeKerningValue = activePair ? activePair.value : 0;

  const handleSelectPair = (left: string, right: string) => {
    setSelectedLeft(left);
    setSelectedRight(right);
  };

  const handleUpdateKerning = (val: number) => {
    updateKerningPair(selectedLeft, selectedRight, val);
  };

  const handleDeletePair = (left: string, right: string) => {
    deleteKerningPair(left, right);
    // If deleted the active pair, select another pair
    if (left === selectedLeft && right === selectedRight) {
      const remaining = kerningPairs.filter(p => !(p.left === left && p.right === right));
      if (remaining.length > 0) {
        setSelectedLeft(remaining[0].left);
        setSelectedRight(remaining[0].right);
      }
    }
  };

  const handleAddPair = (left: string, right: string, val: number) => {
    addKerningPair(left, right, val);
    setSelectedLeft(left);
    setSelectedRight(right);
  };

  const handleSwapPair = () => {
    const newLeft = selectedRight;
    const newRight = selectedLeft;
    const existing = kerningPairs.find(p => p.left === newLeft && p.right === newRight);
    if (!existing) {
      addKerningPair(newLeft, newRight, activeKerningValue);
    }
    setSelectedLeft(newLeft);
    setSelectedRight(newRight);
  };

  const handleResetZero = () => {
    updateKerningPair(selectedLeft, selectedRight, 0);
  };

  const handleAddCommonPresets = () => {
    DEFAULT_STANDARD_PRESETS.forEach(p => {
      addKerningPair(p.left, p.right, p.value);
    });
    if (DEFAULT_STANDARD_PRESETS.length > 0) {
      setSelectedLeft(DEFAULT_STANDARD_PRESETS[0].left);
      setSelectedRight(DEFAULT_STANDARD_PRESETS[0].right);
    }
  };

  const handleBatchAddPairs = (pairs: Array<{ left: string; right: string; value: number }>) => {
    pairs.forEach(p => {
      addKerningPair(p.left, p.right, p.value);
    });
    if (pairs.length > 0) {
      setSelectedLeft(pairs[0].left);
      setSelectedRight(pairs[0].right);
    }
  };

  const handleClearAllPairs = () => {
    if (window.confirm(`Are you sure you want to delete all ${kerningPairs.length} kerning pairs?`)) {
      kerningPairs.forEach(p => {
        deleteKerningPair(p.left, p.right);
      });
    }
  };

  const handleApplyClassKerning = (baseLeft: string, classMembers: string[], val: number) => {
    classMembers.forEach(mem => {
      addKerningPair(baseLeft, mem, val);
    });
  };

  const handleStepPair = (direction: -1 | 1) => {
    if (kerningPairs.length === 0) return;
    const currentIndex = kerningPairs.findIndex(p => p.left === selectedLeft && p.right === selectedRight);
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = kerningPairs.length - 1;
    if (nextIndex >= kerningPairs.length) nextIndex = 0;
    setSelectedLeft(kerningPairs[nextIndex].left);
    setSelectedRight(kerningPairs[nextIndex].right);
  };

  const handleAutoKernPair = () => {
    let suggested = -40;
    const pair = `${selectedLeft}${selectedRight}`;
    if (['AV', 'VA', 'AW', 'WA', 'AY', 'YA'].includes(pair)) suggested = -60;
    else if (['To', 'Ta', 'Te', 'Tu', 'Ty', 'Tr'].includes(pair)) suggested = -40;
    else if (['Yo', 'Ye', 'Ya'].includes(pair)) suggested = -55;
    else if (['Wo', 'Wa', 'We'].includes(pair)) suggested = -30;
    else if (['LT', 'LV', 'LW', 'LY'].includes(pair)) suggested = -50;
    else if (['A.', 'T.', 'P.', 'Y.', 'V.', 'W.', 'F.'].includes(pair)) suggested = -60;
    else if (['A,', 'T,', 'P,', 'Y,', 'V,', 'W,', 'F,'].includes(pair)) suggested = -60;

    handleUpdateKerning(suggested);
  };

  const handleFocusSpecimen = () => {
    specimenRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* 1. Left Toolbar */}
      <KerningToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        onSwapPair={handleSwapPair}
        onResetZero={handleResetZero}
        onZoomIn={() => setZoom(z => Math.min(250, z + 20))}
        onZoomOut={() => setZoom(z => Math.max(60, z - 20))}
        onAutoKernPair={handleAutoKernPair}
        onFocusSpecimen={handleFocusSpecimen}
      />

      {/* 2. Main Workspace: Standard 40px Subheader + Real Vector Canvas & Specimen */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <KerningSubheader
          leftChar={selectedLeft}
          rightChar={selectedRight}
          kerningValue={activeKerningValue}
          zoom={zoom}
          showGuidelines={showGuidelines}
          setShowGuidelines={setShowGuidelines}
          onSwapPair={handleSwapPair}
          pairsCount={kerningPairs.length}
        />

        <div style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Real Interactive SVG Kerning Pair Canvas */}
        <KerningCanvas
          leftChar={selectedLeft}
          rightChar={selectedRight}
          kerningValue={activeKerningValue}
          onUpdateKerning={handleUpdateKerning}
          onSwapPair={handleSwapPair}
          glyphs={project.glyphs}
          metrics={project.metrics}
          showGuidelines={showGuidelines}
          setShowGuidelines={setShowGuidelines}
          zoom={zoom}
          onStepPair={handleStepPair}
        />

        {/* Real Contextual Vector Specimen */}
        <div ref={specimenRef}>
          <KerningSentenceSpecimen
            leftChar={selectedLeft}
            rightChar={selectedRight}
            glyphs={project.glyphs}
            metrics={project.metrics}
            kerningPairs={kerningPairs}
          />
        </div>
      </div>
    </div>

      {/* 3. Right Sidebar: Kerning Pairs Directory */}
      <KerningPairsSidebar
        kerningPairs={kerningPairs}
        selectedPairKey={`${selectedLeft}:${selectedRight}`}
        onSelectPair={handleSelectPair}
        onDeletePair={handleDeletePair}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onAddCommonPresets={handleAddCommonPresets}
        onAddBatchPairs={handleBatchAddPairs}
        onClearAllPairs={handleClearAllPairs}
        onApplyClassKerning={handleApplyClassKerning}
        glyphs={project.glyphs}
        metrics={project.metrics}
        onSwapPair={handleSwapPair}
        activeKerningValue={activeKerningValue}
      />

      {/* 4. Add Kerning Pair Modal */}
      <AddKerningPairModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPair={handleAddPair}
        glyphs={project.glyphs}
        metrics={project.metrics}
        existingPairs={kerningPairs}
      />
    </div>
  );
};
