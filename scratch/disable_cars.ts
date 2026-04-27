import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function main() {
  const result = await p.car.updateMany({
    where: {
      OR: [
        { modelName: 'C200' },
        { modelName: 'E300' },
        { modelName: 'GLE 300d' },
        { modelName: '320i' },
        { modelName: '520i' },
        { modelName: '캠리' },
        { modelName: 'K3' }
      ]
    },
    data: { isActive: false }
  });
  console.log('Disabled cars:', result.count);
}
main().finally(() => p.$disconnect());
