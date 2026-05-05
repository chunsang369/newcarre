const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const c = await p.car.findFirst({where:{modelName:{contains:'팰리세이드'}},select:{options:true}});
  console.log('MakerIdx:', c.options.detailedConfig.hicarzMakerIdx);
  console.log('NameIdx:', c.options.detailedConfig.hicarzNameIdx);
  console.log('ModelIdx:', c.options.detailedConfig.hicarzModelIdx);
  console.log('GradeIdx:', c.options.detailedConfig.grades[0].idx);
  console.log('TrimIdx:', c.options.detailedConfig.grades[0].trims[0].idx);
  console.log('OptIdx:', c.options.detailedConfig.grades[0].trims[0].options[0].idx);
}
main().finally(() => p.$disconnect());
