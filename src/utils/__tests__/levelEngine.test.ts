import {
  getLevel,
  getLevelConfig,
  getLevelColor,
  applyHysteresis,
} from '../levelEngine';
import { HYSTERESIS_MS } from '../../constants/levels';
import { HysteresisState } from '../../types';

describe('getLevel', () => {
  it('0 = sober', () => expect(getLevel(0)).toBe('sober'));
  it('0.5 = relaxed', () => expect(getLevel(0.5)).toBe('relaxed'));
  it('1.0 = tipsy (>= 1.0 boundary)', () => expect(getLevel(1.0)).toBe('tipsy'));
  it('0.999 = relaxed (just under)', () => expect(getLevel(0.999)).toBe('relaxed'));
  it('1.5 = tipsy', () => expect(getLevel(1.5)).toBe('tipsy'));
  it('2.0 = buzzed', () => expect(getLevel(2.0)).toBe('buzzed'));
  it('3.5 = impaired', () => expect(getLevel(3.5)).toBe('impaired'));
  it('5.0 = very_impaired', () => expect(getLevel(5.0)).toBe('very_impaired'));
  it('7.0 = severely_impaired', () => expect(getLevel(7.0)).toBe('severely_impaired'));
  it('9.0 = danger', () => expect(getLevel(9.0)).toBe('danger'));
  it('15.0 = danger (extreme)', () => expect(getLevel(15.0)).toBe('danger'));
});

describe('getLevelConfig', () => {
  it('returns the config matching the level', () => {
    const cfg = getLevelConfig(2.0);
    expect(cfg.label).toBe('buzzed');
    expect(cfg.color).toBe('#BA7517');
  });
});

describe('getLevelColor', () => {
  it("sober = '#888780'", () => expect(getLevelColor('sober')).toBe('#888780'));
  it("danger = '#D4537E'", () => expect(getLevelColor('danger')).toBe('#D4537E'));
});

describe('applyHysteresis', () => {
  const t0 = 1_000_000;

  it('rising from sober -> buzzed applies immediately', () => {
    const state: HysteresisState = {
      currentLevel: 'sober',
      pendingLevel: null,
      pendingSince: null,
    };
    const result = applyHysteresis('buzzed', state, t0);
    expect(result.level).toBe('buzzed');
    expect(result.newState.currentLevel).toBe('buzzed');
    expect(result.newState.pendingLevel).toBeNull();
  });

  it('falling from buzzed -> relaxed does NOT apply until 3 min elapsed', () => {
    const state: HysteresisState = {
      currentLevel: 'buzzed',
      pendingLevel: null,
      pendingSince: null,
    };
    const r1 = applyHysteresis('relaxed', state, t0);
    expect(r1.level).toBe('buzzed');
    expect(r1.newState.pendingLevel).toBe('relaxed');

    // still within the window
    const r2 = applyHysteresis('relaxed', r1.newState, t0 + HYSTERESIS_MS - 1);
    expect(r2.level).toBe('buzzed');

    // window elapsed -> the fall applies
    const r3 = applyHysteresis('relaxed', r1.newState, t0 + HYSTERESIS_MS + 1);
    expect(r3.level).toBe('relaxed');
    expect(r3.newState.currentLevel).toBe('relaxed');
    expect(r3.newState.pendingLevel).toBeNull();
  });

  it('falling resets if raw level rises again during pending period', () => {
    const state: HysteresisState = {
      currentLevel: 'buzzed',
      pendingLevel: null,
      pendingSince: null,
    };
    const r1 = applyHysteresis('relaxed', state, t0);
    expect(r1.newState.pendingLevel).toBe('relaxed');

    const r2 = applyHysteresis('buzzed', r1.newState, t0 + 60_000);
    expect(r2.level).toBe('buzzed');
    expect(r2.newState.pendingLevel).toBeNull();
  });
});
