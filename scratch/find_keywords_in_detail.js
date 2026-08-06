const fs = require('fs');

const content = fs.readFileSync('C:\\Users\\user\\.gemini\\antigravity\\brain\\be94b7ad-2e91-40ae-9942-619adea1027f\\.system_generated\\steps\\6\\content.md', 'utf8');

// 찾아보고자 하는 키워드들
const keywords = [
  '36개월', '48개월', '60개월', 
  '1만', '2만', '3만',
  '선수금', '보증금', '무보증',
  '렌트', '리스',
  '대여료', '월 납입', '납입금'
];

keywords.forEach(kw => {
  let idx = 0;
  let matches = 0;
  console.log(`\n--- Keyword: ${kw} ---`);
  while ((idx = content.indexOf(kw, idx)) !== -1) {
    matches++;
    if (matches <= 5) {
      console.log(`[Match ${matches}] ...${content.substring(idx - 60, idx + 100).replace(/\n/g, ' ')}...`);
    }
    idx += kw.length;
  }
  console.log(`Total matches: ${matches}`);
});
