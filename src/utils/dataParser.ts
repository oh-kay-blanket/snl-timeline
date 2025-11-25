import { cast } from '../data/cast';
import { seasonsData } from '../data/seasons';
import type { CastMember, SeasonWithCast } from '../types';

/**
 * Parses cast names from a comma-separated string and matches them to cast member records
 * Creates placeholder records for names not found in cast.ts
 */
function parseCastNames(castString: string): CastMember[] {
  if (!castString) return [];

  // Split by comma and clean up each name
  const names = castString
    .split(',')
    .map(name => name.trim())
    .filter(name => name.length > 0);

  // Match names to cast member records, create placeholders if not found
  const castMembers: CastMember[] = [];
  for (const name of names) {
    const member = cast.find(c => c.name === name);
    if (member) {
      castMembers.push(member);
    } else {
      // Create placeholder cast member for names not in cast.ts
      console.warn(`Cast member not found in cast.ts: ${name} - creating placeholder`);
      castMembers.push({
        name,
        status: 'a',
        url: '',
        season: 1,
        season_start: 1975,
        gender: undefined,
        total_seasons: 1,
        cat: 'unknown',
        period: 0,
        color: '#888888',
        bio: ''
      });
    }
  }

  return castMembers;
}

/**
 * Parses cast data and organizes it by season with transition information
 * Uses seasons.csv as the source of truth for which cast members are in each season
 */
export function parseSeasonData(): SeasonWithCast[] {
  const seasons: SeasonWithCast[] = [];

  for (let i = 0; i < seasonsData.length; i++) {
    const seasonData = seasonsData[i];
    const seasonNum = seasonData.season;

    // Parse cast members from seasons.csv cast field
    // Season data comes directly from cast.csv now
    const seasonCast = parseCastNames(seasonData.cast || '');

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

    seasons.push({
      season: seasonNum,
      year: `${yearStart}-${yearEnd}`,
      yearStart,
      yearEnd,
      cast: seasonCast,
      newCast,
      departingCast,
      continuingCast,
      anchors: seasonData.anchors || '',
      tagline: seasonData.tagline || '',
      summary: seasonData.summary || '',
      hosts: seasonData.hosts || '',
      music: seasonData.music || '',
      sketches: seasonData.sketches || ''
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
  // Match Python's name_to_slug logic: remove periods and apostrophes, replace spaces with dashes
  return name.toLowerCase().replace(/\./g, '').replace(/'/g, '').replace(/\s+/g, '-') + ' bw.png';
}

/**
 * Finds a cast member by name
 */
export function findCastMember(name: string): CastMember | undefined {
  return cast.find(member => member.name === name);
}
