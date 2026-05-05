const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function normalize(str) {
  if (!str) return '';
  return str
    .replace(/\([^)]+\)/g, '')
    .replace(/[-\s]+/g, '')
    .toLowerCase();
}

async function main() {
  const cars = await prisma.car.findMany({
    select: {
      id: true,
      slug: true,
      modelName: true,
      options: true,
    }
  });

  // Group by normalized modelName
  const groups = {};
  for (const car of cars) {
    const key = normalize(car.modelName);
    if (!groups[key]) groups[key] = [];
    groups[key].push(car);
  }

  const deleteIds = [];

  for (const [key, group] of Object.entries(groups)) {
    if (group.length > 1) {
      // Sort descending by options length
      group.sort((a, b) => {
        const lenA = JSON.stringify(a.options).length;
        const lenB = JSON.stringify(b.options).length;
        return lenB - lenA;
      });

      const others = group.slice(1);
      for (const o of others) {
        deleteIds.push(o.id);
      }
    }
  }

  console.log(`Starting deletion of ${deleteIds.length} duplicate cars...`);

  // Delete them from the database in chunks to prevent any timeout
  const chunkSize = 20;
  for (let i = 0; i < deleteIds.length; i += chunkSize) {
    const chunk = deleteIds.slice(i, i + chunkSize);
    await prisma.car.deleteMany({
      where: {
        id: { in: chunk }
      }
    });
    console.log(`Deleted ${i + chunk.length} / ${deleteIds.length} cars`);
  }

  console.log('🎉 Full deduplication completed successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
