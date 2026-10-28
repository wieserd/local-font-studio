export interface GlyphFilterState {
  status: 'all' | 'assigned' | 'missing' | 'bitmap';
  case: 'all' | 'uppercase' | 'lowercase';
  category: 'all' | 'letters' | 'numbers' | 'special';
}

export const DEFAULT_FILTERS: GlyphFilterState = {
  status: 'all',
  case: 'all',
  category: 'all'
};

export interface OverwriteModalState {
  sourceChar: string;
  targetChar: string;
}
