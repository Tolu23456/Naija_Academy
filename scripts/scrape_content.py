#!/usr/bin/env python3
"""
NaijaAcademy Comprehensive Content Scraper
==========================================
Scrapes lesson notes AND past questions from ALL five target sites:

  LESSONS
  -------
  1. classnotes.ng      - structured lesson notes per topic
  2. classbasic.com     - secondary lesson notes (fallback)
  3. edudelight.com     - supplementary content (fallback)

  PAST QUESTIONS / CBT
  --------------------
  4. myschool.ng        - JAMB/WAEC/NECO past questions (primary)
  5. prepclass.com.ng   - additional practice questions (secondary)

Outputs
-------
  cbt_questions.json           — merged question bank (never overwrites, always appends)
  Pages/{subject}/{topic}.html — lesson HTML fragments for the app's lesson viewer
  assets/scraped/              — downloaded images referenced in lessons

Subjects covered (mirrors JAMB/WAEC/NECO syllabi)
--------------------------------------------------
  mathematics, english-language, physics, chemistry, biology,
  government, economics, literature-in-english, agricultural-science,
  commerce, geography, further-mathematics, financial-accounting, crk

Usage
-----
  python3 scripts/scrape_content.py                    # all subjects
  python3 scripts/scrape_content.py --subject maths   # one subject only
  python3 scripts/scrape_content.py --questions-only  # skip lessons
  python3 scripts/scrape_content.py --lessons-only    # skip questions
"""

import requests
from bs4 import BeautifulSoup
import json
import os
import re
import time
import pathlib
import hashlib
import urllib.parse
import argparse
import sys
from typing import Optional, List, Dict

# ── CLI args ──────────────────────────────────────────────────────────────────

parser = argparse.ArgumentParser(description="NaijaAcademy content scraper")
parser.add_argument("--subject", default="", help="Scrape only this subject key (e.g. maths, physics)")
parser.add_argument("--questions-only", action="store_true")
parser.add_argument("--lessons-only", action="store_true")
parser.add_argument("--max-questions", type=int, default=120, help="Max questions per subject per site")
parser.add_argument("--max-pages", type=int, default=5, help="Max listing pages to crawl per subject")
parser.add_argument("--delay", type=float, default=1.2, help="Seconds between requests (polite crawl)")
args = parser.parse_args()

DELAY = args.delay
TIMEOUT = 18
MAX_QUESTIONS_PER_SUBJECT = args.max_questions
MAX_PAGES = args.max_pages

# ── Paths ─────────────────────────────────────────────────────────────────────

BASE_DIR   = pathlib.Path(__file__).parent.parent
PAGES_DIR  = BASE_DIR / "Pages"
ASSETS_DIR = BASE_DIR / "assets" / "scraped"
CBT_FILE   = BASE_DIR / "cbt_questions.json"
ASSETS_DIR.mkdir(parents=True, exist_ok=True)

# ── HTTP session ──────────────────────────────────────────────────────────────

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
}

http = requests.Session()
http.headers.update(HEADERS)


def get(url: str, extra_headers: dict = {}) -> Optional[BeautifulSoup]:
    try:
        r = http.get(url, timeout=TIMEOUT, headers={**HEADERS, **extra_headers})
        r.raise_for_status()
        return BeautifulSoup(r.text, "lxml")
    except Exception as exc:
        print(f"    [WARN] GET {url} → {exc}")
        return None


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip()


def download_image(img_url: str, referer: str = "") -> Optional[str]:
    try:
        fname = hashlib.md5(img_url.encode()).hexdigest()[:12]
        ext   = os.path.splitext(urllib.parse.urlparse(img_url).path)[-1][:5] or ".jpg"
        dest  = ASSETS_DIR / f"{fname}{ext}"
        if dest.exists():
            return f"../assets/scraped/{fname}{ext}"
        h = {**HEADERS}
        if referer:
            h["Referer"] = referer
        r = http.get(img_url, timeout=TIMEOUT, headers=h, stream=True)
        r.raise_for_status()
        if "image" not in r.headers.get("Content-Type", ""):
            return None
        with open(dest, "wb") as fh:
            for chunk in r.iter_content(8192):
                fh.write(chunk)
        return f"../assets/scraped/{fname}{ext}"
    except Exception:
        return None

