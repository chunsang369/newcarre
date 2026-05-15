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

async function findScenicImage() {
  try {
    console.log('Searching for Scenic...');
    const res = await axios.get('https://chasalddae.com/leaserent/leaserent_search?keyword=세닉', {
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
    
    // Look for image URLs directly in the search results
    const imgMatch = decoded.match(/https:\/\/img\.chasalddae\.com\/model\/car_images\/[^"]+\.(?:png|jpg|jpeg)/);
    if (imgMatch) {
        console.log(`Found image in search: ${imgMatch[0]}`);
        await downloadImage(imgMatch[0], 'renault-korea-5439');
        return;
    }
    
    console.log('No image found in search results. Trying to find list item...');
    const listMatch = decoded.match(/"list":(\[.*?\])/);
    if (listMatch) {
        const list = JSON.parse(listMatch[1]);
        if (list.length > 0) {
            console.log(`Found ${list.length} items. Using first one: ${list[0].model_name} (id: ${list[0].id})`);
            const imgUrl = list[0].car_images?.[0] || list[0].main_image;
            if (imgUrl) {
                await downloadImage(imgUrl, 'renault-korea-5439');
                return;
            }
        }
    }
    
    console.error('Could not find Scenic image.');
  } catch (e) {
    console.error('Failed to search Scenic', e.message);
  }
}

findScenicImage();
