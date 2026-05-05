const fs = require('fs');
const content = fs.readFileSync('scratch/detail_hydration.txt', 'utf8');

// Find all JSON strings or arrays in the payload
// Let's match all substrings that look like JSON arrays or objects
// Or just extract the substrings of parsed Next.js __next_f strings

console.log('Total characters:', content.length);

// Let's grep lines that match option or color or trim
const lines = content.split('\n');
const matchedLines = lines.filter(l => l.includes('trim_') || l.includes('model_') || l.includes('option') || l.includes('color'));

console.log(`Matched ${matchedLines.length} lines.`);
for (let i = 0; i < Math.min(matchedLines.length, 25); i++) {
  console.log(`\n--- Match ${i} ---`);
  console.log(matchedLines[i].substring(0, 1000));
}
