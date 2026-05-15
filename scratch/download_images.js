const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

const imageUrls = [
  { slug: 'kia-carnival-heritage', url: 'https://chasalddae.com/images/cars/2505.png' },
  { slug: 'tesla-model-y-juniper', url: 'https://chasalddae.com/images/cars/6341.png' },
  { slug: 'vw-touareg-2026', url: 'https://chasalddae.com/images/cars/6154.png' },
  { slug: 'peugeot-5008-2026', url: 'https://chasalddae.com/images/cars/7929.png' },
];

async function downloadImage(url, filename) {
  const filepath = path.resolve(__dirname, '../public/images/cars', `${filename}.png`);
  console.log(`Downloading ${url} to ${filepath}`);
  
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        console.error(`Failed to download ${url}: ${res.statusCode}`);
        resolve(); // resolve anyway to continue
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

async function findGv80Trims() {
  try {
    const res = await axios.get('https://chasalddae.com/leaserent/leaserent_search?keyword=GV80', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    // Parse RSC
    let fullRscString = '';
    for (const line of res.data.split('\n')) {
      if (line.includes('self.__next_f.push(')) {
        const match = line.match(/self\.__next_f\.push\(\[1,"(.*)"\]\)</);
        if (match) fullRscString += match[1];
      }
    }
    let decoded = fullRscString.replace(/\\\\/g, '\\').replace(/\\"/g, '"');
    
    // Find GV80 trims
    const match = decoded.match(/"list":(\[.*?\])/);
    if (match) {
        try {
            const list = JSON.parse(match[1]);
            const gv80s = list.filter(item => item.model_name && item.model_name.includes('GV80'));
            for (const item of gv80s) {
                console.log(`Found GV80: ${item.model_name} (trimId: ${item.id})`);
                if (item.model_name === 'GV80(JX F/L)') {
                    await downloadImage(`https://chasalddae.com/images/cars/${item.id}.png`, 'genesis-gv80-1234');
                } else if (item.model_name === 'GV80 쿠페(JX F/L)') {
                    await downloadImage(`https://chasalddae.com/images/cars/${item.id}.png`, 'genesis-gv80');
                }
            }
        } catch(e) {
            console.error('Failed to parse list JSON', e);
        }
    }
  } catch (e) {
    console.error('Failed to search GV80', e);
  }
}

async function run() {
  for (const item of imageUrls) {
    await downloadImage(item.url, item.slug);
  }
  await findGv80Trims();
  console.log('Done!');
}

run();
