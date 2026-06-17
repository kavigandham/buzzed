// Global state + the 1-second ticker.
// Standard-drink based only — no BAC, no Widmark, no weight/gender.
// The ticker recalculates activeStdDrinks from Date.now() every second; there
// is no "Refresh" button. Hysteresis state lives here in the context.

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { format } from 'date-fns';

import {
  LoggedDrink,
  DrinkSession,
  CabinetEntry,
  CalendarDay,
  UserProfile,
  HysteresisState,
  ImpairmentLevel,
  LevelConfig,
  LibraryDrink,
} from '../types';
import { LEVEL_CONFIGS } from '../constants/levels';
import { DRINK_LIBRARY, getDrinkById } from '../data/drinkLibrary';
import { calcStandardDrinks, calcActiveTotal, calcTimeToSober } from '../utils/drinkCalculator';
import { getLevel, applyHysteresis } from '../utils/levelEngine';
import { StorageService } from '../utils/storageService';

type Confidence = 'low' | 'medium' | 'high' | null;

interface DrinkContextValue {
  // State
  activeStdDrinks: number;
  currentLevel: ImpairmentLevel;
  levelConfig: LevelConfig;
  loggedDrinks: LoggedDrink[];
  session: DrinkSession;
  cabinet: CabinetEntry[];
  calendarDays: CalendarDay[];
  profile: UserProfile;
  customDrinks: LibraryDrink[];
  timeToSober: number;
  confidence: Confidence;
  isLoading: boolean;
  // Actions
  logDrink: (drinkId: string, servingOz?: number, abv?: number) => void;
  removeDrink: (loggedDrinkId: string) => void;
  restartSession: () => void;
  clearAll: () => void;
  updateProfile: (p: UserProfile) => void;
  toggleFavorite: (drinkId: string) => void;
  addCustomDrink: (drink: LibraryDrink) => void;
}

const DEFAULT_PROFILE: UserProfile = { name: '', quickSlots: [null, null, null] };
const DEFAULT_HYSTERESIS: HysteresisState = {
  currentLevel: 'sober',
  pendingLevel: null,
  pendingSince: null,
};
const SOBER_CONFIG: LevelConfig = LEVEL_CONFIGS[0];

function newSession(now: number): DrinkSession {
  return { id: `session-${now}`, startTime: now, loggedDrinks: [], peakLevel: 'sober' };
}

// Severity rank by position in LEVEL_CONFIGS (0 sober … 7 danger).
function severity(level: ImpairmentLevel): number {
  return LEVEL_CONFIGS.findIndex((c) => c.label === level);
}

function higherLevel(a: ImpairmentLevel, b: ImpairmentLevel): ImpairmentLevel {
  return severity(a) >= severity(b) ? a : b;
}

function configForLevel(level: ImpairmentLevel): LevelConfig {
  return LEVEL_CONFIGS.find((c) => c.label === level) ?? SOBER_CONFIG;
}

function lookupDrink(drinkId: string, customDrinks: LibraryDrink[]): LibraryDrink | undefined {
  return getDrinkById(drinkId) ?? customDrinks.find((d) => d.id === drinkId);
}

function computeConfidence(drinks: LoggedDrink[], active: number): Confidence {
  if (drinks.length === 0 || active === 0) return null;
  // High when every logged drink resolves to a known library entry; medium when
  // any drink relied on a custom / estimated entry (no manual ABV in library).
  const anyUnknown = drinks.some((d) => getDrinkById(d.drinkId) === undefined);
  return anyUnknown ? 'medium' : 'high';
}

const DrinkContext = createContext<DrinkContextValue | undefined>(undefined);

