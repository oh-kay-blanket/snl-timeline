#!/usr/bin/env python3
"""
Fetch SNL cast member headshots and create a sprite sheet.
Downloads images from Wikipedia/Wikimedia Commons.
"""

import os
import re
import json
import time
import requests
from urllib.parse import quote, unquote
from PIL import Image, ImageDraw
import io

# Configuration
SPRITE_SIZE = 200  # Size of each headshot
IMAGES_PER_ROW = 10  # Number of images per row in sprite sheet
OUTPUT_DIR = "public/images"
HEADSHOTS_DIR = "scripts/headshots"
SPRITE_OUTPUT = os.path.join(OUTPUT_DIR, "snl-sprites-200.png")
COORDS_OUTPUT = "src/data/sprites200.ts"

def name_to_slug(name):
    """Convert cast member name to filename slug"""
    return name.lower().replace(".", "").replace("'", "").replace(" ", "-")

def name_to_wikipedia(name):
    """Convert cast member name to Wikipedia article name"""
    # Handle special cases
    special_cases = {
        "A. Whitney Brown": "A._Whitney_Brown",
        "Robert Downey Jr.": "Robert_Downey_Jr.",
        "Michael O'Donoghue": "Michael_O'Donoghue",
        "Mike O'Brien": "Mike_O'Brien_(comedian)",
        "Chris Elliott": "Chris_Elliott",
    }

    if name in special_cases:
        return special_cases[name]

    return name.replace(" ", "_")

def get_wikipedia_image_url(cast_name):
    """Fetch the main image URL from a Wikipedia article"""
    article_name = name_to_wikipedia(cast_name)

    # Try to get the page image from Wikipedia API
    api_url = "https://en.wikipedia.org/w/api.php"

    params = {
        "action": "query",
        "titles": article_name,
        "prop": "pageimages",
        "format": "json",
        "pithumbsize": 400
    }

    try:
        response = requests.get(api_url, params=params, timeout=10)
        data = response.json()

        pages = data.get("query", {}).get("pages", {})
        for page_id, page_data in pages.items():
            if "thumbnail" in page_data:
                return page_data["thumbnail"]["source"]
    except Exception as e:
        print(f"  Error fetching from Wikipedia API: {e}")

    return None

