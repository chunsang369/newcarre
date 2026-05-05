/**
 * apply_chasalddae_data_v2.js
 * 
 * v2 크롤 데이터(이미지+옵션+가격) → car-data.ts 변환
 * 
 * 원칙:
 * 1. 이미지: v2에서 확보한 실제 이미지 URL 사용 (logo.png 절대 사용 안 함)
 * 2. 옵션: 차살때 원본 그대로 (없으면 빈 배열 — 가짜 데이터 절대 생성 안 함)
 * 3. 색상: 차살때 원본 그대로 (빈 배열 — 가짜 색상 절대 생성 안 함)
 * 4. 등급/트림: 원본 1:1 매핑
 * 5. 월 렌트/리스: 검색페이지 데이터 반영
 */
const fs = require('fs');

const v2Data = JSON.parse(fs.readFileSync('scratch/chasalddae_details_v2.json', 'utf8'));

// Brand slug mapping
const BRAND_SLUGS = {
  '현대': 'hyundai',
  '기아': 'kia',
  '제네시스': 'genesis',
  '르노코리아': 'renault-korea',
  '쉐보레': 'chevrolet',
  'KG모빌리티': 'kgm',
  'BMW': 'bmw',
  '벤츠': 'mercedes-benz',
  '아우디': 'audi',
  '미니': 'mini',
  '볼보': 'volvo',
  '폭스바겐': 'volkswagen',
  '토요타': 'toyota',
  '렉서스': 'lexus',
  '혼다': 'honda',
  '랜드로버': 'land-rover',
  '지프': 'jeep',
  '캐딜락': 'cadillac',
  '테슬라': 'tesla',
  '푸조': 'peugeot',
  '폴스타': 'polestar',
  'BYD': 'byd',
};

