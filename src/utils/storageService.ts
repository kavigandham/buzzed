// AsyncStorage wrapper. All keys prefixed with @buzzed_.
// Every method is wrapped in try/catch — a storage failure must never crash
// the app. Load methods return null / [] on missing data (first launch).

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProfile,
  DrinkSession,
  CabinetEntry,
  CalendarDay,
  LibraryDrink,
  HysteresisState,
  LegalAcceptance,
} from '../types';

const KEYS = {
  profile: '@buzzed_profile',
  session: '@buzzed_session',
  cabinet: '@buzzed_cabinet',
  calendar: '@buzzed_calendar',
  customDrinks: '@buzzed_custom_drinks',
  hysteresis: '@buzzed_hysteresis',
  legalAcceptance: '@buzzed_legal_acceptance',
} as const;

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`StorageService: failed to save ${key}`, error);
  }
}

async function getObject<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`StorageService: failed to load ${key}`, error);
    return null;
  }
}

async function getArray<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return [];
    return JSON.parse(raw) as T[];
  } catch (error) {
    console.error(`StorageService: failed to load ${key}`, error);
    return [];
  }
}

export const StorageService = {
  // Profile
  saveProfile(p: UserProfile): Promise<void> {
    return setItem(KEYS.profile, p);
  },
  loadProfile(): Promise<UserProfile | null> {
    return getObject<UserProfile>(KEYS.profile);
  },

  // Session
  saveSession(s: DrinkSession): Promise<void> {
    return setItem(KEYS.session, s);
  },
  loadSession(): Promise<DrinkSession | null> {
    return getObject<DrinkSession>(KEYS.session);
  },

  // Cabinet
  saveCabinet(c: CabinetEntry[]): Promise<void> {
    return setItem(KEYS.cabinet, c);
  },
  loadCabinet(): Promise<CabinetEntry[]> {
    return getArray<CabinetEntry>(KEYS.cabinet);
  },

  // Calendar
  saveCalendar(c: CalendarDay[]): Promise<void> {
    return setItem(KEYS.calendar, c);
  },
  loadCalendar(): Promise<CalendarDay[]> {
    return getArray<CalendarDay>(KEYS.calendar);
  },

  // Custom drinks
  saveCustomDrinks(d: LibraryDrink[]): Promise<void> {
    return setItem(KEYS.customDrinks, d);
  },
  loadCustomDrinks(): Promise<LibraryDrink[]> {
    return getArray<LibraryDrink>(KEYS.customDrinks);
  },

  // Hysteresis
  saveHysteresis(h: HysteresisState): Promise<void> {
    return setItem(KEYS.hysteresis, h);
  },
  loadHysteresis(): Promise<HysteresisState | null> {
    return getObject<HysteresisState>(KEYS.hysteresis);
  },

  // Legal / age-gate acceptance (dated clickwrap record)
  saveLegalAcceptance(a: LegalAcceptance): Promise<void> {
    return setItem(KEYS.legalAcceptance, a);
  },
  loadLegalAcceptance(): Promise<LegalAcceptance | null> {
    return getObject<LegalAcceptance>(KEYS.legalAcceptance);
  },

  // Remove every @buzzed_ key.
  async clearAll(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const buzzedKeys = allKeys.filter((k) => k.startsWith('@buzzed_'));
      await AsyncStorage.multiRemove(buzzedKeys);
    } catch (error) {
      console.error('StorageService: failed to clearAll', error);
    }
  },
};
