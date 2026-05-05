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
  const keepLogs = [];

  for (const [key, group] of Object.entries(groups)) {
    if (group.length > 1) {
      // Sort descending by options string length
      group.sort((a, b) => {
        const lenA = JSON.stringify(a.options).length;
        const lenB = JSON.stringify(b.options).length;
        return lenB - lenA;
      });

      const keep = group[0];
      const others = group.slice(1);

      keepLogs.push({
        key,
        keepModel: keep.modelName,
        keepId: keep.id,
        keepOptionsLen: JSON.stringify(keep.options).length,
        others: others.map(c => ({
          modelName: c.modelName,
          id: c.id,
          optionsLen: JSON.stringify(c.options).length
        }))
      });

      for (const o of others) {
        deleteIds.push(o.id);
      }
    }
  }

  console.log(`Would delete ${deleteIds.length} duplicate cars.`);
  console.log(JSON.stringify(keepLogs.slice(0, 10), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
