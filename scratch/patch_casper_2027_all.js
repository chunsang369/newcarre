const fs = require('fs');

const path = 'prisma/car-data.ts';
let content = fs.readFileSync(path, 'utf-8');

const slug = 'hyundai-casper-electric';
const carIndex = content.indexOf(`"slug": "${slug}"`);

if (carIndex === -1) {
  console.error(`Slug ${slug} not found`);
  process.exit(1);
}

const nextCarIndex = content.indexOf(`"slug":`, carIndex + 50);
let section = content.substring(carIndex, nextCarIndex);

// 1. 기본 정보 수정 (2025년형 -> 2027년형)
section = section.replace(/"trimName":\s*"2025년형"/, '"trimName": "2027년형"');
section = section.replace(/"year":\s*2025/, '"year": 2027');
section = section.replace(/"basePrice":\s*29360000/, '"basePrice": 29950000');
section = section.replace(/"name":\s*"2026년형 전기 2WD \(개별소비세 5%\)"/, '"name": "2027년형 전기 2WD (개별소비세 5%)"');

// 2. 트림 가격 수정
// 1_1 프리미엄
section = section.replace(/"idx":\s*"1_1",\s*"name":\s*"프리미엄 \(자동\)",\s*"price":\s*29360000/, '"idx": "1_1",\n              "name": "프리미엄 (자동)",\n              "price": 29950000');
// 1_2 인스퍼레이션
section = section.replace(/"idx":\s*"1_2",\s*"name":\s*"인스퍼레이션\(자동\)",\s*"price":\s*33040000/, '"idx": "1_2",\n              "name": "인스퍼레이션(자동)",\n              "price": 33790000');
// 1_3 크로스
section = section.replace(/"idx":\s*"1_3",\s*"name":\s*"크로스 \(자동\)",\s*"price":\s*35150000/, '"idx": "1_3",\n              "name": "크로스 (자동)",\n              "price": 35900000');
// 1_4 라운지
section = section.replace(/"idx":\s*"1_4",\s*"name":\s*"라운지 \(자동\)",\s*"price":\s*36410000/, '"idx": "1_4",\n              "name": "라운지 (자동)",\n              "price": 36370000');

// 3. priceMatrix 교체
const matrixStartLabel = section.indexOf('"priceMatrix":');
if (matrixStartLabel === -1) {
  console.error(`priceMatrix not found for ${slug}`);
  process.exit(1);
}

const braceStart = section.indexOf('{', matrixStartLabel);

let openBraces = 0;
let braceEnd = -1;
for (let i = braceStart; i < section.length; i++) {
  if (section[i] === '{') openBraces++;
  else if (section[i] === '}') {
    openBraces--;
    if (openBraces === 0) {
      braceEnd = i;
      break;
    }
  }
}

if (braceEnd === -1) {
  console.error(`Closing brace for priceMatrix not found for ${slug}`);
  process.exit(1);
}

// 2027년형 신규 가격 로드
const newPrices = JSON.parse(fs.readFileSync('scratch/casper_2027_prices.json', 'utf-8'));

const formattedMatrix = JSON.stringify(newPrices, null, 2)
  .split('\n')
  .map((line, idx) => idx === 0 ? line : '      ' + line)
  .join('\n');

section = section.substring(0, braceStart) + formattedMatrix + section.substring(braceEnd + 1);

// 전체 파일 결합 및 저장
content = content.substring(0, carIndex) + section + content.substring(nextCarIndex);
fs.writeFileSync(path, content, 'utf-8');

console.log('Successfully patched prisma/car-data.ts for 2027 Casper Electric!');
