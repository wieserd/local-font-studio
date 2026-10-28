export type AddonCategory = 'publishing' | 'tools' | 'typography' | 'presets';
export type AddonIconType = 'comic' | 'pixel' | 'icons' | 'custom' | 'code' | 'wand' | 'sparkles' | 'puzzle';

export interface AddonAction {
  id: string;
  name: string;
  description: string;
  buttonLabel?: string;
  targetUnicode?: string;
}

export interface StudioAddon {
  id: string;
  name: string;
  version: string;
  tagline: string;
  description: string;
  author: string;
  icon: AddonIconType;
  category: AddonCategory;
  isOfficial: boolean;
  defaultEnabled: boolean;
  hasTab?: boolean;
  tabId?: string;
  tabLabel?: string;
  tabBadge?: string;
  websiteUrl?: string;
  actions?: AddonAction[];
  customSnippet?: string;
}

export interface AddonState {
  enabledAddonIds: Record<string, boolean>;
  customAddons: StudioAddon[];
}

export interface ManifestValidationResult {
  valid: boolean;
  errors: string[];
  addon?: StudioAddon;
}

export function validateAddonManifest(raw: unknown): ManifestValidationResult {
  const errors: string[] = [];

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, errors: ['Manifest must be a valid JSON object.'] };
  }

  const obj = raw as Record<string, unknown>;

  // 1. ID check
  if (typeof obj.id !== 'string' || !/^[a-z0-9-]+$/.test(obj.id)) {
    errors.push('Field "id" is required and must contain only lowercase alphanumeric characters and hyphens (e.g. "my-custom-addon").');
  }

  // 2. Name check
  if (typeof obj.name !== 'string' || obj.name.trim().length < 2) {
    errors.push('Field "name" is required and must be at least 2 characters.');
  }

  // 3. Version check
  if (typeof obj.version !== 'string' || obj.version.trim().length === 0) {
    errors.push('Field "version" is required (e.g. "1.0.0").');
  }

  // 4. Tagline & Description
  if (typeof obj.tagline !== 'string' || obj.tagline.trim().length === 0) {
    errors.push('Field "tagline" is required (short 1-line summary).');
  }
  if (typeof obj.description !== 'string' || obj.description.trim().length === 0) {
    errors.push('Field "description" is required.');
  }

  // 5. Author
  if (typeof obj.author !== 'string' || obj.author.trim().length === 0) {
    errors.push('Field "author" is required (e.g. your name or team).');
  }

  // 6. Category
  const validCategories: AddonCategory[] = ['publishing', 'tools', 'typography', 'presets'];
  const category = (obj.category as AddonCategory) || 'tools';
  if (obj.category && !validCategories.includes(obj.category as AddonCategory)) {
    errors.push(`Field "category" must be one of: ${validCategories.join(', ')}.`);
  }

  // 7. Icon
  const validIcons: AddonIconType[] = ['comic', 'pixel', 'icons', 'custom', 'code', 'wand', 'sparkles', 'puzzle'];
  const icon = (obj.icon as AddonIconType) || 'custom';
  if (obj.icon && !validIcons.includes(obj.icon as AddonIconType)) {
    errors.push(`Field "icon" must be one of: ${validIcons.join(', ')}.`);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const addon: StudioAddon = {
    id: obj.id as string,
    name: obj.name as string,
    version: obj.version as string,
    tagline: obj.tagline as string,
    description: obj.description as string,
    author: obj.author as string,
    category,
    icon,
    isOfficial: false, // user-installed custom addons are marked as custom
    defaultEnabled: true,
    hasTab: Boolean(obj.hasTab),
    tabId: typeof obj.tabId === 'string' ? obj.tabId : (obj.hasTab ? (obj.id as string) : undefined),
    tabLabel: typeof obj.tabLabel === 'string' ? obj.tabLabel : (obj.name as string),
    tabBadge: typeof obj.tabBadge === 'string' ? obj.tabBadge : 'CUSTOM',
    websiteUrl: typeof obj.websiteUrl === 'string' ? obj.websiteUrl : undefined,
    actions: Array.isArray(obj.actions) ? (obj.actions as AddonAction[]) : undefined,
    customSnippet: typeof obj.customSnippet === 'string' ? obj.customSnippet : undefined
  };

  return { valid: true, errors: [], addon };
}
