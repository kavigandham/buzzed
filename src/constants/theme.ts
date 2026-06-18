// Shared design tokens for the warm tan/sand/brown redesign. Screens previously
// hardcoded spacing/typography/gradients per-StyleSheet; this centralizes them so
// the new ui/ primitives and every screen stay consistent.
//
// Color source of truth stays in colors.ts — this file only adds spacing, type,
// radii, gradient and glass tokens on top of it.

import { APP_COLORS } from './colors';

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const RADII = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

// Typography presets. Spread onto <Text style={[TYPE.title, { color }]}/>.
export const TYPE = {
  display: { fontSize: 44, fontWeight: '800' as const, letterSpacing: 0.5 },
  hero: { fontSize: 56, fontWeight: '800' as const, letterSpacing: 0.5 },
  title: { fontSize: 28, fontWeight: '800' as const },
  h2: { fontSize: 20, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
} as const;

// Convert a #RRGGBB hex to an rgba() string with the given alpha (0..1).
export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Warm earthy gradients. `background` and `backgroundAlt` cross-fade in
// AnimatedGradientBackground to create subtle motion behind every screen.
export const GRADIENTS = {
  background: ['#1C150D', '#2E2113', '#201810'] as const,
  backgroundAlt: ['#241A0F', '#1B140D', '#332512'] as const,
  // Bronze/amber fill for primary buttons + the level meter accent.
  button: ['#D8AC66', '#C9A05C', '#AE7E38'] as const,
};

// Two-stop translucent halo of a level/accent color, used by Glow / LevelMeter.
export function glowGradient(color: string): readonly [string, string] {
  return [withAlpha(color, 0.5), withAlpha(color, 0)];
}

// Frosted-glass tokens (BlurView tint overlay + hairline border).
export const GLASS = {
  tint: withAlpha('#3A2C1C', 0.55),
  tintStrong: withAlpha('#2A2018', 0.78),
  border: withAlpha('#C9A05C', 0.18),
} as const;

export { APP_COLORS };
