const https = require('https');

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
  // Try fetching the first 5 pages to see if it varies or if it returns new cars
  for (let p = 1; p <= 9; p++) {
    console.log(`Fetching page ${p}...`);
    try {
      const pageCars = await fetchPage(p);
      console.log(`Page ${p} returned ${pageCars.length} cars.`);
      allCars.push(...pageCars);
    } catch (err) {
      console.error(err);
    }
  }
  
  // Deduplicate by model_name
  const seen = new Set();
  const deduped = [];
  for (const c of allCars) {
    if (!seen.has(c.model_name)) {
      seen.add(c.model_name);
      deduped.push(c);
    }
  }
  console.log(`Total deduped cars found: ${deduped.length}`);
  console.log(JSON.stringify(deduped, null, 2));
}

main();