export function DrinkProvider({ children }: { children: ReactNode }) {
  const [activeStdDrinks, setActiveStdDrinks] = useState(0);
  const [currentLevel, setCurrentLevel] = useState<ImpairmentLevel>('sober');
  const [levelConfig, setLevelConfig] = useState<LevelConfig>(SOBER_CONFIG);
  const [loggedDrinks, setLoggedDrinks] = useState<LoggedDrink[]>([]);
  const [session, setSession] = useState<DrinkSession>(() => newSession(Date.now()));
  const [cabinet, setCabinet] = useState<CabinetEntry[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [customDrinks, setCustomDrinks] = useState<LibraryDrink[]>([]);
  const [timeToSober, setTimeToSober] = useState(0);
  const [confidence, setConfidence] = useState<Confidence>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Hysteresis lives in the context (not component-local UI state).
  const [hysteresis, setHysteresis] = useState<HysteresisState>(DEFAULT_HYSTERESIS);

  // Refs hold the latest values for the interval / AppState closures.
  const loggedDrinksRef = useRef(loggedDrinks);
  const hysteresisRef = useRef(hysteresis);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idCounter = useRef(0);
  // Mirrors customDrinks so a just-added custom drink is resolvable inside the
  // same event handler (state updates are async), e.g. add-then-log.
  const customDrinksRef = useRef(customDrinks);

  useEffect(() => {
    loggedDrinksRef.current = loggedDrinks;
  }, [loggedDrinks]);
  useEffect(() => {
    hysteresisRef.current = hysteresis;
  }, [hysteresis]);
  useEffect(() => {
    customDrinksRef.current = customDrinks;
  }, [customDrinks]);

  const stopTicker = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // One tick: recalc active std drinks from Date.now(), apply hysteresis, push
  // all live values. Stops the interval once everything has decayed to zero.
  const tick = useCallback(() => {
    const now = Date.now();
    const drinks = loggedDrinksRef.current;
    const active = calcActiveTotal(drinks, now);
    const rawLevel = getLevel(active);
    const { level, newState } = applyHysteresis(rawLevel, hysteresisRef.current, now);

    hysteresisRef.current = newState;
    setHysteresis(newState);
    StorageService.saveHysteresis(newState);

    setActiveStdDrinks(active);
    setTimeToSober(calcTimeToSober(drinks, now));
    setCurrentLevel(level);
    setLevelConfig(configForLevel(level));
    setConfidence(computeConfidence(drinks, active));

    if (active === 0) {
      stopTicker();
    }
  }, [stopTicker]);

  // Start/stop the 1-second ticker based on whether a session has drinks.
  useEffect(() => {
    if (loggedDrinks.length === 0) {
      stopTicker();
      setActiveStdDrinks(0);
      setTimeToSober(0);
      setCurrentLevel('sober');
      setLevelConfig(SOBER_CONFIG);
      setConfidence(null);
      return;
    }
    loggedDrinksRef.current = loggedDrinks;
    tick(); // immediate recalc on any change
    if (intervalRef.current === null) {
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => stopTicker();
  }, [loggedDrinks, tick, stopTicker]);

  // On returning to foreground, recalc immediately — Date.now() makes catch-up
  // unnecessary; we just resume ticking from the real elapsed time.
  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next === 'active' && loggedDrinksRef.current.length > 0) {
        tick();
        if (intervalRef.current === null) {
          intervalRef.current = setInterval(tick, 1000);
        }
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [tick]);

  // Initial load from storage.
  useEffect(() => {
    let mounted = true;
    (async () => {
      const [
        savedProfile,
        savedSession,
        savedCabinet,
        savedCalendar,
        savedCustom,
        savedHysteresis,
      ] = await Promise.all([
        StorageService.loadProfile(),
        StorageService.loadSession(),
        StorageService.loadCabinet(),
        StorageService.loadCalendar(),
        StorageService.loadCustomDrinks(),
        StorageService.loadHysteresis(),
      ]);
      if (!mounted) return;

      if (savedProfile) setProfile(savedProfile);
      if (savedCabinet) setCabinet(savedCabinet);
      if (savedCalendar) setCalendarDays(savedCalendar);
      if (savedCustom) setCustomDrinks(savedCustom);
      if (savedHysteresis) {
        setHysteresis(savedHysteresis);
        hysteresisRef.current = savedHysteresis;
      }
      if (savedSession) {
        setSession(savedSession);
        // Restoring drinks triggers the ticker effect, which starts immediately
        // if there are still actively-decaying drinks.
        setLoggedDrinks(savedSession.loggedDrinks);
        loggedDrinksRef.current = savedSession.loggedDrinks;
      }
      setIsLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const nextId = useCallback((prefix: string) => {
    idCounter.current += 1;
    return `${prefix}-${Date.now()}-${idCounter.current}`;
  }, []);

  const logDrink = useCallback(
    (drinkId: string, servingOz?: number, abv?: number) => {
      const base = lookupDrink(drinkId, customDrinksRef.current);
      if (!base) {
        console.warn(`logDrink: unknown drinkId ${drinkId}`);
        return;
      }
      const now = Date.now();
      const serving = servingOz ?? base.defaultServingOz;
      const abvValue = abv ?? base.abv;
      const standardDrinks = calcStandardDrinks(serving, abvValue);

      const logged: LoggedDrink = {
        id: nextId('drink'),
        drinkId: base.id,
        name: base.name,
        servingOz: serving,
        abv: abvValue,
        standardDrinks,
        timestamp: now,
      };

      const nextLogged = [...loggedDrinks, logged];
      const active = calcActiveTotal(nextLogged, now);
      const reachedLevel = getLevel(active);

      // Session
      const nextSession: DrinkSession = {
        ...session,
        loggedDrinks: nextLogged,
        peakLevel: higherLevel(session.peakLevel, reachedLevel),
      };

      // Cabinet — create or increment.
      const existing = cabinet.find((c) => c.drinkId === base.id);
      const nextCabinet: CabinetEntry[] = existing
        ? cabinet.map((c) =>
            c.drinkId === base.id
              ? { ...c, totalCount: c.totalCount + 1, lastConsumed: now }
              : c
          )
        : [
            ...cabinet,
            {
              drinkId: base.id,
              name: base.name,
              category: base.category,
              abv: base.abv,
              defaultServingOz: base.defaultServingOz,
              totalCount: 1,
              lastConsumed: now,
              favorite: false,
            },
          ];

      // Calendar — update today's CalendarDay.
      const today = format(new Date(now), 'yyyy-MM-dd');
      const dayIndex = calendarDays.findIndex((d) => d.date === today);
      let nextCalendar: CalendarDay[];
      if (dayIndex >= 0) {
        nextCalendar = calendarDays.map((d, i) => {
          if (i !== dayIndex) return d;
          const drinkEntry = d.drinks.find((x) => x.name === base.name);
          const drinks = drinkEntry
            ? d.drinks.map((x) =>
                x.name === base.name ? { ...x, count: x.count + 1 } : x
              )
            : [...d.drinks, { name: base.name, count: 1 }];
          return {
            ...d,
            maxLevel: higherLevel(d.maxLevel, reachedLevel),
            totalStandardDrinks: d.totalStandardDrinks + standardDrinks,
            drinkCount: d.drinkCount + 1,
            drinks,
          };
        });
      } else {
        nextCalendar = [
          ...calendarDays,
          {
            date: today,
            maxLevel: reachedLevel,
            totalStandardDrinks: standardDrinks,
            drinkCount: 1,
            drinks: [{ name: base.name, count: 1 }],
          },
        ];
      }

      setLoggedDrinks(nextLogged);
      setSession(nextSession);
      setCabinet(nextCabinet);
      setCalendarDays(nextCalendar);

      StorageService.saveSession(nextSession);
      StorageService.saveCabinet(nextCabinet);
      StorageService.saveCalendar(nextCalendar);
    },
    [loggedDrinks, session, cabinet, calendarDays, nextId]
  );

  const removeDrink = useCallback(
    (loggedDrinkId: string) => {
      const target = loggedDrinks.find((d) => d.id === loggedDrinkId);
      if (!target) return;

      const nextLogged = loggedDrinks.filter((d) => d.id !== loggedDrinkId);
      const nextSession: DrinkSession = { ...session, loggedDrinks: nextLogged };

      // Reverse today's calendar contribution.
      const today = format(new Date(target.timestamp), 'yyyy-MM-dd');
      const nextCalendar = calendarDays
        .map((d) => {
          if (d.date !== today) return d;
          const drinks = d.drinks
            .map((x) =>
              x.name === target.name ? { ...x, count: x.count - 1 } : x
            )
            .filter((x) => x.count > 0);
          return {
            ...d,
            totalStandardDrinks: Math.max(0, d.totalStandardDrinks - target.standardDrinks),
            drinkCount: Math.max(0, d.drinkCount - 1),
            drinks,
          };
        })
        .filter((d) => d.drinkCount > 0);

      setLoggedDrinks(nextLogged);
      setSession(nextSession);
      setCalendarDays(nextCalendar);

      StorageService.saveSession(nextSession);
      StorageService.saveCalendar(nextCalendar);
    },
    [loggedDrinks, session, calendarDays]
  );

  const restartSession = useCallback(() => {
    const fresh = newSession(Date.now());
    setLoggedDrinks([]);
    setSession(fresh);
    setHysteresis(DEFAULT_HYSTERESIS);
    hysteresisRef.current = DEFAULT_HYSTERESIS;
    StorageService.saveSession(fresh);
    StorageService.saveHysteresis(DEFAULT_HYSTERESIS);
  }, []);

  const clearAll = useCallback(() => {
    stopTicker();
    const fresh = newSession(Date.now());
    setLoggedDrinks([]);
    setSession(fresh);
    setCabinet([]);
    setCalendarDays([]);
    setCustomDrinks([]);
    setProfile(DEFAULT_PROFILE);
    setHysteresis(DEFAULT_HYSTERESIS);
    hysteresisRef.current = DEFAULT_HYSTERESIS;
    setActiveStdDrinks(0);
    setTimeToSober(0);
    setCurrentLevel('sober');
    setLevelConfig(SOBER_CONFIG);
    setConfidence(null);
    StorageService.clearAll();
  }, [stopTicker]);

  const updateProfile = useCallback((p: UserProfile) => {
    setProfile(p);
    StorageService.saveProfile(p);
  }, []);

  const toggleFavorite = useCallback(
    (drinkId: string) => {
      const existing = cabinet.find((c) => c.drinkId === drinkId);
      let nextCabinet: CabinetEntry[];
      if (existing) {
        nextCabinet = cabinet.map((c) =>
          c.drinkId === drinkId ? { ...c, favorite: !c.favorite } : c
        );
      } else {
        const base = lookupDrink(drinkId, customDrinks);
        if (!base) return;
        nextCabinet = [
          ...cabinet,
          {
            drinkId: base.id,
            name: base.name,
            category: base.category,
            abv: base.abv,
            defaultServingOz: base.defaultServingOz,
            totalCount: 0,
            lastConsumed: 0,
            favorite: true,
          },
        ];
      }
      setCabinet(nextCabinet);
      StorageService.saveCabinet(nextCabinet);
    },
    [cabinet, customDrinks]
  );

  const addCustomDrink = useCallback(
    (drink: LibraryDrink) => {
      const nextCustom = [...customDrinks, drink];
      customDrinksRef.current = nextCustom; // available synchronously for logDrink
      setCustomDrinks(nextCustom);
      StorageService.saveCustomDrinks(nextCustom);
    },
    [customDrinks]
  );

  const value: DrinkContextValue = {
    activeStdDrinks,
    currentLevel,
    levelConfig,
    loggedDrinks,
    session,
    cabinet,
    calendarDays,
    profile,
    customDrinks,
    timeToSober,
    confidence,
    isLoading,
    logDrink,
    removeDrink,
    restartSession,
    clearAll,
    updateProfile,
    toggleFavorite,
    addCustomDrink,
  };

  return <DrinkContext.Provider value={value}>{children}</DrinkContext.Provider>;
}

export function useDrink(): DrinkContextValue {
  const ctx = useContext(DrinkContext);
  if (ctx === undefined) {
    throw new Error('useDrink must be used within a DrinkProvider');
  }
  return ctx;
}

// Re-exported for convenience (full preloaded list).
export { DRINK_LIBRARY };
