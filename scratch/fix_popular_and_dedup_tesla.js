const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Fixing isPopular Flags & Deduplicating Tesla Lineup...');

  // 1. 테슬라 중복 정리 (Model 3 & Model Y 단일 통합)
  const allTesla = await prisma.car.findMany({
    where: { brand: { slug: 'tesla' } }
  });

  console.log(`Initial Tesla Cars Count: ${allTesla.length}개`);

  // 남길 테슬라 대표 슬러그
  const teslaKeepSlugs = [
    'tesla-model-y-juniper',
    'tesla-new-model-3',
    'tesla-new-model-x-pe',
    'tesla-new-model-s-pe',
    'tesla-cybertruck'
  ];

  const teslaRemoveIds = allTesla
    .filter(c => !teslaKeepSlugs.includes(c.slug))
    .map(c => c.id);

  if (teslaRemoveIds.length > 0) {
    await prisma.car.updateMany({
      where: { id: { in: teslaRemoveIds } },
      data: { isActive: false }
    });
    console.log(`Deactivated ${teslaRemoveIds.length} duplicate Tesla models.`);
  }

  // 2. 인기 차종(isPopular: true) 30개 지정
  const popularKeywords = [
    '그랜저', '싼타페', '카니발', '아반떼', '쏘나타', '팰리세이드', '쏘렌토', '셀토스', '스포티지',
    'g80', 'gv80', 'gv70', 'k5', 'k8', '캐스퍼', 'model 3', 'model y',
    'e-class', 'e클래스', '5 series', '5시리즈', 'a6', 'x5', 'glc'
  ];

  const activeCars = await prisma.car.findMany({ where: { isActive: true } });

  // 전체 isPopular false 초기화 후 지정
  await prisma.car.updateMany({ data: { isPopular: false } });

  const popularCarIds = [];
  activeCars.forEach(c => {
    const name = c.modelName.toLowerCase();
    const isPop = popularKeywords.some(kw => name.includes(kw));
    if (isPop && popularCarIds.length < 35) {
      popularCarIds.push(c.id);
    }
  });

  // 혹시 30개 미만이면 상위 차종들로 채움
  if (popularCarIds.length < 20) {
    activeCars.slice(0, 30).forEach(c => {
      if (!popularCarIds.includes(c.id)) popularCarIds.push(c.id);
    });
  }

  await prisma.car.updateMany({
    where: { id: { in: popularCarIds } },
    data: { isPopular: true }
  });

  console.log(`✅ Set isPopular: true for ${popularCarIds.length} core popular cars!`);

  // 3. car-data.ts 정식 파일 재생성
  const finalActiveCars = await prisma.car.findMany({
    where: { isActive: true },
    include: { brand: true }
  });

  const popularCarsArray = finalActiveCars.map((c, i) => ({
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
    isPopular: c.isPopular,
    isActive: true,
    sortOrder: c.sortOrder || (i + 1),
    brand: {
      slug: c.brand?.slug || 'hyundai',
      name: c.brand?.name || '현대',
      isDomestic: true
    }
  }));

  const newContent = `// Auto-generated Clean Popular Cars with Deduplicated Tesla\nexport const popularCars: any[] = ${JSON.stringify(popularCarsArray, null, 2)};\n`;
  fs.writeFileSync('prisma/car-data.ts', newContent, 'utf8');

  console.log(`🎉 Successfully updated prisma/car-data.ts with clean Popular & Tesla Lineup!`);

  await prisma.$disconnect();
}

main().catch(console.error);
