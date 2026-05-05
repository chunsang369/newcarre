/**
 * crawl_car_images.js
 * 
 * Attempts multiple strategies to find real car images:
 * 1. img.chasalddae.com/model/car_images/ pattern
 * 2. Manufacturer press images (known CDN patterns)
 * 3. Parse actual HTML for lazy-loaded images
 */
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Known manufacturer image CDN patterns
const MANUFACTURER_IMAGES = {
  // 현대
  '현대-디 올 뉴 팰리세이드': 'https://www.hyundai.com/contents/vr360/LX06/exterior/A2B/001.png',
  '현대-디 올 뉴 팰리세이드 HEV': 'https://www.hyundai.com/contents/vr360/LX06/exterior/A2B/001.png',
  '현대-디 올-뉴 싼타페(MX5)': 'https://www.hyundai.com/contents/vr360/MX06/exterior/A2B/001.png',
  '현대-디 올-뉴 싼타페 HEV(MX5)': 'https://www.hyundai.com/contents/vr360/MX06/exterior/A2B/001.png',
  '현대-더 뉴 투싼 (NX4 F/L)': 'https://www.hyundai.com/contents/vr360/NX4F/exterior/A2B/001.png',
  '현대-더 뉴 투싼 HEV (NX4 F/L)': 'https://www.hyundai.com/contents/vr360/NX4F/exterior/A2B/001.png',
  '현대-디 올-뉴 그랜저(GN7)': 'https://www.hyundai.com/contents/vr360/GN7/exterior/A2B/001.png',
  '현대-디 올-뉴 그랜저 HEV(GN7)': 'https://www.hyundai.com/contents/vr360/GN7/exterior/A2B/001.png',
  '현대-더 뉴 아반떼(CN7 F/L)': 'https://www.hyundai.com/contents/vr360/CN7F/exterior/A2B/001.png',
  '현대-더 뉴 아반떼 HEV(CN7 F/L)': 'https://www.hyundai.com/contents/vr360/CN7F/exterior/A2B/001.png',
  '현대-더 뉴 아이오닉5': 'https://www.hyundai.com/contents/vr360/NE1F/exterior/A2B/001.png',
  '현대-아이오닉5N': 'https://www.hyundai.com/contents/vr360/NE1N/exterior/A2B/001.png',
  '현대-더 뉴 캐스퍼': 'https://www.hyundai.com/contents/vr360/AX1F/exterior/A2B/001.png',
  '현대-캐스퍼 일렉트릭': 'https://www.hyundai.com/contents/vr360/AX1E/exterior/A2B/001.png',
  '현대-쏘나타 디 엣지(DN8 F/L)': 'https://www.hyundai.com/contents/vr360/DN8F/exterior/A2B/001.png',
  '현대-쏘나타 디 엣지 HEV(DN8 F/L)': 'https://www.hyundai.com/contents/vr360/DN8F/exterior/A2B/001.png',
  '현대-디 올 뉴 코나EV(SX2)': 'https://www.hyundai.com/contents/vr360/SX2E/exterior/A2B/001.png',
  '현대-디 올 뉴 코나(SX2)': 'https://www.hyundai.com/contents/vr360/SX2/exterior/A2B/001.png',
  '현대-디 올 뉴 코나 HEV(SX2)': 'https://www.hyundai.com/contents/vr360/SX2/exterior/A2B/001.png',
  '현대-아이오닉6 N': 'https://www.hyundai.com/contents/vr360/CE1N/exterior/A2B/001.png',
};

async function tryFetchImage(url) {
  try {
    const res = await axios.head(url, { timeout: 5000 });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function findChasalddaeImage(trimId) {
  // Try known chasalddae image patterns
  const patterns = [
    `https://img.chasalddae.com/model/car_images/${trimId}.png`,
    `https://img.chasalddae.com/model/car_images/${trimId}.jpg`,
  ];
  
  for (const url of patterns) {
    if (await tryFetchImage(url)) {
      return url;
    }
  }
  return null;
}

async function parseDetailPageForImages(trimId) {
  try {
    const res = await axios.get(`https://chasalddae.com/leaserent/leaserent_detail?trim_id=${trimId}`, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(res.data);
    
    // Try various selectors for car images
    const selectors = [
      'img[src*="car_images"]',
      'img[src*="model"]',
      'img[data-src*="car"]',
      '.car-image img',
      '.car_img img',
      '.img-box img',
      'img[alt*="차량"]',
      'img[src*="chasalddae"][src*="model"]',
    ];
    
    for (const sel of selectors) {
      const el = $(sel).first();
      if (el.length) {
        const src = el.attr('src') || el.attr('data-src');
        if (src && !src.includes('logo.png') && !src.includes('icon')) {
          return src.startsWith('http') ? src : `https://chasalddae.com${src}`;
        }
      }
    }
    
    // Check all img tags
    const allImages = [];
    $('img').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || '';
      if (src && !src.includes('logo') && !src.includes('icon') && !src.includes('svg')) {
        allImages.push(src);
      }
    });
    
    if (allImages.length > 0) {
      return allImages[0].startsWith('http') ? allImages[0] : `https://chasalddae.com${allImages[0]}`;
    }
    
    return null;
  } catch {
    return null;
  }
}

async function main() {
  const details = JSON.parse(fs.readFileSync('scratch/chasalddae_details.json', 'utf8'));
  const list = JSON.parse(fs.readFileSync('scratch/chasalddae_list_clean.json', 'utf8'));
  
  const imageMap = {};
  
  // ALL cars
  const batch = list;
  
  console.log(`=== Image Discovery for ALL ${batch.length} cars ===\n`);
  
  for (let i = 0; i < batch.length; i++) {
    const car = batch[i];
    const key = `${car.brand}-${car.modelName}`;
    if (i % 20 === 0) console.log(`--- Batch ${Math.floor(i/20)+1} (${i+1}-${Math.min(i+20, batch.length)}/${batch.length}) ---`);
    process.stdout.write(`[${i+1}/${batch.length}] ${car.fullName}... `);
    
    // Strategy 1: Manual manufacturer mapping
    if (MANUFACTURER_IMAGES[key]) {
      console.log(`✅ Manufacturer`);
      imageMap[car.trimId] = { url: MANUFACTURER_IMAGES[key], source: 'manufacturer' };
      continue;
    }
    
    // Strategy 2: Chasalddae CDN pattern
    const chasalddaeImg = await findChasalddaeImage(car.trimId);
    if (chasalddaeImg) {
      console.log(`✅ CDN`);
      imageMap[car.trimId] = { url: chasalddaeImg, source: 'chasalddae_cdn' };
      continue;
    }
    
    // Strategy 3: Parse detail page HTML
    const parsedImg = await parseDetailPageForImages(car.trimId);
    if (parsedImg) {
      console.log(`✅ HTML`);
      imageMap[car.trimId] = { url: parsedImg, source: 'html_parse' };
      continue;
    }
    
    console.log(`❌ MISS`);
    imageMap[car.trimId] = { url: null, source: 'none', brand: car.brand, model: car.modelName };
    
    await delay(300);
  }
  
  // Summary
  const found = Object.values(imageMap).filter(v => v.url).length;
  console.log(`\n=== SUMMARY ===`);
  console.log(`Found: ${found}/20`);
  console.log(`Missing: ${20 - found}/20`);
  
  fs.writeFileSync('scratch/car_image_map.json', JSON.stringify(imageMap, null, 2));
  console.log(`\nSaved to scratch/car_image_map.json`);
}

main().catch(console.error);
