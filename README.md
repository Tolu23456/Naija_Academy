# NaijaAcademy

A full-featured educational mobile and web app built with React Native (Expo) to help Nigerian students prepare for **JAMB (UTME)**, **WAEC**, and **NECO** exams.

---

## Features

| Feature | Description |
|---|---|
| **Lesson Notes** | Structured HTML study notes for 17+ subjects, loaded dynamically from Supabase Storage |
| **CBT Simulator** | Timed practice exams with per-question feedback and score tracking |
| **Study Tracker** | Study streaks, topics completed, running average score — all stored locally |
| **Subject Dashboards** | Per-subject progress bars showing exactly which topics are done |
| **Admin Panel** | Restricted 5-tab panel with lesson coverage, CBT analytics, real announcement management, and persistent app settings |
| **Onboarding** | Four-slide animated intro with entrance animations |
| **Authentication** | Supabase email/password auth + GitHub OAuth, with guest mode |
| **Dark Mode** | App-wide dark theme, toggle in Profile |
| **Push Notifications** | Daily study reminders at 7 PM (native only) |
| **Offline Support** | 24-hour local cache for lesson content via AsyncStorage |
| **Skeleton Loading** | Animated pulse-shimmer skeletons while data loads |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native via Expo `~52.0.0` |
| Routing | Expo Router `~4.0.0` (file-based) |
| Backend / Auth | Supabase (`@supabase/supabase-js`) |
| State | React Query + React Context |
| Persistence | AsyncStorage |
| Math rendering | KaTeX (web) |
| Animations | React Native `Animated` API (web-safe, `useNativeDriver: false` on web) |
| Icons | `@expo/vector-icons` — Ionicons + MaterialCommunityIcons |

---

## Project Structure

```
app/
  _layout.tsx           Root layout: fonts, providers, routing logic
  onboarding.tsx        Animated 4-slide onboarding
  auth.tsx              Sign-in / sign-up / GitHub OAuth
  admin.tsx             Admin panel (5 tabs)
  lesson.tsx            Full-screen lesson viewer (HTML + KaTeX)
  cbt.tsx               CBT exam engine (timed, scored)
  exam-setup.tsx        Exam configuration modal
  subject/[id].tsx      Per-subject dashboard with progress
  (tabs)/
    index.tsx           Home: streak, JAMB readiness, recent activity
    exams.tsx           Exam picker
    subjects.tsx        All subjects grid with progress bars
    profile.tsx         Settings, preferences, dark mode toggle

components/
  FadeInView.tsx        Reusable fade+slide entrance animation
  SkeletonLoader.tsx    Pulse-animated skeleton shimmer (SkeletonBox, StatCardSkeleton, ListRowSkeleton)
  LessonHTML.tsx        WebView / web div lesson renderer
  MathText.tsx          KaTeX math renderer
  OfflineBanner.tsx     Offline state indicator

context/
  AuthContext.tsx       Supabase session, signIn, signUp, signOut
  AdminContext.tsx      Admin credential check + session flag
  ThemeContext.tsx      App-wide dark/light theme

lib/
  supabase.ts           Supabase client (reads supabase.config.json)
  supabase.config.json  Supabase URL + anon key (not committed in public forks)
  lessonsData.ts        Auto-generated lesson HTML map (compiled by build script)
  subjectsData.ts       Master subjects/topics registry (17 subjects, 170+ topics)
  studyTracker.ts       AsyncStorage-backed study stats engine
  remoteContent.ts      Dynamic content fetcher with 24h cache
  adminData.ts          AsyncStorage-backed admin data (announcements, settings)
  onboarding.ts         Onboarding completion flag

scripts/
  download_icons.py     Download all app icon SVGs to assets/icons/
  scrape_content.py     Full lesson scraper (topic-by-topic + full-site crawl)
  merge_notes.py        Multi-source notes merger
  build_lessons_data.py Markdown → TypeScript compiler
  upload_content.py     Upload compiled content to Supabase Storage

assets/
  fonts/                Inter font family (Regular, Medium, SemiBold, Bold)
  icons/                Downloaded SVG icons — run download_icons.py to populate
    ionicons/           71 Ionicons SVGs
    mdi/                MaterialCommunityIcons SVGs
```

---

## Running the App

The app starts via the **Start application** workflow:

```bash
npm install && npx expo start --web --port 5000 --non-interactive
```

Open the preview pane on port 5000.

---

## Admin Panel

Sign in with the admin credentials to access a 5-tab panel — no email confirmation needed.

```
Email:    naijacdm@gmail.com
Password: Esclapes123#
```

### Tabs

| Tab | What it shows |
|---|---|
| **Overview** | Real platform stats (lesson count, topic count, coverage %) + live study activity feed from the local tracker |
| **Content** | Real lesson coverage per subject with colour-coded progress bars; highlights subjects missing content |
| **CBT** | Real CBT session history from the local study tracker; coverage % by exam board (JAMB / WAEC / NECO) |
| **Announcements** | Create, pin/unpin, and delete announcements — persisted to device storage across sessions |
| **Settings** | Toggle app flags (maintenance mode, guest access, leaderboard…) — persisted to device via AsyncStorage |

