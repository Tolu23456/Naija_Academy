# NaijaAcademy

An educational mobile and web app built with React Native (Expo) to help Nigerian students prepare for JAMB (UTME), WAEC, and NECO exams.

## Features

- **Lesson Notes**: Structured study material for 17+ subjects (Mathematics, English, Physics, Chemistry, Biology, etc.)
- **CBT Mock Exams**: Practice questions simulating real exam environments
- **Study Tracking**: Study streaks, JAMB Readiness scores, and recent activity
- **Authentication**: Supabase-based auth with onboarding flow
- **Profile Settings**: Persistent study preferences (session duration, target score, notifications) with local storage

## Tech Stack

- **Frontend**: React Native via Expo (~52.0.0) with Expo Router (~4.0.0)
- **Navigation**: Expo Router file-based routing with bottom tabs
- **Backend/Auth**: Supabase (`@supabase/supabase-js`)
- **State Management**: React Query (`@tanstack/react-query`) + React Context
- **Local Storage**: AsyncStorage for study preferences persistence
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
scripts/             # Python content pipeline
  scrape_content.py  # Full scraper: topic-based + full-site crawl mode
  merge_notes.py     # Intelligent multi-source notes merger
  build_lessons_data.py  # Markdown → TypeScript compiler
```

## Running the App

The app runs via the "Start application" workflow using `npm start` which starts Expo on port 5000.

## Content / Lessons Pipeline

### Standard scraping (topic-by-topic):
```
python3 scripts/scrape_content.py                    # all subjects
python3 scripts/scrape_content.py --subject maths    # one subject
python3 scripts/scrape_content.py --lessons-only     # skip questions
python3 scripts/scrape_content.py --questions-only   # skip lessons
```

### Full-site crawl (downloads ALL content from every site):
```
python3 scripts/scrape_content.py --crawl              # crawl all sites, all subjects
python3 scripts/scrape_content.py --crawl --subject biology  # crawl one subject
python3 scripts/scrape_content.py --crawl --crawl-limit 200  # limit articles per site
```
Sources: classnotes.ng | classbasic.com | edudelight.com (lessons)
         myschool.ng | prepclass.com.ng (questions)

### Merging notes from multiple sources:
```
python3 scripts/merge_notes.py               # merge all subjects
python3 scripts/merge_notes.py --subject maths
python3 scripts/merge_notes.py --dry-run     # preview without writing
```

### Building the app data:
```
python3 scripts/build_lessons_data.py
```
- `Pages/{subject}/*.html` — legacy scraped HTML (source)
- `content/{subject}/{topic}.md` — new markdown-based content
- `lib/lessonsData.ts` — compiled TypeScript output for the app

### npm shortcuts:
```
npm run scrape           # standard scrape
npm run scrape:crawl     # full-site crawl
npm run merge:notes      # merge multi-source notes
npm run build:lessons    # compile to TypeScript
npm run build:web        # build static web export for deployment
```

## Deployment

### Render
A `render.yaml` is included. On Render:
1. Connect this repo
2. Render auto-detects `render.yaml`
3. Set environment variables: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy — build runs `npm install && npx expo export -p web` and serves from `dist/`

### Docker
```
docker-compose up app-prod
```
Pass Supabase credentials as build args:
```
docker-compose build --build-arg SUPABASE_URL=... --build-arg SUPABASE_ANON_KEY=...
```

## Profile Page

The profile page now has fully functional:
- **Daily Reminders toggle** — persisted with AsyncStorage
- **Dark Mode toggle** — applied app-wide
- **Session Duration** — picker modal, saves to AsyncStorage
- **Target Score** — picker modal, saves to AsyncStorage
- **Edit Profile** — modal to update display name via Supabase
- **Help & Support** — modal with support contacts
- **About NaijaAcademy** — modal with app info and stats

## Dynamic Content (No-Rebuild Updates)

Lessons are served from Supabase Storage and fetched at app startup (cached for 24 h locally).
This means content can be updated without rebuilding or redeploying the app.

**Service**: `lib/remoteContent.ts`
- Checks in-memory cache → AsyncStorage (24 h TTL) → remote fetch → baked-in fallback
- Reads `EXPO_PUBLIC_LESSONS_URL` env var, or auto-constructs from `EXPO_PUBLIC_SUPABASE_URL`
- Use `clearLessonsCache()` to force a fresh fetch

**Upload pipeline**:
```
npm run scrape       # scrape content
npm run merge:notes  # merge sources
npm run build:lessons # compile to TypeScript
npm run upload:content  # upload JSON to Supabase Storage
```
Or: `SUPABASE_URL=... SUPABASE_SERVICE_KEY=... python3 scripts/upload_content.py`

**Env var**: set `EXPO_PUBLIC_LESSONS_URL` to the public Supabase Storage URL printed by `upload:content`.

## Push Notifications

Daily study reminders are scheduled with `expo-notifications`.
- Toggle in **Profile → Daily Reminders**
- Fires daily at 7:00 PM
- Requests OS permission on first enable
- Silently skipped on web (native-only feature)
- No backend required — uses local device scheduling

## Per-Subject Progress Tracking

Every lesson view is recorded in `lib/studyTracker.ts` as `subject:slug` in AsyncStorage.
- **Subjects screen**: progress bars show `% of topics studied` per subject
- **Subject detail screen**: completed topics show a green checkmark and `Done` badge, with a coloured left border accent; progress bar shows user completion %
- Functions: `getSubjectProgress(subjectId, totalTopics)`, `getAllSubjectsProgress()`

## Content Pipeline (GitHub Actions)

`.github/workflows/scrape-content.yml` runs every Sunday at 3am UTC:
1. Scrape lesson content (all subjects, or one if `subject` input is set)
2. Merge multi-source notes intelligently
3. Compile lessons JSON
4. Upload to Supabase Storage (no git commit → no Render rebuild)
5. Commit only the questions bank if it changed (`[skip ci]`)

**Required GitHub secrets**: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (service_role key)

## Replit Compatibility

The following patches are applied to make Expo work behind Replit's proxy:
1. `node_modules/@expo/cli/build/src/start/server/middleware/CorsMiddleware.js` — allows `.replit.dev`, `.replit.app`, `.repl.co` origins
2. `node_modules/@expo/cli/build/src/start/server/metro/dev-server/createEventSocket.js` — allows WebSocket connections from Replit domains

## Configuration

- Supabase credentials stored in `lib/supabase.config.json` (url + anonKey)
- For Render/production: use `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` env vars
- App configured for web static output in `app.json`
