const fs = require('fs');
const v2Data = JSON.parse(fs.readFileSync('scratch/chasalddae_details_v2.json', 'utf8'));

console.log('총 차량 수:', Object.keys(v2Data).length);

const avanteCars = [];
for (const key in v2Data) {
  const car = v2Data[key];
  if (car.modelName && car.modelName.includes('아반떼')) {
    avanteCars.push({ key, ...car });
  }
}

console.log('아반떼 매칭 차량 수:', avanteCars.length);

for (const car of avanteCars) {
  console.log('-------------------------------------------');
  console.log(`Key: ${car.key}`);
  console.log(`ModelName: ${car.modelName}`);
  console.log(`Brand: ${car.brand}`);
  console.log(`Summary: ${car.summary}`);
  console.log(`MonthlyRent: ${car.monthlyRent}, MonthlyLease: ${car.monthlyLease}`);
  console.log(`Grades 수: ${car.grades ? car.grades.length : 0}`);
  
  if (car.grades) {
    for (const grade of car.grades) {
      console.log(`  Grade Name: ${grade.name}`);
      if (grade.trims) {
        for (const trim of grade.trims) {
          console.log(`    Trim: ${trim.name}, Price: ${trim.price}`);
        }
      }
    }
  }
}
