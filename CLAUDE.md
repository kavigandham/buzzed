# Buzzed. — Drink Tracker App

## What this is
React Native / Expo Go mobile app that tracks drinks using **standard drink units** (no BAC, no Widmark, no weight/gender). Shows real-time impairment levels that update every second via a 1-second interval ticker with per-drink timestamp decay.

## Stack
- React Native 0.81+ / Expo ~54 / Expo Go
- TypeScript (strict mode)
- React Navigation 6 (bottom tabs + stack)
- React Context API (state management)
- AsyncStorage (persistence)
- react-native-view-shot + expo-sharing (calendar sharing)
- date-fns (date manipulation)
- expo-linear-gradient (UI)
- Jest (testing)

## Critical rules
- NEVER use BAC or Widmark formula. All calculations use standard drink units: `(volumeOz × abv) / 0.6`
- Decay rate is exactly 1 standard drink per hour, per-drink timestamp decay (each drink decays independently from its own logged timestamp)
- The 1-second `setInterval` ticker recalculates `activeStdDrinks` from `Date.now()` every tick — no "Refresh" button exists
- Levels rise immediately, fall only after 3 minutes of sustained lower threshold (hysteresis)
- All colors must be colorblind-safe
- App must run in Expo Go — no native modules, no ejection, no expo-dev-client
- Entertainment disclaimer required on main screen — this is NOT a medical/safety tool

## Directory structure
```
Buzzed/
├── src/
│   ├── data/drinkLibrary.ts        # ~100 preloaded drinks (static)
│   ├── types/index.ts              # All TypeScript interfaces
│   ├── constants/
│   │   ├── colors.ts               # Colorblind-safe level palette
│   │   └── levels.ts               # Level thresholds + labels
│   ├── utils/
│   │   ├── drinkCalculator.ts      # Standard drink math
│   │   ├── levelEngine.ts          # Level mapping + hysteresis
│   │   ├── decayTimer.ts           # Per-drink time decay logic
│   │   ├── storageService.ts       # AsyncStorage wrapper
│   │   ├── shareService.ts         # Calendar screenshot + share
│   │   └── __tests__/              # Unit tests for all utils
│   ├── contexts/DrinkContext.tsx    # Global state + 1-sec ticker
│   ├── components/                 # Reusable UI components
│   ├── screens/                    # App screens
│   └── navigation/AppNavigator.tsx # Tab + modal navigation
├── App.tsx
├── tsconfig.json
├── jest.config.js
└── package.json
```

## Commands
```bash
npx expo start          # Start dev server (Expo Go)
npm test                # Run Jest tests
npm run test:coverage   # Jest with coverage
npx tsc --noEmit        # Type check without emitting
npx expo lint           # Lint
```

## Impairment levels (standard drinks → level)
| Active Std Drinks | Level             | Hex     |
|-------------------|-------------------|---------|
| 0                 | Sober             | #888780 |
| >0 – 1.0         | Relaxed           | #1D9E75 |
| >1.0 – 2.0       | Tipsy             | #378ADD |
| >2.0 – 3.5       | Buzzed            | #BA7517 |
| >3.5 – 5.0       | Impaired          | #D85A30 |
| >5.0 – 7.0       | Very Impaired     | #E24B4A |
| >7.0 – 9.0       | Severely Impaired | #A32D2D |
| >9.0              | Danger            | #D4537E |

## Standard drink formula
```
standardDrinks = (servingOz × abv) / 0.6

Per-drink decay (calculated every second):
  remaining = max(0, drink.standardDrinks - ((Date.now() - drink.timestamp) / 3_600_000))
  activeTotal = sum of all remaining values
```

## Navigation
Bottom tabs: Home | Library | Cabinet | Calendar | Settings
Modals: DrinkSelectionModal, DrinkDetailModal

## Testing approach
TDD: write failing tests first, commit them, then implement until green. Do not modify tests to make them pass. Core utils (drinkCalculator, levelEngine, decayTimer) must have >90% coverage.

## Gotchas
- Expo Go does not support native modules — only Expo SDK packages
- AsyncStorage keys are prefixed with `@buzzed_`
- `setInterval` inside `useEffect` must clean up on unmount
- AppState listener for background/foreground — no catch-up logic needed because per-drink timestamps + `Date.now()` are inherently correct
- Hysteresis state must persist in context, not just local component state
- react-native-view-shot must capture a ref, not the whole screen
