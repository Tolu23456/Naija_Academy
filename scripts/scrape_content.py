#!/usr/bin/env python3
"""
NaijaAcademy Content Scraper
Scrapes lesson notes and CBT questions from:
  - myschool.ng       (JAMB/WAEC past questions)
  - classnotes.ng     (lesson notes by topic)
  - classbasic.com    (lesson notes)
  - prepclass.com.ng  (practice questions)
  - edudelight.com    (educational notes)

Outputs:
  - cbt_questions.json          (question bank)
  - Pages/{subject}/{topic}.html (lesson pages)
  - assets/scraped/             (downloaded images)
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
from typing import Optional

# ── Config ────────────────────────────────────────────────────────────────────

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}
DELAY = 1.2          # seconds between requests (polite crawl)
TIMEOUT = 15         # request timeout
MAX_PAGES = 3        # pages of questions to scrape per subject on myschool.ng
MAX_QUESTIONS_PER_SUBJECT = 80

BASE_DIR = pathlib.Path(__file__).parent.parent
PAGES_DIR = BASE_DIR / "Pages"
ASSETS_DIR = BASE_DIR / "assets" / "scraped"
CBT_FILE = BASE_DIR / "cbt_questions.json"

ASSETS_DIR.mkdir(parents=True, exist_ok=True)

# Subject → topic mapping (mirrors the app's subjectData)
SUBJECT_TOPICS = {
    "biology": [
        "Cell Biology", "Genetics", "Ecology", "Human Physiology", "Plant Anatomy"
    ],
    "chemistry": [
        "Acids & Bases", "Organic Chemistry", "Stoichiometry",
        "Electrochemistry", "Periodic Table",
    ],
    "maths": [
        "Algebra", "Geometry", "Statistics", "Trigonometry", "Calculus", "Matrices"
    ],
    "physics": [
        "Kinematics", "Dynamics", "Projectile Motion",
        "Waves & Optics", "Electricity", "Magnetism", "Thermodynamics",
    ],
    "english": [
        "Comprehension", "Essay Writing", "Lexis & Structure", "Oral English"
    ],
}

# Maps app subject id → myschool.ng URL slug
MYSCHOOL_SUBJECTS = {
    "maths": "mathematics",
    "english": "english-language",
    "chemistry": "chemistry",
    "physics": "physics",
    "biology": "biology",
}

# Maps app subject id → classnotes.ng URL slug
CLASSNOTES_SUBJECTS = {
    "maths": "mathematics",
    "english": "english-language",
    "chemistry": "chemistry",
    "physics": "physics",
    "biology": "biology",
}

# Theme colour classes per subject
SUBJECT_COLORS = {
    "maths": ("text-accent", "text-warning", "text-blue"),
    "physics": ("text-orange", "text-accent", "text-warning"),
    "chemistry": ("text-warning", "text-accent", "text-orange"),
    "biology": ("text-success", "text-accent", "text-warning"),
    "english": ("text-blue", "text-accent", "text-warning"),
}

# ── Helpers ───────────────────────────────────────────────────────────────────

session = requests.Session()
session.headers.update(HEADERS)


def get(url: str) -> Optional[BeautifulSoup]:
    try:
        r = session.get(url, timeout=TIMEOUT)
        r.raise_for_status()
        return BeautifulSoup(r.text, "lxml")
    except Exception as exc:
        print(f"    [WARN] GET {url} → {exc}")
        return None


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def download_image(img_url: str, referer: str = "") -> Optional[str]:
    """Download an image and return its relative asset path."""
    try:
        fname = hashlib.md5(img_url.encode()).hexdigest()[:12]
        ext = os.path.splitext(urllib.parse.urlparse(img_url).path)[-1] or ".jpg"
        ext = ext[:5]  # guard against weird extensions
        dest = ASSETS_DIR / f"{fname}{ext}"
        if dest.exists():
            return f"../assets/scraped/{fname}{ext}"
        headers = {**HEADERS}
        if referer:
            headers["Referer"] = referer
        r = session.get(img_url, timeout=TIMEOUT, headers=headers, stream=True)
        r.raise_for_status()
        ctype = r.headers.get("Content-Type", "")
        if "image" not in ctype:
            return None
        with open(dest, "wb") as fh:
            for chunk in r.iter_content(8192):
                fh.write(chunk)
        return f"../assets/scraped/{fname}{ext}"
    except Exception:
        return None

# ── HTML builder ──────────────────────────────────────────────────────────────

def build_lesson_html(subject_id: str, topic: str, sections: list) -> str:
    """
    Wrap scraped content sections into the app's lesson HTML format.
    sections = [{"heading": str, "body_html": str, "image_url": str|None}]
    """
    colors = SUBJECT_COLORS.get(subject_id, ("text-accent", "text-warning", "text-blue"))
    color_cycle = [colors[i % len(colors)] for i in range(len(sections))]

    cards_html = ""
    for i, sec in enumerate(sections):
        color_class = color_cycle[i]
        img_tag = ""
        if sec.get("image_url"):
            img_tag = (
                f'<img src="{sec["image_url"]}" alt="{sec["heading"]}" '
                f'style="max-width:100%;border-radius:8px;margin-top:0.75rem;" />'
            )
        cards_html += f"""
    <div class="glass-card padding-2 mb-2">
        <h2 class="mb-1 {color_class}">{i+1}. {sec['heading']}</h2>
        {sec['body_html']}
        {img_tag}
    </div>"""

    return f"""<!-- {topic} -->
