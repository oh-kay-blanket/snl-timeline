import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the cast.ts file
const castFile = fs.readFileSync(path.join(__dirname, '../src/data/cast.ts'), 'utf-8');

// Read the sprites96.ts file
const spritesFile = fs.readFileSync(path.join(__dirname, '../src/data/sprites96.ts'), 'utf-8');

// Extract all names from cast.ts
const nameMatches = castFile.match(/name: "([^"]+)"/g);
const castNames = nameMatches ? nameMatches.map(m => m.match(/name: "([^"]+)"/)[1]) : [];

// Function to convert name to slug
function nameToSlug(name) {
  return name
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/'/g, '')
    .replace(/\s+/g, '-');
}

// Extract existing sprite keys
const spriteMatches = spritesFile.match(/'([^']+)'/g);
const existingSprites = spriteMatches ? spriteMatches.map(m => m.replace(/'/g, '')) : [];

// Create a map of cast names to slugs
const castSlugs = castNames.map(name => ({
  name,
  slug: nameToSlug(name),
  hasSprite: existingSprites.some(sprite => sprite.includes(nameToSlug(name)))
}));

// Filter missing and existing
const missing = castSlugs.filter(c => !c.hasSprite);
const existing = castSlugs.filter(c => c.hasSprite);

console.log('=== CAST MEMBER HEADSHOT STATUS ===\n');
console.log(`Total cast members: ${castNames.length}`);
console.log(`Have headshots: ${existing.length}`);
console.log(`Missing headshots: ${missing.length}\n`);

if (missing.length > 0) {
  console.log('=== MISSING HEADSHOTS ===');
  missing.forEach((c, i) => {
    console.log(`${i + 1}. ${c.name} (${c.slug})`);
  });
}

// Write results to JSON for processing
const results = {
  total: castNames.length,
  existing: existing.length,
  missing: missing.length,
  missingList: missing,
  allCast: castSlugs
};

fs.writeFileSync(
  path.join(__dirname, '../headshot-status.json'),
  JSON.stringify(results, null, 2)
);

console.log('\n=== Results saved to headshot-status.json ===');
