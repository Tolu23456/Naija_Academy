#!/usr/bin/env python3
"""
Upload content to Supabase Storage so the app can fetch it at runtime
without needing a rebuild or redeployment.

Usage:
  python3 scripts/upload_content.py
  python3 scripts/upload_content.py --bucket content --object lessonsData.json

Env vars (required):
  SUPABASE_URL          e.g. https://xyz.supabase.co
  SUPABASE_SERVICE_KEY  service_role key (NOT anon key)

The app reads from:
  {SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{OBJECT}
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    print("requests not installed — run: pip install requests")
    sys.exit(1)

ROOT = Path(__file__).parent.parent


def build_lessons_json() -> list[dict]:
    """
    Convert lib/lessonsData.ts into a plain JSON list of
    { subject, slug, title, html } objects.
    """
    ts_path = ROOT / "lib" / "lessonsData.ts"
    if not ts_path.exists():
        print(f"lessonsData.ts not found at {ts_path}")
        return []

    source = ts_path.read_text(encoding="utf-8")

    lessons: list[dict] = []

    subject_blocks = re.findall(
        r'"([a-z][a-z0-9-]*)"\s*:\s*\{(.*?)\},?\s*(?="[a-z]|\};\s*$)',
        source,
        re.DOTALL,
    )

    for subject, block in subject_blocks:
        topic_entries = re.findall(
            r'"([^"]+)"\s*:\s*\{\s*title\s*:\s*`(.*?)`\s*,\s*html\s*:\s*`(.*?)`\s*\}',
            block,
            re.DOTALL,
        )
        for slug, title, html in topic_entries:
            lessons.append({
                "subject": subject,
                "slug": slug,
                "title": title.strip(),
                "html": html,
            })

    print(f"Built {len(lessons)} lesson entries from lessonsData.ts")
    return lessons


def upload_to_supabase(
    data: bytes,
    supabase_url: str,
    service_key: str,
    bucket: str,
    object_path: str,
    content_type: str = "application/json",
) -> bool:
    url = f"{supabase_url}/storage/v1/object/{bucket}/{object_path}"
    headers = {
        "Authorization": f"Bearer {service_key}",
        "Content-Type": content_type,
        "x-upsert": "true",
    }
    resp = requests.put(url, headers=headers, data=data, timeout=60)
    if resp.status_code in (200, 201):
        print(f"Uploaded to {bucket}/{object_path} ({len(data):,} bytes)")
        return True
    else:
        print(f"Upload failed: {resp.status_code} — {resp.text[:300]}")
        return False


def ensure_bucket_public(supabase_url: str, service_key: str, bucket: str) -> None:
    url = f"{supabase_url}/storage/v1/bucket/{bucket}"
    headers = {"Authorization": f"Bearer {service_key}", "Content-Type": "application/json"}

    resp = requests.get(url, headers=headers, timeout=10)
    if resp.status_code == 200:
        return

    body = json.dumps({"id": bucket, "name": bucket, "public": True})
    resp = requests.post(url, headers=headers, data=body, timeout=10)
    if resp.status_code in (200, 201):
        print(f"Created public bucket '{bucket}'")
    elif "already exists" in resp.text.lower():
        pass
    else:
        print(f"Bucket setup warning: {resp.status_code} {resp.text[:200]}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Upload lessons content to Supabase Storage")
    parser.add_argument("--bucket", default="content", help="Supabase Storage bucket name")
    parser.add_argument("--object", default="lessonsData.json", help="Object path in bucket")
    args = parser.parse_args()

    supabase_url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    service_key  = os.environ.get("SUPABASE_SERVICE_KEY", "")

    if not supabase_url or not service_key:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_KEY env vars are required")
        sys.exit(1)

    lessons = build_lessons_json()
    if not lessons:
        print("No lessons to upload — ensure build_lessons_data.py has run first")
        sys.exit(1)

    json_bytes = json.dumps(lessons, ensure_ascii=False, separators=(",", ":")).encode("utf-8")

    ensure_bucket_public(supabase_url, service_key, args.bucket)
    ok = upload_to_supabase(json_bytes, supabase_url, service_key, args.bucket, args.object)

    if ok:
        public_url = f"{supabase_url}/storage/v1/object/public/{args.bucket}/{args.object}"
        print(f"\nContent live at:\n  {public_url}")
        print("\nSet this as EXPO_PUBLIC_LESSONS_URL in your app environment to enable live updates.")
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