def download_image(url, output_path):
    """Download an image from a URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (SNL Timeline Personal Project)'
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()

        img = Image.open(io.BytesIO(response.content))
        img.save(output_path)
        return True
    except Exception as e:
        print(f"  Error downloading: {e}")
        return False

def process_image_to_grayscale(input_path, output_path, size=200):
    """Process image to grayscale square of specified size"""
    try:
        img = Image.open(input_path)

        # Convert to RGB if needed (handles RGBA, P mode, etc.)
        if img.mode != 'RGB':
            img = img.convert('RGB')

        # Crop to square (center crop)
        width, height = img.size
        if width != height:
            size_crop = min(width, height)
            left = (width - size_crop) // 2
            top = (height - size_crop) // 2
            img = img.crop((left, top, left + size_crop, top + size_crop))

        # Resize to target size
        img = img.resize((size, size), Image.Resampling.LANCZOS)

        # Convert to grayscale
        img = img.convert('L')

        # Save
        img.save(output_path)
        return True
    except Exception as e:
        print(f"  Error processing image: {e}")
        return False

def create_placeholder_image(output_path, size=200):
    """Create a placeholder gray square"""
    img = Image.new('L', (size, size), color=128)
    draw = ImageDraw.Draw(img)
    # Draw a simple "?" in the center
    draw.text((size//2 - 10, size//2 - 15), "?", fill=200)
    img.save(output_path)

def create_sprite_sheet(headshot_files, output_path, sprite_size=200, images_per_row=10):
    """Create a sprite sheet from individual headshot images"""
    num_images = len(headshot_files)
    num_rows = (num_images + images_per_row - 1) // images_per_row

    sheet_width = images_per_row * sprite_size
    sheet_height = num_rows * sprite_size

    sprite_sheet = Image.new('L', (sheet_width, sheet_height), color=255)

    coordinates = {}

    for idx, (slug, filepath) in enumerate(headshot_files.items()):
        row = idx // images_per_row
        col = idx % images_per_row

        x = col * sprite_size
        y = row * sprite_size

        try:
            img = Image.open(filepath)
            sprite_sheet.paste(img, (x, y))

            # Store coordinates [x, y, width, height]
            coordinates[f"{slug} bw.png"] = [x, y, sprite_size, sprite_size]
        except Exception as e:
            print(f"  Error adding {slug} to sprite sheet: {e}")

    sprite_sheet.save(output_path, optimize=True)
    print(f"\n✓ Sprite sheet created: {output_path}")
    print(f"  Dimensions: {sheet_width}x{sheet_height}")
    print(f"  Images: {num_images}")

    return coordinates

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

    print(f"✓ TypeScript coordinates file created: {output_path}")

def main():
    # Create directories
    os.makedirs(HEADSHOTS_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Read cast data
    print("Reading cast data...")
    with open('src/data/cast.ts', 'r') as f:
        cast_content = f.read()

    # Extract names
    name_matches = re.findall(r'name: "([^"]+)"', cast_content)
    cast_names = list(dict.fromkeys(name_matches))  # Remove duplicates, preserve order

    print(f"Found {len(cast_names)} cast members\n")

    # Process each cast member
    headshot_files = {}

    for idx, name in enumerate(cast_names, 1):
        slug = name_to_slug(name)
        processed_path = os.path.join(HEADSHOTS_DIR, f"{slug}-processed.png")

        print(f"[{idx}/{len(cast_names)}] {name}")

        # Check if we already have a processed image
        if os.path.exists(processed_path):
            print(f"  ✓ Already exists")
            headshot_files[slug] = processed_path
            continue

        # Try to download from Wikipedia
        print(f"  Fetching from Wikipedia...")
        image_url = get_wikipedia_image_url(name)

        if image_url:
            print(f"  Found image: {image_url[:60]}...")
            raw_path = os.path.join(HEADSHOTS_DIR, f"{slug}-raw.jpg")

            if download_image(image_url, raw_path):
                print(f"  Downloaded")
                if process_image_to_grayscale(raw_path, processed_path, SPRITE_SIZE):
                    print(f"  ✓ Processed to grayscale {SPRITE_SIZE}x{SPRITE_SIZE}")
                    headshot_files[slug] = processed_path
                    # Clean up raw file
                    os.remove(raw_path)
                else:
                    print(f"  ⚠ Failed to process, creating placeholder")
                    create_placeholder_image(processed_path, SPRITE_SIZE)
                    headshot_files[slug] = processed_path
            else:
                print(f"  ⚠ Failed to download, creating placeholder")
                create_placeholder_image(processed_path, SPRITE_SIZE)
                headshot_files[slug] = processed_path
        else:
            print(f"  ⚠ No image found, creating placeholder")
            create_placeholder_image(processed_path, SPRITE_SIZE)
            headshot_files[slug] = processed_path

        # Be nice to Wikipedia
        time.sleep(0.5)

    print("\n" + "="*60)
    print("Creating sprite sheet...")
    print("="*60 + "\n")

    # Create sprite sheet
    coordinates = create_sprite_sheet(headshot_files, SPRITE_OUTPUT, SPRITE_SIZE, IMAGES_PER_ROW)

    # Generate TypeScript file
    generate_typescript_file(coordinates, COORDS_OUTPUT)

    print("\n" + "="*60)
    print("COMPLETE!")
    print("="*60)
    print(f"Sprite sheet: {SPRITE_OUTPUT}")
    print(f"Coordinates file: {COORDS_OUTPUT}")
    print(f"Headshots processed: {len(headshot_files)}")

if __name__ == "__main__":
    main()
