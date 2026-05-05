async function testNewFormat() {
  const idxMaker = "1";
  const idxName = "563";
  const idxModel = "1020";
  const idxGrade = "2655";
  const idxTrim = "11001";
  const optIdx = "46523";

  const params = new URLSearchParams();
  // Using the subagent's discovered format
  params.append('idxMaker', idxMaker);
  params.append('idxName', idxName);
  params.append('idxModel', idxModel);
  params.append('idxGrade', idxGrade);
  params.append('idxTrim', idxTrim);
  params.append(`idxOpt[${optIdx}]`, 'on');
  params.append('pageMode', 'detailWrap');

  const res = await fetch('https://m.hicarzautoplan.com/app/nTreeCar/estimateCheck/', {
    method: 'POST',
    body: params,
    headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest'
    }
  });

  const data = await res.json();
  console.log('New Format Result:');
  console.log('priceTrim:', data.info?.recom?.best?.trimPrice);
  console.log('priceOption:', data.info?.priceOption);
  console.log('priceTotal:', data.info?.priceTotal);
}

testNewFormat();
