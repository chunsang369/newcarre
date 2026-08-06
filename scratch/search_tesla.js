const fs = require('fs');
const v2Data = JSON.parse(fs.readFileSync('scratch/chasalddae_details_v2.json', 'utf8'));

const teslaCars = [];
for (const key in v2Data) {
  const car = v2Data[key];
  if (car.brand === '테슬라' || (car.modelName && car.modelName.toLowerCase().includes('tesla')) || (car.modelName && car.modelName.includes('모델'))) {
    // 테슬라 브랜드이거나 모델3, 모델Y 등
    if (car.brand === '테슬라') {
      teslaCars.push({ key, ...car });
    }
  }
}

console.log('테슬라 매칭 차량 수:', teslaCars.length);

for (const car of teslaCars) {
  console.log('-------------------------------------------');
  console.log(`Key: ${car.key}`);
  console.log(`ModelName: ${car.modelName}`);
  console.log(`Summary: ${car.summary}`);
  console.log(`MonthlyRent: ${car.monthlyRent}, MonthlyLease: ${car.monthlyLease}`);
  console.log(`BasePrice: ${car.grades?.[0]?.trims?.[0]?.price || 'N/A'}`);
}
