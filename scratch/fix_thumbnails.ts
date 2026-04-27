import { PrismaClient } from '@prisma/client';

const HICARZ_BASE = 'https://m.hicarzautoplan.com';
const p = new PrismaClient();

async function main() {
  const cars = await p.car.findMany({
    select: { id: true, modelName: true, thumbnailUrl: true },
  });

  let fixedData = 0;
  let fixedLocal = 0;
  let alreadyOk = 0;
  let noUrl = 0;

  // Load crawled JSON for fallback matching
  const fs = await import('fs');
  const crawledData = JSON.parse(
    fs.readFileSync('cars_final_database.json', 'utf-8')
  ) as Array<{ name: string; thumbnailUrl: string }>;

  for (const car of cars) {
    const url = car.thumbnailUrl;

    if (!url || url.trim() === '') {
      // No URL - try to find from crawled data by model name
      const match = crawledData.find(c => car.modelName.includes(c.name) || c.name.includes(car.modelName));
      if (match && match.thumbnailUrl) {
        const fullUrl = match.thumbnailUrl.startsWith('http')
          ? match.thumbnailUrl
          : `${HICARZ_BASE}${match.thumbnailUrl}`;
        await p.car.update({
          where: { id: car.id },
          data: { thumbnailUrl: fullUrl },
        });
        console.log(`[MATCHED] ${car.modelName} → ${fullUrl}`);
        fixedLocal++;
      } else {
        noUrl++;
        console.log(`[NO_URL] ${car.modelName}`);
      }
      continue;
    }

    if (url.startsWith('/data/') || url.startsWith('/data//')) {
      // Relative hicarz path → make absolute
      const fullUrl = `${HICARZ_BASE}${url}`;
      await p.car.update({
        where: { id: car.id },
        data: { thumbnailUrl: fullUrl },
      });
      fixedData++;
      continue;
    }

    if (url.startsWith('/images/cars/')) {
      // Local path that doesn't exist → find from crawled data
      const match = crawledData.find(c => car.modelName.includes(c.name) || c.name.includes(car.modelName));
      if (match && match.thumbnailUrl) {
        const fullUrl = match.thumbnailUrl.startsWith('http')
          ? match.thumbnailUrl
          : `${HICARZ_BASE}${match.thumbnailUrl}`;
        await p.car.update({
          where: { id: car.id },
          data: { thumbnailUrl: fullUrl },
        });
        console.log(`[LOCAL→HICARZ] ${car.modelName} → ${fullUrl}`);
        fixedLocal++;
      } else {
        noUrl++;
        console.log(`[LOCAL_NO_MATCH] ${car.modelName}: ${url}`);
      }
      continue;
    }

    if (url.startsWith('http')) {
      alreadyOk++;
      continue;
    }

    // Any other relative URL
    const fullUrl = `${HICARZ_BASE}${url}`;
    await p.car.update({
      where: { id: car.id },
      data: { thumbnailUrl: fullUrl },
    });
    fixedData++;
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`Fixed /data/ paths: ${fixedData}`);
  console.log(`Fixed /images/cars/ or empty: ${fixedLocal}`);
  console.log(`Already absolute: ${alreadyOk}`);
  console.log(`Still no URL: ${noUrl}`);
  console.log(`Total: ${cars.length}`);

  await p.$disconnect();
}

main();
