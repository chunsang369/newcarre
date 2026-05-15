const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

const MISSING_TRIMS = [
  { slug: 'kia-carnival-heritage', trimId: 2505 },
  { slug: 'tesla-model-y-juniper', trimId: 6341 },
  { slug: 'vw-touareg-2026', trimId: 6154 },
  { slug: 'peugeot-5008-2026', trimId: 7929 },
];

async function downloadImage(url, filename) {
  const filepath = path.resolve(__dirname, '../public/images/cars', `${filename}.png`);
  console.log(`Downloading ${url} to ${filepath}`);
  
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        console.error(`Failed to download ${url}: ${res.statusCode}`);
        resolve();
        return;
      }
      
      const fileStream = fs.createWriteStream(filepath);
      res.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✅ Saved ${filename}.png`);
        resolve();
      });
      
      fileStream.on('error', (err) => {
        console.error(`Error writing ${filename}.png:`, err);
        resolve();
      });
    }).on('error', (err) => {
      console.error(`Error fetching ${url}:`, err);
      resolve();
    });
  });
}

async function extractImageFromDetail(trimId) {
    try {
        const res = await axios.get(`https://chasalddae.com/leaserent/leaserent_detail?trim_id=${trimId}`);
        let fullRscString = '';
        for (const line of res.data.split('\n')) {
            if (line.includes('self.__next_f.push(')) {
                const match = line.match(/self\.__next_f\.push\(\[1,"(.*)"\]\)</);
                if (match) fullRscString += match[1];
            }
        }
        let decoded = fullRscString.replace(/\\\\/g, '\\').replace(/\\"/g, '"');
        
        // Find something like: https://img.chasalddae.com/model/car_images/20240805094627756.png
        const match = decoded.match(/https:\/\/img\.chasalddae\.com\/model\/car_images\/[^"]+\.(?:png|jpg|jpeg)/);
        if (match) return match[0];
    } catch(e) {
        console.error(`Failed to fetch detail for ${trimId}`);
    }
    return null;
}

async function findGv80Images() {
  try {
    const res = await axios.get('https://chasalddae.com/leaserent/leaserent_search?keyword=GV80', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    let fullRscString = '';
    for (const line of res.data.split('\n')) {
      if (line.includes('self.__next_f.push(')) {
        const match = line.match(/self\.__next_f\.push\(\[1,"(.*)"\]\)</);
        if (match) fullRscString += match[1];
      }
    }
    let decoded = fullRscString.replace(/\\\\/g, '\\').replace(/\\"/g, '"');
    
    const match = decoded.match(/"list":(\[.*?\])/);
    if (match) {
        try {
            const list = JSON.parse(match[1]);
            const gv80s = list.filter(item => item.model_name && item.model_name.includes('GV80'));
            for (const item of gv80s) {
                console.log(`Found GV80: ${item.model_name} (trimId: ${item.id})`);
                const imgMatch = item.car_images || ''; // Assuming car_images might be an array or string
                
                // Fetch detail to be safe
                const imgUrl = await extractImageFromDetail(item.id);
                if (imgUrl) {
                    if (item.model_name === 'GV80(JX F/L)') {
                        await downloadImage(imgUrl, 'genesis-gv80-1234');
                    } else if (item.model_name === 'GV80 쿠페(JX F/L)') {
                        await downloadImage(imgUrl, 'genesis-gv80');
                    }
                }
            }
        } catch(e) {}
    }
  } catch (e) {
    console.error('Failed to search GV80', e);
  }
}

async function run() {
  for (const item of MISSING_TRIMS) {
      console.log(`Extracting image URL for ${item.slug}...`);
      const imgUrl = await extractImageFromDetail(item.trimId);
      if (imgUrl) {
          await downloadImage(imgUrl, item.slug);
      } else {
          console.error(`❌ Could not find image URL for ${item.slug}`);
      }
  }
  
  console.log(`Extracting GV80 images...`);
  await findGv80Images();
  
  console.log('Done!');
}

run();
