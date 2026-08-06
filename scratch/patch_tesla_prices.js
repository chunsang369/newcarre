const fs = require('fs');

const path = 'prisma/car-data.ts';
let content = fs.readFileSync(path, 'utf-8');

const slugs = [
  'tesla-model-y-juniper',
  'tesla-model-y-juniper-6342',
  'tesla-new-model-3',
  'tesla-new-model-3-8545',
  'tesla-new-model-3-8546'
];

slugs.forEach(slug => {
  const carIndex = content.indexOf(`"slug": "${slug}"`);
  if (carIndex === -1) {
    console.error(`Slug ${slug} not found`);
    process.exit(1);
  }
  
  // Find "priceMatrix": { from carIndex
  const matrixStartLabel = content.indexOf('"priceMatrix":', carIndex);
  if (matrixStartLabel === -1) {
    console.error(`priceMatrix not found for ${slug}`);
    process.exit(1);
  }
  
  const braceStart = content.indexOf('{', matrixStartLabel);
  
  // Parse until matching closing brace for priceMatrix
  let openBraces = 0;
  let braceEnd = -1;
  for (let i = braceStart; i < content.length; i++) {
    if (content[i] === '{') openBraces++;
    else if (content[i] === '}') {
      openBraces--;
      if (openBraces === 0) {
        braceEnd = i;
        break;
      }
    }
  }
  
  if (braceEnd === -1) {
    console.error(`Closing brace for priceMatrix not found for ${slug}`);
    process.exit(1);
  }
  
  const originalMatrixText = content.substring(braceStart, braceEnd + 1);
  const originalMatrix = JSON.parse(originalMatrixText);
  
  const updatedMatrix = {};
  Object.keys(originalMatrix).forEach(key => {
    updatedMatrix[key] = {
      rent: originalMatrix[key].rent + 30000,
      lease: originalMatrix[key].lease + 30000
    };
  });
  
  const formattedMatrix = JSON.stringify(updatedMatrix, null, 2)
    .split('\n')
    .map((line, idx) => idx === 0 ? line : '      ' + line) // Indent properly
    .join('\n');
  
  content = content.substring(0, braceStart) + formattedMatrix + content.substring(braceEnd + 1);
  console.log(`Successfully updated ${slug} prices with +30,000`);
});

fs.writeFileSync(path, content, 'utf-8');
console.log('Saved all Tesla changes to ' + path);
