const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('scratch/view_page.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- Body Text ---');
console.log($('body').text().replace(/\s+/g, ' ').trim().substring(0, 3000));
