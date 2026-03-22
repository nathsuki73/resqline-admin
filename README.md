# ResqLine Admin

ResqLine Admin is a real-time operational dashboard for emergency-response administration. It provides incident monitoring, responder management, reporting tools, settings management, and map-based situational awareness, connected to backend services and live event streams.

## Overview

This application is designed for administrative and dispatch workflows in the ResqLine ecosystem.

It includes:

- Live incident triage and responder coordination
- Geospatial map operations and marker visibility
- Reports management and synchronization logic
- User-facing settings for profile, display, alerts, and roles
- Utility-first UI composition with reusable frontend components

## Full Frontend Tech Stack

### Core Framework and Language

- **Next.js 16** (`next`) - App Router-based React framework
- **React 19** (`react`, `react-dom`) - Component architecture and UI rendering
- **TypeScript 5** (`typescript`) - Type-safe application development

### Styling and UI

- **Tailwind CSS 4** (`tailwindcss`, `@tailwindcss/postcss`) - Utility-first styling system
- **PostCSS** (`postcss.config.mjs`) - CSS processing pipeline
- **Lucide React** (`lucide-react`) - Consistent icon system

### Mapping and Geospatial UI

- **Mapbox GL JS** (`mapbox-gl`) - Interactive map rendering
- **react-map-gl** (`react-map-gl`) - React integration for map workflows
- **@types/mapbox-gl** - Type support for map features

### Real-Time and Integrations

- **Microsoft SignalR Client** (`@microsoft/signalr`) - Real-time updates and event streaming
- **EmailJS Browser SDK** (`@emailjs/browser`) - Client-side email integration support

### Quality and Tooling

- **ESLint 9 + eslint-config-next** - Linting and code-quality checks
- **Vitest** (`vitest`) - Unit test runner
- **Type Definitions** (`@types/node`, `@types/react`, `@types/react-dom`) - Strong type coverage

## Application Areas

- **Dashboard**: Incident feed, details panel, dispatch unit flow, map visualization
- **Map View**: Operational map, side panel context, map header tools
- **Responders**: Unit creation/editing, archive flow, reusable forms and helpers
- **Reports**: Reports table/sidebar, report category/status constants, report transitions and sync
- **Settings**: Profile, display, alerts, roles, and reusable settings UI primitives
- **Shared Infrastructure**: Global hooks, local storage/report DB services, formatting and class utilities

## Project Structure

Key top-level areas:

- `app/` - App Router pages, shared layout, global styles, and feature components
- `app/components/` - Feature-specific UI and domain components
- `app/features/reports/` - Report domain types and service logic
- `app/hooks/` - Shared hooks for reports state and real-time updates
- `app/services/` - Local persistence and synchronization helpers
- `app/constants/` - Domain constants with tests
- `app/lib/` - Formatting and UI utility helpers
- `public/images/` - Static assets

## Scripts

- `npm run dev` - Start local development server
- `npm run build` - Build production bundle
- `npm run start` - Run production server
- `npm run lint` - Run lint checks
- `npm run test` - Run unit tests (Vitest)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the app in development mode:

```bash
npm run dev
```

3. Open the local URL shown in terminal (typically `http://localhost:3000`).

## Credits

- [Joko2005](https://github.com/Joko2005)
- [Weiasnormal](https://github.com/Weiasnormal)
- [shimaIX](https://github.com/shimaIX)
- [recca383](https://github.com/recca383)
