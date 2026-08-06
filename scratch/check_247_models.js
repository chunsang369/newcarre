const fs = require('fs');

async function main() {
  const cleanList = JSON.parse(fs.readFileSync('scratch/chasalddae_list_clean.json', 'utf8'));
  console.log(`cleanList 수: ${cleanList.length}개`);

  // 모델명 중복 제거한 독자 차종 모델 그룹 집계
  const modelSet = new Set();
  cleanList.forEach(item => {
    modelSet.add(`${item.brand} ${item.modelName}`);
  });

  console.log(`차살때 순수 독자 모델/차종 수: ${modelSet.size}개`);
  console.log('샘플 모델 15개:', Array.from(modelSet).slice(0, 15));
}

main().catch(console.error);
