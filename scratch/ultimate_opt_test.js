async function test() {
  const url = 'https://m.hicarzautoplan.com/app/nTreeCar/estimateCheck/';
  
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

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://m.hicarzautoplan.com/cars/index/view/'
      }
    });

    const data = await response.json();

    console.log('Response Headers:', response.headers);
    console.log('API Response:');
    console.log('priceTrim:', data.info?.recom?.best?.trimPrice);
    console.log('priceOption:', data.info?.priceOption);
    console.log('priceTotal:', data.info?.priceTotal);
    
    if (data.info?.priceOption > 0) {
      console.log('SUCCESS! Option price found.');
    } else {
      console.log('FAILED. Option price is still 0.');
      console.log('Info Object:', JSON.stringify(data.info, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
