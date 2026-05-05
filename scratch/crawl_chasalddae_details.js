const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const list = JSON.parse(fs.readFileSync('scratch/chasalddae_list_clean.json', 'utf8'));
  const details = {};
  
  console.log(`Starting crawl for ${list.length} cars...`);
  
  for (let i = 0; i < list.length; i++) {
    const car = list[i];
    console.log(`[${i+1}/${list.length}] Crawling ${car.trimId}: ${car.fullName}`);
    
    try {
      const res = await axios.get(`https://chasalddae.com/leaserent/leaserent_detail?trim_id=${car.trimId}`, {
          timeout: 10000
      });
      const $ = cheerio.load(res.data);
      
      const imageUrl = $('meta[property="og:image"]').attr('content') || $('.car-image img, .car_img img, .img-box img').attr('src');
      
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
      
      const options = [];
      // To prevent capturing garbage, let's only look for labels inside the "02 옵션" section
      let inOptionsSection = false;
      $('div, label, h3').each((idx, el) => {
          const text = $(el).text().trim();
          if (text.includes('02 옵션')) {
              inOptionsSection = true;
          } else if (text.includes('03 계약조건')) {
              inOptionsSection = false;
          }
          
          if (inOptionsSection && el.tagName === 'label') {
              const labelText = $(el).text().replace(/\s+/g, ' ').trim();
              const priceMatch = labelText.match(/(?:\s|^)([0-9,]+)원/);
              if (priceMatch) {
                  let name = labelText.replace(priceMatch[0], '').trim();
                  name = name.replace(/\*상위 연계 옵션 선택 필요.*$/, '').trim();
                  // Check if it's actually an option (not "차량 기본가" etc)
                  if (!name.includes('차량 기본가') && !name.includes('선택된 옵션이 없습니다')) {
                     // Ensure unique
                     if (!options.find(o => o.name === name)) {
                         options.push({
                            name,
                            price: parseInt(priceMatch[1].replace(/,/g, ''), 10)
                         });
                     }
                  }
              }
          }
      });

      details[car.trimId] = {
        ...car,
        imageUrl,
        grades,
        options,
        colorsExt: [], // Chasalddae doesn't reliably expose colors as parseable text without selecting them via UI
        colorsInt: []
      };
      
    } catch (err) {
      console.error(`Failed to crawl ${car.trimId}:`, err.message);
    }
    
    await delay(300); // 300ms delay to avoid rate limiting
  }
  
  fs.writeFileSync('scratch/chasalddae_details.json', JSON.stringify(details, null, 2));
  console.log(`Saved details to scratch/chasalddae_details.json`);
}

main().catch(console.error);
