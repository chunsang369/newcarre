const zlib = require('zlib');

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

async function inspectTrimData() {
  const brandId = "1"; // 현대
  
  const html = await fetchWithRetry(`https://m.hicarzautoplan.com/cars/index/index/?layout=clear&search[where][idxMaker]=${brandId}&limit=10&page=1`, {
    method: 'GET'
  });
  
  const packMatch = html.match(/pack=([^"& ]+)/);
  if (!packMatch) return;
  
  const pack = decodeURIComponent(packMatch[1]);
  const buf = Buffer.from(pack, 'base64');
  const packData = JSON.parse(zlib.inflateSync(buf).toString());
  const params = packData.param;
  
  const { idxMaker, idxName, idxModel, idxGrade, idxTrim } = params;

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
  const opt = trimData.tree.idxOpt;
  
  // Just print the first option's keys to see if price is there
  if (opt) {
      const firstKey = Object.keys(opt)[0];
      console.log(JSON.stringify(opt[firstKey], null, 2));
  } else {
      console.log("No options found.");
  }
}

inspectTrimData();