# ── Subject definitions ───────────────────────────────────────────────────────
# Each entry:  "app_key": { "label", "topics": [...], "myschool_slug", "classnotes_slug" }

ALL_SUBJECTS: Dict[str, Dict] = {
    "maths": {
        "label": "Mathematics",
        "myschool_slug":   "mathematics",
        "classnotes_slug": "mathematics",
        "prepclass_slug":  "mathematics",
        "topics": [
            "Number and Numeration", "Algebra", "Geometry", "Trigonometry",
            "Calculus", "Statistics and Probability", "Matrices and Determinants",
            "Coordinate Geometry", "Mensuration", "Vectors",
        ],
    },
    "english": {
        "label": "English Language",
        "myschool_slug":   "english-language",
        "classnotes_slug": "english-language",
        "prepclass_slug":  "english-language",
        "topics": [
            "Comprehension", "Summary", "Lexis and Structure",
            "Essay Writing", "Oral English", "Figures of Speech",
            "Concord and Agreement", "Parts of Speech",
        ],
    },
    "physics": {
        "label": "Physics",
        "myschool_slug":   "physics",
        "classnotes_slug": "physics",
        "prepclass_slug":  "physics",
        "topics": [
            "Kinematics", "Dynamics", "Projectile Motion",
            "Work Energy and Power", "Waves", "Light and Optics",
            "Electricity and Magnetism", "Heat and Temperature",
            "Atomic and Nuclear Physics", "Electromagnetic Induction",
        ],
    },
    "chemistry": {
        "label": "Chemistry",
        "myschool_slug":   "chemistry",
        "classnotes_slug": "chemistry",
        "prepclass_slug":  "chemistry",
        "topics": [
            "Atomic Structure", "Chemical Bonding", "Acids Bases and Salts",
            "Organic Chemistry", "Electrochemistry", "Stoichiometry",
            "Periodic Table", "Redox Reactions", "Gas Laws",
            "Rates of Reaction",
        ],
    },
    "biology": {
        "label": "Biology",
        "myschool_slug":   "biology",
        "classnotes_slug": "biology",
        "prepclass_slug":  "biology",
        "topics": [
            "Cell Biology", "Genetics and Heredity", "Evolution",
            "Ecology and Environment", "Human Physiology", "Plant Biology",
            "Microorganisms and Disease", "Reproduction", "Classification of Living Things",
            "Nutrition in Plants and Animals",
        ],
    },
    "government": {
        "label": "Government",
        "myschool_slug":   "government",
        "classnotes_slug": "government",
        "prepclass_slug":  "government",
        "topics": [
            "Basic Concepts in Government", "Types of Government",
            "The Nigerian Constitution", "The Legislature",
            "The Executive", "The Judiciary",
            "Federalism", "Political Parties and Electoral Systems",
            "Foreign Policy", "International Organisations",
        ],
    },
    "economics": {
        "label": "Economics",
        "myschool_slug":   "economics",
        "classnotes_slug": "economics",
        "prepclass_slug":  "economics",
        "topics": [
            "Demand and Supply", "Market Structures", "National Income",
            "Money and Banking", "International Trade",
            "Public Finance", "Economic Development", "Population",
            "Production and Cost", "Price Determination",
        ],
    },
    "literature": {
        "label": "Literature in English",
        "myschool_slug":   "literature-in-english",
        "classnotes_slug": "literature-in-english",
        "prepclass_slug":  "literature-in-english",
        "topics": [
            "Prose Fiction", "Poetry", "Drama",
            "Literary Devices and Figures of Speech", "Oral Literature",
            "African Literature", "Setting and Characterisation",
            "Theme and Plot Analysis",
        ],
    },
    "agric": {
        "label": "Agricultural Science",
        "myschool_slug":   "agricultural-science",
        "classnotes_slug": "agricultural-science",
        "prepclass_slug":  "agricultural-science",
        "topics": [
            "Crop Production", "Animal Husbandry", "Soil Science",
            "Farm Tools and Equipment", "Agricultural Economics",
            "Pest and Disease Control", "Irrigation and Drainage",
            "Forest and Fisheries", "Genetics in Agriculture",
        ],
    },
    "commerce": {
        "label": "Commerce",
        "myschool_slug":   "commerce",
        "classnotes_slug": "commerce",
        "prepclass_slug":  "commerce",
        "topics": [
            "Introduction to Commerce", "Retail and Wholesale Trade",
            "Banking", "Insurance", "Warehousing",
            "Transportation", "Communication", "Advertising",
            "Import and Export", "Business Documents",
        ],
    },
    "geography": {
        "label": "Geography",
        "myschool_slug":   "geography",
        "classnotes_slug": "geography",
        "prepclass_slug":  "geography",
        "topics": [
            "Map Reading and Interpretation", "The Earth",
            "Rocks and Minerals", "Weather and Climate",
            "Vegetation Zones", "Population Geography",
            "Settlement and Urbanisation", "Economic Geography",
            "Nigeria Physical Geography", "West Africa",
        ],
    },
    "further-maths": {
        "label": "Further Mathematics",
        "myschool_slug":   "further-mathematics",
        "classnotes_slug": "further-mathematics",
        "prepclass_slug":  "further-mathematics",
        "topics": [
            "Polynomials", "Binomial Theorem", "Complex Numbers",
            "Differentiation and Integration", "Matrices",
            "Probability Distributions", "Permutation and Combination",
            "Vectors in 3D", "Conic Sections",
        ],
    },
    "account": {
        "label": "Financial Accounting",
        "myschool_slug":   "financial-accounting",
        "classnotes_slug": "financial-accounting",
        "prepclass_slug":  "financial-accounting",
        "topics": [
            "Basic Accounting Concepts", "Double Entry Bookkeeping",
            "Trial Balance", "Final Accounts",
            "Cash Book", "Bank Reconciliation",
            "Depreciation", "Partnership Accounts",
            "Company Accounts", "Ratio Analysis",
        ],
    },
    "crk": {
        "label": "Christian Religious Studies",
        "myschool_slug":   "christian-religious-studies",
        "classnotes_slug": "christian-religious-studies",
        "prepclass_slug":  "christian-religious-studies",
        "topics": [
            "The Old Testament", "The New Testament",
            "The Life of Jesus", "The Early Church",
            "Christian Ethics", "The Holy Spirit",
            "Faith and Salvation", "Prayer and Worship",
        ],
    },
}

