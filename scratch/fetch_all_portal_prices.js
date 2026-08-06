const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const trimId = '6342';
  const periods = ['36', '48', '60'];
  const distances = [
    { label: '10000', value: '1m' },
    { label: '20000', value: '2m' },
    { label: '30000', value: '3m' }
  ];
  const conditions = [
    { label: 'PREPAY_30', adPayment: 30, deposit: 0 },
    { label: 'DEPOSIT_30', adPayment: 0, deposit: 30 },
    { label: 'NO_DEPOSIT', adPayment: 0, deposit: 0 }
  ];

  const results = {};

  console.log('Starting batch fetch from portal-api...');
  
  for (const period of periods) {
    for (const dist of distances) {
      for (const cond of conditions) {
        const url = `https://portal-api.chasalddae.com/rental/rental-calc-monthly?trimId=${trimId}&domain=chasalddae.com&adPayment=${cond.adPayment}&deposit=${cond.deposit}&period=${period}&distance=${dist.value}&insuranceAge=26&oiColorSumPrice=0&trimOptSumPrice=0`;
        
        const key = `${period}_${cond.label}_${dist.label}`;
        
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          
          const json = await res.json();
          if (json.code === '200' && json.data) {
            results[key] = {
              rent: json.data.rent_price,
              lease: json.data.lease_price
            };
            console.log(`Successfully fetched ${key}: Rent = ${json.data.rent_price}원, Lease = ${json.data.lease_price}원`);
          } else {
            console.log(`Failed for ${key}: ${json.message}`);
          }
        } catch (e) {
          console.error(`Error fetching ${key}:`, e.message);
        }
        
        // API 서버 과부하 방지 및 안정적인 조회를 위해 100ms 대기
        await sleep(100);
      }
    }
  }

  // JSON 파일로 기록
  fs.writeFileSync('scratch/chasalddae_model_y_api_prices.json', JSON.stringify(results, null, 2));
  console.log('\nFinished fetching all pricing data!');
  console.log('Saved data to scratch/chasalddae_model_y_api_prices.json');
}

main().catch(console.error);
