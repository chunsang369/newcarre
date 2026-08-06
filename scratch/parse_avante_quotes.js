const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('scratch/avante_quotes_raw.json', 'utf8'));

console.log('총 크롤링 항목 수:', raw.length);

const parsedData = [];

raw.forEach(item => {
  const rawText = item.price.rawText || '';
  
  // '혜택 적용 월 리스' 또는 '혜택 적용 월 렌트' 바로 아래(또는 뒤)의 금액 파싱
  const regex = /(?:혜택 적용 월 리스|혜택 적용 월 렌트|혜택 적용 월 대여료)\s*\n*\s*([\d,]+)\s*원/i;
  const match = rawText.match(regex);
  let priceVal = null;
  if (match) {
    priceVal = parseInt(match[1].replace(/,/g, ''), 10);
  } else {
    // 혜택 적용 월 리스/렌트가 없는 경우 차선책으로 "원"으로 끝나는 가격 중 적절한 값 탐색
    // (예: 리스료가 적혀있을 만한 20~90만원 대의 숫자)
    const allWonMatches = [...rawText.matchAll(/([\d,]+)\s*원/g)].map(m => parseInt(m[1].replace(/,/g, ''), 10));
    // 보통 10만원 ~ 100만원 사이의 값이 월 납입료 후보
    const candidates = allWonMatches.filter(v => v >= 100000 && v <= 1500000);
    if (candidates.length > 0) {
      // 그중 맨 마지막 쪽이 견적 결과 금액일 가능성이 큼
      priceVal = candidates[candidates.length - 1];
    }
  }

  console.log(`[${item.purchaseType}] ${item.period}m | Dist=${item.distance} | Cond=${item.condition.padEnd(8)} => 가격: ${priceVal ? priceVal.toLocaleString() + '원' : '실패'}`);
  parsedData.push({
    purchaseType: item.purchaseType,
    period: item.period,
    distance: item.distance,
    condition: item.condition,
    price: priceVal
  });
});

fs.writeFileSync('scratch/avante_quotes_parsed.json', JSON.stringify(parsedData, null, 2));
console.log('Parsed data saved to scratch/avante_quotes_parsed.json');
