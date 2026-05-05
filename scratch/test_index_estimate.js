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

async function testIndexEstimateCheck() {
  const brandId = "1"; // 현대
  
  const html = await fetchWithRetry(`https://m.hicarzautoplan.com/cars/index/index/?layout=clear&search[where][idxMaker]=${brandId}&limit=10&page=1`, {
    method: 'GET'
  });
  
  const packMatch = html.match(/pack=([^"& ]+)/);
  if (!packMatch) return;
  
  const pack = packMatch[1]; // Keep it URL encoded or raw? Let's keep raw
  const decodedPack = decodeURIComponent(pack);
  
  // Now let's try calling /cars/index/estimateCheck
  const optIdx = "46523"; 

  const params = new URLSearchParams();
  // Based on subagent's captured body:
  params.append('input[idxMaker]', '1');
  params.append('input[idxName]', '563');
  params.append('input[idxModel]', '1020');
  params.append('param[idxGrade]', '2655');
  params.append('param[idxTrim]', '11001');
  params.append('input[option][]', optIdx); // Let's guess this is how options are passed
  params.append('pack', decodedPack);

  const dataStr = await fetchWithRetry('https://m.hicarzautoplan.com/cars/index/estimateCheck', {
    method: 'POST',
    body: params,
    headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest'
    }
  });

  console.log(dataStr.substring(0, 500));
}

testIndexEstimateCheck();
