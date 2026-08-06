const fs = require('fs');
const cheerio = require('cheerio');

const content = fs.readFileSync('scratch/detail_rent_rendered.html', 'utf8');
const $ = cheerio.load(content);

console.log('--- ALL INPUTS ---');
$('input').each((i, el) => {
  const name = $(el).attr('name');
  const value = $(el).attr('value');
  const type = $(el).attr('type');
  const id = $(el).attr('id');
  const labelText = $(el).closest('label').text().trim();
  console.log(`Type: ${type}, Name: ${name}, Value: ${value}, Label: "${labelText}", ID: ${id}`);
});
