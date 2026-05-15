const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

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
        console.log(`Fetching https://chasalddae.com/leaserent/leaserent_detail?trim_id=${trimId}`);
        const res = await axios.get(`https://chasalddae.com/leaserent/leaserent_detail?trim_id=${trimId}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        let fullRscString = '';
        for (const line of res.data.split('\n')) {
            if (line.includes('self.__next_f.push(')) {
                const match = line.match(/self\.__next_f\.push\(\[1,"(.*)"\]\)</);
                if (match) fullRscString += match[1];
            }
        }
        let decoded = fullRscString.replace(/\\\\/g, '\\').replace(/\\"/g, '"');
        
        const match = decoded.match(/https:\/\/img\.chasalddae\.com\/model\/car_images\/[^"]+\.(?:png|jpg|jpeg)/);
        if (match) return match[0];
        
        // Fallback: search for any image in the decoded string
        const imgMatch = decoded.match(/https:\/\/img\.chasalddae\.com\/[^"]+\.(?:png|jpg|jpeg)/);
        if (imgMatch) return imgMatch[0];

    } catch(e) {
        console.error(`Failed to fetch detail for ${trimId}: ${e.message}`);
    }
    return null;
}

async function run() {
    const items = [
        { trimId: 5439, slug: 'renault-korea-5439' }
    ];

    for (const item of items) {
        console.log(`Extracting image URL for ${item.slug}...`);
        const imgUrl = await extractImageFromDetail(item.trimId);
        if (imgUrl) {
            await downloadImage(imgUrl, item.slug);
        } else {
            console.error(`❌ Could not find image URL for ${item.slug}`);
        }
    }
}

run();
