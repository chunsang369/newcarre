const fs = require('fs');
const html = fs.readFileSync('crawled_page.html', 'utf-8');
const matches = [...html.matchAll(/name=["']([^"']+)["']/g)].map(m => m[1]);
const uniqueMatches = Array.from(new Set(matches));
console.log(uniqueMatches.filter(m => m.toLowerCase().includes('opt')).join('\n'));
