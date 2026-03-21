# NaijaAcademy

An educational mobile and web app built with React Native (Expo) to help Nigerian students prepare for JAMB (UTME), WAEC, and NECO exams.

## Features

- **Lesson Notes**: Structured study material for subjects (Mathematics, English, Physics, Chemistry, Biology, etc.)
- **CBT Mock Exams**: Practice questions simulating real exam environments
- **Study Tracking**: Study streaks, JAMB Readiness scores, and recent activity
- **Authentication**: Supabase-based auth with onboarding flow

## Tech Stack

- **Frontend**: React Native via Expo (~52.0.0) with Expo Router (~4.0.0)
- **Navigation**: Expo Router file-based routing with bottom tabs
- **Backend/Auth**: Supabase (`@supabase/supabase-js`)
- **State Management**: React Query (`@tanstack/react-query`) + React Context
- **Math Rendering**: KaTeX
- **Animations**: React Native Reanimated + Gesture Handler

## Project Structure

```
app/                 # Expo Router pages
  (tabs)/            # Main tab navigation (Home, Exams, Subjects, Profile)
  _layout.tsx        # Root layout with providers
  onboarding.tsx     # Onboarding screen
  lesson.tsx         # Lesson viewer
  cbt.tsx            # CBT exam interface
  subject/[id].tsx   # Dynamic subject dashboard
assets/              # Images, icons, fonts
components/          # Reusable UI components
context/             # AuthContext, ThemeContext
hooks/               # Custom React hooks
lib/                 # Data files, utilities, Supabase client
  supabase.ts        # Supabase client (uses lib/supabase.config.json)
  lessonsData.ts     # Pre-compiled lesson HTML content
  subjectsData.ts    # Subject/topic registry
  cbt_questions.json # Question bank
scripts/             # Python scrapers for content pipeline
```

## Running the App

The app runs via the "Start application" workflow using `npm start` which starts Expo on port 5000.

## Content / Lessons Pipeline

- `Pages/{subject}/*.html` — scraped lesson HTML files (source of truth)
- `scripts/build_lessons_data.py` — converts Pages/ HTML → `lib/lessonsData.ts`
- Run `python3 scripts/build_lessons_data.py` after adding/renaming any HTML files
- Topic filenames **must match** the slug the app generates: `topicName.toLowerCase().replace(/[^a-z0-9]+/g, '-')`
- Current content coverage: Biology (5), Chemistry (5), English (4), Maths (6), Physics (7)
- Subjects with zero scraped content: Government, Economics, Literature, Agric, Commerce, Geography, Further Maths, Accounting, CRK, IRK, Civic, Technical Drawing

## Replit Compatibility

The following patches were applied to make Expo work behind Replit's proxy:
1. `node_modules/@expo/cli/build/src/start/server/middleware/CorsMiddleware.js` — patched to allow `.replit.dev` and `.replit.app` origins
2. `node_modules/@expo/cli/build/src/start/server/metro/dev-server/createEventSocket.js` — patched to allow WebSocket connections from Replit domains
3. `metro.config.js` — updated enhanceMiddleware to strip Replit origin headers

## Configuration

- Supabase credentials stored in `lib/supabase.config.json` (url + anonKey)
- App configured for web output in `app.json` (metro bundler, static output)
