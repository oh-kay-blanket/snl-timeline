const fs = require('fs');

// Read the cast.ts file
const castFileContent = fs.readFileSync('src/data/cast.ts', 'utf8');

// Extract the array content between the opening [ and closing ]
const arrayMatch = castFileContent.match(/export const cast[\s\S]*?\[\s*([\s\S]*)\s*\];?/);
if (!arrayMatch) {
  console.error('Could not parse cast array');
  console.error('File preview:');
  console.error(castFileContent.substring(0, 500));
  process.exit(1);
}

const arrayContent = arrayMatch[1];

// Split into individual cast member objects
// Look for objects that start with { and end with },
const objectRegex = /\{\s*name:\s*'([^']+)'[\s\S]*?\},?(?=\s*(?:\{|$))/g;
const castMembers = [];
const seenNames = new Set();

let match;
while ((match = objectRegex.exec(arrayContent)) !== null) {
  const name = match[1];
  const fullObject = match[0];

  // Only keep the first occurrence of each name
  if (!seenNames.has(name)) {
    seenNames.add(name);
    castMembers.push(fullObject.replace(/,$/, '')); // Remove trailing comma if present
    console.log(`Keeping: ${name}`);
  } else {
    console.log(`Skipping duplicate: ${name}`);
  }
}

// Add Peter Aykroyd if not present
if (!seenNames.has('Peter Aykroyd')) {
  console.log('Adding: Peter Aykroyd');
  castMembers.push(`  {
    name: 'Peter Aykroyd',
    status: 'a',
    url: 'http://www.snlarchives.net/Cast/?PeAy',
    season: 5,
    season_start: 1979,
    gender: 'male',
    total_seasons: 1,
    cat: 'malea',
    period: 0,
    color: '#9bbb9d',
    bio: 'Cast member (1979-1980). Dan Aykroyd\\'s brother. Appeared in Season 5.',
  }`);
}

// Reconstruct the file
const newContent = `import type { CastMember } from '../types';

export const cast: CastMember[] =
[
${castMembers.join(',\n')}
];
`;

// Write back to file
fs.writeFileSync('src/data/cast.ts', newContent, 'utf8');

console.log('\n✅ Deduplication complete!');
console.log(`Kept ${castMembers.length} unique cast members`);
