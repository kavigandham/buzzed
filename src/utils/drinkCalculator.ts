// Standard drink math. No BAC, no Widmark, no weight/gender.
// standardDrinks = (volumeOz × abv) / 0.6   (0.6 oz pure alcohol per std drink)
// Decay: exactly 1.0 standard drink per hour, per-drink timestamp decay.

import { LoggedDrink } from '../types';
import { DECAY_RATE, STANDARD_DRINK_OZ } from '../constants/levels';

const MS_PER_HOUR = 3_600_000;

/** Standard drinks for a serving: (volumeOz × abv) / 0.6. */
export function calcStandardDrinks(volumeOz: number, abv: number): number {
  return (volumeOz * abv) / STANDARD_DRINK_OZ;
}

/** Remaining std drinks after elapsedMs, decaying at DECAY_RATE/hour. Never negative. */
export function calcRemaining(standardDrinks: number, elapsedMs: number): number {
  const decayed = (elapsedMs / MS_PER_HOUR) * DECAY_RATE;
  return Math.max(0, standardDrinks - decayed);
}

/** Sum of remaining std drinks across all logged drinks at `now`. */
export function calcActiveTotal(drinks: LoggedDrink[], now: number = Date.now()): number {
  return drinks.reduce(
    (total, drink) => total + calcRemaining(drink.standardDrinks, now - drink.timestamp),
    0
  );
}

/** Seconds until every drink has fully decayed (0 if already sober / no drinks). */
export function calcTimeToSober(drinks: LoggedDrink[], now: number = Date.now()): number {
  let maxMsRemaining = 0;
  for (const drink of drinks) {
    const fullDecayMs = (drink.standardDrinks / DECAY_RATE) * MS_PER_HOUR;
    const msRemaining = drink.timestamp + fullDecayMs - now;
    if (msRemaining > maxMsRemaining) {
      maxMsRemaining = msRemaining;
    }
  }
  return maxMsRemaining / 1000;
}
