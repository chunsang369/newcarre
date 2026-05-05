const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();
const scrapedCars = JSON.parse(fs.readFileSync('scratch/chasalddae_scraped_images.json', 'utf8'));

function normalize(str) {
  if (!str) return '';
  return str
    .replace(/\([^)]+\)/g, '')
    .replace(/[-\s]+/g, '')
    .replace(/ⅲ/g, '3')
    .replace(/ⅱ/g, '2')
    .replace(/ⅳ/g, '4')
    .replace(/i/g, '1')
    .toLowerCase();
}

async function main() {
  const cars = await prisma.car.findMany({
    include: {
      brand: true,
    },
  });

  console.log(`Auditing ${cars.length} cars in DB...`);
  
  let updatedCount = 0;

  for (const car of cars) {
    const normModel = normalize(car.modelName);
    
    // Find perfect or substring match
    let match = scrapedCars.find(sc => normalize(sc.model_name) === normModel);
    if (!match) {
      match = scrapedCars.find(sc => normalize(sc.model_name).includes(normModel) || normModel.includes(normalize(sc.model_name)));
    }
    
    // If still no match, fallback to any car from same brand or similar
    if (!match && car.brand?.name) {
      match = scrapedCars.find(sc => sc.model_name.includes(car.brand.name) || sc.model_name.includes(car.modelName.split(' ')[0]));
    }

    if (match) {
      updatedCount++;
      await prisma.car.update({
        where: { id: car.id },
        data: { thumbnailUrl: match.car_image1 },
      });
    } else {
      // Default fallback if absolutely no match
      await prisma.car.update({
        where: { id: car.id },
        data: { thumbnailUrl: 'https://img.chasalddae.com/model/car_images/20230313092821122.png' }, // Default to a good fallback
      });
    }
  }

  console.log(`Successfully updated ${updatedCount} out of ${cars.length} cars in the database!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
