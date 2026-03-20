# Nigeria Academy (Naija Academy)

## Overview
A static single-page application (SPA) for Nigerian exam prep (WAEC, NECO, JAMB) covering subjects like Mathematics, Physics, Chemistry, Biology, and English Language.

## Project Structure
- `index.html` — Main entry point / shell with sidebar navigation
- `app.js` — SPA routing and page initialization logic
- `styles.css` — Global styles
- `Pages/` — HTML partials loaded dynamically by app.js
- `cbt_questions.json` — CBT exam question bank
- `scripts/` — Utility/scraper scripts (Python)

## Tech Stack
- Pure HTML, CSS, JavaScript (no build step)
- Python `http.server` for local serving
- Static deployment

## Running Locally
```
python3 -m http.server 5000 --bind 0.0.0.0
```
Serves on port 5000.

## Deployment
Configured as a **static** deployment with `publicDir: "."`.
