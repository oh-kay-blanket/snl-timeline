const fs = require('fs');
const path = require('path');

// Read seasons.csv to calculate cast member data
const seasonsCsvPath = path.join(__dirname, 'src/data/seasons.csv');
const seasonsCsv = fs.readFileSync(seasonsCsvPath, 'utf-8');

// Parse seasons.csv
const seasonLines = seasonsCsv.trim().split('\n').slice(1); // Skip header
const castAppearances = new Map(); // Map<name, season[]>

for (const line of seasonLines) {
  const parts = line.split('\t');
  const season = parseInt(parts[0]);
  const castString = parts[2] || '';

  if (castString) {
    const names = castString.split(',').map(n => n.trim()).filter(n => n);
    for (const name of names) {
      if (!castAppearances.has(name)) {
        castAppearances.set(name, []);
      }
      castAppearances.get(name).push(season);
    }
  }
}

console.log(`Found ${castAppearances.size} cast members across all seasons`);

// Read cast.csv
const castCsvPath = path.join(__dirname, 'src/data/cast.csv');
const castCsv = fs.readFileSync(castCsvPath, 'utf-8');
const castLines = castCsv.trim().split('\n');
const header = castLines[0];

// Process each cast member
const updatedLines = [header + '\tseason\tseason_start\ttotal_seasons'];

for (let i = 1; i < castLines.length; i++) {
  const line = castLines[i];
  if (!line.trim()) continue;

  const parts = line.split('\t');
  const id = parts[0];
  const name = parts[1];
  const bio = parts[2] || '';

  // Calculate season info from seasons.csv
  const appearances = castAppearances.get(name) || [1];
  const firstSeason = Math.min(...appearances);
  const totalSeasons = appearances.length;
  const firstSeasonYear = 1975 + (firstSeason - 1);

  // Add the calculated fields to the line
  updatedLines.push(`${id}\t${name}\t${bio}\t${firstSeason}\t${firstSeasonYear}\t${totalSeasons}`);

  if (!castAppearances.has(name)) {
    console.warn(`Warning: ${name} not found in seasons.csv`);
  }
}

// Write updated cast.csv
const updatedCsv = updatedLines.join('\n') + '\n';
fs.writeFileSync(castCsvPath, updatedCsv);

console.log(`✅ Updated cast.csv with season information for ${updatedLines.length - 1} cast members`);
