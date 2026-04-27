const fs = require('fs');

async function crawlCategory(nation) {
  const cars = [];
  for (let page = 1; page <= 10; page++) {
    console.log(`Crawling ${nation} cars, page ${page}...`);
    const url = `https://m.hicarzautoplan.com/cars/index/index/?layout=clear&search[where][makerNationCode]=${nation}&page=${page}`;
    
    try {
      const response = await fetch(url);
      const html = await response.text();
      
      const listRegex = /<div class="list">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
      let match;
      let count = 0;

      while ((match = listRegex.exec(html)) !== null) {
        const content = match[1];

        const brandMatch = content.match(/<span class="brand"><img src="(.*?)"><\/span>/);
        const brandLogo = brandMatch ? brandMatch[1] : '';

        const nameMatch = content.match(/<\/span>\s*(.*?)<\/h3>/);
        const name = nameMatch ? nameMatch[1].replace(/<[^>]*>?/gm, '').trim() : '';

        const rentMatch = content.match(/<span class="overell">렌트<\/span>[\s\S]*?<span class="num">(.*?)<\/span>/);
        const rentPrice = rentMatch ? rentMatch[1] : '';

        const leaseMatch = content.match(/<span class="overell">리스<\/span>[\s\S]*?<span class="num">(.*?)<\/span>/);
        const leasePrice = leaseMatch ? leaseMatch[1] : '';

        const imgMatch = content.match(/<img class="img-responsive" src="(.*?)"/);
        const thumbnailUrl = imgMatch ? imgMatch[1] : '';

        const categoryMatch = content.match(/<p>\s*([^<]*?)\s*<span/);
        const category = categoryMatch ? categoryMatch[1].trim() : '';

        if (name) {
          cars.push({
            name,
            brandLogo,
            rentPrice,
            leasePrice,
            thumbnailUrl,
            nation,
            category
          });
          count++;
        }
      }
      
      console.log(`Found ${count} cars.`);
      if (count === 0) break;
    } catch (e) {
      console.error(`Error:`, e);
    }
  }
  return cars;
}

async function start() {
  const korCars = await crawlCategory('kor');
  const etcCars = await crawlCategory('etc');
  const allCars = [...korCars, ...etcCars];
  console.log(`Total cars extracted: ${allCars.length}`);
  fs.writeFileSync('cars_detailed_final.json', JSON.stringify(allCars, null, 2), 'utf8');
}

start();
