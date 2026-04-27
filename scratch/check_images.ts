import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  const cars = await p.car.findMany({
    include: { brand: true },
    orderBy: { sortOrder: 'asc' },
  });

  let noImg = 0;
  let hasImg = 0;

  for (const car of cars) {
    if (car.thumbnailUrl && car.thumbnailUrl.trim() !== '') {
      hasImg++;
    } else {
      noImg++;
      console.log(`NO_IMAGE: [${car.brand.name}] ${car.modelName} ${car.trimName}`);
    }
  }

  console.log(`\n--- STATS ---`);
  console.log(`With image: ${hasImg}`);
  console.log(`No image: ${noImg}`);
  console.log(`Total: ${cars.length}`);

  // Show sample of ones WITH images
  const withImgs = cars.filter(c => c.thumbnailUrl && c.thumbnailUrl.trim() !== '');
  console.log(`\n--- SAMPLE WITH IMAGES (first 10) ---`);
  for (const c of withImgs.slice(0, 10)) {
    console.log(`[${c.brand.name}] ${c.modelName}: ${c.thumbnailUrl.substring(0, 80)}`);
  }

  await p.$disconnect();
}

main();
