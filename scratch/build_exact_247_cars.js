const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 2026 7월 최신 포털 API 호출 (타임아웃 4초)
async function fetchWithTimeout(url, timeoutMs = 4000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    clearTimeout(id);
  }
  return null;
}

async function fetchLiveMatrixFast(trimId) {
  const periods = ['36', '48', '60'];
  const distances = [
    { label: '10000', value: '1m' },
    { label: '20000', value: '2m' },
    { label: '30000', value: '3m' }
  ];
  const conditions = [
    { label: 'PREPAY_30', adPayment: 30, deposit: 0 },
    { label: 'DEPOSIT_30', adPayment: 0, deposit: 30 },
    { label: 'NO_DEPOSIT', adPayment: 0, deposit: 0 }
  ];

  const tasks = [];
  const keys = [];

  for (const period of periods) {
    for (const dist of distances) {
      for (const cond of conditions) {
        const url = `https://portal-api.chasalddae.com/rental/rental-calc-monthly?trimId=${trimId}&domain=chasalddae.com&adPayment=${cond.adPayment}&deposit=${cond.deposit}&period=${period}&distance=${dist.value}&insuranceAge=26&oiColorSumPrice=0&trimOptSumPrice=0`;
        const key = `${period}_${cond.label}_${dist.label}`;
        keys.push(key);
        tasks.push(fetchWithTimeout(url));
      }
    }
  }

  const results = await Promise.all(tasks);
  const matrix = {};

  results.forEach((json, idx) => {
    if (json && json.code === '200' && json.data) {
      matrix[keys[idx]] = {
        rent: json.data.rent_price,
        lease: json.data.lease_price
      };
    }
  });

  return Object.keys(matrix).length > 0 ? matrix : null;
}

// 브랜드 슬러그 매핑 헬퍼
function getBrandSlug(brandName) {
  const map = {
    '현대': 'hyundai',
    '기아': 'kia',
    '제네시스': 'genesis',
    '쉐보레': 'chevrolet',
    'KGM': 'kgm',
    '르노코리아': 'renault-korea',
    '메르세데스-벤츠': 'mercedes-benz',
    '벤츠': 'mercedes-benz',
    'BMW': 'bmw',
    '아우디': 'audi',
    '볼보': 'volvo',
    '포르쉐': 'porsche',
    '테슬라': 'tesla',
    '렉서스': 'lexus',
    '토요타': 'toyota',
    '혼다': 'honda',
    '폭스바겐': 'volkswagen',
    '랜드로버': 'land-rover',
    '지프': 'jeep',
    '캐딜락': 'cadillac',
    '포드': 'ford',
    '링컨': 'lincoln',
    '미니': 'mini',
    '폴스타': 'polestar',
    'BYD': 'byd'
  };
  return map[brandName] || 'hyundai';
}

function makeSlug(brandSlug, modelName, trimId) {
  const cleanModel = modelName.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
  return `${brandSlug}-${cleanModel}-${trimId}`.replace(/-+/g, '-');
}