# Colour classes per subject for HTML lesson cards
SUBJECT_COLORS = {
    "maths":        ("text-accent",   "text-warning", "text-blue"),
    "english":      ("text-blue",     "text-accent",  "text-warning"),
    "physics":      ("text-orange",   "text-accent",  "text-warning"),
    "chemistry":    ("text-warning",  "text-accent",  "text-orange"),
    "biology":      ("text-success",  "text-accent",  "text-warning"),
    "government":   ("text-blue",     "text-warning", "text-accent"),
    "economics":    ("text-warning",  "text-blue",    "text-accent"),
    "literature":   ("text-accent",   "text-blue",    "text-warning"),
    "agric":        ("text-success",  "text-warning", "text-accent"),
    "commerce":     ("text-orange",   "text-blue",    "text-accent"),
    "geography":    ("text-blue",     "text-accent",  "text-warning"),
    "further-maths":("text-accent",   "text-orange",  "text-warning"),
    "account":      ("text-warning",  "text-accent",  "text-blue"),
    "crk":          ("text-blue",     "text-accent",  "text-warning"),
}

# ── HTML builder ──────────────────────────────────────────────────────────────

def build_lesson_html(subject_id: str, topic: str, sections: list) -> str:
    colors = SUBJECT_COLORS.get(subject_id, ("text-accent", "text-warning", "text-blue"))
    cards = ""
    for i, sec in enumerate(sections):
        color = colors[i % len(colors)]
        img = (
            f'<img src="{sec["image_url"]}" alt="{sec["heading"]}" '
            f'style="max-width:100%;border-radius:8px;margin-top:0.75rem;" />'
        ) if sec.get("image_url") else ""
        cards += f"""
  <div class="glass-card padding-2 mb-2">
    <h2 class="mb-1 {color}">{i+1}. {sec['heading']}</h2>
    {sec['body_html']}
    {img}
  </div>"""

    return f"""<!-- {topic} -->
<div class="lesson-container">
  <h1 class="text-accent mb-1" style="font-size:2.8rem;">{topic}</h1>
  <p class="mb-2 text-secondary" style="font-size:1.15rem;">
    Comprehensive notes for JAMB, WAEC &amp; NECO preparation.
  </p>
  {cards}
</div>
"""


