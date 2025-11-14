# SNL Cast Headshots Guide

This guide explains how to manage individual cast member headshots and regenerate the sprite sheet.

## Directory Structure

```
public/images/
├── headshots/              # Individual 200x200px headshot images
│   ├── dan-aykroyd.png
│   ├── john-belushi.png
│   ├── tina-fey.png
│   └── ... (170 total)
└── snl-sprites-200.png     # Combined sprite sheet (generated)
```

## Updating a Headshot

### 1. Locate the Image File

Individual headshots are stored in `public/images/headshots/`. Each file is named using the cast member's name in lowercase with hyphens (slug format).

**Examples:**
- "Tina Fey" → `tina-fey.png`
- "Chris Rock" → `chris-rock.png`
- "A. Whitney Brown" → `a-whitney-brown.png`

### 2. Replace the Image

Replace any headshot file with your own image. **Requirements:**
- **Size:** 200x200 pixels (square)
- **Format:** PNG
- **Color:** Grayscale (the build script will convert if needed)
- **Quality:** High resolution, well-cropped headshot

**Tips:**
- Center the face in the frame
- Ensure good contrast for visibility
- Use a recent, recognizable photo
- Keep the background simple

### 3. Rebuild the Sprite Sheet

After updating any headshots, run the build script:

```bash
python3 scripts/build_sprite_sheet.py
```

This will:
- Read all images from `public/images/headshots/`
- Combine them into `public/images/snl-sprites-200.png`
- Update coordinates in `src/data/sprites200.ts`
- Validate image sizes and formats

### 4. Commit Your Changes

```bash
git add public/images/headshots/[name].png
git add public/images/snl-sprites-200.png
git add src/data/sprites200.ts
git commit -m "Update headshot for [cast member name]"
git push
```

## Bulk Updates

To update multiple headshots at once:

1. Replace multiple files in `public/images/headshots/`
2. Run `python3 scripts/build_sprite_sheet.py` once
3. Commit all changes together

## Adding Missing Headshots

Currently, 23 cast members have placeholder images (showing initials). To add real photos:

1. Find a 200x200px image
2. Save it to `public/images/headshots/[slug].png`
3. Run `python3 scripts/build_sprite_sheet.py`

**Missing headshots:**
- melissa-villaseñor.png
- andrew-dismukes.png
- sarah-sherman.png
- james-austin-johnson.png
- marcello-hernández.png
- michael-longfellow.png
- devon-walker.png
- molly-kearney.png
- chloe-troast.png
- punkie-johnson.png
- ashley-padilla.png
- jane-wickline.png
- emil-wakim.png
- tommy-brennan.png
- jeremy-culhane.png
- kam-patterson.png
- veronika-slowikowska.png
- ben-marshall.png
- aristotle-athari.png
- lauren-holt.png
- michael-odonoghue.png
- mike-obrien.png
- noël-wells.png

## Scripts Reference

### `export_individual_headshots.py`

Extracts individual headshots from the current sprite sheet.

```bash
python3 scripts/export_individual_headshots.py
```

**Use this when:** You want to extract the current sprite sheet into individual files (already done).

### `build_sprite_sheet.py`

Builds the sprite sheet from individual headshot images.

```bash
python3 scripts/build_sprite_sheet.py
```

**Use this when:** You've updated any headshot files and need to regenerate the sprite sheet.

### `check-missing-headshots.js`

Checks which cast members are missing headshots.

```bash
node scripts/check-missing-headshots.js
```

**Use this when:** You want to see a list of cast members without real photos.

## Image Preparation Tips

If you have a color photo that needs to be prepared:

### Using ImageMagick (command line)

```bash
# Resize and convert to grayscale
convert input.jpg -resize 200x200^ -gravity center -extent 200x200 -colorspace Gray output.png
```

### Using Python/Pillow

```python
from PIL import Image

img = Image.open('input.jpg')
# Crop to square
size = min(img.size)
left = (img.width - size) // 2
top = (img.height - size) // 2
img = img.crop((left, top, left + size, top + size))
# Resize to 200x200
img = img.resize((200, 200), Image.Resampling.LANCZOS)
# Convert to grayscale
img = img.convert('L')
img.save('output.png')
```

### Using Online Tools

- [Squoosh.app](https://squoosh.app) - Resize and optimize
- [Remove.bg](https://remove.bg) - Remove backgrounds
- Any photo editor (GIMP, Photoshop, Preview, etc.)

## Troubleshooting

**Q: The sprite sheet looks broken after updating**
- Make sure all images are exactly 200x200 pixels
- Run `python3 scripts/build_sprite_sheet.py` again

**Q: My image looks pixelated**
- Use a higher resolution source image before resizing
- Ensure the original is at least 200x200px

**Q: The colors look wrong**
- The sprite sheet uses grayscale only
- Color images will be converted automatically

**Q: How do I find the slug name for a cast member?**
- Convert to lowercase
- Replace spaces with hyphens
- Remove periods and apostrophes
- Example: "Robert Downey Jr." → "robert-downey-jr"

## License Note

The headshot images are for personal use only. Ensure you have the right to use any images you add to this project.
