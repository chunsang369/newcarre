const fs = require('fs');

async function apply() {
  console.log('🔄 Applying crawled data to car-data.ts...');
  
  if (!fs.existsSync('mega_crawled_data.json')) {
    console.error('❌ mega_crawled_data.json not found!');
    return;
  }
  
  const crawledData = JSON.parse(fs.readFileSync('mega_crawled_data.json', 'utf-8'));
  const carDataTsPath = './prisma/car-data.ts';
  let carDataContent = fs.readFileSync(carDataTsPath, 'utf-8');
  
  // Create a map for fast lookup
  const crawledMap = new Map();
  crawledData.forEach(car => {
    // Clean name for better matching
    const cleanName = car.modelName.replace(/\d{4}/, '').replace(/\(.*\)/, '').trim();
    crawledMap.set(cleanName, car);
  });
  
  // We need to parse popularCars from car-data.ts
  // Instead of complex parsing, we'll use a regex replacement strategy for each car entry
  
  // Extract the array content
  const arrayMatch = carDataContent.match(/export const popularCars: any\[\] = (\[[\s\S]*?\]);/);
  if (!arrayMatch) {
    console.error('❌ Could not find popularCars array in car-data.ts');
    return;
  }
  
  let carsArray;
  try {
    // This is risky because it's TS, but for simple objects it might work if we clean it
    const jsonLike = arrayMatch[1]
      .replace(/\/\/.*/g, '') // remove comments
      .replace(/,\s*\]/, ']') // trailing commas
      .replace(/([{,])\s*([a-zA-Z0-9_]+):/g, '$1"$2":'); // quote keys
    
    // Actually, let's just use string replacement on the whole file
    // To be safer, we'll iterate through the car entries in the string
  } catch(e) {}

  // Better approach: regex to find each car object block
  const carBlockRegex = /\{\s*"brandSlug":[\s\S]*?\}\s*(?=,|\s*\])/g;
  let updatedCount = 0;
  
  const updatedContent = carDataContent.replace(carBlockRegex, (block) => {
    try {
      const modelNameMatch = block.match(/"modelName":\s*"([^"]+)"/);
      if (!modelNameMatch) return block;
      
      const modelName = modelNameMatch[1];
      const cleanModelName = modelName.replace(/\d{4}/, '').replace(/\(.*\)/, '').trim();
      
      const match = crawledMap.get(cleanModelName) || crawledData.find(c => c.modelName.includes(cleanModelName));
      
      if (match) {
        updatedCount++;
        // Replace fields
        let newBlock = block;
        newBlock = newBlock.replace(/"basePrice":\s*0/, `"basePrice": ${match.basePrice}`);
        newBlock = newBlock.replace(/"category":\s*"[^"]*"/, `"category": "${match.category}"`);
        newBlock = newBlock.replace(/"fuelType":\s*"[^"]*"/, `"fuelType": "${match.fuelType}"`);
        
        // Add detailedConfig to options
        // Find options block
        const optionsMatch = newBlock.match(/"options":\s*\{([\s\S]*?)\}/);
        if (optionsMatch) {
          const optionsContent = optionsMatch[1];
          if (!optionsContent.includes('detailedConfig')) {
            const detailedConfigStr = JSON.stringify(match.detailedConfig, null, 2).replace(/\n/g, '\n    ');
            const updatedOptions = `"options": {${optionsContent},\n    "detailedConfig": ${detailedConfigStr}\n  }`;
            newBlock = newBlock.replace(/"options":\s*\{[\s\S]*?\}/, updatedOptions);
          }
        }
        
        return newBlock;
      }
    } catch (e) {
      console.error('Error processing block:', e);
    }
    return block;
  });
  
  fs.writeFileSync(carDataTsPath, updatedContent);
  console.log(`✅ Updated ${updatedCount} cars in car-data.ts`);
}

apply().catch(console.error);
