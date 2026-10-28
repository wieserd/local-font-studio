import React, { useState } from 'react';
import {
  Puzzle,
  X,
  Check,
  Zap,
  BookOpen,
  Sparkles,
  Grid,
  ShieldCheck,
  Plus,
  Trash2,
  Code,
  Upload,
  Copy,
  FileText,
  AlertCircle,
  Terminal,
  Wand2
} from 'lucide-react';
import { useAddons } from './useAddons';
import { StudioAddon, AddonCategory, validateAddonManifest } from './types';
import { BOILERPLATE_MANIFEST, BOILERPLATE_REACT_VIEW, STARTER_TEMPLATES } from './devGuide';

type ManagerTab = 'installed' | 'install' | 'docs';
type InstallMode = 'json' | 'form';

interface AddonManagerContentProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const AddonManagerContent: React.FC<AddonManagerContentProps> = ({ isModal = false, onClose }) => {
  const {
    addons,
    isAddonEnabled,
    toggleAddon,
    installCustomAddon,
    uninstallCustomAddon
  } = useAddons();

  const [activeTab, setActiveTab] = useState<ManagerTab>('installed');
  const [installMode, setInstallMode] = useState<InstallMode>('json');
  const [jsonInput, setJsonInput] = useState<string>(BOILERPLATE_MANIFEST);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form builder fields
  const [formName, setFormName] = useState('My Custom Tool');
  const [formId, setFormId] = useState('my-custom-tool');
  const [formVersion, setFormVersion] = useState('1.0.0');
  const [formAuthor, setFormAuthor] = useState('Type Designer');
  const [formCategory, setFormCategory] = useState<AddonCategory>('tools');
  const [formTagline, setFormTagline] = useState('Custom typography enhancement utility.');
  const [formDescription, setFormDescription] = useState('Adds custom glyph manipulation tools and presets.');
  const [formHasTab, setFormHasTab] = useState(true);
  const [formTabLabel, setFormTabLabel] = useState('Custom Tool');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('✓ Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleJsonChange = (val: string) => {
    setJsonInput(val);
  };

