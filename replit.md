# NaijaAcademy — Expo App

## Overview
A React Native / Expo mobile app for Nigerian exam prep (WAEC, NECO, JAMB).
Covers Mathematics, Physics, Chemistry, Biology, and English Language.

## Tech Stack
- **Expo SDK 52** with Expo Router (file-based routing)
- **React Native 0.76** with web support (react-native-web)
- **TypeScript** throughout
- **@tanstack/react-query** for state management
- **@expo/vector-icons** (Ionicons, MaterialCommunityIcons)
- **react-native-reanimated** for animations
- **react-native-safe-area-context** for device insets

## Project Structure
```
app/
  _layout.tsx          # Root layout (fonts, query client, gesture handler)
  (tabs)/
    _layout.tsx        # Bottom tab navigation
    index.tsx          # Dashboard (Home tab)
    exams.tsx          # Mock Exams tab
    subjects.tsx       # Subjects list tab
    profile.tsx        # Profile & Settings tab
  cbt.tsx              # CBT Exam full-screen modal
  subject/[id].tsx     # Subject detail screen
constants/
  theme.ts             # Colors, fonts, spacing, radius
assets/                # App icons and splash screen
cbt_questions.json     # CBT exam question bank (imported directly)
```

## Navigation
- **Bottom Tabs**: Home, Exams, Subjects, Profile
- **Exam flow**: Exams tab → CBT full-screen modal
- **Subject flow**: Subjects tab → Subject detail with topics

## Design
- Dark theme (#0A0E1A background)
- Green accent (#00D26A) — Nigeria flag inspired
- Glass-card surfaces with border highlights
- Inter font family

## Running
```
npx expo start --web --port 5000
```
Workflow: "Start application" on port 5000 (web preview)

## Deployment
Configured as autoscale with `expo start --no-dev`.
