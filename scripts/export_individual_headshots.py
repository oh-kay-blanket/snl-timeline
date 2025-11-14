#!/usr/bin/env python3
"""
Export individual headshots from the sprite sheet.
Each cast member will have their own 200x200px grayscale PNG file.
"""

import os
import re
from PIL import Image

# Configuration
SPRITE_PATH = "public/images/snl-sprites-200.png"
COORDS_FILE = "src/data/sprites200.ts"
OUTPUT_DIR = "public/images/headshots"
SPRITE_SIZE = 200

def main():
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("="*60)
    print("EXPORTING INDIVIDUAL HEADSHOTS")
    print("="*60 + "\n")

    # Read sprite coordinates
    print("Reading sprite coordinates...")
    with open(COORDS_FILE, 'r') as f:
        coords_content = f.read()

    # Parse coordinates
    coord_matches = re.findall(r"'([^']+)':\s*\[(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\]", coords_content)

    # Load sprite sheet
    print(f"Loading sprite sheet from {SPRITE_PATH}...")
    sprite_sheet = Image.open(SPRITE_PATH)

    print(f"Exporting {len(coord_matches)} headshots...\n")

    exported_count = 0

    for match in coord_matches:
        filename, x, y, w, h = match
        x, y, w, h = int(x), int(y), int(w), int(h)

        # Remove ' bw.png' to get slug
        slug = filename.replace(' bw.png', '')

        # Extract the region
        region = sprite_sheet.crop((x, y, x + w, y + h))

        # Save as individual file
        output_path = os.path.join(OUTPUT_DIR, f"{slug}.png")
        region.save(output_path)

        exported_count += 1
        print(f"[{exported_count}/{len(coord_matches)}] Exported: {slug}.png")

    print("\n" + "="*60)
    print("EXPORT COMPLETE!")
    print("="*60)
    print(f"Exported {exported_count} headshots to {OUTPUT_DIR}/")
    print("\nYou can now replace any headshot with your own 200x200px grayscale PNG.")
    print("Then run 'python3 scripts/build_sprite_sheet.py' to rebuild the sprite sheet.")

if __name__ == "__main__":
    main()
