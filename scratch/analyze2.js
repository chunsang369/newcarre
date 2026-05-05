const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('scratch/view_page.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- .car_view ---');
console.log($('.car_view').text().replace(/\s+/g, ' ').trim());

console.log('\n--- .estimate_sec ---');
console.log($('.estimate_sec').text().replace(/\s+/g, ' ').trim());

console.log('\n--- Options structure ---');
$('.option_list li').each((i, el) => {
  console.log($(el).text().replace(/\s+/g, ' ').trim());
});

console.log('\n--- Form structure ---');
$('form input, form select').each((i, el) => {
  console.log($(el).attr('name'), $(el).attr('value'));
});