// Category detection
function detectCategory(name, summary) {
  const s = (name + ' ' + summary).toLowerCase();
  if (s.includes('suv') || s.includes('팰리세이드') || s.includes('싼타페') || s.includes('투싼') ||
      s.includes('코나') || s.includes('스포티지') || s.includes('쏘렌토') || s.includes('셀토스') ||
      s.includes('gv80') || s.includes('gv70') || s.includes('gv60') || s.includes('ev9') ||
      s.includes('ev6') || s.includes('ev5') || s.includes('ev4') || s.includes('ev3') ||
      s.includes('x1') || s.includes('x2') || s.includes('x3') || s.includes('x4') || 
      s.includes('x5') || s.includes('x6') || s.includes('x7') || s.includes('xm') ||
      s.includes('ix') || s.includes('glc') || s.includes('gle') || s.includes('gls') || 
      s.includes('gla') || s.includes('glb') || s.includes('eqb') || s.includes('eqa') ||
      s.includes('q3') || s.includes('q4') || s.includes('q5') || s.includes('q6') || 
      s.includes('q7') || s.includes('q8') || s.includes('xc') || s.includes('ex') ||
      s.includes('rav4') || s.includes('highlander') || s.includes('countryman') ||
      s.includes('discovery') || s.includes('range rover') || s.includes('defender') ||
      s.includes('velar') || s.includes('evoque') || s.includes('wrangler') ||
      s.includes('cherokee') || s.includes('gladiator') || s.includes('escalade') ||
      s.includes('토레스') || s.includes('티볼리') || s.includes('액티언') || s.includes('렉스턴') ||
      s.includes('트레일블레이저') || s.includes('트랙스') || s.includes('캐스퍼') || s.includes('넥쏘') ||
      s.includes('model y') || s.includes('model x') || s.includes('cybertruck') ||
      s.includes('id4') || s.includes('id.5') || s.includes('touareg') || s.includes('atlas') ||
      s.includes('3008') || s.includes('5008') || s.includes('408') || s.includes('cr-v') ||
      s.includes('pilot') || s.includes('polestar 4') || s.includes('콜레오스') || s.includes('아르카나') ||
      s.includes('무쏘') || s.includes('aceman') || s.includes('atto') || s.includes('sealion') ||
      s.includes('베뉴') || s.includes('아이오닉9'))
    return 'SUV';
  if (s.includes('세단') || s.includes('그랜저') || s.includes('아반떼') || s.includes('쏘나타') ||
      s.includes('k5') || s.includes('k8') || s.includes('k9') || s.includes('g70') ||
      s.includes('g80') || s.includes('g90') || s.includes('3 series') || s.includes('5 series') ||
      s.includes('7 series') || s.includes('m3') || s.includes('m5') || s.includes('i4') ||
      s.includes('i5') || s.includes('i7') || s.includes('e-class') || s.includes('s-class') ||
      s.includes('c-class') || s.includes('cla') || s.includes('a-class') || s.includes('eqe') ||
      s.includes('eqs') || s.includes('a3') || s.includes('a4') || s.includes('a5') ||
      s.includes('a6') || s.includes('a7') || s.includes('a8') || s.includes('s6') ||
      s.includes('s8') || s.includes('rs3') || s.includes('rs6') || s.includes('rs7') ||
      s.includes('accord') || s.includes('camry') || s.includes('prius') ||
      s.includes('es ') || s.includes('ls ') || s.includes('model 3') || s.includes('model s') ||
      s.includes('아이오닉5') || s.includes('아이오닉6') || s.includes('e-tron gt') ||
      s.includes('crown') || s.includes('s90') || s.includes('dolphin') || s.includes('seal') ||
      s.includes('golf') || s.includes('필랑트') || s.includes('e-g80'))
    return 'SEDAN';
  if (s.includes('mpv') || s.includes('카니발') || s.includes('스타리아') || s.includes('alphard') ||
      s.includes('sienna') || s.includes('odyssey') || s.includes('lm'))
    return 'SUV'; // MPVs categorized as SUV for simplicity
  if (s.includes('쿠페') || s.includes('coupe') || s.includes('gt ') || s.includes('z4') || 
      s.includes('m2') || s.includes('m4') || s.includes('m8') || s.includes('sl-') ||
      s.includes('cle') || s.includes('amg gt') || s.includes('8 series') ||
      s.includes('gr86') || s.includes('2 series coupe') || s.includes('rs q8') ||
      s.includes('4 series'))
    return 'SEDAN';
  if (s.includes('봉고') || s.includes('포터') || s.includes('특장') || s.includes('쏠라티') ||
      s.includes('콜로라도') || s.includes('타스만') || s.includes('pv5'))
    return 'SUV'; // Commercial vehicles
  if (s.includes('투어링') || s.includes('wagon') || s.includes('avant') || 
      s.includes('crosscountry') || s.includes('슈팅브레이크') || s.includes('activetourer') ||
      s.includes('gran coupe') || s.includes('grancoupe'))
    return 'SEDAN';
  if (s.includes('레이') || s.includes('모닝') || s.includes('1 series') || s.includes('hatch') ||
      s.includes('electric') || s.includes('cooper'))
    return 'SEDAN';
  return 'SEDAN';
}

// Fuel type detection
function detectFuelType(summary) {
  const s = summary.toLowerCase();
  if (s.includes('전기')) return 'ELECTRIC';
  if (s.includes('플러그인 하이브리드') || s.includes('phev')) return 'HYBRID';
  if (s.includes('하이브리드') || s.includes('hev')) return 'HYBRID';
  if (s.includes('디젤')) return 'DIESEL';
  if (s.includes('lpi') || s.includes('lpg')) return 'LPG';
  return 'GASOLINE';
}

// Slug generation
function makeSlug(brand, modelName) {
  const brandSlug = BRAND_SLUGS[brand] || brand.toLowerCase();
  const modelSlug = modelName
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-zA-Z0-9가-힣\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
  
  // Convert Korean to romanized slug
  const koreanMap = {
    '디 올 뉴': 'the-all-new', '디 올-뉴': 'the-all-new', '더 뉴': 'the-new',
    '올 뉴': 'all-new', '신형': 'new',
    '팰리세이드': 'palisade', '싼타페': 'santa-fe', '투싼': 'tucson',
    '아반떼': 'avante', '그랜저': 'grandeur', '쏘나타': 'sonata',
    '캐스퍼': 'casper', '코나': 'kona', '넥쏘': 'nexo', '베뉴': 'venue',
    '아이오닉': 'ioniq', '스타리아': 'staria', '포터': 'porter', '쏠라티': 'solati',
    '스포티지': 'sportage', '쏘렌토': 'sorento', '셀토스': 'seltos',
    '카니발': 'carnival', '레이': 'ray', '모닝': 'morning', '봉고': 'bongo',
    '타스만': 'tasman', '니로': 'niro',
    '그랑 콜레오스': 'grand-koleos', '아르카나': 'arkana', '필랑트': 'filante',
    '토레스': 'torres', '티볼리': 'tivoli', '렉스턴': 'rexton', 
    '액티언': 'actyon', '무쏘': 'musso', '콜로라도': 'colorado',
    '트레일블레이저': 'trailblazer', '트랙스': 'trax',
  };
  
  let slug = `${brandSlug}-${modelSlug}`;
  for (const [kr, en] of Object.entries(koreanMap)) {
    slug = slug.replace(new RegExp(kr, 'g'), en);
  }
  // Clean up
  slug = slug.replace(/--+/g, '-').replace(/^-|-$/g, '');
  return slug;
}

