#!/usr/bin/env python3
"""
download_icons.py — Download every Ionicon SVG used in NaijaAcademy.

Usage:
    python3 scripts/download_icons.py              # download all icons to assets/icons/
    python3 scripts/download_icons.py --list       # just list icons, don't download
    python3 scripts/download_icons.py --out PATH   # custom output directory

Icons are fetched from the official Ionicons CDN (unpkg.com/ionicons).
MaterialCommunityIcons are fetched from the @mdi/svg package on unpkg.
"""

import os
import sys
import time
import argparse
import urllib.request
import urllib.error

# ── All Ionicons used across the app ─────────────────────────────────────────

IONICONS = [
    # Navigation & UI
    "add", "arrow-back", "arrow-forward", "chevron-forward", "close",
    "close-circle", "options", "search", "search-outline", "send",
    "grid-outline",

    # Auth / User
    "lock-closed-outline", "mail-outline", "eye-outline", "eye-off-outline",
    "person-outline", "person-add-outline", "people-outline",
    "logo-github", "log-out-outline", "shield-checkmark",

    # Status / Feedback
    "alert-circle", "alert-circle-outline", "checkmark", "checkmark-circle",
    "checkmark-circle-outline", "checkmark-done", "information-circle-outline",
    "help-circle-outline", "warning-outline", "ban-outline",

    # Study & Content
    "book-outline", "layers-outline", "library-outline",
    "document-text-outline", "clipboard-outline",
    "pencil-outline", "rocket-outline", "school",

    # Stats & Analytics
    "pie-chart-outline", "trending-up", "trending-up-outline",
    "trophy-outline", "timer-outline", "time-outline", "calendar-outline",

    # Admin
    "megaphone-outline", "settings-outline", "trash-outline",
    "cloud-upload-outline", "cloud-download-outline", "cloud-offline-outline",
    "sync-outline", "pin",

    # Media
    "play", "play-circle", "home", "notifications-outline",

    # Subject icons
    "calculator-outline", "flash-outline", "flask-outline", "leaf-outline",
    "business-outline", "journal-outline", "nutrition-outline",
    "cart-outline", "earth-outline", "infinite-outline", "wallet-outline",
    "heart-outline", "moon-outline", "flag-outline",
]

# MaterialCommunityIcons used (pencil-box-outline from tab bar)
# MDI slug format: kebab-case same as component name
MATERIAL_ICONS = [
    "pencil-box-outline",
]

IONICONS_CDN  = "https://unpkg.com/ionicons@7.1.0/dist/svg/{name}.svg"
MDI_CDN       = "https://unpkg.com/@mdi/svg@7.4.47/svg/{name}.svg"


def download(url: str, dest: str) -> bool:
    """Download url to dest. Returns True on success."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "NaijaAcademy/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
        with open(dest, "wb") as f:
            f.write(data)
        return True
    except urllib.error.HTTPError as e:
        print(f"  ✗ HTTP {e.code}  {url}")
        return False
    except Exception as e:
        print(f"  ✗ {e}  {url}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Download NaijaAcademy app icons")
    parser.add_argument("--out",  default="assets/icons", help="Output directory")
    parser.add_argument("--list", action="store_true",    help="List icons without downloading")
    args = parser.parse_args()

    all_icons = [("ionicons", n, IONICONS_CDN.format(name=n)) for n in sorted(set(IONICONS))]
    all_icons += [("mdi", n, MDI_CDN.format(name=n)) for n in sorted(set(MATERIAL_ICONS))]

    if args.list:
        print(f"\n{'Source':<14} {'Icon Name'}")
        print("-" * 50)
        for src, name, _ in all_icons:
            print(f"{src:<14} {name}")
        print(f"\nTotal: {len(all_icons)} icons")
        return

    outdir_ion = os.path.join(args.out, "ionicons")
    outdir_mdi = os.path.join(args.out, "mdi")
    os.makedirs(outdir_ion, exist_ok=True)
    os.makedirs(outdir_mdi, exist_ok=True)

    ok = fail = 0
    print(f"\nDownloading {len(all_icons)} icons to {args.out}/\n")

    for src, name, url in all_icons:
        folder = outdir_ion if src == "ionicons" else outdir_mdi
        dest   = os.path.join(folder, f"{name}.svg")

        if os.path.exists(dest):
            print(f"  ✓ (cached) {src}/{name}")
            ok += 1
            continue

        print(f"  ↓ {src}/{name} ...", end=" ", flush=True)
        if download(url, dest):
            print("OK")
            ok += 1
        else:
            fail += 1
        time.sleep(0.05)   # gentle rate-limiting

    print(f"\n{'='*40}")
    print(f"Done — {ok} downloaded, {fail} failed")
    print(f"Icons saved to: {os.path.abspath(args.out)}/")

    if fail:
        sys.exit(1)


if __name__ == "__main__":
    main()
