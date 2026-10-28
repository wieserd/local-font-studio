import React, { useState } from 'react';
import {
  Puzzle,
  Code,
  Sparkles,
  Wand2,
  Check,
  Terminal,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Play
} from 'lucide-react';
import { StudioAddon } from './types';
import { useFont } from '../context/FontContext';

interface CustomAddonHostViewProps {
  addon: StudioAddon;
}

export const CustomAddonHostView: React.FC<CustomAddonHostViewProps> = ({ addon }) => {
  const { project, updateGlyphsBatch } = useFont();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExecuteAction = (actionId: string, actionName: string) => {
    setActiveActionId(actionId);

    // Built-in intelligent handlers for popular actions
    if (actionId === 'inject-calculus') {
      updateGlyphsBatch([
        {
          char: '∫',
          partial: {
            char: '∫',
            name: 'integral',
            unicode: 'U+222B',
            isAssigned: true,
            advanceWidth: 500,
            lsb: 80,
            rsb: 80,
            svgPath: 'M 350 750 C 250 750 200 680 200 600 L 200 400 C 200 200 150 150 50 150 L 50 100 C 150 100 200 170 200 250 L 200 450 C 200 650 250 700 350 700 Z'
          }
        },
        {
          char: '∂',
          partial: {
            char: '∂',
            name: 'partial-diff',
            unicode: 'U+2202',
            isAssigned: true,
            advanceWidth: 550,
            lsb: 60,
            rsb: 60,
            svgPath: 'M 300 700 C 180 700 120 600 120 480 C 120 320 220 200 340 200 C 440 200 480 280 480 380 C 480 500 380 700 300 700 Z'
          }
        }
      ]);
      showToast('✓ Successfully generated Integral (∫) and Partial Diff (∂) glyphs!');
    } else if (actionId === 'inject-algebra') {
      updateGlyphsBatch([
        {
          char: '∑',
          partial: {
            char: '∑',
            name: 'summation',
            unicode: 'U+2211',
            isAssigned: true,
            advanceWidth: 600,
            lsb: 60,
            rsb: 60,
            svgPath: 'M 150 700 L 450 700 L 450 640 L 260 640 L 360 450 L 260 260 L 450 260 L 450 200 L 150 200 L 280 450 Z'
          }
        },
        {
          char: '√',
          partial: {
            char: '√',
            name: 'sqrt',
            unicode: 'U+221A',
            isAssigned: true,
            advanceWidth: 600,
            lsb: 50,
            rsb: 50,
            svgPath: 'M 100 400 L 180 200 L 260 700 L 500 700 L 500 650 L 300 650 L 220 150 L 140 350 Z'
          }
        }
      ]);
      showToast('✓ Successfully injected Summation (∑) and Square Root (√)!');
    } else if (actionId === 'snap-cell-pitch') {
      const updates = Object.values(project.glyphs)
        .filter(g => g.isAssigned)
        .map(g => ({
          char: g.char,
          partial: { advanceWidth: 600, lsb: 50, rsb: 50 }
        }));
      updateGlyphsBatch(updates);
      showToast(`✓ Snapped ${updates.length} glyphs to uniform 600 UPM pitch!`);
    } else if (actionId === 'inject-manicules') {
      updateGlyphsBatch([
        {
          char: '☞',
          partial: {
            char: '☞',
            name: 'manicule-right',
            unicode: 'U+261E',
            isAssigned: true,
            advanceWidth: 650,
            lsb: 40,
            rsb: 40,
            svgPath: 'M 100 450 L 350 450 L 350 550 L 550 450 L 350 350 L 350 400 L 100 400 Z'
          }
        }
      ]);
      showToast('✓ Injected vintage Manicule pointing hand (☞)!');
    } else {
      showToast(`✓ Executed action: "${actionName}"`);
    }

    setTimeout(() => setActiveActionId(null), 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-app)', overflow: 'hidden' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '90px',
          right: '20px',
          backgroundColor: '#10b981',
          color: '#ffffff',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        padding: '20px 28px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)'
          }}>
            <Puzzle size={24} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                {addon.name}
              </h1>
              <span style={{ fontSize: '11px', color: 'var(--text-faint)', backgroundColor: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                v{addon.version}
              </span>
              <span className="badge badge-gray" style={{ fontSize: '10px', textTransform: 'capitalize' }}>
                {addon.category}
              </span>
              <span style={{ fontSize: '10px', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                Custom Addon
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--accent)', margin: '3px 0 0 0', fontWeight: 500 }}>
              {addon.tagline}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {addon.websiteUrl && (
            <a
              href={addon.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <ExternalLink size={12} />
              <span>Repository / Docs</span>
            </a>
          )}
          <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
            Author: <strong>{addon.author}</strong>
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Description Card */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '18px'
        }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            About this Extension
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.6', margin: 0 }}>
            {addon.description}
          </p>
        </div>

        {/* Actions / Generators Section */}
        {addon.actions && addon.actions.length > 0 && (
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={15} style={{ color: 'var(--accent)' }} />
              <span>Available Addon Actions ({addon.actions.length})</span>
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
              {addon.actions.map(action => (
                <div
                  key={action.id}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
                      {action.name}
                    </h4>
                    <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>
                      {action.description}
                    </p>
                  </div>

                  <button
                    className="btn-primary"
                    onClick={() => handleExecuteAction(action.id, action.name)}
                    disabled={activeActionId === action.id}
                    style={{
                      alignSelf: 'flex-start',
                      fontSize: '11px',
                      padding: '6px 14px',
                      gap: '6px'
                    }}
                  >
                    {activeActionId === action.id ? <Check size={12} /> : <Wand2 size={12} />}
                    <span>{action.buttonLabel || 'Run Action'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Developer Inspection */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '18px'
        }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Terminal size={14} style={{ color: 'var(--accent)' }} />
            <span>Installed Manifest Spec</span>
          </h3>
          <pre style={{
            margin: 0,
            padding: '12px',
            backgroundColor: 'var(--bg-main)',
            borderRadius: '6px',
            fontSize: '11px',
            color: 'var(--text-muted)',
            overflowX: 'auto',
            fontFamily: 'monospace'
          }}>
            {JSON.stringify(addon, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
