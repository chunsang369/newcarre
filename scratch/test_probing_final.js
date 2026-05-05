const pack = "eJw1jjEOgzAMRe_imSFAw8DaSlUHKgYuYBGrikrAMqkEQty9CYHR7_3_5Q0YP9RMhqCG2ToeCDKwI_881Nsh70n2KK_R0AJ7FrCgi96apcEvSfB57JnljS6mdVWmO04PUatCJfIUPAaLSutEOrEuRnKlzpVWbE8HKnN9C4wj6Fa_vhEa_YUfxNNs_WlYiHG9XEtiJxNwWcG_2_wGQcUnd";

async function testWithUA() {
  const carUrl = `https://m.hicarzautoplan.com/cars/index/view/?pack=${encodeURIComponent(pack)}`;
  
  const params = new URLSearchParams();
  params.append('_method', 'POST');
  params.append('ajax', 'true');
  params.append('input[idxMaker]', '1');
  params.append('input[idxName]', '94');
  params.append('input[idxModel]', '294');
  params.append('input[idxGrade]', '2624'); 
  params.append('input[idxTrim]', '10885'); 
  params.append('payYear', '36');
  params.append('payAge', '26');

  const res = await fetch('https://m.hicarzautoplan.com/app/nTreeCar/estimateCheck/', {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': carUrl
    }
  });

  const data = await res.json();
  console.log('Result with UA:', JSON.stringify(data.info, null, 2));
}

testWithUA();
