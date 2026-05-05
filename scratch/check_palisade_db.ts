import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPalisade() {
  const car = await prisma.car.findFirst({
    where: { modelName: '디 올 뉴 팰리세이드' }
  });

  if (!car) {
    console.log('Palisade not found in DB');
    return;
  }

  const options = (car.options as any)?.detailedConfig;
  const firstTrim = options?.grades?.[0]?.trims?.[0];
  
  console.log('--- Verification ---');
  console.log('Grade Name:', options?.grades?.[0]?.name);
  console.log('Trim Name:', firstTrim?.name);
  console.log('Color[0] title:', firstTrim?.colorsExt?.[0]?.title);
  console.log('Color[0] thumb:', firstTrim?.colorsExt?.[0]?.thumb);
  console.log('Option[0] title:', firstTrim?.options?.[0]?.title);
  
  if (firstTrim?.options?.[0]?.title) {
    console.log('✅ SUCCESS: title field found!');
  } else {
    console.log('❌ FAILURE: title field is missing or empty');
  }

  await prisma.$disconnect();
}

checkPalisade().catch(console.error);
