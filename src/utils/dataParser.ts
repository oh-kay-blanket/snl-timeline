import { cast } from '../data/cast';
import { seasonsData } from '../data/seasons';
import type { CastMember, SeasonWithCast } from '../types';

/**
 * Parses cast data and organizes it by season with transition information
 */
export function parseSeasonData(): SeasonWithCast[] {
  // Get unique season numbers and sort them
  const seasonNumbers = [...new Set(cast.map(c => c.season))].sort((a, b) => a - b);

  const seasons: SeasonWithCast[] = [];

  for (let i = 0; i < seasonNumbers.length; i++) {
    const seasonNum = seasonNumbers[i];

    // Get all cast members who were in this season
    const seasonCast = cast.filter(member => {
      const firstSeason = member.season;
      const lastSeason = firstSeason + member.total_seasons - 1;
      return seasonNum >= firstSeason && seasonNum <= lastSeason;
    });

    // Get previous season's cast
    const prevSeasonCast = i > 0 ? seasons[i - 1].cast : [];

    // Determine new, departing, and continuing cast
    const newCast = seasonCast.filter(
      member => !prevSeasonCast.some(prev => prev.name === member.name)
    );

    const continuingCast = seasonCast.filter(
      member => prevSeasonCast.some(prev => prev.name === member.name)
    );

    const departingCast = prevSeasonCast.filter(
      member => !seasonCast.some(curr => curr.name === member.name)
    );

    // Calculate year based on season number
    // Season 1 started in 1975
    const yearStart = 1975 + (seasonNum - 1);
    const yearEnd = yearStart + 1;

    // Get season metadata from seasonsData
    const seasonData = seasonsData.find(s => s.season === seasonNum);

    seasons.push({
      season: seasonNum,
      year: `${yearStart}-${yearEnd}`,
      yearStart,
      yearEnd,
      cast: seasonCast,
      newCast,
      departingCast,
      continuingCast,
      anchors: seasonData?.anchors || '',
      hosts: seasonData?.hosts || '',
      music: seasonData?.music || '',
      sketches: seasonData?.sketches || ''
    });
  }

  return seasons;
}

/**
 * Parses anchor names from the anchors string
 * Removes episode ranges like "(1-4)" and returns array of names
 */
export function parseAnchorNames(anchorsString: string): string[] {
  if (!anchorsString) return [];

  // Split by comma and clean up each name
  return anchorsString
    .split(',')
    .map(anchor => {
      // Remove episode ranges like "(1-4)" and trim whitespace
      return anchor.replace(/\s*\([^)]*\)/g, '').trim();
    })
    .filter(name => name.length > 0);
}

/**
 * Gets a cast member's sprite filename
 */
export function getCastMemberSpriteKey(name: string): string {
  return name.toLowerCase().replace(/['\s]/g, '-').replace(/--+/g, '-') + ' bw.png';
}

/**
 * Finds a cast member by name
 */
export function findCastMember(name: string): CastMember | undefined {
  return cast.find(member => member.name === name);
}
