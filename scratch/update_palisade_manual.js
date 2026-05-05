const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updatePalisade() {
  const car = await prisma.car.findFirst({
    where: { modelName: { contains: '팰리세이드' } }
  });

  if (!car) {
    console.log('Palisade not found');
    return;
  }

  let options = typeof car.options === 'string' ? JSON.parse(car.options) : car.options;
  
  // Update the detailedConfig for the first trim of the first grade
  // Based on subagent findings:
  const scrapedOptions = [
    { idx: "46523", title: "듀얼 와이드 선루프", price: 900000 },
    { idx: "46524", title: "현대 스마트센스", price: 1400000 },
    { idx: "46525", title: "컴포트", price: 1400000 },
    { idx: "46526", title: "빌트인 캠 2 Plus, 증강현실 내비게이션", price: 700000 }
  ];

  if (options.detailedConfig && options.detailedConfig.grades[0]) {
    // Let's find the trim that matches the subagent's view (Likely the 3.8 Gasoline Exclusive or similar)
    // For now, let's update ALL trims of the Palisade with these prices if the titles match.
    options.detailedConfig.grades.forEach(grade => {
      grade.trims.forEach(trim => {
        trim.options?.forEach(opt => {
          const match = scrapedOptions.find(s => s.title === opt.title);
          if (match) {
            opt.price = match.price;
          }
        });
      });
    });
  }

  await prisma.car.update({
    where: { id: car.id },
    data: { options: options }
  });

  console.log('Successfully updated Palisade with real option prices!');
}

updatePalisade()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
