const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  const trimData = JSON.parse(fs.readFileSync('scratch/full_trim_10885.json', 'utf8'));
  const tree = trimData.tree;
  const info = trimData.info;

  const detailedConfig = {
    grades: [
      {
        idx: info.idxGrade,
        name: info.grade,
        trims: [
          {
            idx: info.idxTrim,
            name: info.trim,
            price: Number(info.trimPrice) || 0,
            options: Object.values(tree.idxOpt || {}).map(opt => ({
              idx: opt.idx,
              title: opt.title,
              price: Number(opt.price) || 0
            })),
            colorsExt: (tree.colorExt || []).map(c => ({
              idx: c.idx || c.title || c.file,
              title: c.title,
              price: Number(c.price) || 0,
              thumb: c.thumb ? `https://m.hicarzautoplan.com${c.thumb}` : null
            })),
            colorsInt: (tree.colorInt || []).map(c => ({
              idx: c.idx || c.title || c.file,
              title: c.title,
              price: Number(c.price) || 0,
              thumb: c.thumb ? `https://m.hicarzautoplan.com${c.thumb}` : null
            }))
          }
        ]
      }
    ]
  };

  const car = await prisma.car.findFirst({
    where: { modelName: { contains: '그랜저' } }
  });

  if (car) {
    await prisma.car.update({
      where: { id: car.id },
      data: {
        options: {
          ...(car.options || {}),
          detailedConfig
        }
      }
    });
    console.log(`Updated car ${car.id} (${car.modelName}) with detailedConfig including colors.`);
  } else {
    console.log('Car not found');
  }
}

main();
