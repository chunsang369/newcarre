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

async function testOptions() {
  const idxMaker = "1";
  const idxName = "563";
  const idxModel = "1020";
  const idxGrade = "2655";
  const idxTrim = "11001";
  const optIdx = "46523"; // 듀얼 와이드 선루프

  const paramNames = [
    'input[idxOpt][]',
    'input[idxOpt][' + optIdx + ']',
    'input[option][]',
    'input[option]',
    'param[idxOption][]',
    'param[option][]',
    'idxOption[]',
    'option[]'
  ];

  for (const pName of paramNames) {
    const params = new URLSearchParams();
    params.append('input[idxMaker]', idxMaker);
    params.append('input[idxName]', idxName);
    params.append('input[idxModel]', idxModel);
    params.append('input[idxGrade]', idxGrade);
    params.append('input[idxTrim]', idxTrim);
    params.append('pageMode', 'detailWrap');
    params.append(pName, optIdx);

    const dataStr = await fetchWithRetry('https://m.hicarzautoplan.com/app/nTreeCar/estimateCheck/', {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const data = JSON.parse(dataStr);
    const priceOpt = data.info?.priceOption;
    console.log(`Param: ${pName} => priceOption: ${priceOpt}`);
  }
}

testOptions();
