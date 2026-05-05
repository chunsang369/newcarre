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

async function finalTest() {
  const idxMaker = "1";
  const idxName = "563";
  const idxModel = "1020";
  const idxGrade = "2655";
  const idxTrim = "11001";
  const optIdx = "46523";

  // Try different ways to send the option
  const combinations = [
    { name: 'input[idxOpt][]', value: optIdx },
    { name: 'idxOpt[]', value: optIdx },
    { name: 'idxOption[]', value: optIdx },
    { name: 'input[idxOpt][' + optIdx + ']', value: optIdx },
    { name: 'input[idxOpt][' + optIdx + ']', value: '1' },
    { name: 'input[idxOpt][' + optIdx + ']', value: 'on' },
    { name: 'param[idxOpt][]', value: optIdx }
  ];

  for (const combo of combinations) {
    const params = new URLSearchParams();
    params.append('input[idxMaker]', idxMaker);
    params.append('input[idxName]', idxName);
    params.append('input[idxModel]', idxModel);
    params.append('input[idxGrade]', idxGrade);
    params.append('input[idxTrim]', idxTrim);
    params.append('pageMode', 'detailWrap');
    params.append(combo.name, combo.value);

    const dataStr = await fetchWithRetry('https://m.hicarzautoplan.com/app/nTreeCar/estimateCheck/', {
      method: 'POST',
      body: params,
      headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest'
      }
    });

    const data = JSON.parse(dataStr);
    const priceOpt = data.info?.priceOption;
    console.log(`Test: ${combo.name}=${combo.value} => priceOption: ${priceOpt}`);
  }
}

finalTest();
