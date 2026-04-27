const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('hicarz_cars.html', 'utf8');

// Regex to find all car list items
const listRegex = /<div class="list">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
const cars = [];
let match;

while ((match = listRegex.exec(html)) !== null) {
  const content = match[1];

  // Extract Brand Logo URL
  const brandMatch = content.match(/<span class="brand"><img src="(.*?)"><\/span>/);
  const brandLogo = brandMatch ? brandMatch[1] : '';

  // Extract Car Name
  const nameMatch = content.match(/<\/span>\s*(.*?)<\/h3>/);
  const name = nameMatch ? nameMatch[1].trim() : '';

  // Extract Rent Price
  const rentMatch = content.match(/<span class="overell">렌트<\/span>[\s\S]*?<span class="num">(.*?)<\/span>/);
  const rentPrice = rentMatch ? rentMatch[1] : '';

  // Extract Lease Price
  const leaseMatch = content.match(/<span class="overell">리스<\/span>[\s\S]*?<span class="num">(.*?)<\/span>/);
  const leasePrice = leaseMatch ? leaseMatch[1] : '';

  // Extract Image
  const imgMatch = content.match(/<img class="img-responsive" src="(.*?)"/);
  const thumbnailUrl = imgMatch ? imgMatch[1] : '';

  if (name) {
    cars.push({
      name,
      brandLogo,
      rentPrice,
      leasePrice,
      thumbnailUrl
    });
  }
}

console.log(`Extracted ${cars.length} cars.`);
fs.writeFileSync('cars_extracted.json', JSON.stringify(cars, null, 2), 'utf8');
