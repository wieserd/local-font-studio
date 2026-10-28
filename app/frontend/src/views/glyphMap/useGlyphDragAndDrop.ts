import { useState, useRef, useEffect, useCallback } from 'react';
import { Glyph } from '../../types/font';
import { OverwriteModalState } from './glyphMapTypes';

interface UseGlyphDragAndDropProps {
  projectGlyphs: Record<string, Glyph>;
  copyGlyph: (sourceChar: string, targetChar: string) => void;
  onSelectGlyph: (glyphChar: string) => void;
}

export const useGlyphDragAndDrop = ({
  projectGlyphs,
  copyGlyph,
  onSelectGlyph
}: UseGlyphDragAndDropProps) => {
  // Hold & Drag Mode State
  const [holdingChar, setHoldingChar] = useState<string | null>(null);
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100
  const [dragModeSource, setDragModeSource] = useState<string | null>(null); // Active orange drag source
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredTargetChar, setHoveredTargetChar] = useState<string | null>(null);

  // Overwrite Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<OverwriteModalState | null>(null);

  // Success Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Interaction tracking refs (stable across renders)
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const holdStartTimeRef = useRef<number>(0);
  const holdingCharRef = useRef<string | null>(null);
  const dragModeSourceRef = useRef<string | null>(null);
  const holdCompletedRef = useRef<boolean>(false);

  holdingCharRef.current = holdingChar;
  dragModeSourceRef.current = dragModeSource;

  // Clear timers helper
  const clearHoldTimers = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Execute copy / replacement logic
  const handleExecuteDrop = useCallback((source: string, target: string) => {
    if (source === target) {
      setDragModeSource(null);
      setHoveredTargetChar(null);
      return;
    }

    const targetGlyph = projectGlyphs[target];
    const isTargetEmpty = !targetGlyph || !targetGlyph.isAssigned || !targetGlyph.svgPath;

    if (isTargetEmpty) {
      // Empty target: replace immediately without prompting
      copyGlyph(source, target);
      setToastMessage(`Replaced empty glyph '${target}' with artwork from '${source}'`);
      setDragModeSource(null);
      setHoveredTargetChar(null);
    } else {
      // Target contains artwork: prompt user for confirmation
      setConfirmModal({ sourceChar: source, targetChar: target });
      setDragModeSource(null);
      setHoveredTargetChar(null);
    }
  }, [projectGlyphs, copyGlyph]);

  // Global pointer & keyboard listeners
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      // 1. While holding before 1s has elapsed, check if mouse moved excessively
      if (holdingCharRef.current && !dragModeSourceRef.current) {
        const dx = e.clientX - holdStartPosRef.current.x;
        const dy = e.clientY - holdStartPosRef.current.y;
        if (Math.hypot(dx, dy) > 25) {
          // Moved more than 25px: user is scrolling or gesturing, cancel hold
          clearHoldTimers();
          setHoldingChar(null);
          setHoldProgress(0);
        }
        return;
      }

      // 2. When drag mode is active, track cursor position & detect hovered target card
      if (dragModeSourceRef.current) {
        setCursorPos({ x: e.clientX, y: e.clientY });

        const targetElement = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-glyph-char]') as HTMLElement | null;
        const targetChar = targetElement?.getAttribute('data-glyph-char') || null;

        if (targetChar && targetChar !== dragModeSourceRef.current) {
          setHoveredTargetChar(targetChar);
        } else {
          setHoveredTargetChar(null);
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      clearHoldTimers();

      // If drag mode is currently active:
      if (dragModeSourceRef.current) {
        const source = dragModeSourceRef.current;
        const targetElement = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-glyph-char]') as HTMLElement | null;
        const targetChar = targetElement?.getAttribute('data-glyph-char') || null;

        // If released directly over a target glyph cell, execute drop
        if (targetChar && targetChar !== source) {
          handleExecuteDrop(source, targetChar);
          return;
        }
        // If released in place / on source, remain in drag mode so user can see prompt and click target
        return;
      }

      // If user released before 1 second:
      if (holdingCharRef.current) {
        const elapsed = Date.now() - holdStartTimeRef.current;
        const charToSelect = holdingCharRef.current;
        setHoldingChar(null);
        setHoldProgress(0);

        if (elapsed < 1000) {
          // Standard quick click: open in editor
          onSelectGlyph(charToSelect);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearHoldTimers();
        setHoldingChar(null);
        setHoldProgress(0);
        setDragModeSource(null);
        setHoveredTargetChar(null);
        setConfirmModal(null);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [clearHoldTimers, handleExecuteDrop, onSelectGlyph]);

  // Card pointer down: start 1-second hold timer
  const handleCardPointerDown = (e: React.PointerEvent, g: Glyph) => {
    if (e.button !== 0) return; // Only left click

    // If drag mode is ALREADY active for another glyph, clicking this card executes drop
    if (dragModeSource) {
      e.stopPropagation();
      e.preventDefault();
      handleExecuteDrop(dragModeSource, g.char);
      return;
    }

    const hasArtwork = Boolean(g.isAssigned && g.svgPath);
    if (!hasArtwork) {
      // Empty glyph: normal quick click opens editor
      onSelectGlyph(g.char);
      return;
    }

    // Prevent default browser native drag / text selection
    e.preventDefault();

    clearHoldTimers();
    holdStartPosRef.current = { x: e.clientX, y: e.clientY };
    holdStartTimeRef.current = Date.now();
    holdCompletedRef.current = false;
    setHoldingChar(g.char);
    setHoldProgress(0);
    setCursorPos({ x: e.clientX, y: e.clientY });

    // Progress animation interval
    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartTimeRef.current;
      const pct = Math.min(100, Math.round((elapsed / 1000) * 100));
      setHoldProgress(pct);

      if (elapsed >= 1000) {
        clearHoldTimers();
        holdCompletedRef.current = true;
        setHoldingChar(null);
        setHoldProgress(100);
        setDragModeSource(g.char); // ACTIVATE DRAG & DROP MODE!
      }
    }, 20);
  };

  const cancelDragMode = () => {
    setDragModeSource(null);
    setHoveredTargetChar(null);
  };

  return {
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
  };
};
