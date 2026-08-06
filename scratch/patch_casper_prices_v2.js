const fs = require('fs');

const path = 'prisma/car-data.ts';
let content = fs.readFileSync(path, 'utf-8');

const basePrices = {
  "36_NO_DEPOSIT_10000": { "rent": 289680, "lease": 215600 },
  "36_DEPOSIT_30_10000": { "rent": 232299, "lease": 173700 },
  "36_PREPAY_30_10000": { "rent": 51249, "lease": 53170 },
  "36_NO_DEPOSIT_20000": { "rent": 311529, "lease": 219567 },
  "36_DEPOSIT_30_20000": { "rent": 254029, "lease": 181247 },
  "36_PREPAY_30_20000": { "rent": 72989, "lease": 60139 },
  "48_NO_DEPOSIT_10000": { "rent": 312351, "lease": 220099 },
  "48_DEPOSIT_30_10000": { "rent": 254640, "lease": 178199 },
  "48_PREPAY_30_10000": { "rent": 134321, "lease": 34711 },
  "48_NO_DEPOSIT_20000": { "rent": 328130, "lease": 229524 },
  "48_DEPOSIT_30_20000": { "rent": 270309, "lease": 188899 },
  "48_PREPAY_30_20000": { "rent": 141629, "lease": 25399 },
  "60_NO_DEPOSIT_10000": { "rent": 322929, "lease": 221300 },
  "60_DEPOSIT_30_10000": { "rent": 264909, "lease": 179500 },
  "60_PREPAY_30_10000": { "rent": 168551, "lease": 52500 },
  "60_NO_DEPOSIT_20000": { "rent": 335049, "lease": 229600 },
  "60_DEPOSIT_30_20000": { "rent": 276931, "lease": 187800 },
  "60_PREPAY_30_20000": { "rent": 174265, "lease": 60700 }
};

const electricPrices = {
  "36_NO_DEPOSIT_10000": { "rent": 418470, "lease": 294599 },
  "36_DEPOSIT_30_10000": { "rent": 376329, "lease": 264599 },
  "36_PREPAY_30_10000": { "rent": 222489, "lease": 103199 },
  "36_NO_DEPOSIT_20000": { "rent": 437560, "lease": 305199 },
  "36_DEPOSIT_30_20000": { "rent": 396530, "lease": 275099 },
  "36_PREPAY_30_20000": { "rent": 242140, "lease": 113699 },
  "48_NO_DEPOSIT_10000": { "rent": 390549, "lease": 265801 },
  "48_DEPOSIT_30_10000": { "rent": 350169, "lease": 235701 },
  "48_PREPAY_30_10000": { "rent": 240760, "lease": 118201 },
  "48_NO_DEPOSIT_20000": { "rent": 401881, "lease": 273501 },
  "48_DEPOSIT_30_20000": { "rent": 361651, "lease": 243401 },
  "48_PREPAY_30_20000": { "rent": 254740, "lease": 125901 },
  "60_NO_DEPOSIT_10000": { "rent": 365717, "lease": 247500 },
  "60_DEPOSIT_30_10000": { "rent": 325438, "lease": 217400 },
  "60_PREPAY_30_10000": { "rent": 251239, "lease": 126200 },
  "60_NO_DEPOSIT_20000": { "rent": 374430, "lease": 253500 },
  "60_DEPOSIT_30_20000": { "rent": 334073, "lease": 223400 },
  "60_PREPAY_30_20000": { "rent": 261840, "lease": 132100 }
};

function updateCarMatrix(slug, prices) {
  const carIndex = content.indexOf(`"slug": "${slug}"`);
  if (carIndex === -1) {
    console.error(`Slug ${slug} not found`);
    return false;
  }
  
  // Find "priceMatrix": { from carIndex
  const matrixStartLabel = content.indexOf('"priceMatrix":', carIndex);
  if (matrixStartLabel === -1) {
    console.error(`priceMatrix not found for ${slug}`);
    return false;
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
    return false;
  }
  
  const formattedMatrix = JSON.stringify(prices, null, 2)
    .split('\n')
    .map((line, idx) => idx === 0 ? line : '      ' + line) // Indent properly
    .join('\n');

  content = content.substring(0, braceStart) + formattedMatrix + content.substring(braceEnd + 1);
  console.log(`Successfully updated matrix for ${slug}`);
  return true;
}

if (updateCarMatrix('hyundai-the-new-casper', basePrices) && 
    updateCarMatrix('hyundai-casper-electric', electricPrices)) {
  fs.writeFileSync(path, content, 'utf-8');
  console.log('Saved changes to ' + path);
} else {
  console.error('Update failed');
}
