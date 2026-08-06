const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchForTrim(trimId) {
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
  console.log(`Starting fetch for Trim ID: ${trimId}...`);

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
          }
        } catch (e) {
          console.error(`Error fetching ${trimId} ${key}:`, e.message);
        }
        await sleep(100);
      }
    }
  }
  return results;
}

async function main() {
  // 1. RWD (6341) 수집
  const rwdPrices = await fetchForTrim('6341');
  fs.writeFileSync('scratch/chasalddae_6341_prices.json', JSON.stringify(rwdPrices, null, 2));
  console.log('Saved 6341 prices to scratch/chasalddae_6341_prices.json');

  // 2. Long Range (6342) 수집 (혹시 몰라 재수집 및 대조)
  const lrPrices = await fetchForTrim('6342');
  fs.writeFileSync('scratch/chasalddae_6342_prices.json', JSON.stringify(lrPrices, null, 2));
  console.log('Saved 6342 prices to scratch/chasalddae_6342_prices.json');
}

main().catch(console.error);
