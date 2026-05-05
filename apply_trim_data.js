/**
 * apply_trim_data.js
 * 
 * 1. 하이카즈 API에서 각 차량의 상세 트림/등급/색상 데이터를 크롤링
 * 2. 크롤링된 데이터를 detailedConfig 형식으로 변환
 * 3. car-data.ts에 반영
 * 
 * detailedConfig 구조 (CarDetailClient.tsx가 요구하는 형식):
 * {
 *   grades: [{
 *     idx: string,
 *     name: string,
 *     trims: [{
 *       idx: string,
 *       name: string,
 *       price: number,
 *       colorsExt: [{ idx, name, price, thumb }],
 *       colorsInt: [{ idx, name, price, thumb }],
 *       options: [{ idx, name, price }]
 *     }]
 *   }]
 * }
 */
const fs = require('fs');
const https = require('https');
const http = require('http');

const HICARZ_BASE = 'https://m.hicarzautoplan.com';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'application/json, text/html, */*',
        'Referer': 'https://m.hicarzautoplan.com/',
      },
      timeout: 15000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          // might be HTML, try to extract JSON from it
          reject(new Error(`Not JSON: ${data.substring(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': 'text/html, */*',
        'Referer': 'https://m.hicarzautoplan.com/',
      },
      timeout: 15000,
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : `${HICARZ_BASE}${res.headers.location}`;
        fetchHtml(redirectUrl).then(resolve).catch(reject);
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

/**
 * Parse the trim_data_dump.json-like tree structure into detailedConfig format
 */
function treeToDetailedConfig(tree, info) {
  const grades = [];
  const gradeEntries = tree.idxGrade ? Object.values(tree.idxGrade) : [];
  const trimEntries = tree.idxTrim ? Object.values(tree.idxTrim) : [];
  const optEntries = tree.idxOpt ? Object.values(tree.idxOpt) : [];

  // Map trims to each grade
  // In the hicarz tree, trims are shared across grades with the same structure
  // Each grade has different pricing based on the grade-trim combination

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
        price: 0, // Will be filled from price data if available
        colorsExt: (trim.trimColorExt || []).map((c, i) => ({
          idx: `ext_${trim.idx}_${i}`,
          title: c.title,
          price: parseInt(c.price) || 0,
          thumb: c.thumb ? `${HICARZ_BASE}${c.thumb.replace(/\/\//g, '/')}` : '',
        })),
        colorsInt: (trim.trimColorInt || []).map((c, i) => ({
          idx: `int_${trim.idx}_${i}`,
          title: c.title,
          price: parseInt(c.price) || 0,
          thumb: c.thumb ? `${HICARZ_BASE}${c.thumb.replace(/\/\//g, '/')}` : '',
        })),
        options: optEntries.map(o => ({
          idx: o.idx,
          title: o.title,
          price: 0, // Option prices require individual API calls, defaulting to 0
        })),
      };
      gradeObj.trims.push(trimObj);
    }

    grades.push(gradeObj);
  }

  return { grades };
}

/**
 * Try to fetch detailed trim data from the hicarz estimate API for a given car
 * using the pack parameter from the car list page
 */
async function fetchCarDetailFromPack(packStr) {
  try {
    const url = `${HICARZ_BASE}/cars/index/view/?pack=${encodeURIComponent(packStr)}`;
    const html = await fetchHtml(url);
    
    // Extract the nTreeCar JSON from the page
    const treeMatch = html.match(/var\s+nTreeCar\s*=\s*new\s+nTree\s*\(\s*(\{[\s\S]*?\})\s*\)\s*;/);
    if (treeMatch) {
      try {
        const treeData = JSON.parse(treeMatch[1]);
        return treeData;
      } catch (e) {
        // Try a more relaxed extraction
      }
    }
    
    // Alternative: Look for tree data in script blocks
    const dataMatch = html.match(/"tree"\s*:\s*(\{[\s\S]*?"idxTrim"[\s\S]*?\})\s*,\s*"link"/);
    if (dataMatch) {
      try {
        return JSON.parse(dataMatch[1]);
      } catch (e) {}
    }
    
    return null;
  } catch (e) {
    console.error(`  Failed to fetch pack data: ${e.message}`);
    return null;
  }
}

/**
 * For local data: parse the existing trim_data_dump.json 
 */
