const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const car = await prisma.car.findFirst({
        where: { modelName: { contains: '팰리세이드' } }
    });

    if (!car) {
        console.log('Palisade not found in DB');
        return;
    }

    console.log('Model Name:', car.modelName);
    const options = car.options;
    if (options && options.grades) {
        options.grades.forEach(g => {
            console.log(`Grade: ${g.name}`);
            g.trims.forEach(t => {
                const count = t.colorsInt ? t.colorsInt.length : 0;
                console.log(`  Trim: ${t.name} -> colorsInt: ${count}`);
                if (count > 0) {
                    console.log('  Colors:', t.colorsInt.map(c => c.title).join(', '));
                }
            });
        });
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
