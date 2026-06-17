import {
  calcStandardDrinks,
  calcRemaining,
  calcActiveTotal,
  calcTimeToSober,
} from '../drinkCalculator';
import { LoggedDrink } from '../../types';

function makeDrink(standardDrinks: number, timestamp: number): LoggedDrink {
  return {
    id: `d-${timestamp}-${standardDrinks}`,
    drinkId: 'test',
    name: 'Test Drink',
    servingOz: 12,
    abv: 0.05,
    standardDrinks,
    timestamp,
  };
}

describe('calcStandardDrinks', () => {
  it('standard beer (12oz, 5%) ≈ 1.0', () => {
    expect(calcStandardDrinks(12, 0.05)).toBeCloseTo(1.0, 2);
  });
  it('standard wine (5oz, 12%) ≈ 1.0', () => {
    expect(calcStandardDrinks(5, 0.12)).toBeCloseTo(1.0, 2);
  });
  it('standard shot (1.5oz, 40%) ≈ 1.0', () => {
    expect(calcStandardDrinks(1.5, 0.4)).toBeCloseTo(1.0, 2);
  });
  it('Busch Light (12oz, 4.3%) ≈ 0.86', () => {
    expect(calcStandardDrinks(12, 0.043)).toBeCloseTo(0.86, 2);
  });
  it('zero volume = 0', () => {
    expect(calcStandardDrinks(0, 0.05)).toBe(0);
  });
  it('zero ABV = 0', () => {
    expect(calcStandardDrinks(12, 0)).toBe(0);
  });
});

describe('calcRemaining', () => {
  it('1 std drink after 1 hour = 0', () => {
    expect(calcRemaining(1.0, 3600000)).toBe(0);
  });
  it('2 std drinks after 30 min = 1.5', () => {
    expect(calcRemaining(2.0, 1800000)).toBeCloseTo(1.5, 2);
  });
  it('never goes negative', () => {
    expect(calcRemaining(1.0, 7200000)).toBe(0);
  });
  it('Busch Light after 52 min ≈ 0', () => {
    expect(calcRemaining(0.86, 3120000)).toBeCloseTo(0, 2);
  });
});

describe('calcActiveTotal', () => {
  it('sums remaining across drinks at different timestamps', () => {
    const now = 10_000_000;
    const drinks = [
      makeDrink(1.0, now - 1_800_000), // 30 min ago -> 0.5 remaining
      makeDrink(1.0, now - 3_600_000), // 60 min ago -> 0 remaining
    ];
    expect(calcActiveTotal(drinks, now)).toBeCloseTo(0.5, 2);
  });
  it('empty array = 0', () => {
    expect(calcActiveTotal([], 10_000_000)).toBe(0);
  });
});

describe('calcTimeToSober', () => {
  it('one 1.0 std drink at T=0 ≈ 3600 seconds', () => {
    const drinks = [makeDrink(1.0, 0)];
    expect(calcTimeToSober(drinks, 0)).toBeCloseTo(3600, 0);
  });
  it('empty array = 0', () => {
    expect(calcTimeToSober([], 0)).toBe(0);
  });
});
