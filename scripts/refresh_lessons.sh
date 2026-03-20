#!/bin/bash
# Run this any time after the scraper adds new lesson HTML files.
# It rebuilds lib/lessonsData.ts so the app picks up the new content.
set -e
echo "Rebuilding lesson data from Pages/..."
python3 "$(dirname "$0")/build_lessons_data.py"
echo "Done. Restart the app workflow to see updated lessons."
