import { useMemo, useEffect } from 'react';
import type { CastMember as CastMemberType, SeasonWithCast } from '../types';
import CastMember from './CastMember';
// import WeekendUpdateBadge from './WeekendUpdateBadge';
import { calculateCastPositions, clearPositionCache } from '../utils/castPositioning';
// import { parseAnchorNames } from '../utils/dataParser';
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


  // Calculate Weekend Update badge positions
  // const badgePositions = useMemo(() => {
  //   if (!currentSeason) return [];

  //   // Get anchor names for current season only
  //   const anchors = parseAnchorNames(currentSeason.anchors);
  //   if (anchors.length === 0) return [];

  //   // Cast member size for offset calculation
  //   const isMobile = window.innerWidth < 768;
  //   const castMemberRadius = isMobile ? 30 : 40; // Half of photo size
  //   const badgeOffset = castMemberRadius * 0.65; // Offset less to create overlap
  //   const badgeSize = isMobile ? 20 : 24;

  //   // Screen bounds with margin
  //   const margin = badgeSize;
  //   const minX = margin;
  //   const maxX = window.innerWidth - margin;
  //   const minY = margin;
  //   const maxY = window.innerHeight - margin;

  //   // Find position for each anchor and clamp to screen
  //   const positions = anchors
  //     .map(anchorName => {
  //       // Find this anchor's position in the interpolated cast positions
  //       const pos = castPositions.find(p => p.member.name === anchorName);
  //       if (!pos) return null;

  //       // Calculate badge position (top-left of cast member with overlap)
  //       const badgeX = pos.x - badgeOffset;
  //       const badgeY = pos.y - badgeOffset;

  //       // Clamp to screen bounds
  //       return {
  //         x: Math.max(minX, Math.min(maxX, badgeX)),
  //         y: Math.max(minY, Math.min(maxY, badgeY))
  //       };
  //     })
  //     .filter(p => p !== null);

  //   return positions;
  // }, [currentSeason, castPositions]);

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
      {/* <WeekendUpdateBadge positions={badgePositions} /> */}
    </>
  );
}
