export type EditorTool = 'select' | 'move-bitmap' | 'pen' | 'node' | 'knife' | 'transform' | 'rotate';

export type ResizeHandle = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w';

export interface GlyphEditorViewProps {
  glyphChar: string;
  onReplaceGlyph?: (char: string) => void;
}

export type AccordionSectionId = 
  | 'metrics' 
  | 'transform' 
  | 'curves' 
  | 'nodes' 
  | 'bitmap' 
  | 'advanced';
