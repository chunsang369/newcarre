const fs = require('fs');

async function clean() {
  const carDataTsPath = './prisma/car-data.ts';
  let content = fs.readFileSync(carDataTsPath, 'utf-8');
  
  // Fix the double lease/brace issue
  // The issue is that we have multiple nested braces and my regex might have matched only part of it
  // or duplicated it.
  
  // A safer way is to use a block-based approach
  const carBlockRegex = /\{\s*"brandSlug":[\s\S]*?\}\s*(?=,|\s*\])/g;
  
  // Let's first restore the file to a clean state if possible, or just fix each block
  const fixedContent = content.replace(carBlockRegex, (block) => {
    // Count opening and closing braces to ensure it's a valid object
    let open = 0;
    let closed = 0;
    let cleanedBlock = block;
    
    // If there are extra closing braces at the end, remove them
    // Or if there's a duplication, fix it.
    
    // Actually, I'll just re-extract the fields I want and reconstruct the block
    const modelName = block.match(/"modelName":\s*"([^"]+)"/)?.[1];
    const brandSlug = block.match(/"brandSlug":\s*"([^"]+)"/)?.[1];
    const slug = block.match(/"slug":\s*"([^"]+)"/)?.[1];
    const trimName = block.match(/"trimName":\s*"([^"]+)"/)?.[1] || "기본형";
    const year = block.match(/"year":\s*(\d+)/)?.[1] || 2025;
    const category = block.match(/"category":\s*"([^"]+)"/)?.[1] || "SEDAN";
    const fuelType = block.match(/"fuelType":\s*"([^"]+)"/)?.[1] || "GASOLINE";
    const basePrice = block.match(/"basePrice":\s*(\d+)/)?.[1] || 0;
    const isPopular = block.includes('"isPopular": true');
    const sortOrder = block.match(/"sortOrder":\s*(\d+)/)?.[1] || 999;
    const imageUrl = block.match(/"imageUrl":\s*"([^"]+)"/)?.[1] || "";
    
    // Extract priceMatrix part
    let matrixMatch = block.match(/"priceMatrix":\s*(\{[\s\S]*?\})\s*,\s*"isPopular"/);
    if (!matrixMatch) matrixMatch = block.match(/"priceMatrix":\s*(\{[\s\S]*?\})\s*,\s*"options"/);
    if (!matrixMatch) matrixMatch = block.match(/"priceMatrix":\s*(\{[\s\S]*?\})\s*,\s*"sortOrder"/);
    
    let matrixStr = matrixMatch ? matrixMatch[1] : '{}';
    
    // Clean matrixStr: if it has double lease, fix it
    if (matrixStr.split('"lease"').length > 2) {
      const leaseParts = matrixStr.split('"lease"');
      matrixStr = leaseParts[0] + '"lease"' + leaseParts[1] + '}';
    }

    return `{
    "brandSlug": "${brandSlug}",
    "slug": "${slug}",
    "modelName": "${modelName}",
    "trimName": "${trimName}",
    "year": ${year},
    "category": "${category}",
    "fuelType": "${fuelType}",
    "basePrice": ${basePrice},
    "priceMatrix": ${matrixStr},
    "isPopular": ${isPopular},
    "sortOrder": ${sortOrder},
    "imageUrl": "${imageUrl}"
  }`;
  });

  fs.writeFileSync(carDataTsPath, fixedContent);
  console.log('✅ Cleaned car-data.ts');
}

clean().catch(console.error);