  // Live validation for JSON input
  const validationResult = React.useMemo(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      return validateAddonManifest(parsed);
    } catch (e) {
      return {
        valid: false,
        errors: [`SyntaxError: ${(e as Error).message}`]
      };
    }
  }, [jsonInput]);

  const handleInstallFromJson = () => {
    const res = installCustomAddon(jsonInput);
    if (res.success) {
      showToast(`✓ Successfully installed "${res.addon?.name}"!`);
      setActiveTab('installed');
    } else {
      showToast(`Installation failed: ${res.error}`);
    }
  };

  const handleInstallFromForm = (e: React.FormEvent) => {
    e.preventDefault();
    const manifestObj: Partial<StudioAddon> = {
      id: formId.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      name: formName.trim(),
      version: formVersion.trim() || '1.0.0',
      author: formAuthor.trim(),
      category: formCategory,
      tagline: formTagline.trim(),
      description: formDescription.trim(),
      icon: 'custom',
      hasTab: formHasTab,
      tabLabel: formHasTab ? formTabLabel.trim() : undefined,
      tabBadge: 'CUSTOM'
    };

    const res = installCustomAddon(manifestObj);
    if (res.success) {
      showToast(`✓ Successfully created and installed "${res.addon?.name}"!`);
      setActiveTab('installed');
    } else {
      showToast(`Failed to create addon: ${res.error}`);
    }
  };

  const handleLoadTemplate = (template: typeof STARTER_TEMPLATES[0]) => {
    setJsonInput(JSON.stringify(template.addon, null, 2));
    setInstallMode('json');
    showToast(`Loaded template: "${template.name}"`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJsonInput(content);
        showToast(`Loaded file: ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const renderAddonIcon = (addon: StudioAddon) => {
    switch (addon.icon) {
      case 'comic':
        return <Zap size={22} color="#f59e0b" />;
      case 'pixel':
        return <Grid size={22} color="#10b981" />;
      case 'icons':
        return <Sparkles size={22} color="#a855f7" />;
      case 'code':
        return <Code size={22} color="#38bdf8" />;
      case 'wand':
        return <Wand2 size={22} color="#ec4899" />;
      case 'sparkles':
        return <Sparkles size={22} color="#facc15" />;
      default:
        return <Puzzle size={22} color="var(--accent)" />;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: 'var(--bg-card)',
        borderRadius: isModal ? '12px' : '0',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: '#10b981',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)'
            }}
          >
            <Puzzle size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Extensions & Addons Studio
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-faint)', margin: '2px 0 0 0' }}>
              Manage official extensions, install custom typography addons, or build your own plugins.
            </p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '6px', borderRadius: '6px' }}
            title="Close"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 20px',
          backgroundColor: 'var(--bg-main)',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <button
          onClick={() => setActiveTab('installed')}
          style={{
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: activeTab === 'installed' ? 600 : 400,
            color: activeTab === 'installed' ? '#fff' : 'var(--text-muted)',
            backgroundColor: activeTab === 'installed' ? 'var(--accent)' : 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Puzzle size={13} />
          <span>Installed Addons ({addons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('install')}
          style={{
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: activeTab === 'install' ? 600 : 400,
            color: activeTab === 'install' ? '#fff' : 'var(--text-muted)',
            backgroundColor: activeTab === 'install' ? 'var(--accent)' : 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Plus size={13} />
          <span>+ Install Custom Addon</span>
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          style={{
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: activeTab === 'docs' ? 600 : 400,
            color: activeTab === 'docs' ? '#fff' : 'var(--text-muted)',
            backgroundColor: activeTab === 'docs' ? 'var(--accent)' : 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <BookOpen size={13} />
          <span>Developer Guide & Spec</span>
        </button>
      </div>

      {/* Tab 1: Installed Addons */}
      {activeTab === 'installed' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {addons.map((addon) => {
            const enabled = isAddonEnabled(addon.id);

            return (
              <div
                key={addon.id}
                style={{
                  backgroundColor: 'var(--bg-main)',
                  border: `1px solid ${enabled ? 'rgba(99, 102, 241, 0.4)' : 'var(--border)'}`,
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '16px',
                  transition: 'border-color 0.15s, background-color 0.15s',
                  boxShadow: enabled ? '0 4px 20px rgba(99, 102, 241, 0.08)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {renderAddonIcon(addon)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {addon.name}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-faint)', backgroundColor: 'var(--bg-surface)', padding: '1px 5px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                        v{addon.version}
                      </span>
                      {addon.isOfficial ? (
                        <span style={{ fontSize: '9px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                          <ShieldCheck size={11} /> Official
                        </span>
                      ) : (
                        <span style={{ fontSize: '9px', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.12)', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                          ★ Custom Addon
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: '9px',
                          color: '#f59e0b',
                          backgroundColor: 'rgba(245, 158, 11, 0.14)',
                          border: '1px solid rgba(245, 158, 11, 0.35)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          letterSpacing: '0.02em'
                        }}
                      >
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                        in development
                      </span>
                      <span className="badge badge-gray" style={{ fontSize: '9px', textTransform: 'capitalize' }}>
                        {addon.category}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 500, marginTop: '3px' }}>
                      {addon.tagline}
                    </div>

                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: '1.4', marginTop: '6px' }}>
                      {addon.description}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                      {addon.hasTab && (
                        <span style={{ fontSize: '9.5px', color: 'var(--text-faint)' }}>
                          ⚡ Injects workspace tab: <strong>{addon.tabLabel || addon.name}</strong>
                        </span>
                      )}
                      <span style={{ fontSize: '9.5px', color: 'var(--text-faint)' }}>
                        Author: {addon.author}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions & Switch */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {!addon.isOfficial && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to uninstall custom addon "${addon.name}"?`)) {
                            uninstallCustomAddon(addon.id);
                            showToast(`Uninstalled "${addon.name}"`);
                          }
                        }}
                        className="btn-ghost"
                        style={{ padding: '4px', color: '#ef4444', borderRadius: '4px' }}
                        title="Uninstall custom addon"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    <button
                      onClick={() => toggleAddon(addon.id)}
                      style={{
                        width: '44px',
                        height: '24px',
                        borderRadius: '12px',
                        backgroundColor: enabled ? 'var(--accent)' : 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background-color 0.2s',
                        outline: 'none',
                        padding: '2px'
                      }}
                      title={enabled ? `Disable ${addon.name}` : `Enable ${addon.name}`}
                    >
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: '#ffffff',
                          transform: enabled ? 'translateX(20px)' : 'translateX(0)',
                          transition: 'transform 0.2s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}
                      />
                    </button>
                  </div>

                  <span style={{ fontSize: '10px', fontWeight: 600, color: enabled ? '#10b981' : 'var(--text-faint)' }}>
                    {enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Install Custom Addon */}
      {activeTab === 'install' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top Bar with Mode Switcher & Presets */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setInstallMode('json')}
                className={installMode === 'json' ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '11px', padding: '4px 10px', gap: '5px' }}
              >
                <Code size={12} />
                <span>JSON Manifest Importer</span>
              </button>
              <button
                onClick={() => setInstallMode('form')}
                className={installMode === 'form' ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '11px', padding: '4px 10px', gap: '5px' }}
              >
                <FileText size={12} />
                <span>Visual Addon Builder</span>
              </button>
            </div>

            {/* Starter Presets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Load Starter Template:</span>
              {STARTER_TEMPLATES.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => handleLoadTemplate(tpl)}
                  className="btn-secondary"
                  style={{ fontSize: '10.5px', padding: '3px 8px' }}
                  title={tpl.description}
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mode A: JSON Manifest */}
          {installMode === 'json' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Paste Manifest JSON or Load File:
                </label>
                <label
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '3px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Upload size={12} />
                  <span>Upload .json</span>
                  <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>

              <textarea
                value={jsonInput}
                onChange={(e) => handleJsonChange(e.target.value)}
                rows={12}
                style={{
                  width: '100%',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  padding: '12px',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  border: `1px solid ${validationResult.valid ? 'var(--border)' : '#ef4444'}`,
                  borderRadius: '8px',
                  resize: 'vertical'
                }}
                placeholder="Paste addon manifest JSON here..."
              />

              {/* Validation Status Box */}
              {validationResult.valid ? (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid #10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '12px' }}>
                    <Check size={16} />
                    <span><strong>Valid Manifest:</strong> "{validationResult.addon?.name}" (v{validationResult.addon?.version}) ready to install.</span>
                  </div>

                  <button
                    className="btn-primary"
                    onClick={handleInstallFromJson}
                    style={{ fontSize: '11px', padding: '5px 14px', gap: '6px' }}
                  >
                    <Plus size={13} />
                    <span>Install & Activate Addon</span>
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid #ef4444',
                  color: '#f87171',
                  fontSize: '11.5px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <AlertCircle size={14} />
                    <span>Manifest Validation Errors:</span>
                  </div>
                  {validationResult.errors.map((err, idx) => (
                    <div key={idx} style={{ paddingLeft: '20px' }}>• {err}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mode B: Visual Addon Form */}
          {installMode === 'form' && (
            <form onSubmit={handleInstallFromForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Addon Display Name *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      setFormId(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }}
                    required
                    style={{ width: '100%', fontSize: '12px', padding: '6px 10px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Unique Identifier (kebab-case) *
                  </label>
                  <input
                    type="text"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    required
                    style={{ width: '100%', fontSize: '12px', padding: '6px 10px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Version *
                  </label>
                  <input
                    type="text"
                    value={formVersion}
                    onChange={(e) => setFormVersion(e.target.value)}
                    required
                    style={{ width: '100%', fontSize: '12px', padding: '6px 10px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Author *
                  </label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    required
                    style={{ width: '100%', fontSize: '12px', padding: '6px 10px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as AddonCategory)}
                    style={{ width: '100%', fontSize: '12px', padding: '6px 10px' }}
                  >
                    <option value="tools">Tools</option>
                    <option value="typography">Typography</option>
                    <option value="publishing">Publishing</option>
                    <option value="presets">Presets</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  1-Line Tagline *
                </label>
                <input
                  type="text"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  required
                  style={{ width: '100%', fontSize: '12px', padding: '6px 10px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Full Description *
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  required
                  style={{ width: '100%', fontSize: '12px', padding: '6px 10px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '10px', backgroundColor: 'var(--bg-main)', borderRadius: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formHasTab}
                    onChange={(e) => setFormHasTab(e.target.checked)}
                  />
                  <span>Inject dedicated Workspace Tab in navigation bar</span>
                </label>

                {formHasTab && (
                  <input
                    type="text"
                    value={formTabLabel}
                    onChange={(e) => setFormTabLabel(e.target.value)}
                    placeholder="Tab Label (e.g. My Tools)"
                    style={{ fontSize: '11px', padding: '4px 8px', width: '160px' }}
                  />
                )}
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ alignSelf: 'flex-start', fontSize: '12px', padding: '8px 18px', gap: '6px' }}
              >
                <Plus size={14} />
                <span>Create & Install Custom Addon</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab 3: Developer Guide & Spec */}
      {activeTab === 'docs' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Overview */}
          <div style={{
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={16} style={{ color: 'var(--accent)' }} />
              <span>Local Font Studio Addon Architecture & Developer Guide</span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
              Local Font Studio supports modular addons that execute 100% client-side in the browser. Addons can add dedicated views, inject custom character sets, automate metric calculations, or expose custom algorithmic tools.
            </p>
          </div>

          {/* Spec Table */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-main)' }}>
              1. Manifest JSON Schema Specification
            </h4>
            <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-faint)' }}>
                  <th style={{ padding: '6px 8px' }}>Field</th>
                  <th style={{ padding: '6px 8px' }}>Type</th>
                  <th style={{ padding: '6px 8px' }}>Required</th>
                  <th style={{ padding: '6px 8px' }}>Description</th>
                </tr>
              </thead>
              <tbody style={{ color: 'var(--text-muted)' }}>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: 'var(--accent)' }}>id</td>
                  <td style={{ padding: '6px 8px' }}>string</td>
                  <td style={{ padding: '6px 8px', color: '#10b981' }}>Yes</td>
                  <td style={{ padding: '6px 8px' }}>Kebab-case unique identifier (e.g. <code>"math-tools"</code>).</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: 'var(--accent)' }}>name</td>
                  <td style={{ padding: '6px 8px' }}>string</td>
                  <td style={{ padding: '6px 8px', color: '#10b981' }}>Yes</td>
                  <td style={{ padding: '6px 8px' }}>Human-readable name of the addon.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: 'var(--accent)' }}>version</td>
                  <td style={{ padding: '6px 8px' }}>string</td>
                  <td style={{ padding: '6px 8px', color: '#10b981' }}>Yes</td>
                  <td style={{ padding: '6px 8px' }}>SemVer string (e.g. <code>"1.0.0"</code>).</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: 'var(--accent)' }}>category</td>
                  <td style={{ padding: '6px 8px' }}>string</td>
                  <td style={{ padding: '6px 8px', color: '#10b981' }}>Yes</td>
                  <td style={{ padding: '6px 8px' }}><code>"publishing"</code>, <code>"tools"</code>, <code>"typography"</code>, or <code>"presets"</code>.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: 'var(--accent)' }}>hasTab</td>
                  <td style={{ padding: '6px 8px' }}>boolean</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text-faint)' }}>Optional</td>
                  <td style={{ padding: '6px 8px' }}>When true, renders an icon tab in the top workspace navigation.</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: 'var(--accent)' }}>actions</td>
                  <td style={{ padding: '6px 8px' }}>array</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text-faint)' }}>Optional</td>
                  <td style={{ padding: '6px 8px' }}>Interactive actions/generators executable inside the studio.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Boilerplate Manifest Code */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                2. Starter Addon Manifest Template (`addon.json`)
              </h4>
              <button
                className="btn-secondary"
                onClick={() => copyToClipboard(BOILERPLATE_MANIFEST, 'manifest')}
                style={{ fontSize: '11px', padding: '3px 8px', gap: '4px' }}
              >
                {copiedKey === 'manifest' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                <span>{copiedKey === 'manifest' ? 'Copied!' : 'Copy JSON'}</span>
              </button>
            </div>

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
              {BOILERPLATE_MANIFEST}
            </pre>
          </div>

          {/* React View Boilerplate */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                3. TypeScript / React Studio View Template (`CustomView.tsx`)
              </h4>
              <button
                className="btn-secondary"
                onClick={() => copyToClipboard(BOILERPLATE_REACT_VIEW, 'view')}
                style={{ fontSize: '11px', padding: '3px 8px', gap: '4px' }}
              >
                {copiedKey === 'view' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                <span>{copiedKey === 'view' ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

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
              {BOILERPLATE_REACT_VIEW}
            </pre>
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface)',
          fontSize: '11px',
          color: 'var(--text-faint)'
        }}
      >
        <span>
          Custom addons are stored safely in your browser storage. No server dependency.
        </span>
        {isModal && onClose && (
          <button className="btn-secondary" onClick={onClose} style={{ padding: '5px 14px' }}>
            Done
          </button>
        )}
      </div>
    </div>
  );
};
