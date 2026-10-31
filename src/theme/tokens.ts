/**
 * Design tokens for Hanuman Chalisa & Bhakti.
 *
 * Palette is drawn from the devotional artwork itself: lamp-lit gold, saffron
 * and deep night tones. Every screen reads colours from `ThemeColors` —
 * never hard-code a hex value in a component.
 */

export type ThemeColors = {
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  borderStrong: string;

  primary: string; // saffron — primary actions
  primaryPressed: string;
  primarySoft: string; // tinted fill behind primary icons and selected states
  onPrimary: string;
  secondary: string; // antique gold — ornaments, highlights
  secondaryMuted: string;
  deep: string; // deep maroon / midnight — hero and brand surfaces
  onDeep: string;

  textPrimary: string;
  textSecondary: string;
  textTertiary: string;

  icon: string;
  iconMuted: string;

  progressTrack: string;
  progressFill: string;
  progressBuffered: string;

  navBackground: string;
  navBorder: string;
  navActive: string;
  navInactive: string;

  card: string;
  dialog: string;
  scrim: string;
  danger: string;
  dangerSurface: string;
  artworkFallback: string;
  shadow: string;
};

export const lightColors: ThemeColors = {
  background: '#F7EEDB',
  backgroundElevated: '#FCF6E8',
  surface: '#FFFBF0',
  surfaceMuted: '#EFE2C6',
  border: '#E1CFA6',
  borderStrong: '#C6A96F',

  primary: '#B4400F',
  primaryPressed: '#933309',
  primarySoft: '#F5DDC3',
  onPrimary: '#FFF6E8',
  secondary: '#946A10',
  secondaryMuted: '#E4CA8E',
  deep: '#4A1A10',
  onDeep: '#F4DCA6',

  textPrimary: '#2C140B',
  textSecondary: '#66463A',
  textTertiary: '#7D634E',

  icon: '#3A1D12',
  iconMuted: '#7D634E',

  progressTrack: '#E6D6B3',
  progressFill: '#B4400F',
  progressBuffered: '#D4BB87',

  navBackground: '#FCF6E8',
  navBorder: '#DCC594',
  navActive: '#B4400F',
  navInactive: '#7D634E',

  card: '#FFFBF0',
  dialog: '#FCF6E8',
  scrim: 'rgba(40, 20, 8, 0.45)',
  danger: '#B3261E',
  dangerSurface: '#FBE9E7',
  artworkFallback: '#EADBB9',
  shadow: '#6B4318',
};

export const darkColors: ThemeColors = {
  background: '#0E1220',
  backgroundElevated: '#141A2B',
  surface: '#182035',
  surfaceMuted: '#1E2740',
  border: '#252F4A',
  borderStrong: '#34405F',

  primary: '#F0A24B',
  primaryPressed: '#D98C36',
  primarySoft: '#3A2E22',
  onPrimary: '#1A1206',
  secondary: '#D9B26A',
  secondaryMuted: '#4A3F2A',
  deep: '#241A33',
  onDeep: '#EBCB86',

  textPrimary: '#F6EFE3',
  textSecondary: '#B9B0A2',
  textTertiary: '#8A8478',

  icon: '#EDE4D3',
  iconMuted: '#8A8478',

  progressTrack: '#2A3452',
  progressFill: '#F0A24B',
  progressBuffered: '#4A5578',

  navBackground: '#121828',
  navBorder: '#222B44',
  navActive: '#F0A24B',
  navInactive: '#8A8478',

  card: '#182035',
  dialog: '#1A2238',
  scrim: 'rgba(0, 0, 0, 0.6)',
  danger: '#F2B8B5',
  dangerSurface: '#3B1F24',
  artworkFallback: '#232C45',
  shadow: '#000000',
};

/** 8-point spacing scale. */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Typography scale. Uses system fonts, which render Devanagari correctly on Android and iOS. */
export const typography = {
  display: { fontSize: 30, lineHeight: 40, fontWeight: '700' as const },
  title: { fontSize: 22, lineHeight: 32, fontWeight: '700' as const },
  heading: { fontSize: 18, lineHeight: 26, fontWeight: '500' as const },
  body: { fontSize: 15, lineHeight: 23, fontWeight: '400' as const },
  bodyStrong: { fontSize: 15, lineHeight: 23, fontWeight: '500' as const },
  caption: { fontSize: 13, lineHeight: 19, fontWeight: '400' as const },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  shlok: { fontSize: 17, lineHeight: 30, fontWeight: '500' as const },
} as const;

/** Minimum touch target recommended by Android/iOS guidelines. */
export const MIN_TOUCH = 48;

/** Soft, warm elevation. Pass `shadow` from the theme so dark mode stays subtle. */
export function elevation(shadow: string, level: 1 | 2 | 3 = 1) {
  const map = {
    1: { shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    2: { shadowOpacity: 0.14, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
    3: { shadowOpacity: 0.22, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 12 },
  } as const;
  return { shadowColor: shadow, ...map[level] };
}
