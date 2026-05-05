const fs = require('fs');
const content = fs.readFileSync('../prisma/car-data.ts', 'utf-8');

// Find what's NOT SEDAN or HATCHBACK
const entries = [...content.matchAll(/"category":\s*"([^"]+)"/g)];
const unique = [...new Set(entries.map(m => m[1]))];
console.log('Unique categories:', unique);

// Find examples of vehicles that should be SUV
// Let's look for SUV-type car names
const suvNames = ['팰리세이드', '싼타페', '투싼', '코나', '셀토스', '스포티지', 
  '쏘렌토', '베뉴', '넥쏘', 'EV6', 'EV9', 'GV70', 'GV80', 'GV60',
  '레인지로버', 'X3', 'X5', 'GLC', 'XC60', 'Q5', '카이엔', 'RAV4',
  '티볼리', '토레스', '코란도'];

suvNames.forEach(name => {
  const regex = new RegExp(`"modelName":\\s*"[^"]*${name}[^"]*"[\\s\\S]*?"category":\\s*"([^"]+)"`, 'g');
  const match = regex.exec(content);
  if (match) {
    console.log(`  ${name}: category="${match[1]}"`);
  }
});

// Check the detailedConfig in DB via Prisma (indirectly)
// Actually let's check what the options JSON looks like in car-data.ts
const optMatch = content.match(/"options":\s*(\{[\s\S]*?\})\s*,?\s*"priceMatrix"/);
if (optMatch) {
  console.log('\nSample options JSON:', optMatch[1].substring(0, 200));
}

// Let's check a Palisade entry for its options field
const palIdx = content.indexOf('팰리세이드');
if (palIdx > 0) {
  const snippet = content.substring(palIdx - 50, palIdx + 400);
  console.log('\nPalisade context:', snippet);
}
