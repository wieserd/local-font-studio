import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Settings, ShieldCheck, Layers, Info } from 'lucide-react';
import { useFont } from '../context/FontContext';
import { useAppSettings } from '../context/AppSettingsContext';

export const FontSettingsView: React.FC = () => {
  const { 
    project, 
    setProjectName, 
    updateMetadata, 
    activeStyle, 
    stylesList, 
    switchStyle, 
    updateStyleMetadata 
  } = useFont();

  const { setIsSettingsModalOpen } = useAppSettings();

  const [family, setFamily] = useState(project.metadata.family || project.name || 'Untitled Typeface');
  const [styleName, setStyleName] = useState(activeStyle.name || 'Regular');
  const [weightClass, setWeightClass] = useState(activeStyle.weightClass || 400);
  const [isItalic, setIsItalic] = useState(activeStyle.isItalic || false);
  const [designer, setDesigner] = useState(project.metadata.designer || 'Studio Author');
  const [manufacturer, setManufacturer] = useState(project.metadata.manufacturer || 'Local Font Studio');
  const [version, setVersion] = useState(project.metadata.version || '1.000');
  const [vendorId, setVendorId] = useState(project.metadata.vendorId || 'LFS');
  const [copyright, setCopyright] = useState(project.metadata.copyright || '© 2026 Author. All rights reserved.');
  const [license, setLicense] = useState(project.metadata.license || 'SIL Open Font License 1.1 or Custom Personal License.');

  // Sync state when activeStyle or project changes
  useEffect(() => {
    setFamily(project.metadata.family || project.name);
    setStyleName(activeStyle.name);
    setWeightClass(activeStyle.weightClass);
    setIsItalic(activeStyle.isItalic);
  }, [activeStyle.id, project.metadata.family, project.name]);

  const psName = `${family.replace(/\s+/g, '')}-${styleName.replace(/\s+/g, '')}`;
  const fullName = `${family} ${styleName}`;

  const handleUpdateFamily = (val: string) => {
    setFamily(val);
    setProjectName(val);
    updateMetadata({ family: val });
  };

  const handleUpdateStyleName = (val: string) => {
    setStyleName(val);
    updateMetadata({ style: val });
    updateStyleMetadata(activeStyle.id, { name: val });
  };

  const handleUpdateWeightClass = (val: number) => {
    setWeightClass(val);
    updateStyleMetadata(activeStyle.id, { weightClass: val });
  };

  const handleUpdateItalic = (val: boolean) => {
    setIsItalic(val);
    updateStyleMetadata(activeStyle.id, { isItalic: val });
  };

  const handleUpdateDesigner = (val: string) => {
    setDesigner(val);
    updateMetadata({ designer: val });
  };

  const handleUpdateManufacturer = (val: string) => {
    setManufacturer(val);
    updateMetadata({ manufacturer: val });
  };

  const handleUpdateVersion = (val: string) => {
    setVersion(val);
    updateMetadata({ version: val });
  };

  const handleUpdateCopyright = (val: string) => {
    setCopyright(val);
    updateMetadata({ copyright: val });
  };

  const handleUpdateLicense = (val: string) => {
    setLicense(val);
    updateMetadata({ license: val });
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Scope Clarification Notice Banner */}
      <div style={{
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={16} color="var(--accent)" />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            This section configures <strong>Font Binary Metadata</strong> (OpenType 'name' table). Looking for workspace preferences like <strong>Auto-Save</strong> or <strong>Canvas Themes</strong>?
          </span>
        </div>
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="btn-secondary"
          style={{ fontSize: '11px', padding: '4px 10px', gap: '5px', whiteSpace: 'nowrap' }}
        >
          <Settings size={12} color="var(--accent)" />
          <span>App Preferences (⌘,)</span>
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Font Metadata & OpenType Naming</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-faint)', margin: '4px 0 0 0' }}>
            These parameters populate the standard OpenType 'name' table and OS/2 table upon font compilation.
          </p>
        </div>
      </div>

      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Style Selector Banner */}
        <div style={{
          backgroundColor: 'var(--bg-main)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} color="var(--accent)" />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Configuring Active Cut:</span>
            <strong style={{ fontSize: '13px' }}>{activeStyle.name}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Switch Cut:</span>
            <select
              value={activeStyle.id}
              onChange={(e) => switchStyle(e.target.value)}
              style={{ fontSize: '12px', padding: '3px 8px' }}
            >
              {stylesList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.weightClass})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Family & Style */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Font Family Name
            </label>
            <input
              type="text"
              value={family}
              onChange={(e) => handleUpdateFamily(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Subfamily / Style Name
            </label>
            <input
              type="text"
              value={styleName}
              onChange={(e) => handleUpdateStyleName(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Weight & Italic */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              OS/2 Weight Class (100–900)
            </label>
            <input 
              type="number" 
              min="100" 
              max="900" 
              step="50" 
              value={weightClass} 
              onChange={(e) => handleUpdateWeightClass(Number(e.target.value))} 
              style={{ width: '100%' }} 
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', paddingTop: '18px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={isItalic}
                onChange={(e) => handleUpdateItalic(e.target.checked)}
              />
              <span>Italic / Slanted Style (sets OpenType italic bit)</span>
            </label>
          </div>
        </div>

        {/* Generated Names */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Full Font Name (nameID 4)
            </label>
            <input type="text" value={fullName} disabled style={{ width: '100%', opacity: 0.75, cursor: 'not-allowed' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              PostScript Name (nameID 6 - ASCII only)
            </label>
            <input type="text" value={psName} disabled style={{ width: '100%', opacity: 0.75, cursor: 'not-allowed' }} />
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />

        {/* Creator & Version */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Designer / Author
            </label>
            <input
              type="text"
              value={designer}
              onChange={(e) => handleUpdateDesigner(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Manufacturer
            </label>
            <input
              type="text"
              value={manufacturer}
              onChange={(e) => handleUpdateManufacturer(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Version (e.g. 1.000)
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => handleUpdateVersion(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Copyright & License */}
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Copyright Statement (nameID 0)
          </label>
          <input
            type="text"
            value={copyright}
            onChange={(e) => handleUpdateCopyright(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            License Description (nameID 13)
          </label>
          <textarea
            value={license}
            onChange={(e) => handleUpdateLicense(e.target.value)}
            rows={3}
            style={{ width: '100%', resize: 'vertical' }}
          />
        </div>
      </div>
    </div>
  );
};