> All data in the admin panel is **real**: lesson coverage reads from `lessonsData.ts`, CBT stats come from `studyTracker.ts`, and announcements/settings persist to AsyncStorage.

---

## Icon Download Script

Downloads every SVG icon used in the app to `assets/icons/`.

```bash
# Download all 71+ icons (Ionicons + MaterialCommunityIcons)
python3 scripts/download_icons.py

# List icons without downloading
python3 scripts/download_icons.py --list

# Download to a custom directory
python3 scripts/download_icons.py --out path/to/icons
```

Already-downloaded icons are skipped (cached). Sources:
- Ionicons: `unpkg.com/ionicons@7.1.0/dist/svg/`
- MDI: `unpkg.com/@mdi/svg@7.4.47/svg/`

---

## Skeleton Loading

The `SkeletonLoader` component (`components/SkeletonLoader.tsx`) provides three reusable shimmer shapes:

| Component | Use case |
|---|---|
| `<SkeletonBox />` | Any generic placeholder (width, height, radius configurable) |
| `<StatCardSkeleton />` | 2×2 or 4-in-a-row metric cards |
| `<ListRowSkeleton rows={n} />` | List of icon + two-line text rows |

These are used throughout the admin panel while async data loads from `studyTracker` and `adminData`.

---

## Content Pipeline

### Standard scraping

```bash
python3 scripts/scrape_content.py                    # all subjects
python3 scripts/scrape_content.py --subject maths    # one subject
python3 scripts/scrape_content.py --lessons-only     # skip questions
python3 scripts/scrape_content.py --questions-only   # skip lessons
```

### Full-site crawl

```bash
python3 scripts/scrape_content.py --crawl
python3 scripts/scrape_content.py --crawl --subject biology
python3 scripts/scrape_content.py --crawl --crawl-limit 200
```

Sources: `classnotes.ng` · `classbasic.com` · `edudelight.com` (lessons) · `myschool.ng` · `prepclass.com.ng` (questions)

### Merging + building

```bash
python3 scripts/merge_notes.py               # merge multi-source notes
python3 scripts/build_lessons_data.py        # compile Markdown → TypeScript
```

### npm shortcuts

```bash
npm run scrape          # standard scrape
npm run scrape:crawl    # full-site crawl
npm run merge:notes     # merge sources
npm run build:lessons   # compile to TypeScript
npm run build:web       # build static web export
npm run upload:content  # upload JSON to Supabase Storage
```

---

## Dynamic Content (No-Rebuild Updates)

Lessons are served from Supabase Storage and fetched at startup (cached for 24 h in AsyncStorage).

**Service:** `lib/remoteContent.ts`
- Checks in-memory → AsyncStorage (24h TTL) → remote fetch → baked-in fallback
- Set `EXPO_PUBLIC_LESSONS_URL` to the public Supabase Storage URL

**Full pipeline:**

```bash
npm run scrape && npm run merge:notes && npm run build:lessons && npm run upload:content
```

---

## Authentication

| Method | Notes |
|---|---|
| Email / Password | Via Supabase; email confirmation required for new accounts |
| GitHub OAuth | Redirect-based; works on web and native |
| Guest mode | Skip auth entirely — browse app without an account |
| Admin login | Uses hardcoded credentials; bypasses email confirmation; routes directly to `/admin` |

---

## Study Tracking

All data stored in AsyncStorage via `lib/studyTracker.ts`:

| Datum | Description |
|---|---|
| Daily streak | Increments each calendar day the app is opened |
| Topics done | Count of unique lesson notes viewed |
| Avg CBT score | Running weighted average of all exam sessions |
| Recent activity | Last 10 study/exam events (used in home screen + admin) |
| Completed topics | Set of `{subject}:{slug}` strings driving progress bars |

---

## Deployment

### Render

```bash
# render.yaml is included — connect repo, set env vars, deploy
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Build command: `npm install && npx expo export -p web` → serves from `dist/`

### Docker

```bash
docker-compose up app-prod
docker-compose build --build-arg SUPABASE_URL=... --build-arg SUPABASE_ANON_KEY=...
```

---

## Configuration

| File / Variable | Purpose |
|---|---|
| `lib/supabase.config.json` | Local dev Supabase credentials |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase URL (production) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (production) |
| `EXPO_PUBLIC_LESSONS_URL` | Public URL to compiled lessons JSON in Supabase Storage |

---

## GitHub Actions

`.github/workflows/scrape-content.yml` runs every Sunday at 3AM UTC:

1. Scrape lesson content
2. Merge multi-source notes
3. Compile lessons JSON
4. Upload to Supabase Storage (no git commit → no Render rebuild)
5. Commit questions bank if changed (`[skip ci]`)

Required secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`

---

## Replit Compatibility

Two patches make Expo work behind Replit's mTLS proxy:

1. `CorsMiddleware.js` — allows `.replit.dev`, `.replit.app`, `.repl.co` origins
2. `createEventSocket.js` — allows WebSocket connections from Replit domains
