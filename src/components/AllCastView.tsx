import { useMemo, useEffect } from 'react';
import type { CastMember as CastMemberType, SeasonWithCast } from '../types';
import CastMember from './CastMember';
import WeekendUpdateBadge from './WeekendUpdateBadge';
import { calculateCastPositions, clearPositionCache } from '../utils/castPositioning';
import { parseAnchorNames } from '../utils/dataParser';
import './AllCastView.css';

interface AllCastViewProps {
  allCast: CastMemberType[];
  seasons: SeasonWithCast[];
  currentSeason: SeasonWithCast | undefined;
  nextSeason: SeasonWithCast | undefined;
  transitionProgress: number;
  onCastClick?: (cast: CastMemberType) => void;
}

export default function AllCastView({
  allCast,
  seasons,
  currentSeason,
  nextSeason,
  transitionProgress,
  onCastClick
}: AllCastViewProps) {
  // Clear position cache on resize to recalculate with new dimensions
  useEffect(() => {
    const handleResize = () => {
      clearPositionCache();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Create season cast mapping from seasons.ts data (source of truth)
  const seasonCastMap = useMemo(() => {
    const map = new Map<number, Set<string>>();
    seasons.forEach(season => {
      const castNames = new Set(season.cast.map(member => member.name));
      map.set(season.season, castNames);
    });
    return map;
  }, [seasons]);

  // Deduplicate cast members by name (keep first occurrence)
  const uniqueCast = useMemo(() => {
    const seen = new Set<string>();
    return allCast.filter(member => {
      if (seen.has(member.name)) {
        return false;
      }
      seen.add(member.name);
      return true;
    });
  }, [allCast]);

  // Pre-calculate positions for next season to prevent jumps on first scroll
  useEffect(() => {
    if (currentSeason && nextSeason) {
      // Trigger calculation with transitionProgress = 0 to cache both seasons
      // This includes the initial case where current === next (both Season 1)
      calculateCastPositions(
        uniqueCast,
        currentSeason.season,
        nextSeason.season,
        0,
        seasonCastMap
      );
    }
  }, [currentSeason, nextSeason, uniqueCast, seasonCastMap]);

  // Calculate positions with smooth interpolation based on scroll
  const castPositions = useMemo(() => {
    if (!currentSeason) return [];

    const nextSeasonNumber = nextSeason?.season || currentSeason.season;

    // Pre-calculate positions for both current and next season to avoid jumps
    // This ensures both seasons have cached positions before interpolation starts
    const positions = calculateCastPositions(
      uniqueCast,
      currentSeason.season,
      nextSeasonNumber,
      transitionProgress,
      seasonCastMap
    );

    return positions;
  }, [uniqueCast, currentSeason, nextSeason, transitionProgress, seasonCastMap]);

  // Get set of active cast member names for current season
  const activeCastNames = useMemo(() => {
    if (!currentSeason) return new Set<string>();
    const names = new Set(currentSeason.cast.map(m => m.name));
    return names;
  }, [currentSeason]);

  // Calculate current season's cast count for dynamic sizing
  const currentSeasonCastCount = useMemo(() => {
    return currentSeason?.cast.length || 0;
  }, [currentSeason]);


  // Calculate Weekend Update badge positions - always 3 badges with smooth transitions
  const badgePositions = useMemo(() => {
    if (!currentSeason) return [];

    // Get anchor names for both current and next season
    const currentAnchors = parseAnchorNames(currentSeason.anchors);
    const nextAnchors = nextSeason ? parseAnchorNames(nextSeason.anchors) : currentAnchors;

    // Cast member size for offset calculation
    const isMobile = window.innerWidth < 768;
    const castMemberRadius = isMobile ? 30 : 40;
    const badgeSize = isMobile ? 14 : 18;

    // Screen bounds with margin
    const margin = badgeSize;
    const minX = margin;
    const maxX = window.innerWidth - margin;
    const minY = margin;
    const maxY = window.innerHeight - margin;

    // Helper to get anchor name for a badge slot, stacking when fewer anchors
    const getAnchorForSlot = (slot: number, anchors: string[]) => {
      if (anchors.length === 0) return null;
      if (anchors.length === 1) return anchors[0]; // All badges stack on single anchor
      if (anchors.length === 2) {
        // Distribute: badge 0 on anchor 0, badges 1&2 on anchor 1
        return slot === 0 ? anchors[0] : anchors[1];
      }
      // 3 anchors: one badge per anchor
      return anchors[slot] || anchors[0];
    };

    // Get non-interpolated positions for current and next season
    const currentSeasonPositions = calculateCastPositions(
      uniqueCast,
      currentSeason.season,
      currentSeason.season,
      0,
      seasonCastMap
    );

    const nextSeasonNumber = nextSeason?.season || currentSeason.season;
    const nextSeasonPositions = calculateCastPositions(
      uniqueCast,
      nextSeasonNumber,
      nextSeasonNumber,
      0,
      seasonCastMap
    );

    // Helper to find position in a specific season's positions with fallback
    const findPositionInSeason = (anchorName: string | null, seasonPositions: typeof currentSeasonPositions) => {
      if (!anchorName) return null;

      // Try season-specific positions first
      let pos = seasonPositions.find(p => p.member.name === anchorName);

      // Fallback to current interpolated positions if not found
      if (!pos) {
        pos = castPositions.find(p => p.member.name === anchorName);
      }

      return pos ? { x: pos.x, y: pos.y } : null;
    };

    // Create sticky badge assignments that preserve anchors across seasons
    const createBadgeAssignments = (currentAnchors: string[], nextAnchors: string[]) => {
      const currentAssignments: (string | null)[] = [null, null, null];
      const nextAssignments: (string | null)[] = [null, null, null];

      // Get previous assignments using simple slot logic
      for (let slot = 0; slot < 3; slot++) {
        currentAssignments[slot] = getAnchorForSlot(slot, currentAnchors);
        nextAssignments[slot] = getAnchorForSlot(slot, nextAnchors);
      }

      // Find anchors that persist between seasons
      const persistentAnchors = currentAnchors.filter(a => nextAnchors.includes(a));

      // If we have persistent anchors, try to keep them in the same slots
      if (persistentAnchors.length > 0) {
        const newNextAssignments: (string | null)[] = [null, null, null];
        const usedAnchors = new Set<string>();

        // First pass: keep persistent anchors in their FIRST current slot only
        for (let slot = 0; slot < 3; slot++) {
          const currentAnchor = currentAssignments[slot];
          if (currentAnchor && persistentAnchors.includes(currentAnchor) && !usedAnchors.has(currentAnchor)) {
            newNextAssignments[slot] = currentAnchor;
            usedAnchors.add(currentAnchor);
          }
        }

        // Second pass: assign new anchors to remaining slots
        const newAnchors = nextAnchors.filter(a => !usedAnchors.has(a));
        let newAnchorIdx = 0;
        for (let slot = 0; slot < 3; slot++) {
          if (newNextAssignments[slot] === null) {
            if (newAnchorIdx < newAnchors.length) {
              newNextAssignments[slot] = newAnchors[newAnchorIdx++];
            } else if (nextAnchors.length > 0) {
              // Fill remaining slots by stacking on existing anchors
              // Prefer to preserve the current anchor if it's persistent
              const currentAnchor = currentAssignments[slot];
              if (currentAnchor && persistentAnchors.includes(currentAnchor)) {
                newNextAssignments[slot] = currentAnchor;
              } else {
                // Otherwise use any persistent anchor to minimize movement
                const persistentInAssignments = newNextAssignments.find(a => a !== null && persistentAnchors.includes(a));
                newNextAssignments[slot] = persistentInAssignments || newNextAssignments.find(a => a !== null) || nextAnchors[0];
              }
            }
          }
        }

        return { current: currentAssignments, next: newNextAssignments };
      }

      return { current: currentAssignments, next: nextAssignments };
    };

    const { current: currentBadgeAnchors, next: nextBadgeAnchors } = createBadgeAssignments(currentAnchors, nextAnchors);

    // Calculate positions for all 3 badge slots with interpolation
    const positions = [0, 1, 2].map(slot => {
      const currentAnchor = currentBadgeAnchors[slot];
      const nextAnchor = nextBadgeAnchors[slot];

      // Get positions for these anchors
      let currentPos = findPositionInSeason(currentAnchor, currentSeasonPositions);
      let nextPos = findPositionInSeason(nextAnchor, nextSeasonPositions);

      // Use safe fallback if position lookup fails (prevents null returns)
      if (!currentPos || !nextPos) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const fallbackPos = { x: centerX, y: centerY };

        currentPos = currentPos || fallbackPos;
        nextPos = nextPos || fallbackPos;
      }

      // Interpolate between current and next position
      const interpolatedX = currentPos.x + (nextPos.x - currentPos.x) * transitionProgress;
      const interpolatedY = currentPos.y + (nextPos.y - currentPos.y) * transitionProgress;

      // Position badge to overlap the left edge of cast member
      const horizontalOffset = castMemberRadius * 1; // Overlap the cast member
      const badgeX = interpolatedX - horizontalOffset;
      const badgeY = interpolatedY; // Vertically centered on cast member

      // Clamp to screen bounds
      return {
        x: Math.max(minX, Math.min(maxX, badgeX)),
        y: Math.max(minY, Math.min(maxY, badgeY))
      };
    });

    return positions;
  }, [currentSeason, nextSeason, transitionProgress, uniqueCast, seasonCastMap]);

  return (
    <>
      <div className="all-cast-view">
        {castPositions.map(({ member, x, y }) => (
          <CastMember
            key={member.name}
            member={member}
            x={x}
            y={y}
            isActive={activeCastNames.has(member.name)}
            castCount={currentSeasonCastCount}
            onClick={() => onCastClick?.(member)}
          />
        ))}
      </div>
      <WeekendUpdateBadge positions={badgePositions} />
    </>
  );
}
