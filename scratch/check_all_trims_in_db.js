const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cars = await prisma.car.findMany();
  console.log(`총 DB 차량 수: ${cars.length}개`);

  let totalTrimsCount = 0;
  let trimsWithTrimIdCount = 0;
  const trimDetails = [];

  cars.forEach(car => {
    const options = car.options || {};
    const grades = options.grades || [];
    grades.forEach(grade => {
      (grade.trims || []).forEach(trim => {
        totalTrimsCount++;
        if (trim.trimId || trim.idx) {
          trimsWithTrimIdCount++;
        }
        trimDetails.push({
          carSlug: car.slug,
          carName: car.modelName,
          gradeName: grade.name,
          trimName: trim.name,
          trimId: trim.trimId || (trim.idx ? String(trim.idx).replace(/^[a-z_]+/, '') : null)
        });
      });
    });
  });

  console.log(`전체 트림 수: ${totalTrimsCount}개`);
  console.log(`trimId 식별 가능한 트림 수: ${trimsWithTrimIdCount}개`);
  console.log('샘플 10개 트림:', trimDetails.slice(0, 10));

  await prisma.$disconnect();
}

main().catch(console.error);
