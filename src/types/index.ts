export interface GridSettings {
  columns: number;
  gutter: number;
  margin: number;
  maxWidth: number;
  opacity: number;
  color: string;
  showGrid: boolean;
  showVerticalGrid: boolean;
  verticalColumns: number;
  verticalGutter: number;
  verticalMargin: number;
}

export interface ScreenPreset {
  name: string;
  width: number;
  description: string;
}

export interface ExtensionMessage {
  type: 'TOGGLE_GRID' | 'UPDATE_SETTINGS' | 'GET_SETTINGS' | 'SETTINGS_RESPONSE';
  payload?: any;
}

export const DEFAULT_SETTINGS: GridSettings = {
  columns: 12,
  gutter: 20,
  margin: 16,
  maxWidth: 1200,
  opacity: 0.3,
  color: '#3b82f6',
  showGrid: false,
  showVerticalGrid: false,
  verticalColumns: 8,
  verticalGutter: 20,
  verticalMargin: 16
};

export const SCREEN_PRESETS: ScreenPreset[] = [
  { name: 'Mobile', width: 375, description: 'iPhone SE' },
  { name: 'Mobile Large', width: 414, description: 'iPhone Pro' },
  { name: 'Tablet', width: 768, description: 'iPad' },
  { name: 'Tablet Large', width: 1024, description: 'iPad Pro' },
  { name: 'Desktop', width: 1200, description: 'Standard Desktop' },
  { name: 'Desktop Large', width: 1440, description: 'Large Desktop' }
];