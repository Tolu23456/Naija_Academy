# NaijaAcademy

A React Native / Expo mobile and web application for Nigerian students preparing for JAMB, WAEC, and NECO examinations.

## Features

- **Lesson Notes**: Subject-specific lesson content for Mathematics, Physics, Chemistry, Biology, and English
- **CBT Mock Exams**: Computer-Based Testing simulator with 350+ past exam questions
- **Progress Tracking**: Dashboard with study streaks, readiness percentages, and activity history
- **Auth**: Supabase-based authentication with email/password and GitHub OAuth

## Tech Stack

- **Framework**: Expo SDK 52 with expo-router (file-based navigation)
- **UI**: React Native + react-native-web (runs on web and mobile)
- **Backend**: Supabase (auth + database)
- **State**: @tanstack/react-query
- **Navigation**: expo-router with bottom tabs

## Project Structure

```
app/               # Expo Router file-based routes
  (tabs)/          # Bottom tab navigation (Dashboard, Exams, Subjects, Profile)
  _layout.tsx      # Root layout (fonts, theme, auth)
  subject/[id].tsx # Dynamic subject route
  lesson.tsx       # Lesson content viewer
  cbt.tsx          # CBT exam interface
  auth.tsx         # Auth screen
  onboarding.tsx   # Onboarding flow
components/        # Reusable UI components
context/           # React context providers (Auth, Theme)
lib/               # Data and service layers
  lessonsData.ts   # All lesson HTML content (auto-generated)
  supabase.ts      # Supabase client
scripts/           # Content pipeline scripts
  scrape_content.py      # Scrapes lessons from educational sites
  build_lessons_data.py  # Compiles HTML into lessonsData.ts
  refresh_lessons.sh     # Orchestrates the full pipeline
assets/            # Images, fonts, scraped media
Pages/             # Intermediate HTML storage for scraper output
```

## Running the App

The app runs via the "Start application" workflow which:
1. Installs npm dependencies (`npm install`)
2. Starts the Expo dev server (`npx expo start --web --port 5000 --non-interactive`)

## Environment Variables

The app uses Supabase for backend services. Set these as Replit secrets to enable auth:
- `EXPO_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anonymous/public key

Without these, the app runs in offline/demo mode (content and CBT still work, auth is disabled).

## Content Pipeline

To refresh lesson content:
1. `python3 scripts/scrape_content.py` — fetch new lessons
2. `python3 scripts/build_lessons_data.py` — compile into `lib/lessonsData.ts`
Or run `bash scripts/refresh_lessons.sh` to do both steps at once.

## Deployment

Uses Expo for EAS builds (iOS/Android). For web deployment, the Expo Metro bundler compiles a static web app. See `eas.json` for EAS configuration.