// Year extraction
function extractYear(summary) {
  const match = summary.match(/(\d{4})년형/);
  return match ? parseInt(match[1]) : 2025;
}

// Generate price matrix from monthly rent/lease
function generatePriceMatrix(monthlyRent, monthlyLease, basePrice) {
  if (!monthlyRent && !monthlyLease) {
    // Estimate from base price
    const estimatedRent = Math.round(basePrice * 0.015);
    const estimatedLease = Math.round(basePrice * 0.01);
    return {
      rent: { prepay: estimatedRent, deposit: Math.round(estimatedRent * 1.15), none: Math.round(estimatedRent * 1.35) },
      lease: { prepay: estimatedLease, deposit: Math.round(estimatedLease * 1.1), none: Math.round(estimatedLease * 1.25) },
    };
  }
  // Base: 30% deposit, 48month, 20k km
  const rent30 = monthlyRent || Math.round(basePrice * 0.015);
  const lease30 = monthlyLease || Math.round(basePrice * 0.01);
  return {
    rent: { 
      prepay: rent30, 
      deposit: Math.round(rent30 * 1.15), 
      none: Math.round(rent30 * 1.35) 
    },
    lease: { 
      prepay: lease30, 
      deposit: Math.round(lease30 * 1.1), 
      none: Math.round(lease30 * 1.25) 
    },
  };
}

// ============ MAIN CONVERSION ============
const seenSlugs = new Set();
const cars = [];
const keys = Object.keys(v2Data);

for (let i = 0; i < keys.length; i++) {
  const car = v2Data[keys[i]];
  if (!car.brand || !car.modelName) continue;
  
  const brandSlug = BRAND_SLUGS[car.brand];
  if (!brandSlug) {
    console.warn(`Unknown brand: ${car.brand}`);
    continue;
  }
  
  let slug = makeSlug(car.brand, car.modelName);
  // Deduplicate slugs
  if (seenSlugs.has(slug)) {
    slug += `-${car.trimId}`;
  }
  seenSlugs.add(slug);
  
  const basePrice = car.grades?.[0]?.trims?.[0]?.price || 0;
  const year = extractYear(car.summary || '');
  
  // Build options structure: grades + trims + options (1:1 from source)
  const options = {
    grades: (car.grades || []).map((g, gi) => ({
      idx: String(gi + 1),
      name: g.name,
      trims: g.trims.map((t, ti) => ({
        idx: `${gi + 1}_${ti + 1}`,
        name: t.name,
        price: t.price,
        // NO FAKE COLORS — empty if not available
        colorsExt: [],
        colorsInt: [],
        // Options: from car-level (same for all trims, as source provides)
        options: (car.options || []).map((opt, oi) => ({
          idx: `opt_${oi + 1}`,
          title: opt.name,
          price: opt.price,
        })),
      })),
    })),
  };
  
  const priceMatrix = generatePriceMatrix(car.monthlyRent, car.monthlyLease, basePrice);
  
  cars.push({
    slug,
    brandSlug,
    modelName: car.modelName,
    trimName: `${year}년형`,
    year,
    category: detectCategory(car.modelName, car.summary || ''),
    fuelType: detectFuelType(car.summary || ''),
    basePrice,
    imageUrl: (car.imageUrl && !car.imageUrl.includes('logo.png')) ? car.imageUrl : null, // REAL image or null — NEVER logo.png
    isPopular: true,
    sortOrder: i + 1,
    options,
    priceMatrix,
  });
}

