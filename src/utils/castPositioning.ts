import type { CastMember } from '../types';
import { clusterCastMembers, getSafeBounds, overlapsSeasonTitle } from './clustering';

type CastState = 'before' | 'active' | 'after';

interface CastPositionResult {
  member: CastMember;
  x: number;
  y: number;
}

// Global cache to store positions for ALL seasons
const seasonPositionsCache: Map<number, Map<string, { x: number; y: number }>> = new Map();

/**
 * Clears the position cache (useful when clustering parameters change)
 */
export function clearPositionCache(): void {
  seasonPositionsCache.clear();
}

/**
 * Determines if a cast member is before, during, or after a given season
 * Uses season cast data from seasons.ts as the source of truth
 */
function getCastState(
  member: CastMember,
  seasonNumber: number,
  seasonCastMap: Map<number, Set<string>>
): CastState {
  // Check if this member is in the current season according to seasons.ts
  const seasonCast = seasonCastMap.get(seasonNumber);
  const isInCurrentSeason = seasonCast?.has(member.name) ?? false;

  if (isInCurrentSeason) {
    return 'active';
  }

  // Determine if they're before or after by checking previous/next seasons
  // Check if they appear in any earlier season
  let appearsInEarlierSeason = false;
  for (let s = 1; s < seasonNumber; s++) {
    if (seasonCastMap.get(s)?.has(member.name)) {
      appearsInEarlierSeason = true;
      break;
    }
  }

  if (appearsInEarlierSeason) {
    return 'after'; // They were in an earlier season, so they've left
  } else {
    return 'before'; // They haven't appeared yet
  }
}

/**
 * Groups cast members by their state relative to a season
 */
function groupCastByState(
  cast: CastMember[],
  seasonNumber: number,
  seasonCastMap: Map<number, Set<string>>
) {
  const groups = {
    before: [] as CastMember[],
    active: [] as CastMember[],
    after: [] as CastMember[],
  };

  cast.forEach(member => {
    const state = getCastState(member, seasonNumber, seasonCastMap);
    groups[state].push(member);
  });

  return groups;
}

/**
 * Gets or creates positions for a specific season
 */
