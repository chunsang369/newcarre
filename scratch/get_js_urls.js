const fs = require('fs');
const html = fs.readFileSync('crawled_page.html', 'utf8');
const matches = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)];
matches.forEach(m => console.log(m[1]));
