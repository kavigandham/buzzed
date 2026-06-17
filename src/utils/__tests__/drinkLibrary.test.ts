import {
  DRINK_LIBRARY,
  getDrinkById,
  getDrinksByCategory,
  searchDrinks,
} from '../../data/drinkLibrary';

describe('drinkLibrary', () => {
  it('contains at least 100 drinks', () => {
    expect(DRINK_LIBRARY.length).toBeGreaterThanOrEqual(100);
  });

  it('every drink has valid required fields', () => {
    for (const drink of DRINK_LIBRARY) {
      expect(typeof drink.id).toBe('string');
      expect(drink.id.length).toBeGreaterThan(0);
      expect(typeof drink.name).toBe('string');
      expect(drink.name.length).toBeGreaterThan(0);
      expect(typeof drink.category).toBe('string');
      expect(drink.abv).toBeGreaterThan(0);
      expect(drink.defaultServingOz).toBeGreaterThan(0);
      expect(Array.isArray(drink.tags)).toBe(true);
    }
  });

  it('stores abv as a decimal (<= 1)', () => {
    for (const drink of DRINK_LIBRARY) {
      expect(drink.abv).toBeLessThanOrEqual(1);
    }
  });

  it('has unique ids', () => {
    const ids = DRINK_LIBRARY.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('getDrinkById returns the correct drink', () => {
    const drink = getDrinkById('busch-light');
    expect(drink).toBeDefined();
    expect(drink?.name).toBe('Busch Light');
    expect(drink?.abv).toBeCloseTo(0.043);
  });

  it('getDrinkById returns undefined for unknown id', () => {
    expect(getDrinkById('does-not-exist')).toBeUndefined();
  });

  it('getDrinksByCategory("beer") returns at least 25', () => {
    expect(getDrinksByCategory('beer').length).toBeGreaterThanOrEqual(25);
  });

  it('searchDrinks("IPA") returns results', () => {
    const results = searchDrinks('IPA');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((d) => d.name.toLowerCase().includes('ipa'))).toBe(true);
  });

  it('searchDrinks is case-insensitive and matches tags', () => {
    expect(searchDrinks('tequila').length).toBeGreaterThan(0);
    expect(searchDrinks('TEQUILA').length).toBe(searchDrinks('tequila').length);
  });
});
