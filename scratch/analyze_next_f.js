const fs = require('fs');

const content = fs.readFileSync('scratch/next_f.txt', 'utf8');

// 정규식으로 self.__next_f.push([1, " ... "]) 또는 self.__next_f.push([0, ...]) 에서 문자열 데이터를 결합합니다.
const regex = /self\.__next_f\.push\(\[\d+,\s*"([\s\S]*?)"\]\)/g;
let match;
let combinedText = '';

while ((match = regex.exec(content)) !== null) {
  // 따옴표와 백슬래시 이스케이프 문자 복원
  let part = match[1]
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\');
  combinedText += part + '\n';
}

fs.writeFileSync('scratch/combined_next_f.txt', combinedText);
console.log('Saved combined text to scratch/combined_next_f.txt');

// 6342에 관련된 텍스트 주변을 찾아봅니다.
const lines = combinedText.split('\n');
const matchingLines = [];
lines.forEach((line, i) => {
  if (line.includes('6342') || line.includes('Premium Long Range') || line.includes('Premium RWD')) {
    matchingLines.push({ lineNum: i + 1, content: line.substring(0, 300) });
  }
});

console.log(`Found ${matchingLines.length} matching lines.`);
console.log(JSON.stringify(matchingLines.slice(0, 10), null, 2));
