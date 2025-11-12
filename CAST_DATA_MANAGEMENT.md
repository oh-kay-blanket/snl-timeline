# Cast Data Management

This document explains how to manage cast member data in the SNL Timeline project.

## File Structure

- **`src/data/cast.csv`** - Source of truth for cast member names and bios (editable)
- **`src/data/cast.ts`** - TypeScript file generated from cast.csv (auto-generated, do not edit manually)
- **`src/data/seasons.csv`** - Contains season-by-season cast lists
- **`sync-cast-csv-to-ts.js`** - Script to sync cast.ts from cast.csv
- **`find-missing-cast.js`** - Script to find cast members in seasons.csv that aren't in cast.csv

## Updating Cast Data

### Step 1: Edit cast.csv

The `cast.csv` file has three columns separated by tabs:
- `id` - Unique identifier
- `name` - Cast member's name
- `bio` - Biography text

To add or update cast members, edit this file directly. Make sure to:
- Use tabs to separate columns
- Don't include line breaks within bio text
- Save with UTF-8 encoding

### Step 2: Sync to cast.ts

After editing `cast.csv`, run the sync script:

```bash
node sync-cast-csv-to-ts.js
```

This will regenerate `cast.ts` with proper escaping and formatting.

### Step 3: Verify

Build the project to ensure everything compiles:

```bash
npm run build
```

## Finding Missing Cast Members

If you've added cast members to `seasons.csv` but they don't appear in the app, run:

```bash
node find-missing-cast.js
```

This will show which names from `seasons.csv` are missing from `cast.csv`. Add them to `cast.csv` and run the sync script.

## Current Status

- **170 cast members** in cast.csv
- **165 unique cast members** in seasons.csv
- All cast members from seasons.csv are present in cast.csv

## Notes

- The cast.ts file contains placeholder data for many fields (status, url, season, etc.) since the CSV only tracks name and bio
- These fields are not currently used by the application but are kept for potential future use
- All cast members get default values:
  - status: 'a'
  - url: ''
  - season: 1
  - season_start: 1975
  - gender: undefined
  - total_seasons: 1
  - cat: 'unknown'
  - period: 0
  - color: '#888888'
