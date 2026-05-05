const { chromium } = require('playwright');
const cheerio = require('cheerio');
const zlib = require('zlib');
const fs = require('fs');

const BRANDS = [
  { id: '1', name: '현대', slug: 'hyundai' },
  { id: '2', name: '기아', slug: 'kia' },
  { id: '4', name: '제네시스', slug: 'genesis' },
  { id: '3', name: '르노코리아', slug: 'renault-korea' },
  { id: '5', name: '쉐보레', slug: 'chevrolet' },
  { id: '6', name: 'KGM', slug: 'kgm' },
  { id: '11', name: 'BMW', slug: 'bmw' },
  { id: '12', name: '벤츠', slug: 'mercedes-benz' },
  { id: '13', name: '아우디', slug: 'audi' },
  { id: '14', name: '볼보', slug: 'volvo' },
  { id: '15', name: '렉서스', slug: 'lexus' },
  { id: '16', name: '폭스바겐', slug: 'volkswagen' },
  { id: '17', name: '미니', slug: 'mini' },
  { id: '18', name: '랜드로버', slug: 'land-rover' },
  { id: '19', name: '포르쉐', slug: 'porsche' },
  { id: '20', name: '포드', slug: 'ford' },
  { id: '21', name: '지프', slug: 'jeep' },
  { id: '22', name: '테슬라', slug: 'tesla' },
  { id: '23', name: '토요타', slug: 'toyota' },
  { id: '24', name: '혼다', slug: 'honda' },
  { id: '25', name: '재규어', slug: 'jaguar' },
  { id: '26', name: '캐딜락', slug: 'cadillac' },
  { id: '27', name: '링컨', slug: 'lincoln' },
  { id: '28', name: '푸조', slug: 'peugeot' },
  { id: '29', name: '마세라티', slug: 'maserati' },
  { id: '30', name: '벤틀리', slug: 'bentley' },
  { id: '31', name: '람보르기니', slug: 'lamborghini' },
  { id: '32', name: '페라리', slug: 'ferrari' },
  { id: '33', name: '롤스로이스', slug: 'rolls-royce' },
  { id: '34', name: '애스턴마틴', slug: 'aston-martin' },
  { id: '35', name: '맥라렌', slug: 'mclaren' },
  { id: '36', name: '폴스타', slug: 'polestar' },
  { id: '37', name: '지엠씨', slug: 'gmc' },
  { id: '38', name: '이네오스', slug: 'ineos' },
  { id: '39', name: '로터스', slug: 'lotus' },
  { id: '40', name: 'DS', slug: 'ds' }
];

const SUV_KEYWORDS = [
  '팰리세이드', '싼타페', '투싼', '코나', '베뉴', '캐스퍼', '스포티지', '쏘렌토', '셀토스', '니로', '모하비', '넥쏘',
  'GV60', 'GV70', 'GV80', 'EV3', 'EV6', 'EV9', '아이오닉 5', '아이오닉 9', '코란도 이모션',
  '토레스', '티볼리', '코란도', '렉스턴', '액티언', 
  'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'iX', 'iX1', 'iX3',
  'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class', 'G바겐', 'EQA', 'EQB', 'EQC', 'EQE SUV', 'EQS SUV', 
  'Q2', 'Q3', 'Q4', 'Q5', 'Q7', 'Q8', 'e-tron', 'Q4 e-tron',
  'XC40', 'XC60', 'XC90', 'C40', 'EX30', 'EX90', 
  'Cayenne', 'Macan', 'Levante', 'Grecale', 'DBX', 'Urus', 'Bentayga', 'Cullinan', 
  'Range Rover', 'Defender', 'Discovery', 'Sport', 'Evoque', 'Velar', 
  'Renegade', 'Compass', 'Cherokee', 'Wrangler', 'Gladiator', 
  'Explorer', 'Expedition', 'Bronco', 'Aviator', 'Navigator', 
  'Escalade', 'XT4', 'XT5', 'XT6', 'Lyriq', 
  '2008', '3008', '5008', 'Model Y', 'Model X'
];

