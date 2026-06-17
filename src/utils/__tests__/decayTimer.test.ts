import { createTickCalculator } from '../decayTimer';
import { LoggedDrink } from '../../types';

function makeDrink(standardDrinks: number, timestamp: number): LoggedDrink {
  return {
    id: `d-${timestamp}-${standardDrinks}`,
    drinkId: 'test',
    name: 'Test Drink',
    servingOz: 12,
    abv: 0.043,
    standardDrinks,
    timestamp,
  };
}

describe('createTickCalculator', () => {
  it('1 beer (0.86 sd) at T=0, tick at T+30min -> remaining ≈ 0.36', () => {
    const tick = createTickCalculator([makeDrink(0.86, 0)]);
    const result = tick(1_800_000);
    expect(result.activeStdDrinks).toBeCloseTo(0.36, 2);
  });

  it('1 beer at T=0, tick at T+52min -> sober', () => {
    const tick = createTickCalculator([makeDrink(0.86, 0)]);
    const result = tick(3_120_000);
    expect(result.activeStdDrinks).toBeCloseTo(0, 2);
    expect(result.level).toBe('sober');
  });

  it('2 drinks at different times decay independently', () => {
    const now = 5_000_000;
    const tick = createTickCalculator([
      makeDrink(1.0, now - 1_800_000), // 0.5 remaining
      makeDrink(1.0, now - 900_000), // 0.75 remaining
    ]);
    const result = tick(now);
    expect(result.activeStdDrinks).toBeCloseTo(1.25, 2);
  });

  it('empty array -> activeStdDrinks 0, level sober', () => {
    const tick = createTickCalculator([]);
    const result = tick(1_000_000);
    expect(result.activeStdDrinks).toBe(0);
    expect(result.level).toBe('sober');
    expect(result.timeToSoberSecs).toBe(0);
  });
});
