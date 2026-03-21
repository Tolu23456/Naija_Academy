#!/usr/bin/env python3
"""
Build lib/lessonsData.ts from scraped Markdown files.

Reads content/{subject}/{topic}.md, converts Markdown → HTML,
then writes a TypeScript module the React Native app can import directly.

Run after scrape_content.py, or any time you add/edit Markdown files.
"""

import pathlib
import json
import re
import sys

BASE_DIR     = pathlib.Path(__file__).parent.parent
CONTENT_DIR  = BASE_DIR / "content"
PAGES_DIR    = BASE_DIR / "Pages"   # legacy HTML files (still supported)
OUT_FILE     = BASE_DIR / "lib" / "lessonsData.ts"

# Try to use the `markdown` Python library for MD→HTML conversion.
# Install via:  pip install markdown
try:
    import markdown as md_lib
    HAS_MD_LIB = True
except ImportError:
    HAS_MD_LIB = False
    print("[WARN] `markdown` library not installed. "
          "Run: pip install markdown  (falling back to basic converter)")


# ── Subject/folder mapping ───────────────────────────────────────────────────
# content/ subfolders are keyed by the same IDs used in the app.
# Legacy Pages/ folders are also scanned for backwards compatibility.

FOLDER_TO_SUBJECT = {
    # New (markdown-based, in content/)
    "maths":            "maths",
    "english":          "english",
    "physics":          "physics",
    "chemistry":        "chemistry",
    "biology":          "biology",
    "government":       "government",
    "economics":        "economics",
    "literature":       "literature",
    "agric":            "agric",
    "commerce":         "commerce",
    "geography":        "geography",
    "further-maths":    "further-maths",
    "account":          "account",
    "crk":              "crk",
    "irk":              "irk",
    "civic":            "civic",
    "technical-drawing":"technical-drawing",
}


def stem_to_title(stem: str) -> str:
    """Convert file stem to display title, e.g. 'cell-biology' → 'Cell Biology'."""
    return stem.replace("-", " ").title()


# ── Markdown → HTML converter ─────────────────────────────────────────────────

LESSON_MD_EXTENSIONS = [
    "tables", "fenced_code", "attr_list", "def_list",
    "footnotes", "md_in_html",
]


def markdown_to_html(md_text: str) -> str:
    """Convert Markdown to styled HTML ready for the lesson viewer."""
    if HAS_MD_LIB:
        raw_html = md_lib.markdown(
            md_text,
            extensions=LESSON_MD_EXTENSIONS,
            output_format="html",
        )
    else:
        raw_html = basic_md_to_html(md_text)

    # Wrap in the lesson-container div so LessonHTML styles apply
    return f'<div class="lesson-container">\n{raw_html}\n</div>'


def basic_md_to_html(md_text: str) -> str:
    """Minimal fallback markdown→html converter (no external deps)."""
    lines  = md_text.split("\n")
    output = []
    in_ul  = False
    in_ol  = False

    def close_lists():
        nonlocal in_ul, in_ol
        if in_ul:
            output.append("</ul>")
            in_ul = False
        if in_ol:
            output.append("</ol>")
            in_ol = False

    def inline(text: str) -> str:
        text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
        text = re.sub(r"\*(.+?)\*",     r"<em>\1</em>",         text)
        text = re.sub(r"`(.+?)`",       r"<code>\1</code>",      text)
        text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', text)
        return text

    for line in lines:
        if re.match(r"^#{1}\s", line):
            close_lists()
            output.append(f"<h1>{inline(line[2:].strip())}</h1>")
        elif re.match(r"^#{2}\s", line):
            close_lists()
            t = line[3:].strip()
            output.append(f'<div class="glass-card padding-2 mb-2"><h2 class="mb-1 text-accent">{inline(t)}</h2>')
        elif re.match(r"^#{3}\s", line):
            close_lists()
            output.append(f"<h3>{inline(line[4:].strip())}</h3>")
        elif re.match(r"^#{4}\s", line):
            close_lists()
            output.append(f"<h4>{inline(line[5:].strip())}</h4>")
        elif re.match(r"^- ", line):
            if in_ol:
                output.append("</ol>")
                in_ol = False
            if not in_ul:
                output.append("<ul style='line-height:1.8;margin-top:0.5rem;'>")
                in_ul = True
            output.append(f"<li>{inline(line[2:].strip())}</li>")
        elif re.match(r"^\d+\. ", line):
            if in_ul:
                output.append("</ul>")
                in_ul = False
            if not in_ol:
                output.append("<ol style='line-height:1.8;margin-top:0.5rem;'>")
                in_ol = True
            output.append(f"<li>{inline(re.sub(r'^\d+\.\s', '', line).strip())}</li>")
        elif re.match(r"^> ", line):
            close_lists()
            output.append(
                f"<blockquote style='border-left:3px solid #00D26A;padding-left:1rem;"
                f"font-style:italic;color:#8A92A3;margin:0.5rem 0;'>"
                f"{inline(line[2:].strip())}</blockquote>"
            )
        elif re.match(r"^!\[", line):
            close_lists()
            m = re.match(r"!\[([^\]]*)\]\(([^)]+)\)", line)
            if m:
                output.append(
                    f'<img src="{m.group(2)}" alt="{m.group(1)}" '
                    f'style="max-width:100%;border-radius:8px;margin-top:0.75rem;" />'
                )
        elif line.strip() == "":
            close_lists()
            # Close any open glass-card div (opened on h2)
            if any("glass-card" in o and not o.startswith("</") for o in output[-5:]):
                pass  # will be closed naturally
        else:
            close_lists()
            if line.strip():
                output.append(f"<p>{inline(line.strip())}</p>")

    close_lists()
    return "\n".join(output)


