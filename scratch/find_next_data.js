const fs = require('fs');
const cheerio = require('cheerio');

const content = fs.readFileSync('C:\\Users\\user\\.gemini\\antigravity\\brain\\be94b7ad-2e91-40ae-9942-619adea1027f\\.system_generated\\steps\\6\\content.md', 'utf8');
const $ = cheerio.load(content);

// 1. __NEXT_DATA__ script tag check
const nextDataText = $('#__NEXT_DATA__').html();
if (nextDataText) {
  console.log('Found __NEXT_DATA__!');
  fs.writeFileSync('scratch/next_data.json', nextDataText);
  console.log('Saved to scratch/next_data.json');
} else {
  console.log('__NEXT_DATA__ not found.');
}

// 2. self.__next_f.push scripts check
const nextF = [];
$('script').each((i, el) => {
  const text = $(el).html() || '';
  if (text.includes('self.__next_f.push')) {
    nextF.push(text);
  }
});
console.log(`Found ${nextF.length} self.__next_f.push scripts.`);
if (nextF.length > 0) {
  fs.writeFileSync('scratch/next_f.txt', nextF.join('\n\n'));
  console.log('Saved to scratch/next_f.txt');
}
