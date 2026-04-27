const fs = require('fs');
const cars = JSON.parse(fs.readFileSync('cars_detailed.json', 'utf8'));
const mapping = {};
cars.forEach(c => {
  if (!mapping[c.brandLogo]) {
    mapping[c.brandLogo] = c.name;
  }
});
console.log(mapping);
