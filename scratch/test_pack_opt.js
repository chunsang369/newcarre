const zlib = require('zlib');

function encodePack(data) {
  const json = JSON.stringify(data);
  const buf = zlib.deflateSync(json);
  return buf.toString('base64');
}

async function testWithPack() {
  const packData = {
    param: {
      idxMaker: "1",
      idxName: "563",
      idxModel: "1020",
      idxGrade: "2624",
      idxTrim: "10885"
    }
  };
  
  const pack = encodePack(packData);
  const optIdx = "53592"; // 파노라마 선루프

  // Request with pack + option
  const params = new URLSearchParams();
  params.append('pack', pack);
  params.append('input[idxOption][]', optIdx);
  
  const res = await fetch('https://m.hicarzautoplan.com/app/nTreeCar/estimateCheck/', {
    method: 'POST',
    body: params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  const data = await res.json();
  console.log('Price with Pack + Option:', data.info?.recom?.best?.trimPrice);
}

testWithPack();
