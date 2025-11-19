import { readFileSync } from 'fs';

// Read cast.csv
const castCsv = readFileSync('./src/data/cast.csv', 'utf-8');
const castLines = castCsv.split('\n').slice(1); // Skip header
const castNames = new Set();

castLines.forEach(line => {
  const parts = line.split('\t');
  if (parts[1]) {
    castNames.add(parts[1].trim());
  }
});

console.log(`Found ${castNames.size} cast members in cast.csv`);

// Read seasons.csv
const seasonsCsv = readFileSync('./src/data/seasons.csv', 'utf-8');
const seasonsLines = seasonsCsv.split('\n').slice(1); // Skip header

const allSeasonCast = new Set();

seasonsLines.forEach(line => {
  const parts = line.split('\t');
  if (parts[2]) { // cast column
    const names = parts[2].split(',').map(n => n.trim());
    names.forEach(name => {
      if (name) {
        allSeasonCast.add(name);
      }
    });
  }
});

console.log(`Found ${allSeasonCast.size} unique cast members in seasons.csv`);

// Find missing cast members
const missingCast = [];
allSeasonCast.forEach(name => {
  if (!castNames.has(name)) {
    missingCast.push(name);
  }
});

console.log(`\nMissing cast members (${missingCast.length}):`);
missingCast.sort().forEach(name => {
  console.log(`  - ${name}`);
});
