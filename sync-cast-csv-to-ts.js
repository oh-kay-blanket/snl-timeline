import { readFileSync, writeFileSync } from 'fs';

// Read cast.csv
const castCsv = readFileSync('./src/data/cast.csv', 'utf-8');
const lines = castCsv.split('\n').slice(1); // Skip header

const castMembers = [];

lines.forEach(line => {
  if (!line.trim()) return;

  const parts = line.split('\t');
  if (parts.length >= 2) {
    const id = parts[0]?.trim();
    const name = parts[1]?.trim();
    const bio = parts[2]?.trim() || '';
    const season = parts[3] ? parseInt(parts[3].trim()) : 1;
    const season_start = parts[4] ? parseInt(parts[4].trim()) : 1975;
    const total_seasons = parts[5] ? parseInt(parts[5].trim()) : 1;

    if (name) {
      castMembers.push({ id, name, bio, season, season_start, total_seasons });
    }
  }
});

console.log(`Found ${castMembers.length} cast members in cast.csv`);

// Generate cast.ts
let tsContent = `import type { CastMember } from '../types';

export const cast: CastMember[] = [\n`;

castMembers.forEach(member => {
  // Use JSON.stringify to properly escape all special characters
  const name = JSON.stringify(member.name);
  const bio = JSON.stringify(member.bio);

  tsContent += `  {
    name: ${name},
    status: 'a',
    url: '',
    season: ${member.season},
    season_start: ${member.season_start},
    gender: undefined,
    total_seasons: ${member.total_seasons},
    cat: 'unknown',
    period: 0,
    color: '#888888',
    bio: ${bio}
  },\n`;
});

tsContent += `];\n`;

// Write to cast.ts
writeFileSync('./src/data/cast.ts', tsContent);
console.log('cast.ts has been updated from cast.csv');