async function main() {
  console.log('🚀 Rebuilding EXACT Chasalddae 247 Cars with Live API...');

  const cleanList = JSON.parse(fs.readFileSync('scratch/chasalddae_list_clean.json', 'utf8'));
  const detailsObj = JSON.parse(fs.readFileSync('scratch/chasalddae_details.json', 'utf8'));

  const brands = await prisma.brand.findMany();
  const brandMap = {};
  brands.forEach(b => { brandMap[b.slug] = b.id; });

  const popularCars = [];
  const processedSlugs = new Set();
  let createdCount = 0;

  console.log(`Processing ${cleanList.length} master car entries...`);

  for (let i = 0; i < cleanList.length; i++) {
    const item = cleanList[i];
    const trimId = item.trimId;
    const detail = detailsObj[trimId] || {};

    const brandSlug = getBrandSlug(item.brand);
    const brandId = brandMap[brandSlug] || brands[0].id;
    let slug = item.slug || makeSlug(brandSlug, item.modelName, trimId);

    if (processedSlugs.has(slug)) {
      slug = `${slug}-${trimId}`;
    }
    processedSlugs.add(slug);

    // 2026년 7월 최신 포털 API 호출
    const liveMatrix = await fetchLiveMatrixFast(trimId);

    // 색상/옵션 파싱
    const colorsExt = (detail.trim_outer_color_list || []).map(c => ({
      idx: String(c.id),
      title: c.name,
      price: c.price || 0,
      detail: c.detail || [],
      thumb: c.detail?.[0] || ''
    }));

    const colorsInt = (detail.trim_inner_color_list || []).map(c => ({
      idx: String(c.id),
      title: c.name,
      price: c.price || 0,
      detail: c.detail || [],
      thumb: c.detail?.[0] || ''
    }));

    const trimOptions = (detail.trim_opt_list || []).map(o => ({
      idx: `opt_${o.id}`,
      title: o.name,
      price: o.price || 0
    }));

    const basePrice = detail.basePrice || detail.price || 30000000;

    const options = {
      grades: [
        {
          idx: 'g_1',
          name: detail.gradeName || '2026년형',
          trims: [
            {
              idx: `t_${trimId}`,
              trimId: String(trimId),
              name: detail.trimName || item.summary || '기본 트림',
              price: basePrice,
              colorsExt: colorsExt,
              colorsInt: colorsInt,
              options: trimOptions,
              rentOffset: 0,
              leaseOffset: 0,
              priceMatrix: liveMatrix || {}
            }
          ]
        }
      ]
    };

    const carData = {
      slug: slug,
      brandId: brandId,
      brandSlug: brandSlug,
      modelName: item.modelName,
      trimName: detail.trimName || '2026년형',
      year: 2026,
      category: detail.category || 'SEDAN',
      fuelType: detail.fuelType || 'GASOLINE',
      basePrice: basePrice,
      thumbnailUrl: detail.imageUrl || item.thumbnailUrl || 'https://img.chasalddae.com/app/logo.png',
      galleryUrls: [],
      options: options,
      priceMatrix: liveMatrix || {},
      isPopular: i < 30,
      isActive: true,
      sortOrder: i + 1
    };

    // DB Upsert
    await prisma.car.upsert({
      where: { slug: slug },
      update: {
        modelName: carData.modelName,
        basePrice: carData.basePrice,
        thumbnailUrl: carData.thumbnailUrl,
        options: options,
        priceMatrix: carData.priceMatrix,
        isActive: true
      },
      create: {
        slug: slug,
        brandId: brandId,
        modelName: carData.modelName,
        trimName: carData.trimName,
        year: carData.year,
        category: carData.category,
        fuelType: carData.fuelType,
        basePrice: carData.basePrice,
        thumbnailUrl: carData.thumbnailUrl,
        options: options,
        priceMatrix: carData.priceMatrix,
        isPopular: carData.isPopular,
        isActive: true,
        sortOrder: carData.sortOrder
      }
    });

    popularCars.push({
      ...carData,
      brand: { slug: brandSlug, name: item.brand, isDomestic: true }
    });

    createdCount++;
    if (createdCount % 20 === 0 || i === cleanList.length - 1) {
      console.log(`[Progress] Synchronized ${createdCount}/${cleanList.length} cars from Chasalddae Master List.`);
    }
  }

  // car-data.ts 쓰기
  const newContent = `// Auto-generated from Chasalddae 247 Master Sync\nexport const popularCars: any[] = ${JSON.stringify(popularCars, null, 2)};\n`;
  fs.writeFileSync('prisma/car-data.ts', newContent, 'utf8');

  const finalCarCount = await prisma.car.count();
  console.log(`\n==========================================`);
  console.log(`🎉 EXACT Chasalddae Sync Complete! Total DB Cars: ${finalCarCount}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
