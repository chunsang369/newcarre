const https = require('https');
const fs = require('fs');

function fetchPage(pageNo) {
  return new Promise((resolve, reject) => {
    https.get(`https://chasalddae.com/leaserent/leaserent_search?page=${pageNo}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const regex = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/gi;
        let match;
        let fullF = '';
        while ((match = regex.exec(data)) !== null) {
          fullF += match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
        }
        
        const cars = [];
        const carRegex = /"model_name":"([^"]+)","segment":"[^"]*","year_type":"[^"]*","lineup_name":"[^"]*","fuel_type":"[^"]*","trim_name":"[^"]*","car_image1":"([^"]+)"/g;
        let cm;
        while ((cm = carRegex.exec(fullF)) !== null) {
          cars.push({ model_name: cm[1], car_image1: cm[2] });
        }
        resolve(cars);
      });
    }).on('error', reject);
  });
}

async function main() {
  const allCars = [];
  for (let p = 1; p <= 9; p++) {
    try {
      const pageCars = await fetchPage(p);
      allCars.push(...pageCars);
    } catch (err) {
      console.error(err);
    }
  }
  
  const seen = new Set();
  const deduped = [];
  for (const c of allCars) {
    if (!seen.has(c.model_name)) {
      seen.add(c.model_name);
      deduped.push(c);
    }
  }
  
  fs.writeFileSync('scratch/chasalddae_scraped_images.json', JSON.stringify(deduped, null, 2), 'utf8');
  console.log(`Saved ${deduped.length} deduped cars to scratch/chasalddae_scraped_images.json`);
}

main();
