const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvPath = path.join(__dirname, 'src/data/seasons.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const lines = csvContent.trim().split('\n');
const headers = lines[0].split('\t');

const seasons = [];

for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split('\t');
  const season = {
    season: parseInt(values[0]),
    year: values[1],
    cast: values[2],
    anchors: values[3] || '',
    summary: values[4] || '',
    hosts: values[5] || '',
    music: values[6] || '',
    sketches: values[7] || ''
  };
  seasons.push(season);
}

// Generate TypeScript file
const tsContent = `// Auto-generated from seasons.csv
import type { SeasonData } from '../types';

export const seasonsData: SeasonData[] = ${JSON.stringify(seasons, null, 2)};
`;

// Write to seasons.ts
const tsPath = path.join(__dirname, 'src/data/seasons.ts');
fs.writeFileSync(tsPath, tsContent);

console.log(`✅ Successfully converted ${seasons.length} seasons to seasons.ts`);
