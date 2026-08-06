const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\user\\.gemini\\antigravity\\brain\\1226b231-3802-4252-98c4-9fad5a759c70\\.system_generated\\steps\\30\\content.md', 'utf8');

// 이용기간, 주행거리, 선수금, 보증금 근처의 HTML 태그 출력
const keywords = ['이용기간', '주행거리(연간 km)', '선수금', '보증금'];

keywords.forEach(kw => {
  console.log(`\n================= KEYWORD: ${kw} =================`);
  let idx = 0;
  while ((idx = content.indexOf(kw, idx)) !== -1) {
    console.log(`--- Match at index ${idx} ---`);
    console.log(content.substring(idx - 100, idx + 800));
    idx += kw.length;
  }
});
