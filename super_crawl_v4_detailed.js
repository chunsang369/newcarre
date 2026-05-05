const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cheerio = require('cheerio');
const zlib = require('zlib');
const { chromium } = require('playwright');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const BRANDS = [
  { "id": "1", "name": "현대", "nation": "국산" },
  { "id": "4", "name": "제네시스", "nation": "국산" },
  { "id": "2", "name": "기아", "nation": "국산" }
];

async function crawlDetailedData() {
  console.log('Starting detailed crawl...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  for (const brand of BRANDS) {
    console.log(`\nFetching cars for brand: ${brand.name} (${brand.id})`);
    
    const listUrl = `https://m.hicarzautoplan.com/cars/index/index/?layout=clear&search[where][idxMaker]=${brand.id}&limit=100&page=1`;
    await page.goto(listUrl);
    const html = await page.content();
    
    if (!html) continue;
    
    const $ = cheerio.load(html);
    const carLinks = [];
    
    $('.list').each((i, el) => {
      const href = $(el).find('.img a').attr('href');
      const name = $(el).find('.text h3').text().trim();
      
      if (href && href.includes('pack=')) {
        const packMatch = href.match(/pack=([^&]+)/);
        if (packMatch) {
          carLinks.push({
            name,
            pack: decodeURIComponent(packMatch[1])
          });
        }
      }
    });
    
    for (const carInfo of carLinks) {
      console.log(`Processing ${carInfo.name}`);
      
      await page.goto(`https://m.hicarzautoplan.com/cars/index/view/?pack=${encodeURIComponent(carInfo.pack)}`);
      
      let params;
      try {
        const buf = Buffer.from(carInfo.pack, 'base64');
        const resStr = zlib.inflateSync(buf).toString();
        const packData = JSON.parse(resStr);
        params = packData.param;
      } catch (e) {
        console.error(`  -> Failed to decode pack for ${carInfo.name}`);
        continue;
      }
      
      const idxModel = params.idxModel;
      const idxMaker = params.idxMaker;
      const idxName = params.idxName;
      
      const cleanName = carInfo.name.replace(/\([^)]+\)/g, '').trim();
      let dbCar = await prisma.car.findFirst({
        where: { modelName: { contains: cleanName }, brand: { name: brand.name } }
      });
      
      if (!dbCar) {
        const firstWord = cleanName.split(' ')[0];
        dbCar = await prisma.car.findFirst({
          where: { modelName: { contains: firstWord }, brand: { name: brand.name } }
        });
        if (!dbCar) continue;
      }

      // Step 1: Get Grades
      const modelParams = new URLSearchParams();
      modelParams.append('input[idxMaker]', idxMaker);
      modelParams.append('input[idxName]', idxName);
      modelParams.append('input[idxModel]', idxModel);
      modelParams.append('ajax', 'true');

      const modelDataStr = await page.evaluate(async (p) => {
        const res = await fetch('/app/nTreeCar/treeCheck/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' },
          body: p
        });
        return await res.text();
      }, modelParams.toString());

      if (!modelDataStr) continue;
      let modelData;
      try { modelData = JSON.parse(modelDataStr); } catch(e) { continue; }

      const detailedConfig = { grades: [] };
      const grades = modelData.tree?.idxGrade || {};
      
      for (const grade of Object.values(grades)) {
        const idxGrade = grade.idx;
        const gradeObj = { idx: idxGrade, name: grade.title, trims: [] };
        console.log(`  -> Processing grade: ${grade.title} (${idxGrade})`);

        // Step 2: Get Trims for this grade
        const gradeParams = new URLSearchParams(modelParams);
        gradeParams.append('input[idxGrade]', idxGrade);

        const gradeDataStr = await page.evaluate(async (p) => {
          const res = await fetch('/app/nTreeCar/treeCheck/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' },
            body: p
          });
          return await res.text();
        }, gradeParams.toString());

        if (!gradeDataStr) continue;
        let gradeData;
        try { gradeData = JSON.parse(gradeDataStr); } catch(e) { continue; }

        const trims = gradeData.tree?.idxTrim || {};
        for (const trimInfo of Object.values(trims)) {
          const idxTrim = trimInfo.idx;
          console.log(`    -> Probing trim: ${trimInfo.title} (${idxTrim})`);
          
          const trimParams = new URLSearchParams(gradeParams);
          trimParams.append('input[idxTrim]', idxTrim);
          trimParams.append('payYear', '36');
          trimParams.append('payAge', '26');
          trimParams.append('_method', 'POST');

          // Step 3: Get Options and Prices
          const trimDataStr = await page.evaluate(async (p) => {
            const res = await fetch('/app/nTreeCar/estimateCheck/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' },
              body: p
            });
            return await res.text();
          }, trimParams.toString());
          
          if (!trimDataStr) continue;
          let trimDataJson;
          try { trimDataJson = JSON.parse(trimDataStr); } catch(e) { continue; }
          
          const baseTotal = Number(trimDataJson.info?.priceTotal) || 0;
          const options = [];
          
          if (trimDataJson.tree?.idxOpt) {
            const optList = Object.values(trimDataJson.tree.idxOpt);
            console.log(`      -> Options: ${optList.length}. baseTotal: ${baseTotal}`);
            for (const opt of optList) {
              if (!opt.idx) continue;
              
              const optParams = new URLSearchParams(trimParams);
              optParams.append(`input[idxOpt][${opt.idx}]`, 'on');
              
              const newTotal = await page.evaluate(async (p) => {
                const res = await fetch('/app/nTreeCar/estimateCheck/', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' },
                  body: p
                });
                const data = await res.json();
                return Number(data.info?.priceTotal) || 0;
              }, optParams.toString());

              const optPrice = (newTotal > baseTotal) ? (newTotal - baseTotal) : 0;
              options.push({ idx: opt.idx, title: opt.title, price: optPrice });
              await sleep(30); // Faster probing
            }
          }

          gradeObj.trims.push({
            idx: idxTrim,
            name: trimInfo.title,
            price: Number(trimInfo.price) || 0,
            options: options,
            colorsExt: Object.values(trimDataJson.tree?.colorExt || {}).map((c) => ({
              idx: c.idx || c.title,
              title: c.title,
              price: Number(c.price) || 0,
              thumb: c.thumb ? `https://m.hicarzautoplan.com${c.thumb}` : null
            })),
            colorsInt: Object.values(trimDataJson.tree?.colorInt || {}).map((c) => ({
              idx: c.idx || c.title,
              title: c.title,
              price: Number(c.price) || 0,
              thumb: c.thumb ? `https://m.hicarzautoplan.com${c.thumb}` : null
            }))
          });
        }
        detailedConfig.grades.push(gradeObj);
      }

      // Calculate minPrice from all trims for the car's basePrice
      let minPrice = Infinity;
      for (const g of detailedConfig.grades) {
        for (const t of g.trims) {
          if (t.price > 0 && t.price < minPrice) {
            minPrice = t.price;
          }
        }
      }
      if (minPrice === Infinity) minPrice = 0;

      await prisma.car.update({
        where: { id: dbCar.id },
        data: { 
          options: { ...dbCar.options, detailedConfig },
          basePrice: minPrice
        }
      });
      console.log(`  -> Updated ${dbCar.modelName} with ${detailedConfig.grades.length} grades. BasePrice: ${minPrice}`);
      // break; // REMOVE THIS LATER
    }
  }
  await browser.close();
}

crawlDetailedData().catch(console.error);
