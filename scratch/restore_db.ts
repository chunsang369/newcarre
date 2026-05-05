import { PrismaClient } from '@prisma/client';
import { popularCars } from '../prisma/car-data';

const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning up database...');
    await prisma.car.deleteMany({});
    
    console.log(`Inserting ${popularCars.length} cars from car-data.ts...`);
    for (const car of popularCars) {
        try {
            await prisma.car.create({
                data: {
                    slug: car.slug,
                    modelName: car.modelName,
                    trimName: car.trimName,
                    year: car.year,
                    category: car.category,
                    fuelType: car.fuelType,
                    basePrice: car.basePrice,
                    thumbnailUrl: car.imageUrl,
                    options: car.options as any,
                    priceMatrix: car.priceMatrix as any,
                    isPopular: car.isPopular,
                    sortOrder: car.sortOrder,
                    brand: {
                        connect: { slug: car.brandSlug }
                    }
                }
            });
        } catch (e) {
            console.error(`Failed to insert ${car.modelName}:`, (e instanceof Error) ? e.message : String(e));
        }
    }
    console.log('✅ Database restoration complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