function getOrCreateSeasonPositions(
  cast: CastMember[],
  seasonNumber: number,
  windowWidth: number,
  windowHeight: number,
  seasonCastMap: Map<number, Set<string>>
): Map<string, { x: number; y: number }> {
  // Check if we already have cached positions for this season
  if (seasonPositionsCache.has(seasonNumber)) {
    return seasonPositionsCache.get(seasonNumber)!;
  }

  // Calculate new positions for this season
  const centerY = windowHeight / 2;
  const leftX = -100; // Off-screen to the left
  const middleX = windowWidth * 0.5;
  const rightX = windowWidth + 100; // Off-screen to the right

  const groups = groupCastByState(cast, seasonNumber, seasonCastMap);
  const positionMap = new Map<string, { x: number; y: number }>();

  // Ensure previous season is calculated first to maintain continuity
  const previousSeasonNumber = seasonNumber - 1;
  let previousPositions;
  if (previousSeasonNumber >= 1) {
    // Recursively ensure previous season exists
    previousPositions = getOrCreateSeasonPositions(cast, previousSeasonNumber, windowWidth, windowHeight, seasonCastMap);
  }

  let activePositions;
  if (previousPositions && groups.active.length > 0) {
    // Separate continuing vs new cast
    const continuingCast: CastMember[] = [];
    const newCast: CastMember[] = [];

    groups.active.forEach(member => {
      const prevPos = previousPositions.get(member.name);
      const prevState = previousSeasonNumber >= 0 ? getCastState(member, previousSeasonNumber, seasonCastMap) : 'before';

      // If they were active in previous season AND have a cached position, they're continuing
      if (prevPos && prevState === 'active') {
        continuingCast.push(member);
      } else {
        newCast.push(member);
      }
    });

    // Keep exact positions for continuing cast
    const positions = continuingCast.map(member => ({
      member,
      x: previousPositions.get(member.name)!.x,
      y: previousPositions.get(member.name)!.y,
    }));

    // Only cluster new cast if there are any
    if (newCast.length > 0) {
      // Cluster new cast with iterations to find tight non-overlapping positions
      const newPositions = clusterCastMembers(newCast, middleX, centerY, 400);

      // Run a light settling phase with all cast to prevent overlaps
      // but anchor continuing cast to their positions
      const allPositions = [...positions, ...newPositions].map(p => ({
        ...p,
        vx: 0,
        vy: 0,
        isContinuing: continuingCast.some(c => c.name === p.member.name)
      }));

      // Adjust spacing based on viewport
      const isMobile = windowWidth < 768;
      const CIRCLE_RADIUS = isMobile ? 30 : 40;
      const NAME_CLEARANCE = isMobile ? 20 : 25; // Extra clearance for SVG curved text around photo
      const HORIZONTAL_SPACING = isMobile ? 4 : 5; // Horizontal spacing between circles
      const VERTICAL_SPACING = isMobile ? 6 : 8; // Vertical spacing to account for text above/below

      // Light settling - increased iterations for better separation
      for (let iter = 0; iter < 200; iter++) {
        allPositions.forEach(p => { p.vx = 0; p.vy = 0; });

        // Repulsion between all pairs
        for (let i = 0; i < allPositions.length; i++) {
          for (let j = i + 1; j < allPositions.length; j++) {
            const p1 = allPositions[i];
            const p2 = allPositions[j];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distanceX = Math.abs(dx);
            const distanceY = Math.abs(dy);

            // Minimum distances accounting for photo + circular text clearance
            const minHorizontalDistance = (CIRCLE_RADIUS * 2) + NAME_CLEARANCE + HORIZONTAL_SPACING;
            const minVerticalDistance = (CIRCLE_RADIUS * 2) + NAME_CLEARANCE + VERTICAL_SPACING;

            // Check for overlap using rectangular bounds
            const overlapX = minHorizontalDistance - distanceX;
            const overlapY = minVerticalDistance - distanceY;

            // Gentle repulsion force if overlapping
            if (overlapX > 0 && overlapY > 0) {
              const forceX = overlapX * 2.0;
              const forceY = overlapY * 2.0;

              const signX = dx > 0 ? 1 : -1;
              const signY = dy > 0 ? 1 : -1;

              p1.vx -= signX * forceX;
              p1.vy -= signY * forceY;
              p2.vx += signX * forceX;
              p2.vy += signY * forceY;
            }
          }

          // Anchor continuing cast to original positions (very strong)
          const p = allPositions[i];
          if (p.isContinuing) {
            const originalPos = previousPositions.get(p.member.name)!;
            const dx = originalPos.x - p.x;
            const dy = originalPos.y - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0) {
              const force = distance * 0.5; // Strong anchor
              p.vx += (dx / distance) * force;
              p.vy += (dy / distance) * force;
            }
          }
        }

        // Get safe bounds considering UI elements
        const bounds = getSafeBounds(CIRCLE_RADIUS);

        allPositions.forEach(p => {
          // Repulsion from season title area
          if (overlapsSeasonTitle(p.x, p.y, CIRCLE_RADIUS, bounds)) {
            const { seasonTitleBox } = bounds;
            const titleCenterX = (seasonTitleBox.left + seasonTitleBox.right) / 2;
            const titleCenterY = (seasonTitleBox.top + seasonTitleBox.bottom) / 2;
            const awayX = p.x - titleCenterX;
            const awayY = p.y - titleCenterY;
            const awayDistance = Math.sqrt(awayX * awayX + awayY * awayY);

            if (awayDistance > 0) {
              const pushForce = 50; // Strong push away from title
              p.vx += (awayX / awayDistance) * pushForce;
              p.vy += (awayY / awayDistance) * pushForce;
            }
          }

          // Apply with heavy damping
          p.x += p.vx * 0.6;
          p.y += p.vy * 0.6;

          // Clamp to safe bounds
          p.x = Math.max(bounds.minX, Math.min(bounds.maxX, p.x));
          p.y = Math.max(bounds.minY, Math.min(bounds.maxY, p.y));

          // If still overlapping season title after clamping, push it away
          if (overlapsSeasonTitle(p.x, p.y, CIRCLE_RADIUS, bounds)) {
            const { seasonTitleBox } = bounds;
            // Push to the right of the season title
            p.x = Math.max(p.x, seasonTitleBox.right + CIRCLE_RADIUS + 20);
          }
        });
      }

      activePositions = allPositions.map(({ member, x, y }) => ({ member, x, y }));
    } else {
      // No new cast - keep all positions exactly as they were
      activePositions = positions;
    }
  } else {
    // No previous season - cluster all from scratch
    activePositions = clusterCastMembers(groups.active, middleX, centerY, 500);
  }

  // Add active positions
  activePositions.forEach(p => {
    positionMap.set(p.member.name, { x: p.x, y: p.y });
  });

  // Stack inactive cast
  groups.before.forEach(member => {
    positionMap.set(member.name, { x: leftX, y: centerY });
  });

  groups.after.forEach(member => {
    positionMap.set(member.name, { x: rightX, y: centerY });
  });

  // Cache these positions
  seasonPositionsCache.set(seasonNumber, positionMap);

  return positionMap;
}

/**
 * Calculates positions for cast members based on current and next season
 * with smooth transitions tied to scroll progress
 */
export function calculateCastPositions(
  cast: CastMember[],
  currentSeasonNumber: number,
  nextSeasonNumber: number,
  transitionProgress: number,
  seasonCastMap: Map<number, Set<string>>
): CastPositionResult[] {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const centerY = windowHeight / 2;
  const middleX = windowWidth * 0.5;

  // Get or create cached positions for current and next season
  const currentPosMap = getOrCreateSeasonPositions(cast, currentSeasonNumber, windowWidth, windowHeight, seasonCastMap);
  const nextPosMap = getOrCreateSeasonPositions(cast, nextSeasonNumber, windowWidth, windowHeight, seasonCastMap);

  // Interpolate positions based on transition progress
  const result = cast.map(member => {
    const currentPos = currentPosMap.get(member.name);
    const nextPos = nextPosMap.get(member.name);

    if (!currentPos || !nextPos) {
      return { member, x: middleX, y: centerY };
    }

    // Linear interpolation
    const x = currentPos.x + (nextPos.x - currentPos.x) * transitionProgress;
    const y = currentPos.y + (nextPos.y - currentPos.y) * transitionProgress;

    return { member, x, y };
  });

  return result;
}
