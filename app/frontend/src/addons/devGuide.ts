import type { StudioAddon } from './types.ts';

export const BOILERPLATE_MANIFEST = `{
  "$schema": "https://local-font-studio.dev/schemas/addon-v1.json",
  "id": "my-custom-addon",
  "name": "My Custom Addon",
  "version": "1.0.0",
  "tagline": "A powerful custom typography extension.",
  "description": "Extends Local Font Studio with custom glyph generation, metric transformations, or export filters.",
  "author": "Jane Doe <jane@example.com>",
  "category": "tools",
  "icon": "code",
  "hasTab": true,
  "tabLabel": "My Tools",
  "tabBadge": "CUSTOM",
  "websiteUrl": "https://github.com/my-user/my-custom-addon",
  "actions": [
    {
      "id": "action-generate",
      "name": "Generate Glyph Shapes",
      "description": "Applies an algorithmic transformation across selected glyphs."
    }
  ]
}`;

export const BOILERPLATE_REACT_VIEW = `import React, { useState } from 'react';
import { useFont } from '../../context/FontContext';
import { useAppSettings } from '../../context/AppSettingsContext';

export const MyCustomAddonView: React.FC = () => {
  const { project, updateGlyph, updateGlyphsBatch } = useFont();
  const { settings } = useAppSettings();
  const [status, setStatus] = useState<string>('');

  const handleRun = () => {
    // Access project.glyphs, font metrics, or active style
    setStatus('Addon executed successfully!');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>My Custom Addon</h2>
      <p>Seamlessly integrated into Local Font Studio.</p>
      <button className="btn-primary" onClick={handleRun}>Run Custom Action</button>
      {status && <p style={{ color: '#10b981', marginTop: '12px' }}>{status}</p>}
    </div>
  );
};
`;

export const STARTER_TEMPLATES: Array<{ id: string; name: string; description: string; addon: StudioAddon }> = [
  {
    id: 'math-symbols-pack',
    name: 'Math & Greek Symbols Pack',
    description: 'Injects mathematical and scientific symbols (π, ∑, √, ∫, ≈, ≠, ∞) into your font project.',
    addon: {
      id: 'math-symbols-pack',
      name: 'Math & Greek Symbols Pack',
      version: '1.0.0',
      tagline: 'Rapidly inject mathematical, logic, and scientific glyphs.',
      description: 'Provides 1-click generation for high-demand mathematical operators including Summation (∑), Radical (√), Pi (π), Infinity (∞), Integral (∫), and comparison symbols.',
      author: 'Open Type Community',
      category: 'presets',
      icon: 'sparkles',
      isOfficial: false,
      defaultEnabled: true,
      hasTab: true,
      tabLabel: 'Math Pack',
      tabBadge: 'MATH',
      actions: [
        {
          id: 'inject-calculus',
          name: 'Inject Calculus Glyphs',
          description: 'Adds Integral (∫ U+222B) and Partial Differential (∂ U+2202).'
        },
        {
          id: 'inject-algebra',
          name: 'Inject Algebra Symbols',
          description: 'Adds Summation (∑ U+2211), Product (∏ U+220F), and Sqrt (√ U+221A).'
        }
      ]
    }
  },
  {
    id: 'monospace-validator',
    name: 'Monospace Code Font Auditor',
    description: 'Enforces strict uniform advance width across all ASCII and code glyphs for programmer fonts.',
    addon: {
      id: 'monospace-validator',
      name: 'Monospace Code Font Auditor',
      version: '1.0.0',
      tagline: 'Guarantees strict character cell uniformity for terminal & coding fonts.',
      description: 'Audits every assigned glyph to ensure the advance width matches the exact target cell pitch (e.g. 600 UPM), flagging any deviation that would break column alignment in IDEs.',
      author: 'DevTools Typography Guild',
      category: 'typography',
      icon: 'code',
      isOfficial: false,
      defaultEnabled: true,
      hasTab: true,
      tabLabel: 'Monospace Audit',
      tabBadge: 'MONO',
      actions: [
        {
          id: 'snap-cell-pitch',
          name: 'Snap All Advances to 600 UPM',
          description: 'Re-aligns every assigned character to standard terminal advance width.'
        },
        {
          id: 'audit-code-ligatures',
          name: 'Verify Fira/JetBrains Code Ligatures',
          description: 'Checks for standard arrows (->, =>, !=, ===).'
        }
      ]
    }
  },
  {
    id: 'dingbats-ornaments',
    name: 'Vintage Dingbats & Ornaments',
    description: 'Adds classic printer fleurs, manicules (pointing hands ☞), and ornamental flourishes.',
    addon: {
      id: 'dingbats-ornaments',
      name: 'Vintage Dingbats & Ornaments',
      version: '1.0.0',
      tagline: 'Historical printer fleurs, asterisms, and typographic flourishes.',
      description: 'Includes 16th-century style manicules (☞ ☛), asterisms (⁂), fleurons (❧), and dividing flourish rules for decorative book design.',
      author: 'Book Arts Press',
      category: 'publishing',
      icon: 'wand',
      isOfficial: false,
      defaultEnabled: true,
      hasTab: true,
      tabLabel: 'Ornaments',
      tabBadge: 'ORNAMENT',
      actions: [
        {
          id: 'inject-manicules',
          name: 'Inject Pointing Hands (☞ ☛)',
          description: 'Generates left and right pointing hands (U+261E, U+261B).'
        },
        {
          id: 'inject-fleurons',
          name: 'Inject Hedera Ivy / Fleuron (❧)',
          description: 'Injects traditional typographic leaf ornaments (U+2767).'
        }
      ]
    }
  }
];
