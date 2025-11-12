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

    if (name) {
      castMembers.push({ id, name, bio });
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
    season: 1,
    season_start: 1975,
    gender: undefined,
    total_seasons: 1,
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
