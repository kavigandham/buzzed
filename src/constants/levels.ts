// Impairment level thresholds + labels.
// Thresholds and colors match CLAUDE.md exactly. Colorblind-safe palette.

import { LevelConfig } from '../types';

// A level applies when activeStdDrinks >= threshold (and < the next threshold).
export const LEVEL_CONFIGS: LevelConfig[] = [
  { threshold: 0, name: 'Sober', color: '#888780', label: 'sober' },
  { threshold: 0.01, name: 'Relaxed', color: '#1D9E75', label: 'relaxed' },
  { threshold: 1.0, name: 'Tipsy', color: '#378ADD', label: 'tipsy' },
  { threshold: 2.0, name: 'Buzzed', color: '#BA7517', label: 'buzzed' },
  { threshold: 3.5, name: 'Impaired', color: '#D85A30', label: 'impaired' },
  { threshold: 5.0, name: 'Very Impaired', color: '#E24B4A', label: 'very_impaired' },
  { threshold: 7.0, name: 'Severely Impaired', color: '#A32D2D', label: 'severely_impaired' },
  { threshold: 9.0, name: 'Danger', color: '#D4537E', label: 'danger' },
];

// Hysteresis: levels fall only after 3 minutes of sustained lower threshold.
export const HYSTERESIS_MS: number = 180000;

// Decay: exactly 1 standard drink per hour, per-drink timestamp decay.
export const DECAY_RATE: number = 1.0;

// One standard drink = 0.6 oz of pure alcohol.
export const STANDARD_DRINK_OZ: number = 0.6;
