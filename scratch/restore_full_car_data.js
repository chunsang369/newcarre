const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Restoring Full Car Data (Real Images, Full Trims, Options & Price Matrix)...');

  // 데이터소스 로드
  const cleanList = JSON.parse(fs.readFileSync('scratch/chasalddae_list_clean.json', 'utf8'));
  const detailsV2 = fs.existsSync('scratch/chasalddae_details_v2.json') 
    ? JSON.parse(fs.readFileSync('scratch/chasalddae_details_v2.json', 'utf8')) : {};
  const detailsV1 = fs.existsSync('scratch/chasalddae_details.json') 
    ? JSON.parse(fs.readFileSync('scratch/chasalddae_details.json', 'utf8')) : {};
  const batch1 = fs.existsSync('scratch/batch1_perfect.json') 
    ? JSON.parse(fs.readFileSync('scratch/batch1_perfect.json', 'utf8')) : {};
  const scrapedImages = fs.existsSync('scratch/chasalddae_scraped_images.json') 
    ? JSON.parse(fs.readFileSync('scratch/chasalddae_scraped_images.json', 'utf8')) : [];
  const carImageMap = fs.existsSync('scratch/car_image_map.json') 
    ? JSON.parse(fs.readFileSync('scratch/car_image_map.json', 'utf8')) : {};
  const legacyCars = fs.existsSync('cars_final_database.json') 
    ? JSON.parse(fs.readFileSync('cars_final_database.json', 'utf8')) : [];

  // 이미지 매핑 헬퍼
  function getRealCarImage(trimId, modelName) {
    if (carImageMap[trimId] && carImageMap[trimId].url && !carImageMap[trimId].url.includes('logo.png')) {
      return carImageMap[trimId].url;
    }
    const scraped = scrapedImages.find(s => s.model_name && modelName.includes(s.model_name));
    if (scraped && scraped.car_image1 && !scraped.car_image1.includes('logo.png')) {
      return scraped.car_image1;
    }
    const legacy = legacyCars.find(l => l.name && (modelName.includes(l.name) || l.name.includes(modelName)));
    if (legacy && legacy.thumbnailUrl && !legacy.thumbnailUrl.includes('logo.png')) {
      return legacy.thumbnailUrl.startsWith('/data/') ? `https://m.hicarzautoplan.com${legacy.thumbnailUrl}` : legacy.thumbnailUrl;
    }
    // 기본 로컬 백업 이미지
    return '/images/cars/default.png';
  }

  const dbCars = await prisma.car.findMany();
  let updatedCount = 0;

  for (const car of dbCars) {
    // 대응하는 trimId 찾기
    let trimId = null;
    if (car.options && car.options.grades) {
      for (const g of car.options.grades) {
        for (const t of (g.trims || [])) {
          if (t.trimId) {
            trimId = t.trimId;
            break;
          }
        }
        if (trimId) break;
      }
    }

    const detailData = (trimId && (detailsV2[trimId] || detailsV1[trimId] || batch1[trimId])) || {};

    // 복구할 실물 차량 이미지
    let realImage = car.thumbnailUrl;
    if (!realImage || realImage.includes('logo.png')) {
      realImage = getRealCarImage(trimId, car.modelName);
    }

    // 복구할 풍부한 세부 트림 목록
    let grades = [];
    if (detailData.grades && detailData.grades.length > 0) {
      grades = detailData.grades.map((g, gIdx) => ({
        idx: `g_${gIdx + 1}`,
        name: g.name,
        trims: (g.trims || []).map((t, tIdx) => ({
          idx: `t_${trimId || gIdx}_${tIdx}`,
          trimId: String(trimId || ''),
          name: t.name,
          price: t.price || car.basePrice || 30000000,
          colorsExt: (detailData.trim_outer_color_list || []).map(c => ({
            idx: String(c.id),
            title: c.name,
            price: c.price || 0,
            detail: c.detail || [],
            thumb: c.detail?.[0] || ''
          })),
          colorsInt: (detailData.trim_inner_color_list || []).map(c => ({
            idx: String(c.id),
            title: c.name,
            price: c.price || 0,
            detail: c.detail || [],
            thumb: c.detail?.[0] || ''
          })),
          options: (detailData.trim_opt_list || detailData.options || []).map(o => ({
            idx: `opt_${o.id || o.name}`,
            title: o.name,
            price: o.price || 0
          })),
          rentOffset: 0,
          leaseOffset: 0,
          priceMatrix: car.priceMatrix || {}
        }))
      }));
    }

    const optionsData = {
      grades: grades.length > 0 ? grades : (car.options?.grades || [])
    };

    // DB 및 객체 업데이트
    await prisma.car.update({
      where: { id: car.id },
      data: {
        thumbnailUrl: realImage,
        options: optionsData,
        isActive: true
      }
    });

    updatedCount++;
  }

  console.log(`✅ Successfully restored ${updatedCount} cars with real vehicle images, full sub-trims & options!`);

  // popularCars 파일 재동기화
  const allCars = await prisma.car.findMany({ include: { brand: true } });
  const popularCars = allCars.map((c, i) => ({
    slug: c.slug,
    brandId: c.brandId,
    brandSlug: c.brand?.slug || 'hyundai',
    modelName: c.modelName,
    trimName: c.trimName,
    year: c.year,
    category: c.category,
    fuelType: c.fuelType,
    basePrice: c.basePrice,
    thumbnailUrl: c.thumbnailUrl,
    galleryUrls: c.galleryUrls || [],
    options: c.options,
    priceMatrix: c.priceMatrix,
    isPopular: i < 30,
    isActive: true,
    sortOrder: i + 1,
    brand: {
      slug: c.brand?.slug || 'hyundai',
      name: c.brand?.name || '현대',
      isDomestic: true
    }
  }));

  const newContent = `// Auto-generated restored car data\nexport const popularCars: any[] = ${JSON.stringify(popularCars, null, 2)};\n`;
  fs.writeFileSync('prisma/car-data.ts', newContent, 'utf8');
  console.log(`✅ Successfully updated prisma/car-data.ts with restored data!`);

  await prisma.$disconnect();
}

main().catch(console.error);
