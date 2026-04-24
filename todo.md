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

## Other directions
- [ ] Past-question vault per university cutoff (UNILAG, UI, OAU…)
- [ ] Parent / guardian view — weekly progress email
- [ ] Scholarship & university opportunity feed
- [ ] Free vs Pro tier (Pro = AI tutor + unlimited practice + offline pack)

## Suggested build order
1. Migration leftovers (1 session)
2. AI Tutor on lessons + AI question generator
3. Weak-topic detection + Daily 5
4. Tech Track v1 (read-only programming lessons)
5. Decide between full code sandbox vs voice tutor based on user feedback
