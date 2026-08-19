import { Platform } from 'react-native';

// Three hues only: ink (text), paper (background), accent (the one active/brand color).
// Every other token (surface, border, muted) is a tonal variant of one of these three,
// not a new color — kept deliberately restrained for a sober, non-decorative UI.
const ink = '#14171A';
const paper = '#F7F6F3';
const accentLight = '#1F3A5F';
const accentDark = '#6E93BE';

export const Colors = {
  light: {
    text: ink,
    background: paper,
    surface: '#FFFFFF',
    border: 'rgba(20, 23, 26, 0.12)',
    muted: 'rgba(20, 23, 26, 0.56)',
    tint: accentLight,
    icon: 'rgba(20, 23, 26, 0.6)',
    tabIconDefault: 'rgba(20, 23, 26, 0.5)',
    tabIconSelected: accentLight,
  },
  dark: {
    text: '#F2F1ED',
    background: '#101214',
    surface: '#181B1E',
    border: 'rgba(242, 241, 237, 0.14)',
    muted: 'rgba(242, 241, 237, 0.6)',
    tint: accentDark,
    icon: 'rgba(242, 241, 237, 0.65)',
    tabIconDefault: 'rgba(242, 241, 237, 0.5)',
    tabIconSelected: accentDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