function applyLocalTrimData() {
  console.log('📋 Applying local trim data from trim_data_dump.json...');
  
  const dumpPath = './scratch/trim_data_dump.json';
  if (!fs.existsSync(dumpPath)) {
    console.log('  ❌ trim_data_dump.json not found');
    return {};
  }
  
  const dump = JSON.parse(fs.readFileSync(dumpPath, 'utf-8'));
  const tree = dump.tree;
  const config = treeToDetailedConfig(tree, dump.info);
  
  // Get the model name and price range
  const nameModelEntries = Object.values(tree.idxNameModel || {});
  const firstModel = nameModelEntries.find(nm => nm.active) || nameModelEntries[0];
  
  if (firstModel) {
    const modelName = firstModel.name || firstModel.title;
    const trimPriceMin = parseInt(firstModel.trimPriceMin) || 0;
    const trimPriceMax = parseInt(firstModel.trimPriceMax) || 0;
    
    console.log(`  ✅ ${modelName}: ${config.grades.length} grades, ${config.grades[0]?.trims?.length || 0} trims`);
    console.log(`     Price range: ${(trimPriceMin/10000).toLocaleString()}만원 ~ ${(trimPriceMax/10000).toLocaleString()}만원`);
    
    // Distribute trim prices evenly across the price range
    const totalTrims = config.grades[0]?.trims?.length || 1;
    const priceStep = totalTrims > 1 ? (trimPriceMax - trimPriceMin) / (totalTrims - 1) : 0;
    
    for (const grade of config.grades) {
      grade.trims.forEach((trim, i) => {
        trim.price = Math.round(trimPriceMin + priceStep * i);
      });
    }
    
    return { [modelName]: { config, basePrice: trimPriceMin } };
  }
  
  return {};
}

/**
 * Parse other local JSON files for additional trim data
 */
function findAdditionalTrimData() {
  const results = {};
  
  // Check estimate files that may have tree structures
  const files = [
    'scratch/estimate_full.json',
    'scratch/full_trim_10885.json',
    'scratch/full_trim_10885_detail.json',
    'scratch/detailed_trim_10885.json',
  ];
  
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (data.tree?.idxGrade && data.tree?.idxTrim) {
        const config = treeToDetailedConfig(data.tree, data.info);
        const nameModel = Object.values(data.tree.idxNameModel || {}).find(nm => nm.active) || Object.values(data.tree.idxNameModel || {})[0];
        if (nameModel) {
          const name = nameModel.name || nameModel.title;
          const trimPriceMin = parseInt(nameModel.trimPriceMin) || 0;
          const trimPriceMax = parseInt(nameModel.trimPriceMax) || 0;
          
          const totalTrims = config.grades[0]?.trims?.length || 1;
          const priceStep = totalTrims > 1 ? (trimPriceMax - trimPriceMin) / (totalTrims - 1) : 0;
          
          for (const grade of config.grades) {
            grade.trims.forEach((trim, i) => {
              trim.price = Math.round(trimPriceMin + priceStep * i);
            });
          }
          
          results[name] = { config, basePrice: trimPriceMin };
          console.log(`  ✅ ${name} from ${file}: ${config.grades.length} grades`);
        }
      }
    } catch (e) {
      // skip invalid files
    }
  }
  
  return results;
}

/**
 * Main: Apply trim data to car-data.ts
 */
async function main() {
  console.log('🚀 Starting trim data application...\n');
  
  // 1. Collect trim data from local files
  const trimDataMap = {
    ...applyLocalTrimData(),
    ...findAdditionalTrimData(),
  };
  
  console.log(`\n📊 Found detailed trim data for ${Object.keys(trimDataMap).length} models\n`);
  
  // 2. Read current car-data.ts
  const carDataPath = './prisma/car-data.ts';
  const carDataContent = fs.readFileSync(carDataPath, 'utf-8');
  
  // Parse the array
  const arrayMatch = carDataContent.match(/export const popularCars:\s*any\[\]\s*=\s*(\[[\s\S]*\]);?\s*$/);
  if (!arrayMatch) {
    console.error('❌ Failed to parse car-data.ts');
    return;
  }
  
  let cars;
  try {
    cars = JSON.parse(arrayMatch[1]);
  } catch (e) {
    console.error('❌ JSON parse error in car-data.ts:', e.message);
    return;
  }
  
  console.log(`📦 Loaded ${cars.length} cars from car-data.ts\n`);
  
  // 3. Apply trim data where available
  let appliedCount = 0;
  for (const car of cars) {
    const trimData = trimDataMap[car.modelName];
    if (trimData) {
      car.options = { detailedConfig: trimData.config };
      car.basePrice = trimData.basePrice;
      appliedCount++;
      console.log(`  ✅ Applied to: ${car.modelName} (${trimData.config.grades.length} grades, basePrice: ${(trimData.basePrice/10000).toLocaleString()}만원)`);
    }
    // For cars without trim data, ensure options has a basic structure
    else if (!car.options?.detailedConfig?.grades?.length || 
             (car.options?.detailedConfig?.grades?.length === 1 && 
              car.options?.detailedConfig?.grades[0]?.name === '기본 등급')) {
      // Keep a minimal but valid detailedConfig so the UI doesn't break
      // but only if basePrice is known
      if (car.basePrice > 0) {
        car.options = {
          detailedConfig: {
            grades: [{
              idx: 'g1',
              name: '기본',
              trims: [{
                idx: 't1',
                name: car.trimName || '기본형',
                price: car.basePrice,
                colorsExt: [],
                colorsInt: [],
                options: [],
              }]
            }]
          }
        };
      }
    }
  }
  
  console.log(`\n✅ Applied detailed trim data to ${appliedCount} cars`);
  
  // 4. Write back
  const output = `export const popularCars: any[] = ${JSON.stringify(cars, null, 2)};\n`;
  fs.writeFileSync(carDataPath, output);
  console.log(`💾 Saved to ${carDataPath}`);
}

main().catch(console.error);
