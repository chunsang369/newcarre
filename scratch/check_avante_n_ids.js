const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const c1 = await prisma.car.findUnique({
    where: { id: 'cmolk1z180019rd0fl0dk96fk' },
    select: { id: true, modelName: true, options: true }
  });
  const c2 = await prisma.car.findUnique({
    where: { id: 'cmojygdqp0019obwywfntzujn' },
    select: { id: true, modelName: true, options: true }
  });

  console.log('c1 length of options:', JSON.stringify(c1.options).length);
  console.log('c2 length of options:', JSON.stringify(c2.options).length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
