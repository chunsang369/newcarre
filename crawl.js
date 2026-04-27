const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('crawled_page.html', 'utf8');
const $ = cheerio.load(html);

// Print first 10 elements with class starting with 'car' or 'list' or 'item'
$('[class*="item"], [class*="list"], [class*="car"], li, div').each((i, el) => {
  const className = $(el).attr('class');
  const text = $(el).text().replace(/\s+/g, ' ').trim();
  if (text.includes('만원') && text.length < 200 && i < 50) {
    console.log(`Class: ${className} | Text: ${text}`);
  }
});
