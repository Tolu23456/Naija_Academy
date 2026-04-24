# NaijaAcademy — TODO

## Vision
A universal learning platform: students can prep for JAMB / WAEC / NECO **and** learn anything else — every programming language, web dev, game dev, software dev, AI dev, and every academic + life skill. Exam prep is the anchor; "Learn Anything" is the second pillar.

---

## Foundations needed for the bigger vision

### 1. Scalable content model
- [ ] Redesign content taxonomy: **Domain → Track → Course → Module → Lesson → Section**
- [ ] Domains: Academic (current), Tech, Languages, Business, Creative, Life Skills
- [ ] Tracks within Tech: Web Dev, Mobile Dev, Game Dev, AI/ML, DevOps, Cybersecurity, Data Science, Blockchain
- [ ] Each lesson supports multiple block types: text, code, image, video embed, interactive quiz, project brief
- [ ] Tag every lesson with prerequisites + difficulty (Beginner / Intermediate / Advanced)

### 2. Content authoring & ingestion at scale
- [ ] AI-assisted lesson generation (with human review) so we don't have to scrape every topic
- [ ] Curated outline → AI fills sections → editor approves → publishes
- [ ] Markdown-first authoring so contributors can submit lessons via PR/upload
- [ ] Versioning & "last updated" on every lesson

### 3. Universal search & discovery
- [ ] Global search across every domain, track, lesson, and question
- [ ] "What do you want to learn?" home prompt → smart routing
- [ ] Personalised home: recently studied + recommended next + trending
- [ ] Learning paths: pre-built journeys ("Become a Frontend Dev in 12 weeks", "WAEC English in 30 days")

### 4. Identity & positioning
- [ ] Decide: keep "NaijaAcademy" (locally rooted, globally useful) or sub-brand the Tech/Learn-Anything side
- [ ] New tagline that covers exams **and** lifelong learning
- [ ] Update onboarding to ask "What are you here for today?" — Exam prep / Learn a skill / Both

---

## Tech Track — full curriculum to build out

### Programming Languages
- [ ] Python, JavaScript, TypeScript
- [ ] Java, Kotlin, Swift
- [ ] C, C++, C#
- [ ] Go, Rust
- [ ] PHP, Ruby, Dart
- [ ] R, Julia, MATLAB (data/science)
- [ ] SQL, Bash, PowerShell

### Coding Practices & Foundations
- [ ] Data Structures & Algorithms
- [ ] Design Patterns
- [ ] Clean Code & SOLID principles
- [ ] Git & version control
- [ ] Testing (unit, integration, E2E)
- [ ] Debugging & profiling
- [ ] Code reviews & collaboration

### Web Development
- [ ] HTML, CSS, modern JS
- [ ] Responsive design & accessibility
- [ ] React, Vue, Svelte, Angular, Next.js
- [ ] Node.js, Express, Django, Flask, Rails, Laravel, .NET
- [ ] REST, GraphQL, WebSockets
- [ ] Auth, sessions, security
- [ ] Hosting, CDNs, performance

### Mobile Development
- [ ] React Native / Expo, Flutter
- [ ] Native iOS (Swift/SwiftUI)
- [ ] Native Android (Kotlin/Jetpack Compose)
- [ ] App store publishing

