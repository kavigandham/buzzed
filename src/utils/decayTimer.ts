// Per-drink time decay logic, packaged for the 1-second ticker.
// createTickCalculator returns a function callable every second from a
// setInterval — it recalculates active standard drinks from `now` each tick.

import { LoggedDrink, ImpairmentLevel } from '../types';
import { calcActiveTotal, calcTimeToSober } from './drinkCalculator';
import { getLevel } from './levelEngine';

export interface TickResult {
  activeStdDrinks: number;
  level: ImpairmentLevel;
  timeToSoberSecs: number;
}

/**
 * Build a tick calculator over a fixed set of logged drinks. The returned
 * function takes an optional `now` (defaults to Date.now()) so it can be
 * driven by setInterval in production and injected timestamps in tests.
 */
export function createTickCalculator(
  drinks: LoggedDrink[]
): (now?: number) => TickResult {
  return (now: number = Date.now()): TickResult => {
    const activeStdDrinks = calcActiveTotal(drinks, now);
    return {
      activeStdDrinks,
      level: getLevel(activeStdDrinks),
      timeToSoberSecs: calcTimeToSober(drinks, now),
    };
  };
}