def save_lesson(subject_id: str, topic: str, sections: list):
    subj_dir = PAGES_DIR / subject_id
    subj_dir.mkdir(parents=True, exist_ok=True)
    fname = slug(topic) + ".html"
    html  = build_lesson_html(subject_id, topic, sections)
    (subj_dir / fname).write_text(html, encoding="utf-8")
    print(f"    ✓ Saved Pages/{subject_id}/{fname}  ({len(sections)} sections)")

# ── Content parser ────────────────────────────────────────────────────────────

HEADING_FALLBACKS = [
    "Introduction", "Key Concepts", "Detailed Explanation",
    "Examples and Applications", "Important Notes", "Practice Points",
    "Summary", "Common Questions",
]


def parse_content_into_sections(
    content, article_url: str, topic: str, max_sections: int = 8
) -> list:
    sections: list = []
    current_heading = topic
    current_parts: List[str] = []
    current_img: Optional[str] = None
    found_headings = False

    for el in content.find_all(
        ["h2", "h3", "h4", "h5", "p", "ul", "ol", "img", "table", "blockquote"],
        recursive=True,
    ):
        tag = el.name
        if tag in ("h2", "h3", "h4", "h5"):
            found_headings = True
            if current_parts:
                sections.append({
                    "heading":   clean(current_heading),
                    "body_html": "\n".join(current_parts),
                    "image_url": current_img,
                })
                current_img = None
                current_parts = []
            current_heading = clean(el.get_text())

        elif tag == "img":
            src = el.get("src") or el.get("data-src") or el.get("data-lazy-src") or ""
            if src.startswith("http") and not current_img:
                path = download_image(src, article_url)
                if path:
                    current_img = path

        elif tag == "p":
            txt = clean(el.get_text())
            if len(txt) > 20 and not txt.lower().startswith("advertisement"):
                current_parts.append(f"<p>{txt}</p>")

        elif tag in ("ul", "ol"):
            items = [
                f"<li>{clean(li.get_text())}</li>"
                for li in el.find_all("li")
                if len(clean(li.get_text())) > 3
            ]
            if items:
                open_t = "<ul style='line-height:1.8;margin-top:0.5rem;'>" if tag == "ul" else "<ol style='line-height:1.8;margin-top:0.5rem;'>"
                current_parts.append(f"{open_t}{''.join(items)}</{tag}>")

        elif tag == "table":
            rows_html = ""
            for row in el.find_all("tr"):
                cells = row.find_all(["th", "td"])
                row_html = "".join(
                    f"<{c.name} style='padding:6px 10px;border:1px solid #333;'>"
                    f"{clean(c.get_text())}</{c.name}>"
                    for c in cells
                )
                rows_html += f"<tr>{row_html}</tr>"
            if rows_html:
                current_parts.append(
                    f"<div style='overflow-x:auto;margin-top:0.5rem;'>"
                    f"<table style='border-collapse:collapse;width:100%;font-size:0.9rem;'>"
                    f"{rows_html}</table></div>"
                )

        elif tag == "blockquote":
            txt = clean(el.get_text())
            if len(txt) > 20:
                current_parts.append(
                    f"<blockquote style='border-left:3px solid #00D26A;padding-left:1rem;"
                    f"font-style:italic;color:#8A92A3;margin:0.5rem 0;'>{txt}</blockquote>"
                )

    if current_parts:
        sections.append({
            "heading":   clean(current_heading),
            "body_html": "\n".join(current_parts),
            "image_url": current_img,
        })

    # If no headings found, chunk content into readable cards
    if not found_headings and len(sections) == 1 and len(sections[0]["body_html"].split("\n")) > 4:
        all_parts = sections[0]["body_html"].split("\n")
        chunk_size = 4
        chunked = []
        for i in range(0, len(all_parts), chunk_size):
            chunk = [p for p in all_parts[i: i + chunk_size] if p.strip()]
            if chunk:
                h = HEADING_FALLBACKS[len(chunked) % len(HEADING_FALLBACKS)]
                chunked.append({
                    "heading":   h,
                    "body_html": "\n".join(chunk),
                    "image_url": sections[0]["image_url"] if i == 0 else None,
                })
        if len(chunked) > 1:
            sections = chunked

    # Remove empty / very short sections
    sections = [s for s in sections if len(s["body_html"]) > 40]
    return sections[:max_sections]

