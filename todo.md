# NaijaAcademy — TODO

## Quick fixes (migration leftovers)
- [ ] Onboarding flash on web: tabs render briefly before redirect — gate the navigator on the onboarding check
- [ ] Auth timeout is 4s — bump to ~8s and surface a clearer "offline" state
- [ ] Bake in a starter lesson pack for the top 3–5 subjects so first-open with no data still shows content
- [ ] Silence harmless RN-Web warnings (`pointerEvents`, SSR `useLayoutEffect`)

## Improvements to existing features
- [ ] Weak-topic detection — after each CBT, surface the 2–3 worst topics on the home screen
- [ ] Spaced repetition — auto-resurface wrong questions after 1 / 3 / 7 days
- [ ] Bookmark / "review later" on questions and lesson sections
- [ ] Daily 5 — one-tap, 5-question warmup to keep the streak alive
- [ ] Past-paper *explanations* (not just correct/incorrect)
- [ ] Data-saver mode — skip images, lighter fonts (low-bandwidth toggle)
- [ ] Study buddies / class leaderboards — opt-in friend codes, weekly streak ranking

## Programming courses ("Tech Track")
- [ ] Add a Tech Track separate from JAMB/WAEC/NECO
- [ ] v1 lessons: Intro to Computers, HTML + CSS, Python basics, Intro to AI / prompting
- [ ] Phase 1 — read-only code samples + "what does this print?" multiple choice
- [ ] Phase 2 — in-app code editor that runs Python/JS via remote sandbox

## AI features (ranked by impact)
- [ ] AI Tutor chat per lesson — grounded in the current lesson's notes, supports plain English and Pidgin
- [ ] Unlimited practice question generator (any topic, any difficulty)
- [ ] Step-by-step math solver (type or snap a question)
- [ ] Essay & comprehension grader (English, Literature, CRS/IRS) — band score + 3 specific improvements
- [ ] Personalized study plan generator (based on exam date + weak topics + hours/day)
- [ ] Voice tutor — read lessons aloud, accept voice questions

## Engagement & retention
- [ ] Streak freeze — one freeze per week so a single missed day doesn't kill the streak
- [ ] XP / levels / badges — points per lesson, CBT, and streak day; badges for milestones
- [ ] Weekly challenges — e.g. "complete 3 Physics topics this week" with a reward
- [ ] Live mock exam events — scheduled times, shared paper, live leaderboard
- [ ] Pomodoro timer built into study sessions (25 / 5), counted toward the streak
- [ ] Quiet hours / focus mode — auto-mute notifications during set windows

## Smart studying
- [ ] Topic skill tree — visual prerequisite map per subject
- [ ] Mastery certificates — printable PDF when all topics in a subject are completed
- [ ] Cheat sheet / formula sheet — one-tap quick reference per subject
- [ ] Auto-flashcards generated from any lesson
- [ ] Glossary with hover/tap-to-define for bolded terms
- [ ] Mock exam history with score chart and retake comparison
- [ ] Time-of-day focus heatmap ("you focus best 6–8 PM")

## Localization & accessibility
- [ ] Pidgin English explanations toggle for hard topics
- [ ] Yoruba / Igbo / Hausa lesson summaries for Maths/Science
- [ ] Audio lessons via text-to-speech for every lesson
- [ ] Dyslexia-friendly font option
- [ ] Adjustable lesson font size
- [ ] OLED true-black mode (battery saver for AMOLED screens)
- [ ] Reduce-motion accessibility toggle

## Low-data / offline-first
- [ ] Offline subject packs — download a full subject (lessons + questions) over Wi-Fi
- [ ] SMS-based reminders for users who want to save data
- [ ] Lite mode — skip animations, smaller assets, text-first lessons
- [ ] WhatsApp share — share a study card or tough question in one tap

## Community & social
- [ ] Anonymous Q&A board per topic with upvotes
- [ ] Report wrong answer / broken question button
- [ ] Study group rooms with shared streak and group leaderboard
- [ ] Tutor connect (premium) — book a real human tutor

## Career & life-after-exams
- [ ] Past-question vault per university cutoff (UNILAG, UI, OAU…)
- [ ] JAMB score → university course recommender
- [ ] University cutoff tracker with historical cutoffs per course
- [ ] Exam day checklist — what to bring, time-management tips, last-night routine
- [ ] Scholarship & internship feed — real Nigerian opportunities, refreshed weekly
- [ ] Parent / guardian view — weekly progress email

## Technical wins
- [ ] Search across all lessons (instant fuzzy search)
- [ ] Lazy-load lessons for faster app start and smaller initial bundle
- [ ] Cross-device sync indicator — visible "synced ✓" so progress feels safe
- [ ] PDF export of any lesson for printing/sharing

## Monetization
- [ ] Free tier: lesson notes + 5 CBT questions/day + basic streak
- [ ] Pro tier (₦1,000–2,000/month): AI tutor, unlimited CBT, offline packs, voice tutor, mastery certificates
- [ ] Referral rewards — invite 3 friends → 1 month free Pro
- [ ] School / teacher plans — bulk licenses

## Top 5 highest-impact / lowest-effort additions
1. Streak freeze
2. Search across lessons
3. Offline subject packs
4. University course recommender
5. Pidgin explanations

## Suggested build order
1. Migration leftovers (1 session)
2. AI Tutor on lessons + AI question generator
3. Weak-topic detection + Daily 5
4. Tech Track v1 (read-only programming lessons)
5. Decide between full code sandbox vs voice tutor based on user feedback
