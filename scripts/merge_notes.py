#!/usr/bin/env python3
"""
NaijaAcademy Intelligent Notes Merger
======================================
Merges lesson notes from multiple scraped sources into single, comprehensive
Markdown files. Deduplicates by content similarity and selects the richest
version of each section.

Usage
-----
  python3 scripts/merge_notes.py                     # merge all subjects
  python3 scripts/merge_notes.py --subject maths     # one subject
  python3 scripts/merge_notes.py --dry-run           # show plan without writing
  python3 scripts/merge_notes.py --verbose           # detailed output

Output
------
  Overwrites content/{subject}/{topic}.md with merged, deduplicated content.
  Creates content/{subject}/{topic}.backup.md before overwriting.
"""

import pathlib
import re
import sys
import argparse
import shutil
import hashlib
from typing import List, Dict, Optional, Tuple

# ── CLI ───────────────────────────────────────────────────────────────────────

parser = argparse.ArgumentParser(description="NaijaAcademy notes merger")
parser.add_argument("--subject",  default="",   help="Merge only this subject key")
parser.add_argument("--dry-run",  action="store_true", help="Print plan without writing files")
parser.add_argument("--verbose",  action="store_true", help="Verbose output")
parser.add_argument("--no-backup", action="store_true", help="Skip creating .backup.md files")
args = parser.parse_args()

BASE_DIR    = pathlib.Path(__file__).parent.parent
CONTENT_DIR = BASE_DIR / "content"

# ── Similarity helpers ────────────────────────────────────────────────────────