# ══════════════════════════════════════════════════════════════════════════════
# LESSON SCRAPERS
# ══════════════════════════════════════════════════════════════════════════════

def _scrape_wp_site(base_domain: str, subject_slug: str, topic: str, site_name: str) -> list:
    """Generic WordPress-blog scraper — searches, follows first result, parses entry-content."""
    search_q   = urllib.parse.quote_plus(f"{topic} {subject_slug} notes")
    search_url = f"https://{base_domain}/?s={search_q}"
    print(f"  [{site_name}] Searching: {topic}")
    time.sleep(DELAY)

    soup = get(search_url)
    if not soup:
        return []

    link = None
    for a in soup.select(
        "h2.entry-title a, h3.entry-title a, .post-title a, "
        ".entry-header a, article h2 a, article h3 a, .search-results a"
    ):
        href = a.get("href", "")
        if href.startswith("http") and base_domain in href:
            link = href
            break

    if not link:
        return []

    time.sleep(DELAY)
    page = get(link)
    if not page:
        return []

    content = (
        page.find("div", class_="entry-content")
        or page.find("div", class_="post-content")
        or page.find("article")
        or page.find("main")
    )
    if not content:
        return []

    return parse_content_into_sections(content, link, topic)


def scrape_classnotes_topic(subject_slug: str, topic: str) -> list:
    return _scrape_wp_site("classnotes.ng", subject_slug, topic, "classnotes.ng")


def scrape_classbasic_topic(subject_slug: str, topic: str) -> list:
    return _scrape_wp_site("classbasic.com", subject_slug, topic, "classbasic.com")


def scrape_edudelight_topic(subject_slug: str, topic: str) -> list:
    return _scrape_wp_site("edudelight.com", subject_slug, topic, "edudelight.com")


def scrape_lessons_for_subject(subject_key: str, subject_cfg: dict):
    print(f"\n{'='*60}")
    print(f" LESSONS: {subject_cfg['label']}")
    print(f"{'='*60}")

    subject_slug = subject_cfg["classnotes_slug"]

    for topic in subject_cfg["topics"]:
        # Check if we already have this lesson saved
        lesson_file = PAGES_DIR / subject_key / (slug(topic) + ".html")
        if lesson_file.exists() and lesson_file.stat().st_size > 500:
            print(f"  [SKIP] {topic} — already scraped")
            continue

        print(f"\n  Topic: {topic}")

        sections: list = []

        # Primary: classnotes.ng
        sections = scrape_classnotes_topic(subject_slug, topic)

        # Secondary: classbasic.com
        if len(sections) < 2:
            extra = scrape_classbasic_topic(subject_slug, topic)
            sections = sections + extra

        # Tertiary: edudelight.com
        if len(sections) < 2:
            extra = scrape_edudelight_topic(subject_slug, topic)
            sections = sections + extra

        # Deduplicate sections by heading
        seen: set = set()
        unique = []
        for s in sections:
            h = s["heading"].lower()[:40]
            if h not in seen and len(s["body_html"]) > 30:
                seen.add(h)
                unique.append(s)

        if unique:
            save_lesson(subject_key, topic, unique)
        else:
            print(f"    [WARN] No content found for '{topic}' — skipping")

