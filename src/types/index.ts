// All TypeScript interfaces for Buzzed.
// Standard-drink based — no BAC, no Widmark, no weight/gender.

export type DrinkCategory =
  | 'beer'
  | 'wine'
  | 'cocktail'
  | 'spirit'
  | 'shot'
  | 'hard_seltzer'
  | 'cider'
  | 'malt_beverage'
  | 'other';

export type ImpairmentLevel =
  | 'sober'
  | 'relaxed'
  | 'tipsy'
  | 'buzzed'
  | 'impaired'
  | 'very_impaired'
  | 'severely_impaired'
  | 'danger';

export interface LibraryDrink {
  id: string;
  name: string;
  category: DrinkCategory;
  abv: number;
  defaultServingOz: number;
  tags: string[];
}

export interface LoggedDrink {
  id: string;
  drinkId: string;
  name: string;
  servingOz: number;
  abv: number;
  standardDrinks: number;
  timestamp: number;
}

export interface CabinetEntry {
  drinkId: string;
  name: string;
  category: DrinkCategory;
  abv: number;
  defaultServingOz: number;
  totalCount: number;
  lastConsumed: number;
  favorite: boolean;
}

export interface CalendarDay {
  date: string;
  maxLevel: ImpairmentLevel;
  totalStandardDrinks: number;
  drinkCount: number;
  drinks: { name: string; count: number }[];
}

export interface DrinkSession {
  id: string;
  startTime: number;
  loggedDrinks: LoggedDrink[];
  peakLevel: ImpairmentLevel;
}

export interface UserProfile {
  name: string;
  quickSlots: [string | null, string | null, string | null];
}

export interface HysteresisState {
  currentLevel: ImpairmentLevel;
  pendingLevel: ImpairmentLevel | null;
  pendingSince: number | null;
}

export interface LevelConfig {
  threshold: number;
  name: string;
  color: string;
  label: ImpairmentLevel;
}

// Dated clickwrap record of the first-launch age-gate / legal acceptance.
// `version` mirrors LEGAL_VERSION so consent stays tied to the text accepted.
export interface LegalAcceptance {
  accepted: boolean;
  acceptedAt: number;
  version: string;
}
