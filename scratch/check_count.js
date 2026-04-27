const fs = require('fs');
const html = fs.readFileSync('scratch/imported_all.json', 'utf8');
const count = html.split('<div class="list">').length - 1;
console.log('Total cars in file:', count);

const firstTitle = html.match(/<h2>검색결과 <span class="bold">(.*?)<\/span><\/h2>/);
if (firstTitle) {
    console.log('Site says count is:', firstTitle[1]);
}
