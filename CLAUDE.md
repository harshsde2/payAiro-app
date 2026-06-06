# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# iOS
yarn ios:staging:debug        # Run staging on simulator
yarn ios:production:debug     # Run production on simulator
yarn ios:device:staging       # Run staging on physical device
yarn pod                      # Install CocoaPods

# Android
yarn android:staging:debug    # Run staging on device/emulator
yarn android:production:debug # Run production on device/emulator

# Build
yarn android:staging:release:build    # Staging APK
yarn android:production:release       # Production APK

# Dev
yarn start                    # Start Metro bundler
yarn lint                     # ESLint
yarn test                     # Jest (all tests)
npx jest path/to/test.ts      # Run a single test file
```

## Architecture

### Two-layer UI (old vs new)
The app is mid-migration. **Only work in the new layer** unless explicitly asked about legacy code:

- `src/new-ui/` — active UI layer (screens, components, hooks, assets, styles)
- `src/screens/` and `src/components/` — legacy UI layer, do not add new code here

### API layer (`src/api/`)
- **`userApiClient.ts`** — the active API client. Wraps Axios with Bearer token injection from MMKV, automatic token refresh on 401/403 (single in-flight refresh promise), and dev logging.
- **`endpoints.ts`** — all endpoint strings in one place. New FastAPI endpoints live under `USER_AUTH.*` (relative to `USER_API_BASE_URL`). Legacy Django endpoints use `AUTH.*`, `WALLET.*`, `KYC.*`, etc.
- Always use `userApiClient` for new feature API calls. Legacy code may use a separate Axios instance — don't extend it.

### Navigation
- `src/navigations/navigationConstants.ts` — single source of truth for all screen name strings (`NAVIGATION_SCREENS` const).
- `src/navigations/AppStack.tsx` — the main authenticated stack. New UI screens are prefixed with `NEW_` in `NAVIGATION_SCREENS`.
- `src/new-ui/navigationTypes.ts` — typed param lists (`NewUIAuthStackParamList`, `NewUIDashboardStackParamList`). Always add new screen params here.
- New screens that need the shared header use `header: AppStackHeader` from `AppStack.tsx`.

### Auth & session
- `src/auth/authSession.ts` — all auth state helpers. Tokens stored in MMKV (`STORAGE_KEYS.AUTH_TOKENS`), onboarding state tracked with `ONBOARDING_COMPLETE` and `AUTH_ONBOARDING_STEP`.
- `getAuthStackInitialRoute()` determines where auth flow resumes after app restart.
- Sensitive tokens (legacy) also stored in `EncryptedStorage` under key `guruPanda_token`.

### `src/new-ui/` structure
```
screens/          # Feature screens (Auth, CashRamp, Send, AddBalance, etc.)
components/
  common-components/  # Shared UI: CustomHeader, DashboardHeader, GlassyWrapper, etc.
hooks/            # Shared hooks
styles/
  ThemeContext/   # Theme provider and useTheme hook
  themes/         # Light/dark theme definitions
assets/svgs/      # SVG icons — import from index.ts via AppIcon.*
navigationTypes.ts # TypeScript param lists for new-ui screens
```

### Path aliases (babel)
- `@new-ui` → `src/new-ui`
- `@tsx-components` → `src/tsx-components`
- Bare imports (e.g. `import X from "navigations/..."`) resolve from `src/` root.

### Native modules
- Coinme Risk SDK has custom native modules: `ios/payAiro/PayAiroCoinmeRiskModule.swift` (iOS) and `android/app/src/main/java/com/payairo/coinmerisk/PayAiroCoinmeRiskModule.kt` (Android).

### State management
- Server state: TanStack React Query (`@tanstack/react-query`) with MMKV persistence.
- Client/global state: Redux Toolkit (`@reduxjs/toolkit`).
- Local storage: `react-native-mmkv` for fast sync reads; `react-native-encrypted-storage` for sensitive data.

### Environments
Config loaded via `react-native-config` from `.env`, `.env.staging`, or `.env.production`. Env values accessed through `src/config/env.config.ts` (`EnvConfig`), never directly via `Config.*`.