### Game Development
- [ ] Game design fundamentals
- [ ] Unity (C#), Unreal (C++), Godot
- [ ] Phaser, Pygame, LÖVE
- [ ] 2D vs 3D, physics, animation
- [ ] Game audio & shipping a game

### Software Engineering & Architecture
- [ ] OOP & functional programming
- [ ] System design (scalability, caching, queues)
- [ ] Microservices vs monoliths
- [ ] Domain-Driven Design

### AI & Data
- [ ] Maths for ML (linear algebra, calculus, stats)
- [ ] Python for data (numpy, pandas)
- [ ] Classic ML (scikit-learn)
- [ ] Deep learning (PyTorch, TensorFlow)
- [ ] LLMs & prompt engineering
- [ ] Building AI agents & RAG apps
- [ ] Computer vision & speech
- [ ] MLOps

### DevOps & Cloud
- [ ] Linux fundamentals
- [ ] Docker & containers
- [ ] CI/CD pipelines
- [ ] AWS, GCP, Azure basics
- [ ] Kubernetes
- [ ] Monitoring & observability

### Cybersecurity
- [ ] Web security fundamentals (OWASP Top 10)
- [ ] Networking basics
- [ ] Ethical hacking & CTFs
- [ ] Cryptography basics

### Blockchain & Web3
- [ ] Blockchain fundamentals
- [ ] Solidity & smart contracts
- [ ] DeFi & NFTs basics

---

## Beyond Tech — other domains to add (Phase 2+)

### Academic (extending the current exam focus)
- [ ] University-level Maths, Physics, Chem, Bio
- [ ] Economics, Accounting, Government, History (deeper than WAEC level)

### Languages
- [ ] English mastery (writing, public speaking)
- [ ] French, Spanish, Mandarin, Arabic
- [ ] Pidgin, Yoruba, Igbo, Hausa lessons

### Business & Career
- [ ] Entrepreneurship, freelancing, remote work
- [ ] Personal finance & investing
- [ ] Marketing, copywriting, sales
- [ ] Productivity & time management
- [ ] CV writing, interviews, portfolio building

### Creative
- [ ] Graphic design (Figma, Canva)
- [ ] Video editing, photography
- [ ] Music production, drawing, writing

### Life skills
- [ ] Cooking, fitness, mental health
- [ ] Driving, basic DIY, financial literacy

---

## Quick fixes (migration leftovers)
- [ ] Onboarding flash on web: tabs render briefly before redirect
- [ ] Auth timeout is 4s — bump to ~8s with a clearer "offline" state
- [ ] Bake in a starter lesson pack so first-open with no data still shows content
- [ ] Silence harmless RN-Web warnings (`pointerEvents`, SSR `useLayoutEffect`)

## Improvements to existing exam features
- [ ] Weak-topic detection after each CBT
- [ ] Spaced repetition for wrong questions (1 / 3 / 7 days)
- [ ] Bookmark / "review later" on questions and lesson sections
- [ ] Daily 5 — one-tap warmup quiz
- [ ] Past-paper *explanations* (not just correct/incorrect)
- [ ] Data-saver mode
- [ ] Study buddies / class leaderboards

## AI features (the engine that makes "learn anything" actually possible)
- [ ] AI Tutor chat per lesson — grounded in the current lesson, supports Pidgin
- [ ] Unlimited practice question generator
- [ ] Step-by-step math solver
- [ ] Essay & comprehension grader
- [ ] Personalised study plan generator
- [ ] Voice tutor — read lessons aloud, accept voice questions
- [ ] **AI lesson generator** (admin tool) to scale content across thousands of topics
- [ ] **AI code reviewer** for the Tech Track — paste code, get feedback

## Interactive learning surfaces
- [ ] In-app code editor that runs Python / JS / etc. (remote sandbox)
- [ ] Interactive quizzes between lesson sections
- [ ] Project briefs with auto-grading where possible
- [ ] Embedded video lessons (YouTube initially, native later)
- [ ] Sandbox playgrounds per language

## Engagement & retention
- [ ] Streak freeze — one freeze per week
- [ ] XP / levels / badges
- [ ] Weekly challenges
- [ ] Live mock exam events (and live coding challenges for Tech Track)
- [ ] Pomodoro timer
- [ ] Quiet hours / focus mode

## Smart studying
- [ ] Topic skill tree per subject
- [ ] Mastery certificates (printable PDF)
- [ ] Cheat sheets / formula sheets per subject
- [ ] Auto-flashcards from lessons
- [ ] Glossary with hover/tap-to-define
- [ ] Mock exam history with score chart
- [ ] Time-of-day focus heatmap

## Localization & accessibility
- [ ] Pidgin English explanations toggle
- [ ] Yoruba / Igbo / Hausa lesson summaries
- [ ] Audio lessons via text-to-speech
- [ ] Dyslexia-friendly font
- [ ] Adjustable lesson font size
- [ ] OLED true-black mode
- [ ] Reduce-motion toggle

## Low-data / offline-first
- [ ] Offline subject packs
- [ ] SMS-based reminders
- [ ] Lite mode
- [ ] WhatsApp share

## Community & social
- [ ] Anonymous Q&A board per topic
- [ ] Report wrong answer / broken question
- [ ] Study group rooms
- [ ] Tutor connect (premium)
- [ ] Public profile with badges + streak
- [ ] Project showcase for Tech Track learners

## Career & life-after-exams
- [ ] Past-question vault per university cutoff
- [ ] JAMB score → university course recommender
- [ ] University cutoff tracker
- [ ] Exam day checklist
- [ ] Scholarship & internship feed
- [ ] Tech job board for Tech Track grads
- [ ] Parent / guardian view — weekly progress email

## Technical wins
- [ ] Search across all lessons (instant fuzzy search)
- [ ] Lazy-load lessons
- [ ] Cross-device sync indicator
- [ ] PDF export of any lesson

## Monetization
- [ ] Free tier: lesson notes + 5 CBT questions/day + basic streak + select Tech Track lessons
- [ ] Pro tier (₦1,000–2,000/month): AI tutor, unlimited CBT, offline packs, voice tutor, full Tech Track, certificates
- [ ] Referral rewards
- [ ] School / teacher plans
- [ ] Corporate / bootcamp plans for Tech Track

## Top 5 highest-impact / lowest-effort additions (still relevant)
1. Streak freeze
2. Search across lessons
3. Offline subject packs
4. University course recommender
5. Pidgin explanations

## Suggested build order (revised for the bigger vision)
1. **Migration leftovers** (1 session)
2. **AI Tutor on lessons** + **AI question generator** — the AI plumbing we'll reuse everywhere
3. **Content model upgrade** — Domain → Track → Course → Module → Lesson — so we can host any subject, not just exam topics
4. **Tech Track v1**: Intro to Programming, HTML+CSS, JavaScript, Python (read-only lessons + quizzes)
5. **In-app code editor** — unlocks every programming course
6. **AI lesson generator (admin)** — the only realistic way to scale to "every subject"
7. **Universal search + onboarding rework** ("What are you here for?")
8. **Weak-topic detection + Daily 5 + Streak freeze** (engagement)
9. Roll out remaining Tech Track sub-domains (Web Dev → Mobile → Game Dev → AI/ML → DevOps → Security)
10. Expand into Languages / Business / Creative / Life Skills domains
