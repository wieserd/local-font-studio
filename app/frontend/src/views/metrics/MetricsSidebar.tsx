import React from 'react';
import { Ruler, Save, Check, Info, MoveVertical, Columns, Type, Layers } from 'lucide-react';
import { StandardSidebar, SidebarSection, useSidebarAccordion } from '../../components/sidebar';

interface MetricsSidebarProps {
  upm: number;
  setUpm: (v: number) => void;
  ascender: number;
  setAscender: (v: number) => void;
  descender: number;
  setDescender: (v: number) => void;
  capHeight: number;
  setCapHeight: (v: number) => void;
  xHeight: number;
  setXHeight: (v: number) => void;
  lineGap: number;
  setLineGap: (v: number) => void;
  defaultAdvance: number;
  setDefaultAdvance: (v: number) => void;
  defaultLsb: number;
  setDefaultLsb: (v: number) => void;
  defaultRsb: number;
  setDefaultRsb: (v: number) => void;
  spaceWidth: number;
  setSpaceWidth: (v: number) => void;
  activeStyleName?: string;
  savedSuccess?: boolean;
  onSave?: () => void;
  updateMetrics: (partial: any) => void;
}

type MetricsSectionId = 'upm' | 'vertical' | 'horizontal' | 'space';

export const MetricsSidebar: React.FC<MetricsSidebarProps> = ({
  upm,
  setUpm,
  ascender,
  setAscender,
  descender,
  setDescender,
  capHeight,
  setCapHeight,
  xHeight,
  setXHeight,
  lineGap,
  setLineGap,
  defaultAdvance,
  setDefaultAdvance,
  defaultLsb,
  setDefaultLsb,
  defaultRsb,
  setDefaultRsb,
  spaceWidth,
  setSpaceWidth,
  activeStyleName,
  savedSuccess,
  onSave,
  updateMetrics
}) => {
  const { openSections, toggleSection, expandAll, collapseAll, isOpen } = useSidebarAccordion<MetricsSectionId>({
    upm: true,
    vertical: true,
    horizontal: true,
    space: true
  });

  const handleSetSpacePreset = (val: number) => {
    setSpaceWidth(val);
    updateMetrics({ spaceWidth: val });
  };

  return (
    <StandardSidebar
      title="Font Metrics"
      subtitle={
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Active Cut:</span>
          <span className="badge badge-indigo" style={{ padding: '1px 6px', fontSize: '9px' }}>
            {activeStyleName || 'Regular'}
          </span>
        </div>
      }
      icon={<Ruler size={15} color="var(--accent)" />}
      onExpandAll={expandAll}
      onCollapseAll={collapseAll}
      footer={
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px dashed var(--border)',
          borderRadius: '6px',
          padding: '8px 10px',
          fontSize: '10px',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-main)', fontWeight: 600 }}>
            <Info size={11} color="var(--accent)" />
            <span>Spacing Formula</span>
          </div>
          <div>Advance = LSB + Glyph Width + RSB</div>
          <div style={{ color: 'var(--text-faint)' }}>Auto-center balances LSB and RSB equally.</div>
        </div>
      }
    >
      {/* 1. MASTER SCALE / UPM */}
      <SidebarSection
        title="1. Coordinate Scale (UPM)"
        icon={<Ruler size={13} color="var(--accent)" />}
        badge={`${upm} UPM`}
        isOpen={isOpen('upm')}
        onToggle={() => toggleSection('upm')}
      >
        <div>
          <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
            Units Per Em (UPM)
          </label>
          <select
            value={upm}
            onChange={(e) => {
              const val = Number(e.target.value);
              setUpm(val);
              updateMetrics({ upm: val });
            }}
            style={{ width: '100%', fontSize: '12px' }}
          >
            <option value={1000}>1000 (OpenType standard default)</option>
            <option value={2048}>2048 (TrueType classic standard)</option>
          </select>
        </div>
      </SidebarSection>

      {/* 2. VERTICAL METRICS */}
      <SidebarSection
        title="2. Vertical Metrics & Guides"
        icon={<MoveVertical size={13} color="var(--accent)" />}
        badge={`${ascender} / ${descender}`}
        isOpen={isOpen('vertical')}
        onToggle={() => toggleSection('vertical')}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
              Ascender Height
            </label>
            <input
              type="number"
              value={ascender}
              onChange={(e) => {
                const val = Number(e.target.value);
                setAscender(val);
                updateMetrics({ ascender: val });
              }}
              style={{ width: '100%', fontSize: '12px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
              Cap Height
            </label>
            <input
              type="number"
              value={capHeight}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCapHeight(val);
                updateMetrics({ capHeight: val });
              }}
              style={{ width: '100%', fontSize: '12px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
              x-Height
            </label>
            <input
              type="number"
              value={xHeight}
              onChange={(e) => {
                const val = Number(e.target.value);
                setXHeight(val);
                updateMetrics({ xHeight: val });
              }}
              style={{ width: '100%', fontSize: '12px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
              Descender Depth
            </label>
            <input
              type="number"
              value={descender}
              onChange={(e) => {
                const val = Number(e.target.value);
                setDescender(val);
                updateMetrics({ descender: val });
              }}
              style={{ width: '100%', fontSize: '12px' }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
            Line Gap / Leading
          </label>
          <input
            type="number"
            value={lineGap}
            onChange={(e) => {
              const val = Number(e.target.value);
              setLineGap(val);
              updateMetrics({ lineGap: val });
            }}
            style={{ width: '100%', fontSize: '12px' }}
          />
        </div>
      </SidebarSection>

      {/* 3. HORIZONTAL DEFAULTS */}
      <SidebarSection
        title="3. Horizontal Spacing Defaults"
        icon={<Columns size={13} color="var(--accent)" />}
        badge={`${defaultAdvance} adv`}
        isOpen={isOpen('horizontal')}
        onToggle={() => toggleSection('horizontal')}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
              Default LSB
            </label>
            <input
              type="number"
              value={defaultLsb}
              onChange={(e) => {
                const val = Number(e.target.value);
                setDefaultLsb(val);
                updateMetrics({ defaultLsb: val });
              }}
              style={{ width: '100%', fontSize: '12px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
              Default RSB
            </label>
            <input
              type="number"
              value={defaultRsb}
              onChange={(e) => {
                const val = Number(e.target.value);
                setDefaultRsb(val);
                updateMetrics({ defaultRsb: val });
              }}
              style={{ width: '100%', fontSize: '12px' }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
            Default Advance Width
          </label>
          <input
            type="number"
            value={defaultAdvance}
            onChange={(e) => {
              const val = Number(e.target.value);
              setDefaultAdvance(val);
              updateMetrics({ defaultAdvance: val });
            }}
            style={{ width: '100%', fontSize: '12px' }}
          />
        </div>
      </SidebarSection>

      {/* 4. WORD SPACE (U+0020) */}
      <SidebarSection
        title="4. Word Space (U+0020)"
        icon={<Type size={13} color="var(--accent)" />}
        badge={`${spaceWidth} u`}
        isOpen={isOpen('space')}
        onToggle={() => toggleSection('space')}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Advance Width:</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)' }}>
            {spaceWidth} units
          </span>
        </div>

        <input
          type="range"
          min="120"
          max="600"
          step="10"
          value={spaceWidth}
          onChange={(e) => {
            const val = Number(e.target.value);
            setSpaceWidth(val);
            updateMetrics({ spaceWidth: val });
          }}
          style={{ width: '100%' }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
          {[
            { label: 'Tight', val: 220 },
            { label: 'Normal', val: 280 },
            { label: '1/3 Em', val: 333 },
            { label: 'Wide', val: 380 },
          ].map((preset) => (
            <button
              key={preset.label}
              className="btn-secondary"
              style={{
                padding: '3px 0',
                fontSize: '9px',
                justifyContent: 'center',
                backgroundColor: spaceWidth === preset.val ? 'rgba(99, 102, 241, 0.25)' : undefined,
                borderColor: spaceWidth === preset.val ? 'var(--accent)' : undefined,
                color: spaceWidth === preset.val ? '#fff' : undefined,
              }}
              onClick={() => handleSetSpacePreset(preset.val)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </SidebarSection>
    </StandardSidebar>
  );
};
