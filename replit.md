# NaijaAcademy

A React Native / Expo mobile and web application for Nigerian students preparing for JAMB, WAEC, NECO, and Common Entrance examinations.

## Features

- **Lesson Notes**: Subject-specific lesson content for Mathematics, Physics, Chemistry, Biology, and English
- **CBT Mock Exams**: Customisable exam simulator — choose exam type (JAMB/WAEC/NECO), subject, question count, time, and year
- **Exam Setup**: Dedicated setup screen with exam type, subject, question count, time limit, and year selector
- **Math Rendering**: KaTeX-powered LaTeX math display on web; clean Unicode fallback on native
- **Progress Tracking**: Dashboard with study streaks, readiness percentages, and activity history; progress resets to 0% for new users
- **Onboarding**: 4-slide onboarding flow including mode selection (Study & Learn vs Past Questions)
- **Auth**: Supabase-based authentication with email/password and GitHub OAuth; guest mode available without credentials
- **GitHub Actions**: Automated content scraping workflow (`.github/workflows/scrape-content.yml`) runs weekly

## Tech Stack

- **Framework**: Expo SDK 52 with expo-router (file-based navigation)
- **UI**: React Native + react-native-web (runs on web and mobile)
- **Math**: KaTeX for LaTeX/formula rendering on web
- **Backend**: Supabase (auth + database) — optional, app works in guest mode without it
- **State**: @tanstack/react-query
- **Navigation**: expo-router with bottom tabs

## Project Structure

```
app/               # Expo Router file-based routes
  (tabs)/          # Bottom tab navigation (Dashboard, Exams, Subjects, Profile)
  _layout.tsx      # Root layout (fonts, theme, auth, onboarding check)
  subject/[id].tsx # Dynamic subject route (progress shows 0% for new users)
  lesson.tsx       # Lesson content viewer
  cbt.tsx          # CBT exam interface (accepts params from exam-setup)
  exam-setup.tsx   # Exam configuration screen (type, subject, count, time, year)
  auth.tsx         # Auth screen (email/password + GitHub OAuth + guest access)
  onboarding.tsx   # 4-slide onboarding flow with mode selection
components/
  MathText.tsx     # KaTeX math renderer (web) / Unicode fallback (native)
  LessonHTML.tsx   # HTML lesson content renderer
context/           # React context providers (Auth, Theme)
lib/
  lessonsData.ts   # All lesson HTML content (auto-generated)
  supabase.ts      # Supabase client (exports isSupabaseConfigured)
  onboarding.ts    # Onboarding/mode storage utilities (localStorage)
hooks/
  useUserStats.ts  # User stats hook + saveUserStats function
scripts/           # Content pipeline scripts
  scrape_content.py      # Scrapes lessons from educational sites
  scrape_cbt.py          # Scrapes past questions
  build_lessons_data.py  # Compiles HTML into lessonsData.ts
  refresh_lessons.sh     # Orchestrates the full pipeline
.github/
  workflows/
    scrape-content.yml   # GitHub Actions: weekly auto-scraping of content
assets/            # Images, fonts, scraped media
Pages/             # Intermediate HTML storage for scraper output
cbt_questions.json # Past exam questions (indexed by subject)
```

## Running the App

The app runs via the "Start application" workflow which:
1. Installs npm dependencies (`npm install`)
2. Starts the Expo dev server (`npx expo start --web --port 5000 --non-interactive`)

## Environment Variables

The app uses Supabase for backend services. Set these as Replit secrets to enable auth:
- `EXPO_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anonymous/public key

Without these, the app runs in guest/offline mode (onboarding, lessons, and CBT all still work; auth is disabled).

## Content Pipeline

To refresh lesson content:
1. `python3 scripts/scrape_content.py` — fetch new lessons
2. `python3 scripts/build_lessons_data.py` — compile into `lib/lessonsData.ts`
Or run `bash scripts/refresh_lessons.sh` to do both steps at once.

The GitHub Actions workflow runs this automatically every Sunday at 02:00 UTC, or can be triggered manually from the GitHub Actions tab.

## Deployment

Uses Expo for EAS builds (iOS/Android). For web deployment, the Expo Metro bundler compiles a static web app. See `eas.json` for EAS configuration.
