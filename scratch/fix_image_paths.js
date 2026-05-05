const fs = require('fs');
const path = require('path');

// Go up one level to reach the root, then into prisma
const filePath = path.join(__dirname, '..', 'prisma', 'car-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

const HICARZ_BASE = 'https://m.hicarzautoplan.com';

// Replace relative paths with absolute Hicarz URLs
// Also normalize double slashes like //data//car
content = content.replace(/"imageUrl":\s*"(\/data\/[^"]+)"/g, (match, p1) => {
  const normalized = p1.replace(/\/\//g, '/');
  return `"imageUrl": "${HICARZ_BASE}${normalized}"`;
});

fs.writeFileSync(filePath, content);
console.log('✅ Successfully updated all car image paths to absolute URLs.');
