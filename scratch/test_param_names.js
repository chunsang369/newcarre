const zlib = require('zlib');

async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return null;
}

async function testParamNames() {
  const idxMaker = "1";
  const idxName = "563";
  const idxModel = "1020";
  const idxGrade = "2655";
  const idxTrim = "11001";
  const optIdx = "46523";

  const params = new URLSearchParams();
  params.append('input[idxMaker]', idxMaker);
  params.append('input[idxName]', idxName);
  params.append('input[idxModel]', idxModel);
  // Use param[] instead of input[]
  params.append('param[idxGrade]', idxGrade);
  params.append('param[idxTrim]', idxTrim);
  params.append('param[idxOpt][]', optIdx); // Test param[idxOpt][]
  params.append('input[idxOpt][]', optIdx); // Test input[idxOpt][]
  params.append('pageMode', 'detailWrap');

  const dataStr = await fetchWithRetry('https://m.hicarzautoplan.com/app/nTreeCar/estimateCheck/', {
    method: 'POST',
    body: params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  const data = JSON.parse(dataStr);
  console.log(`priceTrim: ${data.info?.priceTrim}`);
  console.log(`priceTotal: ${data.info?.priceTotal}`);
  console.log(`priceOption: ${data.info?.priceOption}`);
}

testParamNames();
