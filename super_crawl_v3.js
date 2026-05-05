const fs = require('fs');

const makers = [
  { "id": "1", "name": "현대", "nation": "kor" },
  { "id": "2", "name": "기아", "nation": "kor" },
  { "id": "19", "name": "제네시스", "nation": "kor" },
  { "id": "3", "name": "르노코리아", "nation": "kor" },
  { "id": "18", "name": "쉐보레", "nation": "kor" },
  { "id": "8", "name": "KGM", "nation": "kor" },
  { "id": "21", "name": "BMW", "nation": "etc" },
  { "id": "56", "name": "벤츠", "nation": "etc" },
  { "id": "58", "name": "아우디", "nation": "etc" },
  { "id": "57", "name": "미니", "nation": "etc" },
  { "id": "26", "name": "볼보", "nation": "etc" },
  { "id": "28", "name": "폭스바겐", "nation": "etc" },
  { "id": "29", "name": "토요타", "nation": "etc" },
  { "id": "30", "name": "렉서스", "nation": "etc" },
  { "id": "34", "name": "혼다", "nation": "etc" },
  { "id": "36", "name": "랜드로버", "nation": "etc" },
  { "id": "37", "name": "재규어", "nation": "etc" },
  { "id": "31", "name": "포드", "nation": "etc" },
  { "id": "44", "name": "링컨", "nation": "etc" },
  { "id": "35", "name": "지프", "nation": "etc" },
  { "id": "59", "name": "GMC", "nation": "etc" },
  { "id": "45", "name": "캐딜락", "nation": "etc" },
  { "id": "38", "name": "푸조", "nation": "etc" },
  { "id": "41", "name": "테슬라", "nation": "etc" },
  { "id": "40", "name": "DS", "nation": "etc" },
  { "id": "42", "name": "폴스타", "nation": "etc" },
  { "id": "43", "name": "루시드", "nation": "etc" },
  { "id": "53", "name": "로터스", "nation": "etc" },
  { "id": "48", "name": "마세라티", "nation": "etc" },
  { "id": "33", "name": "포르쉐", "nation": "etc" },
  { "id": "49", "name": "벤틀리", "nation": "etc" },
  { "id": "47", "name": "페라리", "nation": "etc" },
  { "id": "46", "name": "람보르기니", "nation": "etc" },
  { "id": "51", "name": "애스턴마틴", "nation": "etc" },
  { "id": "52", "name": "맥라렌", "nation": "etc" },
  { "id": "50", "name": "롤스로이스", "nation": "etc" },
  { "id": "60", "name": "이네오스", "nation": "etc" },
  { "id": "62", "name": "BYD", "nation": "etc" }
];

async function crawl() {
  const allCarsMap = new Map();
  
  for (const maker of makers) {
    console.log(`Crawling ${maker.name} (ID: ${maker.id})...`);
    
    // We will crawl "prepay", "deposit", and "none" conditions
    const conditions = [
      { code: 'prepay', name: '선납금30%' },
      { code: 'deposit', name: '보증금30%' },
      { code: 'none', name: '무보증' }
    ];

    for (const condition of conditions) {
      console.log(`  -> Condition: ${condition.name}`);
      for (let page = 1; page <= 3; page++) {
        const url = `https://m.hicarzautoplan.com/cars/index/index/?layout=clear&search[where][idxMaker]=${maker.id}&limit=100&page=${page}&search[where][priceDepositCode]=${condition.code}`;
        
        try {
          const response = await fetch(url);
          const html = await response.text();
          
          const fragments = html.split('<div class="list">').slice(1);

          for (const content of fragments) {
            const nameMatch = content.match(/<h3><span class="brand">.*?<\/span>\s*(.*?)<\/h3>/);
            let name = nameMatch ? nameMatch[1].replace(/<[^>]*>?/gm, '').trim() : '';
            
            if (!name) {
                const altNameMatch = content.match(/<h3>(.*?)<\/h3>/);
                name = altNameMatch ? altNameMatch[1].replace(/<[^>]*>?/gm, '').trim() : '';
            }

            if (name) {
              const id = maker.id + '_' + name;

              const rentMatch = content.match(/<span class="overell">렌트<\/span>[\s\S]*?<span class="num">(.*?)<\/span>/);
              const rentPriceStr = rentMatch ? rentMatch[1] : '0원';

              const leaseMatch = content.match(/<span class="overell">리스<\/span>[\s\S]*?<span class="num">(.*?)<\/span>/);
              const leasePriceStr = leaseMatch ? leaseMatch[1] : '0원';

              const imgMatch = content.match(/<img class="img-responsive" src="(.*?)"/);
              const thumbnailUrl = imgMatch ? (imgMatch[1].startsWith('http') ? imgMatch[1] : 'https://m.hicarzautoplan.com' + imgMatch[1]) : '';

              const categoryMatch = content.match(/<p>\s*([^<]*?)\s*(?:<span|\n)/);
              const category = categoryMatch ? categoryMatch[1].trim() : '';

              const fuels = [];
              if (content.includes('class="gas"')) fuels.push('GASOLINE');
              if (content.includes('class="dis"')) fuels.push('DIESEL');
              if (content.includes('class="hib"')) fuels.push('HYBRID');
              if (content.includes('class="ele"')) fuels.push('EV');
              if (content.includes('class="lpg"')) fuels.push('LPG');

              if (!allCarsMap.has(id)) {
                allCarsMap.set(id, {
                  brand: maker.name,
                  brandId: maker.id,
                  nation: maker.nation,
                  name,
                  thumbnailUrl,
                  category,
                  fuels,
                  priceMatrix: { rent: {}, lease: {} }
                });
              }
              
              const car = allCarsMap.get(id);
              car.priceMatrix.rent[condition.code] = rentPriceStr;
              car.priceMatrix.lease[condition.code] = leasePriceStr;
            }
          }
          
          console.log(`    Page ${page}: Found ${fragments.length} items`);
          if (fragments.length < 10) break;
        } catch (e) {
          console.error(`    Error crawling ${maker.name} page ${page}:`, e);
        }
      }
    }
  }

  const allCars = Array.from(allCarsMap.values());
  console.log(`Total unique cars extracted: ${allCars.length}`);
  fs.writeFileSync('cars_final_full_matrix.json', JSON.stringify(allCars, null, 2), 'utf8');
}

crawl();