const VAN_KEYWORDS = ['스타리아', '쏠라티', '카니발', '오딧세이', '시에나', 'V-Class', '스타렉스'];
const TRUCK_KEYWORDS = ['포터', '봉고', '콜로라도', '실버라도', '시에라', '칸', '스포츠'];
const HATCHBACK_KEYWORDS = ['모닝', '레이'];

function getCategory(name, hicarzLabel) {
  const upperName = name.toUpperCase();
  if (SUV_KEYWORDS.some(k => upperName.includes(k.toUpperCase()))) return 'SUV';
  if (VAN_KEYWORDS.some(k => upperName.includes(k.toUpperCase()))) return 'VAN';
  if (TRUCK_KEYWORDS.some(k => upperName.includes(k.toUpperCase()))) return 'TRUCK';
  if (HATCHBACK_KEYWORDS.some(k => upperName.includes(k.toUpperCase()))) return 'HATCHBACK';
  if (hicarzLabel && hicarzLabel.includes('SUV')) return 'SUV';
  if (hicarzLabel && hicarzLabel.includes('경차')) return 'HATCHBACK';
  return 'SEDAN';
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function safeGoto(page, url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' });
      return true;
    } catch (e) {
      console.log(`      ⚠️ Goto failed (Attempt ${i+1}): ${e.message}`);
      await sleep(2000);
    }
  }
  return false;
}

