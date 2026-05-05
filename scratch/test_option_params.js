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
  
  const packMatch = html.match(/pack=([^"& ]+)/);
  if (!packMatch) return;
  
  const pack = decodeURIComponent(packMatch[1]);
  const buf = Buffer.from(pack, 'base64');
  const resStr = zlib.inflateSync(buf).toString();
  const packData = JSON.parse(resStr);
  const params = packData.param;
  
  const { idxMaker, idxName, idxModel } = params;

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

  // Get trim details
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

  const options = Object.values(trimData.tree?.idxOpt || {}).slice(0, 3);
  for (const opt of options) {
    console.log(`Testing Option: ${opt.title} (${opt.idx})`);
    
    // Attempt 1: input[idxOpt][opt.idx]
    const optParams1 = new URLSearchParams();
    optParams1.append('input[idxMaker]', idxMaker);
    optParams1.append('input[idxName]', idxName);
    optParams1.append('input[idxModel]', idxModel);
    optParams1.append('input[idxGrade]', idxGrade);
    optParams1.append('input[idxTrim]', idxTrim);
    optParams1.append(`input[idxOpt][${opt.idx}]`, opt.idx);
    
    const optDataStr1 = await fetchWithRetry('https://m.hicarzautoplan.com/app/nTreeCar/estimateCheck/', {
      method: 'POST',
      body: optParams1,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const optData1 = JSON.parse(optDataStr1);
    const price1 = Number(optData1.info?.recom?.best?.trimPrice) || 0;
    console.log(`  -> input[idxOpt]: ${price1} (Diff: ${price1 - baseTrimPrice})`);

    // Attempt 2: input[idxOption][]
    const optParams2 = new URLSearchParams();
    optParams2.append('input[idxMaker]', idxMaker);
    optParams2.append('input[idxName]', idxName);
    optParams2.append('input[idxModel]', idxModel);
    optParams2.append('input[idxGrade]', idxGrade);
    optParams2.append('input[idxTrim]', idxTrim);
    optParams2.append('input[idxOption][]', opt.idx);
    
    const optDataStr2 = await fetchWithRetry('https://m.hicarzautoplan.com/app/nTreeCar/estimateCheck/', {
      method: 'POST',
      body: optParams2,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const optData2 = JSON.parse(optDataStr2);
    const price2 = Number(optData2.info?.recom?.best?.trimPrice) || 0;
    console.log(`  -> input[idxOption][]: ${price2} (Diff: ${price2 - baseTrimPrice})`);

    // Attempt 3: no input prefix
    const optParams3 = new URLSearchParams();
    optParams3.append('idxMaker', idxMaker);
    optParams3.append('idxName', idxName);
    optParams3.append('idxModel', idxModel);
    optParams3.append('idxGrade', idxGrade);
    optParams3.append('idxTrim', idxTrim);
    optParams3.append('idxOption[]', opt.idx);
    
    const optDataStr3 = await fetchWithRetry('https://m.hicarzautoplan.com/app/nTreeCar/estimateCheck/', {
      method: 'POST',
      body: optParams3,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const optData3 = JSON.parse(optDataStr3);
    const price3 = Number(optData3.info?.recom?.best?.trimPrice) || 0;
    console.log(`  -> idxOption[]: ${price3} (Diff: ${price3 - baseTrimPrice})`);
  }

  await prisma.$disconnect();
}

testSingleCar();
