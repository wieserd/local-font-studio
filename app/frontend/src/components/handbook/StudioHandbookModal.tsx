import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Search, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  ExternalLink,
  Layers,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { HANDBOOK_CHAPTERS, HandbookChapter } from '../../data/handbook/handbookChapters';
import { TabId } from '../Tabs';

interface StudioHandbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: TabId) => void;
  initialChapterId?: string;
}

export const StudioHandbookModal: React.FC<StudioHandbookModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  initialChapterId = 'quick-start',
}) => {
  const [selectedChapterId, setSelectedChapterId] = useState<string>(initialChapterId);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync initial chapter when opened
  useEffect(() => {
    if (initialChapterId) {
      setSelectedChapterId(initialChapterId);
    }
  }, [initialChapterId, isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered chapters based on search query
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return HANDBOOK_CHAPTERS;
    const q = searchQuery.toLowerCase();
    return HANDBOOK_CHAPTERS.filter(ch => {
      const matchTitle = ch.title.toLowerCase().includes(q);
      const matchSummary = ch.summary.toLowerCase().includes(q);
      const matchCategory = ch.category.toLowerCase().includes(q);
      const matchSections = ch.sections.some(s => 
        (s.heading && s.heading.toLowerCase().includes(q)) ||
        (s.paragraphs && s.paragraphs.some(p => p.toLowerCase().includes(q))) ||
        (s.bulletPoints && s.bulletPoints.some(b => b.toLowerCase().includes(q)))
      );
      return matchTitle || matchSummary || matchCategory || matchSections;
    });
  }, [searchQuery]);

  const activeChapter = useMemo(() => {
    const found = HANDBOOK_CHAPTERS.find(c => c.id === selectedChapterId);
    return found || filteredChapters[0] || HANDBOOK_CHAPTERS[0];
  }, [selectedChapterId, filteredChapters]);

  // Chapter index for previous/next navigation
  const currentIndex = HANDBOOK_CHAPTERS.findIndex(c => c.id === activeChapter.id);
  const prevChapter = currentIndex > 0 ? HANDBOOK_CHAPTERS[currentIndex - 1] : null;
  const nextChapter = currentIndex < HANDBOOK_CHAPTERS.length - 1 ? HANDBOOK_CHAPTERS[currentIndex + 1] : null;

  if (!isOpen) return null;

  const handleJumpToTool = (tab: TabId) => {
    if (onNavigateToTab) {
      onNavigateToTab(tab);
    }
    onClose();
  };

  // Group chapters by category
  const categories = ['Fundamentals', 'Artwork & Curves', 'Metrics & Spacing', 'Typography Engineering'] as const;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 7, 12, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '960px',
          height: '86vh',
          backgroundColor: '#111520',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '14px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 1px rgba(99, 102, 241, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: 'var(--text-main)',
          animation: 'fadeIn 0.15s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#151a26',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: 'rgba(99, 102, 241, 0.18)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8'
            }}>
              <BookOpen size={18} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
                Local Font Studio Handbook
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Complete Typography & Font Engineering Reference Guide
              </div>
            </div>
          </div>

          {/* Quick Search */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input
              type="text"
              placeholder="Search handbook topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#0c0f17',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '6px 12px 6px 30px',
                fontSize: '12px',
                color: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Two-Pane Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Sidebar: Table of Contents */}
          <div style={{
            width: '270px',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: '#0e111a',
            overflowY: 'auto',
            padding: '14px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            {searchQuery ? (
              <div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 8px 6px' }}>
                  Search Results ({filteredChapters.length})
                </div>
                {filteredChapters.length === 0 ? (
                  <div style={{ fontSize: '11px', color: 'var(--text-faint)', padding: '10px 8px' }}>
                    No topics matched "{searchQuery}"
                  </div>
                ) : (
                  filteredChapters.map(ch => (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedChapterId(ch.id)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: activeChapter.id === ch.id ? 'var(--accent)' : 'transparent',
                        color: activeChapter.id === ch.id ? '#ffffff' : 'var(--text-muted)',
                        fontSize: '12px',
                        fontWeight: activeChapter.id === ch.id ? 600 : 400,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background-color 0.1s ease',
                        marginBottom: '2px'
                      }}
                    >
                      <span style={{ fontSize: '10px', fontFamily: 'monospace', opacity: 0.7 }}>{ch.number}</span>
                      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ch.title}</span>
                    </button>
                  ))
                )}
              </div>
            ) : (
              categories.map(cat => {
                const chaptersInCat = HANDBOOK_CHAPTERS.filter(c => c.category === cat);
                if (chaptersInCat.length === 0) return null;

                return (
                  <div key={cat}>
                    <div style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--text-faint)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      padding: '0 8px 6px'
                    }}>
                      {cat}
                    </div>
                    {chaptersInCat.map(ch => {
                      const isActive = activeChapter.id === ch.id;
                      return (
                        <button
                          key={ch.id}
                          onClick={() => setSelectedChapterId(ch.id)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '7px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                            color: isActive ? '#ffffff' : 'var(--text-muted)',
                            fontSize: '11px',
                            fontWeight: isActive ? 600 : 400,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.12s ease',
                            marginBottom: '2px'
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                              e.currentTarget.style.color = '#ffffff';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = 'var(--text-muted)';
                            }
                          }}
                        >
                          <span style={{
                            fontSize: '9px',
                            fontFamily: 'monospace',
                            color: isActive ? '#ffffff' : 'var(--text-faint)',
                            backgroundColor: isActive ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.05)',
                            padding: '1px 4px',
                            borderRadius: '3px'
                          }}>
                            {ch.number}
                          </span>
                          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {ch.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {/* Right Reader Pane */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 32px',
            backgroundColor: '#111520',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '24px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Chapter Header */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: 'var(--accent)',
                    backgroundColor: 'rgba(99, 102, 241, 0.12)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    CHAPTER {activeChapter.number}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
                    {activeChapter.category}
                  </span>
                </div>

                <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
                  {activeChapter.title}
                </h1>

                {/* Summary Box with Direct Jump Button */}
                <div style={{
                  backgroundColor: 'rgba(99, 102, 241, 0.07)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: 1.5 }}>
                    {activeChapter.summary}
                  </div>

                  {activeChapter.tabTarget && onNavigateToTab && (
                    <button
                      onClick={() => handleJumpToTool(activeChapter.tabTarget!)}
                      className="btn-primary"
                      style={{
                        padding: '6px 12px',
                        fontSize: '11px',
                        whiteSpace: 'nowrap',
                        gap: '6px',
                        borderRadius: '5px'
                      }}
                      title={`Switch to ${activeChapter.tabLabel}`}
                    >
                      <span>{activeChapter.tabLabel || 'Open Tool'}</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Chapter Sections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {activeChapter.sections.map((sec, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sec.heading && (
                      <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9', margin: '6px 0 2px 0' }}>
                        {sec.heading}
                      </h2>
                    )}

                    {sec.paragraphs && sec.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>
                        {p}
                      </p>
                    ))}

                    {sec.bulletPoints && (
                      <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {sec.bulletPoints.map((bp, bpIdx) => (
                          <li key={bpIdx} style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            {bp}
                          </li>
                        ))}
                      </ul>
                    )}

                    {sec.tip && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        backgroundColor: 'rgba(56, 189, 248, 0.08)',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        borderRadius: '6px',
                        padding: '10px 14px',
                        marginTop: '6px'
                      }}>
                        <Lightbulb size={16} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ fontSize: '11px', color: '#e0f2fe', lineHeight: 1.5 }}>
                          <strong style={{ color: '#38bdf8' }}>Pro-Tip: </strong>
                          {sec.tip}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Chapter Navigation Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {prevChapter ? (
                <button
                  onClick={() => setSelectedChapterId(prevChapter.id)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    color: 'var(--text-muted)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  <ChevronLeft size={14} />
                  <span>Previous: {prevChapter.number}. {prevChapter.title}</span>
                </button>
              ) : <div />}

              {nextChapter ? (
                <button
                  onClick={() => setSelectedChapterId(nextChapter.id)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    color: 'var(--text-muted)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  <span>Next: {nextChapter.number}. {nextChapter.title}</span>
                  <ChevronRight size={14} />
                </button>
              ) : <div />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
