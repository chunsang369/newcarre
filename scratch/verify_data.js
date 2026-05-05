// Verify: compare Chasalddae source vs current car-data.ts for Palisade
const fs = require('fs');

// 1. V2 crawled data (source of truth)
const v2 = JSON.parse(fs.readFileSync('scratch/chasalddae_details_v2.json', 'utf8'));
const palisade = v2['4566'];

console.log('============================================');
console.log('  SOURCE (차살때 원본 - trimId 4566)');
console.log('============================================');
console.log('차량:', palisade.fullName);
console.log('이미지:', palisade.imageUrl);
console.log('등급 수:', palisade.grades.length);
palisade.grades.forEach((g, i) => {
  console.log(`  [등급 ${i+1}] ${g.name}`);
  g.trims.forEach(t => {
    console.log(`    - ${t.name}: ${t.price.toLocaleString()}원`);
  });
});
console.log('옵션 수:', palisade.options.length);
palisade.options.forEach(o => {
  console.log(`  - ${o.name}: ${o.price.toLocaleString()}원`);
});
console.log('월 렌트:', palisade.monthlyRent);
console.log('월 리스:', palisade.monthlyLease);

// 2. Current car-data.ts comparison
console.log('\n============================================');
console.log('  LOCAL DB (car-data.ts 현재 상태)');
console.log('============================================');

const carDataRaw = fs.readFileSync('prisma/car-data.ts', 'utf8');

// Find Palisade entries
const slugPattern = /slug.*팰리세이드|slug.*palisade/gi;
const palisadeMatches = carDataRaw.match(slugPattern);
console.log('팰리세이드 slug 매칭:', palisadeMatches ? palisadeMatches.length : 0);

// Find by model name
const modelPattern = /modelName.*팰리세이드/g;
const modelMatches = carDataRaw.match(modelPattern);
console.log('팰리세이드 modelName 매칭:', modelMatches ? modelMatches.length : 0);

// Check how many logo.png images are in car-data
const logoCount = (carDataRaw.match(/logo\.png/g) || []).length;
const totalImages = (carDataRaw.match(/imageUrl/g) || []).length;
console.log(`이미지: ${logoCount}/${totalImages} 가 logo.png 폴백`);

// Check fake color count
const fakeColors = (carDataRaw.match(/스노우 화이트 펄/g) || []).length;
console.log(`가짜 색상 "스노우 화이트 펄" 수:`, fakeColors);

// 3. Discrepancy report
console.log('\n============================================');
console.log('  ❌ 불일치 항목');
console.log('============================================');
console.log('1. 이미지: car-data.ts가 logo.png → 원본은 실제 차량 이미지 존재');
console.log('2. 색상: car-data.ts가 가짜 색상(하드코딩) → 원본에 색상 데이터 없음(정직하게 빈 배열이어야 함)');
console.log('3. 옵션: car-data.ts가 등급 무관하게 동일한 옵션 → 원본은 차량 단위 옵션 10개');
console.log(`4. 등급: 원본 ${palisade.grades.length}개 등급 → car-data.ts 확인 필요`);
console.log('5. 월 렌트/리스: car-data.ts에 없음 → 원본에 있음');

// 4. Full v2 data stats
console.log('\n============================================');
console.log('  V2 전체 데이터 품질 보고');
console.log('============================================');
const keys = Object.keys(v2);
let imgOk=0, optOk=0, gradeOk=0, rentOk=0;
const brandOptions = {};

for (const k of keys) {
  const car = v2[k];
  if (car.imageUrl && !car.imageUrl.includes('logo.png')) imgOk++;
  if (car.options && car.options.length > 0) optOk++;
  if (car.grades && car.grades.length > 0) gradeOk++;
  if (car.monthlyRent) rentOk++;
  
  const brand = car.brand || 'unknown';
  if (!brandOptions[brand]) brandOptions[brand] = {total:0, withOpts:0};
  brandOptions[brand].total++;
  if (car.options && car.options.length > 0) brandOptions[brand].withOpts++;
}

console.log(`이미지: ${imgOk}/${keys.length} (${Math.round(imgOk/keys.length*100)}%)`);
console.log(`옵션: ${optOk}/${keys.length} (${Math.round(optOk/keys.length*100)}%)`);
console.log(`등급: ${gradeOk}/${keys.length} (${Math.round(gradeOk/keys.length*100)}%)`);
console.log(`월렌트: ${rentOk}/${keys.length} (${Math.round(rentOk/keys.length*100)}%)`);

console.log('\n브랜드별 옵션 커버리지:');
Object.entries(brandOptions)
  .sort((a,b) => b[1].total - a[1].total)
  .forEach(([brand, data]) => {
    const pct = Math.round(data.withOpts/data.total*100);
    const status = pct >= 70 ? '✅' : pct >= 30 ? '⚠️' : '❌';
    console.log(`  ${status} ${brand}: ${data.withOpts}/${data.total} (${pct}%)`);
  });
