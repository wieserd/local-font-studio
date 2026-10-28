import { useState, useCallback } from 'react';

export function useSidebarAccordion<T extends string>(initialSections: Record<T, boolean>) {
  const [openSections, setOpenSections] = useState<Record<T, boolean>>(initialSections);

  const toggleSection = useCallback((sectionId: T) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  const expandAll = useCallback(() => {
    setOpenSections((prev) => {
      const next = { ...prev };
      (Object.keys(next) as T[]).forEach((k) => {
        next[k] = true;
      });
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setOpenSections((prev) => {
      const next = { ...prev };
      (Object.keys(next) as T[]).forEach((k) => {
        next[k] = false;
      });
      return next;
    });
  }, []);

  return {
    openSections,
    setOpenSections,
    toggleSection,
    expandAll,
    collapseAll,
    isOpen: (sectionId: T) => Boolean(openSections[sectionId])
  };
}
