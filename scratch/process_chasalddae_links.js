const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('scratch/chasalddae_links.json', 'utf8'));
const uniqueCars = new Map();

for (const item of rawData) {
  const match = item.href.match(/trim_id=(\d+)/);
  if (!match) continue;
  
  const trimId = match[1];
  if (uniqueCars.has(trimId)) continue;
  
  const lines = item.text.split('\n').filter(l => l.trim().length > 0);
  // Example text:
  // "견적 ON"
  // "기아 EV5 GT"
  // "2026년형 전기 AWD (개별소비세 5%) GT (자동)"
  // "월 렌트"
  // "739,270"
  // "원~"
  // "월 리스"
  // "572,129"
  // "원~"
  
  if (lines.length < 3) continue;
  
  const fullName = lines[1]; // e.g. "기아 EV5 GT", "테슬라 Model Y Juniper", "현대 디 올 뉴 팰리세이드"
  let brand = "";
  let modelName = fullName;
  
  // Extract brand from full name
  const brands = [
    "현대", "기아", "제네시스", "르노코리아", "쉐보레", "KG모빌리티",
    "벤츠", "BMW", "아우디", "폭스바겐", "푸조", "미니", "볼보", 
    "랜드로버", "테슬라", "토요타", "렉서스", "지프", "폴스타", "캐딜락", "혼다", "BYD"
  ];
  
  for (const b of brands) {
    if (fullName.startsWith(b)) {
      brand = b;
      modelName = fullName.substring(b.length).trim();
      break;
    }
  }
  
  uniqueCars.set(trimId, {
    trimId,
    brand,
    modelName,
    fullName,
    summary: lines[2]
  });
}

const result = Array.from(uniqueCars.values());
fs.writeFileSync('scratch/chasalddae_list_clean.json', JSON.stringify(result, null, 2));
console.log(`Saved ${result.length} unique cars to scratch/chasalddae_list_clean.json`);
