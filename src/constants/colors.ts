// Colorblind-safe level palette + category colors + app aesthetic.
// Level hex values match CLAUDE.md exactly (pre-verified colorblind-safe).

import { DrinkCategory, ImpairmentLevel } from '../types';

export const LEVEL_COLORS: Record<ImpairmentLevel, string> = {
  sober: '#888780',
  relaxed: '#1D9E75',
  tipsy: '#378ADD',
  buzzed: '#BA7517',
  impaired: '#D85A30',
  very_impaired: '#E24B4A',
  severely_impaired: '#A32D2D',
  danger: '#D4537E',
};

// Distinct, colorblind-safe color per drink category.
export const CATEGORY_COLORS: Record<DrinkCategory, string> = {
  beer: '#C99A2E',
  wine: '#9B2D52',
  cocktail: '#2FA39C',
  spirit: '#7A5BBE',
  shot: '#E07A3F',
  hard_seltzer: '#4FB0E8',
  cider: '#B6822A',
  malt_beverage: '#5C8A3A',
  other: '#888780',
};

// Warm tan / sand / brown aesthetic (earthy, premium). NOTE: only the app
// "chrome" lives here — LEVEL_COLORS / CATEGORY_COLORS above stay colorblind-safe.
export const APP_COLORS = {
  background: '#1A140E', // deep warm espresso
  surface: '#2A2018', // warm taupe-brown
  text: '#F5EDE0', // warm cream
  textSecondary: '#B8A88F', // muted sand
  accent: '#C9A05C', // bronze / amber
  onAccent: '#241A10', // dark text on the bronze accent (better contrast than white)
  danger: '#C45B45', // warm-leaning red
  border: '#3A2E22', // warm dark border
};
