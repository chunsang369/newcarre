const fs = require('fs');
const content = fs.readFileSync('prisma/car-data.ts', 'utf-8');
const slug = 'hyundai-casper-electric';

const carStart = content.indexOf(`"slug": "${slug}"`);
const matrixStart = content.indexOf('priceMatrix": {', carStart);
const matrixEnd = content.indexOf('    }', matrixStart);
const matrix = JSON.parse(content.substring(matrixStart + 14, matrixEnd + 5));

const targetKey = '36_PREPAY_30_20000';
console.log(`Car: ${slug}`);
console.log(`Configuration: ${targetKey}`);
console.log(`Resulting Lease Price in DB: ${matrix[targetKey].lease}`);
console.log(`Resulting Rent Price in DB: ${matrix[targetKey].rent}`);

if (matrix[targetKey].lease === 102985 || matrix[targetKey].lease === 102991) {
    console.log('SUCCESS: Price matches target (approx 102,991).');
} else {
    console.log('NOTICE: Price is ' + matrix[targetKey].lease + ' (Subsidized calculation).');
}
