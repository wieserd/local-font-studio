export interface GlyphBox {
  id: string;
  char: string;
  x: number;      // Image pixel coordinates
  y: number;
  width: number;
  height: number;
}

export type ResizeHandle = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w';

export type ToolMode = 'snap' | 'draw' | 'move' | 'resize';

export interface ConflictInfo {
  hasConflict: boolean;
  char: string;
  location: 'current_image' | 'font_project' | null;
  conflictingBoxId?: string;
}