<div class="lesson-container">
    <h1 class="text-accent mb-1" style="font-size:2.8rem;">{topic}</h1>
    <p class="mb-2 text-secondary" style="font-size:1.15rem;">
        Comprehensive notes for JAMB, WAEC &amp; NECO preparation.
    </p>
    {cards_html}
</div>
"""


def save_lesson(subject_id: str, topic: str, sections: list):
    subj_dir = PAGES_DIR / subject_id
    subj_dir.mkdir(parents=True, exist_ok=True)
    fname = slug(topic) + ".html"
    html = build_lesson_html(subject_id, topic, sections)
    (subj_dir / fname).write_text(html, encoding="utf-8")
    print(f"    Saved lesson: Pages/{subject_id}/{fname}  ({len(sections)} sections)")

# ── classnotes.ng scraper ─────────────────────────────────────────────────────

def parse_content_into_sections(content, article_url: str, topic: str) -> list:
    """
    Parse a BeautifulSoup content element into structured sections.
    Splits on H2/H3/H4 headings; if none are found, groups paragraphs into
    chunks of ~4 paragraphs each so content isn't one giant blob.
    """
    sections = []
    current_heading = topic
    current_paragraphs = []
    current_img = None
    found_headings = False

    for el in content.find_all(["h2", "h3", "h4", "p", "ul", "ol", "img", "table"], recursive=True):
        tag = el.name
        if tag in ("h2", "h3", "h4"):
            found_headings = True
            if current_paragraphs:
                sections.append({"heading": clean(current_heading), "body_html": "\n".join(current_paragraphs), "image_url": current_img})
                current_img = None
            current_heading = clean(el.get_text())
            current_paragraphs = []

        elif tag == "img":
            src = el.get("src") or el.get("data-src") or ""
            if src and src.startswith("http") and not current_img:
                path = download_image(src, article_url)
                if path:
                    current_img = path

        elif tag == "p":
            txt = clean(el.get_text())
            if len(txt) > 20:
                current_paragraphs.append(f"<p>{txt}</p>")

        elif tag in ("ul", "ol"):
            items = [f"<li>{clean(li.get_text())}</li>" for li in el.find_all("li") if clean(li.get_text())]
            if items:
                open_tag = "<ul style='line-height:1.8;margin-top:0.5rem;'>" if tag == "ul" else "<ol style='line-height:1.8;margin-top:0.5rem;'>"
                current_paragraphs.append(f"{open_tag}{''.join(items)}</{tag}>")

        elif tag == "table":
            rows_html = ""
            for row in el.find_all("tr"):
                cells = row.find_all(["th", "td"])
                row_html = "".join(
                    f"<{'th' if c.name=='th' else 'td'} style='padding:6px 10px;border:1px solid #333;'>{clean(c.get_text())}</{c.name}>"
                    for c in cells
                )
                rows_html += f"<tr>{row_html}</tr>"
            if rows_html:
                current_paragraphs.append(
                    f"<div style='overflow-x:auto;margin-top:0.5rem;'>"
                    f"<table style='border-collapse:collapse;width:100%;font-size:0.9rem;'>{rows_html}</table></div>"
                )

    if current_paragraphs:
        sections.append({"heading": clean(current_heading), "body_html": "\n".join(current_paragraphs), "image_url": current_img})

    # If no headings were found and we have one big section, chunk it
    if not found_headings and len(sections) == 1:
        all_paras = sections[0]["body_html"].split("\n")
        chunk_size = 4
        chunked = []
        heading_variants = [
            f"Introduction to {topic}",
            f"Key Concepts",
            f"Detailed Explanation",
            f"Examples & Applications",
            f"Summary & Review",
        ]
        for i in range(0, len(all_paras), chunk_size):
            chunk = all_paras[i : i + chunk_size]
            if not any(c.strip() for c in chunk):
                continue
            h = heading_variants[len(chunked) % len(heading_variants)]
            chunked.append({"heading": h, "body_html": "\n".join(chunk), "image_url": sections[0]["image_url"] if i == 0 else None})
        if len(chunked) > 1:
            return chunked[:8]

    return sections[:8]


def scrape_classnotes_topic(subject_slug: str, topic: str) -> list:
    """Search classnotes.ng for a topic and scrape the first result."""
    search_q = urllib.parse.quote_plus(f"{topic} {subject_slug}")
    search_url = f"https://classnotes.ng/?s={search_q}"
    print(f"  [classnotes.ng] Searching: {topic}")
    time.sleep(DELAY)

    soup = get(search_url)
    if not soup:
        return []

    # Find the first article link in search results
    article_link = None
    for a in soup.select("h2.entry-title a, h3.entry-title a, .post-title a, h2 a, h3 a"):
        href = a.get("href", "")
        if href.startswith("http") and "classnotes.ng" in href:
            article_link = href
            break

    if not article_link:
        article_link = f"https://classnotes.ng/{subject_slug}/{slug(topic)}-notes/"

    time.sleep(DELAY)
    page = get(article_link)
    if not page:
        return []

    content = (
        page.find("div", class_="entry-content")
        or page.find("article")
        or page.find("main")
    )
    if not content:
        return []

    return parse_content_into_sections(content, article_link, topic)


# ── classbasic.com scraper ────────────────────────────────────────────────────

def scrape_classbasic_topic(subject_slug: str, topic: str) -> list:
    """Search classbasic.com for lesson notes on a topic."""
    search_q = urllib.parse.quote_plus(f"{topic} {subject_slug} notes")
    url = f"https://classbasic.com/?s={search_q}"
    print(f"  [classbasic.com] Searching: {topic}")
    time.sleep(DELAY)

    soup = get(url)
    if not soup:
        return []

    link = None
    for a in soup.select("h2 a, h3 a, .entry-title a"):
        href = a.get("href", "")
        if href.startswith("http") and "classbasic.com" in href:
            link = href
            break

    if not link:
        return []

    time.sleep(DELAY)
    page = get(link)
    if not page:
        return []

    content = page.find("div", class_="entry-content") or page.find("article")
    if not content:
        return []

    return parse_content_into_sections(content, link, topic)


# ── edudelight.com scraper ────────────────────────────────────────────────────

def scrape_edudelight_topic(subject_slug: str, topic: str) -> list:
    """Search edudelight.com for content on a topic."""
    search_q = urllib.parse.quote_plus(f"{topic} {subject_slug}")
    url = f"https://edudelight.com/?s={search_q}"
    print(f"  [edudelight.com] Searching: {topic}")
    time.sleep(DELAY)

    soup = get(url)
    if not soup:
        return []

    link = None
    for a in soup.select("h2 a, h3 a, .entry-title a, article a"):
        href = a.get("href", "")
        if href.startswith("http") and "edudelight.com" in href:
            link = href
            break

    if not link:
        return []

    time.sleep(DELAY)
    page = get(link)
    if not page:
        return []

    content = page.find("div", class_="entry-content") or page.find("article") or page.find("main")
    if not content:
        return []

    return parse_content_into_sections(content, link, topic)


# ── myschool.ng CBT scraper ───────────────────────────────────────────────────

def scrape_myschool_questions(subject_id: str) -> list:
    """Scrape JAMB/WAEC past questions from myschool.ng."""
    subject_slug = MYSCHOOL_SUBJECTS.get(subject_id, subject_id)
    questions = []
    seen = set()

    print(f"\n[myschool.ng] CBT: {subject_id} ({subject_slug})")
    for page_num in range(1, MAX_PAGES + 1):
        if len(questions) >= MAX_QUESTIONS_PER_SUBJECT:
            break

        url = f"https://myschool.ng/classroom/{subject_slug}?page={page_num}"
        print(f"  Fetching page {page_num}: {url}")
        time.sleep(DELAY)

        soup = get(url)
        if not soup:
            continue

        # Question links
        q_links = []
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if f"/classroom/{subject_slug}/" in href and href not in seen:
                if not href.endswith(f"/{subject_slug}") and "page=" not in href:
                    full = href if href.startswith("http") else f"https://myschool.ng{href}"
                    q_links.append(full)
                    seen.add(href)

        print(f"  Found {len(q_links)} question links")

        for q_url in q_links:
            if len(questions) >= MAX_QUESTIONS_PER_SUBJECT:
                break
            time.sleep(DELAY * 0.6)
            try:
                q_soup = get(q_url)
                if not q_soup:
                    continue

                # Question text
                desc = q_soup.find("div", class_="question-desc") or q_soup.find("div", class_="question")
                if not desc:
                    continue
                q_text = clean(desc.get_text())
                if not q_text or len(q_text) < 10:
                    continue

                # Detect exam source (JAMB, WAEC, NECO)
                source_tag = q_soup.find("span", class_=re.compile("badge|label|exam")) or q_soup.find("small")
                source_text = clean(source_tag.get_text()) if source_tag else ""
                if source_text:
                    q_text = f"{source_text}\n\n{q_text}"
                else:
                    q_text = f"{subject_slug.replace('-', ' ').title()}\n\n{q_text}"

                # Options
                options = []
                for li in q_soup.select("ul.list-unstyled li, .options li, .option-item"):
                    txt = clean(li.get_text())
                    # Strip leading "A. " prefix if present
                    txt = re.sub(r"^[A-E][.)]\s*", "", txt)
                    if txt:
                        options.append(txt)

                if len(options) < 2:
                    continue

                # Correct answer
                ans_el = (
                    q_soup.find("h5", class_="text-success")
                    or q_soup.find("div", class_=re.compile("answer|correct"))
                    or q_soup.find(string=re.compile(r"correct answer", re.I))
                )
                correct_letter = "A"
                if ans_el:
                    txt = ans_el if isinstance(ans_el, str) else ans_el.get_text()
                    m = re.search(r"\bOption\s*([A-E])\b|\b([A-E])\b", txt, re.I)
                    if m:
                        correct_letter = (m.group(1) or m.group(2)).upper()
                letter_map = {"A": 0, "B": 1, "C": 2, "D": 3, "E": 4}
                correct_idx = letter_map.get(correct_letter, 0)

                questions.append({
                    "question": q_text,
                    "options": options[:5],
                    "answerIndex": correct_idx,
                })
            except Exception as exc:
                print(f"    [WARN] {q_url} → {exc}")

    print(f"  Collected {len(questions)} questions for {subject_id}")
    return questions


# ── prepclass.com.ng CBT scraper ──────────────────────────────────────────────

def scrape_prepclass_questions(subject_id: str) -> list:
    """Scrape practice questions from prepclass.com.ng."""
    subject_map = {
        "maths": "mathematics",
        "english": "english",
        "chemistry": "chemistry",
        "physics": "physics",
        "biology": "biology",
    }
    slug_name = subject_map.get(subject_id, subject_id)
    questions = []

    print(f"\n[prepclass.com.ng] CBT: {subject_id}")
    url = f"https://prepclass.com.ng/past-questions/{slug_name}/"
    time.sleep(DELAY)
    soup = get(url)
    if not soup:
        return []

    for item in soup.select(".question-item, .quiz-question, article.question"):
        if len(questions) >= 20:
            break
        try:
            q_el = item.find(class_=re.compile("question-text|q-text")) or item.find("p")
            if not q_el:
                continue
            q_text = clean(q_el.get_text())
            if len(q_text) < 10:
                continue

            opts = []
            for opt in item.select(".option, .choice, li"):
                t = clean(opt.get_text())
                t = re.sub(r"^[A-E][.)]\s*", "", t)
                if t:
                    opts.append(t)

            if len(opts) < 2:
                continue

            questions.append({"question": q_text, "options": opts[:4], "answerIndex": 0})
        except Exception:
            pass

    print(f"  Collected {len(questions)} from prepclass")
    return questions


# ── Lesson scraper orchestrator ───────────────────────────────────────────────

def scrape_lessons_for_subject(subject_id: str):
    topics = SUBJECT_TOPICS.get(subject_id, [])
    subject_slug = CLASSNOTES_SUBJECTS.get(subject_id, subject_id)

    print(f"\n{'='*60}")
    print(f" LESSONS: {subject_id.upper()}")
    print(f"{'='*60}")

    for topic in topics:
        print(f"\n  Topic: {topic}")

        # Try classnotes.ng first, fall back to classbasic.com, then edudelight.com
        sections = scrape_classnotes_topic(subject_slug, topic)

        if len(sections) < 2:
            sections_b = scrape_classbasic_topic(subject_slug, topic)
            sections = sections + sections_b

        if len(sections) < 2:
            sections_e = scrape_edudelight_topic(subject_slug, topic)
            sections = sections + sections_e

        # Remove duplicate headings
        seen_heads = set()
        unique_sections = []
        for s in sections:
            h = s["heading"].lower()
            if h not in seen_heads and len(s["body_html"]) > 30:
                seen_heads.add(h)
                unique_sections.append(s)

        if unique_sections:
            save_lesson(subject_id, topic, unique_sections)
        else:
            print(f"    [WARN] No content found for '{topic}' — skipping")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("NaijaAcademy Content Scraper")
    print("=" * 60)

    # Load existing questions so we don't lose them
    cbt_data: dict = {}
    if CBT_FILE.exists():
        try:
            cbt_data = json.loads(CBT_FILE.read_text())
            print(f"Loaded existing cbt_questions.json ({sum(len(v) for v in cbt_data.values())} questions)")
        except Exception:
            pass

    subjects = list(SUBJECT_TOPICS.keys())

    # ── 1. Scrape lesson notes ──────────────────────────────────────────────
    print("\n\n[PHASE 1] Scraping lesson notes...")
    for subj in subjects:
        scrape_lessons_for_subject(subj)

    # ── 2. Scrape CBT questions ─────────────────────────────────────────────
    print("\n\n[PHASE 2] Scraping CBT questions...")
    for subj in subjects:
        new_qs = scrape_myschool_questions(subj)
        extra_qs = scrape_prepclass_questions(subj)
        all_new = new_qs + extra_qs

        if all_new:
            existing = cbt_data.get(subj, [])
            # Deduplicate by question text
            existing_texts = {q["question"][:80] for q in existing}
            deduped = [q for q in all_new if q["question"][:80] not in existing_texts]
            cbt_data[subj] = existing + deduped
            print(f"  {subj}: +{len(deduped)} new questions (total {len(cbt_data[subj])})")

    # Save updated question bank
    CBT_FILE.write_text(json.dumps(cbt_data, indent=2, ensure_ascii=False), encoding="utf-8")
    total_q = sum(len(v) for v in cbt_data.values())
    print(f"\n✓ Saved {total_q} questions to cbt_questions.json")

    # Summary
    print("\n\n== SUMMARY ==")
    for subj, topics in SUBJECT_TOPICS.items():
        subj_dir = PAGES_DIR / subj
        lesson_count = len(list(subj_dir.glob("*.html"))) if subj_dir.exists() else 0
        q_count = len(cbt_data.get(subj, []))
        print(f"  {subj:12s}  {lesson_count}/{len(topics)} lessons   {q_count} questions")

    img_count = len(list(ASSETS_DIR.glob("*")))
    print(f"\n  Downloaded {img_count} images → assets/scraped/")
    print("\nDone!")


if __name__ == "__main__":
    main()
