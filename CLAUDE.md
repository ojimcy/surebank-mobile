# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SureBank is a React Native mobile application for financial services including package management, payments, and KYC verification, built with Expo SDK. The project uses TypeScript, NativeWind v4 for styling, and follows a modular navigation-based architecture. This project is being migrated from a Capacitor-based React app to Expo React Native.

## Development Commands

**Core Development**:
- `npm start` - Start Expo dev server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator  
- `npm run web` - Run on web
- `npm run reset` - Start with cache cleared

**Code Quality**:
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run type-check` - Run TypeScript type checking

## Architecture

### Project Structure
```
src/
├── contexts/            # React contexts (QueryContext for TanStack Query)
├── config/             # Environment and app configuration
├── navigation/         # React Navigation setup (9 files)
│   ├── RootNavigator.tsx    # Main app navigation logic
│   ├── AuthStack.tsx        # Authentication flow
│   ├── MainTabs.tsx         # Bottom tab navigation (5 tabs)
│   ├── *Stack.tsx          # Feature-specific stack navigators
│   └── types.ts            # Navigation type definitions
├── screens/            # Screen components organized by feature
│   ├── Auth/          # Authentication screens (Login, Register, Verify, etc.)
│   ├── Dashboard/     # Main dashboard screens
│   ├── Packages/      # Package management screens
│   ├── Payments/      # Payment and transaction screens
│   ├── Settings/      # App settings and profile management
│   ├── Common/        # Shared screens (QR Scanner, Image Viewer)
│   └── Onboarding/    # User onboarding and KYC flow
└── types/             # Global TypeScript type definitions
```

### Key Technologies
- **React Native 0.79.5** with **Expo SDK ~53.0.22**
- **TypeScript** with strict mode enabled
- **React Navigation 7.x** for navigation (stack, tabs, drawer)
- **NativeWind v4** - Tailwind CSS for React Native styling
- **TanStack Query v5** for server state management
- **Zustand v5** for client state management
- **React Hook Form + Yup** for form handling and validation
- **Axios** for API requests

### Import Paths
- Uses path alias `@/*` pointing to `./src/*`
- Import components as `import { Component } from '@/screens/Feature/Component'`

### Styling System
- **NativeWind v4** with Tailwind classes via `className` prop
- **Primary brand color**: SureBank brand colors (to be defined)
- **Design tokens**: SureBank design system in `tailwind.config.js`
- **Dark mode support**: Configured via class selector

### Navigation Architecture
- **RootNavigator**: Controls auth state and main app flow
- **Authentication Logic**: `isAuthenticated` flag determines screen stack
- **Type-safe Navigation**: Complete TypeScript definitions in `navigation/types.ts`
- **Modal Screens**: QR Scanner and Image Viewer as modal presentations
- **5-Tab Interface**: Dashboard, Packages, Payments, History, Settings

### State Management
- **TanStack Query**: Server state with QueryContext provider
- **Query Configuration**: 5-minute stale time, retry logic enabled
- **Zustand**: Client-side state (implementation pending)

### Environment Configuration
- **Environment Variables**: 30+ vars defined in `.env.example`
- **Firebase Integration**: Analytics, Crashlytics, Push Notifications
- **Feature Flags**: Built-in development feature toggles
- **Multi-environment**: Development, staging, production configs

## Development Notes

### Build Configuration
- **Entry Point**: `index.js` (renamed from `index.ts` for Babel compatibility)
- **Metro Config**: NativeWind CSS processing enabled
- **Babel**: Module resolver for path aliases, NativeWind preset
- **TypeScript**: Strict mode, Expo base configuration

### Code Quality Setup
- **ESLint**: TypeScript ESLint rules v8.42.0
- **Type Checking**: Run `npm run type-check` before commits
- **Path Aliases**: All imports use `@/*` for clean structure

### Current State
- **Architecture**: Foundational navigation and screen structure complete
- **Implementation**: Most screens are placeholders awaiting development
- **Missing**: No `components/`, `services/`, `hooks/`, or `utils/` directories yet
- **Testing**: No test setup configured

### Important Files
- **app.config.ts**: Expo configuration with Firebase setup
- **tailwind.config.js**: SureBank design system and brand colors
- **navigation/types.ts**: Complete navigation TypeScript definitions
- **.env.example**: Template for all environment variables

## Migration Context

This project is being migrated from a Capacitor-based React app to Expo React Native. The migration follows the plan outlined in plan.md, converting all existing functionality including authentication, package management, payments, KYC verification, and financial services.