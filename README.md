# Buzzed. 🍺

A React Native / Expo drink-tracking app that shows your **real-time impairment level** using
**standard drink units** — not BAC. No weight, no gender, no Widmark formula, no guesswork about
your body chemistry. Just: how much alcohol have you actually consumed, and how much is still active
right now.

> ⚠️ **For entertainment purposes only.** Buzzed. is **not** a medical, safety, or legal tool.
> It does not measure blood alcohol content and must never be used to decide whether it is safe to
> drive or operate machinery. When in doubt, don't.

---

## Why standard drinks instead of BAC?

BAC estimators need your weight, sex, and metabolism, and they're still wrong often enough to be
dangerous. Buzzed. sidesteps all of that. It counts **standard drinks** — the same unit health
guidelines use — and models how they fade over time.

```
standardDrinks = (servingOz × abv) / 0.6
```

Each drink decays **independently** from its own timestamp at a fixed rate of **1 standard drink per
hour**:

```
remaining   = max(0, drink.standardDrinks − ((now − drink.timestamp) / 3_600_000))
activeTotal = Σ remaining   (summed across every logged drink)
```

A 1-second ticker recalculates the active total from `Date.now()` on every tick, so the number is
always live — there is no "refresh" button, and backgrounding the app never desyncs it because the
math is anchored to real timestamps.

---

## Impairment levels

Your active standard-drink total maps to a color-coded level. Levels **rise instantly** but only
**fall after 3 minutes** of sustained lower readings (hysteresis), so the display doesn't flicker.
All colors are chosen to be colorblind-safe.

| Active Std Drinks | Level             | Color     |
|-------------------|-------------------|-----------|
| 0                 | Sober             | `#888780` |
| > 0 – 1.0         | Relaxed           | `#1D9E75` |
| > 1.0 – 2.0       | Tipsy             | `#378ADD` |
| > 2.0 – 3.5       | Buzzed            | `#BA7517` |
| > 3.5 – 5.0       | Impaired          | `#D85A30` |
| > 5.0 – 7.0       | Very Impaired     | `#E24B4A` |
| > 7.0 – 9.0       | Severely Impaired | `#A32D2D` |
| > 9.0             | Danger            | `#D4537E` |

---

## Features

- 🍹 **~100 preloaded drinks** across beer, wine, spirits, and cocktails
- ⏱️ **Live impairment meter** that updates every second with per-drink decay
- 🗄️ **My Cabinet** — save your go-to drinks for one-tap logging
- 📅 **Calendar** — review your history and share a screenshot of any day
- 🎨 **Warm-earth UI** — tan/sand/brown chrome with colorblind-safe level accents
- 🔞 **Age gate** and full legal document set (privacy, terms, EULA, disclaimer)
- 📴 **Works fully offline** — all state persists locally via AsyncStorage

---

## Tech stack

- **React Native 0.81** / **Expo ~54** (runs in Expo Go — no native modules, no ejection)
- **TypeScript** (strict mode)
- **React Navigation 7** — bottom tabs + stack modals
- **React Context API** for global state and the 1-second ticker
- **AsyncStorage** for persistence (keys prefixed `@buzzed_`)
- **react-native-view-shot** + **expo-sharing** for calendar sharing
- **date-fns** for date handling
- **expo-linear-gradient** for the UI
- **Jest** + **@testing-library/react-native** for tests

---

## Project structure

```
Buzzed/
├── App.tsx
├── src/
│   ├── data/drinkLibrary.ts        # ~100 preloaded drinks (static)
│   ├── types/index.ts              # All TypeScript interfaces
│   ├── constants/
│   │   ├── colors.ts               # Colorblind-safe level palette
│   │   ├── levels.ts               # Level thresholds + labels
│   │   ├── theme.ts                # Warm-earth UI theme
│   │   └── legal.ts                # Legal document copy
│   ├── utils/
│   │   ├── drinkCalculator.ts      # Standard drink math
│   │   ├── levelEngine.ts          # Level mapping + hysteresis
│   │   ├── decayTimer.ts           # Per-drink time decay logic
│   │   ├── storageService.ts       # AsyncStorage wrapper
│   │   └── __tests__/              # Unit tests for the core utils
│   ├── contexts/DrinkContext.tsx   # Global state + 1-sec ticker
│   ├── hooks/useDrinkSearch.ts     # Drink library search
│   ├── components/                 # Reusable UI + legal modals
│   ├── screens/                    # Main, Library, Cabinet, Calendar, Settings, AgeGate
│   └── navigation/AppNavigator.tsx # Tab + modal navigation
├── scripts/                        # Verification scripts (verify-*.mjs)
├── jest.config.js
├── tsconfig.json
└── package.json
```

### Navigation

**Bottom tabs:** Home · Library · Cabinet · Calendar · Settings
**Modals:** DrinkSelectionModal · DrinkDetailModal · Legal documents

---

## Getting started

```bash
# Install dependencies
npm install

# Start the Expo dev server, then scan the QR code with Expo Go
npx expo start
```

Open the app on a physical device using the [Expo Go](https://expo.dev/go) app, or press `a` / `i`
in the terminal to launch an Android emulator / iOS simulator.

### Common commands

```bash
npx expo start          # Start dev server (Expo Go)
npm test                # Run Jest tests
npx tsc --noEmit        # Type-check without emitting
npx expo lint           # Lint
```

---

## Testing

The project follows a **TDD** approach — tests are written first, committed, then implemented until
green. The core calculation utilities (`drinkCalculator`, `levelEngine`, `decayTimer`) are held to
**>90% coverage**, since everything the user sees depends on them being correct.

```bash
npm test
```

---

## Design constraints

These are hard rules the app is built around:

- **Never BAC / Widmark.** All impairment is derived from standard drink units only.
- **Fixed decay** of exactly 1 standard drink per hour, per-drink timestamp decay.
- **Live ticker** recalculates from `Date.now()` every second — no manual refresh.
- **Hysteresis** — levels rise immediately, fall only after 3 minutes.
- **Colorblind-safe** palette throughout.
- **Expo Go compatible** — only Expo SDK packages, no native modules or dev-client.
- **Entertainment disclaimer** is always present on the main screen.

---

## License

See [LICENSE](LICENSE).
