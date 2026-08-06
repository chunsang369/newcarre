const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPricesForTrim(trimId) {
  const periods = ['36', '48', '60'];
  const distances = [
    { label: '10000', value: '1m' },
    { label: '20000', value: '2m' }
  ];
  const conditions = [
    { label: 'NO_DEPOSIT', adPayment: 0, deposit: 0 },
    { label: 'DEPOSIT_30', adPayment: 0, deposit: 30 },
    { label: 'PREPAY_30', adPayment: 30, deposit: 0 }
  ];

  const results = {};
  console.log(`Starting fetch for trimId: ${trimId}...`);

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
            console.log(`  [${trimId}] ${key}: Rent = ${json.data.rent_price}원, Lease = ${json.data.lease_price}원`);
          } else {
            console.log(`  [${trimId}] Failed for ${key}: ${json.message}`);
          }
        } catch (e) {
          console.error(`  [${trimId}] Error fetching ${key}:`, e.message);
        }
        await sleep(150);
      }
    }
  }
  return results;
}

async function main() {
  const electricPrices = await fetchPricesForTrim('5605'); // 캐스퍼 일렉트릭
  const basePrices = await fetchPricesForTrim('5608'); // 캐스퍼 기본

  const allResults = {
    '5605': electricPrices,
    '5608': basePrices
  };

  fs.writeFileSync('scratch/casper_fetched_prices.json', JSON.stringify(allResults, null, 2));
  console.log('Saved fetched prices to scratch/casper_fetched_prices.json');
}

main().catch(console.error);
