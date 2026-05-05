async function test() {
  const viewUrl = 'https://m.hicarzautoplan.com/cars/index/view/?pack=eJw1jbEOgzAMRP%2FFM0MAwcDaSp2oGJA6W8QqUQOxTKoWIf69CaFb7t3LeQNGwQmaDYz%2BtvgigQZyyGK840QhVXWZcus02VirQiVyE9RRKeqqSqQXM0UlV%2Bpc6cQMwZnf1u4ZLIQyjPHeZySh%2BOAo9CvTxR1jQrMPXw98JXaL8WfDQozrv%2BtIjNMBlzXsYZrxSW0SNXk09iHIsP8ACmBISw%3D%3D';
  const apiUrl = 'https://m.hicarzautoplan.com/app/nTreeCar/estimateCheck/';

  console.log('Fetching View Page for Cookies...');
  const viewRes = await fetch(viewUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  
  const cookies = viewRes.headers.get('set-cookie');
  console.log('Cookies:', cookies);

  const params = new URLSearchParams();
  params.append('input[idxMaker]', '1');
  params.append('input[idxName]', '563');
  params.append('input[idxModel]', '1020');
  params.append('input[idxGrade]', '2655');
  params.append('input[idxTrim]', '11001');
  params.append('input[idxOpt[46523]]', 'on');
  params.append('payYear', '36');
  params.append('payAge', '26');
  params.append('payDeposit', '0');
  params.append('payMileage', '20000');
  params.append('pageMode', 'detailWrap');

  console.log('Fetching API with Cookies...');
  const apiRes = await fetch(apiUrl, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': viewUrl,
      'Cookie': cookies || ''
    }
  });

  const data = await apiRes.json();
  console.log('Price Option:', data.info?.priceOption);
  console.log('Price Total:', data.info?.priceTotal);
}

test();