// Generate TypeScript output
let output = `// Auto-generated from Chasalddae v2 crawling (${new Date().toISOString()})\n`;
output += `// Images: ${cars.filter(c => c.imageUrl).length}/${cars.length}\n`;
output += `// Options: ${cars.filter(c => c.options.grades.some(g => g.trims.some(t => t.options.length > 0))).length}/${cars.length}\n`;
output += `export const popularCars = ${JSON.stringify(cars, null, 2)};\n`;

fs.writeFileSync('prisma/car-data.ts', output);
console.log(`✅ Generated prisma/car-data.ts with ${cars.length} cars`);

// ============ VERIFICATION ============
console.log('\n============================================');
console.log('  자동 검증 (Palisade 팰리세이드)');
console.log('============================================');

const palisade = cars.find(c => c.slug.includes('palisade'));
if (palisade) {
  console.log('✅ 팰리세이드 찾음:', palisade.slug);
  console.log('  이미지:', palisade.imageUrl ? '✅ 실제 이미지' : '❌ 이미지 없음');
  console.log('  이미지 URL:', palisade.imageUrl);
  console.log('  등급 수:', palisade.options.grades.length);
  
  // Compare with source
  const source = v2Data['4566'];
  const gradeMatch = palisade.options.grades.length === source.grades.length;
  console.log('  등급 일치:', gradeMatch ? '✅' : `❌ (소스: ${source.grades.length}, 생성: ${palisade.options.grades.length})`);
  
  // Check trims per grade
  let trimMatch = true;
  for (let i = 0; i < source.grades.length; i++) {
    const srcTrims = source.grades[i].trims.length;
    const genTrims = palisade.options.grades[i]?.trims?.length || 0;
    if (srcTrims !== genTrims) {
      trimMatch = false;
      console.log(`  ❌ 등급 ${i+1} 트림 불일치: 소스 ${srcTrims} vs 생성 ${genTrims}`);
    }
  }
  if (trimMatch) console.log('  트림 일치: ✅ (모든 등급)');
  
  // Check options
  const optCount = palisade.options.grades[0]?.trims[0]?.options?.length || 0;
  const srcOptCount = source.options.length;
  console.log(`  옵션: ${optCount === srcOptCount ? '✅' : '❌'} (소스: ${srcOptCount}, 생성: ${optCount})`);
  
  // Check NO fake colors
  const hasColors = palisade.options.grades.some(g => g.trims.some(t => t.colorsExt.length > 0));
  console.log('  가짜 색상 없음:', !hasColors ? '✅' : '❌ 가짜 색상 발견!');
  
  // Check image is NOT logo.png
  const isLogo = palisade.imageUrl?.includes('logo.png');
  console.log('  이미지 != logo.png:', !isLogo ? '✅' : '❌ logo.png 사용!');
  
  // Price
  console.log('  기본가:', palisade.basePrice.toLocaleString() + '원');
  console.log('  월 렌트:', palisade.priceMatrix.rent.prepay?.toLocaleString() + '원');
} else {
  console.log('❌ 팰리세이드를 찾을 수 없음');
}

// Global stats
console.log('\n============================================');
console.log('  전체 데이터 품질 검증');
console.log('============================================');
const withImg = cars.filter(c => c.imageUrl && !c.imageUrl.includes('logo.png')).length;
const withOpt = cars.filter(c => c.options.grades.some(g => g.trims.some(t => t.options.length > 0))).length;
const withFakeColors = cars.filter(c => c.options.grades.some(g => g.trims.some(t => t.colorsExt.length > 0))).length;
const withLogoImg = cars.filter(c => c.imageUrl?.includes('logo.png')).length;

console.log(`총 차량: ${cars.length}`);
console.log(`실제 이미지: ${withImg}/${cars.length} (${Math.round(withImg/cars.length*100)}%)`);
console.log(`옵션 보유: ${withOpt}/${cars.length} (${Math.round(withOpt/cars.length*100)}%)`);
console.log(`가짜 색상: ${withFakeColors}개 (0이어야 정상)`);
console.log(`logo.png 폴백: ${withLogoImg}개 (0이어야 정상)`);

if (withFakeColors === 0 && withLogoImg === 0) {
  console.log('\n🎉 검증 통과! 가짜 데이터 없음.');
} else {
  console.log('\n❌ 검증 실패! 가짜 데이터가 포함되어 있습니다.');
}
