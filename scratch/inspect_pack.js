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

async function inspectPack() {
  const brandId = "1"; // 현대
  
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
  
  console.log(JSON.stringify(packData, null, 2));
}

inspectPack();