async function megaCrawl() {
  console.log('🚀 Starting Resilient Mega Crawl v3...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  const OUT_FILE = 'mega_crawled_data.json';
  let allResults = [];
  if (fs.existsSync(OUT_FILE)) {
    try { allResults = JSON.parse(fs.readFileSync(OUT_FILE, 'utf-8')); } catch(e) {}
  }
  
  const processedNames = new Set(allResults.map(r => r.modelName));
  console.log(`Already processed ${processedNames.size} cars.`);

  for (const brand of BRANDS) {
    console.log(`\n📦 Brand: ${brand.name}`);
    
    const listUrl = `https://m.hicarzautoplan.com/cars/index/index/?layout=clear&search[where][idxMaker]=${brand.id}&limit=200&page=1`;
    const ok = await safeGoto(page, listUrl);
    if (!ok) {
      console.error(`  ❌ Failed to load brand list for ${brand.name}`);
      continue;
    }

    const html = await page.content();
    const $ = cheerio.load(html);
    
    const carLinks = [];
    $('.list').each((i, el) => {
      const href = $(el).find('.img a').attr('href');
      const name = $(el).find('.text h3').text().trim();
      if (processedNames.has(name)) return;

      const hicarzLabel = $(el).find('.text p').first().text().trim();
      const thumbnailUrl = $(el).find('.img img').attr('src');
      const yearMatch = name.match(/\d{4}/);
      const year = yearMatch ? parseInt(yearMatch[0]) : 2025;
      const fuels = [];
      if ($(el).find('.gas').length) fuels.push('GASOLINE');
      if ($(el).find('.dis').length) fuels.push('DIESEL');
      if ($(el).find('.hib').length) fuels.push('HYBRID');
      if ($(el).find('.ele').length) fuels.push('EV');
      if ($(el).find('.lpg').length) fuels.push('LPG');

      if (href && href.includes('pack=')) {
        const packMatch = href.match(/pack=([^&]+)/);
        if (packMatch) {
          carLinks.push({ name, year, hicarzLabel, thumbnailUrl, fuels, pack: decodeURIComponent(packMatch[1]) });
        }
      }
    });

    console.log(`  Found ${carLinks.length} new cars for ${brand.name}`);

    for (const carInfo of carLinks) {
      console.log(`  🔍 Detail: ${carInfo.name}`);
      const detailOk = await safeGoto(page, `https://m.hicarzautoplan.com/cars/index/view/?pack=${encodeURIComponent(carInfo.pack)}`);
      if (!detailOk) continue;

      try {
        const buf = Buffer.from(carInfo.pack, 'base64');
        const resStr = zlib.inflateSync(buf).toString();
        const params = JSON.parse(resStr).param;
        const category = getCategory(carInfo.name, carInfo.hicarzLabel);
        const fuelType = carInfo.fuels[0] || 'GASOLINE';

        const treeParams = new URLSearchParams();
        treeParams.append('input[idxMaker]', params.idxMaker);
        treeParams.append('input[idxName]', params.idxName);
        treeParams.append('input[idxModel]', params.idxModel);
        treeParams.append('ajax', 'true');

        const modelDataStr = await page.evaluate(async (p) => {
          try {
            const res = await fetch('/app/nTreeCar/treeCheck/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
              body: p
            });
            return await res.text();
          } catch(e) { return null; }
        }, treeParams.toString());

        if (!modelDataStr) continue;
        const modelData = JSON.parse(modelDataStr);
        const detailedConfig = { grades: [] };
        const grades = modelData.tree?.idxGrade || {};
        let minPrice = Infinity;

        for (const grade of Object.values(grades)) {
          const gradeObj = { idx: grade.idx, name: grade.title, trims: [] };
          const gradeParams = new URLSearchParams(treeParams);
          gradeParams.append('input[idxGrade]', grade.idx);

          const gradeDataStr = await page.evaluate(async (p) => {
            try {
              const res = await fetch('/app/nTreeCar/treeCheck/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, body: p });
              return await res.text();
            } catch(e) { return null; }
          }, gradeParams.toString());

          if (!gradeDataStr) continue;
          const gradeData = JSON.parse(gradeDataStr);
          const trims = gradeData.tree?.idxTrim || {};

          for (const trimInfo of Object.values(trims)) {
            const trimParams = new URLSearchParams(gradeParams);
            trimParams.append('input[idxTrim]', trimInfo.idx);
            trimParams.append('payYear', '36');
            trimParams.append('payAge', '26');
            trimParams.append('_method', 'POST');

            const trimDataStr = await page.evaluate(async (p) => {
              try {
                const res = await fetch('/app/nTreeCar/estimateCheck/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, body: p });
                return await res.text();
              } catch(e) { return null; }
            }, trimParams.toString());
            
            if (!trimDataStr) continue;
            const trimDataJson = JSON.parse(trimDataStr);
            const trimPrice = Number(trimDataJson.info?.priceTotal) || Number(trimInfo.price) || 0;
            if (trimPrice > 0 && trimPrice < minPrice) minPrice = trimPrice;

            const options = [];
            if (trimDataJson.tree?.idxOpt) {
              Object.values(trimDataJson.tree.idxOpt).forEach(opt => {
                options.push({ idx: opt.idx, title: opt.title, price: 0 });
              });
            }

            gradeObj.trims.push({
              idx: trimInfo.idx, name: trimInfo.title, price: trimPrice, options,
              colorsExt: Object.values(trimDataJson.tree?.colorExt || {}).map(c => ({ idx: c.idx || c.title, title: c.title, price: Number(c.price) || 0, thumb: c.thumb ? `https://m.hicarzautoplan.com${c.thumb}` : null })),
              colorsInt: Object.values(trimDataJson.tree?.colorInt || {}).map(c => ({ idx: c.idx || c.title, title: c.title, price: Number(c.price) || 0, thumb: c.thumb ? `https://m.hicarzautoplan.com${c.thumb}` : null }))
            });
          }
          detailedConfig.grades.push(gradeObj);
        }

        const carPrice = minPrice === Infinity ? 0 : minPrice;
        allResults.push({
          brandSlug: brand.slug, modelName: carInfo.name, year: carInfo.year, category, fuelType, basePrice: carPrice,
          thumbnailUrl: carInfo.thumbnailUrl ? `https://m.hicarzautoplan.com${carInfo.thumbnailUrl}` : null,
          detailedConfig
        });
        processedNames.add(carInfo.name);
        fs.writeFileSync(OUT_FILE, JSON.stringify(allResults, null, 2));
        console.log(`    -> Done. Price: ${carPrice}`);
        await sleep(200);
      } catch (e) { console.error(`    -> Error processing ${carInfo.name}:`, e.message); }
    }
    await sleep(1000); // Cool down after brand
  }
  console.log(`\n✅ Mega Crawl v3 Finished!`);
  await browser.close();
}

megaCrawl().catch(console.error);
