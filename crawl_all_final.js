const fs = require('fs');

async function crawl() {
  const allCars = [];
  const seen = new Set();
  
  const categories = [
    { nation: 'kor', label: 'Domestic' },
    { nation: 'etc', label: 'Imported' }
  ];

  for (const cat of categories) {
    console.log(`Crawling ${cat.label} cars...`);
    for (let page = 1; page <= 10; page++) {
      const url = `https://m.hicarzautoplan.com/cars/index/index/?layout=clear&search[where][makerNationCode]=${cat.nation}&search[where][idxMaker]=all&page=${page}`;
      
      try {
        const response = await fetch(url);
        const html = await response.text();
        
        const listRegex = /<div class="list">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
        let match;
        let newFound = 0;
        let count = 0;

        while ((match = listRegex.exec(html)) !== null) {
          const content = match[1];

          const brandMatch = content.match(/<span class="brand"><img src="(.*?)"><\/span>/);
          const brandLogo = brandMatch ? brandMatch[1] : '';

          const nameMatch = content.match(/<\/span>\s*(.*?)<\/h3>/);
          const name = nameMatch ? nameMatch[1].replace(/<[^>]*>?/gm, '').trim() : '';

          if (name && !seen.has(name)) {
            seen.add(name);

            const rentMatch = content.match(/<span class="overell">렌트<\/span>[\s\S]*?<span class="num">(.*?)<\/span>/);
            const rentPrice = rentMatch ? rentMatch[1] : '';

            const leaseMatch = content.match(/<span class="overell">리스<\/span>[\s\S]*?<span class="num">(.*?)<\/span>/);
            const leasePrice = leaseMatch ? leaseMatch[1] : '';

            const imgMatch = content.match(/<img class="img-responsive" src="(.*?)"/);
            const thumbnailUrl = imgMatch ? imgMatch[1] : '';

            const categoryMatch = content.match(/<p>\s*([^<]*?)\s*<span/);
            const category = categoryMatch ? categoryMatch[1].trim() : '';

            const fuels = [];
            if (content.includes('class="gas"')) fuels.push('GASOLINE');
            if (content.includes('class="dis"')) fuels.push('DIESEL');
            if (content.includes('class="hib"')) fuels.push('HYBRID');
            if (content.includes('class="ele"')) fuels.push('EV');
            if (content.includes('class="lpg"')) fuels.push('LPG');

            allCars.push({
              name,
              brandLogo,
              rentPrice,
              leasePrice,
              thumbnailUrl,
              category,
              fuels,
              nation: cat.nation
            });
            newFound++;
          }
          count++;
        }
        
        console.log(`  Page ${page}: Total items: ${count}, New items: ${newFound}`);
        if (newFound === 0 || count === 0) break;
      } catch (e) {
        console.error(`  Error:`, e);
      }
    }
  }

  console.log(`Total unique cars: ${allCars.length}`);
  fs.writeFileSync('cars_final_full.json', JSON.stringify(allCars, null, 2), 'utf8');
}

crawl();
