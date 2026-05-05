async function test() {
  const url = 'https://m.hicarzautoplan.com/app/nTreeCar/estimateCheck/';
  
  const params = new URLSearchParams();
  params.append('_method', 'POST');
  params.append('ajax', 'true');
  params.append('input[idxMaker]', '1');
  params.append('input[idxName]', '563');
  params.append('input[idxModel]', '1020');
  params.append('input[idxGrade]', '2655');
  params.append('input[idxTrim]', '11001');
  params.append('input[idxOpt][46523]', 'on');
  params.append('pageMode', 'detailWrap');

  const res = await fetch(url, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': 'https://m.hicarzautoplan.com/cars/index/view/',
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    }
  });

  const data = await res.json();
  console.log('Price Option:', data.info?.priceOption);
  console.log('Price Total:', data.info?.priceTotal);
}

test();