# ══════════════════════════════════════════════════════════════════════════════
# PAST QUESTION SCRAPERS
# ══════════════════════════════════════════════════════════════════════════════

LETTER_MAP = {"A": 0, "B": 1, "C": 2, "D": 3, "E": 4}

EXAM_TYPE_PATTERNS = {
    "JAMB":  re.compile(r"\bjamb\b|\butme\b",  re.I),
    "WAEC":  re.compile(r"\bwaec\b|\bwassce\b", re.I),
    "NECO":  re.compile(r"\bneco\b",            re.I),
}
YEAR_PATTERN = re.compile(r"\b(19[89]\d|20[012]\d)\b")


def detect_exam_type(text: str) -> str:
    for name, pat in EXAM_TYPE_PATTERNS.items():
        if pat.search(text):
            return name
    return "JAMB"


def detect_year(text: str) -> Optional[int]:
    m = YEAR_PATTERN.search(text)
    return int(m.group(1)) if m else None


# ── myschool.ng ───────────────────────────────────────────────────────────────

def scrape_myschool_questions(subject_key: str, subject_cfg: dict) -> list:
    subject_slug = subject_cfg["myschool_slug"]
    questions    = []
    seen_texts   = set()

    print(f"\n[myschool.ng] {subject_cfg['label']}")

    for page_num in range(1, MAX_PAGES + 1):
        if len(questions) >= MAX_QUESTIONS_PER_SUBJECT:
            break

        url = f"https://myschool.ng/classroom/{subject_slug}?page={page_num}"
        print(f"  Page {page_num}: {url}")
        time.sleep(DELAY)

        soup = get(url)
        if not soup:
            continue

        # Collect individual question links from the listing page
        q_links = []
        for a in soup.find_all("a", href=True):
            href = a["href"]
            # Individual question pages contain the subject slug in a longer path
            if (
                f"/classroom/{subject_slug}/" in href
                and "page=" not in href
                and href not in seen_texts
                and not href.endswith(f"/{subject_slug}")
            ):
                full = href if href.startswith("http") else f"https://myschool.ng{href}"
                q_links.append(full)
                seen_texts.add(href)

        # Also try direct question containers on the listing page itself
        for item in soup.select(".question-item, .quiz-item, .past-question"):
            try:
                q_el = item.find(class_=re.compile("question")) or item.find("p")
                opts_els = item.select(".option, li")
                if not q_el or len(opts_els) < 2:
                    continue
                q_text = clean(q_el.get_text())
                opts   = [re.sub(r"^[A-E][.)]\s*", "", clean(o.get_text())) for o in opts_els][:5]
                questions.append({
                    "question":    q_text,
                    "options":     opts,
                    "answerIndex": 0,
                    "exam_type":   detect_exam_type(item.get_text()),
                    "year":        detect_year(item.get_text()),
                    "subject":     subject_key,
                })
            except Exception:
                pass

        print(f"  Found {len(q_links)} question links on page {page_num}")

        for q_url in q_links:
            if len(questions) >= MAX_QUESTIONS_PER_SUBJECT:
                break
            time.sleep(DELAY * 0.7)
            try:
                q_soup = get(q_url)
                if not q_soup:
                    continue

                # Question text
                desc = (
                    q_soup.find("div", class_="question-desc")
                    or q_soup.find("div", class_="question-text")
                    or q_soup.find("div", class_="question")
                )
                if not desc:
                    continue
                q_text = clean(desc.get_text())
                if not q_text or len(q_text) < 10 or q_text in seen_texts:
                    continue
                seen_texts.add(q_text[:80])

                # Page metadata (exam type, year)
                page_text = q_soup.get_text()
                exam_type = detect_exam_type(page_text)
                year      = detect_year(page_text)

                # Options
                options = []
                for li in q_soup.select("ul.list-unstyled li, .options li, .option-item, .choice"):
                    txt = re.sub(r"^[A-E][.)]\s*", "", clean(li.get_text()))
                    if txt and len(txt) > 1:
                        options.append(txt)
                if len(options) < 2:
                    continue

                # Correct answer
                ans_el = (
                    q_soup.find("h5", class_="text-success")
                    or q_soup.find("div", class_=re.compile("answer|correct", re.I))
                )
                correct_idx = 0
                if ans_el:
                    m = re.search(r"Option\s*([A-E])|Answer[:\s]*([A-E])\b", ans_el.get_text(), re.I)
                    if m:
                        letter = (m.group(1) or m.group(2)).upper()
                        correct_idx = LETTER_MAP.get(letter, 0)

                questions.append({
                    "question":    q_text,
                    "options":     options[:5],
                    "answerIndex": correct_idx,
                    "exam_type":   exam_type,
                    "year":        year,
                    "subject":     subject_key,
                })
            except Exception as exc:
                print(f"    [WARN] {q_url} → {exc}")

    print(f"  ✓ {len(questions)} questions collected from myschool.ng")
    return questions


