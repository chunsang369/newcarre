async function test() {
  const url = 'https://m.hicarzautoplan.com/app/nTreeCar/estimateCheck/';
  
  async function getPrice(optId = null) {
    const params = new URLSearchParams();
    params.append('input[idxMaker]', '1');
    params.append('input[idxName]', '563');
    params.append('input[idxModel]', '1020');
    params.append('input[idxGrade]', '2655');
    params.append('input[idxTrim]', '11001');
    if (optId) params.append(`input[idxOpt][${optId}]`, 'on');
    params.append('payYear', '36');
    params.append('payAge', '26');
    params.append('payDeposit', '0');
    params.append('payMileage', '20000');
    params.append('pageMode', 'detailWrap');

    const res = await fetch(url, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://m.hicarzautoplan.com/cars/index/view/'
      }
    });
    const data = await res.json();
    return data.info?.priceTotal || 0;
  }

  const basePrice = await getPrice();
  const withOptPrice = await getPrice('46523'); // Dual Wide Sunroof

  console.log('Base Price:', basePrice);
  console.log('With Opt Price:', withOptPrice);
  console.log('Difference:', withOptPrice - basePrice);
}

test();
