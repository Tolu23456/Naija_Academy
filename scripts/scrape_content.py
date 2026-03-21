#!/usr/bin/env python3
"""
NaijaAcademy Comprehensive Content Scraper
==========================================
Discovers and scrapes ALL available subjects from five target websites.
Outputs structured MARKDOWN files (not HTML) so content is portable,
human-readable, and renderable by any markdown viewer.

Sites
-----
  LESSONS  : classnotes.ng | classbasic.com | edudelight.com
  QUESTIONS: myschool.ng   | prepclass.com.ng

Outputs
-------
  content/{subject}/{topic}.md    — lesson notes in Markdown
  content/{subject}/questions.md  — past questions in Markdown (one per subject)
  assets/scraped/                 — downloaded images, PDFs and other resources
  cbt_questions.json              — structured question bank (for the app)

Usage
-----
  python3 scripts/scrape_content.py                       # all subjects
  python3 scripts/scrape_content.py --subject maths       # one subject
  python3 scripts/scrape_content.py --questions-only
  python3 scripts/scrape_content.py --lessons-only
  python3 scripts/scrape_content.py --discover            # discover subjects from sites
  python3 scripts/scrape_content.py --max-questions 200
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
from typing import Optional, List, Dict, Set

# ── CLI ───────────────────────────────────────────────────────────────────────

parser = argparse.ArgumentParser(description="NaijaAcademy content scraper")
parser.add_argument("--subject",        default="",    help="Scrape only this subject key")
parser.add_argument("--questions-only", action="store_true")
parser.add_argument("--lessons-only",   action="store_true")
parser.add_argument("--discover",       action="store_true", help="Auto-discover subjects from websites first")
parser.add_argument("--max-questions",  type=int, default=120)
parser.add_argument("--max-pages",      type=int, default=5)
parser.add_argument("--delay",          type=float, default=1.2)
args = parser.parse_args()

DELAY               = args.delay
TIMEOUT             = 18
MAX_Q_PER_SUBJECT   = args.max_questions
MAX_PAGES           = args.max_pages

# ── Paths ─────────────────────────────────────────────────────────────────────

BASE_DIR    = pathlib.Path(__file__).parent.parent
CONTENT_DIR = BASE_DIR / "content"          # markdown lives here
ASSETS_DIR  = BASE_DIR / "assets" / "scraped"
CBT_FILE    = BASE_DIR / "cbt_questions.json"

CONTENT_DIR.mkdir(parents=True, exist_ok=True)
ASSETS_DIR.mkdir(parents=True, exist_ok=True)

# ── HTTP ──────────────────────────────────────────────────────────────────────

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

http = requests.Session()
http.headers.update(HEADERS)


def get(url: str) -> Optional[BeautifulSoup]:
    try:
        r = http.get(url, timeout=TIMEOUT)
        r.raise_for_status()
        return BeautifulSoup(r.text, "lxml")
    except Exception as exc:
        print(f"    [WARN] {url} → {exc}")
        return None


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip()

# ── Resource downloader ───────────────────────────────────────────────────────

RESOURCE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".pdf", ".mp4", ".mp3"}


def download_resource(url: str, referer: str = "") -> Optional[str]:
    """Download any resource (image, PDF, etc.) and return its saved path."""
    try:
        parsed = urllib.parse.urlparse(url)
        ext    = os.path.splitext(parsed.path)[-1].lower()[:10]
        if ext not in RESOURCE_EXTS and ext:
            return None  # skip scripts, CSS, etc.
        if not ext:
            ext = ".bin"

        fname = hashlib.md5(url.encode()).hexdigest()[:12] + ext
        dest  = ASSETS_DIR / fname

        if dest.exists():
            return f"../assets/scraped/{fname}"

        h = {**HEADERS}
        if referer:
            h["Referer"] = referer

        r = http.get(url, timeout=TIMEOUT, headers=h, stream=True)
        r.raise_for_status()

        ctype = r.headers.get("Content-Type", "")
        # Only save actual content files (not HTML pages)
        if "text/html" in ctype:
            return None

        with open(dest, "wb") as fh:
            for chunk in r.iter_content(8192):
                fh.write(chunk)

        return f"../assets/scraped/{fname}"
    except Exception:
        return None

# ══════════════════════════════════════════════════════════════════════════════
# SUBJECT DEFINITIONS
# ══════════════════════════════════════════════════════════════════════════════
# This list covers ALL JAMB/WAEC/NECO/Common Entrance subjects.
# The scraper can also DISCOVER additional subjects from the websites.

ALL_SUBJECTS: Dict[str, Dict] = {
    "maths": {
        "label": "Mathematics",
        "myschool_slug":   "mathematics",
        "classnotes_slug": "mathematics",
        "prepclass_slug":  "mathematics",
        "topics": [
            "Number and Numeration", "Algebra", "Geometry", "Trigonometry",
            "Calculus", "Statistics and Probability", "Matrices and Determinants",
            "Coordinate Geometry", "Mensuration", "Vectors", "Indices and Logarithms",
            "Sequences and Series", "Sets and Logic",
        ],
    },
    "english": {
        "label": "English Language",
        "myschool_slug":   "english-language",
        "classnotes_slug": "english-language",
        "prepclass_slug":  "english-language",
        "topics": [
            "Comprehension", "Summary Writing", "Lexis and Structure",
            "Essay Writing", "Oral English", "Figures of Speech",
            "Concord and Agreement", "Parts of Speech", "Tenses",
            "Direct and Indirect Speech", "Sentence Structure",
        ],
    },
    "physics": {
        "label": "Physics",
        "myschool_slug":   "physics",
        "classnotes_slug": "physics",
        "prepclass_slug":  "physics",
        "topics": [
            "Kinematics", "Dynamics", "Projectile Motion",
            "Work Energy and Power", "Waves and Sound", "Light and Optics",
            "Electricity and Magnetism", "Heat and Temperature",
            "Atomic and Nuclear Physics", "Electromagnetic Induction",
            "Simple Harmonic Motion", "Gravitational Field", "Gas Laws",
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
            "Rates of Reaction", "Equilibrium", "Hydrocarbons",
            "Metals and Non-Metals",
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
            "Nutrition in Plants and Animals", "Excretion", "Respiration",
            "Transport in Plants and Animals",
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
            "Colonialism and Nationalism", "Democracy",
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
            "Labour and Capital", "Agricultural Economics",
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
            "Theme and Plot Analysis", "Narrative Technique",
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
            "Farm Management",
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
            "Channels of Distribution",
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
            "Nigeria Physical Geography", "West Africa Geography",
            "Hydrology",
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
            "Vectors in 3D", "Conic Sections", "Differential Equations",
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
            "Single Entry and Incomplete Records",
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
            "Christianity in Nigeria",
        ],
    },
    "irk": {
        "label": "Islamic Studies",
        "myschool_slug":   "islamic-studies",
        "classnotes_slug": "islamic-studies",
        "prepclass_slug":  "islamic-studies",
        "topics": [
            "Tauhid", "Quran Studies", "Hadith",
            "Islamic Ethics and Morality", "Pillars of Islam",
            "Islamic History", "Islamic Law", "Prayer and Worship in Islam",
        ],
    },
    "civic": {
        "label": "Civic Education",
        "myschool_slug":   "civic-education",
        "classnotes_slug": "civic-education",
        "prepclass_slug":  "civic-education",
        "topics": [
            "Democracy and Governance", "Human Rights",
            "Rule of Law", "Citizenship and Identity",
            "Patriotism and Nationalism", "National Values",
            "INEC and Elections", "Corruption and Anti-Corruption",
        ],
    },
    "technical-drawing": {
        "label": "Technical Drawing",
        "myschool_slug":   "technical-drawing",
        "classnotes_slug": "technical-drawing",
        "prepclass_slug":  "technical-drawing",
        "topics": [
            "Instruments and Their Uses", "Geometric Constructions",
            "Projection Drawing", "Sectional Views",
            "Dimensioning", "Isometric Drawing",
        ],
    },
}

# ── Subject discovery ─────────────────────────────────────────────────────────

DISCOVERY_SITES = [
    ("myschool.ng",      "https://myschool.ng/classroom/", ".nav-link, a[href*='/classroom/']"),
    ("classnotes.ng",    "https://classnotes.ng/",         "a[href*='classnotes.ng'], .menu-item a, nav a"),
    ("classbasic.com",   "https://classbasic.com/",        "a[href*='classbasic.com'], nav a, .menu a"),
]

KNOWN_MYSCHOOL_SUBJECTS = {
    "mathematics", "english-language", "physics", "chemistry", "biology",
    "government", "economics", "literature-in-english", "agricultural-science",
    "commerce", "geography", "further-mathematics", "financial-accounting",
    "christian-religious-studies", "islamic-studies", "civic-education",
    "technical-drawing", "yoruba", "hausa", "igbo", "french",
    "history", "home-economics", "food-and-nutrition", "data-processing",
}


def discover_subjects_from_myschool() -> Dict[str, str]:
    """Auto-discover all subjects listed on myschool.ng."""
    discovered: Dict[str, str] = {}
    print("[DISCOVER] Scanning myschool.ng for all subjects...")
    time.sleep(DELAY)

    soup = get("https://myschool.ng/classroom/")
    if not soup:
        return discovered

    for a in soup.select("a[href*='/classroom/']"):
        href = a.get("href", "")
        m = re.search(r"/classroom/([^/?#]+)", href)
        if not m:
            continue
        subj_slug = m.group(1)
        if subj_slug in ("", "index"):
            continue
        label = clean(a.get_text()) or subj_slug.replace("-", " ").title()
        if len(label) < 2 or len(label) > 60:
            continue
        discovered[subj_slug] = label
        print(f"  Found: {subj_slug} → {label}")

    return discovered


def merge_discovered_subjects(discovered: Dict[str, str]):
    """Add newly discovered subjects to ALL_SUBJECTS if not already present."""
    for site_slug, label in discovered.items():
        # Find if we already have this subject
        found = False
        for key, cfg in ALL_SUBJECTS.items():
            if cfg["myschool_slug"] == site_slug:
                found = True
                break
        if not found:
            key = site_slug.replace("-", "_").replace("__", "_")
            ALL_SUBJECTS[key] = {
                "label":          label,
                "myschool_slug":  site_slug,
                "classnotes_slug": site_slug,
                "prepclass_slug": site_slug,
                "topics": [],  # topics will be inferred from page headings
            }
            print(f"  [DISCOVER] Added new subject: {key} ({label})")

# ══════════════════════════════════════════════════════════════════════════════
# MARKDOWN BUILDERS
# ══════════════════════════════════════════════════════════════════════════════

def sections_to_markdown(topic: str, sections: list) -> str:
    """Convert structured sections into clean Markdown."""
    lines = [f"# {topic}", ""]
    lines.append("*Comprehensive notes for JAMB, WAEC & NECO preparation.*")
    lines.append("")

    for sec in sections:
        heading = sec.get("heading", "").strip()
        body_html = sec.get("body_html", "")
        img = sec.get("image_url")

        if heading and heading.lower() != topic.lower():
            lines.append(f"## {heading}")
            lines.append("")

        # Strip HTML tags to get clean text, preserve some structure
        body_md = html_to_markdown(body_html)
        if body_md:
            lines.append(body_md)
            lines.append("")

        if img:
            alt = heading or topic
            lines.append(f"![{alt}]({img})")
            lines.append("")

    return "\n".join(lines)


def html_to_markdown(html: str) -> str:
    """Convert simple HTML fragments to Markdown."""
    if not html:
        return ""

    # Parse with BeautifulSoup for proper handling
    soup = BeautifulSoup(html, "lxml")
    parts = []

    for el in soup.find_all(True):
        tag  = el.name
        text = clean(el.get_text())

        if tag == "p" and text:
            parts.append(text)
        elif tag in ("h2", "h3"):
            parts.append(f"### {text}")
        elif tag in ("h4", "h5"):
            parts.append(f"#### {text}")
        elif tag == "ul":
            for li in el.find_all("li", recursive=False):
                parts.append(f"- {clean(li.get_text())}")
        elif tag == "ol":
            for i, li in enumerate(el.find_all("li", recursive=False), 1):
                parts.append(f"{i}. {clean(li.get_text())}")
        elif tag == "table":
            rows = []
            for row in el.find_all("tr"):
                cells = [clean(c.get_text()) for c in row.find_all(["th", "td"])]
                rows.append("| " + " | ".join(cells) + " |")
                if row.find("th"):
                    rows.append("| " + " | ".join(["---"] * len(cells)) + " |")
            parts.extend(rows)
        elif tag == "blockquote" and text:
            parts.append(f"> {text}")
        elif tag == "code" and text:
            parts.append(f"`{text}`")
        elif tag == "strong" and text:
            pass  # handled by parent p
        elif tag == "em" and text:
            pass  # handled by parent p

    return "\n\n".join(p for p in parts if p.strip())


def question_to_markdown(q: dict, index: int) -> str:
    """Format a single question as Markdown."""
    lines = [f"### Q{index}. {q['question']}", ""]

    options = q.get("options", [])
    letters = "ABCDE"
    for i, opt in enumerate(options):
        prefix = f"**{letters[i]}.**" if i == q.get("answerIndex", -1) else f"{letters[i]}."
        lines.append(f"{prefix} {opt}")

    answer_letter = letters[q.get("answerIndex", 0)]
    exam_type = q.get("exam_type", "")
    year      = q.get("year", "")
    meta = " — ".join(filter(None, [exam_type, str(year) if year else ""]))

    lines.append("")
    lines.append(f"> **Answer:** {answer_letter}  |  {meta}" if meta else f"> **Answer:** {answer_letter}")
    lines.append("")
    return "\n".join(lines)


def save_lesson_markdown(subject_key: str, topic: str, sections: list):
    """Save lesson content as a .md file."""
    subj_dir = CONTENT_DIR / subject_key
    subj_dir.mkdir(parents=True, exist_ok=True)
    fname = slug(topic) + ".md"
    md    = sections_to_markdown(topic, sections)
    (subj_dir / fname).write_text(md, encoding="utf-8")
    print(f"    ✓ Saved content/{subject_key}/{fname}  ({len(sections)} sections)")


def save_questions_markdown(subject_key: str, questions: list):
    """Save past questions as a .md file."""
    if not questions:
        return
    subj_dir = CONTENT_DIR / subject_key
    subj_dir.mkdir(parents=True, exist_ok=True)

    label = ALL_SUBJECTS.get(subject_key, {}).get("label", subject_key)
    lines = [
        f"# {label} — Past Questions",
        "",
        f"*{len(questions)} questions from JAMB, WAEC, and NECO past examinations.*",
        "",
    ]
    for i, q in enumerate(questions, 1):
        lines.append(question_to_markdown(q, i))

    (subj_dir / "questions.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"    ✓ Saved content/{subject_key}/questions.md  ({len(questions)} questions)")

# ══════════════════════════════════════════════════════════════════════════════
# CONTENT PARSER
# ══════════════════════════════════════════════════════════════════════════════

HEADING_FALLBACKS = [
    "Introduction", "Key Concepts", "Detailed Explanation",
    "Examples and Applications", "Important Notes",
    "Practice Points", "Summary",
]


def parse_content_into_sections(content, article_url: str, topic: str) -> list:
    sections: list = []
    current_heading = topic
    current_parts: List[str] = []
    current_img: Optional[str] = None
    found_headings = False

    for el in content.find_all(
        ["h2", "h3", "h4", "h5", "p", "ul", "ol", "img", "table", "blockquote", "a"],
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
                current_img   = None
                current_parts = []
            current_heading = clean(el.get_text())

        elif tag == "img":
            src = (
                el.get("src") or el.get("data-src") or
                el.get("data-lazy-src") or el.get("data-original") or ""
            )
            if src.startswith("http") and not current_img:
                path = download_resource(src, article_url)
                if path:
                    current_img = path

        elif tag == "a":
            # Download linked resources (PDFs, etc.)
            href = el.get("href", "")
            if href.startswith("http"):
                ext = os.path.splitext(urllib.parse.urlparse(href).path)[-1].lower()
                if ext in (".pdf", ".docx", ".pptx"):
                    download_resource(href, article_url)

        elif tag == "p":
            txt = clean(el.get_text())
            if len(txt) > 20 and not txt.lower().startswith(("advertisement", "cookie", "subscribe")):
                current_parts.append(f"<p>{txt}</p>")

        elif tag in ("ul", "ol"):
            items = [
                f"<li>{clean(li.get_text())}</li>"
                for li in el.find_all("li")
                if len(clean(li.get_text())) > 3
            ]
            if items:
                open_t = f"<{tag} style='line-height:1.8;margin-top:0.5rem;'>"
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
                    f"<div style='overflow-x:auto;'>"
                    f"<table style='border-collapse:collapse;width:100%;'>"
                    f"{rows_html}</table></div>"
                )

        elif tag == "blockquote":
            txt = clean(el.get_text())
            if len(txt) > 20:
                current_parts.append(
                    f"<blockquote style='border-left:3px solid #00D26A;"
                    f"padding-left:1rem;font-style:italic;color:#8A92A3;'>{txt}</blockquote>"
                )

    if current_parts:
        sections.append({
            "heading":   clean(current_heading),
            "body_html": "\n".join(current_parts),
            "image_url": current_img,
        })

    # Chunk single large section into readable cards
    if not found_headings and len(sections) == 1:
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

    sections = [s for s in sections if len(s["body_html"]) > 40]
    return sections[:10]

# ══════════════════════════════════════════════════════════════════════════════
# LESSON SCRAPERS
# ══════════════════════════════════════════════════════════════════════════════

def _scrape_wp_site(base_domain: str, subject_slug: str, topic: str, site_name: str) -> list:
    search_q   = urllib.parse.quote_plus(f"{topic} {subject_slug} notes")
    search_url = f"https://{base_domain}/?s={search_q}"
    print(f"  [{site_name}] {topic}")
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

    # Download all page resources (images, PDFs)
    for img in page.find_all("img"):
        src = img.get("src") or img.get("data-src") or ""
        if src.startswith("http"):
            download_resource(src, link)

    for a in page.find_all("a", href=True):
        href = a["href"]
        if href.startswith("http"):
            ext = os.path.splitext(urllib.parse.urlparse(href).path)[-1].lower()
            if ext in (".pdf", ".docx", ".pptx"):
                print(f"    [RESOURCE] Downloading {ext}: {href}")
                download_resource(href, link)

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
    return _scrape_wp_site("classnotes.ng",  subject_slug, topic, "classnotes.ng")


def scrape_classbasic_topic(subject_slug: str, topic: str) -> list:
    return _scrape_wp_site("classbasic.com", subject_slug, topic, "classbasic.com")


def scrape_edudelight_topic(subject_slug: str, topic: str) -> list:
    return _scrape_wp_site("edudelight.com", subject_slug, topic, "edudelight.com")


def scrape_lessons_for_subject(subject_key: str, subject_cfg: dict):
    print(f"\n{'='*60}")
    print(f" LESSONS: {subject_cfg['label']}")
    print(f"{'='*60}")

    subject_slug = subject_cfg["classnotes_slug"]

    for topic in subject_cfg.get("topics", []):
        md_file = CONTENT_DIR / subject_key / (slug(topic) + ".md")
        if md_file.exists() and md_file.stat().st_size > 200:
            print(f"  [SKIP] {topic} — already scraped")
            continue

        sections: list = []
        sections = scrape_classnotes_topic(subject_slug, topic)

        if len(sections) < 2:
            extra = scrape_classbasic_topic(subject_slug, topic)
            sections = sections + extra

        if len(sections) < 2:
            extra = scrape_edudelight_topic(subject_slug, topic)
            sections = sections + extra

        # Deduplicate
        seen: Set[str] = set()
        unique = []
        for s in sections:
            h = s["heading"].lower()[:40]
            if h not in seen and len(s["body_html"]) > 30:
                seen.add(h)
                unique.append(s)

        if unique:
            save_lesson_markdown(subject_key, topic, unique)
        else:
            print(f"    [WARN] No content for '{topic}' — skipping")

# ══════════════════════════════════════════════════════════════════════════════
# QUESTION SCRAPERS
# ══════════════════════════════════════════════════════════════════════════════

LETTER_MAP   = {"A": 0, "B": 1, "C": 2, "D": 3, "E": 4}
EXAM_PATTERNS = {
    "JAMB": re.compile(r"\bjamb\b|\butme\b", re.I),
    "WAEC": re.compile(r"\bwaec\b|\bwassce\b", re.I),
    "NECO": re.compile(r"\bneco\b", re.I),
}
YEAR_PAT = re.compile(r"\b(19[89]\d|20[012]\d)\b")


def detect_exam_type(text: str) -> str:
    for name, pat in EXAM_PATTERNS.items():
        if pat.search(text):
            return name
    return "JAMB"


def detect_year(text: str) -> Optional[int]:
    m = YEAR_PAT.search(text)
    return int(m.group(1)) if m else None


def scrape_myschool_questions(subject_key: str, subject_cfg: dict) -> list:
    subject_slug = subject_cfg["myschool_slug"]
    questions:  list = []
    seen_texts: Set[str] = set()

    print(f"\n[myschool.ng] {subject_cfg['label']}")

    for page_num in range(1, MAX_PAGES + 1):
        if len(questions) >= MAX_Q_PER_SUBJECT:
            break

        url = f"https://myschool.ng/classroom/{subject_slug}?page={page_num}"
        print(f"  Page {page_num}: {url}")
        time.sleep(DELAY)

        soup = get(url)
        if not soup:
            continue

        q_links = []
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if (
                f"/classroom/{subject_slug}/" in href
                and "page=" not in href
                and href not in seen_texts
                and not href.endswith(f"/{subject_slug}")
            ):
                full = href if href.startswith("http") else f"https://myschool.ng{href}"
                q_links.append(full)
                seen_texts.add(href)

        for q_url in q_links:
            if len(questions) >= MAX_Q_PER_SUBJECT:
                break
            time.sleep(DELAY * 0.7)
            try:
                q_soup = get(q_url)
                if not q_soup:
                    continue

                desc = (
                    q_soup.find("div", class_="question-desc")
                    or q_soup.find("div", class_="question-text")
                    or q_soup.find("div", class_="question")
                )
                if not desc:
                    continue
                q_text = clean(desc.get_text())
                if not q_text or len(q_text) < 10 or q_text[:60] in seen_texts:
                    continue
                seen_texts.add(q_text[:60])

                page_text = q_soup.get_text()
                exam_type = detect_exam_type(page_text)
                year      = detect_year(page_text)

                options = []
                for li in q_soup.select("ul.list-unstyled li, .options li, .option-item, .choice"):
                    txt = re.sub(r"^[A-E][.)]\s*", "", clean(li.get_text()))
                    if txt and len(txt) > 1:
                        options.append(txt)
                if len(options) < 2:
                    continue

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

    print(f"  ✓ {len(questions)} from myschool.ng")
    return questions


def scrape_prepclass_questions(subject_key: str, subject_cfg: dict) -> list:
    slug_name   = subject_cfg.get("prepclass_slug", subject_key)
    questions:  list = []
    seen_texts: Set[str] = set()

    print(f"\n[prepclass.com.ng] {subject_cfg['label']}")

    for url in [
        f"https://prepclass.com.ng/past-questions/{slug_name}/",
        f"https://prepclass.com.ng/practice/{slug_name}/",
    ]:
        time.sleep(DELAY)
        soup = get(url)
        if not soup:
            continue

        for item in soup.select(
            ".question-item, .quiz-question, article.question, .question-block, .q-item"
        ):
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

            opts = [
                re.sub(r"^[A-E][.)]\s*", "", clean(o.get_text()))
                for o in item.select(".option, .choice, .answer-option, li")
                if len(clean(o.get_text())) > 1
            ]
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

        if questions:
            break

    print(f"  ✓ {len(questions)} from prepclass.com.ng")
    return questions


def merge_questions(existing: list, new_batch: list) -> list:
    existing_keys = {q["question"][:80].lower() for q in existing}
    added = 0
    for q in new_batch:
        key = q["question"][:80].lower()
        if key not in existing_keys:
            existing_keys.add(key)
            existing.append(q)
            added += 1
    print(f"  → +{added} new questions (total {len(existing)})")
    return existing

# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

def main():
    print("NaijaAcademy Content Scraper — All Subjects, Markdown Output")
    print("=" * 65)
    print(f"Sites: myschool.ng | classnotes.ng | classbasic.com | prepclass.com.ng | edudelight.com")
    print(f"Output: content/{{subject}}/{{topic}}.md  +  cbt_questions.json")
    print()

    # Discover additional subjects from websites
    if args.discover:
        discovered = discover_subjects_from_myschool()
        merge_discovered_subjects(discovered)

    # Resolve which subjects to run
    if args.subject:
        if args.subject not in ALL_SUBJECTS:
            print(f"[ERROR] Unknown subject '{args.subject}'. Available: {', '.join(ALL_SUBJECTS)}")
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
            print(f"Loaded existing question bank — {total_q} questions in {len(cbt_data)} subjects\n")
        except Exception as exc:
            print(f"[WARN] Could not load existing cbt_questions.json: {exc}")

    # ── Phase 1: Lesson notes ────────────────────────────────────────────────
    if not args.questions_only:
        print("\n[PHASE 1] Scraping lesson notes → Markdown files...")
        for key, cfg in subjects_to_run.items():
            scrape_lessons_for_subject(key, cfg)

    # ── Phase 2: Past questions ──────────────────────────────────────────────
    if not args.lessons_only:
        print("\n\n[PHASE 2] Scraping past exam questions...")
        for key, cfg in subjects_to_run.items():
            existing      = cbt_data.get(key, [])
            new_myschool  = scrape_myschool_questions(key, cfg)
            new_prepclass = scrape_prepclass_questions(key, cfg)
            all_new       = new_myschool + new_prepclass

            if all_new:
                cbt_data[key] = merge_questions(existing, all_new)
            else:
                cbt_data[key] = existing
                print(f"  [WARN] No new questions for {cfg['label']}")

            # Also save questions as markdown
            save_questions_markdown(key, cbt_data[key])

        CBT_FILE.write_text(
            json.dumps(cbt_data, indent=2, ensure_ascii=False), encoding="utf-8"
        )
        total_q = sum(len(v) for v in cbt_data.values())
        print(f"\n✓ Saved {total_q} questions → cbt_questions.json")

    # ── Summary ──────────────────────────────────────────────────────────────
    print("\n\n== SUMMARY ==")
    for key, cfg in subjects_to_run.items():
        md_count = len(list((CONTENT_DIR / key).glob("*.md"))) if (CONTENT_DIR / key).exists() else 0
        q_count  = len(cbt_data.get(key, []))
        print(f"  {cfg['label']:<32} notes: {md_count:<4}  questions: {q_count}")

    print("\nDone! Run `python3 scripts/build_lessons_data.py` to compile into the app.")


if __name__ == "__main__":
    main()