# ── Legacy HTML loader ────────────────────────────────────────────────────────

def load_legacy_html(pages_dir: pathlib.Path, folder: str, subj_id: str) -> dict:
    """Load lessons from legacy Pages/{folder}/*.html files."""
    subj_dir = pages_dir / folder
    if not subj_dir.exists():
        return {}

    lessons = {}
    for html_file in sorted(subj_dir.glob("*.html")):
        if html_file.stem in ("index", subj_id, folder):
            continue
        topic_key   = html_file.stem
        topic_title = stem_to_title(html_file.stem)
        html_content = html_file.read_text(encoding="utf-8")
        lessons[topic_key] = {"title": topic_title, "html": html_content}

    return lessons


# ── Main build ────────────────────────────────────────────────────────────────

def build():
    data: dict = {}   # { subjectId: { topicSlug: { title, html } } }

    print(f"Using {'python-markdown' if HAS_MD_LIB else 'built-in fallback'} for MD→HTML conversion")
    print()

    # Scan content/ for markdown files (new format)
    for folder, subj_id in FOLDER_TO_SUBJECT.items():
        md_dir = CONTENT_DIR / folder
        if md_dir.exists():
            lessons = {}
            for md_file in sorted(md_dir.glob("*.md")):
                if md_file.stem == "questions":
                    continue  # skip past-question files
                topic_key   = md_file.stem
                topic_title = stem_to_title(md_file.stem)
                md_text     = md_file.read_text(encoding="utf-8")
                html        = markdown_to_html(md_text)
                lessons[topic_key] = {"title": topic_title, "html": html}

            if lessons:
                data.setdefault(subj_id, {}).update(lessons)
                print(f"  [content/] {subj_id}: {len(lessons)} lessons from markdown")

        # Also scan legacy Pages/ folder
        legacy = load_legacy_html(PAGES_DIR, folder, subj_id)
        if legacy:
            before = len(data.get(subj_id, {}))
            data.setdefault(subj_id, {}).update(legacy)
            added = len(data[subj_id]) - before
            if added:
                print(f"  [Pages/]   {subj_id}: +{added} lessons from legacy HTML")

    # Auto-discover any extra subject folders in content/
    if CONTENT_DIR.exists():
        for subdir in sorted(CONTENT_DIR.iterdir()):
            if not subdir.is_dir():
                continue
            subj_id = subdir.name
            if subj_id in data:
                continue  # already processed
            lessons = {}
            for md_file in sorted(subdir.glob("*.md")):
                if md_file.stem == "questions":
                    continue
                topic_key   = md_file.stem
                topic_title = stem_to_title(md_file.stem)
                md_text     = md_file.read_text(encoding="utf-8")
                lessons[topic_key] = {"title": topic_title, "html": markdown_to_html(md_text)}
            if lessons:
                data[subj_id] = lessons
                print(f"  [auto]     {subj_id}: {len(lessons)} lessons (discovered)")

    # Write TypeScript module
    ts_lines = [
        "// AUTO-GENERATED by scripts/build_lessons_data.py",
        "// Source: content/{subject}/{topic}.md  (Markdown → HTML)",
        "// Do not edit manually — re-run the script after scraping.",
        "",
        "export type LessonContent = {",
        "  title: string;",
        "  html:  string;",
        "};",
        "",
        "export type LessonsMap = Record<string, Record<string, LessonContent>>;",
        "",
        "const lessonsData: LessonsMap = " + json.dumps(data, indent=2, ensure_ascii=False) + ";",
        "",
        "export default lessonsData;",
        "",
        "/** Return lesson HTML for a subject + topic slug, or null if not found. */",
        "export function getLesson(subjectId: string, topicSlug: string): LessonContent | null {",
        "  return lessonsData[subjectId]?.[topicSlug] ?? null;",
        "}",
        "",
        "/** Return all topic slugs available for a subject. */",
        "export function getTopicSlugs(subjectId: string): string[] {",
        "  return Object.keys(lessonsData[subjectId] ?? {});",
        "}",
        "",
        "/** Return all subject IDs that have at least one lesson. */",
        "export function getSubjectsWithContent(): string[] {",
        "  return Object.keys(lessonsData).filter(k => Object.keys(lessonsData[k]).length > 0);",
        "}",
    ]

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text("\n".join(ts_lines), encoding="utf-8")

    total = sum(len(v) for v in data.values())
    print(f"\n✓ Written {total} lessons across {len(data)} subjects → {OUT_FILE.relative_to(BASE_DIR)}")


if __name__ == "__main__":
    print("Building lessonsData.ts...")
    build()
