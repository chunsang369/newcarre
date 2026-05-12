const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\user\\Downloads\\자동차로고';
const destDir = 'c:\\Users\\user\\.gemini\\antigravity\\scratch\\hicarz-clone\\public\\images\\brands';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const mapping = {
  'BMW로고.png': 'bmw.png',
  '벤츠로고.png': 'mercedes-benz.png',
  '아우디로고.png': 'audi.png',
  '볼보 로고.svg': 'volvo.svg',
  '렉서스로고.svg': 'lexus.svg',
  '랜드로버 로고.png': 'land-rover.png',
  '미니로고.png': 'mini.png',
  '폭스바겐로고.svg': 'volkswagen.svg',
  '지프로고.png': 'jeep.png',
  '포드로고.png': 'ford.png',
  '테슬라로고.png': 'tesla.png',
  '푸조로고.png': 'peugeot.png',
  '로터스로고.png': 'lotus.png',
  '링컨로고.png': 'lincoln.png',
  'DS로고.png': 'ds.png',
  '폴스타.png': 'polestar.png',
  '재규어로고.png': 'jaguar.png',
  'BYD로고.png': 'byd.png',
  '도요타로고.svg': 'toyota.svg'
};

let copied = 0;
for (const [src, dest] of Object.entries(mapping)) {
  const srcPath = path.join(srcDir, src);
  const destPath = path.join(destDir, dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied: ${src} -> ${dest}`);
    copied++;
  }
}
console.log(`Total copied: ${copied}`);
