const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\user\\.gemini\\antigravity\\brain\\1226b231-3802-4252-98c4-9fad5a759c70\\.system_generated\\steps\\30\\content.md', 'utf8');

// HTML 태그 제거 및 텍스트 정리
const cleanText = content.replace(/<[^>]*>/g, ' ');

// 렌트/리스 및 원 관련 단어 매칭
const regexes = [
  /월\s*대여료[^\d]*([\d,]+)/i,
  /월\s*리스료[^\d]*([\d,]+)/i,
  /월\s*렌트료[^\d]*([\d,]+)/i,
  /월\s*납입료[^\d]*([\d,]+)/i,
  /최종\s*대여료[^\d]*([\d,]+)/i,
  /리스[^\d]*([\d,]+)\s*원/i,
  /렌트[^\d]*([\d,]+)\s*원/i,
  /([\d,]+)\s*원/g
];

console.log('--- 정규식 매칭 시도 ---');
for (const rx of regexes) {
  if (rx.global) {
    const matches = [...cleanText.matchAll(rx)];
    console.log(`${rx}: ${matches.slice(0, 20).map(m => m[0]).join(' | ')}`);
  } else {
    const match = cleanText.match(rx);
    console.log(`${rx}: ${match ? match[0] : '없음'}`);
  }
}

// 텍스트 일부를 잘라서 출력해보기
console.log('--- 텍스트 조각 ---');
const words = ['리스', '렌트', '대여료', '납입료', '인스퍼레이션', '5065'];
for (const word of words) {
  let idx = cleanText.indexOf(word);
  if (idx !== -1) {
    console.log(`[${word}] 근처: ${cleanText.substring(Math.max(0, idx - 50), Math.min(cleanText.length, idx + 100))}`);
  }
}
