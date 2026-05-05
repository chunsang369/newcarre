const https = require('https');
const fs = require('fs');

async function getPage(page) {
  return new Promise((resolve, reject) => {
    https.get(`https://chasalddae.com/leaserent/leaserent_search?page=${page}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const allCars = [];
  for (let page = 1; page <= 9; page++) {
    console.log(`Fetching page ${page}...`);
    const data = await getPage(page);
    
    // Search for any "id":NNNN or "model_id":NNNN or leaserent_detail?trim_id=NNNN
    const trimRegex = /trim_id=(\d+)/gi;
    let match;
    const trimIds = new Set();
    while ((match = trimRegex.exec(data)) !== null) {
      trimIds.add(parseInt(match[1]));
    }
    
    // Let's also look for self.__next_f hydration to see if we can find full car objects
    const fRegex = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/gi;
    let fMatch;
    let fullF = '';
    while ((fMatch = fRegex.exec(data)) !== null) {
      fullF += fMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
    }
    
    // Find substrings with "car_list" or containing car info
    // Match anything like {"id":NNN,"model_id":NNN,"model_name":"..."}
    const carRegex = /\{"id":(\d+),"model_id":(\d+),"car_image1":"([^"]+)","brand_logo":"([^"]+)","brand_name":"([^"]+)","model_name":"([^"]+)","lineup_name":"([^"]+)","trim_name":"([^"]+)","car_price":(\d+)/gi;
    
    let cMatch;
    while ((cMatch = carRegex.exec(fullF)) !== null) {
      allCars.push({
        trim_id: parseInt(cMatch[1]),
        model_id: parseInt(cMatch[2]),
        car_image1: cMatch[3],
        brand_name: cMatch[5],
        model_name: cMatch[6],
        lineup_name: cMatch[7],
        trim_name: cMatch[8],
        car_price: parseInt(cMatch[9])
      });
    }
    
    console.log(`Found ${trimIds.size} trim IDs via regex and ${allCars.length} cars from hydration on page ${page}`);
  }
  
  fs.writeFileSync('scratch/chasalddae_all_cars.json', JSON.stringify(allCars, null, 2), 'utf8');
  console.log(`Saved ${allCars.length} total car entries to scratch/chasalddae_all_cars.json`);
}

main().catch(console.error);
