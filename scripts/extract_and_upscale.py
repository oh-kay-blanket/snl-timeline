#!/usr/bin/env python3
"""
Extract existing headshots from 96px sprite sheet and upscale to 200px.
Then fetch missing headshots.
"""

import os
import re
import json
import time
import requests
from PIL import Image, ImageDraw, ImageFont
import io

# Configuration
OLD_SPRITE_SIZE = 96
NEW_SPRITE_SIZE = 200
IMAGES_PER_ROW = 10
OUTPUT_DIR = "public/images"
HEADSHOTS_DIR = "scripts/headshots"
OLD_SPRITE = "public/images/snl-sprites.png"
SPRITE_OUTPUT = os.path.join(OUTPUT_DIR, "snl-sprites-200.png")
COORDS_OUTPUT = "src/data/sprites200.ts"

def name_to_slug(name):
    """Convert cast member name to filename slug"""
    return name.lower().replace(".", "").replace("'", "").replace(" ", "-")

def extract_from_old_sprite(sprite_path, coords_file):
    """Extract individual headshots from the old sprite sheet"""
    print("Extracting from old sprite sheet...")

    # Read the old sprite coordinates
    with open(coords_file, 'r') as f:
        coords_content = f.read()

    # Parse coordinates
    coord_matches = re.findall(r"'([^']+)':\s*\[(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\]", coords_content)

    # Load old sprite sheet
    old_sprite = Image.open(sprite_path)

    extracted = {}

    for match in coord_matches:
        filename, x, y, w, h = match
        x, y, w, h = int(x), int(y), int(w), int(h)

        # Remove ' bw.png' to get slug
        slug = filename.replace(' bw.png', '')

        # Extract the region
        region = old_sprite.crop((x, y, x + w, y + h))

        # Upscale to new size using high-quality resampling
        upscaled = region.resize((NEW_SPRITE_SIZE, NEW_SPRITE_SIZE), Image.Resampling.LANCZOS)

        # Save
        output_path = os.path.join(HEADSHOTS_DIR, f"{slug}-processed.png")
        upscaled.save(output_path)

        extracted[slug] = output_path

    print(f"✓ Extracted {len(extracted)} headshots from old sprite")
    return extracted

def create_placeholder_image(output_path, name, size=200):
    """Create a placeholder with initials"""
    img = Image.new('L', (size, size), color=200)
    draw = ImageDraw.Draw(img)

    # Get initials
    parts = name.split()
    if len(parts) >= 2:
        initials = f"{parts[0][0]}{parts[-1][0]}"
    else:
        initials = name[0] if name else "?"

    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
    except:
        font = None

    if font:
        bbox = draw.textbbox((0, 0), initials, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
    else:
        text_width = len(initials) * 10
        text_height = 20

    x = (size - text_width) // 2
    y = (size - text_height) // 2

    draw.text((x, y), initials, fill=80, font=font)
    img.save(output_path)

def create_sprite_sheet(headshot_files, cast_names, output_path, sprite_size=200, images_per_row=10):
    """Create a sprite sheet maintaining the order of cast_names"""
    num_images = len(cast_names)
    num_rows = (num_images + images_per_row - 1) // images_per_row

    sheet_width = images_per_row * sprite_size
    sheet_height = num_rows * sprite_size

    sprite_sheet = Image.new('L', (sheet_width, sheet_height), color=255)

    coordinates = {}

    for idx, name in enumerate(cast_names):
        slug = name_to_slug(name)
        row = idx // images_per_row
        col = idx % images_per_row

        x = col * sprite_size
        y = row * sprite_size

        if slug in headshot_files and os.path.exists(headshot_files[slug]):
            try:
                img = Image.open(headshot_files[slug])
                sprite_sheet.paste(img, (x, y))
                coordinates[f"{slug} bw.png"] = [x, y, sprite_size, sprite_size]
            except Exception as e:
                print(f"  Error adding {slug}: {e}")

    sprite_sheet.save(output_path, optimize=True)
    print(f"\n✓ Sprite sheet: {output_path} ({sheet_width}x{sheet_height})")

    return coordinates

def generate_typescript_file(coordinates, output_path):
    """Generate TypeScript file with sprite coordinates"""
    with open(output_path, 'w') as f:
        f.write("import type { SpriteCoordinates } from '../types';\n\n")
        f.write("export const heads200: SpriteCoordinates = \n{\n")

        sorted_coords = sorted(coordinates.items(), key=lambda x: (x[1][1], x[1][0]))

        for key, coords in sorted_coords:
            f.write(f"  '{key}': {coords},\n")

        f.write("};\n")

    print(f"✓ TypeScript file: {output_path}")

def main():
    os.makedirs(HEADSHOTS_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("="*60)
    print("SNL HEADSHOT EXTRACTION & UPSCALING")
    print("="*60 + "\n")

    # Read cast data
    print("Reading cast data...")
    with open('src/data/cast.ts', 'r') as f:
        cast_content = f.read()

    name_matches = re.findall(r'name: "([^"]+)"', cast_content)
    cast_names = list(dict.fromkeys(name_matches))

    print(f"Found {len(cast_names)} cast members\n")

    # Extract from old sprite
    headshot_files = extract_from_old_sprite(OLD_SPRITE, 'src/data/sprites96.ts')

    print("\nProcessing all cast members...")
    missing_count = 0

    for idx, name in enumerate(cast_names, 1):
        slug = name_to_slug(name)
        processed_path = os.path.join(HEADSHOTS_DIR, f"{slug}-processed.png")

        if slug in headshot_files:
            print(f"[{idx}/{len(cast_names)}] {name} - ✓ Extracted")
        else:
            print(f"[{idx}/{len(cast_names)}] {name} - ⚠ Missing - creating placeholder")
            create_placeholder_image(processed_path, name, NEW_SPRITE_SIZE)
            headshot_files[slug] = processed_path
            missing_count += 1

    print(f"\n✓ {len(headshot_files) - missing_count} real headshots")
    print(f"⚠ {missing_count} placeholders\n")

    print("="*60)
    print("Creating new sprite sheet...")
    print("="*60 + "\n")

    coordinates = create_sprite_sheet(headshot_files, cast_names, SPRITE_OUTPUT, NEW_SPRITE_SIZE, IMAGES_PER_ROW)
    generate_typescript_file(coordinates, COORDS_OUTPUT)

    print("\n" + "="*60)
    print("COMPLETE!")
    print("="*60)
    print(f"Total headshots: {len(cast_names)}")
    print(f"Real images: {len(headshot_files) - missing_count}")
    print(f"Placeholders: {missing_count}")
    print(f"\nSprite sheet: {SPRITE_OUTPUT}")
    print(f"Coordinates: {COORDS_OUTPUT}")

if __name__ == "__main__":
    main()
