/**
 * crawl_chasalddae_v2.js
 * 
 * 개선된 크롤러: 이미지 + 옵션을 정확하게 재수집
 * - 이미지: img.chasalddae.com/model/car_images/ 패턴 사용
 * - 옵션: "02 옵션" 섹션 정확히 파싱
 * - 검색페이지: 월 렌트/리스 시세 추출
 */
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function crawlDetail(trimId) {
  const res = await axios.get(`https://chasalddae.com/leaserent/leaserent_detail?trim_id=${trimId}`, {
    timeout: 15000,
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const $ = cheerio.load(res.data);
  
  // === IMAGE ===
  let imageUrl = null;
  const imgSelectors = ['img[src*="car_images"]', 'img[src*="model"]', '.car-image img', '.img-box img'];
  for (const sel of imgSelectors) {
    const el = $(sel).first();
    if (el.length) {
      const src = el.attr('src') || el.attr('data-src');
      if (src && !src.includes('logo') && !src.includes('icon')) {
        imageUrl = src.startsWith('http') ? src : `https://chasalddae.com${src}`;
        break;
      }
    }
  }
  if (!imageUrl) {
    $('img').each((i, el) => {
      const src = $(el).attr('src') || '';
      if (src && !src.includes('logo') && !src.includes('icon') && !src.includes('svg') && src.includes('chasalddae')) {
        imageUrl = src.startsWith('http') ? src : `https://chasalddae.com${src}`;
        return false;
      }
    });
  }
  
  // === GRADES / TRIMS ===
  const grades = [];
  $('ul.list.hidden.flex-col').each((idx, ul) => {
    const gradeName = $(ul).prev().text().trim();
    const trims = [];
    $(ul).find('li').each((j, li) => {
      const text = $(li).text().trim();
      const match = text.match(/(.+?)\s*([0-9,]+)원/);
      if (match) {
        trims.push({
          name: match[1].trim(),
          price: parseInt(match[2].replace(/,/g, ''), 10)
        });
      }
    });
    if (gradeName && trims.length > 0) {
      grades.push({ name: gradeName, trims });
    }
  });
  
  // === OPTIONS (label state machine) ===
  const options = [];
  let inOptionsSection = false;
  
  $('label').each((i, el) => {
    const labelText = $(el).text().replace(/\s+/g, ' ').trim();
    
    // State transitions
    if (labelText.includes('02 옵션')) {
      inOptionsSection = true;
      return; // skip the header label itself
    }
    if (labelText.includes('03 계약조건') || labelText.includes('계약조건')) {
      inOptionsSection = false;
      return;
    }
    
    if (!inOptionsSection) return;
    
    const priceMatch = labelText.match(/([0-9,]+)원/);
    if (priceMatch) {
      let name = labelText.replace(priceMatch[0], '').trim();
      // Clean up
      name = name.replace(/\*상위 연계 옵션 선택 필요.*$/, '').trim();
      name = name.replace(/상위 연계 옵션 \|.*$/, '').trim();
      name = name.replace(/，/g, ',').trim();
      
      if (name && 
          !name.includes('차량 기본가') && 
          !name.includes('선택된 옵션이') &&
          !name.includes('선택 가능 옵션 없음') &&
          name.length > 1) {
        if (!options.find(o => o.name === name)) {
          options.push({
            name,
            price: parseInt(priceMatch[1].replace(/,/g, ''), 10)
          });
        }
      }
    }
  });

  
  return { imageUrl, grades, options };
}

async function crawlSearchPagePrices() {
  const prices = {};
  try {
    const res = await axios.get('https://chasalddae.com/leaserent/leaserent_search', {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(res.data);
    
    // Parse each car listing for rent/lease prices
    $('a[href*="leaserent_detail"]').each((i, el) => {
      const href = $(el).attr('href') || '';
      const trimMatch = href.match(/trim_id=(\d+)/);
      if (!trimMatch) return;
      
      const text = $(el).text().replace(/\s+/g, ' ');
      const rentMatch = text.match(/월 렌트\s*([0-9,]+)원/);
      const leaseMatch = text.match(/월 리스\s*([0-9,]+)원/);
      
      prices[trimMatch[1]] = {
        monthlyRent: rentMatch ? parseInt(rentMatch[1].replace(/,/g, ''), 10) : null,
        monthlyLease: leaseMatch ? parseInt(leaseMatch[1].replace(/,/g, ''), 10) : null,
      };
    });
  } catch (e) {
    console.error('Failed to crawl search page:', e.message);
  }
  return prices;
}

async function main() {
  const list = JSON.parse(fs.readFileSync('scratch/chasalddae_list_clean.json', 'utf8'));
  const existingDetails = JSON.parse(fs.readFileSync('scratch/chasalddae_details.json', 'utf8'));
  
  // Step 1: Get monthly prices from search page
  console.log('📊 Crawling search page for monthly prices...');
  const searchPrices = await crawlSearchPagePrices();
  console.log(`  Found prices for ${Object.keys(searchPrices).length} cars\n`);
  
  // Step 2: Re-crawl each car's detail page for image + options
  const updatedDetails = {};
  let imageFound = 0, optionsFound = 0;
  
  for (let i = 0; i < list.length; i++) {
    const car = list[i];
    const existing = existingDetails[car.trimId] || {};
    
    if (i % 20 === 0) console.log(`\n--- Batch ${Math.floor(i/20)+1} (${i+1}-${Math.min(i+20, list.length)}/${list.length}) ---`);
    process.stdout.write(`[${i+1}/${list.length}] ${car.fullName}... `);
    
    try {
      const detail = await crawlDetail(car.trimId);
      
      const hasImage = !!detail.imageUrl;
      const hasOptions = detail.options.length > 0;
      if (hasImage) imageFound++;
      if (hasOptions) optionsFound++;
      
      // Merge: use new data but keep existing grades if new ones failed
      updatedDetails[car.trimId] = {
        ...car,
        imageUrl: detail.imageUrl || existing.imageUrl || null,
        grades: detail.grades.length > 0 ? detail.grades : (existing.grades || []),
        options: detail.options, // Always use fresh options data
        colorsExt: existing.colorsExt || [],
        colorsInt: existing.colorsInt || [],
        monthlyRent: searchPrices[car.trimId]?.monthlyRent || null,
        monthlyLease: searchPrices[car.trimId]?.monthlyLease || null,
      };
      
      console.log(`${hasImage ? '🖼️' : '❌'}${hasOptions ? '⚙️' : ''} img=${hasImage} opt=${detail.options.length}`);
    } catch (err) {
      console.log(`❌ ERR: ${err.message}`);
      updatedDetails[car.trimId] = {
        ...car,
        ...existing,
        monthlyRent: searchPrices[car.trimId]?.monthlyRent || null,
        monthlyLease: searchPrices[car.trimId]?.monthlyLease || null,
      };
    }
    
    await delay(250);
  }
  
  console.log(`\n=== FINAL SUMMARY ===`);
  console.log(`Total: ${list.length}`);
  console.log(`Images: ${imageFound}/${list.length} (${Math.round(imageFound/list.length*100)}%)`);
  console.log(`Options: ${optionsFound}/${list.length} (${Math.round(optionsFound/list.length*100)}%)`);
  console.log(`Monthly prices: ${Object.keys(searchPrices).length}/${list.length}`);
  
  fs.writeFileSync('scratch/chasalddae_details_v2.json', JSON.stringify(updatedDetails, null, 2));
  console.log(`\n✅ Saved to scratch/chasalddae_details_v2.json`);
}

main().catch(console.error);
