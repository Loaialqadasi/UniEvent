# Conflict Report — UniEvents Merge

## File Renames (Naming Conflicts)

| Original File | Module | Renamed To | Reason |
|---|---|---|---|
| `views/HomePage.vue` | C (Dashboard-Gallery) | `views/LandingView.vue` | Naming convention consistency; avoids ambiguity with `/` route vs authenticated home |
| `views/EventsPage.vue` | C (Dashboard-Gallery) | `views/GalleryView.vue` | Module A already owns the concept of "events management"; Module C's version is a **read-only gallery** with image cards — distinct UX purpose |
| `views/DashboardPage.vue` | C (Dashboard-Gallery) | `views/DashboardView.vue` | Naming convention consistency |
| `views/CalendarPage.vue` | C (Dashboard-Gallery) | `views/GalleryCalendarView.vue` | Module A has `CalendarView.vue`; Module C's calendar is public-facing with a different UI |
| `src/router.ts` | C (Dashboard-Gallery) | Absorbed into `src/router/index.js` | Module C used a flat `router.ts`; unified into the shared `/router/` directory |
| `src/main.ts` | C (Dashboard-Gallery) | Absorbed into `src/main.js` | Removed TypeScript entry point; project uses JS for entry (TS composables retained) |

---

## Route Path Changes

| Old Path | Module | New Path | Reason |
|---|---|---|---|
| `/events` | A (Event Manager) | `/manage-events` | Freed `/events` namespace; Module C's gallery needed `/gallery` as the public events browser. Legacy redirect `/events → /manage-events` kept. |
| `/events/:id` | A (Event Manager) | `/manage-events/:id` | Matched rename above. Legacy redirect kept. |
| `/booking/payment` | B (Booking-Payment) | `/checkout` | Matches proposal spec. Legacy redirect `/booking/payment → /checkout` kept. |
| `/` | B/Main (redirect to `/login`) | `/` → `LandingView` | Root now shows Module C's public landing page. Unauthenticated users see the app before logging in. |
| `/events` | C (Dashboard-Gallery) | `/gallery` | Resolved conflict with Module A's `/events` |
| `/calendar` (CalendarPage) | C | `/gallery/calendar` | Resolved conflict with Module A's authenticated `/calendar` |
| `/dashboard` | C (Dashboard-Gallery) | `/dashboard` | No conflict — new route added |

---

## Dependency Conflicts

| Package | Module A/B/Main Version | Module C Version | Resolution |
|---|---|---|---|
| `vue-router` | `^5.0.7` | `^4.6.4` | **Chose `^5.0.7`** (latest stable) |
| `pinia` | `^3.0.4` | Not present | **Added** for all modules |
| `@vueuse/core` | Not present | `^14.3.0` | **Added** (Module C requires it) |
| TypeScript toolchain | Not present | `vue-tsc`, `@vue/tsconfig`, `typescript` | **Excluded from devDeps** — project standardized on `.js` entry files; TypeScript `.ts` composables work without build-time `vue-tsc` in Vite |

---

## Component Conflicts & Decisions

| Component | Conflict | Resolution |
|---|---|---|
| `AppHeader.vue` | Module A/B had `AppHeader.vue`; Module C had `Navbar.vue` — completely different designs | **Kept both**: `AppHeader.vue` used for authenticated routes (A/B); `Navbar.vue` used for public routes (C). `App.vue` conditionally renders the correct one based on route. |
| Search Feature | Module A's `EventManagementView.vue` has inline search; Module C's `GalleryView.vue` (formerly EventsPage) also has search | **Kept both separate** — they serve different data sources and user contexts. No collision. |
| `CalendarView.vue` | Both A and C had a calendar view | **Kept both**: A's = authenticated organizer/student calendar; C's = public gallery calendar (`GalleryCalendarView.vue`) |
| `ForumPage.vue` (C) vs `ForumView.vue` (A) | Both had a forum | **Only Module A's forum kept** — it has richer features (create post, forum detail, comments). Module C's ForumPage was a simpler prototype. |
| `style.css` | All 4 had separate CSS files | **Merged** — Tailwind `@theme` tokens from C + all CSS custom properties and component classes from A/B combined into one file |
| `public/data/events.json` (C) vs in-memory mock data (A/B) | Different data schemas and locations | **Unified** into `public/data/mockData.json` with fields covering both schemas (`id`, `numericId`, `image`, `imageFallback`, etc.). Axios calls in `GalleryView.vue` updated to `/data/mockData.json`. |

---

## Files Modified (Post-Merge Patches)

| File | Change |
|---|---|
| `src/App.vue` | Rewritten — dual-layout logic (public Navbar+Footer for Module C routes; AppHeader for A/B) |
| `src/router/index.js` | Rewritten — unified all 4 module routes with renames, legacy redirects, guard |
| `src/style.css` | Rewritten — merged Tailwind v4 `@theme` + CSS custom properties + all component styles |
| `src/main.js` | Rewritten — added Pinia, uses JS entry (replaces Module C's `main.ts`) |
| `src/components/AppHeader.vue` | Updated nav links to include Dashboard + Gallery routes |
| `src/views/LandingView.vue` | Updated component import paths (`gallery/` subfolder) |
| `src/views/GalleryView.vue` | Updated axios path to `/data/mockData.json`; updated `useAuth` import |
| `src/components/dashboard/Navbar.vue` | Updated `useAuth` relative import path (`../../composables/`) |
| `src/components/dashboard/SignInDialog.vue` | Updated `useAuth` relative import path |
| `src/components/shared/Footer.vue` | Updated `/events` link → `/gallery` |
| `package.json` | Merged all deps; resolved vue-router version conflict |
| `vite.config.js` | Added `@` alias; standardized to `.js` |
