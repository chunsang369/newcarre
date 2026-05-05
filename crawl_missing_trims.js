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
  { id: '23', name: '토요타', slug: 'toyota' }
];

const HICARZ_BASE = 'https://m.hicarzautoplan.com';

function treeToDetailedConfig(tree) {
  const grades = [];
  const gradeEntries = tree.idxGrade ? Object.values(tree.idxGrade) : [];
  const trimEntries = tree.idxTrim ? Object.values(tree.idxTrim) : [];
  const optEntries = tree.idxOpt ? Object.values(tree.idxOpt) : [];

  for (const grade of gradeEntries) {
    const gradeObj = {
      idx: grade.idx,
      name: grade.title,
      trims: [],
    };

    for (const trim of trimEntries) {
      const trimObj = {
        idx: trim.idx,
        name: trim.title,
        price: 0,
        colorsExt: (trim.trimColorExt || []).map((c, i) => ({
          idx: `ext_${trim.idx}_${i}`,
          name: c.title,
          price: parseInt(c.price) || 0,
          thumb: c.thumb ? `${HICARZ_BASE}${c.thumb}` : '',
        })),
        colorsInt: (trim.trimColorInt || []).map((c, i) => ({
          idx: `int_${trim.idx}_${i}`,
          name: c.title,
          price: parseInt(c.price) || 0,
          thumb: c.thumb ? `${HICARZ_BASE}${c.thumb}` : '',
        })),
        options: optEntries.map(o => ({
          idx: o.idx,
          name: o.title,
          price: 0,
        })),
      };
      gradeObj.trims.push(trimObj);
    }
    grades.push(gradeObj);
  }

  // Get price range from the first model
  const nameModelEntries = Object.values(tree.idxNameModel || {});
  const firstModel = nameModelEntries.find(nm => nm.active) || nameModelEntries[0];
  let trimPriceMin = 0;
  if (firstModel) {
    trimPriceMin = parseInt(firstModel.trimPriceMin) || 0;
    const trimPriceMax = parseInt(firstModel.trimPriceMax) || 0;
    
    const totalTrims = grades[0]?.trims?.length || 1;
    const priceStep = totalTrims > 1 ? (trimPriceMax - trimPriceMin) / (totalTrims - 1) : 0;
    
    for (const grade of grades) {
      grade.trims.forEach((trim, i) => {
        trim.price = Math.round(trimPriceMin + priceStep * i);
      });
    }
  }

  return { config: { grades }, basePrice: trimPriceMin };
}

async function safeGoto(page, url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      return true;
    } catch (e) {
      console.log(`  Retry ${i + 1}/${retries} for ${url} (${e.message})`);
      await page.waitForTimeout(2000);
    }
  }
  return false;
}

async function main() {
  console.log('🚀 Starting missing trim crawler...\n');

  // Load car-data.ts
  const carDataPath = './prisma/car-data.ts';
  const carDataContent = fs.readFileSync(carDataPath, 'utf-8');
  const arrayMatch = carDataContent.match(/export const popularCars:\s*any\[\]\s*=\s*(\[[\s\S]*\]);?\s*$/);
  if (!arrayMatch) {
    console.error('❌ Failed to parse car-data.ts');
    return;
  }
  let cars = JSON.parse(arrayMatch[1]);

  // Identify cars needing update (those with exactly 1 grade named "기본" or "기본 등급")
  const carsToUpdate = cars.filter(c => {
    const grades = c.options?.detailedConfig?.grades;
    return !grades || grades.length === 0 || (grades.length === 1 && grades[0].name.includes('기본'));
  });

  console.log(`\n📦 Found ${carsToUpdate.length} cars needing detailed trim data out of ${cars.length} total.\n`);
  if (carsToUpdate.length === 0) return;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let processedCount = 0;

  for (const brand of BRANDS) {
    // Check if we need to visit this brand
    const brandCarsToUpdate = carsToUpdate.filter(c => c.brandSlug === brand.slug);
    if (brandCarsToUpdate.length === 0) continue;

    console.log(`\n🏢 Visiting Brand: ${brand.name} (Need ${brandCarsToUpdate.length} cars)`);
    
    const listUrl = `https://m.hicarzautoplan.com/cars/index/index/?layout=clear&search[where][idxMaker]=${brand.id}&limit=200&page=1`;
    if (!(await safeGoto(page, listUrl))) continue;

    const html = await page.content();
    const $ = cheerio.load(html);
    
    const carLinks = [];
    $('.list').each((i, el) => {
      const href = $(el).find('.img a').attr('href');
      const name = $(el).find('.text h3').text().trim();
      const thumbnailUrl = $(el).find('.img img').attr('src');
      
      if (href && href.includes('pack=')) {
        const packMatch = href.match(/pack=([^&]+)/);
        if (packMatch) {
          carLinks.push({ name, thumbnailUrl, pack: decodeURIComponent(packMatch[1]) });
        }
      }
    });

    for (const targetCar of brandCarsToUpdate) {
      // Find matching car from Hicarz by name similarity or thumbnail match
      const match = carLinks.find(c => 
        c.name.includes(targetCar.modelName) || 
        targetCar.modelName.includes(c.name) ||
        (c.thumbnailUrl && targetCar.thumbnailUrl && c.thumbnailUrl.split('/').pop() === targetCar.thumbnailUrl.split('/').pop())
      );

      if (!match) {
        console.log(`  ⚠️ Could not find Hicarz match for ${targetCar.modelName}`);
        continue;
      }

      console.log(`  🔍 Fetching details for: ${targetCar.modelName} (matched ${match.name})`);
      
      const detailOk = await safeGoto(page, `https://m.hicarzautoplan.com/cars/index/view/?pack=${encodeURIComponent(match.pack)}`);
      if (!detailOk) continue;

      try {
        const buf = Buffer.from(match.pack, 'base64');
        const resStr = zlib.inflateSync(buf).toString();
        const params = JSON.parse(resStr).param;

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

        if (modelDataStr) {
          const modelData = JSON.parse(modelDataStr);
          if (modelData.tree && Object.keys(modelData.tree.idxGrade || {}).length > 0) {
            const { config, basePrice } = treeToDetailedConfig(modelData.tree);
            
            // Update car
            targetCar.options = { detailedConfig: config };
            if (basePrice > 0) targetCar.basePrice = basePrice;
            
            console.log(`    ✅ Success: ${config.grades.length} grades found.`);
            processedCount++;
            
            // Save periodically to avoid losing data
            if (processedCount % 10 === 0) {
              const output = `export const popularCars: any[] = ${JSON.stringify(cars, null, 2)};\n`;
              fs.writeFileSync(carDataPath, output);
              console.log(`    💾 Checkpoint saved.`);
            }
          } else {
            console.log(`    ⚠️ No tree data found in response.`);
          }
        }
      } catch (e) {
        console.log(`    ❌ Error parsing detail: ${e.message}`);
      }
    }
  }

  // Final save
  const finalOutput = `export const popularCars: any[] = ${JSON.stringify(cars, null, 2)};\n`;
  fs.writeFileSync(carDataPath, finalOutput);
  console.log(`\n✅ Finished crawling. Applied details to ${processedCount} cars.`);
  await browser.close();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
