# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An interactive visualization of Saturday Night Live cast members across all seasons. The app uses vertical scroll navigation with snap-to-season behavior, organic clustering of cast members using force-directed layout, and smooth GSAP animations for cast transitions.

Data source: https://docs.google.com/spreadsheets/d/1iK1o_LQ9kEcddWNBS6NihfF5cYatHJZHv4jvNsswd0w

## Development Commands

```bash
# Start dev server (hot reload enabled)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint codebase
npm run lint

# Deploy to GitHub Pages
npm run deploy
```

## Core Architecture

### Data Flow & Source of Truth

The data architecture has a strict hierarchy:

1. **`src/data/seasons.ts`** - Source of truth for season membership
   - Contains `seasonsData` array with season metadata
   - The `cast` field is a comma-separated string of cast member names
   - Defines which cast members are in each season

2. **`src/data/cast.ts`** - Cast member metadata
   - Contains detailed info about each cast member (bio, url, color, etc.)
   - Referenced by name from seasons.ts

3. **`src/utils/dataParser.ts`** - Parsing and validation
   - `parseSeasonData()` creates `SeasonWithCast[]` from raw data
   - Creates placeholder records for cast members not found in cast.ts
   - Categorizes cast as `newCast`, `departingCast`, or `continuingCast`

### Animation System

The app uses scroll-based transitions between seasons with GSAP animations:

- **Scroll container** (`src/components/ScrollContainer.tsx`): Each season occupies exactly one viewport height. Scroll progress is calculated as `scrollTop / viewportHeight`, giving a continuous 0-N value where the integer part is the season index and the fractional part is transition progress.

- **Transition interpolation** (`src/App.tsx:38-49`): The app maintains both current and next season states, interpolating between them based on `transitionProgress` (0-1). This creates smooth sliding animations for season info and cast positions.

- **Cast positioning** (`src/utils/castPositioning.ts`):
  - Uses a global cache (`seasonPositionsCache`) to store calculated positions for ALL seasons
  - `getOrCreateSeasonPositions()` recursively ensures previous seasons are calculated first for continuity
  - Continuing cast members keep exact positions from previous season
  - New cast members are clustered around the center using force-directed layout
  - Departing cast slide off to the left, incoming cast slide in from the right
  - Positions are interpolated between current and next season based on scroll progress

- **Force-directed clustering** (`src/utils/clustering.ts`):
  - `clusterCastMembers()` creates organic positioning using physics simulation
  - Applies repulsion forces between cast members to prevent overlaps
  - Applies attraction to center to keep cluster cohesive
  - Respects UI safe bounds (timeline, season title area, screen edges)
  - Accounts for circular text clearance around photos

### Sprite System

Cast member photos use sprite sheets for performance:

- **`src/data/sprites200.ts`** and **`src/data/sprites96.ts`** contain sprite coordinates
- **`src/utils/sprites.ts`** provides `getSpriteStyle()` to calculate CSS background positioning
- Default is 200px sprites; 96px available as fallback
- Sprite sheets are located in `public/images/`

### Component Structure

- **`App.tsx`**: Main orchestrator
  - Manages scroll progress state
  - Calculates current/next season and transition progress
  - Coordinates all child components

- **`AllCastView.tsx`**: Renders all cast members
  - Calculates positions using `castPositioning.ts`
  - Handles Weekend Update badge positioning (3 badges with sticky assignments)
  - Manages resize events to recalculate positions

- **`CastMember.tsx`**: Individual cast member rendering
  - Displays sprite-based photo with circular mask
  - Shows name as curved SVG text around photo
  - Handles hover and click interactions

- **`ScrollContainer.tsx`**: Scroll management
  - Exposes `scrollToSeason()` imperative handle for programmatic navigation
  - Emits scroll progress to parent
  - Uses forwardRef/useImperativeHandle pattern

- **`SeasonView.tsx`**: Season-specific background/metadata
  - Rendered for each season in scroll container
  - Currently minimal; can be extended for season-specific visuals

### State Management Patterns

- No Redux/Context - uses React state and props
- Position caching happens in module-level Map (`seasonPositionsCache`)
- Cache is cleared on window resize to recalculate with new dimensions
- Memoization (`useMemo`) is used extensively to prevent unnecessary recalculations

### Type Definitions

Key types in `src/types/index.ts`:

- `CastMember`: Individual cast member with bio, url, season info
- `SeasonData`: Raw season data from seasons.ts
- `SeasonWithCast`: Processed season with categorized cast arrays (new/departing/continuing)
- `SpriteCoordinates`: Maps sprite keys to [x, y, width, height]

## Important Constraints

### UI Safe Bounds

Cast member positioning must respect several UI elements:

- **Timeline**: Left side (20-40px from edge, 40px wide)
- **Season title area**: Top-left corner (variable size based on mobile/desktop)
- **Screen edges**: Minimum margin to prevent clipping
- **Name clearance**: Extra space around photos for curved SVG text

The `getSafeBounds()` function in `clustering.ts` calculates these constraints dynamically.

### Weekend Update Badges

Always displays exactly 3 badges with special positioning logic:

- Badges track Weekend Update anchors from season data
- When fewer than 3 anchors exist, badges stack on the same anchor
- Persistent anchors (anchors who stay across seasons) maintain their badge slot for visual continuity
- Badge positions interpolate smoothly during season transitions

### Mobile Responsiveness

The app adjusts sizing based on viewport width (breakpoint: 768px):

- Cast member circle radius: 25px (mobile) vs 40px (desktop)
- Clustering radius and spacing adjusted for mobile
- UI element positioning and clearances scaled down

## Common Tasks

### Adding a new cast member

1. Add entry to `src/data/cast.ts` with all required fields
2. Update the relevant season's `cast` field in `src/data/seasons.ts` (comma-separated)
3. Add photo to sprite sheet and update `src/data/sprites200.ts` coordinates

### Modifying clustering behavior

Edit `src/utils/clustering.ts`:
- Adjust `CLUSTER_RADIUS_X/Y` for cluster spread
- Modify force strengths in the simulation loop
- Change iteration count for convergence quality

### Changing animation timing

Edit transition interpolation in `src/App.tsx` or modify GSAP animations in component files (if using direct GSAP calls).

### Updating season metadata

Edit `src/data/seasons.ts` to modify taglines, summaries, hosts, music, sketches, or Weekend Update anchors for any season.
