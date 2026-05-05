const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const zlib = require('zlib');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      console.log(`Fetch failed: ${e.message}, retrying...`);
      await sleep(1000);
    }
  }
  return null;
}

async function testSingleCar() {
  const brandId = "1"; // 현대
  const carName = "그랜저";
  
  console.log(`Testing for ${carName}...`);
  
  const html = await fetchWithRetry(`https://m.hicarzautoplan.com/cars/index/index/?layout=clear&search[where][idxMaker]=${brandId}&limit=10&page=1`, {
    method: 'GET'
  });
  
  if (!html) return;
  
  // Simplified parsing for test
  const packMatch = html.match(/pack=([^"& ]+)/);
  if (!packMatch) {
    console.log("Pack not found in HTML");
    return;
  }
  
  const pack = decodeURIComponent(packMatch[1]);
  const buf = Buffer.from(pack, 'base64');
  const resStr = zlib.inflateSync(buf).toString();
  const packData = JSON.parse(resStr);
  const params = packData.param;
  
  const { idxMaker, idxName, idxModel } = params;
  console.log(`Params: Maker=${idxMaker}, Name=${idxName}, Model=${idxModel}`);

  // Get grades
  const treeParams = new URLSearchParams();
  treeParams.append('input[idxMaker]', idxMaker);
  treeParams.append('input[idxName]', idxName);
  treeParams.append('input[idxModel]', idxModel);
  
  const treeDataStr = await fetchWithRetry('https://m.hicarzautoplan.com/app/nTreeCar/treeCheck/', {
    method: 'POST',
    body: treeParams,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  
  const treeData = JSON.parse(treeDataStr);
  const idxGrade = Object.keys(treeData.tree.idxGrade).find(k => k !== '');
  console.log(`Using Grade: ${idxGrade} (${treeData.tree.idxGrade[idxGrade].title})`);

  // Get trims
  const estParams = new URLSearchParams();
  estParams.append('input[idxMaker]', idxMaker);
  estParams.append('input[idxName]', idxName);
  estParams.append('input[idxModel]', idxModel);
  estParams.append('input[idxGrade]', idxGrade);
  
  const estDataStr = await fetchWithRetry('https://m.hicarzautoplan.com/app/nTreeCar/estimateCheck/', {
    method: 'POST',
    body: estParams,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  
  const estData = JSON.parse(estDataStr);
  const idxTrim = Object.keys(estData.tree.idxTrim).find(k => k !== '');
  console.log(`Using Trim: ${idxTrim} (${estData.tree.idxTrim[idxTrim].title})`);

  // Get trim details (options)
  const trimParams = new URLSearchParams();
  trimParams.append('input[idxMaker]', idxMaker);
  trimParams.append('input[idxName]', idxName);
  trimParams.append('input[idxModel]', idxModel);
  trimParams.append('input[idxGrade]', idxGrade);
  trimParams.append('input[idxTrim]', idxTrim);
  trimParams.append('pageMode', 'detailWrap');
  
  const trimDataStr = await fetchWithRetry('https://m.hicarzautoplan.com/app/nTreeCar/estimateCheck/', {
    method: 'POST',
    body: trimParams,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  
  const trimData = JSON.parse(trimDataStr);
  const baseTrimPrice = Number(trimData.info?.recom?.best?.trimPrice) || 0;
  console.log(`Base Trim Price: ${baseTrimPrice}`);

  const options = Object.values(trimData.tree?.idxOpt || {}).slice(0, 3); // Test 3 options
  for (const opt of options) {
    const optParams = new URLSearchParams();
    optParams.append('input[idxMaker]', idxMaker);
    optParams.append('input[idxName]', idxName);
    optParams.append('input[idxModel]', idxModel);
    optParams.append('input[idxGrade]', idxGrade);
    optParams.append('input[idxTrim]', idxTrim);
    optParams.append(`input[idxOpt][${opt.idx}]`, opt.idx);
    
    const optDataStr = await fetchWithRetry('https://m.hicarzautoplan.com/app/nTreeCar/estimateCheck/', {
      method: 'POST',
      body: optParams,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    const optData = JSON.parse(optDataStr);
    const newTrimPrice = Number(optData.info?.recom?.best?.trimPrice) || 0;
    console.log(`Option: ${opt.title}, New Price: ${newTrimPrice}, Diff: ${newTrimPrice - baseTrimPrice}`);
  }

  await prisma.$disconnect();
}

testSingleCar();
