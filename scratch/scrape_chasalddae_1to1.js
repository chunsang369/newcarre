const { PrismaClient } = require('@prisma/client');
const https = require('https');
const fs = require('fs');

const prisma = new PrismaClient();
const trimIds = JSON.parse(fs.readFileSync('scratch/all_trim_ids.json', 'utf8'));

function normalize(str) {
  if (!str) return '';
  return str
    .replace(/\([^)]+\)/g, '')
    .replace(/[-\s]+/g, '')
    .toLowerCase();
}

async function fetchTrimDetail(trimId) {
  return new Promise((resolve, reject) => {
    https.get(`https://chasalddae.com/leaserent/leaserent_detail?trim_id=${trimId}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        // Find next_f hydration payload
        const regex = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/gi;
        let match;
        let fullF = '';
        while ((match = regex.exec(data)) !== null) {
          fullF += match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
        }

        const startIdx = fullF.indexOf('{"car_info":');
        if (startIdx === -1) {
          return resolve(null);
        }

        let openBraces = 0;
        let endIdx = startIdx;
        for (let i = startIdx; i < fullF.length; i++) {
          if (fullF[i] === '{') openBraces++;
          else if (fullF[i] === '}') {
            openBraces--;
            if (openBraces === 0) {
              endIdx = i;
              break;
            }
          }
        }

        const jsonStr = fullF.substring(startIdx, endIdx + 1);
        try {
          const detail = JSON.parse(jsonStr);
          resolve(detail);
        } catch (err) {
          resolve(null);
        }
      });
    }).on('error', (err) => resolve(null));
  });
}

async function main() {
  console.log(`Starting detailed scraping for ${trimIds.length} trim IDs...`);

  // We can process in parallel chunks of 10 to be fast
  const chunkSize = 10;
  let scrapedDetails = [];

  for (let i = 0; i < trimIds.length; i += chunkSize) {
    const chunk = trimIds.slice(i, i + chunkSize);
    console.log(`Processing chunk ${i} to ${i + chunk.length}...`);
    const results = await Promise.all(chunk.map(id => fetchTrimDetail(id)));
    for (const r of results) {
      if (r && r.car_info) {
        scrapedDetails.push(r);
      }
    }
  }

  console.log(`Successfully scraped ${scrapedDetails.length} car details! Now matching with DB...`);

  // First get all existing cars in DB
  const existingCars = await prisma.car.findMany();

  let updatedCount = 0;
  let insertedCount = 0;

  for (const detail of scrapedDetails) {
    const info = detail.car_info;
    const normName = normalize(info.model_name);

    // Find if car exists in DB
    let matchedCar = existingCars.find(c => normalize(c.modelName) === normName);
    if (!matchedCar) {
      matchedCar = existingCars.find(c => normalize(c.modelName).includes(normName) || normName.includes(normalize(c.modelName)));
    }

    if (matchedCar) {
      // Update existing car
      await prisma.car.update({
        where: { id: matchedCar.id },
        data: {
          modelName: info.model_name,
          trimName: info.trim_name || '기본',
          basePrice: info.car_price || 0,
          thumbnailUrl: info.car_image1,
          options: detail, // Save the complete Chasalddae detail payload directly!
        }
      });
      updatedCount++;
    } else {
      // Insert new car to ensure 1-to-1 match!
      // Find or create brand for that car
      let brand = await prisma.brand.findFirst({
        where: { name: info.brand_name || '현대' }
      });
      if (!brand) {
        brand = await prisma.brand.create({
          data: {
            slug: normalize(info.brand_name || 'hyundai'),
            name: info.brand_name || '현대',
            logoUrl: info.brand_logo || 'https://img.chasalddae.com/logo/%ED%98%84%EB%8C%80%EB%A1%9C%EA%B3%A0_.png',
            isDomestic: true
          }
        });
      }

      await prisma.car.create({
        data: {
          slug: `${brand.slug}-${normalize(info.model_name)}`,
          brandId: brand.id,
          modelName: info.model_name,
          trimName: info.trim_name || '기본',
          year: 2026,
          category: 'SEDAN',
          fuelType: 'GASOLINE',
          basePrice: info.car_price || 0,
          thumbnailUrl: info.car_image1,
          galleryUrls: [],
          options: detail,
          priceMatrix: {},
          isPopular: true,
          isActive: true
        }
      });
      insertedCount++;
    }
  }

  console.log(`Matched and updated ${updatedCount} cars in the database.`);
  console.log(`Inserted ${insertedCount} new cars into the database.`);
  console.log('🎉 DB Sync complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
