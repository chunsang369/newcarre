const fs = require('fs');
const cheerio = require('cheerio');

const content = fs.readFileSync('scratch/detail_rent_rendered.html', 'utf8');
const $ = cheerio.load(content);

// 1. "36개월" 텍스트를 포함하는 엘리먼트 찾기
console.log('--- 36개월 엘리먼트 ---');
$(':contains("36개월")').each((i, el) => {
  const tagName = el.tagName;
  const classes = $(el).attr('class') || '';
  const html = $(el).clone().children().remove().end().text().trim(); // 자식 제외 텍스트
  if (html === '36개월') {
    console.log(`Tag: ${tagName}, Class: ${classes}, OuterHTML:`, $.html($(el).parent()).substring(0, 300));
  }
});

// 2. "2만" 또는 "2만Km" 텍스트를 포함하는 엘리먼트 찾기
console.log('\n--- 주행거리 엘리먼트 ---');
$(':contains("2만")').each((i, el) => {
  const tagName = el.tagName;
  const classes = $(el).attr('class') || '';
  const html = $(el).clone().children().remove().end().text().trim();
  if (html.includes('2만')) {
    console.log(`Tag: ${tagName}, Class: ${classes}, OuterHTML:`, $.html($(el).parent()).substring(0, 300));
  }
});

// 3. "선수금" 텍스트를 포함하는 엘리먼트 찾기
console.log('\n--- 선수금 엘리먼트 ---');
$(':contains("선수금")').each((i, el) => {
  const tagName = el.tagName;
  const classes = $(el).attr('class') || '';
  const html = $(el).clone().children().remove().end().text().trim();
  if (html === '선수금') {
    console.log(`Tag: ${tagName}, Class: ${classes}, OuterHTML:`, $.html($(el).parent()).substring(0, 300));
  }
});

// 4. "642,540원" 텍스트를 포함하는 엘리먼트 찾기
console.log('\n--- 가격 엘리먼트 ---');
$(':contains("642,540")').each((i, el) => {
  const tagName = el.tagName;
  const classes = $(el).attr('class') || '';
  const html = $(el).clone().children().remove().end().text().trim();
  console.log(`Tag: ${tagName}, Class: ${classes}, Text: ${html}`);
});
