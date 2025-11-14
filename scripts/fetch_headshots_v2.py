#!/usr/bin/env python3
"""
Fetch SNL cast member headshots using alternative methods.
This version uses DuckDuckGo image search as a fallback.
"""

import os
import re
import json
import time
import requests
from PIL import Image
import io

# Configuration
SPRITE_SIZE = 200
IMAGES_PER_ROW = 10
OUTPUT_DIR = "public/images"
HEADSHOTS_DIR = "scripts/headshots"
SPRITE_OUTPUT = os.path.join(OUTPUT_DIR, "snl-sprites-200.png")
COORDS_OUTPUT = "src/data/sprites200.ts"

def name_to_slug(name):
    """Convert cast member name to filename slug"""
    return name.lower().replace(".", "").replace("'", "").replace(" ", "-")

def search_and_download_image(cast_name, output_path):
    """
    Search for and download an image using multiple strategies
    """
    slug = name_to_slug(cast_name)

    # Try Wikimedia Commons directly
    search_query = f"{cast_name} SNL"

    # Use Commons API
    api_url = "https://commons.wikimedia.org/w/api.php"

    params = {
        "action": "query",
        "list": "search",
        "srsearch": search_query,
        "srnamespace": "6",  # File namespace
        "format": "json",
        "srlimit": "5"
    }

    try:
        response = requests.get(api_url, params=params, timeout=10, headers={
            'User-Agent': 'SNLTimelineApp/1.0'
        })

        if response.status_code == 200:
            data = response.json()

            if 'query' in data and 'search' in data['query'] and len(data['query']['search']) > 0:
                # Get the first result
                first_result = data['query']['search'][0]
                file_title = first_result['title']

                # Get the image URL
                img_info_params = {
                    "action": "query",
                    "titles": file_title,
                    "prop": "imageinfo",
                    "iiprop": "url",
                    "iiurlwidth": "400",
                    "format": "json"
                }

                img_response = requests.get(api_url, params=img_info_params, timeout=10, headers={
                    'User-Agent': 'SNLTimelineApp/1.0'
                })

                if img_response.status_code == 200:
                    img_data = img_response.json()
                    pages = img_data.get('query', {}).get('pages', {})

                    for page in pages.values():
                        if 'imageinfo' in page and len(page['imageinfo']) > 0:
                            img_url = page['imageinfo'][0].get('thumburl') or page['imageinfo'][0].get('url')

                            if img_url:
                                print(f"  Found: {img_url[:60]}...")

                                # Download the image
                                img_resp = requests.get(img_url, timeout=15, headers={
                                    'User-Agent': 'SNLTimelineApp/1.0'
                                })

                                if img_resp.status_code == 200:
                                    img = Image.open(io.BytesIO(img_resp.content))
                                    img.save(output_path)
                                    return True
    except Exception as e:
        print(f"  Error: {e}")

    return False

def process_image_to_grayscale(input_path, output_path, size=200):
    """Process image to grayscale square of specified size"""
    try:
        img = Image.open(input_path)

        # Convert to RGB if needed
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
        print(f"  Error processing: {e}")
        return False

def create_placeholder_image(output_path, name, size=200):
    """Create a placeholder with initials"""
    from PIL import ImageDraw, ImageFont

    img = Image.new('L', (size, size), color=200)
    draw = ImageDraw.Draw(img)

    # Get initials
    parts = name.split()
    if len(parts) >= 2:
        initials = f"{parts[0][0]}{parts[-1][0]}"
    else:
        initials = name[0] if name else "?"

    # Draw initials
    try:
        # Try to use a larger font
        from PIL import ImageFont
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
    except:
        font = None

    # Get text size and center it
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

    print("Reading cast data...")
    with open('src/data/cast.ts', 'r') as f:
        cast_content = f.read()

    name_matches = re.findall(r'name: "([^"]+)"', cast_content)
    cast_names = list(dict.fromkeys(name_matches))

    print(f"Found {len(cast_names)} cast members\n")

    headshot_files = {}

    for idx, name in enumerate(cast_names, 1):
        slug = name_to_slug(name)
        processed_path = os.path.join(HEADSHOTS_DIR, f"{slug}-processed.png")

        print(f"[{idx}/{len(cast_names)}] {name}")

        if os.path.exists(processed_path):
            print(f"  ✓ Exists")
            headshot_files[slug] = processed_path
            continue

        # Try to download
        raw_path = os.path.join(HEADSHOTS_DIR, f"{slug}-raw.jpg")

        if search_and_download_image(name, raw_path):
            if process_image_to_grayscale(raw_path, processed_path, SPRITE_SIZE):
                print(f"  ✓ Downloaded and processed")
                headshot_files[slug] = processed_path
                os.remove(raw_path)
            else:
                print(f"  ⚠ Creating placeholder")
                create_placeholder_image(processed_path, name, SPRITE_SIZE)
                headshot_files[slug] = processed_path
        else:
            print(f"  ⚠ Creating placeholder with initials")
            create_placeholder_image(processed_path, name, SPRITE_SIZE)
            headshot_files[slug] = processed_path

        time.sleep(1)  # Be respectful

    print("\n" + "="*60)
    coordinates = create_sprite_sheet(headshot_files, SPRITE_OUTPUT, SPRITE_SIZE, IMAGES_PER_ROW)
    generate_typescript_file(coordinates, COORDS_OUTPUT)

    print("="*60)
    print(f"COMPLETE! {len(headshot_files)} headshots processed")

if __name__ == "__main__":
    main()
