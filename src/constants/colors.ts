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

// Dark / nightlife aesthetic.
export const APP_COLORS = {
  background: '#0F1115',
  surface: '#1A1D23',
  text: '#F2F3F5',
  textSecondary: '#9BA0A8',
  accent: '#378ADD',
  danger: '#D4537E',
  border: '#2A2E36',
};