# ── prepclass.com.ng ──────────────────────────────────────────────────────────

def scrape_prepclass_questions(subject_key: str, subject_cfg: dict) -> list:
    slug_name = subject_cfg.get("prepclass_slug", subject_key)
    questions = []
    seen_texts: set = set()

    print(f"\n[prepclass.com.ng] {subject_cfg['label']}")

    urls_to_try = [
        f"https://prepclass.com.ng/past-questions/{slug_name}/",
        f"https://prepclass.com.ng/practice/{slug_name}/",
        f"https://prepclass.com.ng/questions/{slug_name}/",
    ]

    for url in urls_to_try:
        time.sleep(DELAY)
        soup = get(url)
        if not soup:
            continue

        # Collect links to question pages
        q_links = []
        for a in soup.select("a[href*='question'], a[href*='past-question'], a[href*='practice']"):
            href = a.get("href", "")
            if href.startswith("http") and "prepclass.com.ng" in href and href not in seen_texts:
                q_links.append(href)
                seen_texts.add(href)

        # Also try inline question containers
        for item in soup.select(
            ".question-item, .quiz-question, article.question, .question-block, .q-item"
        ):
            try:
                q_el = (
                    item.find(class_=re.compile("question-text|q-text|question-body"))
                    or item.find("p")
                )
                if not q_el:
                    continue
                q_text = clean(q_el.get_text())
                if len(q_text) < 10 or q_text[:60] in seen_texts:
                    continue
                seen_texts.add(q_text[:60])

                opts = []
                for opt in item.select(".option, .choice, .answer-option, li"):
                    t = re.sub(r"^[A-E][.)]\s*", "", clean(opt.get_text()))
                    if t and len(t) > 1:
                        opts.append(t)
                if len(opts) < 2:
                    continue

                questions.append({
                    "question":    q_text,
                    "options":     opts[:4],
                    "answerIndex": 0,
                    "exam_type":   detect_exam_type(item.get_text()),
                    "year":        detect_year(item.get_text()),
                    "subject":     subject_key,
                })
            except Exception:
                pass

        for q_url in q_links[:30]:
            if len(questions) >= 30:
                break
            time.sleep(DELAY * 0.8)
            try:
                q_soup = get(q_url)
                if not q_soup:
                    continue
                for item in q_soup.select(".question-item, .quiz-question, .question-block"):
                    q_el = item.find("p") or item.find(class_=re.compile("question"))
                    if not q_el:
                        continue
                    q_text = clean(q_el.get_text())
                    if len(q_text) < 10 or q_text[:60] in seen_texts:
                        continue
                    seen_texts.add(q_text[:60])
                    opts = [
                        re.sub(r"^[A-E][.)]\s*", "", clean(o.get_text()))
                        for o in item.select(".option, li")
                        if len(clean(o.get_text())) > 1
                    ]
                    if len(opts) < 2:
                        continue
                    questions.append({
                        "question":    q_text,
                        "options":     opts[:4],
                        "answerIndex": 0,
                        "exam_type":   detect_exam_type(q_soup.get_text()),
                        "year":        detect_year(q_soup.get_text()),
                        "subject":     subject_key,
                    })
            except Exception:
                pass

        if questions:
            break  # got results from at least one URL

    print(f"  ✓ {len(questions)} questions collected from prepclass.com.ng")
    return questions


