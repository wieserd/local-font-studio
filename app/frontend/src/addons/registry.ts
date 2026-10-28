import type { StudioAddon } from './types.ts';

export const AVAILABLE_ADDONS: StudioAddon[] = [
  {
    id: 'comic-lettering',
    name: 'Comic Lettering & SFX Studio',
    version: '1.0.0',
    tagline: 'Specialized indie comic dialogue, Crossbar-I pronouns, SFX word-art & speech balloons.',
    description: 'Tailored for independent comic creators, manga letterers, and graphic novel publishers. Adds a specialized Comic Lettering tab, speech balloon simulator, automated Crossbar-I pronoun handling, comic sound-effects generator (BOOM!, POW!), and grawlix profanity symbol packs.',
    author: 'Local Font Studio Team',
    icon: 'comic',
    category: 'publishing',
    isOfficial: true,
    defaultEnabled: true,
    hasTab: true,
    tabId: 'comic-lettering',
    tabLabel: 'Comic Lettering',
    tabBadge: 'COMIC'
  },
  {
    id: 'pixel-font',
    name: 'Retro 8-Bit Pixel Generator',
    version: '0.9.0',
    tagline: 'Grid-based pixel snapping, arcade bitmap vectors, and retro video game font presets.',
    description: 'Allows indie game developers to craft classic pixel fonts snapped to 8x8, 16x16, or custom tile grids without sub-pixel aliasing errors.',
    author: 'Local Font Studio Community',
    icon: 'pixel',
    category: 'tools',
    isOfficial: true,
    defaultEnabled: false
  },
  {
    id: 'dingbat-icons',
    name: 'Symbol & Icon Font Packager',
    version: '0.9.5',
    tagline: 'Map SVG iconography sets directly into private Unicode PUA slots for web and apps.',
    description: 'Quickly bundle custom icon graphics into a single webfont file with CSS glyph class generation and semantic Unicode Private Use Area (PUA) mapping.',
    author: 'Local Font Studio Community',
    icon: 'icons',
    category: 'presets',
    isOfficial: true,
    defaultEnabled: false
  }
];

export const getAddonById = (id: string): StudioAddon | undefined => {
  return AVAILABLE_ADDONS.find(addon => addon.id === id);
};
