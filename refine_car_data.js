const fs = require('fs');

const SUV_KEYWORDS = [
  '팰리세이드', '싼타페', '투싼', '코나', '베뉴', '캐스퍼', '스포티지', '쏘렌토', '셀토스', '니로', '모하비', '넥쏘',
  'GV60', 'GV70', 'GV80', 'EV3', 'EV6', 'EV9', '아이오닉 5', '아이오닉 9', '코란도 이모션',
  '토레스', '티볼리', '코란도', '렉스턴', '액티언', '무쏘',
  'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'iX', 'iX1', 'iX3',
  'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class', 'G바겐', 'EQA', 'EQB', 'EQC', 'EQE SUV', 'EQS SUV', 
  'Q2', 'Q3', 'Q4', 'Q5', 'Q7', 'Q8', 'e-tron', 'Q4 e-tron',
  'XC40', 'XC60', 'XC90', 'C40', 'EX30', 'EX90', 
  'Cayenne', 'Macan', 'Levante', 'Grecale', 'DBX', 'Urus', 'Bentayga', 'Cullinan', 
  'Range Rover', 'Defender', 'Discovery', 'Sport', 'Evoque', 'Velar', 
  'Renegade', 'Compass', 'Cherokee', 'Wrangler', 'Gladiator', 
  'Explorer', 'Expedition', 'Bronco', 'Aviator', 'Navigator', 
  'Escalade', 'XT4', 'XT5', 'XT6', 'Lyriq', 
  '2008', '3008', '5008', 'Model Y', 'Model X'
];

const VAN_KEYWORDS = ['스타리아', '쏠라티', '카니발', '오딧세이', '시에나', 'V-Class', '스타렉스'];
const TRUCK_KEYWORDS = ['포터', '봉고', '콜로라도', '실버라도', '시에라', '칸', '스포츠'];
const HATCHBACK_KEYWORDS = ['모닝', '레이'];

function getCategory(name) {
  const upperName = name.toUpperCase();
  if (SUV_KEYWORDS.some(k => upperName.includes(k.toUpperCase()))) return 'SUV';
  if (VAN_KEYWORDS.some(k => upperName.includes(k.toUpperCase()))) return 'VAN';
  if (TRUCK_KEYWORDS.some(k => upperName.includes(k.toUpperCase()))) return 'TRUCK';
  if (HATCHBACK_KEYWORDS.some(k => upperName.includes(k.toUpperCase()))) return 'HATCHBACK';
  return 'SEDAN';
}

function parsePrice(str) {
  if (!str || str === '0원' || str === '') return 0;
  return parseInt(str.replace(/[^0-9]/g, '')) || 0;
}

async function refine() {
  console.log('🔄 Refining car data from local JSONs...');
  
  const matrixData = JSON.parse(fs.readFileSync('cars_final_full_matrix.json', 'utf-8'));
  const carDataTsPath = './prisma/car-data.ts';
  let carDataContent = fs.readFileSync(carDataTsPath, 'utf-8');
  
  const matrixMap = new Map();
  matrixData.forEach(car => matrixMap.set(car.name, car));
  
  const carBlockRegex = /\{\s*"brandSlug":[\s\S]*?\}\s*(?=,|\s*\])/g;
  let updatedCount = 0;
  
  const updatedContent = carDataContent.replace(carBlockRegex, (block) => {
    try {
      const modelNameMatch = block.match(/"modelName":\s*"([^"]+)"/);
      if (!modelNameMatch) return block;
      
      const modelName = modelNameMatch[1];
      const category = getCategory(modelName);
      
      let newBlock = block;
      newBlock = newBlock.replace(/"category":\s*"[^"]*"/, `"category": "${category}"`);
      
      const match = matrixMap.get(modelName);
      if (match && match.priceMatrix) {
        updatedCount++;
        // Update price matrix with numeric values
        const rentPrepay = parsePrice(match.priceMatrix.rent.prepay);
        const rentDeposit = parsePrice(match.priceMatrix.rent.deposit);
        const rentNone = parsePrice(match.priceMatrix.rent.none);
        const leasePrepay = parsePrice(match.priceMatrix.lease.prepay);
        const leaseDeposit = parsePrice(match.priceMatrix.lease.deposit);
        const leaseNone = parsePrice(match.priceMatrix.lease.none);

        const newMatrix = `"priceMatrix": {
      "rent": {
        "prepay": ${rentPrepay},
        "deposit": ${rentDeposit},
        "none": ${rentNone}
      },
      "lease": {
        "prepay": ${leasePrepay},
        "deposit": ${leaseDeposit},
        "none": ${leaseNone}
      }
    }`;
        newBlock = newBlock.replace(/"priceMatrix":\s*\{[\s\S]*?\}/, newMatrix);
        
        // Base Price Estimation: If we have monthly prices, let's set a reasonable basePrice if it's 0
        // Roughly monthly * 60 or something? No, let's just use 0 if we don't know.
        // Actually, for specific models, let's set hardcoded ones if possible.
      }
      
      return newBlock;
    } catch (e) {
      console.error('Error processing block:', e);
    }
    return block;
  });
  
  fs.writeFileSync(carDataTsPath, updatedContent);
  console.log(`✅ Refined ${updatedCount} cars in car-data.ts`);
}

refine().catch(console.error);
