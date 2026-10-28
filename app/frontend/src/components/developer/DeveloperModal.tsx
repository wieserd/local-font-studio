import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Terminal,
  Activity,
  AlertTriangle,
  CheckCircle,
  FileCode,
  HardDrive,
  Cpu,
  Layers,
  Search,
  RefreshCw,
  Play,
  Gauge,
  Clock,
  Zap,
  Download,
  Trash2,
  RotateCcw
} from 'lucide-react';
import developerStatsData from '../../generated/developerStats.json';
import { useFont } from '../../context/FontContext';

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'scanner' | 'build' | 'storage' | 'benchmarks';
}

type TabType = 'scanner' | 'build' | 'storage' | 'benchmarks';
type LocFilter = 'all' | 'red' | 'yellow' | 'green';

export const DeveloperModal: React.FC<DeveloperModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'scanner'
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [locFilter, setLocFilter] = useState<LocFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Benchmark state
  const [isRunningBench, setIsRunningBench] = useState(false);
  const [benchResults, setBenchResults] = useState<{
    contourOpsPerSec: number;
    kerningLookupsPerSec: number;
    typesetterCharsPerSec: number;
    totalMs: number;
  } | null>(null);

  // Storage calculation state
  const [storageData, setStorageData] = useState<{
    activeProjectBytes: number;
    importImageBytes: number;
    totalBytes: number;
    estimatedQuotaBytes: number;
  }>({ activeProjectBytes: 0, importImageBytes: 0, totalBytes: 0, estimatedQuotaBytes: 5 * 1024 * 1024 });

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);

      // Measure localStorage usage
      try {
        let total = 0;
        let projBytes = 0;
        let imgBytes = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const val = localStorage.getItem(key) || '';
            const size = (key.length + val.length) * 2; // UTF-16
            total += size;
            if (key === 'local_font_studio_active_project') projBytes = size;
            if (key === 'local_font_studio_import_image') imgBytes = size;
          }
        }
        setStorageData({
          activeProjectBytes: projBytes,
          importImageBytes: imgBytes,
          totalBytes: total,
          estimatedQuotaBytes: 5 * 1024 * 1024
        });
      } catch (e) {
        console.warn('Could not inspect localStorage', e);
      }
    }
  }, [isOpen, initialTab]);

  const stats = developerStatsData;

  // Filtered files list
  const filteredFiles = useMemo(() => {
    return stats.files.filter((file) => {
      if (locFilter !== 'all' && file.status !== locFilter) return false;
      if (categoryFilter !== 'all' && file.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return file.name.toLowerCase().includes(q) || file.path.toLowerCase().includes(q);
      }
      return true;
    });
  }, [stats.files, locFilter, categoryFilter, searchQuery]);

  // Run in-browser benchmark
  const runBenchmarks = () => {
    setIsRunningBench(true);
    setTimeout(() => {
      const start = performance.now();

      // 1. Contour math benchmark
      const contourStart = performance.now();
      let contourCount = 0;
      const testPoint = { x: 120, y: 340 };
      while (performance.now() - contourStart < 150) {
        for (let i = 0; i < 1000; i++) {
          const rad = (45 * Math.PI) / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);
          const _rx = testPoint.x * cos - testPoint.y * sin;
          const _ry = testPoint.x * sin + testPoint.y * cos;
          contourCount++;
        }
      }
      const contourOpsPerSec = Math.round((contourCount / (performance.now() - contourStart)) * 1000);

      // 2. GPOS Kerning map lookup benchmark
      const kernStart = performance.now();
      const kernMap = new Map<string, number>();
      for (let i = 0; i < 200; i++) {
        kernMap.set(`pair_${i}:${i + 1}`, -30);
      }
      let kernLookups = 0;
      while (performance.now() - kernStart < 150) {
        for (let i = 0; i < 1000; i++) {
          const key = `pair_${i % 200}:${(i % 200) + 1}`;
          const _v = kernMap.get(key);
          kernLookups++;
        }
      }
      const kerningLookupsPerSec = Math.round((kernLookups / (performance.now() - kernStart)) * 1000);

      // 3. Typesetting string tokenization benchmark
      const typeStart = performance.now();
      const sample = 'The quick brown fox jumps over the lazy dog. AVATAR Typography 1234567890!';
      let typeChars = 0;
      while (performance.now() - typeStart < 150) {
        for (let i = 0; i < 100; i++) {
          const _tokens = sample.split(/\s+/);
          typeChars += sample.length;
        }
      }
      const typesetterCharsPerSec = Math.round((typeChars / (performance.now() - typeStart)) * 1000);

      const totalDuration = Math.round(performance.now() - start);

      setBenchResults({
        contourOpsPerSec,
        kerningLookupsPerSec,
        typesetterCharsPerSec,
        totalMs: totalDuration
      });
      setIsRunningBench(false);
    }, 50);
  };

  const { flushToPristineEmptyState } = useFont();

  const handleExportDebugJson = () => {
    const raw = localStorage.getItem('local_font_studio_active_project') || '{}';
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `font-studio-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFlushToCleanState = () => {
    if (window.confirm(
      "Reset All Workspace Data?\n\n" +
      "This will permanently erase all custom glyphs, vector contours, and imported scans from your browser storage.\n\n" +
      "Are you sure you want to proceed?"
    )) {
      flushToPristineEmptyState(false);
      onClose();
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#0d1117',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '12px',
        width: '920px',
        maxWidth: '96vw',
        height: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
        overflow: 'hidden'
      }}>
        {/* Top Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#161b22'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(99, 102, 241, 0.18)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              <Terminal size={17} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, letterSpacing: '0.02em', color: '#f0f6fc' }}>
                  Developer Studio & Architecture Telemetry
                </h2>
                <span style={{ fontSize: '10px', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                  Active
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#8b949e', margin: '2px 0 0 0' }}>
                Build speed diagnostics, TSX modularity scanner, storage quotas, and in-browser engine benchmarks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ width: '30px', height: '30px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Top KPI Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          padding: '16px 20px',
          backgroundColor: '#0f141c',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Card 1: Build Time */}
          <div style={{
            backgroundColor: '#161b22',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '10px 14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recent Build Time
              </span>
              <Clock size={13} color="var(--accent)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#f0f6fc', fontFamily: 'monospace' }}>
                {stats.buildDurationSeconds}s
              </span>
              <span style={{ fontSize: '10px', color: '#4ade80', fontWeight: 600 }}>Fast (Vite + Rollup)</span>
            </div>
          </div>

          {/* Card 2: Codebase Volume */}
          <div style={{
            backgroundColor: '#161b22',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '10px 14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Codebase
              </span>
              <FileCode size={13} color="#38bdf8" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#f0f6fc', fontFamily: 'monospace' }}>
                {stats.totalLines.toLocaleString()}
              </span>
              <span style={{ fontSize: '10px', color: '#8b949e' }}>LOC in {stats.totalFiles} files</span>
            </div>
          </div>

          {/* Card 3: Monolith Warnings */}
          <div style={{
            backgroundColor: '#161b22',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '10px 14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Modularity Alerts
              </span>
              <AlertTriangle size={13} color="#f87171" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#f87171',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {stats.redCount} &gt;1k LOC
              </span>
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#fbbf24',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {stats.yellowCount} &gt;700 LOC
              </span>
            </div>
          </div>

          {/* Card 4: LocalStorage Quota */}
          <div style={{
            backgroundColor: '#161b22',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '10px 14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Storage Quota
              </span>
              <HardDrive size={13} color="#a78bfa" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#f0f6fc', fontFamily: 'monospace' }}>
                {(storageData.totalBytes / 1024).toFixed(1)} kB
              </span>
              <span style={{ fontSize: '10px', color: '#4ade80' }}>
                {((storageData.totalBytes / storageData.estimatedQuotaBytes) * 100).toFixed(1)}% of 5MB
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: '6px',
          padding: '10px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#161b22'
        }}>
          {[
            { id: 'scanner', label: 'TSX / Code Health Scanner', icon: <FileCode size={13} />, badge: `${stats.redCount + stats.yellowCount} alerts` },
            { id: 'build', label: 'Build & Bundles Breakdown', icon: <Layers size={13} /> },
            { id: 'storage', label: 'Storage & Diagnostics', icon: <HardDrive size={13} /> },
            { id: 'benchmarks', label: 'Engine Benchmarks', icon: <Gauge size={13} /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
                  backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? '#fff' : '#8b949e',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span style={{
                    fontSize: '9px',
                    padding: '1px 5px',
                    borderRadius: '10px',
                    backgroundColor: isActive ? 'rgba(0,0,0,0.3)' : 'rgba(239, 68, 68, 0.2)',
                    color: isActive ? '#fff' : '#f87171',
                    fontWeight: 700
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* TAB 1: TSX / CODE SCANNER */}
          {activeTab === 'scanner' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Filter & Search Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                {/* Status filters */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setLocFilter('all')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '5px',
                      border: locFilter === 'all' ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: locFilter === 'all' ? 'var(--accent)' : 'transparent',
                      color: locFilter === 'all' ? '#fff' : '#8b949e',
                      cursor: 'pointer'
                    }}
                  >
                    All Files ({stats.totalFiles})
                  </button>

                  <button
                    onClick={() => setLocFilter('red')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '5px',
                      border: locFilter === 'red' ? '1px solid #ef4444' : '1px solid rgba(239,68,68,0.2)',
                      backgroundColor: locFilter === 'red' ? '#ef4444' : 'rgba(239,68,68,0.1)',
                      color: locFilter === 'red' ? '#fff' : '#f87171',
                      cursor: 'pointer'
                    }}
                  >
                    🔴 Red (&gt;1,000 LOC): {stats.redCount}
                  </button>

                  <button
                    onClick={() => setLocFilter('yellow')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '5px',
                      border: locFilter === 'yellow' ? '1px solid #f59e0b' : '1px solid rgba(245,158,11,0.2)',
                      backgroundColor: locFilter === 'yellow' ? '#f59e0b' : 'rgba(245,158,11,0.1)',
                      color: locFilter === 'yellow' ? '#fff' : '#fbbf24',
                      cursor: 'pointer'
                    }}
                  >
                    🟡 Yellow (700–1,000 LOC): {stats.yellowCount}
                  </button>

                  <button
                    onClick={() => setLocFilter('green')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '5px',
                      border: locFilter === 'green' ? '1px solid #10b981' : '1px solid rgba(16,185,129,0.2)',
                      backgroundColor: locFilter === 'green' ? '#10b981' : 'rgba(16,185,129,0.1)',
                      color: locFilter === 'green' ? '#fff' : '#34d399',
                      cursor: 'pointer'
                    }}
                  >
                    🟢 Healthy (&lt;700 LOC): {stats.greenCount}
                  </button>
                </div>

                {/* Search input */}
                <div style={{ position: 'relative', width: '220px' }}>
                  <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#8b949e' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search file name..."
                    style={{
                      width: '100%',
                      padding: '5px 8px 5px 26px',
                      fontSize: '11px',
                      backgroundColor: '#161b22',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '5px',
                      color: '#f0f6fc'
                    }}
                  />
                </div>
              </div>

              {/* Scanned Files Table */}
              <div style={{
                backgroundColor: '#161b22',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f141c', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#8b949e', fontSize: '11px' }}>
                      <th style={{ padding: '10px 14px' }}>File Path & Module</th>
                      <th style={{ padding: '10px 14px', width: '90px' }}>Category</th>
                      <th style={{ padding: '10px 14px', width: '170px' }}>Lines of Code</th>
                      <th style={{ padding: '10px 14px', width: '80px' }}>Hooks</th>
                      <th style={{ padding: '10px 14px', width: '140px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.map((file) => {
                      const percentage = Math.min(100, Math.round((file.totalLines / 1500) * 100));
                      const barColor = file.status === 'red' ? '#ef4444' : (file.status === 'yellow' ? '#f59e0b' : '#10b981');
                      const badgeBg = file.status === 'red' ? 'rgba(239, 68, 68, 0.15)' : (file.status === 'yellow' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)');
                      const badgeColor = file.status === 'red' ? '#f87171' : (file.status === 'yellow' ? '#fbbf24' : '#34d399');

                      return (
                        <tr
                          key={file.path}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            backgroundColor: file.status === 'red' ? 'rgba(239, 68, 68, 0.03)' : 'transparent'
                          }}
                        >
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{ fontWeight: 600, color: '#f0f6fc', display: 'block' }}>{file.name}</span>
                            <span style={{ fontSize: '10px', color: '#8b949e', fontFamily: 'monospace' }}>{file.path}</span>
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(255,255,255,0.06)',
                              color: '#8b949e',
                              fontWeight: 600
                            }}>
                              {file.category}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                              <span style={{ fontWeight: 700, fontFamily: 'monospace', color: barColor }}>{file.totalLines} lines</span>
                              <span style={{ fontSize: '10px', color: '#8b949e' }}>{file.codeLines} code</span>
                            </div>
                            <div style={{ height: '4px', width: '100%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${percentage}%`, backgroundColor: barColor, borderRadius: '2px' }} />
                            </div>
                          </td>
                          <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: file.hookCount > 20 ? '#f87171' : '#8b949e' }}>
                            {file.hookCount}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '4px',
                              backgroundColor: badgeBg,
                              color: badgeColor,
                              display: 'inline-block'
                            }}>
                              {file.status === 'red' ? 'RED: >1,000 LOC' : (file.status === 'yellow' ? 'YELLOW: >700 LOC' : 'HEALTHY')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: BUILD & BUNDLES */}
          {activeTab === 'build' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                backgroundColor: '#161b22',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Vite 5 Production Bundler Metrics
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '12px' }}>
                  <div style={{ padding: '10px', backgroundColor: '#0f141c', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color: '#8b949e', display: 'block', fontSize: '11px' }}>Build Duration</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#4ade80', fontFamily: 'monospace' }}>
                      {stats.buildDurationSeconds}s
                    </span>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#0f141c', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color: '#8b949e', display: 'block', fontSize: '11px' }}>Modules Transformed</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                      177 modules
                    </span>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#0f141c', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color: '#8b949e', display: 'block', fontSize: '11px' }}>Bundle Budget Status</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#4ade80', fontFamily: 'monospace' }}>
                      Pass (No &gt;500kB)
                    </span>
                  </div>
                </div>
              </div>

              {/* Chunk breakdown list */}
              <div style={{
                backgroundColor: '#161b22',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, margin: '0 0 12px 0', color: '#8b949e' }}>
                  Production Output Chunks Breakdown
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { name: 'dist/assets/vendor-font.js', raw: '339.63 kB', gzip: '97.88 kB', desc: 'opentype.js parser & jszip vector archiver' },
                    { name: 'dist/assets/vendor-react.js', raw: '141.00 kB', gzip: '45.29 kB', desc: 'React 18 & React-DOM core runtime' },
                    { name: 'dist/assets/index.js', raw: '445.09 kB', gzip: '100.10 kB', desc: 'Local Font Studio views, editors & context' },
                    { name: 'dist/assets/index.css', raw: '3.55 kB', gzip: '1.19 kB', desc: 'Dark theme studio stylesheet' }
                  ].map((chunk) => (
                    <div
                      key={chunk.name}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        backgroundColor: '#0f141c',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.06)'
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace', color: '#f0f6fc', display: 'block' }}>{chunk.name}</span>
                        <span style={{ fontSize: '11px', color: '#8b949e' }}>{chunk.desc}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', color: '#f0f6fc', display: 'block' }}>{chunk.raw}</span>
                        <span style={{ fontSize: '10px', color: '#4ade80' }}>gzip: {chunk.gzip}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STORAGE DIAGNOSTICS */}
          {activeTab === 'storage' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                backgroundColor: '#161b22',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>Browser LocalStorage Consumption</h3>
                    <p style={{ fontSize: '11px', color: '#8b949e', margin: '2px 0 0 0' }}>
                      Monitors quota utilization for font glyph artwork and cached vector paths
                    </p>
                  </div>
                  <button
                    onClick={handleExportDebugJson}
                    className="btn-secondary"
                    style={{ fontSize: '11px', padding: '5px 10px', gap: '6px' }}
                  >
                    <Download size={13} />
                    <span>Download Project JSON</span>
                  </button>
                </div>

                {/* Meter */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#f0f6fc' }}>Total Quota Utilized</span>
                    <span style={{ fontWeight: 700, color: '#4ade80', fontFamily: 'monospace' }}>
                      {(storageData.totalBytes / 1024).toFixed(1)} kB / 5,120 kB ({((storageData.totalBytes / storageData.estimatedQuotaBytes) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', width: '100%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, (storageData.totalBytes / storageData.estimatedQuotaBytes) * 100)}%`,
                      backgroundColor: '#10b981',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>

                {/* Key Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#0f141c', borderRadius: '6px' }}>
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#f0f6fc' }}>local_font_studio_active_project</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#38bdf8' }}>{(storageData.activeProjectBytes / 1024).toFixed(1)} kB</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#0f141c', borderRadius: '6px' }}>
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#f0f6fc' }}>local_font_studio_import_image</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#8b949e' }}>{(storageData.importImageBytes / 1024).toFixed(1)} kB</span>
                  </div>
                </div>

                {/* Clean Shipping State Action */}
                <div style={{
                  marginTop: '16px',
                  padding: '14px 16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Trash2 size={16} style={{ color: '#ef4444' }} />
                      <span style={{ fontWeight: 700, fontSize: '13px', color: '#f87171' }}>
                        Reset Workspace to Default
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#8b949e', margin: '4px 0 0 0', lineHeight: 1.45 }}>
                      Wipes all cached vector contours, scanned artwork, and font modifications from browser storage.
                    </p>
                  </div>

                  <button
                    onClick={handleFlushToCleanState}
                    style={{
                      padding: '8px 14px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                    }}
                  >
                    <RotateCcw size={13} />
                    <span>Reset All Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BENCHMARKS */}
          {activeTab === 'benchmarks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                backgroundColor: '#161b22',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>In-Browser Typography Benchmarks</h3>
                    <p style={{ fontSize: '11px', color: '#8b949e', margin: '2px 0 0 0' }}>
                      Stress test vector math, GPOS kerning table lookups, and typesetter throughput
                    </p>
                  </div>
                  <button
                    onClick={runBenchmarks}
                    disabled={isRunningBench}
                    className="btn-primary"
                    style={{ fontSize: '11px', padding: '6px 14px', gap: '6px' }}
                  >
                    {isRunningBench ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
                    <span>{isRunningBench ? 'Running...' : 'Run Benchmark'}</span>
                  </button>
                </div>

                {benchResults ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div style={{ padding: '12px', backgroundColor: '#0f141c', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: '11px', color: '#8b949e', display: 'block' }}>Contour Vector Math</span>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: '#4ade80', fontFamily: 'monospace' }}>
                        {benchResults.contourOpsPerSec.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '10px', color: '#8b949e', display: 'block' }}>transforms / sec</span>
                    </div>

                    <div style={{ padding: '12px', backgroundColor: '#0f141c', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: '11px', color: '#8b949e', display: 'block' }}>GPOS Kerning Lookups</span>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                        {benchResults.kerningLookupsPerSec.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '10px', color: '#8b949e', display: 'block' }}>pair queries / sec</span>
                    </div>

                    <div style={{ padding: '12px', backgroundColor: '#0f141c', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: '11px', color: '#8b949e', display: 'block' }}>Typesetter Throughput</span>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: '#a78bfa', fontFamily: 'monospace' }}>
                        {benchResults.typesetterCharsPerSec.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '10px', color: '#8b949e', display: 'block' }}>glyphs / sec</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#8b949e', fontSize: '12px' }}>
                    Click "Run Benchmark" to execute live performance test suite.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
