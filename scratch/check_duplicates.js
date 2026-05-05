const fs = require('fs');
const list = JSON.parse(fs.readFileSync('scratch/chasalddae_list_clean.json'));
const models = {};

list.forEach(c => {
    const name = `${c.brand} ${c.modelName}`;
    models[name] = (models[name] || 0) + 1;
});

const dups = Object.entries(models).filter(e => e[1] > 1).sort((a, b) => b[1] - a[1]);

console.log('전체 등록 차량 수:', list.length);
console.log('고유 모델명 수:', Object.keys(models).length);
console.log('\n--- 이름이 중복되어 등록된 차량 리스트 ---');
dups.forEach(d => {
    console.log(`- ${d[0]}: ${d[1]}건`);
});
