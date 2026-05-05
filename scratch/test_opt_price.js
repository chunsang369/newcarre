const zlib = require('zlib');

async function fetchWithRetry(url, options) {
  const res = await fetch(url, options);
  return await res.text();
}

async function testPrice() {
  const idxMaker = "1"; 
  const idxName = "563"; 
  const idxModel = "1020"; 
  const idxGrade = "2655"; 
  const idxTrim = "11001"; 
  const optIdx = "108"; 

  // 1. Base price
  const baseParams = new URLSearchParams();
  baseParams.append('input[idxMaker]', idxMaker);
  baseParams.append('input[idxName]', idxName);
  baseParams.append('input[idxModel]', idxModel);
  baseParams.append('input[idxGrade]', idxGrade);
  baseParams.append('input[idxTrim]', idxTrim);
  
  const baseDataStr = await fetchWithRetry('https://m.hicarzautoplan.com/app/nTreeCar/estimateCheck/', {
    method: 'POST',
    body: baseParams,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  const baseData = JSON.parse(baseDataStr);
  console.log('Base Trim Price:', baseData.info?.recom?.best?.trimPrice);

  // 2. Option price
  const optParams = new URLSearchParams();
  optParams.append('idxMaker', idxMaker);
  optParams.append('idxName', idxName);
  optParams.append('idxModel', idxModel);
  optParams.append('idxGrade', idxGrade);
  optParams.append('idxTrim', idxTrim);
  optParams.append('idxOption[]', optIdx); 
  
  const optDataStr = await fetchWithRetry('https://m.hicarzautoplan.com/app/nTreeCar/estimateCheck/', {
    method: 'POST',
    body: optParams,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  const optData = JSON.parse(optDataStr);
  console.log('Price with Option:', optData.info?.recom?.best?.trimPrice);
  console.log('priceOption in info:', optData.info?.priceOption);
  console.log('option in info:', optData.info?.option);
  console.log('priceTrim in info:', optData.info?.priceTrim);
  console.log('priceTotal in info:', optData.info?.priceTotal);
}

testPrice();
