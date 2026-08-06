const fs = require('fs');
const cheerio = require('cheerio');

const content = fs.readFileSync('scratch/detail_rent_rendered.html', 'utf8');
const $ = cheerio.load(content);

// 642,540 텍스트가 있는 모든 엘리먼트의 상세 마크업 출력
console.log('--- Price 642,540 Elements ---');
$(':contains("642,540")').each((i, el) => {
  if ($(el).children().length === 0 || $(el).clone().children().remove().end().text().includes('642,540')) {
    console.log(`Tag: ${el.tagName}, Class: ${$(el).attr('class') || ''}`);
    console.log('HTML:', $.html(el));
    console.log('Parent HTML:', $.html($(el).parent()).substring(0, 400));
    console.log('------------------------------------');
  }
});