def normalize(text: str) -> str:
    """Normalize text for comparison: lowercase, collapse whitespace, strip punctuation."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def word_set(text: str) -> set:
    return set(normalize(text).split())


def jaccard(a: str, b: str) -> float:
    """Jaccard similarity between two strings (by word overlap)."""
    sa, sb = word_set(a), word_set(b)
    if not sa or not sb:
        return 0.0
    return len(sa & sb) / len(sa | sb)


def heading_similarity(h1: str, h2: str) -> float:
    """Similarity between two section headings."""
    n1, n2 = normalize(h1), normalize(h2)
    if n1 == n2:
        return 1.0
    # substring match
    if n1 in n2 or n2 in n1:
        return 0.85
    return jaccard(n1, n2)


def content_similarity(c1: str, c2: str) -> float:
    """Similarity between two section bodies (sampled for speed)."""
    # Use first 400 chars to keep it fast
    return jaccard(c1[:400], c2[:400])

# ── Markdown section parser ───────────────────────────────────────────────────

HEADING_RE = re.compile(r"^(#{1,4})\s+(.+)$")
IMAGE_RE   = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")


def parse_sections(md_text: str) -> List[Dict]:
    """
    Parse markdown into sections. Each section is:
      { 'level': int, 'heading': str, 'body': str, 'images': list[str] }
    """
    lines   = md_text.split("\n")
    sections: List[Dict] = []
    current: Optional[Dict] = None

    def flush():
        nonlocal current
        if current is not None:
            body = current["_lines"]
            current["body"]   = "\n".join(body).strip()
            current["images"] = IMAGE_RE.findall(current["body"])
            del current["_lines"]
            if current["body"] or current["heading"]:
                sections.append(current)
        current = None

    for line in lines:
        m = HEADING_RE.match(line)
        if m:
            flush()
            current = {
                "level":   len(m.group(1)),
                "heading": m.group(2).strip(),
                "_lines":  [],
            }
        else:
            if current is None:
                current = {"level": 0, "heading": "", "_lines": []}
            current["_lines"].append(line)

    flush()
    return sections


def sections_to_markdown(sections: List[Dict]) -> str:
    lines = []
    for sec in sections:
        if sec["heading"]:
            prefix = "#" * max(1, sec["level"]) if sec["level"] > 0 else "#"
            lines.append(f"{prefix} {sec['heading']}")
            lines.append("")
        if sec["body"]:
            lines.append(sec["body"])
            lines.append("")
    return "\n".join(lines).strip() + "\n"

# ── Core merge logic ──────────────────────────────────────────────────────────

HEADING_MATCH_THRESHOLD = 0.70   # headings more similar than this = same section
CONTENT_DUPE_THRESHOLD  = 0.85   # bodies more similar than this = duplicate


def pick_best(a: Dict, b: Dict) -> Dict:
    """Return the richer of two similar sections."""
    score_a = len(a["body"]) + len(a["images"]) * 200
    score_b = len(b["body"]) + len(b["images"]) * 200
    return a if score_a >= score_b else b


def merge_section_lists(lists: List[List[Dict]]) -> List[Dict]:
    """
    Merge multiple lists of sections into one canonical list:
    1. Group sections with similar headings.
    2. For each group, pick the richest version (longest body + most images).
    3. Append unique sections not present in other sources.
    """
    merged: List[Dict] = []

    for src_sections in lists:
        for candidate in src_sections:
            if not candidate["body"] and not candidate["heading"]:
                continue

            best_match_idx = -1
            best_sim       = 0.0

            for i, existing in enumerate(merged):
                h_sim = heading_similarity(candidate["heading"], existing["heading"])
                if h_sim >= HEADING_MATCH_THRESHOLD:
                    # Check body similarity too
                    c_sim = content_similarity(candidate["body"], existing["body"])
                    combined = h_sim * 0.5 + c_sim * 0.5
                    if combined > best_sim:
                        best_sim       = combined
                        best_match_idx = i

            if best_match_idx >= 0:
                # Replace if candidate is richer
                merged[best_match_idx] = pick_best(merged[best_match_idx], candidate)
            else:
                # Unique section — append
                merged.append(dict(candidate))

    # Final dedup: remove near-duplicate bodies
    deduped: List[Dict] = []
    for sec in merged:
        is_dup = False
        for existing in deduped:
            if content_similarity(sec["body"], existing["body"]) >= CONTENT_DUPE_THRESHOLD:
                existing_score = len(existing["body"]) + len(existing["images"]) * 200
                sec_score      = len(sec["body"]) + len(sec["images"]) * 200
                if sec_score > existing_score:
                    # Replace existing with better version
                    deduped[deduped.index(existing)] = sec
                is_dup = True
                break
        if not is_dup:
            deduped.append(sec)

    return deduped

# ── Topic merger ──────────────────────────────────────────────────────────────

def find_topic_variants(subj_dir: pathlib.Path, topic_stem: str) -> List[pathlib.Path]:
    """
    Find all variants of a topic file. Variants are named:
      topic.md, topic_v2.md, topic_classnotes.md, topic_classbasic.md, etc.
    """
    base = subj_dir / f"{topic_stem}.md"
    variants = [f for f in subj_dir.glob(f"{topic_stem}*.md")
                if not f.name.endswith(".backup.md")
                and f.name != "questions.md"]
    return sorted(variants, key=lambda p: p.name)


def merge_topic_files(files: List[pathlib.Path], verbose: bool = False) -> Optional[str]:
    """Merge multiple .md files for the same topic into one."""
    if not files:
        return None
    if len(files) == 1:
        return files[0].read_text(encoding="utf-8")

    all_section_lists: List[List[Dict]] = []
    for f in files:
        text = f.read_text(encoding="utf-8")
        secs = parse_sections(text)
        if secs:
            all_section_lists.append(secs)
            if verbose:
                print(f"      {f.name}: {len(secs)} sections")

    if not all_section_lists:
        return None

    merged = merge_section_lists(all_section_lists)

    if verbose:
        print(f"      → {len(merged)} merged sections "
              f"(from {sum(len(l) for l in all_section_lists)} total)")

    return sections_to_markdown(merged)

# ── Per-subject merger ────────────────────────────────────────────────────────

def merge_subject(subj_key: str, subj_dir: pathlib.Path, dry_run: bool, verbose: bool) -> int:
    """Merge all topic files in a subject directory. Returns number of files merged."""
    merged_count = 0

    # Collect all unique topic stems (ignore questions.md and .backup.md)
    stems: set = set()
    for f in subj_dir.glob("*.md"):
        if f.name == "questions.md" or f.name.endswith(".backup.md"):
            continue
        # Strip variant suffixes: topic_v2.md → topic, topic_classnotes.md → topic
        stem = f.stem
        # Remove trailing _v\d+ or _source suffixes
        stem = re.sub(r"_(v\d+|classnotes|classbasic|edudelight|extra|alt|source\d*)$", "", stem)
        stems.add(stem)

    if not stems:
        if verbose:
            print(f"  [{subj_key}] No topics found.")
        return 0

    for stem in sorted(stems):
        variants = find_topic_variants(subj_dir, stem)
        if len(variants) <= 1:
            continue  # Nothing to merge

        print(f"  [{subj_key}/{stem}] Merging {len(variants)} variants…")
        if verbose:
            for v in variants:
                print(f"    - {v.name}")

        merged_text = merge_topic_files(variants, verbose=verbose)
        if not merged_text:
            print(f"    [WARN] Could not merge {stem} — skipping")
            continue

        primary = subj_dir / f"{stem}.md"

        if dry_run:
            print(f"    [DRY RUN] Would write {len(merged_text)} chars to {primary.name}")
            merged_count += 1
            continue

        # Backup existing
        if primary.exists() and not args.no_backup:
            backup = subj_dir / f"{stem}.backup.md"
            shutil.copy2(primary, backup)
            if verbose:
                print(f"    Backed up → {backup.name}")

        primary.write_text(merged_text, encoding="utf-8")
        merged_count += 1

        # Remove the now-merged variant files (keep primary)
        for v in variants:
            if v != primary and v.exists():
                if not dry_run:
                    v.unlink()
                    if verbose:
                        print(f"    Removed variant: {v.name}")

    return merged_count


def rebuild_single_topic(subj_dir: pathlib.Path, stem: str, verbose: bool) -> Optional[str]:
    """
    Even if there's only one file, clean it up by deduplicating its sections.
    """
    f = subj_dir / f"{stem}.md"
    if not f.exists():
        return None

    text = f.read_text(encoding="utf-8")
    secs = parse_sections(text)
    if not secs:
        return None

    # Dedup within single file
    merged = merge_section_lists([secs])
    if len(merged) == len(secs):
        return None  # No change

    if verbose:
        print(f"  [{subj_dir.name}/{stem}] Self-dedup: {len(secs)} → {len(merged)} sections")

    return sections_to_markdown(merged)

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("NaijaAcademy Notes Merger")
    print("=" * 50)
    print(f"Content dir: {CONTENT_DIR}")
    print(f"Mode: {'DRY RUN' if args.dry_run else 'WRITE'}")
    print()

    if not CONTENT_DIR.exists():
        print("[ERROR] content/ directory does not exist. Run the scraper first.")
        sys.exit(1)

    # Collect subjects to process
    if args.subject:
        subj_dirs = [CONTENT_DIR / args.subject]
        if not subj_dirs[0].exists():
            print(f"[ERROR] No content found for subject '{args.subject}'")
            sys.exit(1)
    else:
        subj_dirs = sorted(d for d in CONTENT_DIR.iterdir() if d.is_dir())

    total_merged = 0
    total_cleaned = 0

    for subj_dir in subj_dirs:
        subj_key = subj_dir.name
        print(f"\n[ {subj_key} ]")

        # Multi-file merge
        merged = merge_subject(subj_key, subj_dir, args.dry_run, args.verbose)
        total_merged += merged

        # Single-file self-dedup
        for f in sorted(subj_dir.glob("*.md")):
            if f.name == "questions.md" or f.name.endswith(".backup.md"):
                continue
            stem = f.stem
            cleaned = rebuild_single_topic(subj_dir, stem, args.verbose)
            if cleaned and not args.dry_run:
                f.write_text(cleaned, encoding="utf-8")
                total_cleaned += 1

    print(f"\n{'=' * 50}")
    print(f"Done!")
    print(f"  Multi-file merges: {total_merged}")
    print(f"  Single-file cleanups: {total_cleaned}")
    if args.dry_run:
        print("  (DRY RUN — no files written)")
    else:
        print(f"\nRun `python3 scripts/build_lessons_data.py` to rebuild the app data.")


if __name__ == "__main__":
    main()
