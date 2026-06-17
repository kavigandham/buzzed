// Level mapping + hysteresis.
// Levels rise immediately; they fall only after HYSTERESIS_MS of a sustained
// lower value. No BAC, no Widmark — purely active-standard-drinks driven.

import { ImpairmentLevel, LevelConfig, HysteresisState } from '../types';
import { LEVEL_CONFIGS, HYSTERESIS_MS } from '../constants/levels';
import { LEVEL_COLORS } from '../constants/colors';

// LEVEL_CONFIGS is ascending by threshold; index = severity (0 sober … 7 danger).
function severity(level: ImpairmentLevel): number {
  return LEVEL_CONFIGS.findIndex((c) => c.label === level);
}

/** Full config for the level that `activeStdDrinks` falls into. */
export function getLevelConfig(activeStdDrinks: number): LevelConfig {
  let current = LEVEL_CONFIGS[0];
  for (const config of LEVEL_CONFIGS) {
    if (activeStdDrinks >= config.threshold) {
      current = config;
    } else {
      break;
    }
  }
  return current;
}

/** The impairment level for a given active-standard-drinks total. */
export function getLevel(activeStdDrinks: number): ImpairmentLevel {
  return getLevelConfig(activeStdDrinks).label;
}

/** Hex color for a level. */
export function getLevelColor(level: ImpairmentLevel): string {
  return LEVEL_COLORS[level];
}

/**
 * Apply hysteresis to a raw level reading.
 * - Rising (or equal) levels apply immediately and clear any pending fall.
 * - Falling levels only apply after HYSTERESIS_MS of the same sustained lower
 *   value; a rise during the pending window resets it.
 */
export function applyHysteresis(
  rawLevel: ImpairmentLevel,
  state: HysteresisState,
  now: number = Date.now()
): { level: ImpairmentLevel; newState: HysteresisState } {
  const rawSev = severity(rawLevel);
  const curSev = severity(state.currentLevel);

  // Rising or holding: apply immediately, clear pending.
  if (rawSev >= curSev) {
    return {
      level: rawLevel,
      newState: { currentLevel: rawLevel, pendingLevel: null, pendingSince: null },
    };
  }

  // Falling: start (or restart) the pending window if it's a new target.
  if (state.pendingLevel !== rawLevel || state.pendingSince === null) {
    return {
      level: state.currentLevel,
      newState: {
        currentLevel: state.currentLevel,
        pendingLevel: rawLevel,
        pendingSince: now,
      },
    };
  }

  // Same pending target held long enough: commit the fall.
  if (now - state.pendingSince >= HYSTERESIS_MS) {
    return {
      level: rawLevel,
      newState: { currentLevel: rawLevel, pendingLevel: null, pendingSince: null },
    };
  }

  // Still waiting out the window.
  return { level: state.currentLevel, newState: state };
}
