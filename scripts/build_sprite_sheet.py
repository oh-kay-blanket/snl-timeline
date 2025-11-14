#!/usr/bin/env python3
"""
Build sprite sheet from individual headshot images.
Reads all headshots from public/images/headshots/ and creates:
- public/images/snl-sprites-200.png (sprite sheet)
- src/data/sprites200.ts (coordinate mappings)
"""

import os
import re
from PIL import Image

# Configuration
HEADSHOTS_DIR = "public/images/headshots"
SPRITE_OUTPUT = "public/images/snl-sprites-200.png"
COORDS_OUTPUT = "src/data/sprites200.ts"
CAST_FILE = "src/data/cast.ts"
SPRITE_SIZE = 200
IMAGES_PER_ROW = 10

def name_to_slug(name):
    """Convert cast member name to filename slug"""
    return name.lower().replace(".", "").replace("'", "").replace(" ", "-")

def generate_typescript_file(coordinates, output_path):
    """Generate TypeScript file with sprite coordinates"""
    with open(output_path, 'w') as f:
        f.write("import type { SpriteCoordinates } from '../types';\n\n")
        f.write("export const heads200: SpriteCoordinates = \n{\n")

        # Sort by coordinates for consistent ordering
        sorted_coords = sorted(coordinates.items(), key=lambda x: (x[1][1], x[1][0]))

        for key, coords in sorted_coords:
            f.write(f"  '{key}': {coords},\n")

        f.write("};\n")

def main():
    print("="*60)
    print("BUILDING SPRITE SHEET FROM INDIVIDUAL HEADSHOTS")
    print("="*60 + "\n")

    # Read cast data to get the correct order
    print("Reading cast data for ordering...")
    with open(CAST_FILE, 'r') as f:
        cast_content = f.read()

    # Extract names in order
    name_matches = re.findall(r'name: "([^"]+)"', cast_content)
    cast_names = list(dict.fromkeys(name_matches))  # Remove duplicates, preserve order

    print(f"Found {len(cast_names)} cast members\n")

    # Check which headshots exist
    print("Checking for headshot images...")
    headshot_files = {}
    missing_headshots = []

    for name in cast_names:
        slug = name_to_slug(name)
        headshot_path = os.path.join(HEADSHOTS_DIR, f"{slug}.png")

        if os.path.exists(headshot_path):
            headshot_files[slug] = headshot_path
        else:
            missing_headshots.append(name)
            print(f"  ⚠ Missing: {name} ({slug}.png)")

    if missing_headshots:
        print(f"\n⚠ Warning: {len(missing_headshots)} headshots are missing!")
        print("The sprite sheet will be built without these images.\n")
    else:
        print(f"✓ All {len(cast_names)} headshots found!\n")

    # Calculate sprite sheet dimensions
    num_images = len(cast_names)
    num_rows = (num_images + IMAGES_PER_ROW - 1) // IMAGES_PER_ROW
    sheet_width = IMAGES_PER_ROW * SPRITE_SIZE
    sheet_height = num_rows * SPRITE_SIZE

    print("Building sprite sheet...")
    print(f"  Dimensions: {sheet_width}x{sheet_height}")
    print(f"  Grid: {IMAGES_PER_ROW} columns x {num_rows} rows")
    print(f"  Sprite size: {SPRITE_SIZE}x{SPRITE_SIZE}px\n")

    # Create sprite sheet
    sprite_sheet = Image.new('L', (sheet_width, sheet_height), color=255)
    coordinates = {}

    for idx, name in enumerate(cast_names):
        slug = name_to_slug(name)
        row = idx // IMAGES_PER_ROW
        col = idx % IMAGES_PER_ROW

        x = col * SPRITE_SIZE
        y = row * SPRITE_SIZE

        if slug in headshot_files:
            try:
                # Load and validate the headshot
                img = Image.open(headshot_files[slug])

                # Ensure it's the right size
                if img.size != (SPRITE_SIZE, SPRITE_SIZE):
                    print(f"  ⚠ Resizing {slug}.png from {img.size} to {SPRITE_SIZE}x{SPRITE_SIZE}")
                    img = img.resize((SPRITE_SIZE, SPRITE_SIZE), Image.Resampling.LANCZOS)

                # Ensure it's grayscale
                if img.mode != 'L':
                    print(f"  ⚠ Converting {slug}.png to grayscale")
                    img = img.convert('L')

                # Add to sprite sheet
                sprite_sheet.paste(img, (x, y))

                # Store coordinates
                coordinates[f"{slug} bw.png"] = [x, y, SPRITE_SIZE, SPRITE_SIZE]

            except Exception as e:
                print(f"  ✗ Error adding {slug}: {e}")
        else:
            # Create empty space for missing headshot
            print(f"  - Skipping {slug} (missing)")

    # Save sprite sheet
    print(f"\nSaving sprite sheet to {SPRITE_OUTPUT}...")
    sprite_sheet.save(SPRITE_OUTPUT, optimize=True)

    # Generate TypeScript coordinates file
    print(f"Generating TypeScript coordinates file...")
    generate_typescript_file(coordinates, COORDS_OUTPUT)

    print("\n" + "="*60)
    print("BUILD COMPLETE!")
    print("="*60)
    print(f"Sprite sheet: {SPRITE_OUTPUT}")
    print(f"Coordinates: {COORDS_OUTPUT}")
    print(f"Images included: {len(coordinates)}/{len(cast_names)}")

    if missing_headshots:
        print(f"\n⚠ {len(missing_headshots)} headshots are still missing.")
        print("Add them to public/images/headshots/ and re-run this script.")

if __name__ == "__main__":
    main()
