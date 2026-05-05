const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const car = await prisma.car.findFirst({where:{modelName: '아이오닉6 N'}});
  if(car) {
     console.log('Ioniq 6 N Prices:', car.priceMatrix['36_PREPAY_30_20000']);
  }
}
check();