# ── Question merging & deduplication ──────────────────────────────────────────

def merge_questions(existing: list, new_batch: list) -> list:
    existing_keys = {q["question"][:80].lower() for q in existing}
    added = 0
    for q in new_batch:
        key = q["question"][:80].lower()
        if key not in existing_keys:
            existing_keys.add(key)
            existing.append(q)
            added += 1
    print(f"  → Merged +{added} new questions (total {len(existing)})")
    return existing

# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

def main():
    print("NaijaAcademy Content Scraper — Comprehensive Edition")
    print("=" * 60)
    print(f"Sites: myschool.ng | classnotes.ng | classbasic.com | prepclass.com.ng | edudelight.com")
    print(f"Max questions/subject: {MAX_QUESTIONS_PER_SUBJECT}")
    print(f"Max listing pages: {MAX_PAGES}")
    print()

    # Resolve subjects to scrape
    if args.subject:
        if args.subject not in ALL_SUBJECTS:
            print(f"[ERROR] Unknown subject '{args.subject}'. Options: {', '.join(ALL_SUBJECTS)}")
            sys.exit(1)
        subjects_to_run = {args.subject: ALL_SUBJECTS[args.subject]}
    else:
        subjects_to_run = ALL_SUBJECTS

    # Load existing question bank
    cbt_data: dict = {}
    if CBT_FILE.exists():
        try:
            cbt_data = json.loads(CBT_FILE.read_text(encoding="utf-8"))
            total_q  = sum(len(v) for v in cbt_data.values())
            print(f"Loaded existing cbt_questions.json — {total_q} questions across {len(cbt_data)} subjects\n")
        except Exception as exc:
            print(f"[WARN] Could not load existing cbt_questions.json: {exc}")

    # ── Phase 1: Lesson notes ────────────────────────────────────────────────
    if not args.questions_only:
        print("\n\n[PHASE 1] Scraping lesson notes...")
        for key, cfg in subjects_to_run.items():
            scrape_lessons_for_subject(key, cfg)

    # ── Phase 2: Past questions ──────────────────────────────────────────────
    if not args.lessons_only:
        print("\n\n[PHASE 2] Scraping past exam questions...")
        for key, cfg in subjects_to_run.items():
            existing = cbt_data.get(key, [])

            new_myschool  = scrape_myschool_questions(key, cfg)
            new_prepclass = scrape_prepclass_questions(key, cfg)

            all_new = new_myschool + new_prepclass
            if all_new:
                cbt_data[key] = merge_questions(existing, all_new)
            else:
                cbt_data[key] = existing
                print(f"  [WARN] No new questions found for {cfg['label']}")

        # Save updated question bank
        CBT_FILE.write_text(
            json.dumps(cbt_data, indent=2, ensure_ascii=False), encoding="utf-8"
        )
        total_q = sum(len(v) for v in cbt_data.values())
        print(f"\n✓ Saved {total_q} questions across {len(cbt_data)} subjects → cbt_questions.json")

    # ── Summary ──────────────────────────────────────────────────────────────
    print("\n\n== SUMMARY ==")
    for key, cfg in subjects_to_run.items():
        lesson_count = len(list((PAGES_DIR / key).glob("*.html"))) if (PAGES_DIR / key).exists() else 0
        q_count      = len(cbt_data.get(key, []))
        print(f"  {cfg['label']:<28} lessons: {lesson_count:<4} questions: {q_count}")

    print("\nDone! Run `python3 scripts/build_lessons_data.py` to compile lessons into the app.")


if __name__ == "__main__":
    main()
