import { useMemo, useEffect } from 'react';
import type { CastMember as CastMemberType, SeasonWithCast } from '../types';
import CastMember from './CastMember';
import { calculateCastPositions, clearPositionCache } from '../utils/castPositioning';
import './AllCastView.css';

interface AllCastViewProps {
  allCast: CastMemberType[];
  currentSeason: SeasonWithCast | undefined;
  nextSeason: SeasonWithCast | undefined;
  transitionProgress: number;
  onCastClick?: (cast: CastMemberType) => void;
}

export default function AllCastView({
  allCast,
  currentSeason,
  nextSeason,
  transitionProgress,
  onCastClick
}: AllCastViewProps) {
  // Clear position cache on mount and resize to use latest clustering parameters
  useEffect(() => {
    clearPositionCache();

    const handleResize = () => {
      clearPositionCache();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    if (currentSeason && nextSeason && currentSeason.season !== nextSeason.season) {
      // Trigger calculation with transitionProgress = 0 to cache both seasons
      calculateCastPositions(
        uniqueCast,
        currentSeason.season,
        nextSeason.season,
        0
      );
    }
  }, [currentSeason, nextSeason, uniqueCast]);

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
      transitionProgress
    );

    return positions;
  }, [uniqueCast, currentSeason, nextSeason, transitionProgress]);

  // Get set of active cast member names for current season
  const activeCastNames = useMemo(() => {
    if (!currentSeason) return new Set<string>();
    return new Set(currentSeason.cast.map(m => m.name));
  }, [currentSeason]);

  return (
    <div className="all-cast-view">
      {castPositions.map(({ member, x, y }) => (
        <CastMember
          key={member.name}
          member={member}
          x={x}
          y={y}
          isActive={activeCastNames.has(member.name)}
          onClick={() => onCastClick?.(member)}
        />
      ))}
    </div>
  );
}
